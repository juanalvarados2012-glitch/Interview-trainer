import { getAuth, createClerkClient } from "@clerk/nextjs/server";

export const config = { api: { responseLimit: false } };

const CLERK_ENABLED = !!process.env.CLERK_SECRET_KEY;
const PRO_DIFFICULTIES = new Set(["easy", "hard"]);
const FREE_MAX_QUESTIONS = 5;

async function getIsPaid(req) {
  if (!CLERK_ENABLED) return true;
  try {
    const { userId } = getAuth(req);
    if (!userId) return false;
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    const user = await clerk.users.getUser(userId);
    return user.publicMetadata?.paid === true;
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    res.setHeader("Content-Type", "text/event-stream");
    res.write(`data: ${JSON.stringify({ error: "GROQ_API_KEY not configured" })}\n\n`);
    return res.end();
  }

  const { system, messages, max_tokens, difficulty, numQ } = req.body;

  // Server-side Pro gating — check before setting streaming headers so we can return JSON 403
  const requiresPro =
    PRO_DIFFICULTIES.has(difficulty) ||
    (numQ !== undefined && parseInt(numQ, 10) > FREE_MAX_QUESTIONS);
  if (requiresPro) {
    const paid = await getIsPaid(req);
    if (!paid) {
      return res.status(403).json({ error: "pro_required" });
    }
  }

  // Input validation / truncation
  const safeSystem = typeof system === "string" ? system.slice(0, 8000) : "";
  const safeMessages = Array.isArray(messages)
    ? messages.slice(-20).map((m) => ({
        role: m.role,
        content: typeof m.content === "string" ? m.content.slice(0, 4000) : "",
      }))
    : [];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);

  try {
    const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: max_tokens || 400,
        stream: true,
        messages: [
          { role: "system", content: safeSystem },
          ...safeMessages,
        ],
      }),
    });

    clearTimeout(timer);

    if (!upstream.ok) {
      const err = await upstream.text();
      res.write(`data: ${JSON.stringify({ error: err })}\n\n`);
      return res.end();
    }

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
  } catch (e) {
    clearTimeout(timer);
    const msg =
      e.name === "AbortError"
        ? "Request timed out. Please try again."
        : e.message;
    res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
  }

  res.end();
}
