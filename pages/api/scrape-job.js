export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL requerida" });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GROQ_API_KEY no configurada" });

  // Fetch the job page
  let html;
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw new Error(`El sitio respondió con error ${response.status}`);
    html = await response.text();
  } catch (e) {
    return res.status(422).json({ error: `No se pudo acceder al link: ${e.message}` });
  }

  // Strip HTML → plain text
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 9000);

  // Ask Groq to extract job info
  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 700,
        messages: [
          {
            role: "system",
            content: `Eres un extractor de ofertas de trabajo. Del texto de una página web, extrae la información de la oferta de empleo.
Responde ÚNICAMENTE con JSON válido sin texto extra:
{"role":"título exacto del puesto","company":"nombre de la empresa","description":"descripción detallada del puesto incluyendo responsabilidades, requisitos y habilidades buscadas, en 4-6 oraciones"}
Si no encuentras una oferta de trabajo real en el texto, responde: {"error":"No se encontró una oferta de trabajo en esta página"}`
          },
          { role: "user", content: text }
        ],
      }),
    });

    const data = await groqRes.json();
    const raw = data.choices?.[0]?.message?.content || "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No se pudo extraer la información");

    const parsed = JSON.parse(match[0]);
    if (parsed.error) return res.status(422).json({ error: parsed.error });

    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: "Error analizando la oferta: " + e.message });
  }
}
