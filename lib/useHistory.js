import { useState, useEffect } from "react";

const KEY = "interviewhub_history";

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
      const next = [entry, ...prev].slice(0, 20);
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
