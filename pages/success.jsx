import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

const CLERK_ENABLED = typeof process !== "undefined" && !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Syne',sans-serif;background:#07080f;color:#eeeeff;min-height:100vh;display:flex;align-items:center;justify-content:center}
  .wrap{text-align:center;padding:40px 24px;max-width:520px;margin:0 auto}
  .icon{font-size:4rem;margin-bottom:24px;display:block}
  h1{font-size:2rem;font-weight:800;letter-spacing:-.03em;margin-bottom:12px;background:linear-gradient(135deg,#eeeeff,#6060cc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .sub{font-family:'DM Mono',monospace;font-size:.85rem;color:#555;line-height:1.6;margin-bottom:32px}
  .badge{display:inline-flex;align-items:center;gap:8px;background:#0a1a0a;border:1px solid #4ecc9640;border-radius:12px;padding:10px 18px;font-family:'DM Mono',monospace;font-size:.82rem;color:#4ecc96;margin-bottom:28px}
  .cta{display:inline-block;padding:14px 32px;border-radius:12px;border:none;background:linear-gradient(135deg,#2020a0,#4040cc);color:#fff;font-family:'Syne',sans-serif;font-size:.95rem;font-weight:700;cursor:pointer;text-decoration:none;transition:all .2s;box-shadow:0 4px 20px #3030a040}
  .cta:hover{opacity:.85;transform:translateY(-1px)}
  .note{font-family:'DM Mono',monospace;font-size:.72rem;color:#333;margin-top:20px;line-height:1.5}
  .checking{font-family:'DM Mono',monospace;font-size:.78rem;color:#444;display:flex;align-items:center;gap:8px;justify-content:center;margin-bottom:20px}
  .dot{width:6px;height:6px;background:#4040c0;border-radius:50%;animation:bounce 1.2s infinite}
  .dot:nth-child(2){animation-delay:.2s}
  .dot:nth-child(3){animation-delay:.4s}
  @keyframes bounce{0%,80%,100%{transform:translateY(0);opacity:.3}40%{transform:translateY(-6px);opacity:1}}
`;

export default function Success() {
  const { user, isLoaded } = CLERK_ENABLED ? useUser() : { user: null, isLoaded: true };
  const [checking, setChecking] = useState(true);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      setChecking(false);
      return;
    }
    fetch("/api/check-payment", { method: "POST" })
      .then(r => r.json())
      .then(d => {
        if (d.paid) setActivated(true);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [isLoaded, user?.id]);

  return (
    <>
      <style>{css}</style>
      <div className="wrap">
        <span className="icon">🎉</span>
        <h1>You&apos;re in!</h1>

        {checking ? (
          <div className="checking">
            <div className="dot" /><div className="dot" /><div className="dot" />
            Activating Pro access...
          </div>
        ) : (
          activated ? (
            <div className="badge">✅ Pro access activated!</div>
          ) : (
            <div className="badge" style={{ borderColor: "#f0c06040", background: "#1a1400", color: "#f0c060" }}>
              ⏳ Access activating — may take a moment
            </div>
          )
        )}

        <p className="sub">
          Payment confirmed. You now have lifetime access to InterviewHub — unlimited AI interview practice, all difficulty levels, coach drills, and video review.
        </p>
        <Link href="/app" className="cta">Start practicing →</Link>
        <p className="note">
          Your Pro badge will appear in the top-right corner of the app.<br />
          If you don&apos;t see it yet, sign out and sign back in.
        </p>
      </div>
    </>
  );
}
