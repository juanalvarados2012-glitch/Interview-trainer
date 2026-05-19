export const config = { maxDuration: 30 };

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
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 600,
        messages: [
          {
            role: "system",
            content: `You are a career advisor. Suggest the 5 best matching job titles for the candidate based STRICTLY on the profile below.

CRITICAL RULES:
- Stay in the SAME industry/function as the candidate's actual experience. If they work in banking/finance, suggest banking/finance roles. If healthcare, healthcare. If marketing, marketing. Never default to tech/software unless their profile is explicitly tech.
- Every suggestion must be directly justifiable by skills or experience in the profile. Do NOT invent skills they didn't mention.
- If the profile is too vague or doesn't clearly describe a real career, return {"jobs": []}.
- Titles must be real job titles that appear on LinkedIn. Keep each title under 6 words.
- Reason must quote or paraphrase a specific skill or experience from their profile.

Respond ONLY with valid JSON, no extra text:
{"jobs":[{"title":"...","reason":"..."},{"title":"...","reason":"..."},{"title":"...","reason":"..."},{"title":"...","reason":"..."},{"title":"...","reason":"..."}]}`,
          },
          { role: "user", content: input },
        ],
      }),
    });

    const data = await groqRes.json();
    const raw = data.choices?.[0]?.message?.content || "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Could not parse response");

    const { jobs = [] } = JSON.parse(match[0]);
    const encode = (s) => encodeURIComponent(s);

    return res.status(200).json({
      jobs: jobs.slice(0, 5).map(j => ({
        title: j.title,
        reason: j.reason,
        link: `https://www.linkedin.com/jobs/search/?keywords=${encode(j.title)}&f_TPR=r604800`,
      })),
    });
  } catch (e) {
    return res.status(500).json({ error: "Job search failed: " + e.message });
  }
}
