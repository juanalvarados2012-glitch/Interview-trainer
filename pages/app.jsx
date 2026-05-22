import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

const CLERK_ENABLED = typeof process !== "undefined" && !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const STRIPE_LINK = "https://buy.stripe.com/bJebJ37atckE4JudqC4Vy04";
import { useHistory, computeInsights, WEAK_AREAS } from "../lib/useHistory";

/* ── STYLES ─────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body,#root{font-family:'Syne',sans-serif;background:#07080f;color:#eeeeff;min-height:100vh}
  .shell{max-width:720px;margin:0 auto;padding:36px 20px 80px}
  .hd{margin-bottom:32px}
  .hd-tag{font-family:'DM Mono',monospace;font-size:.72rem;color:#4040a0;letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px}
  .hd-title{font-size:2rem;font-weight:800;letter-spacing:-.03em;line-height:1.1;background:linear-gradient(135deg,#eeeeff,#6060cc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .hd-sub{font-size:.82rem;color:#ddd;margin-top:6px;font-family:'DM Mono',monospace}
  .steps{display:flex;margin-bottom:28px;background:#0d0d1a;border:1px solid #1a1a30;border-radius:14px;overflow:hidden}
  .step-btn{flex:1;padding:14px 8px;border:none;background:transparent;font-family:'Syne',sans-serif;font-size:.78rem;font-weight:600;color:#bbb;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;border-right:1px solid #1a1a30;transition:all .2s}
  .step-btn:last-child{border-right:none}
  .step-btn.done{color:#4ecc96}
  .step-btn.active{background:#12122a;color:#fff}
  .step-num{width:22px;height:22px;border-radius:50%;background:#1a1a30;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700}
  .step-btn.active .step-num{background:#3030b0}
  .step-btn.done .step-num{background:#1a3a2a;color:#4ecc96}
  .card{background:#0d0d1a;border:1px solid #1a1a30;border-radius:20px;padding:28px;animation:fadeUp .3s ease}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .card-title{font-size:1.15rem;font-weight:800;letter-spacing:-.02em;margin-bottom:6px}
  .card-desc{font-size:.78rem;color:#ddd;font-family:'DM Mono',monospace;margin-bottom:20px;line-height:1.5}
  label{display:block;font-size:.72rem;font-weight:700;color:#ddd;letter-spacing:.06em;text-transform:uppercase;margin-bottom:6px}
  textarea,input,select{width:100%;background:#080812;border:1px solid #1a1a30;border-radius:10px;padding:10px 12px;color:#eeeeff;font-family:'DM Mono',monospace;font-size:.85rem;resize:vertical;outline:none;transition:border-color .2s}
  textarea:focus,input:focus,select:focus{border-color:#3030a0}
  select option{background:#0d0d1a}
  .field{margin-bottom:16px}
  .row{display:flex;gap:12px}
  .row .field{flex:1}
  .btn{width:100%;padding:13px;border-radius:10px;border:none;background:linear-gradient(135deg,#2020a0,#4040cc);color:#fff;font-family:'Syne',sans-serif;font-size:.9rem;font-weight:700;cursor:pointer;transition:all .2s;letter-spacing:.01em}
  .btn:hover:not(:disabled){opacity:.85;transform:translateY(-1px)}
  .btn:disabled{opacity:.35;cursor:not-allowed;transform:none}
  .btn-ghost{width:100%;padding:11px;border-radius:10px;border:1px solid #1a1a30;background:transparent;color:#ddd;font-family:'Syne',sans-serif;font-size:.85rem;font-weight:600;cursor:pointer;transition:all .2s;margin-top:10px}
  .btn-ghost:hover{border-color:#3030a0;color:#ddd}
  .loader{display:flex;gap:6px;align-items:center;padding:14px 0;color:#ddd;font-family:'DM Mono',monospace;font-size:.78rem}
  .dot{width:6px;height:6px;background:#4040c0;border-radius:50%;animation:bounce 1.2s infinite}
  .dot:nth-child(2){animation-delay:.2s}
  .dot:nth-child(3){animation-delay:.4s}
  @keyframes bounce{0%,80%,100%{transform:translateY(0);opacity:.3}40%{transform:translateY(-6px);opacity:1}}
  .job-chip{background:#0a0a1f;border:1px solid #1a1a35;border-radius:12px;padding:12px 14px;display:flex;align-items:center;gap:12px;margin-bottom:18px}
  .job-icon{font-size:1.6rem;line-height:1}
  .job-company{font-size:.7rem;font-family:'DM Mono',monospace;color:#4040a0;text-transform:uppercase;letter-spacing:.08em}
  .job-role{font-size:.95rem;font-weight:700}
  .badge{display:inline-flex;background:#0d0d22;border:1px solid #1a1a35;border-radius:8px;padding:4px 10px;font-family:'DM Mono',monospace;font-size:.72rem;color:#ddd;cursor:pointer;margin:3px;transition:all .2s}
  .badge:hover{background:#12122a;color:#9090ff}
  .summary-bar{display:flex;align-items:center;gap:12px;background:#080812;border:1px solid #1a1a30;border-radius:12px;padding:14px 18px;margin-bottom:20px}
  .summary-ring{width:56px;height:56px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:800}
  .summary-ring.great{background:#0a2a1a;color:#4ecc96;border:2px solid #4ecc9640}
  .summary-ring.ok{background:#2a2000;color:#f0c060;border:2px solid #f0c06040}
  .summary-ring.low{background:#2a0a0a;color:#f06060;border:2px solid #f0606040}
  .summary-label{font-size:.72rem;font-family:'DM Mono',monospace;color:#ddd;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px}
  .summary-val{font-size:1rem;font-weight:700}
  .fb{background:#080812;border:1px solid #1a1a30;border-radius:12px;overflow:hidden;margin-bottom:12px}
  .fb-head{padding:10px 14px;background:#0d0d20;font-size:.72rem;font-weight:700;color:#ddd;text-transform:uppercase;letter-spacing:.06em}
  .fb-body{padding:14px;font-family:'DM Mono',monospace;font-size:.8rem;line-height:1.6;color:#ccc}
  .li{display:flex;gap:8px;margin-bottom:6px;font-family:'DM Mono',monospace;font-size:.8rem;line-height:1.5}
  .li-dot{flex-shrink:0;margin-top:2px}
  .tip-box{background:#080812;border:1px solid #1a1a30;border-left:3px solid #3030a0;border-radius:8px;padding:10px 14px;font-family:'DM Mono',monospace;font-size:.78rem;color:#ddd;margin-bottom:16px;line-height:1.5}
  .err-box{background:#1a0808;border:1px solid #3a1010;border-radius:10px;padding:12px 14px;font-family:'DM Mono',monospace;font-size:.78rem;color:#cc6060;margin-top:12px;line-height:1.5}
  .url-bar{display:flex;gap:8px;margin-bottom:20px}
  .url-input{flex:1;background:#080812;border:1px solid #1a1a30;border-radius:10px;padding:10px 12px;color:#eeeeff;font-family:'DM Mono',monospace;font-size:.82rem;outline:none;transition:border-color .2s}
  .url-input:focus{border-color:#3030a0}
  .url-btn{flex-shrink:0;padding:10px 16px;border-radius:10px;border:none;background:#12122a;border:1px solid #2a2a50;color:#8080cc;font-family:'Syne',sans-serif;font-size:.8rem;font-weight:700;cursor:pointer;transition:all .2s;white-space:nowrap}
  .url-btn:hover:not(:disabled){background:#1a1a40;color:#aaaaff}
  .url-btn:disabled{opacity:.4;cursor:not-allowed}
  .url-divider{display:flex;align-items:center;gap:10px;margin-bottom:20px}
  .url-divider-line{flex:1;height:1px;background:#1a1a30}
  .url-divider-text{font-family:'DM Mono',monospace;font-size:.68rem;color:#ccc;text-transform:uppercase;letter-spacing:.08em}
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
  .iv-title{font-size:.72rem;color:#ddd;font-family:'DM Mono',monospace}
  .iv-status{display:flex;align-items:center;gap:6px;margin-top:6px}
  .iv-dot{width:6px;height:6px;border-radius:50%;background:#4ecc96;animation:ivPulse 2s infinite}
  @keyframes ivPulse{0%,100%{opacity:1}50%{opacity:.3}}
  .iv-live{font-family:'DM Mono',monospace;font-size:.65rem;color:#4ecc96;text-transform:uppercase;letter-spacing:.08em}
  .iv-typing{font-family:'DM Mono',monospace;font-size:.65rem;color:#ddd;margin-left:4px}
  /* ── VOICE PICKER ── */
  .voice-row{display:flex;align-items:center;gap:8px;padding:8px 14px;background:#080812;border:1px solid #1a1a30;border-radius:12px;margin-bottom:14px}
  .voice-label{font-family:'DM Mono',monospace;font-size:.7rem;color:#ddd;text-transform:uppercase;letter-spacing:.06em;flex-shrink:0}
  .voice-select{flex:1;background:transparent;border:none;color:#ddd;font-family:'DM Mono',monospace;font-size:.78rem;padding:6px 8px;border-radius:6px;outline:none;cursor:pointer}
  .voice-select:hover{background:#0d0d20;color:#eeeeff}
  .voice-select option{background:#0d0d1a}
  .voice-preview{background:#12122a;border:1px solid #2a2a50;color:#8080cc;width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:.78rem;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .2s}
  .voice-preview:hover:not(:disabled){background:#1a1a40;color:#aaaaff}
  .voice-preview:disabled{opacity:.4;cursor:not-allowed}
  /* ── CHAT ── */
  .chat-area{height:340px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;padding:4px 0 8px;scroll-behavior:smooth}
  .chat-area::-webkit-scrollbar{width:3px}
  .chat-area::-webkit-scrollbar-track{background:transparent}
  .chat-area::-webkit-scrollbar-thumb{background:#2a2a50;border-radius:2px}
  .msg{display:flex;gap:8px;animation:fadeUp .25s ease}
  .msg-ai{flex-direction:row}
  .msg-user{flex-direction:row-reverse}
  .bubble{max-width:85%;padding:10px 14px;border-radius:14px;font-family:'DM Mono',monospace;font-size:.82rem;line-height:1.55}
  .bubble-ai{background:#0d0d20;border:1px solid #1a1a35;border-top-left-radius:4px;color:#eee}
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
  /* ── RECORD TOGGLE ── */
  .record-toggle{display:flex;align-items:center;gap:14px;padding:14px 16px;background:#080812;border:1px solid #1a1a30;border-radius:12px;cursor:pointer;margin-bottom:18px;transition:all .2s}
  .record-toggle:hover{border-color:#3030a0}
  .record-toggle.on{border-color:#c060ff60;background:#0a0518}
  .record-toggle-icon{font-size:1.4rem;flex-shrink:0}
  .record-toggle-text{flex:1;font-family:'DM Mono',monospace;font-size:.72rem;color:#ddd;line-height:1.4}
  .record-toggle-text strong{display:block;color:#eeeeff;margin-bottom:2px;font-size:.8rem}
  .record-toggle-switch{width:36px;height:20px;background:#1a1a30;border-radius:20px;position:relative;flex-shrink:0;transition:background .2s}
  .record-toggle-switch.on{background:#c060ff}
  .record-toggle-knob{position:absolute;top:2px;left:2px;width:16px;height:16px;background:#eeeeff;border-radius:50%;transition:transform .2s}
  .record-toggle-switch.on .record-toggle-knob{transform:translateX(16px)}
  /* ── CAM PREVIEW ── */
  .cam-preview{position:fixed;top:16px;right:16px;width:108px;height:80px;border-radius:10px;overflow:hidden;border:2px solid #c060ff;background:#000;z-index:50;box-shadow:0 4px 14px rgba(192,96,255,.4)}
  .cam-preview video{width:100%;height:100%;object-fit:cover;transform:scaleX(-1)}
  .cam-rec-dot{position:absolute;top:6px;left:6px;width:8px;height:8px;background:#ff3030;border-radius:50%;animation:ivPulse 1.4s infinite}
  /* ── VIDEO REVIEW ── */
  .video-review{background:#080812;border:1px solid #1a1a30;border-radius:14px;padding:18px;margin-bottom:18px}
  .video-review-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
  .video-review-title{font-size:.85rem;font-weight:700;letter-spacing:-.01em}
  .video-review-dl{font-family:'DM Mono',monospace;font-size:.7rem;color:#6060cc;text-decoration:none;border:1px solid #2a2a50;padding:5px 10px;border-radius:8px;transition:all .2s}
  .video-review-dl:hover{background:#12122a;color:#9090ff}
  .video-review-player{width:100%;border-radius:10px;background:#000;margin-bottom:14px;transform:scaleX(-1)}
  .video-stats{display:flex;gap:8px;margin-bottom:14px}
  .video-stat{flex:1;background:#0a0a18;border:1px solid #1a1a30;border-radius:10px;padding:10px 8px;text-align:center}
  .video-stat-val{font-size:1.4rem;font-weight:800;line-height:1.1;background:linear-gradient(135deg,#eeeeff,#6060cc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .video-stat-val.great{background:linear-gradient(135deg,#4ecc96,#2a9a70);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .video-stat-val.ok{background:linear-gradient(135deg,#f0c060,#cc9030);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .video-stat-val.low{background:linear-gradient(135deg,#f06060,#cc3030);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .video-stat-lbl{font-family:'DM Mono',monospace;font-size:.6rem;color:#ddd;text-transform:uppercase;letter-spacing:.06em;margin-top:4px}
  .video-stat-sub{font-family:'DM Mono',monospace;font-size:.6rem;color:#ddd;margin-top:3px;line-height:1.3}
  /* ── COACH CARD ── */
  .coach-card{background:linear-gradient(135deg,#0d0d1f,#0a1a18);border:1px solid #1a2a30;border-radius:18px;padding:20px;margin-bottom:18px;animation:fadeUp .3s ease}
  .coach-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
  .coach-title{font-family:'DM Mono',monospace;font-size:.7rem;color:#4ecc96;text-transform:uppercase;letter-spacing:.1em;font-weight:700}
  .coach-streak{font-family:'DM Mono',monospace;font-size:.72rem;color:#f0c060;background:#1a1400;border:1px solid #f0c06040;padding:3px 10px;border-radius:20px}
  .coach-stats{display:flex;gap:14px;margin-bottom:14px}
  .coach-stat{flex:1;background:#080812;border:1px solid #1a1a30;border-radius:12px;padding:12px 14px;text-align:center}
  .coach-stat-val{font-size:1.6rem;font-weight:800;letter-spacing:-.02em;background:linear-gradient(135deg,#eeeeff,#6060cc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .coach-stat-lbl{font-family:'DM Mono',monospace;font-size:.65rem;color:#ddd;text-transform:uppercase;letter-spacing:.06em;margin-top:2px}
  .coach-weak{background:#080812;border:1px solid #1a1a30;border-left:3px solid #4ecc96;border-radius:8px;padding:10px 14px;font-family:'DM Mono',monospace;font-size:.78rem;color:#ccc;line-height:1.5}
  .coach-weak-lbl{color:#ddd;text-transform:uppercase;font-size:.65rem;letter-spacing:.06em;margin-right:8px}
  .coach-weak-val{color:#eeeeff;font-weight:600}
  /* ── HISTORY ── */
  .hist-panel{margin-top:32px}
  .hist-title{font-family:'DM Mono',monospace;font-size:.68rem;color:#ddd;text-transform:uppercase;letter-spacing:.1em;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center}
  .hist-clear{background:none;border:none;color:#bbb;font-family:'DM Mono',monospace;font-size:.65rem;cursor:pointer;padding:2px 6px;border-radius:4px;transition:color .2s}
  .hist-clear:hover{color:#cc6060}
  .hist-list{display:flex;flex-direction:column;gap:8px}
  .hist-item{background:#0a0a18;border:1px solid #151525;border-radius:10px;padding:10px 14px;display:flex;align-items:center;gap:12px}
  .hist-score{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.82rem;font-weight:800;flex-shrink:0}
  .hist-score.great{background:#0a2a1a;color:#4ecc96;border:1.5px solid #4ecc9640}
  .hist-score.ok{background:#2a2000;color:#f0c060;border:1.5px solid #f0c06040}
  .hist-score.low{background:#2a0a0a;color:#f06060;border:1.5px solid #f0606040}
  .hist-info{flex:1;min-width:0}
  .hist-role{font-size:.82rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .hist-meta{font-family:'DM Mono',monospace;font-size:.68rem;color:#ddd;margin-top:2px}
  /* ── BACK LINK ── */
  .back-link{display:inline-flex;align-items:center;gap:6px;font-family:'DM Mono',monospace;font-size:.72rem;color:#ddd;text-decoration:none;margin-bottom:24px;transition:color .2s}
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
// Score voices by quality so we pick the best one available on the user's device.
// Premium/neural voices get a big boost; cloud voices win over local synth.
function rankVoice(v) {
  let s = 0;
  const n = v.name || "";
  if (/Natural/i.test(n)) s += 220;          // Microsoft Edge neural ("Aria Natural")
  if (/Neural/i.test(n)) s += 220;
  if (/Wavenet/i.test(n)) s += 220;          // Google Wavenet (rare in browser, but)
  if (/Premium/i.test(n)) s += 170;          // Apple premium voices
  if (/Enhanced/i.test(n)) s += 170;
  if (/^Siri/i.test(n)) s += 150;            // Apple Siri voices
  if (/Online/i.test(n)) s += 120;           // Microsoft cloud voices
  if (/Google/i.test(n)) s += 90;
  if (v.localService === false) s += 30;
  if (/Compact|eSpeak|Microsoft .* Desktop/i.test(n)) s -= 100;
  return s;
}

const FEMALE_HINTS = ["aria","jenny","ava","emma","samantha","karen","susan","allison","zira","cortana","clara","nova","kate","kim","rosa","wendy","fiona","tessa","sara","sandy","monica","veena","catherine","linda","amelie","amelia","libby","sonia","olivia","emily","michelle","heather","clear voice 1","siri voice 1","siri voice 4","yuna"];
const MALE_HINTS = ["guy","tony","jacob","brandon","daniel","alex","tom","mike","david","mark","ryan","james","george","aaron","brian","eric","fred","reed","arthur","oliver","william","matthew","ralph","ravi","siri voice 2","siri voice 3","jorge","diego","albert","fred"];
function voiceGender(v) {
  const n = (v.name || "").toLowerCase();
  if (FEMALE_HINTS.some(h => n.includes(h))) return "female";
  if (MALE_HINTS.some(h => n.includes(h))) return "male";
  if (/female/i.test(n)) return "female";
  if (/male/i.test(n)) return "male";
  return "neutral";
}

function pickBestVoice(voices, { lang = "en-US", preferGender = "any" } = {}) {
  let pool = voices.filter(v => v.lang === lang);
  if (pool.length === 0) pool = voices.filter(v => v.lang?.startsWith(lang.split("-")[0]));
  if (pool.length === 0) return null; // no matching language voice — let browser use utt.lang
  if (preferGender !== "any") {
    const matched = pool.filter(v => voiceGender(v) === preferGender);
    if (matched.length > 0) pool = matched;
  }
  return [...pool].sort((a, b) => rankVoice(b) - rankVoice(a))[0];
}

function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const voicesRef = useRef([]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const load = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
        voicesRef.current = v;
        setVoices(v);
      }
    };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  const unlock = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const dummy = new SpeechSynthesisUtterance("");
    window.speechSynthesis.speak(dummy);
    window.speechSynthesis.cancel();
  }, []);

  // opts.voice = a SpeechSynthesisVoice instance (override); opts.preferGender for auto-pick
  const speak = useCallback((text, opts = {}) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const go = () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
      const utt = new SpeechSynthesisUtterance(text);
      const ttsLang = opts.lang || "en-US";
      utt.lang = ttsLang;
      utt.rate = opts.rate ?? 0.95;
      utt.pitch = opts.pitch ?? 1.0;
      const list = voicesRef.current.length > 0 ? voicesRef.current : window.speechSynthesis.getVoices();
      const chosen = opts.voice || pickBestVoice(list, { lang: ttsLang, preferGender: opts.preferGender });
      if (chosen) utt.voice = chosen;
      utt.onstart = () => setSpeaking(true);
      utt.onend = () => setSpeaking(false);
      utt.onerror = () => setSpeaking(false);
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

  return { speak, stop, speaking, unlock, voices };
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
  const startRec = useCallback((onChunk, recLang = "en-US") => {
    cbRef.current = onChunk;
    if (recRef.current) recRef.current.lang = recLang;
    try { recRef.current?.start(); setRecording(true); } catch (e) { console.warn(e); }
  }, []);
  const stopRec = useCallback(() => {
    try { recRef.current?.stop(); } catch (e) { console.warn(e); }
    setRecording(false);
  }, []);
  return { recording, supported, startRec, stopRec };
}

/* ── CONSTANTS ───────────────────────────────────────────────── */
const EXAMPLES = {
  en: [
    { role: "UX/UI Designer", company: "Tech Startup", jd: "We are looking for a UX/UI Designer with experience in Figma, user research, rapid prototyping, and agile team collaboration. Systems thinking and a passion for usability are highly valued." },
    { role: "Executive Assistant", company: "Consulting Firm", jd: "Executive assistant responsible for calendar management, meeting coordination, document handling, internal client support, and assistance to senior leadership." },
    { role: "Marketing Manager", company: "Digital Agency", jd: "Marketing manager with experience in social media strategy, content creation, metrics analysis, community management, and digital campaigns for consumer brands." },
  ],
  es: [
    { role: "Diseñador UX/UI", company: "Startup Tech", jd: "Buscamos un Diseñador UX/UI con experiencia en Figma, investigación de usuarios, prototipado rápido y colaboración en equipos ágiles. Pensamiento sistémico y pasión por la usabilidad son muy valorados." },
    { role: "Asistente Ejecutivo", company: "Firma Consultora", jd: "Asistente ejecutivo responsable de gestión de agenda, coordinación de reuniones, manejo de documentos, soporte a clientes internos y asistencia a la alta dirección." },
    { role: "Gerente de Marketing", company: "Agencia Digital", jd: "Gerente de marketing con experiencia en estrategia en redes sociales, creación de contenido, análisis de métricas, gestión de comunidades y campañas digitales para marcas de consumo." },
  ],
};

/* ── TRANSLATIONS ────────────────────────────────────────────── */
const STRINGS = {
  en: {
    tag: "// AI Interview Trainer · with voice",
    title: "Practice for the job you want",
    subtitle: "Real conversation with an AI interviewer",
    steps: ["Your job", "Interview", "Results"],
    setupTitle: "What job are you applying for?",
    setupDesc: "Paste the job posting link and we'll analyze it automatically, or fill in the fields manually.",
    urlPlaceholder: "Paste a job posting link (Greenhouse, Lever, Workday, company career pages)",
    urlBtn: "✦ Analyze", urlAnalyzing: "Analyzing...", readingJob: "Reading the job posting...",
    orFill: "or fill manually",
    positionLabel: "Position", companyLabel: "Company",
    positionPlaceholder: "e.g. UX/UI Designer", companyPlaceholder: "e.g. Google (optional)",
    jdLabel: "Job Description",
    jdPlaceholder: "Paste the job posting text here: requirements, responsibilities, skills...",
    quickExamples: "Quick examples:",
    numQLabel: "Number of questions", diffLabel: "Difficulty",
    diffOpts: [
      { key: "easy",   label: "Easy",     sub: "Encouraging"    },
      { key: "medium", label: "Standard", sub: "Balanced"       },
      { key: "hard",   label: "Hard",     sub: "FAANG Bootcamp" },
    ],
    recordLabel: "Record yourself",
    recordDesc: "Watch your interview back · count fillers · check pace · 100% private, stays on your device",
    startBtn: "Start interview →", preparingBtn: "Preparing interviewer...",
    settingUp: "Setting up your AI interviewer...",
    coachTitle: "Your coach", avgScore: "Avg score", totalInterviews: "Total interviews",
    focusArea: "Focus area:", quickDrill: "Quick drill · 3 questions →", preparingDrill: "Preparing...",
    liveLabel: "Live interview", typingLabel: "· typing...", speakingLabel: "· speaking...",
    voiceLabel: "🔊 Voice", voiceAuto: (n) => `Auto · best for ${n}`,
    answerPlaceholder: "Your answer...", aiTypingPlaceholder: (n) => `${n} is typing...`,
    endBtn: "End interview and see results",
    coachTipLabel: "💬 Coach tip", coachAnalyzing: "💬 coach analyzing...",
    doneTitle: "Interview complete 🎉", evalFor: "Evaluation for",
    analyzingPerf: "Analyzing your performance...", scoreLabel: "Overall score",
    strengthsLabel: "Strengths", improvLabel: "Areas for improvement",
    speechTitle: "🎤 Speech analytics", wpmLabel: "Words / min",
    fillerLabel: "Filler words", totalWordsLabel: "Total words", cleanDelivery: "Clean delivery",
    videoTitle: "📹 Video review", downloadLabel: "⬇ Download",
    inFrameLabel: "In frame", eyeLabel: "Eye contact",
    repeatBtn: "Repeat interview →", anotherBtn: "Practice for another job",
    pastLabel: "Past interviews", clearLabel: "Clear",
    weakLabels: {
      behavioral_specifics: "Concrete examples (STAR)", technical_depth: "Technical depth",
      communication_clarity: "Clear communication",    structuring_answers: "Structuring answers",
      energy_engagement: "Energy & engagement",        confidence: "Confidence",
      job_alignment: "Job alignment",                  filler_words: "Filler words",
    },
  },
  es: {
    tag: "// Entrenador de entrevistas con IA · con voz",
    title: "Practica para el trabajo que quieres",
    subtitle: "Conversación real con un entrevistador de IA",
    steps: ["Tu puesto", "Entrevista", "Resultados"],
    setupTitle: "¿A qué puesto estás aplicando?",
    setupDesc: "Pega el link de la vacante y lo analizamos automáticamente, o llena los campos manualmente.",
    urlPlaceholder: "Pega el link de la vacante (Greenhouse, Lever, Workday, portales de empresa)",
    urlBtn: "✦ Analizar", urlAnalyzing: "Analizando...", readingJob: "Leyendo la vacante...",
    orFill: "o llena manualmente",
    positionLabel: "Puesto", companyLabel: "Empresa",
    positionPlaceholder: "ej. Diseñador UX/UI", companyPlaceholder: "ej. Google (opcional)",
    jdLabel: "Descripción del puesto",
    jdPlaceholder: "Pega aquí el texto de la vacante: requisitos, responsabilidades, habilidades...",
    quickExamples: "Ejemplos rápidos:",
    numQLabel: "Número de preguntas", diffLabel: "Dificultad",
    diffOpts: [
      { key: "easy",   label: "Fácil",    sub: "Amigable"       },
      { key: "medium", label: "Estándar", sub: "Balanceado"     },
      { key: "hard",   label: "Difícil",  sub: "Big Tech Brutal"},
    ],
    recordLabel: "Grabarte en video",
    recordDesc: "Mira tu entrevista después · cuenta muletillas · revisa tu ritmo · 100% privado, no sale de tu dispositivo",
    startBtn: "Iniciar entrevista →", preparingBtn: "Preparando entrevistador...",
    settingUp: "Configurando tu entrevistador de IA...",
    coachTitle: "Tu coach", avgScore: "Puntaje promedio", totalInterviews: "Entrevistas totales",
    focusArea: "Área de enfoque:", quickDrill: "Ejercicio rápido · 3 preguntas →", preparingDrill: "Preparando...",
    liveLabel: "Entrevista en vivo", typingLabel: "· escribiendo...", speakingLabel: "· hablando...",
    voiceLabel: "🔊 Voz", voiceAuto: (n) => `Auto · mejor para ${n}`,
    answerPlaceholder: "Tu respuesta...", aiTypingPlaceholder: (n) => `${n} está escribiendo...`,
    endBtn: "Terminar entrevista y ver resultados",
    coachTipLabel: "💬 Consejo del coach", coachAnalyzing: "💬 coach analizando...",
    doneTitle: "Entrevista completa 🎉", evalFor: "Evaluación para",
    analyzingPerf: "Analizando tu desempeño...", scoreLabel: "Puntaje general",
    strengthsLabel: "Fortalezas", improvLabel: "Áreas de mejora",
    speechTitle: "🎤 Análisis del habla", wpmLabel: "Palabras / min",
    fillerLabel: "Muletillas", totalWordsLabel: "Total de palabras", cleanDelivery: "Entrega limpia",
    videoTitle: "📹 Revisión de video", downloadLabel: "⬇ Descargar",
    inFrameLabel: "En cuadro", eyeLabel: "Contacto visual",
    repeatBtn: "Repetir entrevista →", anotherBtn: "Practicar para otro puesto",
    pastLabel: "Entrevistas anteriores", clearLabel: "Borrar",
    weakLabels: {
      behavioral_specifics: "Ejemplos concretos (STAR)", technical_depth: "Profundidad técnica",
      communication_clarity: "Comunicación clara",       structuring_answers: "Estructura de respuestas",
      energy_engagement: "Energía y presencia",          confidence: "Confianza",
      job_alignment: "Alineación con el puesto",         filler_words: "Muletillas",
    },
  },
};

const SC = n => n >= 80 ? "great" : n >= 60 ? "ok" : "low";

/* ── AUDIO ANALYSIS (transcript-based, all local) ─────────────── */
const FILLER_WORDS = [
  "um", "uh", "uhm", "erm", "hmm",
  "like", "you know", "i mean", "i guess", "i think",
  "kind of", "kinda", "sort of", "sorta", "basically", "literally", "actually", "honestly",
  "este", "o sea", "pues", "como que", "tipo", "no sé", "este...",
];
function analyzeSpeech(userMessages, totalSeconds, lang = "en") {
  const joined = userMessages.map(m => m.content).join(" ").toLowerCase();
  const wordCount = (joined.match(/\b[\w']+\b/g) || []).length;
  const wpm = totalSeconds > 0 ? Math.round((wordCount / totalSeconds) * 60) : 0;
  const fillerHits = {};
  let fillerTotal = 0;
  for (const f of FILLER_WORDS) {
    const re = new RegExp(`\\b${f.replace(/\s+/g, "\\s+")}\\b`, "gi");
    const matches = joined.match(re);
    if (matches?.length) { fillerHits[f] = matches.length; fillerTotal += matches.length; }
  }
  const topFillers = Object.entries(fillerHits).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const sentences = joined.split(/[.!?]+/).filter(s => s.trim().length > 3);
  const lens = sentences.map(s => s.trim().split(/\s+/).length);
  const avgLen = lens.length ? lens.reduce((a, b) => a + b, 0) / lens.length : 0;
  const variance = lens.length ? lens.reduce((s, l) => s + (l - avgLen) ** 2, 0) / lens.length : 0;
  const energyHint = lang === "es"
    ? (variance < 4 ? "Intenta variar la longitud de tus oraciones — mezcla cortas y largas para mayor impacto"
      : variance > 60 ? "Buena variación en longitud de oraciones — mantiene la atención del oyente"
      : "Buen ritmo general en tus respuestas")
    : (variance < 4 ? "Try varying your sentence length — mix short and long for impact"
      : variance > 60 ? "Good variation in sentence length — keeps the listener engaged"
      : "Decent rhythm in your answers");
  return { wordCount, wpm, fillerTotal, topFillers, energyHint };
}
function paceLabel(wpm, lang = "en") {
  if (lang === "es") {
    if (wpm === 0) return { tone: "ok", text: "Sin datos de ritmo" };
    if (wpm < 110) return { tone: "low", text: "Muy lento — acelera el ritmo" };
    if (wpm < 140) return { tone: "ok", text: "Un poco lento" };
    if (wpm <= 170) return { tone: "great", text: "Ritmo perfecto" };
    if (wpm <= 200) return { tone: "ok", text: "Un poco rápido" };
    return { tone: "low", text: "Demasiado rápido — frena" };
  }
  if (wpm === 0) return { tone: "ok", text: "No pace data" };
  if (wpm < 110) return { tone: "low", text: "Too slow — pick up the pace" };
  if (wpm < 140) return { tone: "ok", text: "Slightly slow" };
  if (wpm <= 170) return { tone: "great", text: "On point" };
  if (wpm <= 200) return { tone: "ok", text: "A bit fast" };
  return { tone: "low", text: "Way too fast — slow down" };
}

/* ── FACE ANALYSIS (MediaPipe, runs entirely in the browser) ───── */
// Lazy-loaded once and shared across recordings.
let faceLandmarkerPromise = null;
async function loadFaceLandmarker() {
  if (faceLandmarkerPromise) return faceLandmarkerPromise;
  faceLandmarkerPromise = (async () => {
    const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
    );
    return FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
      },
      outputFaceBlendshapes: true,
      runningMode: "VIDEO",
      numFaces: 1,
    });
  })().catch(e => { faceLandmarkerPromise = null; throw e; });
  return faceLandmarkerPromise;
}

function presenceLabel(pct, lang = "en") {
  if (lang === "es") {
    if (pct >= 0.9) return { tone: "great", text: "Bien encuadrado" };
    if (pct >= 0.7) return { tone: "ok", text: "Saliste del cuadro ocasionalmente" };
    return { tone: "low", text: "Frecuentemente fuera de cuadro" };
  }
  if (pct >= 0.9) return { tone: "great", text: "Stayed in frame" };
  if (pct >= 0.7) return { tone: "ok", text: "Slipped out occasionally" };
  return { tone: "low", text: "Often out of frame" };
}
function eyeContactLabel(pct, lang = "en") {
  if (lang === "es") {
    if (pct >= 0.7) return { tone: "great", text: "Buen contacto visual" };
    if (pct >= 0.45) return { tone: "ok", text: "Aceptable, podría ser más directo" };
    return { tone: "low", text: "Desvías la mirada con frecuencia" };
  }
  if (pct >= 0.7) return { tone: "great", text: "Strong eye contact" };
  if (pct >= 0.45) return { tone: "ok", text: "Decent, could be more direct" };
  return { tone: "low", text: "Looking away too often" };
}

/* ── DIFFICULTY CONFIG ───────────────────────────────────────── */
const DIFF_STATIC = {
  easy:   { name: "Sam Rivera",   title: "HR Coordinator",                  label: "Easy",     emoji: "🟢", preferGender: "female", rate: 0.98 },
  medium: { name: "Jordan Mills", title: "Senior Talent Acquisition Manager", label: "Standard", emoji: "🟡", preferGender: "any",    rate: 0.95 },
  hard:   { name: "Morgan Price", title: "VP of Talent & Strategy",          label: "Hard",     emoji: "🔴", preferGender: "male",   rate: 0.92 },
};

function makePersona(diff, cmp, lang = "en") {
  const c = cmp || (lang === "es" ? "la empresa" : "the company");
  if (lang === "es") {
    if (diff === "easy") return `Eres Sam Rivera, coordinadora de RH amigable en ${c}. Genuinamente quieres ayudar a los candidatos a tener éxito y sentirse cómodos.
TU ESTILO: Cálida, alentadora, paciente. Das retroalimentación positiva frecuentemente. Haces seguimientos suaves como "¡Qué interesante! ¿Me puedes contar más sobre eso?" Si una respuesta es débil, das pistas amables. Toda la entrevista es completamente en español.`;
    if (diff === "medium") return `Eres Jordan Mills, Gerente Senior de Adquisición de Talento en ${c}. Profesional y justo.
TU ESTILO: Balanceado y profesional. Reconoces respuestas sólidas genuinamente. Profundizas buscando especificidad. No aceptas respuestas vagas pero no eres duro. Toda la entrevista es completamente en español.`;
    return `Eres Morgan Price, VP de Talento y Estrategia en ${c}. Solo contratas al top 5% y tus entrevistas son conocidas por ser muy difíciles.
TU ESTILO: Directo, escéptico, exigente. Cuestionas casi cada respuesta — incluso las buenas — para probar cómo el candidato maneja la presión. Pides métricas, números y resultados concretos. Si no los tienen, presionas: "¿Cuál fue el impacto real? ¿Cuáles fueron los números?" Frecuentemente preguntas "¿Por qué?" y "¿Y qué?" No eres cruel pero eres implacable. Toda la entrevista es completamente en español.`;
  }
  if (diff === "easy") return `You are Sam Rivera, a friendly HR Coordinator at ${c}. You genuinely want to help candidates succeed and feel comfortable.
YOUR STYLE: Warm, encouraging, patient. You give positive reinforcement often. You accept answers that show general relevant experience even without perfect specifics. You ask gentle follow-ups like "That's interesting — could you tell me a bit more about that?" You rarely push back hard; if an answer is weak, you give a hint: "Maybe think of a specific time when..." You celebrate good answers enthusiastically.`;
  if (diff === "medium") return `You are Jordan Mills, a Senior Talent Acquisition Manager at ${c}. Professional and fair.
YOUR STYLE: Balanced and professional. You acknowledge strong answers genuinely. You probe decent answers once for specifics. You don't accept vague non-answers but you're not harsh about it. You feel like a real workplace interview.`;
  return `You are Morgan Price, VP of Talent & Strategy at ${c}. You only hire the top 5% and your interviews are known to be tough.
YOUR STYLE: Direct, skeptical, demanding. You challenge almost every answer — even good ones — to test how candidates handle pressure. You ask for specific metrics, numbers, and outcomes. If they can't give you data, you push: "What was the actual impact? What were the numbers?" You frequently ask "Why?" and "So what?" after answers. You're not mean but you're relentless. Weak answers get responses like "I've heard that before — give me something specific that sets you apart."`;
}

/* ── APP ─────────────────────────────────────────────────────── */
export default function App() {
  const [phase, setPhase] = useState("setup");
  const [lang, setLang] = useState("en");
  const t = STRINGS[lang];
  const { history, addEntry, clearHistory } = useHistory();
  const { user, isLoaded: userLoaded } = CLERK_ENABLED ? useUser() : { user: null, isLoaded: true };
  const isPaid = !!user?.publicMetadata?.paid;

  // Auto-detect payment when user signs in
  useEffect(() => {
    if (!CLERK_ENABLED || !user || isPaid) return;
    fetch("/api/check-payment", { method: "POST" })
      .then(r => r.json())
      .then(d => { if (d.paid) window.location.reload(); })
      .catch(() => {});
  }, [user?.id]);

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

  // Video recording
  const [recordEnabled, setRecordEnabled] = useState(false);
  const [recordingActive, setRecordingActive] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [recordedMime, setRecordedMime] = useState(null);
  const [recordStart, setRecordStart] = useState(0);
  const [recordDuration, setRecordDuration] = useState(0);
  const [cameraErr, setCameraErr] = useState("");
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const previewVideoRef = useRef(null);
  const faceVideoRef = useRef(null);          // hidden <video> we sample from
  const faceTimerRef = useRef(null);
  const faceSamplesRef = useRef({ total: 0, present: 0, eyeContact: 0 });
  const [faceMetrics, setFaceMetrics] = useState(null);
  const [faceAnalysisActive, setFaceAnalysisActive] = useState(false);
  const [speechStats, setSpeechStats] = useState(null);
  const interviewStartRef = useRef(0);

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
  const jobRoleRef = useRef(null);
  const drillSystemRef = useRef(null);
  const { speak: rawSpeak, stop, speaking, unlock, voices } = useTTS();
  const { recording, supported: micOk, startRec, stopRec } = useSTT();

  // Selected voice (null = auto-pick best for persona)
  const [selectedVoiceURI, setSelectedVoiceURI] = useState(null);

  const speak = useCallback((text) => {
    const cfg = DIFF_STATIC[difficulty];
    const chosen = selectedVoiceURI ? voices.find(v => v.voiceURI === selectedVoiceURI) : null;
    const ttsLang = lang === "es" ? "es-MX" : "en-US";
    rawSpeak(text, { voice: chosen, preferGender: cfg.preferGender, rate: cfg.rate, lang: ttsLang });
  }, [rawSpeak, voices, selectedVoiceURI, difficulty, lang]);

  // Reset selected voice when language changes so auto-pick finds the right language
  useEffect(() => { setSelectedVoiceURI(null); }, [lang]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages, aiThinking]);

  const buildSystem = useCallback((opts = {}) => {
    const role = opts.role     ?? jobRole;
    const cmp  = opts.company  ?? company;
    const jd   = opts.jd       ?? jdText;
    const nq   = opts.numQ     ?? numQ;
    const diff = opts.difficulty ?? difficulty;
    const lng  = opts.lang ?? lang;
    const cfg  = DIFF_STATIC[diff];
    const firstQ = lng === "es"
      ? "Cuéntame sobre ti — tu trayectoria, experiencia más relevante y por qué te interesa este puesto."
      : "Tell me about yourself — your background, most relevant experience, and why you're interested in this role.";
    const rules = lng === "es"
      ? `REGLAS DE LA ENTREVISTA (sigue estrictamente):
- Al recibir [START]: preséntate como ${cfg.name}, ${cfg.title}, menciona el puesto y haz SIEMPRE esta primera pregunta exacta: "${firstQ}"
- Después de la primera respuesta, haz ${parseInt(nq) - 1} preguntas adicionales específicas a la descripción del puesto.
- Total: exactamente ${nq} preguntas principales.
- Reacciona a las respuestas según tu estilo de personalidad.
- Máximo 2 preguntas de seguimiento por pregunta principal antes de avanzar.
- Mantén tus turnos CORTOS: 1-3 oraciones. Esto es una conversación.
- Varía cómo empiezas cada respuesta — no repitas el mismo inicio.
- Cuando todas las ${nq} preguntas hayan sido respondidas: cierra la entrevista naturalmente y agrega exactamente "|||END|||" al final.
- Toda la entrevista debe ser completamente en español.`
      : `INTERVIEW RULES (follow strictly):
- When you receive [START]: introduce yourself as ${cfg.name}, ${cfg.title}, mention the role, and ALWAYS ask this exact first question: "${firstQ}"
- After the first answer, ask ${parseInt(nq) - 1} more questions specific to the job description.
- Total: exactly ${nq} main questions.
- React to answers according to your personality style above.
- Max 2 follow-up questions per main question before moving on.
- Keep your turns SHORT: 1-3 sentences. This is a conversation.
- Vary how you start each response — don't repeat the same opener.
- When all ${nq} main questions are answered: close the interview naturally (thank them, mention next steps) then append exactly "|||END|||" at the very end.`;
    return `${makePersona(diff, cmp, lng)}\n\n${lng === "es" ? `Descripción del puesto para ${role}` : `Job description for ${role}`}: ${jd}\n\n${rules}${lng === "es" ? "\n\nIMPORTANTE: Esta entrevista es COMPLETAMENTE en español. Sin importar en qué idioma esté escrita la descripción del puesto, TODAS tus respuestas, preguntas y comentarios deben ser en español. Nunca uses inglés." : ""}`;
  }, [jobRole, company, jdText, numQ, difficulty, lang]);

  /* ── SCRAPE JOB URL ── */
  const [scrapeNote, setScrapeNote] = useState("");
  const scrapeJob = async () => {
    if (!jobUrl.trim()) return;
    setScraping(true);
    setScrapeErr("");
    setScrapeNote("");
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
      if (data.note) setScrapeNote(data.note);
    } catch (e) {
      setScrapeErr(e.message);
    }
    setScraping(false);
  };

  /* ── START INTERVIEW ── */
  const startInterview = async (opts = {}) => {
    unlock();
    if (opts.role    !== undefined) setJobRole(opts.role);
    if (opts.company !== undefined) setCompany(opts.company);
    if (opts.jd      !== undefined) setJdText(opts.jd);
    setStartLoading(true);
    setStartErr("");
    setTips({}); setLoadingTips({});
    if (recordEnabled && !recordingActive) await startRecording();
    const trigger = [{ role: "user", content: "[START]" }];
    setDisplayMessages([{ role: "assistant", content: "", streaming: true }]);
    try {
      const text = await callAIStream(buildSystem(opts), trigger, 400, (partial) => {
        setDisplayMessages([{ role: "assistant", content: partial, streaming: true }]);
      });
      setApiMessages([...trigger, { role: "assistant", content: text }]);
      setDisplayMessages([{ role: "assistant", content: text, streaming: false }]);
      setPhase("interview");
      interviewStartRef.current = Date.now();
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
    const coachSystem = lang === "es"
      ? `Eres un coach de entrevistas conciso dando retroalimentación en tiempo real. El candidato acaba de responder una pregunta de entrevista.
Responde en exactamente 2 oraciones en español: primero, algo que hicieron bien (o reconoce si fue débil); segundo, la mejora más impactante que podrían hacer a esa respuesta específica.
Sé específico sobre lo que realmente dijeron — no des consejos genéricos. Sin viñetas, sin encabezados, solo 2 oraciones.`
      : `You are a concise interview coach giving real-time feedback. The candidate just answered an interview question.
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
      callAIStream(drillSystemRef.current || buildSystem(), newApi, 400, (partial) => {
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
    const elapsedSecs = interviewStartRef.current ? (Date.now() - interviewStartRef.current) / 1000 : 0;
    const userMsgsForStats = history.filter(m => m.role === "user" && m.content !== "[START]");
    setSpeechStats({ ...analyzeSpeech(userMsgsForStats, elapsedSecs, lang), totalSecs: elapsedSecs });
    if (recordingActive) {
      setRecordDuration((Date.now() - recordStart) / 1000);
      stopRecording();
    }

    const transcript = history
      .filter(m => m.content !== "[START]")
      .map(m => `${m.role === "assistant" ? "Interviewer" : "Candidate"}: ${m.content}`)
      .join("\n\n");

    const userAnswers = history.filter(m => m.role === "user" && m.content !== "[START]");
    const substantialAnswers = userAnswers.filter(m => m.content.trim().split(/\s+/).length >= 10);
    const totalQuestions = parseInt(numQ);
    const answeredRatio = userAnswers.length === 0 ? 0 : substantialAnswers.length / totalQuestions;

    const answerContext = userAnswers.length === 0
      ? `\n⚠️ CRITICAL: The candidate answered 0 questions — they said nothing. Score MUST be 10–20.`
      : substantialAnswers.length === 0
      ? `\n⚠️ CRITICAL: The candidate gave only one-word or empty responses to all questions. Score MUST be 15–30.`
      : answeredRatio < 0.4
      ? `\n⚠️ NOTE: The candidate only gave substantial answers to ${substantialAnswers.length} out of ${totalQuestions} questions. Penalize heavily — score should be 25–45 unless the answered questions were exceptional.`
      : "";

    const evalSystem =
      `You are an experienced interview coach evaluating a completed job interview for the ${jobRole} role at ${company || "the company"}.${answerContext}

Read the full transcript carefully and score the candidate honestly and fairly using this rubric:

SCORING RUBRIC:
- 10–25: Said nothing, refused to answer, or gave only 1-2 word responses
- 25–40: Very weak — almost no concrete examples, mostly silent or off-topic
- 40–52: Below average — some relevant points but mostly surface-level, little depth
- 52–63: Average — decent answers, shows relevant background, needs more specifics
- 63–73: Good — clear answers, uses real examples, demonstrates relevant experience
- 73–83: Very good — strong specific examples, structured thinking, addresses the role well
- 83–95: Excellent — exceptional depth, metrics/results mentioned, highly tailored to the role

CALIBRATION NOTES:
- If the candidate skipped questions or barely responded, their score cannot exceed 40.
- Someone who gives relevant, reasonably specific answers (even if not using perfect STAR format) deserves 60–70.
- Only give above 75 if the answers were genuinely impressive with real specifics and examples.
- Judge the SUBSTANCE of what was said, not the format or eloquence.
- Be honest — inflated scores help no one.

Also pick 1-3 weakAreas from this exact list (the codes, not the labels):
- behavioral_specifics (didn't give concrete real-life examples)
- technical_depth (didn't demonstrate depth on technical/professional topics)
- communication_clarity (rambled or was unclear)
- structuring_answers (answers lacked structure — no situation/task/action/result arc)
- energy_engagement (sounded flat, disengaged, low-energy)
- confidence (hedged, qualified everything, didn't own outcomes)
- job_alignment (didn't connect background to this specific role)
- filler_words (excessive "um", "like", "you know", "I think")

Respond ONLY with valid JSON, no extra text or markdown:
{"puntaje":65,"nivel":"Good candidate","fortalezas":["concrete strength 1","concrete strength 2"],"mejoras":["specific improvement 1","specific improvement 2"],"recomendacion":"honest, actionable advice in 1-2 sentences","weakAreas":["behavioral_specifics","communication_clarity"]}`;

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
          weakAreas: Array.isArray(ev.weakAreas) ? ev.weakAreas : [],
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
      startRec(chunk => setInputText(prev => prev + chunk), lang === "es" ? "es-MX" : "en-US");
    }
  };

  /* ── QUICK DRILL ── */
  // Mini-interview: 3 questions focused on the user's weakest area, no setup needed.
  const startDrill = async (weakAreaCode) => {
    const area = WEAK_AREAS[weakAreaCode];
    if (!area) return;
    unlock();
    const lastRole = history[0]?.role || "your target role";
    const lastCompany = history[0]?.company || "the company";
    setJobRole(lastRole);
    setCompany(lastCompany);
    setJdText(`Quick drill focused on: ${area.label}`);
    setDifficulty("medium");
    setStartLoading(true);
    setStartErr("");
    setTips({}); setLoadingTips({});
    if (recordEnabled && !recordingActive) await startRecording();

    const weakLabel = (t.weakLabels[weakAreaCode] || area.label).toLowerCase();
    const drillSystem = lang === "es"
      ? `${makePersona("medium", lastCompany, "es")}

Estás haciendo un EJERCICIO CORTO ENFOCADO en el área débil conocida del candidato: ${weakLabel}.

REGLAS DEL EJERCICIO:
- Haz exactamente 3 preguntas, todas enfocadas en esta área: ${weakLabel}.
- Intro breve: "Hola, soy Jordan. Ejercicio rápido de 3 preguntas enfocado en ${weakLabel}."
- Sin seguimientos. Avanza después de cada respuesta.
- Reacciona brevemente a cada respuesta (1 oración) antes de la siguiente.
- Después de la pregunta 3: cierra con una oración de retroalimentación y agrega "|||END|||" al final.
- Mantén tus turnos CORTOS: 1-3 oraciones. Toda la sesión en español.`
      : `${makePersona("medium", lastCompany, "en")}

You are running a SHORT FOCUSED DRILL on the candidate's known weak area: ${area.label}.

DRILL RULES:
- Ask exactly 3 questions, all targeting this weak area: ${area.label}.
- Opening question idea: "${area.drill}"
- Brief intro: "Hey, I'm Jordan. Quick 3-question drill focused on ${area.label.toLowerCase()}."
- No follow-ups. Move on after each answer.
- React briefly to each answer (1 sentence) before the next question.
- After question 3 is answered: close with one sentence of summary feedback and append "|||END|||" at the very end.
- Keep your turns SHORT: 1-3 sentences each.`;

    const trigger = [{ role: "user", content: "[START]" }];
    setDisplayMessages([{ role: "assistant", content: "", streaming: true }]);
    try {
      const text = await callAIStream(drillSystem, trigger, 400, (partial) => {
        setDisplayMessages([{ role: "assistant", content: partial, streaming: true }]);
      });
      setApiMessages([...trigger, { role: "assistant", content: text }]);
      setDisplayMessages([{ role: "assistant", content: text, streaming: false }]);
      setPhase("interview");
      interviewStartRef.current = Date.now();
      // Override buildSystem for subsequent turns by stashing the drill system on a ref
      drillSystemRef.current = drillSystem;
      speak(text);
    } catch (e) {
      setDisplayMessages([]);
      setStartErr("Error starting drill: " + e.message);
    }
    setStartLoading(false);
  };

  /* ── VIDEO RECORDING ── */
  const stopFaceAnalysis = useCallback(() => {
    if (faceTimerRef.current) {
      clearTimeout(faceTimerRef.current);
      faceTimerRef.current = null;
    }
    if (faceVideoRef.current) {
      try { faceVideoRef.current.pause(); } catch {}
      faceVideoRef.current.srcObject = null;
      faceVideoRef.current = null;
    }
    const { total, present, eyeContact } = faceSamplesRef.current;
    if (total > 5) {
      setFaceMetrics({
        samples: total,
        presence: present / total,
        eyeContact: present > 0 ? eyeContact / present : 0,
      });
    }
    setFaceAnalysisActive(false);
  }, []);

  const startFaceAnalysis = useCallback(async (stream) => {
    faceSamplesRef.current = { total: 0, present: 0, eyeContact: 0 };
    setFaceAnalysisActive(true);
    let landmarker;
    try {
      landmarker = await loadFaceLandmarker();
    } catch (e) {
      // Model failed to load — keep recording, just skip visual analysis.
      setFaceAnalysisActive(false);
      return;
    }
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;
    try { await video.play(); } catch {}
    faceVideoRef.current = video;

    const sample = () => {
      if (!faceVideoRef.current) return;
      try {
        const now = performance.now();
        const result = landmarker.detectForVideo(video, now);
        faceSamplesRef.current.total++;
        if (result.faceLandmarks?.length > 0) {
          faceSamplesRef.current.present++;
          // Estimate eye contact from the eyeLook* blendshapes — if all are low,
          // the user's eyes are pointed roughly at the camera.
          const cats = result.faceBlendshapes?.[0]?.categories || [];
          const lookMax = cats
            .filter(c => c.categoryName?.startsWith("eyeLook"))
            .reduce((m, c) => Math.max(m, c.score), 0);
          if (lookMax < 0.4) faceSamplesRef.current.eyeContact++;
        }
      } catch {}
      // ~3 Hz sampling keeps CPU light even on mid-range mobile
      faceTimerRef.current = setTimeout(sample, 320);
    };
    sample();
  }, []);

  const stopRecording = useCallback(() => {
    try { mediaRecorderRef.current?.state === "recording" && mediaRecorderRef.current.stop(); } catch {}
    stopFaceAnalysis();
    mediaStreamRef.current?.getTracks().forEach(t => { try { t.stop(); } catch {} });
    mediaStreamRef.current = null;
    setRecordingActive(false);
  }, [stopFaceAnalysis]);

  const startRecording = useCallback(async () => {
    setCameraErr("");
    setFaceMetrics(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setCameraErr("Your browser doesn't support video recording.");
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: true,
      });
      mediaStreamRef.current = stream;
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream;
        previewVideoRef.current.play().catch(() => {});
      }
      recordedChunksRef.current = [];
      // Pick the best supported mime — webm on Chrome/Android, mp4 on iOS Safari
      const candidates = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"];
      const mime = candidates.find(c => MediaRecorder.isTypeSupported(c)) || "";
      const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      recorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        if (recordedChunksRef.current.length === 0) return;
        const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(prev => { if (prev) URL.revokeObjectURL(prev); return url; });
        setRecordedMime(recorder.mimeType);
      };
      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setRecordStart(Date.now());
      setRecordingActive(true);
      // Fire and forget — analysis loop runs alongside the recording
      startFaceAnalysis(stream);
      return true;
    } catch (e) {
      setCameraErr("Couldn't access camera/microphone. Allow permissions and try again.");
      return false;
    }
  }, [startFaceAnalysis]);

  const restart = () => {
    stop(); stopRec();
    stopRecording();
    if (recordedUrl) { try { URL.revokeObjectURL(recordedUrl); } catch {} }
    setPhase("setup");
    setJobRole(""); setCompany(""); setJdText(""); setDifficulty("medium");
    setApiMessages([]); setDisplayMessages([]);
    setInputText(""); setEvaluation(null);
    setStartErr(""); setInterviewErr("");
    setTips({}); setLoadingTips({});
    setRecordedUrl(null); setRecordedMime(null); setRecordDuration(0);
    setCameraErr(""); setFaceMetrics(null);
    setSpeechStats(null);
    drillSystemRef.current = null;
  };

  // Stop any active stream when the component unmounts
  useEffect(() => () => {
    mediaStreamRef.current?.getTracks().forEach(t => { try { t.stop(); } catch {} });
  }, []);

  const insights = computeInsights(history);

  const pi = phase === "setup" ? 0 : phase === "interview" ? 1 : 2;

  return (
    <>
      <Head>
        <title>Practice interview · InterviewHub</title>
        <meta name="description" content="Practice your interview with an AI interviewer that speaks, listens, and pushes back on weak answers." />
        <meta name="theme-color" content="#07080f" />
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E🎙%3C/text%3E%3C/svg%3E" />
      </Head>
      <style>{css}</style>
      <div className="shell">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Link href="/" className="back-link" style={{ marginBottom: 0 }}>← InterviewHub</Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => setLang(l => l === "en" ? "es" : "en")}
              style={{ fontFamily: "'Syne',sans-serif", fontSize: ".88rem", fontWeight: 700, color: "#fff", background: "linear-gradient(135deg,#2020a0,#4040cc)", border: "none", borderRadius: 10, padding: "10px 20px", cursor: "pointer", transition: "all .2s", letterSpacing: ".01em" }}
            >
              {lang === "en" ? "🌐 Español" : "🌐 English"}
            </button>
            {CLERK_ENABLED && (
              user
                ? <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {isPaid && <span style={{ fontFamily: "'DM Mono',monospace", fontSize: ".68rem", color: "#6060cc", background: "#0d0d22", border: "1px solid #2a2a50", borderRadius: 6, padding: "3px 8px" }}>PRO</span>}
                    <UserButton afterSignOutUrl="/" />
                  </div>
                : <SignInButton mode="modal">
                    <button style={{ fontFamily: "'Syne',sans-serif", fontSize: ".82rem", fontWeight: 700, color: "#fff", background: "#0d0d22", border: "1px solid #2a2a50", borderRadius: 10, padding: "10px 16px", cursor: "pointer" }}>
                      {lang === "en" ? "Sign in" : "Iniciar sesión"}
                    </button>
                  </SignInButton>
            )}
          </div>
        </div>
        <div className="hd">
          <div className="hd-tag">{t.tag}</div>
          <div className="hd-title">{t.title}</div>
          <div className="hd-sub">{t.subtitle}</div>
        </div>

        <div className="steps">
          {t.steps.map((lbl, i) => (
            <div key={i} className={`step-btn${i < pi ? " done" : i === pi ? " active" : ""}`}>
              <div className="step-num">{i < pi ? "✓" : i + 1}</div>
              {lbl}
            </div>
          ))}
        </div>

        {/* ── COACH INSIGHTS ── */}
        {phase === "setup" && insights && insights.totalInterviews > 0 && (
          <div className="coach-card">
            <div className="coach-head">
              <span className="coach-title">{t.coachTitle}</span>
              {insights.streak > 0 && (
                <span className="coach-streak">🔥 {insights.streak}-day streak</span>
              )}
            </div>
            <div className="coach-stats">
              <div className="coach-stat">
                <div className="coach-stat-val">{insights.avg}</div>
                <div className="coach-stat-lbl">{t.avgScore}</div>
              </div>
              <div className="coach-stat">
                <div className="coach-stat-val">{insights.totalInterviews}</div>
                <div className="coach-stat-lbl">{t.totalInterviews}</div>
              </div>
            </div>
            {insights.topWeak && WEAK_AREAS[insights.topWeak] && (
              <>
                <div className="coach-weak">
                  <span className="coach-weak-lbl">{t.focusArea}</span>
                  <span className="coach-weak-val">{t.weakLabels[insights.topWeak] || WEAK_AREAS[insights.topWeak].label}</span>
                </div>
                {isPaid ? (
                  <button
                    className="btn"
                    style={{ marginTop: 10 }}
                    onClick={() => startDrill(insights.topWeak)}
                    disabled={startLoading}
                  >
                    {startLoading ? t.preparingDrill : t.quickDrill}
                  </button>
                ) : (
                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 14px", background: "#0a0a1f", border: "1px solid #2a2a50", borderRadius: 10 }}>
                    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: ".75rem", color: "#ccc" }}>
                      🔒 {lang === "es" ? "Ejercicios de práctica — solo Pro" : "Quick drills — Pro only"}
                    </div>
                    <a href={STRIPE_LINK} style={{ flexShrink: 0, padding: "7px 12px", borderRadius: 8, background: "linear-gradient(135deg,#2020a0,#4040cc)", color: "#fff", fontFamily: "'Syne',sans-serif", fontSize: ".75rem", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
                      {lang === "es" ? "Obtener Pro →" : "Get Pro →"}
                    </a>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── SETUP ── */}
        {phase === "setup" && (
          <div className="card" key="setup">
            <div className="card-title">{t.setupTitle}</div>
            <div className="card-desc">{t.setupDesc}</div>

            {isPaid ? (
              <>
                <div className="url-bar">
                  <input
                    className="url-input"
                    value={jobUrl}
                    onChange={e => { setJobUrl(e.target.value); setScrapeErr(""); setScrapeNote(""); }}
                    onKeyDown={e => e.key === "Enter" && scrapeJob()}
                    placeholder={t.urlPlaceholder}
                  />
                  <button className="url-btn" onClick={scrapeJob} disabled={scraping || !jobUrl.trim()}>
                    {scraping ? t.urlAnalyzing : t.urlBtn}
                  </button>
                </div>
                {scraping && (
                  <div className="loader" style={{ marginTop: -10, marginBottom: 10 }}>
                    <div className="dot" /><div className="dot" /><div className="dot" />
                    {t.readingJob}
                  </div>
                )}
                {scrapeErr && <div className="err-box" style={{ marginTop: -10, marginBottom: 14 }}>{scrapeErr}</div>}
                {scrapeNote && <div className="tip-box" style={{ marginTop: -10, marginBottom: 14 }}>💡 {scrapeNote}</div>}
              </>
            ) : (
              <div style={{ background: "#0a0a18", border: "1px solid #1a1a30", borderRadius: 12, padding: "14px 16px", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: ".72rem", color: "#4040a0", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 4 }}>🔒 PRO</div>
                  <div style={{ fontSize: ".82rem", color: "#ccc", fontFamily: "'DM Mono',monospace" }}>
                    {lang === "es" ? "Análisis de vacantes con URL — solo para Pro" : "Job URL analyzer — Pro only"}
                  </div>
                </div>
                <a href={STRIPE_LINK} style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 8, background: "linear-gradient(135deg,#2020a0,#4040cc)", color: "#fff", fontFamily: "'Syne',sans-serif", fontSize: ".78rem", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
                  {lang === "es" ? "Obtener Pro →" : "Get Pro →"}
                </a>
              </div>
            )}

            <div className="url-divider">
              <div className="url-divider-line" />
              <div className="url-divider-text">{t.orFill}</div>
              <div className="url-divider-line" />
            </div>

            <div className="row">
              <div className="field">
                <label>{t.positionLabel}</label>
                <input ref={jobRoleRef} value={jobRole} onChange={e => setJobRole(e.target.value)} placeholder={t.positionPlaceholder} />
              </div>
              <div className="field">
                <label>{t.companyLabel}</label>
                <input value={company} onChange={e => setCompany(e.target.value)} placeholder={t.companyPlaceholder} />
              </div>
            </div>
            <div className="field">
              <label>{t.jdLabel}</label>
              <textarea
                rows={6}
                placeholder={t.jdPlaceholder}
                value={jdText}
                onChange={e => setJdText(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: ".7rem", color: "#ccc", fontFamily: "'DM Mono',monospace", marginBottom: 8 }}>{t.quickExamples}</div>
              {EXAMPLES[lang].map(ex => (
                <span key={ex.role} className="badge" onClick={() => { setJobRole(ex.role); setCompany(ex.company); setJdText(ex.jd); }}>
                  {ex.role}
                </span>
              ))}
            </div>
            <div className="field" style={{ maxWidth: 220 }}>
              <label>{t.numQLabel}</label>
              <select value={numQ} onChange={e => setNumQ(e.target.value)}>
                <option value="3">3 — {lang === "es" ? "Rápida" : "Quick"}</option>
                <option value="5">5 — {lang === "es" ? "Estándar" : "Standard"}</option>
                {isPaid ? (
                  <option value="7">7 — {lang === "es" ? "Completa" : "Full"}</option>
                ) : (
                  <option value="7" disabled>7 — {lang === "es" ? "Completa [PRO]" : "Full [PRO]"}</option>
                )}
                {isPaid ? (
                  <option value="10">10 — {lang === "es" ? "Intensiva" : "Intensive"}</option>
                ) : (
                  <option value="10" disabled>10 — {lang === "es" ? "Intensiva [PRO]" : "Intensive [PRO]"}</option>
                )}
              </select>
            </div>
            <div className="field">
              <label>{t.diffLabel}</label>
              <div className="diff-row">
                {t.diffOpts.map(({ key, label, sub }) => {
                  const isLocked = !isPaid && (key === "easy" || key === "hard");
                  return (
                    <button
                      key={key}
                      className={`diff-pill ${key}${difficulty === key ? " active" : ""}${isLocked ? " locked" : ""}`}
                      style={isLocked ? { opacity: 0.55, position: "relative" } : {}}
                      onClick={() => {
                        if (isLocked) return;
                        setDifficulty(key);
                      }}
                      title={isLocked ? (lang === "es" ? "Requiere Pro" : "Requires Pro") : undefined}
                    >
                      {isLocked ? "🔒" : DIFF_STATIC[key].emoji} {label}
                      <div className="diff-sub">{isLocked ? (lang === "es" ? "Solo Pro" : "Pro only") : sub}</div>
                    </button>
                  );
                })}
              </div>
              {!isPaid && (difficulty === "easy" || difficulty === "hard") && (
                <div style={{ marginTop: 8, padding: "10px 14px", background: "#0a0a1f", border: "1px solid #2a2a50", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: ".75rem", color: "#ccc" }}>
                    {lang === "es" ? "🔒 Esta dificultad requiere Pro" : "🔒 This difficulty requires Pro"}
                  </div>
                  <a href={STRIPE_LINK} style={{ flexShrink: 0, padding: "7px 12px", borderRadius: 8, background: "linear-gradient(135deg,#2020a0,#4040cc)", color: "#fff", fontFamily: "'Syne',sans-serif", fontSize: ".75rem", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
                    {lang === "es" ? "Obtener Pro →" : "Get Pro →"}
                  </a>
                </div>
              )}
            </div>

            {isPaid ? (
              <div
                className={`record-toggle${recordEnabled ? " on" : ""}`}
                onClick={() => setRecordEnabled(v => !v)}
              >
                <div className="record-toggle-icon">{recordEnabled ? "🔴" : "📹"}</div>
                <div className="record-toggle-text">
                  <strong>{t.recordLabel}</strong>
                  <span>{t.recordDesc}</span>
                </div>
                <div className={`record-toggle-switch${recordEnabled ? " on" : ""}`}>
                  <div className="record-toggle-knob" />
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 16px", background: "#080812", border: "1px solid #1a1a30", borderRadius: 12, marginBottom: 18 }}>
                <div>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: ".72rem", color: "#4040a0", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 4 }}>🔒 PRO — {lang === "es" ? "Revisión de video" : "Video review"}</div>
                  <div style={{ fontSize: ".78rem", color: "#ccc", fontFamily: "'DM Mono',monospace" }}>
                    {lang === "es" ? "Grábate y analiza tu ritmo y muletillas" : "Record yourself and analyze pace & filler words"}
                  </div>
                </div>
                <a href={STRIPE_LINK} style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 8, background: "linear-gradient(135deg,#2020a0,#4040cc)", color: "#fff", fontFamily: "'Syne',sans-serif", fontSize: ".78rem", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
                  {lang === "es" ? "Obtener Pro →" : "Get Pro →"}
                </a>
              </div>
            )}
            {cameraErr && <div className="err-box" style={{ marginTop: -8, marginBottom: 14 }}>{cameraErr}</div>}

            <button className="btn" onClick={startInterview} disabled={startLoading || !jobRole.trim() || !jdText.trim()}>
              {startLoading ? t.preparingBtn : t.startBtn}
            </button>
            {startLoading && (
              <div className="loader">
                <div className="dot" /><div className="dot" /><div className="dot" />
                {t.settingUp}
              </div>
            )}
            {startErr && <div className="err-box">{startErr}</div>}
          </div>
        )}

        {/* ── INTERVIEW ── */}
        {phase === "interview" && (
          <div className="card" key="interview">
            {recordingActive && (
              <div className="cam-preview">
                <video ref={previewVideoRef} muted playsInline />
                <div className="cam-rec-dot" />
              </div>
            )}
            {/* Interviewer presence card */}
            {(() => {
              const cfg = DIFF_STATIC[difficulty];
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
                    <div className="iv-title">{cfg.title} · {company || (lang === "es" ? "Empresa" : "Company")}</div>
                    <div className="iv-status">
                      <div className="iv-dot" />
                      <span className="iv-live">{t.liveLabel}</span>
                      <span className="iv-typing">
                        {isStreaming ? t.typingLabel : speaking ? t.speakingLabel : ""}
                      </span>
                    </div>
                  </div>
                  <span className={`diff-badge ${difficulty}`}>{cfg.emoji} {t.diffOpts.find(d => d.key === difficulty)?.label || cfg.label}</span>
                </div>
              );
            })()}

            {/* Voice picker */}
            {voices.length > 0 && (() => {
              const cfg = DIFF_STATIC[difficulty];
              const ttsLangPrefix = lang === "es" ? "es" : "en";
              const filteredVoices = voices.filter(v => v.lang?.startsWith(ttsLangPrefix));
              const topVoices = [...filteredVoices].sort((a, b) => rankVoice(b) - rankVoice(a)).slice(0, 10);
              const preview = () => {
                unlock();
                speak(lang === "es"
                  ? `Hola, soy ${cfg.name.split(" ")[0]}, tu entrevistador hoy.`
                  : `Hi, I'm ${cfg.name.split(" ")[0]}, your interviewer today.`);
              };
              return (
                <div className="voice-row">
                  <span className="voice-label">{t.voiceLabel}</span>
                  <select
                    className="voice-select"
                    value={selectedVoiceURI || ""}
                    onChange={e => setSelectedVoiceURI(e.target.value || null)}
                  >
                    <option value="">{t.voiceAuto(cfg.name.split(" ")[0])}</option>
                    {topVoices.map(v => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} {v.lang !== (lang === "es" ? "es-MX" : "en-US") ? `(${v.lang})` : ""}
                      </option>
                    ))}
                  </select>
                  <button className="voice-preview" onClick={preview} disabled={speaking}>
                    ▶
                  </button>
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
                    <div className="coach-tip-loading">{t.coachAnalyzing}</div>
                  )}
                  {msg.role === "user" && tips[i] && (
                    <div className="coach-tip">
                      <div className="coach-tip-label">{t.coachTipLabel}</div>
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
                placeholder={aiThinking ? t.aiTypingPlaceholder(DIFF_STATIC[difficulty].name.split(" ")[0]) : t.answerPlaceholder}
                disabled={aiThinking}
              />
              <button className="send-btn" onClick={() => sendMessage(inputText)} disabled={aiThinking || !inputText.trim()}>
                ➤
              </button>
            </div>

            {recording && (
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:".68rem", color:"#c060ff", textAlign:"center", marginTop:6 }}>
                🔴 {lang === "es" ? "Grabando — para y luego envía" : "Recording — tap stop, then send"}
              </div>
            )}

            <button className="end-btn" onClick={() => finishInterview(apiMessages)}>
              {t.endBtn}
            </button>
          </div>
        )}

        {/* ── RESULTS ── */}
        {phase === "done" && (
          <div className="card" key="done">
            <div className="card-title">{t.doneTitle}</div>
            <div className="card-desc" style={{ marginBottom: 20 }}>
              {t.evalFor} <strong style={{ color: "#eeeeff" }}>{jobRole}</strong>{company ? ` · ${company}` : ""}
            </div>

            {evalLoading && (
              <div className="loader">
                <div className="dot" /><div className="dot" /><div className="dot" />
                {t.analyzingPerf}
              </div>
            )}

            {evaluation && (
              <>
                <div className="summary-bar">
                  <div className={`summary-ring ${SC(evaluation.puntaje)}`}>{evaluation.puntaje}</div>
                  <div>
                    <div className="summary-label">{t.scoreLabel}</div>
                    <div className="summary-val">{evaluation.nivel}</div>
                  </div>
                </div>
                <div className="fb">
                  <div className="fb-head">{t.strengthsLabel}</div>
                  <div className="fb-body">
                    {evaluation.fortalezas?.map((f, i) => (
                      <div className="li" key={i}><span className="li-dot" style={{ color: "#4ecc96" }}>✓</span>{f}</div>
                    ))}
                  </div>
                </div>
                <div className="fb">
                  <div className="fb-head">{t.improvLabel}</div>
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

            {/* ── SPEECH ANALYTICS (always shown) ── */}
            {speechStats && (() => {
              const pace = paceLabel(speechStats.wpm, lang);
              return (
                <div className="video-review">
                  <div className="video-review-head">
                    <span className="video-review-title">{t.speechTitle}</span>
                  </div>
                  <div className="video-stats">
                    <div className="video-stat">
                      <div className={`video-stat-val ${pace.tone}`}>{speechStats.wpm || "—"}</div>
                      <div className="video-stat-lbl">{t.wpmLabel}</div>
                      <div className="video-stat-sub">{pace.text}</div>
                    </div>
                    <div className="video-stat">
                      <div className={`video-stat-val ${speechStats.fillerTotal === 0 ? "great" : speechStats.fillerTotal < 6 ? "ok" : "low"}`}>
                        {speechStats.fillerTotal}
                      </div>
                      <div className="video-stat-lbl">{t.fillerLabel}</div>
                      <div className="video-stat-sub">
                        {speechStats.topFillers.length === 0 ? t.cleanDelivery : speechStats.topFillers.map(([w, n]) => `"${w}" ×${n}`).join(", ")}
                      </div>
                    </div>
                    <div className="video-stat">
                      <div className="video-stat-val">{speechStats.wordCount}</div>
                      <div className="video-stat-lbl">{t.totalWordsLabel}</div>
                      <div className="video-stat-sub">in {Math.round(speechStats.totalSecs)}s</div>
                    </div>
                  </div>
                  <div className="tip-box" style={{ marginTop: 0, marginBottom: 0 }}>
                    🎤 {speechStats.energyHint}
                  </div>
                </div>
              );
            })()}

            {/* ── VIDEO REVIEW ── */}
            {recordedUrl && (
              <div className="video-review">
                <div className="video-review-head">
                  <span className="video-review-title">{t.videoTitle}</span>
                  <a
                    href={recordedUrl}
                    download={`interview-${new Date().toISOString().slice(0,10)}.${recordedMime?.includes("mp4") ? "mp4" : "webm"}`}
                    className="video-review-dl"
                  >
                    {t.downloadLabel}
                  </a>
                </div>
                <video src={recordedUrl} controls playsInline className="video-review-player" />
                {faceMetrics && faceMetrics.samples > 5 && (() => {
                  const pres = presenceLabel(faceMetrics.presence, lang);
                  const eye = eyeContactLabel(faceMetrics.eyeContact, lang);
                  return (
                    <div className="video-stats">
                      <div className="video-stat">
                        <div className={`video-stat-val ${pres.tone}`}>{Math.round(faceMetrics.presence * 100)}%</div>
                        <div className="video-stat-lbl">{t.inFrameLabel}</div>
                        <div className="video-stat-sub">{pres.text}</div>
                      </div>
                      <div className="video-stat">
                        <div className={`video-stat-val ${eye.tone}`}>{Math.round(faceMetrics.eyeContact * 100)}%</div>
                        <div className="video-stat-lbl">{t.eyeLabel}</div>
                        <div className="video-stat-sub">{eye.text}</div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            <button className="btn" onClick={startInterview} disabled={startLoading}>
              {startLoading ? t.preparingDrill : t.repeatBtn}
            </button>
            <button className="btn-ghost" onClick={restart}>{t.anotherBtn}</button>
          </div>
        )}

        {/* ── HISTORY ── */}
        {phase === "setup" && history.length > 0 && (
          <div className="hist-panel">
            <div className="hist-title">
              {t.pastLabel}
              <button className="hist-clear" onClick={clearHistory}>{t.clearLabel}</button>
            </div>
            <div className="hist-list">
              {history.map((h, i) => {
                const sc = h.score >= 80 ? "great" : h.score >= 60 ? "ok" : "low";
                const locale = lang === "es" ? "es-MX" : "en-US";
                const date = new Date(h.date).toLocaleDateString(locale, { month: "short", day: "numeric" });
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
