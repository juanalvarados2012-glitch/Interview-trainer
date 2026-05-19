export const config = { api: { bodyParser: { sizeLimit: "2mb" } } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GROQ_API_KEY not configured" });

  const { resumeText } = req.body;
  if (!resumeText || resumeText.length < 50) {
    return res.status(422).json({
      error:
        "Could not read this PDF. Try copying your resume text and pasting it in the Job Description field instead.",
    });
  }

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
            content: `You are a resume parser. Extract key information from the resume text provided.

RULES:
- targetRole: the candidate's current or most recent job title (e.g. "Bank Teller", "Marketing Manager"). Never invent a tech role unless the resume clearly describes tech work.
- skills: 5 concrete skills the candidate actually demonstrates in the text. Quote/paraphrase only what is there.
- summary: a 2-sentence factual summary of their actual industry, role, and years of experience based on the text.
- If the text is incoherent, looks like PDF metadata/binary garbage, or doesn't describe a real career, respond with: {"error":"unreadable"}

Respond ONLY with valid JSON, no extra text:
{"targetRole":"...","skills":["...","...","...","...","..."],"summary":"..."}`,
          },
          { role: "user", content: resumeText.slice(0, 6000) },
        ],
      }),
    });

    const data = await groqRes.json();
    const raw = data.choices?.[0]?.message?.content || "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Could not parse resume content");

    const parsed = JSON.parse(match[0]);
    if (parsed.error === "unreadable" || !parsed.targetRole) {
      return res.status(422).json({
        error: "Couldn't recognize a real career in this text. Please paste the actual text of your resume.",
      });
    }
    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: "Resume analysis failed: " + e.message });
  }
}
