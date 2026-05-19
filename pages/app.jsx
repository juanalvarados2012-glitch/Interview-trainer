import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useHistory } from "../lib/useHistory";

/* ── STYLES ─────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body,#root{font-family:'Syne',sans-serif;background:#07080f;color:#eeeeff;min-height:100vh}
  .shell{max-width:720px;margin:0 auto;padding:36px 20px 80px}
  .hd{margin-bottom:32px}
  .hd-tag{font-family:'DM Mono',monospace;font-size:.72rem;color:#4040a0;letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px}
  .hd-title{font-size:2rem;font-weight:800;letter-spacing:-.03em;line-height:1.1;background:linear-gradient(135deg,#eeeeff,#6060cc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .hd-sub{font-size:.82rem;color:#444;margin-top:6px;font-family:'DM Mono',monospace}
  .steps{display:flex;margin-bottom:28px;background:#0d0d1a;border:1px solid #1a1a30;border-radius:14px;overflow:hidden}
  .step-btn{flex:1;padding:14px 8px;border:none;background:transparent;font-family:'Syne',sans-serif;font-size:.78rem;font-weight:600;color:#333;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;border-right:1px solid #1a1a30;transition:all .2s}
  .step-btn:last-child{border-right:none}
  .step-btn.done{color:#4ecc96}
  .step-btn.active{background:#12122a;color:#fff}
  .step-num{width:22px;height:22px;border-radius:50%;background:#1a1a30;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700}
  .step-btn.active .step-num{background:#3030b0}
  .step-btn.done .step-num{background:#1a3a2a;color:#4ecc96}
  .card{background:#0d0d1a;border:1px solid #1a1a30;border-radius:20px;padding:28px;animation:fadeUp .3s ease}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .card-title{font-size:1.15rem;font-weight:800;letter-spacing:-.02em;margin-bottom:6px}
  .card-desc{font-size:.78rem;color:#555;font-family:'DM Mono',monospace;margin-bottom:20px;line-height:1.5}
  label{display:block;font-size:.72rem;font-weight:700;color:#555;letter-spacing:.06em;text-transform:uppercase;margin-bottom:6px}
  textarea,input,select{width:100%;background:#080812;border:1px solid #1a1a30;border-radius:10px;padding:10px 12px;color:#eeeeff;font-family:'DM Mono',monospace;font-size:.85rem;resize:vertical;outline:none;transition:border-color .2s}
  textarea:focus,input:focus,select:focus{border-color:#3030a0}
  select option{background:#0d0d1a}
  .field{margin-bottom:16px}
  .row{display:flex;gap:12px}
  .row .field{flex:1}
  .btn{width:100%;padding:13px;border-radius:10px;border:none;background:linear-gradient(135deg,#2020a0,#4040cc);color:#fff;font-family:'Syne',sans-serif;font-size:.9rem;font-weight:700;cursor:pointer;transition:all .2s;letter-spacing:.01em}
  .btn:hover:not(:disabled){opacity:.85;transform:translateY(-1px)}
  .btn:disabled{opacity:.35;cursor:not-allowed;transform:none}
  .btn-ghost{width:100%;padding:11px;border-radius:10px;border:1px solid #1a1a30;background:transparent;color:#666;font-family:'Syne',sans-serif;font-size:.85rem;font-weight:600;cursor:pointer;transition:all .2s;margin-top:10px}
  .btn-ghost:hover{border-color:#3030a0;color:#aaa}
  .loader{display:flex;gap:6px;align-items:center;padding:14px 0;color:#444;font-family:'DM Mono',monospace;font-size:.78rem}
  .dot{width:6px;height:6px;background:#4040c0;border-radius:50%;animation:bounce 1.2s infinite}
  .dot:nth-child(2){animation-delay:.2s}
  .dot:nth-child(3){animation-delay:.4s}
  @keyframes bounce{0%,80%,100%{transform:translateY(0);opacity:.3}40%{transform:translateY(-6px);opacity:1}}
  .job-chip{background:#0a0a1f;border:1px solid #1a1a35;border-radius:12px;padding:12px 14px;display:flex;align-items:center;gap:12px;margin-bottom:18px}
  .job-icon{font-size:1.6rem;line-height:1}
  .job-company{font-size:.7rem;font-family:'DM Mono',monospace;color:#4040a0;text-transform:uppercase;letter-spacing:.08em}
  .job-role{font-size:.95rem;font-weight:700}
  .badge{display:inline-flex;background:#0d0d22;border:1px solid #1a1a35;border-radius:8px;padding:4px 10px;font-family:'DM Mono',monospace;font-size:.72rem;color:#555;cursor:pointer;margin:3px;transition:all .2s}
  .badge:hover{background:#12122a;color:#9090ff}
  .summary-bar{display:flex;align-items:center;gap:12px;background:#080812;border:1px solid #1a1a30;border-radius:12px;padding:14px 18px;margin-bottom:20px}
  .summary-ring{width:56px;height:56px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:800}
  .summary-ring.great{background:#0a2a1a;color:#4ecc96;border:2px solid #4ecc9640}
  .summary-ring.ok{background:#2a2000;color:#f0c060;border:2px solid #f0c06040}
  .summary-ring.low{background:#2a0a0a;color:#f06060;border:2px solid #f0606040}
  .summary-label{font-size:.72rem;font-family:'DM Mono',monospace;color:#444;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px}
  .summary-val{font-size:1rem;font-weight:700}
  .fb{background:#080812;border:1px solid #1a1a30;border-radius:12px;overflow:hidden;margin-bottom:12px}
  .fb-head{padding:10px 14px;background:#0d0d20;font-size:.72rem;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:.06em}
  .fb-body{padding:14px;font-family:'DM Mono',monospace;font-size:.8rem;line-height:1.6;color:#888}
  .li{display:flex;gap:8px;margin-bottom:6px;font-family:'DM Mono',monospace;font-size:.8rem;line-height:1.5}
  .li-dot{flex-shrink:0;margin-top:2px}
  .tip-box{background:#080812;border:1px solid #1a1a30;border-left:3px solid #3030a0;border-radius:8px;padding:10px 14px;font-family:'DM Mono',monospace;font-size:.78rem;color:#555;margin-bottom:16px;line-height:1.5}
  .err-box{background:#1a0808;border:1px solid #3a1010;border-radius:10px;padding:12px 14px;font-family:'DM Mono',monospace;font-size:.78rem;color:#cc6060;margin-top:12px;line-height:1.5}
  .url-bar{display:flex;gap:8px;margin-bottom:20px}
  .url-input{flex:1;background:#080812;border:1px solid #1a1a30;border-radius:10px;padding:10px 12px;color:#eeeeff;font-family:'DM Mono',monospace;font-size:.82rem;outline:none;transition:border-color .2s}
  .url-input:focus{border-color:#3030a0}
  .url-btn{flex-shrink:0;padding:10px 16px;border-radius:10px;border:none;background:#12122a;border:1px solid #2a2a50;color:#8080cc;font-family:'Syne',sans-serif;font-size:.8rem;font-weight:700;cursor:pointer;transition:all .2s;white-space:nowrap}
  .url-btn:hover:not(:disabled){background:#1a1a40;color:#aaaaff}
  .url-btn:disabled{opacity:.4;cursor:not-allowed}
  .url-divider{display:flex;align-items:center;gap:10px;margin-bottom:20px}
  .url-divider-line{flex:1;height:1px;background:#1a1a30}
  .url-divider-text{font-family:'DM Mono',monospace;font-size:.68rem;color:#333;text-transform:uppercase;letter-spacing:.08em}
  .diff-row{display:flex;gap:8px;margin-bottom:20px}
  .diff-pill{flex:1;padding:12px 8px;border-radius:12px;border:1px solid #1a1a30;background:transparent;font-family:'Syne',sans-serif;font-size:.78rem;font-weight:700;cursor:pointer;transition:all .2s;text-align:center}
  .diff-pill:hover:not(.active){border-color:#2a2a50}
  .diff-pill.easy{color:#4ecc96}.diff-pill.easy.active{background:#0a1a12;border-color:#4ecc9660}
  .diff-pill.medium{color:#f0c060}.diff-pill.medium.active{background:#1a1400;border-color:#f0c06060}
  .diff-pill.hard{color:#f06060}.diff-pill.hard.active{background:#1a0808;border-color:#f0606060}
  .diff-sub{font-size:.62rem;font-weight:400;opacity:.7;margin-top:2px}
  .diff-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-family:'DM Mono',monospace;font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em}
  .diff-badge.easy{background:#0a1a12;color:#4ecc96;border:1px solid #4ecc9640}
  .diff-badge.medium{background:#1a1400;color:#f0c060;border:1px solid #f0c06040}
  .diff-badge.hard{background:#1a0808;color:#f06060;border:1px solid #f0606040}
  /* ── INTERVIEWER CARD ── */
  .iv-card{background:#080812;border:1px solid #1a1a30;border-radius:18px;padding:18px 20px;margin-bottom:14px;display:flex;align-items:center;gap:16px}
  .iv-avatar-wrap{position:relative;flex-shrink:0}
  .iv-avatar{width:58px;height:58px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.2rem;font-weight:800;color:#fff;letter-spacing:-.02em}
  .iv-avatar.easy{background:linear-gradient(135deg,#1a4a2a,#2a6a3a)}
  .iv-avatar.medium{background:linear-gradient(135deg,#1a1a50,#3030a0)}
  .iv-avatar.hard{background:linear-gradient(135deg,#4a1010,#8a2020)}
  .iv-ring{position:absolute;inset:-4px;border-radius:50%;border:2px solid transparent;opacity:0}
  .iv-ring.easy{border-color:#4ecc96}
  .iv-ring.medium{border-color:#6060cc}
  .iv-ring.hard{border-color:#f06060}
  .iv-ring.speaking{opacity:1;animation:ivSpeak 1.4s ease-in-out infinite}
  @keyframes ivSpeak{0%,100%{transform:scale(1);opacity:.4}50%{transform:scale(1.06);opacity:1}}
  .iv-info{flex:1}
  .iv-name{font-size:1rem;font-weight:800;letter-spacing:-.02em;margin-bottom:2px}
  .iv-title{font-size:.72rem;color:#444;font-family:'DM Mono',monospace}
  .iv-status{display:flex;align-items:center;gap:6px;margin-top:6px}
  .iv-dot{width:6px;height:6px;border-radius:50%;background:#4ecc96;animation:ivPulse 2s infinite}
  @keyframes ivPulse{0%,100%{opacity:1}50%{opacity:.3}}
  .iv-live{font-family:'DM Mono',monospace;font-size:.65rem;color:#4ecc96;text-transform:uppercase;letter-spacing:.08em}
  .iv-typing{font-family:'DM Mono',monospace;font-size:.65rem;color:#555;margin-left:4px}
  /* ── CHAT ── */
  .chat-area{height:340px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;padding:4px 0 8px;scroll-behavior:smooth}
  .chat-area::-webkit-scrollbar{width:3px}
  .chat-area::-webkit-scrollbar-track{background:transparent}
  .chat-area::-webkit-scrollbar-thumb{background:#2a2a50;border-radius:2px}
  .msg{display:flex;gap:8px;animation:fadeUp .25s ease}
  .msg-ai{flex-direction:row}
  .msg-user{flex-direction:row-reverse}
  .bubble{max-width:85%;padding:10px 14px;border-radius:14px;font-family:'DM Mono',monospace;font-size:.82rem;line-height:1.55}
  .bubble-ai{background:#0d0d20;border:1px solid #1a1a35;border-top-left-radius:4px;color:#ccc}
  .bubble-user{background:#20208a;border:1px solid #3030b0;border-top-right-radius:4px;color:#eeeeff}
  .cursor{display:inline-block;width:2px;height:14px;background:#6060cc;margin-left:2px;animation:blink .7s infinite;vertical-align:middle}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
  .coach-tip{max-width:85%;margin-left:auto;margin-top:-4px;margin-bottom:2px;background:#0a0a1a;border:1px solid #2a2050;border-radius:10px;padding:7px 12px;font-family:'DM Mono',monospace;font-size:.72rem;color:#7060aa;line-height:1.5;animation:fadeUp .3s ease}
  .coach-tip-label{font-size:.62rem;color:#4030a0;text-transform:uppercase;letter-spacing:.08em;margin-bottom:3px}
  .coach-tip-loading{color:#3030a0;font-size:.68rem;font-family:'DM Mono',monospace;text-align:right;padding:2px 0}
  .chat-input-bar{display:flex;gap:8px;align-items:center;margin-top:12px}
  .chat-input{flex:1;background:#080812;border:1px solid #1a1a30;border-radius:10px;padding:10px 12px;color:#eeeeff;font-family:'DM Mono',monospace;font-size:.82rem;outline:none;transition:border-color .2s}
  .chat-input:focus{border-color:#3030a0}
  .send-btn{width:40px;height:40px;border-radius:10px;border:none;background:#2020a0;color:#fff;font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s}
  .send-btn:hover:not(:disabled){background:#3030c0}
  .send-btn:disabled{opacity:.35;cursor:not-allowed}
  .mic-sm{width:40px;height:40px;border-radius:10px;border:none;background:#12122a;color:#6060cc;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s}
  .mic-sm.rec{background:#1a0a30;color:#c060ff;animation:pulseMic 1s infinite}
  .mic-sm:hover:not(.rec){background:#1a1a3a;color:#8080ff}
  @keyframes pulseMic{0%,100%{box-shadow:0 0 0 0 rgba(180,80,255,.5)}50%{box-shadow:0 0 0 12px rgba(180,80,255,0)}}
  .end-btn{width:100%;padding:9px;border-radius:10px;border:1px solid #2a1a1a;background:transparent;color:#664444;font-family:'Syne',sans-serif;font-size:.78rem;cursor:pointer;transition:all .2s;margin-top:10px}
  .end-btn:hover{border-color:#3a1a1a;color:#cc6060}
  /* ── RESUME UPLOAD ── */
  .resume-drop{border:1.5px dashed #1a1a35;border-radius:12px;padding:16px 18px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:all .2s;margin-bottom:18px;background:#080812}
  .resume-drop:hover{border-color:#3030a0;background:#0a0a1f}
  .resume-drop.has-file{border-color:#4ecc9650;background:#051510}
  .resume-drop input[type=file]{display:none}
  .resume-icon{font-size:1.4rem;flex-shrink:0}
  .resume-text{flex:1;font-family:'DM Mono',monospace;font-size:.78rem;color:#444;line-height:1.4}
  .resume-text strong{color:#eeeeff;display:block;margin-bottom:2px;font-size:.8rem}
  .resume-clear{background:none;border:none;color:#444;cursor:pointer;font-size:.9rem;padding:4px;border-radius:6px;transition:color .2s}
  .resume-clear:hover{color:#cc6060}
  /* ── HISTORY ── */
  .hist-panel{margin-top:32px}
  .hist-title{font-family:'DM Mono',monospace;font-size:.68rem;color:#333;text-transform:uppercase;letter-spacing:.1em;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center}
  .hist-clear{background:none;border:none;color:#333;font-family:'DM Mono',monospace;font-size:.65rem;cursor:pointer;padding:2px 6px;border-radius:4px;transition:color .2s}
  .hist-clear:hover{color:#cc6060}
  .hist-list{display:flex;flex-direction:column;gap:8px}
  .hist-item{background:#0a0a18;border:1px solid #151525;border-radius:10px;padding:10px 14px;display:flex;align-items:center;gap:12px}
  .hist-score{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.82rem;font-weight:800;flex-shrink:0}
  .hist-score.great{background:#0a2a1a;color:#4ecc96;border:1.5px solid #4ecc9640}
  .hist-score.ok{background:#2a2000;color:#f0c060;border:1.5px solid #f0c06040}
  .hist-score.low{background:#2a0a0a;color:#f06060;border:1.5px solid #f0606040}
  .hist-info{flex:1;min-width:0}
  .hist-role{font-size:.82rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .hist-meta{font-family:'DM Mono',monospace;font-size:.68rem;color:#444;margin-top:2px}
  /* ── JOB MATCHES ── */
  .jobs-panel{background:#080812;border:1px solid #1a1a30;border-radius:16px;padding:18px;margin-bottom:18px;animation:fadeUp .3s ease}
  .jobs-title{font-size:.82rem;font-weight:700}
  .jobs-sub{font-family:'DM Mono',monospace;font-size:.68rem;color:#444;margin-top:2px;margin-bottom:14px}
  .jobs-list{display:flex;flex-direction:column;gap:8px}
  .job-card{background:#0a0a18;border:1px solid #141428;border-radius:12px;padding:12px 14px;display:flex;align-items:center;gap:12px}
  .job-card-num{width:26px;height:26px;border-radius:50%;background:#0d0d22;border:1px solid #1a1a40;display:flex;align-items:center;justify-content:center;font-family:'DM Mono',monospace;font-size:.68rem;color:#4040a0;flex-shrink:0;font-weight:700}
  .job-card-info{flex:1;min-width:0}
  .job-card-title{font-size:.88rem;font-weight:700;margin-bottom:3px}
  .job-card-reason{font-family:'DM Mono',monospace;font-size:.7rem;color:#555;line-height:1.4}
  .job-card-actions{display:flex;gap:6px;flex-shrink:0;flex-wrap:wrap;justify-content:flex-end}
  .job-card-link{display:inline-flex;align-items:center;padding:6px 10px;border-radius:8px;font-family:'DM Mono',monospace;font-size:.7rem;color:#4040a0;background:#0a0a1f;border:1px solid #1a1a40;text-decoration:none;transition:all .2s;white-space:nowrap}
  .job-card-link:hover{border-color:#3030a0;color:#8080ff}
  .job-card-practice{display:inline-flex;align-items:center;padding:6px 10px;border-radius:8px;font-family:'DM Mono',monospace;font-size:.7rem;color:#4ecc96;background:#051510;border:1px solid #4ecc9630;cursor:pointer;transition:all .2s;white-space:nowrap}
  .job-card-practice:hover{border-color:#4ecc9660;background:#0a2a18}
  .jobs-loading{font-family:'DM Mono',monospace;font-size:.72rem;color:#333;display:flex;align-items:center;gap:8px}
  /* ── BACK LINK ── */
  .back-link{display:inline-flex;align-items:center;gap:6px;font-family:'DM Mono',monospace;font-size:.72rem;color:#333;text-decoration:none;margin-bottom:24px;transition:color .2s}
  .back-link:hover{color:#6060cc}
`;

/* ── API ─────────────────────────────────────────────────────── */
async function callAIStream(system, messages, maxTokens = 400, onChunk) {
  const res = await fetch("/api/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, messages, max_tokens: maxTokens }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let accumulated = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") continue;
      try {
        const parsed = JSON.parse(data);
        if (parsed.error) throw new Error(parsed.error);
        const delta = parsed.choices?.[0]?.delta?.content || "";
        if (delta) { accumulated += delta; onChunk(accumulated); }
      } catch (e) { if (e.message !== "Unexpected end of JSON input") throw e; }
    }
  }
  return accumulated;
}

async function callAI(system, messages, maxTokens = 400) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: maxTokens,
      system,
      messages,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

/* ── TTS ─────────────────────────────────────────────────────── */
function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const voicesRef = useRef([]);

  // Cache voices as soon as they're available
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const load = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) voicesRef.current = v;
    };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  // Call this SYNCHRONOUSLY inside a click handler before any async work.
  // It speaks an empty utterance then immediately cancels it, which "unlocks"
  // the speech synthesis context so later async speak() calls are allowed by Chrome.
  const unlock = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const dummy = new SpeechSynthesisUtterance("");
    window.speechSynthesis.speak(dummy);
    window.speechSynthesis.cancel();
  }, []);

  const speak = useCallback((text) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const go = () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume(); // unfreeze Chrome pause bug
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "en-US";
      utt.rate = 0.9;
      const voices = voicesRef.current.length > 0
        ? voicesRef.current
        : window.speechSynthesis.getVoices();
      const enVoice = voices.find(v => v.lang === "en-US" && v.name.includes("Google"))
        || voices.find(v => v.lang === "en-US")
        || voices.find(v => v.lang.startsWith("en"));
      if (enVoice) utt.voice = enVoice;
      utt.onstart = () => setSpeaking(true);
      utt.onend = () => setSpeaking(false);
      utt.onerror = () => setSpeaking(false);
      // Small delay gives Chrome time to settle after cancel()
      setTimeout(() => window.speechSynthesis.speak(utt), 80);
    };

    if (voicesRef.current.length > 0) {
      go();
    } else {
      let done = false;
      const runOnce = () => { if (done) return; done = true; go(); };
      const onChanged = () => {
        window.speechSynthesis.removeEventListener("voiceschanged", onChanged);
        runOnce();
      };
      window.speechSynthesis.addEventListener("voiceschanged", onChanged);
      setTimeout(runOnce, 600);
    }
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  return { speak, stop, speaking, unlock };
}

/* ── STT ─────────────────────────────────────────────────────── */
function useSTT() {
  const [recording, setRecording] = useState(false);
  const [supported, setSupported] = useState(false);
  const recRef = useRef(null);
  const cbRef = useRef(null);
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(!!SR);
    if (!SR) return;
    const rec = new SR();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + " ";
      }
      if (final && cbRef.current) cbRef.current(final);
    };
    rec.onend = () => setRecording(false);
    rec.onerror = () => setRecording(false);
    recRef.current = rec;
  }, []);
  const startRec = useCallback((onChunk) => {
    cbRef.current = onChunk;
    try { recRef.current?.start(); setRecording(true); } catch (e) { console.warn(e); }
  }, []);
  const stopRec = useCallback(() => {
    try { recRef.current?.stop(); } catch (e) { console.warn(e); }
    setRecording(false);
  }, []);
  return { recording, supported, startRec, stopRec };
}

/* ── CONSTANTS ───────────────────────────────────────────────── */
const EXAMPLES = [
  { role: "UX/UI Designer", company: "Tech Startup", jd: "We are looking for a UX/UI Designer with experience in Figma, user research, rapid prototyping, and agile team collaboration. Systems thinking and a passion for usability are highly valued." },
  { role: "Executive Assistant", company: "Consulting Firm", jd: "Executive assistant responsible for calendar management, meeting coordination, document handling, internal client support, and assistance to senior leadership." },
  { role: "Marketing Manager", company: "Digital Agency", jd: "Marketing manager with experience in social media strategy, content creation, metrics analysis, community management, and digital campaigns for consumer brands." },
];

const SC = n => n >= 80 ? "great" : n >= 60 ? "ok" : "low";

/* ── APP ─────────────────────────────────────────────────────── */
export default function App() {
  const [phase, setPhase] = useState("setup");
  const { history, addEntry, clearHistory } = useHistory();

  // Setup
  const [jobRole, setJobRole] = useState("");
  const [company, setCompany] = useState("");
  const [jdText, setJdText] = useState("");
  const [numQ, setNumQ] = useState("5");
  const [difficulty, setDifficulty] = useState("medium");
  const [startLoading, setStartLoading] = useState(false);
  const [startErr, setStartErr] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapeErr, setScrapeErr] = useState("");

  // Resume upload
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeParsing, setResumeParsing] = useState(false);
  const [jobMatches, setJobMatches] = useState(null);
  const [resumeErr, setResumeErr] = useState("");
  const resumeInputRef = useRef(null);

  // Interview
  const [apiMessages, setApiMessages] = useState([]);
  const [displayMessages, setDisplayMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [aiThinking, setAiThinking] = useState(false);
  const [interviewErr, setInterviewErr] = useState("");
  const [tips, setTips] = useState({});
  const [loadingTips, setLoadingTips] = useState({});

  // Results
  const [evaluation, setEvaluation] = useState(null);
  const [evalLoading, setEvalLoading] = useState(false);

  const chatEndRef = useRef(null);
  const { speak, stop, speaking, unlock } = useTTS();
  const { recording, supported: micOk, startRec, stopRec } = useSTT();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages, aiThinking]);

  const DIFFICULTY_CONFIG = {
    easy: {
      name: "Sam Rivera",
      title: "HR Coordinator",
      label: "Easy",
      emoji: "🟢",
      persona: `You are Sam Rivera, a friendly HR Coordinator at ${company || "the company"}. You genuinely want to help candidates succeed and feel comfortable.
YOUR STYLE: Warm, encouraging, patient. You give positive reinforcement often. You accept answers that show general relevant experience even without perfect specifics. You ask gentle follow-ups like "That's interesting — could you tell me a bit more about that?" You rarely push back hard; if an answer is weak, you give a hint: "Maybe think of a specific time when..." You celebrate good answers enthusiastically.`,
    },
    medium: {
      name: "Jordan Mills",
      title: "Senior Talent Acquisition Manager",
      label: "Standard",
      emoji: "🟡",
      persona: `You are Jordan Mills, a Senior Talent Acquisition Manager at ${company || "the company"}. Professional and fair.
YOUR STYLE: Balanced and professional. You acknowledge strong answers genuinely. You probe decent answers once for specifics. You don't accept vague non-answers but you're not harsh about it. You feel like a real workplace interview.`,
    },
    hard: {
      name: "Morgan Price",
      title: "VP of Talent & Strategy",
      label: "Hard",
      emoji: "🔴",
      persona: `You are Morgan Price, VP of Talent & Strategy at ${company || "the company"}. You only hire the top 5% and your interviews are known to be tough.
YOUR STYLE: Direct, skeptical, demanding. You challenge almost every answer — even good ones — to test how candidates handle pressure. You ask for specific metrics, numbers, and outcomes. If they can't give you data, you push: "What was the actual impact? What were the numbers?" You frequently ask "Why?" and "So what?" after answers. You're not mean but you're relentless. Weak answers get responses like "I've heard that before — give me something specific that sets you apart."`,
    },
  };

  const buildSystem = useCallback(() => {
    const cfg = DIFFICULTY_CONFIG[difficulty];
    return `${cfg.persona}

Job description for ${jobRole}: ${jdText}

INTERVIEW RULES (follow strictly):
- When you receive [START]: introduce yourself as ${cfg.name}, ${cfg.title}, mention the role, and ask your first question tailored to the job description.
- Ask exactly ${numQ} main questions, each specific to the actual job description above.
- React to answers according to your personality style above.
- Max 2 follow-up questions per main question before moving on.
- Keep your turns SHORT: 1-3 sentences. This is a conversation.
- Vary how you start each response — don't repeat the same opener.
- When all ${numQ} main questions are answered: close the interview naturally (thank them, mention next steps) then append exactly "|||END|||" at the very end.`;
  }, [jobRole, company, jdText, numQ, difficulty]);

  /* ── SCRAPE JOB URL ── */
  const scrapeJob = async () => {
    if (!jobUrl.trim()) return;
    setScraping(true);
    setScrapeErr("");
    try {
      const res = await fetch("/api/scrape-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jobUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      if (data.role) setJobRole(data.role);
      if (data.company) setCompany(data.company);
      if (data.description) setJdText(data.description);
    } catch (e) {
      setScrapeErr(e.message);
    }
    setScraping(false);
  };

  /* ── START INTERVIEW ── */
  const startInterview = async () => {
    unlock(); // prime synthesis context synchronously before async work
    setStartLoading(true);
    setStartErr("");
    setTips({}); setLoadingTips({});
    const trigger = [{ role: "user", content: "[START]" }];
    // Streaming placeholder
    setDisplayMessages([{ role: "assistant", content: "", streaming: true }]);
    try {
      const text = await callAIStream(buildSystem(), trigger, 400, (partial) => {
        setDisplayMessages([{ role: "assistant", content: partial, streaming: true }]);
      });
      setApiMessages([...trigger, { role: "assistant", content: text }]);
      setDisplayMessages([{ role: "assistant", content: text, streaming: false }]);
      setPhase("interview");
      speak(text);
    } catch (e) {
      setDisplayMessages([]);
      setStartErr("Error starting interview: " + e.message);
    }
    setStartLoading(false);
  };

  /* ── COACH TIP ── */
  const fetchTip = async (question, answer, msgIndex) => {
    setLoadingTips(prev => ({ ...prev, [msgIndex]: true }));
    const coachSystem =
      `You are a concise interview coach giving real-time feedback. The candidate just answered an interview question.
Respond in exactly 2 sentences: first, one thing they did well (or acknowledge if it was weak); second, the single most impactful improvement they could make to that specific answer.
Be specific to what they actually said — don't give generic advice. No bullet points, no headers, just 2 sentences.`;
    try {
      const tip = await callAI(coachSystem, [{
        role: "user",
        content: `Question: ${question}\n\nCandidate's answer: ${answer}`,
      }], 150);
      setTips(prev => ({ ...prev, [msgIndex]: tip.trim() }));
    } catch (_) {}
    setLoadingTips(prev => ({ ...prev, [msgIndex]: false }));
  };

  /* ── SEND MESSAGE ── */
  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || aiThinking) return;
    unlock(); // prime synthesis context synchronously before async work
    stop(); stopRec();

    const userMsg = { role: "user", content: trimmed };
    const newApi = [...apiMessages, userMsg];
    const userMsgIndex = displayMessages.length;
    setApiMessages(newApi);
    setDisplayMessages(prev => [...prev, userMsg]);
    setInputText("");
    setAiThinking(true);
    setInterviewErr("");

    // Find last interviewer question to give context to the coach
    const lastQuestion = [...displayMessages].reverse().find(m => m.role === "assistant")?.content || "";

    // Add streaming placeholder for AI response
    setDisplayMessages(prev => [...prev, { role: "assistant", content: "", streaming: true }]);

    // Fire interviewer (streaming) + coach tip in parallel
    const [interviewerResult] = await Promise.allSettled([
      callAIStream(buildSystem(), newApi, 400, (partial) => {
        setDisplayMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: partial, streaming: true };
          return updated;
        });
      }),
      fetchTip(lastQuestion, trimmed, userMsgIndex),
    ]);

    if (interviewerResult.status === "fulfilled") {
      const raw = interviewerResult.value;
      const isEnd = raw.includes("|||END|||");
      const cleanText = raw.replace("|||END|||", "").trim();
      const aiMsg = { role: "assistant", content: cleanText, streaming: false };
      setApiMessages([...newApi, { role: "assistant", content: raw }]);
      setDisplayMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = aiMsg;
        return updated;
      });
      speak(cleanText);
      if (isEnd) setTimeout(() => finishInterview([...newApi, aiMsg]), 2500);
    } else {
      setDisplayMessages(prev => prev.slice(0, -1));
      setInterviewErr("Error: " + interviewerResult.reason?.message + ". Please try again.");
    }
    setAiThinking(false);
  };

  /* ── FINISH & EVALUATE ── */
  const finishInterview = async (history) => {
    setPhase("done");
    setEvalLoading(true);

    const transcript = history
      .filter(m => m.content !== "[START]")
      .map(m => `${m.role === "assistant" ? "Interviewer" : "Candidate"}: ${m.content}`)
      .join("\n\n");

    const evalSystem =
      `You are an experienced interview coach evaluating a completed job interview for the ${jobRole} role at ${company || "the company"}.

Read the full transcript carefully and score the candidate honestly and fairly using this rubric:

SCORING RUBRIC:
- 10–30: Refused to answer, completely off-topic, or mostly non-answers
- 30–45: Very weak — almost no concrete examples, very vague throughout
- 45–55: Below average — some relevant points but mostly surface-level, little depth
- 55–65: Average — decent answers, shows relevant background, needs more specifics
- 65–75: Good — clear answers, uses real examples, demonstrates relevant experience
- 75–85: Very good — strong specific examples, structured thinking, addresses the role well
- 85–95: Excellent — exceptional depth, metrics/results mentioned, highly tailored to the role

CALIBRATION NOTES:
- Someone who gives relevant, reasonably specific answers (even if not using perfect STAR format) deserves 60–70.
- Only give below 50 if the answers were genuinely poor or evasive.
- Only give above 80 if the answers were genuinely impressive with real specifics.
- Judge the SUBSTANCE of what was said, not the format or eloquence.

Respond ONLY with valid JSON, no extra text or markdown:
{"puntaje":65,"nivel":"Good candidate","fortalezas":["concrete strength 1","concrete strength 2"],"mejoras":["specific improvement 1","specific improvement 2"],"recomendacion":"honest, actionable advice in 1-2 sentences"}`;

    try {
      const raw = await callAI(evalSystem, [{ role: "user", content: transcript }], 600);
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        const ev = JSON.parse(match[0]);
        setEvaluation(ev);
        addEntry({
          date: new Date().toISOString(),
          role: jobRole,
          company: company || null,
          score: ev.puntaje,
          difficulty,
        });
      }
    } catch (e) {
      console.warn("Evaluation failed:", e);
    }
    setEvalLoading(false);
  };

  const toggleMic = () => {
    if (recording) {
      stopRec();
    } else {
      setInputText("");
      startRec(chunk => setInputText(prev => prev + chunk));
    }
  };

  const uploadResume = (file) => {
    if (!file) return;
    setResumeParsing(true);
    setResumeErr("");
    setJobMatches(null);

    const reader = new FileReader();
    reader.onerror = () => {
      setResumeErr("Could not read the file. Please try again.");
      setResumeParsing(false);
    };
    reader.onload = async (e) => {
      // Extract readable text from PDF bytes directly in the browser.
      // This avoids both iOS Safari's FormData bug and serverless PDF-parse issues.
      const bytes = new Uint8Array(e.target.result);
      const raw = Array.from(bytes, b => (b >= 32 && b <= 126) || b === 10 || b === 13 || b === 9
        ? String.fromCharCode(b) : " ").join("");
      const chunks = raw.match(/[\x20-\x7E\n\r\t]{4,}/g) || [];
      const resumeText = chunks
        .filter(c => /[a-zA-Z]{3,}/.test(c))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 8000);

      if (resumeText.length < 50) {
        setResumeErr(
          "Could not read this PDF. Try copying your resume text and pasting it in the Job Description field instead."
        );
        setResumeParsing(false);
        return;
      }

      let parsed = null;
      try {
        const res = await fetch("/api/parse-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeText }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Parse failed");
        if (data.targetRole && !jobRole) setJobRole(data.targetRole);
        if (data.summary) setJdText(prev =>
          prev ? prev + "\n\nCandidate background: " + data.summary : "Candidate background: " + data.summary
        );
        if (data.skills?.length) setJdText(prev =>
          prev + "\nKey skills: " + data.skills.join(", ")
        );
        parsed = data;
      } catch (e) {
        setResumeErr(e.message);
      }
      setResumeParsing(false);

      // Completely separate — errors here never affect resumeErr
      if (parsed) {
        fetch("/api/find-jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: parsed.targetRole, skills: parsed.skills, summary: parsed.summary }),
        })
          .then(r => r.json())
          .then(d => { if (d.jobs) setJobMatches(d); })
          .catch(() => {});
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const restart = () => {
    stop(); stopRec();
    setPhase("setup");
    setJobRole(""); setCompany(""); setJdText(""); setDifficulty("medium");
    setApiMessages([]); setDisplayMessages([]);
    setInputText(""); setEvaluation(null);
    setStartErr(""); setInterviewErr("");
    setTips({}); setLoadingTips({});
    setResumeFile(null); setResumeErr(""); setJobMatches(null);
  };

  const pi = phase === "setup" ? 0 : phase === "interview" ? 1 : 2;

  return (
    <>
      <style>{css}</style>
      <div className="shell">
        <Link href="/" className="back-link">← InterviewHub</Link>
        <div className="hd">
          <div className="hd-tag">// AI Interview Trainer · with voice</div>
          <div className="hd-title">Practice for the job you want</div>
          <div className="hd-sub">Real conversation with an AI interviewer</div>
        </div>

        <div className="steps">
          {[["Your job", 1], ["Interview", 2], ["Results", 3]].map(([lbl, n], i) => (
            <div key={n} className={`step-btn${i < pi ? " done" : i === pi ? " active" : ""}`}>
              <div className="step-num">{i < pi ? "✓" : n}</div>
              {lbl}
            </div>
          ))}
        </div>

        {/* ── SETUP ── */}
        {phase === "setup" && (
          <div className="card" key="setup">
            <div className="card-title">What job are you applying for?</div>
            <div className="card-desc">Paste the job posting link and we'll analyze it automatically, or fill in the fields manually.</div>

            <div className="url-bar">
              <input
                className="url-input"
                value={jobUrl}
                onChange={e => { setJobUrl(e.target.value); setScrapeErr(""); }}
                onKeyDown={e => e.key === "Enter" && scrapeJob()}
                placeholder="https://linkedin.com/jobs/... or any job posting link"
              />
              <button className="url-btn" onClick={scrapeJob} disabled={scraping || !jobUrl.trim()}>
                {scraping ? "Analyzing..." : "✦ Analyze"}
              </button>
            </div>
            {scraping && (
              <div className="loader" style={{ marginTop: -10, marginBottom: 10 }}>
                <div className="dot" /><div className="dot" /><div className="dot" />
                Reading the job posting...
              </div>
            )}
            {scrapeErr && <div className="err-box" style={{ marginTop: -10, marginBottom: 14 }}>{scrapeErr}</div>}

            <div className="url-divider">
              <div className="url-divider-line" />
              <div className="url-divider-text">or fill manually</div>
              <div className="url-divider-line" />
            </div>

            <div className="row">
              <div className="field">
                <label>Position</label>
                <input value={jobRole} onChange={e => setJobRole(e.target.value)} placeholder="e.g. UX/UI Designer" />
              </div>
              <div className="field">
                <label>Company</label>
                <input value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Google (optional)" />
              </div>
            </div>
            {/* ── RESUME UPLOAD ── */}
            <div
              className={`resume-drop${resumeFile ? " has-file" : ""}`}
              onClick={() => !resumeFile && resumeInputRef.current?.click()}
            >
              <input
                ref={resumeInputRef}
                type="file"
                accept=".pdf"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) { setResumeFile(f); uploadResume(f); }
                }}
              />
              <span className="resume-icon">{resumeParsing ? "⏳" : resumeFile && !resumeErr ? "📄" : resumeFile ? "⚠️" : "📎"}</span>
                <div className="resume-text">
                {resumeParsing ? (
                  <><strong>Analyzing resume...</strong>Extracting your experience and skills</>
                ) : resumeFile && !resumeErr ? (
                  <><strong>{resumeFile.name}</strong>Resume parsed — fields auto-filled below</>
                ) : resumeFile ? (
                  <><strong>{resumeFile.name}</strong>Parsing failed — see error below</>
                ) : (
                  <><strong>Upload your resume (optional)</strong>PDF · auto-fills role and skills</>
                )}
              </div>
              {resumeFile && !resumeParsing && (
                <button
                  className="resume-clear"
                  onClick={e => { e.stopPropagation(); setResumeFile(null); setResumeErr(""); }}
                >✕</button>
              )}
            </div>
            {resumeErr && <div className="err-box" style={{ marginTop: -8, marginBottom: 14 }}>{resumeErr}</div>}

            {/* ── JOB MATCHES ── */}
            {resumeFile && !resumeErr && (
              <div className="jobs-panel">
                <div className="jobs-title">Jobs that match your profile</div>
                <div className="jobs-sub">
                  {jobMatches
                    ? "Open LinkedIn to apply · or practice the interview first"
                    : "Finding your best matches..."}
                </div>
                {!jobMatches ? (
                  <div className="jobs-loading">
                    <div className="dot" /><div className="dot" /><div className="dot" />
                    Analyzing your profile...
                  </div>
                ) : (
                  <div className="jobs-list">
                    {jobMatches.jobs?.map((j, i) => (
                      <div className="job-card" key={i}>
                        <div className="job-card-num">{i + 1}</div>
                        <div className="job-card-info">
                          <div className="job-card-title">{j.title}</div>
                          <div className="job-card-reason">{j.reason}</div>
                        </div>
                        <div className="job-card-actions">
                          <a
                            href={j.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="job-card-link"
                          >
                            LinkedIn →
                          </a>
                          <button
                            className="job-card-practice"
                            onClick={() => setJobRole(j.title)}
                          >
                            Practice →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="field">
              <label>Job Description</label>
              <textarea
                rows={6}
                placeholder="Paste the job posting text here: requirements, responsibilities, skills..."
                value={jdText}
                onChange={e => setJdText(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: ".7rem", color: "#444", fontFamily: "'DM Mono',monospace", marginBottom: 8 }}>Quick examples:</div>
              {EXAMPLES.map(ex => (
                <span key={ex.role} className="badge" onClick={() => { setJobRole(ex.role); setCompany(ex.company); setJdText(ex.jd); }}>
                  {ex.role}
                </span>
              ))}
            </div>
            <div className="field" style={{ maxWidth: 220 }}>
              <label>Number of questions</label>
              <select value={numQ} onChange={e => setNumQ(e.target.value)}>
                <option value="3">3 — Quick</option>
                <option value="5">5 — Standard</option>
                <option value="7">7 — Full</option>
                <option value="10">10 — Intensive</option>
              </select>
            </div>
            <div className="field">
              <label>Difficulty</label>
              <div className="diff-row">
                {[
                  { key: "easy",   emoji: "🟢", label: "Easy",     sub: "Encouraging" },
                  { key: "medium", emoji: "🟡", label: "Standard", sub: "Balanced"    },
                  { key: "hard",   emoji: "🔴", label: "Hard",     sub: "Relentless"  },
                ].map(({ key, emoji, label, sub }) => (
                  <button
                    key={key}
                    className={`diff-pill ${key}${difficulty === key ? " active" : ""}`}
                    onClick={() => setDifficulty(key)}
                  >
                    {emoji} {label}
                    <div className="diff-sub">{sub}</div>
                  </button>
                ))}
              </div>
            </div>
            <button className="btn" onClick={startInterview} disabled={startLoading || !jobRole.trim() || !jdText.trim()}>
              {startLoading ? "Preparing interviewer..." : "Start interview →"}
            </button>
            {startLoading && (
              <div className="loader">
                <div className="dot" /><div className="dot" /><div className="dot" />
                Setting up your AI interviewer...
              </div>
            )}
            {startErr && <div className="err-box">{startErr}</div>}
          </div>
        )}

        {/* ── INTERVIEW ── */}
        {phase === "interview" && (
          <div className="card" key="interview">
            {/* Interviewer presence card */}
            {(() => {
              const cfg = DIFFICULTY_CONFIG[difficulty];
              const initials = cfg.name.split(" ").map(n => n[0]).join("");
              const isStreaming = displayMessages.some(m => m.streaming);
              return (
                <div className="iv-card">
                  <div className="iv-avatar-wrap">
                    <div className={`iv-avatar ${difficulty}`}>{initials}</div>
                    <div className={`iv-ring ${difficulty}${(speaking || isStreaming) ? " speaking" : ""}`} />
                  </div>
                  <div className="iv-info">
                    <div className="iv-name">{cfg.name}</div>
                    <div className="iv-title">{cfg.title} · {company || "Company"}</div>
                    <div className="iv-status">
                      <div className="iv-dot" />
                      <span className="iv-live">Live interview</span>
                      <span className="iv-typing">
                        {isStreaming ? "· typing..." : speaking ? "· speaking..." : ""}
                      </span>
                    </div>
                  </div>
                  <span className={`diff-badge ${difficulty}`}>{cfg.emoji} {cfg.label}</span>
                </div>
              );
            })()}

            <div className="chat-area">
              {displayMessages.map((msg, i) => (
                <div key={i}>
                  <div className={`msg msg-${msg.role === "assistant" ? "ai" : "user"}`}>
                    <div className={`bubble bubble-${msg.role === "assistant" ? "ai" : "user"}`}>
                      {msg.content}
                      {msg.streaming && msg.content && <span className="cursor" />}
                    </div>
                  </div>
                  {msg.role === "user" && loadingTips[i] && (
                    <div className="coach-tip-loading">💬 coach analyzing...</div>
                  )}
                  {msg.role === "user" && tips[i] && (
                    <div className="coach-tip">
                      <div className="coach-tip-label">💬 Coach tip</div>
                      {tips[i]}
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {interviewErr && <div className="err-box">{interviewErr}</div>}

            <div className="chat-input-bar">
              {micOk && (
                <button className={`mic-sm${recording ? " rec" : ""}`} onClick={toggleMic} disabled={aiThinking}>
                  {recording ? "⏹" : "🎤"}
                </button>
              )}
              <input
                className="chat-input"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(inputText)}
                placeholder={aiThinking ? `${DIFFICULTY_CONFIG[difficulty].name.split(" ")[0]} is typing...` : "Your answer..."}
                disabled={aiThinking}
              />
              <button className="send-btn" onClick={() => sendMessage(inputText)} disabled={aiThinking || !inputText.trim()}>
                ➤
              </button>
            </div>

            {recording && (
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:".68rem", color:"#c060ff", textAlign:"center", marginTop:6 }}>
                🔴 Recording — tap stop, then send
              </div>
            )}

            <button className="end-btn" onClick={() => finishInterview(apiMessages)}>
              End interview and see results
            </button>
          </div>
        )}

        {/* ── RESULTS ── */}
        {phase === "done" && (
          <div className="card" key="done">
            <div className="card-title">Interview complete 🎉</div>
            <div className="card-desc" style={{ marginBottom: 20 }}>
              Evaluation for <strong style={{ color: "#eeeeff" }}>{jobRole}</strong>{company ? ` at ${company}` : ""}
            </div>

            {evalLoading && (
              <div className="loader">
                <div className="dot" /><div className="dot" /><div className="dot" />
                Analyzing your performance...
              </div>
            )}

            {evaluation && (
              <>
                <div className="summary-bar">
                  <div className={`summary-ring ${SC(evaluation.puntaje)}`}>{evaluation.puntaje}</div>
                  <div>
                    <div className="summary-label">Overall score</div>
                    <div className="summary-val">{evaluation.nivel}</div>
                  </div>
                </div>
                <div className="fb">
                  <div className="fb-head">Strengths</div>
                  <div className="fb-body">
                    {evaluation.fortalezas?.map((f, i) => (
                      <div className="li" key={i}><span className="li-dot" style={{ color: "#4ecc96" }}>✓</span>{f}</div>
                    ))}
                  </div>
                </div>
                <div className="fb">
                  <div className="fb-head">Areas for improvement</div>
                  <div className="fb-body">
                    {evaluation.mejoras?.map((m, i) => (
                      <div className="li" key={i}><span className="li-dot" style={{ color: "#f06060" }}>→</span>{m}</div>
                    ))}
                  </div>
                </div>
                {evaluation.recomendacion && (
                  <div className="tip-box" style={{ marginBottom: 20 }}>
                    💡 {evaluation.recomendacion}
                  </div>
                )}
              </>
            )}

            <button className="btn" onClick={startInterview} disabled={startLoading}>
              {startLoading ? "Preparing..." : "Repeat interview →"}
            </button>
            <button className="btn-ghost" onClick={restart}>Practice for another job</button>
          </div>
        )}

        {/* ── HISTORY ── */}
        {phase === "setup" && history.length > 0 && (
          <div className="hist-panel">
            <div className="hist-title">
              Past interviews
              <button className="hist-clear" onClick={clearHistory}>Clear</button>
            </div>
            <div className="hist-list">
              {history.map((h, i) => {
                const sc = h.score >= 80 ? "great" : h.score >= 60 ? "ok" : "low";
                const date = new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                return (
                  <div className="hist-item" key={i}>
                    <div className={`hist-score ${sc}`}>{h.score}</div>
                    <div className="hist-info">
                      <div className="hist-role">{h.role}{h.company ? ` · ${h.company}` : ""}</div>
                      <div className="hist-meta">{date} · {h.difficulty}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
