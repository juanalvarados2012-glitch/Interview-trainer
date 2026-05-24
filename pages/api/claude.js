export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GROQ_API_KEY no está configurada en el servidor." });
  }

  const { system, messages, max_tokens } = req.body;

  // Input validation / truncation
  const safeSystem = typeof system === "string" ? system.slice(0, 8000) : "";
  const safeMessages = Array.isArray(messages)
    ? messages.slice(-20).map((m) => ({
        role: m.role,
        content: typeof m.content === "string" ? m.content.slice(0, 4000) : "",
      }))
    : [];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: max_tokens || 1000,
        messages: [
          { role: "system", content: safeSystem },
          ...safeMessages,
        ],
      }),
    });

    clearTimeout(timer);

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    return res.status(200).json({ content: [{ text }] });
  } catch (e) {
    clearTimeout(timer);
    const msg =
      e.name === "AbortError" ? "Request timed out. Please try again." : e.message;
    return res.status(500).json({ error: msg });
  }
}
