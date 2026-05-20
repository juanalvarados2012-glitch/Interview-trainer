import { useState, useEffect } from "react";

const KEY = "interviewhub_history";

const dayKey = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`;
};

export function useHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch {}
  }, []);

  const addEntry = (entry) => {
    setHistory((prev) => {
      const next = [entry, ...prev].slice(0, 30);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const clearHistory = () => {
    try { localStorage.removeItem(KEY); } catch {}
    setHistory([]);
  };

  return { history, addEntry, clearHistory };
}

// Compute coaching insights from raw history.
// Returns null if there's nothing useful to show yet.
export function computeInsights(history) {
  if (!history || history.length === 0) return null;

  const recent = history.slice(0, 10);
  const avg = Math.round(recent.reduce((s, h) => s + (h.score || 0), 0) / recent.length);

  // Find most common weak area across recent interviews
  const counts = {};
  for (const h of recent) {
    for (const tag of h.weakAreas || []) {
      counts[tag] = (counts[tag] || 0) + 1;
    }
  }
  const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const topWeak = ranked[0]?.[0] || null;

  // Consecutive-day streak ending today/yesterday
  const days = new Set(history.map(h => dayKey(h.date)));
  let streak = 0;
  const cursor = new Date();
  // Allow starting yesterday so people who haven't practiced today yet still see a streak
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    avg,
    streak,
    totalInterviews: history.length,
    topWeak,
    lastRole: history[0]?.role || null,
    lastCompany: history[0]?.company || null,
  };
}

export const WEAK_AREAS = {
  behavioral_specifics: { label: "Concrete examples (STAR)", drill: "Tell me about a time you handled a difficult situation in a previous role. Use a specific story with details." },
  technical_depth: { label: "Technical depth", drill: "Walk me through a specific project you worked on, including the trade-offs you considered and the technical decisions you made." },
  communication_clarity: { label: "Clear, concise communication", drill: "In one minute, summarize your background and why you're a strong fit for this role." },
  structuring_answers: { label: "Structuring answers (STAR / clear arc)", drill: "Describe a challenge you faced. Structure your answer: situation, task, action, result." },
  energy_engagement: { label: "Energy and engagement", drill: "Why are you excited about this role and this company specifically? Be specific and energetic." },
  confidence: { label: "Confidence and ownership", drill: "Tell me about a time you led an initiative. Own the outcome — good or bad." },
  job_alignment: { label: "Aligning with the job", drill: "What about this specific role attracted you? Connect your background directly to what the company needs." },
  filler_words: { label: "Reducing filler words", drill: "Tell me about your most recent role. Pause briefly before answering and avoid 'um', 'like', 'you know'." },
};

