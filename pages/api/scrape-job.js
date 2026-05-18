export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL requerida" });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GROQ_API_KEY no configurada" });

  /* ── 1. FETCH PAGE ── */
  let html;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 14000);
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Upgrade-Insecure-Requests": "1",
      },
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) throw new Error(`El sitio respondió con error ${response.status}`);
    html = await response.text();
  } catch (e) {
    if (e.name === "AbortError") {
      return res.status(422).json({ error: "El sitio tardó demasiado. Intenta copiar la descripción manualmente." });
    }
    return res.status(422).json({ error: `No se pudo acceder al link: ${e.message}` });
  }

  // Detect login walls (LinkedIn, Glassdoor, etc.)
  const loginWallSignals = [
    "authwall", "login", "sign-in", "signin",
    "session_redirect", "Please sign in", "Inicia sesión",
  ];
  const isLoginWall = loginWallSignals.some(s => html.toLowerCase().includes(s.toLowerCase()) && html.length < 50000);

  /* ── 2. STRATEGY A: JSON-LD structured data ── */
  // Most job boards (Indeed, Lever, Greenhouse, Workday, company sites) embed
  // schema.org/JobPosting in <script type="application/ld+json">
  let structured = null;
  const jsonLdBlocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];

  for (const block of jsonLdBlocks) {
    try {
      let parsed = JSON.parse(block[1].trim());
      // Handle @graph arrays (some sites wrap everything)
      if (parsed["@graph"]) {
        parsed = parsed["@graph"].find(n => n["@type"] === "JobPosting") || parsed;
      }
      if (Array.isArray(parsed)) {
        parsed = parsed.find(n => n["@type"] === "JobPosting");
      }
      if (parsed?.["@type"] === "JobPosting") {
        const rawDesc = parsed.description || parsed.responsibilities || "";
        structured = {
          role: parsed.title || parsed.name || null,
          company: parsed.hiringOrganization?.name || (typeof parsed.hiringOrganization === "string" ? parsed.hiringOrganization : null),
          description: rawDesc.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim().slice(0, 6000),
        };
        break;
      }
    } catch (_) {}
  }

  /* ── 3. STRATEGY B: Meta / OG tags ── */
  const metaTitle =
    html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || null;
  const metaDesc =
    html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1] || null;

  /* ── 4. BUILD AI INPUT ── */
  let aiInput;

  if (structured?.description && structured.description.length > 200) {
    // Rich structured data — give the AI clean info
    aiInput =
      `PUESTO: ${structured.role || "ver descripción"}\n` +
      `EMPRESA: ${structured.company || "ver descripción"}\n` +
      `DESCRIPCIÓN COMPLETA:\n${structured.description}`;
  } else {
    // Fall back to raw page text
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

    // Heuristic: grab the most job-relevant slice of text
    const jobKeywords = ["responsabilidades", "requisitos", "funciones", "responsibilities", "requirements", "qualifications", "we are looking", "buscamos", "ofrecemos"];
    let startIdx = 0;
    for (const kw of jobKeywords) {
      const idx = pageText.toLowerCase().indexOf(kw);
      if (idx > 0 && idx < pageText.length * 0.8) { startIdx = Math.max(0, idx - 200); break; }
    }

    aiInput = (metaTitle ? `TÍTULO: ${metaTitle}\n` : "") +
      (metaDesc ? `DESCRIPCIÓN META: ${metaDesc}\n\n` : "") +
      `TEXTO DE LA PÁGINA:\n${pageText.slice(startIdx, startIdx + 9000)}`;
  }

  /* ── 5. GROQ EXTRACTION ── */
  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 900,
        messages: [
          {
            role: "system",
            content: `Eres un extractor de ofertas de trabajo. Analiza el texto y extrae la información de la oferta de empleo.
Responde ÚNICAMENTE con JSON válido, sin texto extra ni markdown:
{"role":"título exacto del puesto","company":"nombre de la empresa","description":"descripción detallada con responsabilidades, requisitos y habilidades buscadas en 4-7 oraciones"}
Si la página es un muro de login o no contiene una oferta real, responde: {"error":"descripción del problema"}`,
          },
          { role: "user", content: aiInput + (isLoginWall ? "\n\n[NOTA: La página parece requerir login]" : "") },
        ],
      }),
    });

    const groqData = await groqRes.json();
    const raw = groqData.choices?.[0]?.message?.content || "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No se pudo analizar el contenido");

    const result = JSON.parse(match[0]);
    if (result.error) return res.status(422).json({ error: result.error });

    // Prefer structured data for role/company if AI missed them
    if (structured?.role && (!result.role || result.role.length < 3)) result.role = structured.role;
    if (structured?.company && (!result.company || result.company.length < 2)) result.company = structured.company;

    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ error: "Error extrayendo la oferta: " + e.message });
  }
}
