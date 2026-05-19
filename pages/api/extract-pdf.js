export const config = {
  maxDuration: 30,
  api: { bodyParser: { sizeLimit: "8mb" } },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { resumePdfBase64 } = req.body || {};
  if (!resumePdfBase64) return res.status(400).json({ error: "No PDF data provided" });

  try {
    const { PDFParse } = await import("pdf-parse");
    const buffer = Buffer.from(resumePdfBase64, "base64");
    if (buffer.length > 6 * 1024 * 1024) {
      return res.status(413).json({ error: "PDF is too large — keep it under 6MB." });
    }
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    let text = "";
    try {
      const result = await parser.getText();
      text = (result.text || "").replace(/\s+/g, " ").trim().slice(0, 8000);
    } finally {
      try { await parser.destroy(); } catch {}
    }

    if (!text || text.length < 50) {
      return res.status(422).json({
        error:
          "Couldn't read text from this PDF — it may be image-only or scanned. Please paste your resume text instead.",
      });
    }

    return res.status(200).json({ resumeText: text });
  } catch (e) {
    return res.status(500).json({
      error: "Could not parse the PDF on the server. Please paste your resume text instead.",
    });
  }
}
