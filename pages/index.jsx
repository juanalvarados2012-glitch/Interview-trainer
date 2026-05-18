import { useState } from "react";
import Link from "next/link";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{font-family:'Syne',sans-serif;background:#07080f;color:#eeeeff;overflow-x:hidden}

  /* ── NAV ── */
  nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:16px 40px;background:rgba(7,8,15,.85);backdrop-filter:blur(12px);border-bottom:1px solid #0f0f20}
  .nav-logo{font-size:1.1rem;font-weight:800;letter-spacing:-.02em;background:linear-gradient(135deg,#8080ff,#4040cc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;text-decoration:none}
  .nav-actions{display:flex;align-items:center;gap:12px}
  .nav-link{font-family:'DM Mono',monospace;font-size:.78rem;color:#444;text-decoration:none;padding:8px 12px;border-radius:8px;transition:all .2s}
  .nav-link:hover{color:#9090ff;background:#0d0d20}
  .nav-cta{padding:9px 20px;border-radius:9px;background:linear-gradient(135deg,#2020a0,#4040cc);color:#fff;font-family:'Syne',sans-serif;font-size:.82rem;font-weight:700;text-decoration:none;transition:opacity .2s;border:none;cursor:pointer}
  .nav-cta:hover{opacity:.85}

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
    nav{padding:14px 20px}
    .hero{padding:100px 20px 60px}
    section{padding:72px 20px}
    footer{padding:24px 20px}
  }
`;

const FREE_FEATS = [
  { on: true,  text: "6 interviews per month" },
  { on: true,  text: "Voice-enabled AI interviewer" },
  { on: true,  text: "Job URL analyzer" },
  { on: true,  text: "Real-time coach tips" },
  { on: true,  text: "5 questions per interview" },
  { on: false, text: "Hard & Easy difficulty levels" },
  { on: false, text: "Resume upload & parsing" },
  { on: false, text: "Unlimited interviews" },
  { on: false, text: "Interview history & tracking" },
];

const PRO_FEATS = [
  { on: true, text: "Everything in Free" },
  { on: true, text: "Unlimited interviews per month" },
  { on: true, text: "Up to 10 questions per session" },
  { on: true, text: "All 3 difficulty levels — Easy, Standard, Hard" },
  { on: true, text: "Resume upload & parsing" },
  { on: true, text: "Interview history & progress tracking" },
];

const FEATURES = [
  { icon: "🎙️", title: "Voice-enabled interviewer", desc: "Your AI interviewer speaks out loud and listens to your answers — just like the real thing.", free: true },
  { icon: "🎯", title: "Job-specific questions", desc: "Paste any job posting URL and get questions tailored exactly to that role and company.", free: true },
  { icon: "📊", title: "Honest scoring & feedback", desc: "Get scored on a calibrated rubric — not inflated praise. Specific strengths and concrete improvements.", free: true },
  { icon: "⚡", title: "3 difficulty levels", desc: "Sam (encouraging), Jordan (balanced), or Morgan (relentless VP who pushes back on everything).", free: false },
  { icon: "💬", title: "Real-time coach tips", desc: "After each answer, your AI coach shows what worked and the single most impactful thing to improve.", free: true },
  { icon: "📄", title: "Resume-aware prep", desc: "Upload your CV so the interviewer tailors every question to your actual background and skills.", free: false },
];

const STEPS = [
  { n: "01", title: "Paste the job link", desc: "We analyze the posting and auto-fill the position, company, and requirements. No copy-paste needed." },
  { n: "02", title: "Choose difficulty and start", desc: "Pick your level. Your AI interviewer — with a real name and voice — introduces themselves and begins." },
  { n: "03", title: "Have the real conversation", desc: "Answer out loud or by typing. The interviewer pushes back on weak answers and asks real follow-ups." },
  { n: "04", title: "Get your detailed report", desc: "Receive an overall score, specific strengths, concrete improvements, and a personal recommendation." },
];

const TESTIMONIALS = [
  { stars: "★★★★★", text: '"I had a technical interview at a Series B startup and walked in genuinely confident for the first time. The Hard mode is brutal in the best way — Morgan asked me for specific metrics on every answer and I actually had them."', name: "Alex R.", role: "Software Engineer", initial: "A" },
  { stars: "★★★★★", text: '"Used this before my Google interview. The job URL feature is incredible — it pulled the exact requirements and the questions were spot-on. Got the offer."', name: "Maria C.", role: "Product Manager", initial: "M" },
  { stars: "★★★★★", text: '"Career changers need this. I was switching from teaching to UX design. After 10 sessions I had real answers for every behavioral question and stopped freezing up."', name: "James T.", role: "UX Designer", initial: "J" },
];

const FAQS = [
  { q: "What's the difference between Free and Pro?", a: "Free gives you 6 interviews per month with up to 5 questions each, Standard difficulty, and voice + URL features. Pro unlocks unlimited interviews, up to 10 questions, all 3 difficulty levels, resume upload, and history tracking." },
  { q: "Do I need a microphone?", a: "No — you can type your answers if you prefer. But using your microphone gives you the most realistic practice experience, including the AI speaking back to you." },
  { q: "Will the questions match my actual job application?", a: "Yes. Paste the job posting URL and the AI analyzes the exact requirements and skills to generate highly relevant questions. Pro users can also upload a resume for even more targeted prep." },
  { q: "When is Pro launching?", a: "Soon — we're finishing the last features and setting up payments. Drop your email in the notify box and you'll be the first to know, with a launch discount." },
];

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(null);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySent, setNotifySent] = useState(false);

  const handleNotify = (e) => {
    e.preventDefault();
    if (!notifyEmail.includes("@")) return;
    // TODO: connect to email list (Mailchimp / Resend / etc.)
    setNotifySent(true);
  };

  return (
    <>
      <style>{css}</style>

      {/* ── NAV ── */}
      <nav>
        <a href="#" className="nav-logo">InterviewHub</a>
        <div className="nav-actions">
          <a href="#pricing" className="nav-link">Pricing</a>
          <Link href="/app" className="nav-cta">Try free →</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-tag">
          <span className="hero-tag-dot" />
          AI-powered · voice-enabled · job-specific
        </div>
        <h1>
          <span className="gradient-text">Ace your next</span><br />
          interview.
        </h1>
        <p className="hero-sub">
          Practice with an AI interviewer that speaks, pushes back on weak answers,
          gives real-time coaching, and prepares you for the actual conversation.
        </p>

        <div className="hero-btns">
          <Link href="/app" className="btn-primary">
            Start for free — 6 interviews/month →
          </Link>
          <div className="btn-coming">
            Get Pro access
            <span className="coming-badge">Coming soon</span>
          </div>
        </div>

        <div className="hero-free-note">
          Free includes voice, job URL analyzer, and coach tips.<br />
          No credit card needed.
        </div>

        <div className="hero-proof">
          <span className="hero-proof-item">✓ No sign-up required</span>
          <span className="hero-proof-item">✓ Works on mobile</span>
          <span className="hero-proof-item">✓ Any job posting</span>
        </div>
      </section>

      {/* ── DEMO WINDOW ── */}
      <div className="demo-wrap">
        <div className="demo-window">
          <div className="demo-bar">
            <div className="demo-dot" style={{ background: "#ff5f57" }} />
            <div className="demo-dot" style={{ background: "#ffbd2e" }} />
            <div className="demo-dot" style={{ background: "#28ca41" }} />
            <span className="demo-title">InterviewHub · Live interview</span>
          </div>
          <div className="demo-body">
            <div className="demo-iv-card">
              <div className="demo-avatar">JM</div>
              <div style={{ flex: 1 }}>
                <div className="demo-iv-name">Jordan Mills</div>
                <div className="demo-iv-sub">Senior Talent Acquisition · Acme Corp</div>
                <div className="demo-live">
                  <div className="demo-live-dot" />
                  <span className="demo-live-txt">Live interview · speaking...</span>
                </div>
              </div>
            </div>
            <div className="demo-msgs">
              <div className="demo-msg-ai">
                <div className="demo-bubble demo-bubble-ai">
                  Tell me about a time you led a project with a tight deadline and limited resources. What was your approach?
                </div>
              </div>
              <div className="demo-msg-user">
                <div className="demo-bubble demo-bubble-user">
                  Sure — at my last company we had to ship a new onboarding flow in 3 weeks with just 2 engineers. I cut scope aggressively and set daily milestones...
                </div>
              </div>
              <div className="demo-tip">
                <div className="demo-tip-label">💬 Coach tip</div>
                Good instinct to cut scope — that shows real prioritization skill. Add a specific metric: what happened to activation rate after you shipped?
              </div>
              <div className="demo-msg-ai">
                <div className="demo-bubble demo-bubble-ai">
                  Interesting. What did you actually cut, and how did you decide what stayed in?
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features">
        <div className="section-inner">
          <div className="section-tag">// Features</div>
          <h2>Not a quiz app. A real<br /><span className="gradient-text">conversation</span></h2>
          <p className="section-sub">Back-and-forth with an interviewer who actually challenges you — features marked PRO are coming in the paid plan.</p>
          <div className="features-grid">
            {FEATURES.map((f) => (
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
          <div className="section-tag">// How it works</div>
          <h2>From zero to<br /><span className="gradient-text">interview-ready</span></h2>
          <p className="section-sub">Four steps, under five minutes to set up. Then just practice.</p>
          <div className="steps-list">
            {STEPS.map((s) => (
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
          <div className="section-tag">// What people say</div>
          <h2>Used by people who<br /><span className="gradient-text">got the offer</span></h2>
          <p className="section-sub" style={{ marginBottom: 48 }}>Real feedback from candidates who practiced before their interviews.</p>
          <div className="testi-grid">
            {TESTIMONIALS.map((t) => (
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
          <div className="section-tag" style={{ textAlign: "center" }}>// Pricing</div>
          <h2 style={{ textAlign: "center", marginBottom: 12 }}>
            Start free.<br /><span className="gradient-text">Upgrade when ready.</span>
          </h2>
          <p className="section-sub" style={{ margin: "0 auto 48px", textAlign: "center" }}>
            Try it free today. Pro is coming soon — drop your email to get notified first.
          </p>
          <div className="pricing-grid">
            {/* FREE */}
            <div className="plan-card">
              <div className="plan-label free">Free</div>
              <div className="plan-name">Starter</div>
              <div className="plan-price">$0</div>
              <div className="plan-period">forever · no card needed</div>
              <div className="plan-feats">
                {FREE_FEATS.map((f) => (
                  <div className={`plan-feat ${f.on ? "on" : "off"}`} key={f.text}>
                    <span className="plan-feat-icon">{f.on ? "✓" : "–"}</span>
                    {f.text}
                  </div>
                ))}
              </div>
              <Link href="/app" className="plan-btn free-btn">Start practicing free →</Link>
            </div>

            {/* PRO */}
            <div className="plan-card pro">
              <div className="plan-card-glow" />
              <div className="plan-label pro">Pro · Coming soon</div>
              <div className="plan-name">Unlimited</div>
              <div className="plan-price pro-price">$29</div>
              <div className="plan-period">one-time · no subscription ever</div>
              <div className="plan-feats">
                {PRO_FEATS.map((f) => (
                  <div className="plan-feat on" key={f.text}>
                    <span className="plan-feat-icon" style={{ color: "#6060cc" }}>✓</span>
                    {f.text}
                  </div>
                ))}
              </div>
              <button className="plan-btn pro-btn" disabled>Coming soon</button>
              {notifySent ? (
                <div className="notify-sent">You&apos;re on the list — we&apos;ll email you at launch!</div>
              ) : (
                <form className="notify-form" onSubmit={handleNotify}>
                  <input
                    className="notify-input"
                    type="email"
                    placeholder="your@email.com"
                    value={notifyEmail}
                    onChange={e => setNotifyEmail(e.target.value)}
                  />
                  <button type="submit" className="notify-send">Notify me</button>
                </form>
              )}
              <div className="plan-note">One-time payment · Instant access · No subscription</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section>
        <div className="section-inner">
          <div className="section-tag" style={{ textAlign: "center" }}>// FAQ</div>
          <h2 style={{ textAlign: "center", marginBottom: 48 }}>Common questions</h2>
          <div className="faq-list">
            {FAQS.map((f, i) => (
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
          <h2>Ready to stop winging it?</h2>
          <p className="cta-sub">
            6 free interviews a month. No sign-up needed.<br />
            Your AI interviewer is ready right now.
          </p>
          <Link href="/app" className="btn-primary" style={{ margin: "0 auto" }}>
            Start practicing free →
          </Link>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer>
        <span className="footer-logo">InterviewHub</span>
        <div className="footer-links">
          <Link href="/app" className="footer-link">Try it free</Link>
          <a href="#pricing" className="footer-link">Pricing</a>
          <a href="#features" className="footer-link">Features</a>
        </div>
        <span className="footer-copy">© {new Date().getFullYear()} InterviewHub</span>
      </footer>
    </>
  );
}
