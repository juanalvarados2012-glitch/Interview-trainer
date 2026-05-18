import formidable from "formidable";
import fs from "fs";
import pdfParse from "pdf-parse";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GROQ_API_KEY not configured" });

  const form = formidable({ maxFileSize: 5 * 1024 * 1024 });
  let files;
  try {
    [, files] = await form.parse(req);
  } catch (e) {
    return res.status(400).json({ error: "Upload failed: " + e.message });
  }

  const file = files.resume?.[0];
  if (!file) return res.status(400).json({ error: "No file uploaded" });

  let text = "";
  try {
    const buffer = fs.readFileSync(file.filepath);
    const parsed = await pdfParse(buffer);
    text = parsed.text?.trim() || "";
  } catch (e) {
    return res.status(422).json({ error: "Could not read PDF: " + e.message });
  }

  if (text.length < 50) {
    return res.status(422).json({ error: "PDF appears empty or unreadable" });
  }

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 600,
        messages: [
          {
            role: "system",
            content: `You are a resume parser. Extract key information from this resume.
Respond ONLY with valid JSON, no extra text:
{"targetRole":"most recent or target job title","skills":["skill1","skill2","skill3","skill4","skill5"],"summary":"2-sentence professional summary of this person's background and experience"}`,
          },
          { role: "user", content: text.slice(0, 6000) },
        ],
      }),
    });

    const data = await groqRes.json();
    const raw = data.choices?.[0]?.message?.content || "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Could not parse resume content");

    return res.status(200).json(JSON.parse(match[0]));
  } catch (e) {
    return res.status(500).json({ error: "Resume analysis failed: " + e.message });
  }
}
