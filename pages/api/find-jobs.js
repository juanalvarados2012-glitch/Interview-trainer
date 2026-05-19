export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GROQ_API_KEY not configured" });

  const { role, skills, summary } = req.body;
  if (!role && !summary) return res.status(400).json({ error: "No resume data provided" });

  const input = [
    role ? `Current/target role: ${role}` : "",
    skills?.length ? `Skills: ${skills.join(", ")}` : "",
    summary ? `Background: ${summary}` : "",
  ].filter(Boolean).join("\n");

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 400,
        messages: [
          {
            role: "system",
            content: `You are a job search expert. Based on a candidate's profile, suggest the best job search terms.
Respond ONLY with valid JSON, no extra text:
{
  "titles": ["Best Job Title 1", "Best Job Title 2", "Best Job Title 3"],
  "keywords": "2-4 word search phrase that best captures this candidate's specialty"
}
Rules: titles should be real job titles that appear on LinkedIn/Indeed. Max 3 titles. Keep each title under 5 words.`,
          },
          { role: "user", content: input },
        ],
      }),
    });

    const data = await groqRes.json();
    const raw = data.choices?.[0]?.message?.content || "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Could not parse response");

    const { titles = [], keywords = role || "" } = JSON.parse(match[0]);
    const primary = titles[0] || role || keywords;

    const encode = (s) => encodeURIComponent(s);

    const platforms = [
      {
        name: "LinkedIn",
        icon: "in",
        color: "#0a66c2",
        bg: "#0a1628",
        border: "#0a3060",
        links: titles.slice(0, 2).map((t) => ({
          label: t,
          url: `https://www.linkedin.com/jobs/search/?keywords=${encode(t)}&f_TPR=r604800`,
        })),
      },
      {
        name: "Indeed",
        icon: "id",
        color: "#003a9b",
        bg: "#080a1a",
        border: "#0a1240",
        links: titles.slice(0, 2).map((t) => ({
          label: t,
          url: `https://www.indeed.com/jobs?q=${encode(t)}&sort=date`,
        })),
      },
      {
        name: "Glassdoor",
        icon: "gd",
        color: "#0caa41",
        bg: "#080f0a",
        border: "#0a2a14",
        links: [
          {
            label: primary,
            url: `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encode(primary)}&clickSource=searchBtn`,
          },
        ],
      },
      {
        name: "Remote OK",
        icon: "rm",
        color: "#6060cc",
        bg: "#0a0a1a",
        border: "#1a1a40",
        links: [
          {
            label: `Remote ${primary}`,
            url: `https://remoteok.com/remote-${keywords.toLowerCase().replace(/\s+/g, "-")}-jobs`,
          },
        ],
      },
      {
        name: "Wellfound",
        icon: "wf",
        color: "#f04e23",
        bg: "#1a0a06",
        border: "#3a1408",
        links: [
          {
            label: `${primary} at startups`,
            url: `https://wellfound.com/role/r/${keywords.toLowerCase().replace(/\s+/g, "-")}`,
          },
        ],
      },
      {
        name: "Y Combinator",
        icon: "yc",
        color: "#e8611a",
        bg: "#1a0d06",
        border: "#3a1a08",
        links: [
          {
            label: primary,
            url: `https://www.ycombinator.com/jobs?query=${encode(primary)}`,
          },
        ],
      },
    ];

    return res.status(200).json({ titles, keywords, platforms });
  } catch (e) {
    return res.status(500).json({ error: "Job search failed: " + e.message });
  }
}
