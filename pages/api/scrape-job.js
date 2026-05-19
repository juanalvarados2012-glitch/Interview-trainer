export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: "URL required" });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GROQ_API_KEY not configured" });

  let host = "";
  try { host = new URL(url).hostname.toLowerCase(); } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }

  const isLinkedIn = host.includes("linkedin.com");

  /* ── 1. FETCH PAGE ── */
  let html;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 14000);
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,es;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Upgrade-Insecure-Requests": "1",
      },
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) throw new Error(`Site responded with ${response.status}`);
    html = await response.text();
  } catch (e) {
    if (e.name === "AbortError") {
      return res.status(422).json({ error: "Site took too long to respond. Paste the job description manually below." });
    }
    if (isLinkedIn) {
      return res.status(422).json({
        error: "LinkedIn blocks our scraper. Open the job in LinkedIn, copy the description text, and paste it in the Job Description field below.",
      });
    }
    return res.status(422).json({ error: `Couldn't reach the link: ${e.message}` });
  }

  /* ── 2. EXTRACT WHAT WE CAN ── */
  const grabMeta = (re) => html.match(re)?.[1]?.trim() || null;
  const metaTitle =
    grabMeta(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
    grabMeta(/<title[^>]*>([^<]+)<\/title>/i);
  const metaDesc =
    grabMeta(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
    grabMeta(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);

  // JSON-LD JobPosting (Indeed, Greenhouse, Lever, Workday, most company career pages)
  let structured = null;
  const jsonLdBlocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const block of jsonLdBlocks) {
    try {
      let parsed = JSON.parse(block[1].trim());
      if (parsed["@graph"]) parsed = parsed["@graph"].find(n => n["@type"] === "JobPosting") || parsed;
      if (Array.isArray(parsed)) parsed = parsed.find(n => n["@type"] === "JobPosting");
      if (parsed?.["@type"] === "JobPosting") {
        const rawDesc = parsed.description || parsed.responsibilities || "";
        structured = {
          role: parsed.title || parsed.name || null,
          company: parsed.hiringOrganization?.name || (typeof parsed.hiringOrganization === "string" ? parsed.hiringOrganization : null),
          description: rawDesc.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim().slice(0, 6000),
        };
        break;
      }
    } catch {}
  }

  /* ── 3. LINKEDIN SPECIAL HANDLING ── */
  // LinkedIn typically serves a login wall but og:title contains "<Job> hiring <Role> in <Location>"
  // and og:description has a snippet. Description is usually too thin to be useful.
  if (isLinkedIn && !structured?.description) {
    // Try to parse "Company hiring Role in Location" pattern
    let role = null, company = null;
    const m = metaTitle?.match(/^(.+?)\s+hiring\s+(.+?)(?:\s+in\s+.+)?$/i);
    if (m) { company = m[1].trim(); role = m[2].trim(); }
    return res.status(200).json({
      role: role || "",
      company: company || "",
      description: "",
      partial: true,
      note: "LinkedIn doesn't let us read the full description. We pre-filled what we could — please paste the job description text in the field below.",
    });
  }

  /* ── 4. BUILD AI INPUT ── */
  let aiInput;
  if (structured?.description && structured.description.length > 200) {
    aiInput =
      `ROLE: ${structured.role || "see description"}\n` +
      `COMPANY: ${structured.company || "see description"}\n` +
      `FULL DESCRIPTION:\n${structured.description}`;
  } else {
    const pageText = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<header[\s\S]*?<\/header>/gi, " ")
      .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
      .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#\d+;/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const jobKeywords = ["responsibilities", "requirements", "qualifications", "we are looking", "about the role", "responsabilidades", "requisitos", "buscamos"];
    let startIdx = 0;
    for (const kw of jobKeywords) {
      const idx = pageText.toLowerCase().indexOf(kw);
      if (idx > 0 && idx < pageText.length * 0.8) { startIdx = Math.max(0, idx - 200); break; }
    }

    aiInput = (metaTitle ? `TITLE: ${metaTitle}\n` : "") +
      (metaDesc ? `META DESCRIPTION: ${metaDesc}\n\n` : "") +
      `PAGE TEXT:\n${pageText.slice(startIdx, startIdx + 9000)}`;

    if (pageText.length < 500) {
      return res.status(422).json({
        error: "Couldn't read enough content from this page. Paste the job description manually in the field below.",
      });
    }
  }

  /* ── 5. GROQ EXTRACTION ── */
  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 900,
        messages: [
          {
            role: "system",
            content: `You are a job posting extractor. Read the provided text and extract the job listing details.
Respond ONLY with valid JSON, no extra text or markdown:
{"role":"exact job title","company":"company name","description":"detailed description with responsibilities, requirements, and skills sought in 4-7 sentences"}
If the page is a login wall or doesn't contain a real job posting, respond: {"error":"short description of the problem"}`,
          },
          { role: "user", content: aiInput },
        ],
      }),
    });

    const groqData = await groqRes.json();
    const raw = groqData.choices?.[0]?.message?.content || "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Could not parse content");

    const result = JSON.parse(match[0]);
    if (result.error) {
      return res.status(422).json({
        error: result.error + " — paste the job description manually in the field below.",
      });
    }

    if (structured?.role && (!result.role || result.role.length < 3)) result.role = structured.role;
    if (structured?.company && (!result.company || result.company.length < 2)) result.company = structured.company;

    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ error: "Error extracting job posting: " + e.message });
  }
}
