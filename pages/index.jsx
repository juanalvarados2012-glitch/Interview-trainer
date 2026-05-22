import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

const CLERK_ENABLED = typeof process !== "undefined" && !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{font-family:'Syne',sans-serif;background:#07080f;color:#eeeeff;overflow-x:hidden}

  /* ── NAV ── */
  nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:16px 40px;background:rgba(7,8,15,.85);backdrop-filter:blur(12px);border-bottom:1px solid #0f0f20}
  .nav-logo{font-size:1.1rem;font-weight:800;letter-spacing:-.02em;background:linear-gradient(135deg,#8080ff,#4040cc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;text-decoration:none}
  .nav-actions{display:flex;align-items:center;gap:10px}
  .nav-link{font-family:'DM Mono',monospace;font-size:.78rem;color:#444;text-decoration:none;padding:8px 12px;border-radius:8px;transition:all .2s}
  .nav-link:hover{color:#9090ff;background:#0d0d20}
  .nav-cta{padding:9px 20px;border-radius:9px;background:linear-gradient(135deg,#2020a0,#4040cc);color:#fff;font-family:'Syne',sans-serif;font-size:.82rem;font-weight:700;text-decoration:none;transition:opacity .2s;border:none;cursor:pointer}
  .nav-cta:hover{opacity:.85}
  .nav-lang{padding:9px 18px;border-radius:9px;background:linear-gradient(135deg,#1a1a60,#3030a0);border:1px solid #4040cc;color:#fff;font-family:'Syne',sans-serif;font-size:.82rem;font-weight:700;cursor:pointer;transition:all .2s;white-space:nowrap;box-shadow:0 2px 12px #3030a030}
  .nav-lang:hover{opacity:.85;transform:translateY(-1px)}

  /* ── HERO ── */
  .hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:120px 24px 80px;text-align:center;position:relative;overflow:hidden}
  .hero-glow{position:absolute;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,#1a1a6040 0%,transparent 70%);top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none}
  .hero-tag{display:inline-flex;align-items:center;gap:8px;background:#0d0d22;border:1px solid #1a1a40;border-radius:20px;padding:6px 14px;font-family:'DM Mono',monospace;font-size:.72rem;color:#6060cc;margin-bottom:28px;letter-spacing:.06em}
  .hero-tag-dot{width:6px;height:6px;border-radius:50%;background:#4ecc96;animation:pulse 2s infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
  h1{font-size:clamp(2.8rem,7vw,5.5rem);font-weight:800;letter-spacing:-.04em;line-height:1.05;margin-bottom:24px;max-width:820px}
  .gradient-text{background:linear-gradient(135deg,#eeeeff 0%,#8080ff 50%,#4040cc 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .hero-sub{font-family:'DM Mono',monospace;font-size:clamp(.85rem,2vw,1rem);color:#555;line-height:1.7;max-width:560px;margin-bottom:40px}
  .hero-btns{display:flex;flex-direction:column;align-items:center;gap:12px;margin-bottom:24px;width:100%;max-width:400px}
  .btn-primary{width:100%;padding:16px 32px;border-radius:12px;background:linear-gradient(135deg,#2020a0,#5050dd);color:#fff;font-family:'Syne',sans-serif;font-size:1rem;font-weight:700;text-decoration:none;transition:all .2s;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px}
  .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 32px #3030a040}
  .btn-coming{width:100%;padding:16px 32px;border-radius:12px;border:1px solid #1a1a35;background:#0a0a18;color:#333;font-family:'Syne',sans-serif;font-size:1rem;font-weight:700;display:flex;align-items:center;justify-content:center;gap:10px;cursor:default;position:relative}
  .coming-badge{background:#0d0d22;border:1px solid #2a2a50;border-radius:20px;padding:3px 10px;font-family:'DM Mono',monospace;font-size:.65rem;color:#4040a0;letter-spacing:.06em}
  .hero-free-note{font-family:'DM Mono',monospace;font-size:.72rem;color:#333;line-height:1.6;max-width:380px;text-align:center}
  .hero-proof{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:20px;font-family:'DM Mono',monospace;font-size:.72rem;color:#333;margin-top:16px}
  .hero-proof-item{display:flex;align-items:center;gap:5px}

  /* ── DEMO WINDOW ── */
  .demo-wrap{width:100%;max-width:660px;margin:0 auto 100px;position:relative;padding:0 24px}
  .demo-window{background:#0a0a18;border:1px solid #1a1a30;border-radius:20px;overflow:hidden;box-shadow:0 40px 80px #00000080}
  .demo-bar{background:#0d0d22;padding:12px 16px;display:flex;align-items:center;gap:8px;border-bottom:1px solid #1a1a30}
  .demo-dot{width:10px;height:10px;border-radius:50%}
  .demo-title{font-family:'DM Mono',monospace;font-size:.72rem;color:#333;margin-left:8px}
  .demo-body{padding:20px}
  .demo-iv-card{background:#080812;border:1px solid #1a1a30;border-radius:14px;padding:14px 16px;display:flex;align-items:center;gap:12px;margin-bottom:14px}
  .demo-avatar{width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,#1a1a50,#3030a0);display:flex;align-items:center;justify-content:center;font-size:.9rem;font-weight:800;color:#fff;flex-shrink:0}
  .demo-iv-name{font-size:.88rem;font-weight:700;margin-bottom:2px}
  .demo-iv-sub{font-family:'DM Mono',monospace;font-size:.65rem;color:#444}
  .demo-live{display:flex;align-items:center;gap:6px;margin-top:4px}
  .demo-live-dot{width:5px;height:5px;border-radius:50%;background:#4ecc96;animation:pulse 2s infinite}
  .demo-live-txt{font-family:'DM Mono',monospace;font-size:.6rem;color:#4ecc96;text-transform:uppercase;letter-spacing:.08em}
  .demo-msgs{display:flex;flex-direction:column;gap:8px;margin-bottom:12px}
  .demo-msg-ai{display:flex;gap:8px}
  .demo-msg-user{display:flex;gap:8px;flex-direction:row-reverse}
  .demo-bubble{padding:9px 13px;border-radius:12px;font-family:'DM Mono',monospace;font-size:.75rem;line-height:1.5;max-width:88%}
  .demo-bubble-ai{background:#0d0d20;border:1px solid #1a1a35;border-top-left-radius:3px;color:#bbb}
  .demo-bubble-user{background:#20208a;border:1px solid #3030b0;border-top-right-radius:3px;color:#eeeeff}
  .demo-tip{background:#0a0a1a;border:1px solid #2a2050;border-radius:8px;padding:7px 11px;font-family:'DM Mono',monospace;font-size:.68rem;color:#7060aa;margin-top:4px;margin-left:auto;max-width:88%}
  .demo-tip-label{font-size:.6rem;color:#4030a0;text-transform:uppercase;letter-spacing:.06em;margin-bottom:2px}

  /* ── SECTION SHARED ── */
  section{padding:100px 24px}
  .section-inner{max-width:1100px;margin:0 auto}
  .section-tag{font-family:'DM Mono',monospace;font-size:.72rem;color:#4040a0;letter-spacing:.1em;text-transform:uppercase;margin-bottom:12px}
  h2{font-size:clamp(1.8rem,4vw,3rem);font-weight:800;letter-spacing:-.03em;line-height:1.15;margin-bottom:16px}
  .section-sub{font-family:'DM Mono',monospace;font-size:.88rem;color:#444;line-height:1.7;max-width:560px;margin-bottom:56px}

  /* ── FEATURES ── */
  .features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}
  .feature-card{background:#0a0a18;border:1px solid #141428;border-radius:18px;padding:28px;transition:border-color .3s}
  .feature-card:hover{border-color:#2a2a50}
  .feature-card.locked{opacity:.55;position:relative}
  .feature-card.locked::after{content:'PRO';position:absolute;top:16px;right:16px;background:#0d0d22;border:1px solid #2a2a50;border-radius:6px;padding:2px 8px;font-family:'DM Mono',monospace;font-size:.6rem;color:#4040a0;letter-spacing:.08em}
  .feature-icon{font-size:2rem;margin-bottom:16px;display:block}
  .feature-title{font-size:1.05rem;font-weight:700;margin-bottom:8px;letter-spacing:-.01em}
  .feature-desc{font-family:'DM Mono',monospace;font-size:.78rem;color:#444;line-height:1.6}

  /* ── HOW IT WORKS ── */
  .how-bg{background:#0a0a15;border-top:1px solid #0f0f22;border-bottom:1px solid #0f0f22}
  .steps-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:32px}
  .step-item{display:flex;flex-direction:column;align-items:flex-start}
  .step-num-big{width:48px;height:48px;border-radius:12px;background:#0d0d22;border:1px solid #1a1a40;display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:800;color:#6060cc;margin-bottom:16px;font-family:'DM Mono',monospace}
  .step-title{font-size:1rem;font-weight:700;margin-bottom:8px}
  .step-desc{font-family:'DM Mono',monospace;font-size:.78rem;color:#444;line-height:1.6}

  /* ── TESTIMONIALS ── */
  .testi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}
  .testi-card{background:#0a0a18;border:1px solid #141428;border-radius:18px;padding:28px}
  .testi-stars{color:#f0c060;font-size:.85rem;margin-bottom:14px;letter-spacing:2px}
  .testi-text{font-family:'DM Mono',monospace;font-size:.8rem;color:#666;line-height:1.65;margin-bottom:20px}
  .testi-author{display:flex;align-items:center;gap:10px}
  .testi-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#1a1a40,#3030a0);display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:700;flex-shrink:0}
  .testi-name{font-size:.85rem;font-weight:700;margin-bottom:2px}
  .testi-role{font-family:'DM Mono',monospace;font-size:.68rem;color:#444}

  /* ── PRICING ── */
  .pricing-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;max-width:780px;margin:0 auto}
  .plan-card{background:#0a0a18;border:1px solid #141428;border-radius:24px;padding:36px;position:relative;overflow:hidden}
  .plan-card.pro{border-color:#2020a0}
  .plan-card-glow{position:absolute;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,#1a1a5028 0%,transparent 70%);top:-80px;left:50%;transform:translateX(-50%);pointer-events:none}
  .plan-label{display:inline-block;border-radius:20px;padding:4px 12px;font-family:'DM Mono',monospace;font-size:.68rem;letter-spacing:.08em;margin-bottom:16px}
  .plan-label.free{background:#0a1a0a;border:1px solid #1a3a1a;color:#4ecc96}
  .plan-label.pro{background:#0d0d2a;border:1px solid #2020a0;color:#6060cc}
  .plan-name{font-size:1.5rem;font-weight:800;letter-spacing:-.02em;margin-bottom:6px}
  .plan-price{font-size:2.8rem;font-weight:800;letter-spacing:-.04em;margin-bottom:4px}
  .plan-price.pro-price{background:linear-gradient(135deg,#eeeeff,#8080ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .plan-period{font-family:'DM Mono',monospace;font-size:.78rem;color:#444;margin-bottom:28px}
  .plan-feats{display:flex;flex-direction:column;gap:10px;margin-bottom:28px}
  .plan-feat{display:flex;align-items:flex-start;gap:9px;font-family:'DM Mono',monospace;font-size:.78rem;color:#555;line-height:1.5}
  .plan-feat-icon{flex-shrink:0;margin-top:1px}
  .plan-feat.on{color:#888}
  .plan-feat.on .plan-feat-icon{color:#4ecc96}
  .plan-feat.off .plan-feat-icon{color:#333}
  .plan-btn{width:100%;padding:14px;border-radius:12px;font-family:'Syne',sans-serif;font-size:.95rem;font-weight:700;border:none;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px}
  .plan-btn.free-btn{background:#0d0d22;border:1px solid #1a1a35;color:#888}
  .plan-btn.free-btn:hover{border-color:#3030a0;color:#aaaaff;background:#10102a}
  .plan-btn.pro-btn{background:#12122a;border:1px solid #2a2a55;color:#444;cursor:not-allowed}
  .plan-note{font-family:'DM Mono',monospace;font-size:.7rem;color:#2a2a40;margin-top:12px;text-align:center;line-height:1.5}
  .notify-form{display:flex;gap:8px;margin-top:14px}
  .notify-input{flex:1;background:#080812;border:1px solid #1a1a30;border-radius:8px;padding:9px 12px;color:#eeeeff;font-family:'DM Mono',monospace;font-size:.78rem;outline:none;transition:border-color .2s}
  .notify-input:focus{border-color:#3030a0}
  .notify-input::placeholder{color:#2a2a40}
  .notify-send{flex-shrink:0;padding:9px 14px;border-radius:8px;background:#12122a;border:1px solid #2a2a50;color:#6060cc;font-family:'DM Mono',monospace;font-size:.75rem;cursor:pointer;transition:all .2s;white-space:nowrap}
  .notify-send:hover{background:#1a1a40;color:#9090ff}
  .notify-sent{font-family:'DM Mono',monospace;font-size:.75rem;color:#4ecc96;text-align:center;margin-top:12px;padding:8px;background:#0a1a0a;border-radius:8px}

  /* ── FAQ ── */
  .faq-list{max-width:680px;margin:0 auto;display:flex;flex-direction:column;gap:12px}
  .faq-item{background:#0a0a18;border:1px solid #141428;border-radius:14px;overflow:hidden;cursor:pointer;transition:border-color .2s}
  .faq-item:hover{border-color:#2a2a50}
  .faq-q{padding:18px 20px;font-size:.95rem;font-weight:700;display:flex;align-items:center;justify-content:space-between;gap:16px}
  .faq-chevron{font-family:'DM Mono',monospace;color:#444;transition:transform .2s;font-size:.8rem}
  .faq-chevron.open{transform:rotate(180deg)}
  .faq-a{padding:0 20px 18px;font-family:'DM Mono',monospace;font-size:.8rem;color:#555;line-height:1.65}

  /* ── FINAL CTA ── */
  .cta-section{text-align:center;padding:120px 24px}
  .cta-inner{max-width:600px;margin:0 auto}
  .cta-inner h2{margin-bottom:16px}
  .cta-sub{font-family:'DM Mono',monospace;font-size:.88rem;color:#444;line-height:1.7;margin-bottom:40px}

  /* ── FOOTER ── */
  footer{border-top:1px solid #0f0f20;padding:32px 40px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px}
  .footer-logo{font-size:.95rem;font-weight:800;letter-spacing:-.02em;background:linear-gradient(135deg,#8080ff,#4040cc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .footer-links{display:flex;gap:24px}
  .footer-link{font-family:'DM Mono',monospace;font-size:.72rem;color:#333;text-decoration:none;transition:color .2s}
  .footer-link:hover{color:#6060cc}
  .footer-copy{font-family:'DM Mono',monospace;font-size:.72rem;color:#222}

  @media(max-width:640px){
    nav{padding:14px 16px;gap:8px}
    .hero{padding:100px 20px 60px}
    section{padding:72px 20px}
    footer{padding:24px 20px}
  }
`;

const LANDING_STRINGS = {
  en: {
    langToggle: "🌐 Español",
    pricing: "Pricing",
    tryFree: "Try free →",
    heroTag: "$29 lifetime · no subscription · no sign-up",
    heroH1: <><span className="gradient-text">Ace your next</span><br />interview.</>,
    heroSub: "Practice with an AI interviewer that speaks, pushes back on weak answers, gives real-time coaching, and prepares you for the actual conversation.",
    heroCta: "Start for free →",
    heroProCta: "Get Pro access",
    heroComingSoon: "Coming soon",
    heroNote: <>Free plan includes voice, real-time coach tips, and Jordan (standard difficulty).<br />No credit card needed.</>,
    heroProof: ["✓ No sign-up required", "✓ Works on mobile", "✓ Any job posting"],
    demoLive: "Live interview · speaking...",
    demoQ: "Tell me about a time you led a project with a tight deadline and limited resources. What was your approach?",
    demoA: "Sure — at my last company we had to ship a new onboarding flow in 3 weeks with just 2 engineers. I cut scope aggressively and set daily milestones...",
    demoTip: "Good instinct to cut scope — that shows real prioritization skill. Add a specific metric: what happened to activation rate after you shipped?",
    demoFollowup: "Interesting. What did you actually cut, and how did you decide what stayed in?",
    featTag: "// Features",
    featH2: <>{`Not a quiz app. A real`}<br /><span className="gradient-text">conversation</span></>,
    featSub: "Back-and-forth with an interviewer who actually challenges you — features marked PRO require a paid plan.",
    features: [
      { icon: "🎙️", title: "Voice-enabled interviewer", desc: "Your AI interviewer speaks out loud using the best voice on your device, and listens to your answers — just like the real thing.", free: true },
      { icon: "🎯", title: "Job-specific questions", desc: "Paste any job posting URL — Greenhouse, Lever, Workday, company sites — and get questions tailored exactly to that role.", free: true },
      { icon: "📊", title: "Honest scoring & feedback", desc: "Calibrated rubric — not inflated praise. Specific strengths, concrete improvements, and the one thing to fix first.", free: true },
      { icon: "💬", title: "Real-time coach tips", desc: "After each answer, your AI coach shows what worked and the single most impactful thing to improve.", free: true },
      { icon: "🔥", title: "FAANG Stress Bootcamp", desc: "Hard mode with Morgan — a relentless VP who challenges every answer and demands metrics. Built for high-stakes interviews.", free: false },
      { icon: "🧠", title: "Coach memory + drills", desc: "Tags your weak spots after each interview (STAR, confidence, fillers, alignment...) and offers 3-question drills on what to fix next.", free: false },
      { icon: "📹", title: "Video review", desc: "Record yourself answering. Watch it back with pace (WPM) and filler word counter. 100% local — never leaves your device.", free: false },
      { icon: "🔥", title: "Streak tracking", desc: "Daily practice streak that keeps you sharp. Build the habit before you need it.", free: false },
    ],
    howTag: "// How it works",
    howH2: <>{`From zero to`}<br /><span className="gradient-text">interview-ready</span></>,
    howSub: "Four steps, under five minutes to set up. Then just practice.",
    steps: [
      { n: "01", title: "Paste the job link", desc: "We analyze the posting and auto-fill the position, company, and requirements. No copy-paste needed." },
      { n: "02", title: "Choose difficulty and start", desc: "Pick your level. Your AI interviewer — with a real name and voice — introduces themselves and begins." },
      { n: "03", title: "Have the real conversation", desc: "Answer out loud or by typing. The interviewer pushes back on weak answers and asks real follow-ups." },
      { n: "04", title: "Get your detailed report", desc: "Receive an overall score, specific strengths, concrete improvements, and a personal recommendation." },
    ],
    testiTag: "// What people say",
    testiH2: <>{`Used by people who`}<br /><span className="gradient-text">got the offer</span></>,
    testiSub: "Real feedback from candidates who practiced before their interviews.",
    testimonials: [
      { stars: "★★★★★", text: '"I had a technical interview at a Series B startup and walked in genuinely confident for the first time. The Hard mode is brutal in the best way — Morgan asked me for specific metrics on every answer and I actually had them."', name: "Alex R.", role: "Software Engineer", initial: "A" },
      { stars: "★★★★★", text: '"Used this before my Google interview. The job URL feature is incredible — it pulled the exact requirements and the questions were spot-on. Got the offer."', name: "Maria C.", role: "Product Manager", initial: "M" },
      { stars: "★★★★★", text: '"Career changers need this. I was switching from teaching to UX design. After 10 sessions I had real answers for every behavioral question and stopped freezing up."', name: "James T.", role: "UX Designer", initial: "J" },
    ],
    pricingTag: "// Pricing",
    pricingH2: <>{`Start free.`}<br /><span className="gradient-text">Upgrade when ready.</span></>,
    pricingSub: "Start free. Upgrade to Pro for $29 — one-time payment, lifetime access. No subscription, ever.",
    freeLabel: "Free", freePlanName: "Starter", freePrice: "$0", freePeriod: "forever · no card needed",
    freeFeats: [
      { on: true,  text: "6 interviews per month" },
      { on: true,  text: "Voice-enabled AI interviewer (best voice on your device)" },
      { on: false, text: "Job URL analyzer" },
      { on: true,  text: "Real-time coach tips" },
      { on: true,  text: "Standard difficulty (Jordan)" },
      { on: true,  text: "5 questions per interview" },
      { on: false, text: "Easy & Hard modes (Sam + FAANG bootcamp with Morgan)" },
      { on: false, text: "Coach memory & quick drills on your weak spots" },
      { on: false, text: "Video review with pace + filler word analysis" },
      { on: false, text: "Unlimited interviews & full history" },
    ],
    freePlanBtn: "Start practicing free →",
    proLabel: "Pro", proPlanName: "Unlimited", proPrice: "$29", proPeriod: "one-time · no subscription ever",
    proFeats: [
      { text: "Everything in Free" },
      { text: "Unlimited interviews per month" },
      { text: "Up to 10 questions per session" },
      { text: "All 3 difficulties — Sam, Jordan, and Morgan's FAANG Stress Bootcamp" },
      { text: "Coach memory: tracks your weak spots + 3-question drills" },
      { text: "Video review: watch yourself back · WPM + filler counter" },
      { text: "Full interview history + streak tracking" },
    ],
    proCta: "Get Pro access →",
    proNote: "One-time payment · Instant access · No subscription",
    faqTag: "// FAQ",
    faqH2: "Common questions",
    faqs: [
      { q: "What's the difference between Free and Pro?", a: "Free gives you 6 interviews/month with Jordan at Standard difficulty, voice, job URL analyzer, and real-time coach tips. Pro unlocks unlimited interviews, Sam (easy) and Morgan (FAANG bootcamp) personas, coach memory with weak-spot drills, video review with pace & filler analysis, and full history tracking." },
      { q: "Is there a monthly subscription?", a: "No — Pro is a one-time $29 payment for lifetime access. Most candidates only need to prepare for a few weeks, so subscriptions feel like a rip-off." },
      { q: "Do I need a microphone?", a: "No — you can type your answers if you prefer. But using your microphone gives the most realistic experience, with the AI interviewer speaking back to you." },
      { q: "What does \"Video review\" mean? Is my data safe?", a: "On Pro, you can opt in to record yourself during the interview. The video is stored only in your browser — never uploaded to our servers. You can play it back, see your WPM, filler words, and download it if you want to keep it." },
      { q: "What's the \"FAANG Stress Bootcamp\"?", a: "Hard mode with Morgan, our toughest interviewer persona — a relentless VP who pushes back on every answer and demands specific metrics. Built to prep you for Big Tech bar-raisers and high-stakes panels." },
      { q: "Will the questions match my actual job application?", a: "Yes. Paste the job posting URL (Greenhouse, Lever, Workday, company career pages all work great) and the AI extracts the exact requirements and skills to generate targeted questions." },
      { q: "Is it safe to pay? What happens after I pay?", a: "Payment is processed securely by Stripe. After checkout you get instant lifetime access — just bookmark the app and use it anytime. No account needed." },
    ],
    ctaH2: "Ready to stop winging it?",
    ctaSub: <>Start free — no sign-up, no credit card.<br />Your AI interviewer is ready right now.</>,
    ctaBtn: "Start practicing free →",
    footerTryFree: "Try it free", footerPricing: "Pricing", footerFeatures: "Features",
  },
  es: {
    langToggle: "🌐 English",
    pricing: "Precios",
    tryFree: "Prueba gratis →",
    heroTag: "$29 de por vida · sin suscripción · sin registro",
    heroH1: <><span className="gradient-text">Domina tu próxima</span><br />entrevista.</>,
    heroSub: "Practica con un entrevistador de IA que habla, cuestiona tus respuestas débiles, te da coaching en tiempo real y te prepara para la conversación real.",
    heroCta: "Empieza gratis →",
    heroProCta: "Acceso Pro",
    heroComingSoon: "Próximamente",
    heroNote: <>El plan gratuito incluye voz, consejos de coach en tiempo real y Jordan (dificultad estándar).<br />Sin tarjeta de crédito.</>,
    heroProof: ["✓ Sin registro", "✓ Funciona en móvil", "✓ Cualquier vacante"],
    demoLive: "Entrevista en vivo · hablando...",
    demoQ: "Cuéntame sobre una vez que lideraste un proyecto con tiempo limitado y pocos recursos. ¿Cuál fue tu enfoque?",
    demoA: "Claro — en mi empresa anterior tuvimos que lanzar un nuevo flujo de onboarding en 3 semanas con solo 2 ingenieros. Recorté el alcance agresivamente y establecí hitos diarios...",
    demoTip: "Buen instinto recortar el alcance — eso muestra habilidad real de priorización. Añade una métrica específica: ¿qué pasó con la tasa de activación después del lanzamiento?",
    demoFollowup: "Interesante. ¿Qué recortaste exactamente y cómo decidiste qué se quedaba?",
    featTag: "// Características",
    featH2: <>{`No es un quiz. Es una`}<br /><span className="gradient-text">conversación real</span></>,
    featSub: "Ida y vuelta con un entrevistador que realmente te desafía — las funciones marcadas PRO requieren un plan de pago.",
    features: [
      { icon: "🎙️", title: "Entrevistador con voz", desc: "Tu entrevistador de IA habla en voz alta usando la mejor voz de tu dispositivo, y escucha tus respuestas — igual que en la vida real.", free: true },
      { icon: "🎯", title: "Preguntas específicas al puesto", desc: "Pega cualquier URL de vacante — Greenhouse, Lever, Workday, portales de empresa — y obtén preguntas adaptadas exactamente a ese rol.", free: true },
      { icon: "📊", title: "Puntuación y feedback honesto", desc: "Rúbrica calibrada — sin elogios inflados. Fortalezas específicas, mejoras concretas, y lo único que debes corregir primero.", free: true },
      { icon: "💬", title: "Consejos del coach en tiempo real", desc: "Después de cada respuesta, tu coach de IA muestra qué funcionó y la mejora más impactante que puedes hacer.", free: true },
      { icon: "🔥", title: "Big Tech Bootcamp", desc: "Modo difícil con Morgan — una VP implacable que cuestiona cada respuesta y exige métricas. Diseñado para entrevistas de alto nivel.", free: false },
      { icon: "🧠", title: "Memoria del coach + ejercicios", desc: "Identifica tus áreas débiles en cada entrevista (STAR, confianza, muletillas...) y ofrece ejercicios de 3 preguntas para mejorarlas.", free: false },
      { icon: "📹", title: "Revisión de video", desc: "Grábate respondiendo. Míralo con contador de WPM y muletillas. 100% local — nunca sale de tu dispositivo.", free: false },
      { icon: "🔥", title: "Racha de práctica", desc: "Racha diaria que te mantiene en forma. Crea el hábito antes de necesitarlo.", free: false },
    ],
    howTag: "// Cómo funciona",
    howH2: <>{`De cero a`}<br /><span className="gradient-text">listo para entrevistar</span></>,
    howSub: "Cuatro pasos, menos de cinco minutos para configurar. Luego solo practica.",
    steps: [
      { n: "01", title: "Pega el link de la vacante", desc: "Analizamos la publicación y llenamos automáticamente el puesto, empresa y requisitos. Sin copiar y pegar." },
      { n: "02", title: "Elige la dificultad y comienza", desc: "Escoge tu nivel. Tu entrevistador de IA — con nombre real y voz — se presenta y comienza." },
      { n: "03", title: "Ten la conversación real", desc: "Responde en voz alta o escribiendo. El entrevistador cuestiona respuestas débiles y hace preguntas de seguimiento reales." },
      { n: "04", title: "Recibe tu reporte detallado", desc: "Obtén un puntaje general, fortalezas específicas, mejoras concretas y una recomendación personalizada." },
    ],
    testiTag: "// Lo que dicen",
    testiH2: <>{`Usado por personas que`}<br /><span className="gradient-text">consiguieron la oferta</span></>,
    testiSub: "Feedback real de candidatos que practicaron antes de sus entrevistas.",
    testimonials: [
      { stars: "★★★★★", text: '"Tuve una entrevista técnica en una startup y entré genuinamente confiado por primera vez. El modo Difícil es brutal en el buen sentido — Morgan me pidió métricas específicas en cada respuesta y las tenía."', name: "Alex R.", role: "Ingeniero de Software", initial: "A" },
      { stars: "★★★★★", text: '"Lo usé antes de mi entrevista en Google. La función de URL de vacante es increíble — extrajo los requisitos exactos y las preguntas fueron perfectas. Conseguí la oferta."', name: "María C.", role: "Product Manager", initial: "M" },
      { stars: "★★★★★", text: '"Los que cambian de carrera necesitan esto. Estaba cambiando de docente a diseño UX. Después de 10 sesiones tenía respuestas reales para cada pregunta conductual."', name: "James T.", role: "Diseñador UX", initial: "J" },
    ],
    pricingTag: "// Precios",
    pricingH2: <>{`Empieza gratis.`}<br /><span className="gradient-text">Actualiza cuando quieras.</span></>,
    pricingSub: "Empieza gratis. Actualiza a Pro por $29 — pago único, acceso de por vida. Sin suscripción nunca.",
    freeLabel: "Gratis", freePlanName: "Básico", freePrice: "$0", freePeriod: "para siempre · sin tarjeta",
    freeFeats: [
      { on: true,  text: "6 entrevistas por mes" },
      { on: true,  text: "Entrevistador de IA con voz (la mejor voz de tu dispositivo)" },
      { on: false, text: "Analizador de URL de vacantes" },
      { on: true,  text: "Consejos del coach en tiempo real" },
      { on: true,  text: "Dificultad estándar (Jordan)" },
      { on: true,  text: "5 preguntas por entrevista" },
      { on: false, text: "Modos fácil y difícil (Sam + Big Tech Bootcamp con Morgan)" },
      { on: false, text: "Memoria del coach y ejercicios en tus puntos débiles" },
      { on: false, text: "Revisión de video con análisis de ritmo + muletillas" },
      { on: false, text: "Entrevistas ilimitadas e historial completo" },
    ],
    freePlanBtn: "Empieza a practicar gratis →",
    proLabel: "Pro", proPlanName: "Ilimitado", proPrice: "$29", proPeriod: "pago único · sin suscripción nunca",
    proFeats: [
      { text: "Todo lo del plan Gratis" },
      { text: "Entrevistas ilimitadas por mes" },
      { text: "Hasta 10 preguntas por sesión" },
      { text: "Las 3 dificultades — Sam, Jordan y el Big Tech Bootcamp de Morgan" },
      { text: "Memoria del coach: rastrea tus puntos débiles + ejercicios de 3 preguntas" },
      { text: "Revisión de video: mírarte de nuevo · contador de WPM + muletillas" },
      { text: "Historial completo de entrevistas + racha de práctica" },
    ],
    proCta: "Obtener acceso Pro →",
    proNote: "Pago único · Acceso inmediato · Sin suscripción",
    faqTag: "// Preguntas frecuentes",
    faqH2: "Preguntas comunes",
    faqs: [
      { q: "¿Cuál es la diferencia entre Gratis y Pro?", a: "Gratis te da 6 entrevistas/mes con Jordan en dificultad Estándar, voz, analizador de URL y consejos del coach en tiempo real. Pro desbloquea entrevistas ilimitadas, los personajes Sam (fácil) y Morgan (Big Tech Bootcamp), memoria del coach con ejercicios focalizados, revisión de video con análisis de ritmo y muletillas, e historial completo." },
      { q: "¿Hay suscripción mensual?", a: "No — Pro es un pago único de $29 para acceso de por vida. La mayoría de los candidatos solo necesitan prepararse unas semanas, así que las suscripciones se sienten como una estafa." },
      { q: "¿Necesito micrófono?", a: "No — puedes escribir tus respuestas si lo prefieres. Pero usar el micrófono da la experiencia más realista, con el entrevistador de IA respondiéndote en voz alta." },
      { q: "¿Qué es la \"Revisión de video\"? ¿Están seguros mis datos?", a: "En Pro, puedes optar por grabarte durante la entrevista. El video se guarda solo en tu navegador — nunca se sube a nuestros servidores. Puedes reproducirlo, ver tu WPM, muletillas y descargarlo si quieres conservarlo." },
      { q: "¿Qué es el \"Big Tech Bootcamp\"?", a: "Modo difícil con Morgan, nuestro personaje más exigente — una VP implacable que cuestiona cada respuesta y exige métricas específicas. Creado para prepararte para entrevistas de alto nivel en Big Tech." },
      { q: "¿Las preguntas se adaptarán a mi vacante real?", a: "Sí. Pega la URL de la vacante (Greenhouse, Lever, Workday, portales de empresa funcionan muy bien) y la IA extrae los requisitos y habilidades exactos para generar preguntas focalizadas." },
      { q: "¿Es seguro pagar? ¿Qué pasa después?", a: "El pago se procesa de forma segura con Stripe. Después del checkout tienes acceso de por vida instantáneo — solo guarda la app en favoritos y úsala cuando quieras. No se necesita cuenta." },
    ],
    ctaH2: "¿Listo para dejar de improvisar?",
    ctaSub: <>Empieza gratis — sin registro, sin tarjeta.<br />Tu entrevistador de IA está listo ahora mismo.</>,
    ctaBtn: "Empieza a practicar gratis →",
    footerTryFree: "Prueba gratis", footerPricing: "Precios", footerFeatures: "Características",
  },
};

const STRIPE_LINK = "https://buy.stripe.com/bJebJ37atckE4JudqC4Vy04";

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(null);
  const [lang, setLang] = useState("en");
  const L = LANDING_STRINGS[lang];
  const { user } = CLERK_ENABLED ? useUser() : { user: null };

  const title = lang === "es"
    ? "InterviewHub — Practica entrevistas de trabajo con un entrevistador de IA real"
    : "InterviewHub — Practice job interviews with a real AI interviewer";
  const description = lang === "es"
    ? "Practica con un entrevistador de IA que habla, cuestiona respuestas débiles y da coaching en tiempo real. Pega cualquier vacante y empieza en segundos. Sin registro. $29 de por vida — sin suscripción."
    : "Practice with an AI interviewer that speaks, pushes back on weak answers, and gives real-time coaching. Paste any job posting and start in seconds. No sign-up. $29 lifetime — no subscription.";

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="theme-color" content="#07080f" />
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E🎙%3C/text%3E%3C/svg%3E" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:site_name" content="InterviewHub" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
      </Head>
      <style>{css}</style>

      {/* ── NAV ── */}
      <nav>
        <a href="#" className="nav-logo">InterviewHub</a>
        <div className="nav-actions">
          <button
            onClick={() => setLang(l => l === "en" ? "es" : "en")}
            style={{padding:"9px 18px",borderRadius:9,background:"linear-gradient(135deg,#2020a0,#4040cc)",border:"2px solid #6060ff",color:"#fff",fontFamily:"'Syne',sans-serif",fontSize:".85rem",fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",boxShadow:"0 0 16px #4040cc60"}}
          >
            {L.langToggle}
          </button>
          <a href="#pricing" className="nav-link">{L.pricing}</a>
          {CLERK_ENABLED && (
            user
              ? <UserButton afterSignOutUrl="/" />
              : <SignInButton mode="modal">
                  <button className="nav-cta">{lang === "en" ? "Sign in" : "Iniciar sesión"}</button>
                </SignInButton>
          )}
          <Link href="/app" className="nav-cta">{L.tryFree}</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-tag">
          <span className="hero-tag-dot" />
          {L.heroTag}
        </div>
        <h1>{L.heroH1}</h1>
        <p className="hero-sub">{L.heroSub}</p>

        <div className="hero-btns">
          <Link href="/app" className="btn-primary">{L.heroCta}</Link>
          <a href={STRIPE_LINK} className="btn-primary" style={{background:"linear-gradient(135deg,#0a0a20,#1a1a50)",border:"1px solid #3030a0"}}>
            {L.heroProCta} — $29
          </a>
        </div>

        <div className="hero-free-note">{L.heroNote}</div>

        <div className="hero-proof">
          {L.heroProof.map((item, i) => (
            <span key={i} className="hero-proof-item">{item}</span>
          ))}
        </div>
      </section>

      {/* ── DEMO WINDOW ── */}
      <div className="demo-wrap">
        <div className="demo-window">
          <div className="demo-bar">
            <div className="demo-dot" style={{ background: "#ff5f57" }} />
            <div className="demo-dot" style={{ background: "#ffbd2e" }} />
            <div className="demo-dot" style={{ background: "#28ca41" }} />
            <span className="demo-title">InterviewHub · {L.demoLive.split("·")[1]?.trim() ? L.demoLive : "Live interview"}</span>
          </div>
          <div className="demo-body">
            <div className="demo-iv-card">
              <div className="demo-avatar">JM</div>
              <div style={{ flex: 1 }}>
                <div className="demo-iv-name">Jordan Mills</div>
                <div className="demo-iv-sub">Senior Talent Acquisition · Acme Corp</div>
                <div className="demo-live">
                  <div className="demo-live-dot" />
                  <span className="demo-live-txt">{L.demoLive}</span>
                </div>
              </div>
            </div>
            <div className="demo-msgs">
              <div className="demo-msg-ai">
                <div className="demo-bubble demo-bubble-ai">{L.demoQ}</div>
              </div>
              <div className="demo-msg-user">
                <div className="demo-bubble demo-bubble-user">{L.demoA}</div>
              </div>
              <div className="demo-tip">
                <div className="demo-tip-label">{lang === "es" ? "💬 Consejo del coach" : "💬 Coach tip"}</div>
                {L.demoTip}
              </div>
              <div className="demo-msg-ai">
                <div className="demo-bubble demo-bubble-ai">{L.demoFollowup}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features">
        <div className="section-inner">
          <div className="section-tag">{L.featTag}</div>
          <h2>{L.featH2}</h2>
          <p className="section-sub">{L.featSub}</p>
          <div className="features-grid">
            {L.features.map((f) => (
              <div className={`feature-card${f.free ? "" : " locked"}`} key={f.title}>
                <span className="feature-icon">{f.icon}</span>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how-bg">
        <div className="section-inner">
          <div className="section-tag">{L.howTag}</div>
          <h2>{L.howH2}</h2>
          <p className="section-sub">{L.howSub}</p>
          <div className="steps-list">
            {L.steps.map((s) => (
              <div className="step-item" key={s.n}>
                <div className="step-num-big">{s.n}</div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section>
        <div className="section-inner">
          <div className="section-tag">{L.testiTag}</div>
          <h2>{L.testiH2}</h2>
          <p className="section-sub" style={{ marginBottom: 48 }}>{L.testiSub}</p>
          <div className="testi-grid">
            {L.testimonials.map((t) => (
              <div className="testi-card" key={t.name}>
                <div className="testi-stars">{t.stars}</div>
                <div className="testi-text">{t.text}</div>
                <div className="testi-author">
                  <div className="testi-avatar">{t.initial}</div>
                  <div>
                    <div className="testi-name">{t.name}</div>
                    <div className="testi-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="how-bg">
        <div className="section-inner">
          <div className="section-tag" style={{ textAlign: "center" }}>{L.pricingTag}</div>
          <h2 style={{ textAlign: "center", marginBottom: 12 }}>{L.pricingH2}</h2>
          <p className="section-sub" style={{ margin: "0 auto 48px", textAlign: "center" }}>{L.pricingSub}</p>
          <div className="pricing-grid">
            {/* FREE */}
            <div className="plan-card">
              <div className={`plan-label free`}>{L.freeLabel}</div>
              <div className="plan-name">{L.freePlanName}</div>
              <div className="plan-price">{L.freePrice}</div>
              <div className="plan-period">{L.freePeriod}</div>
              <div className="plan-feats">
                {L.freeFeats.map((f) => (
                  <div className={`plan-feat ${f.on ? "on" : "off"}`} key={f.text}>
                    <span className="plan-feat-icon">{f.on ? "✓" : "–"}</span>
                    {f.text}
                  </div>
                ))}
              </div>
              <Link href="/app" className="plan-btn free-btn">{L.freePlanBtn}</Link>
            </div>

            {/* PRO */}
            <div className="plan-card pro">
              <div className="plan-card-glow" />
              <div className="plan-label pro">{L.proLabel}</div>
              <div className="plan-name">{L.proPlanName}</div>
              <div className="plan-price pro-price">{L.proPrice}</div>
              <div className="plan-period">{L.proPeriod}</div>
              <div className="plan-feats">
                {L.proFeats.map((f) => (
                  <div className="plan-feat on" key={f.text}>
                    <span className="plan-feat-icon" style={{ color: "#6060cc" }}>✓</span>
                    {f.text}
                  </div>
                ))}
              </div>
              <a href={STRIPE_LINK} className="plan-btn pro-btn">{L.proCta}</a>
              <div className="plan-note">{L.proNote}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section>
        <div className="section-inner">
          <div className="section-tag" style={{ textAlign: "center" }}>{L.faqTag}</div>
          <h2 style={{ textAlign: "center", marginBottom: 48 }}>{L.faqH2}</h2>
          <div className="faq-list">
            {L.faqs.map((f, i) => (
              <div className="faq-item" key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className="faq-q">
                  {f.q}
                  <span className={`faq-chevron${openFaq === i ? " open" : ""}`}>▼</span>
                </div>
                {openFaq === i && <div className="faq-a">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <div className="cta-section">
        <div className="cta-inner">
          <h2>{L.ctaH2}</h2>
          <p className="cta-sub">{L.ctaSub}</p>
          <Link href="/app" className="btn-primary" style={{ margin: "0 auto" }}>{L.ctaBtn}</Link>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer>
        <span className="footer-logo">InterviewHub</span>
        <div className="footer-links">
          <Link href="/app" className="footer-link">{L.footerTryFree}</Link>
          <a href="#pricing" className="footer-link">{L.footerPricing}</a>
          <a href="#features" className="footer-link">{L.footerFeatures}</a>
        </div>
        <span className="footer-copy">© {new Date().getFullYear()} InterviewHub</span>
      </footer>
    </>
  );
}
