import fs from "fs";
import pdfParse from "pdf-parse";

export const config = { api: { bodyParser: { sizeLimit: "6mb" } } };

// Fallback: extract printable ASCII runs from raw PDF bytes
function extractRawText(buffer) {
  const raw = buffer.toString("latin1");
  const chunks = raw.match(/[\x20-\x7E\n\r\t]{4,}/g) || [];
  return chunks
    .filter(c => /[a-zA-Z]{3,}/.test(c))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 8000);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GROQ_API_KEY not configured" });

  const { fileBase64 } = req.body;
  if (!fileBase64) return res.status(400).json({ error: "No file data received" });

  let buffer;
  try {
    buffer = Buffer.from(fileBase64, "base64");
  } catch (e) {
    return res.status(400).json({ error: "Invalid file data" });
  }

  let text = "";
  try {
    const parsed = await pdfParse(buffer);
    text = parsed.text?.trim() || "";
  } catch (_) {
    // pdf-parse failed — use raw ASCII fallback
    text = extractRawText(buffer);
  }

  if (text.length < 50) {
    return res.status(422).json({
      error: "Could not read this PDF. Try copying your resume text and pasting it in the Job Description field instead.",
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
