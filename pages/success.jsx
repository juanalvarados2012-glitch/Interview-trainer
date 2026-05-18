import Link from "next/link";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Syne',sans-serif;background:#07080f;color:#eeeeff;min-height:100vh;display:flex;align-items:center;justify-content:center}
  .wrap{text-align:center;padding:40px 24px;max-width:480px;margin:0 auto}
  .icon{font-size:4rem;margin-bottom:24px;display:block}
  h1{font-size:2rem;font-weight:800;letter-spacing:-.03em;margin-bottom:12px;background:linear-gradient(135deg,#eeeeff,#6060cc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  p{font-family:'DM Mono',monospace;font-size:.85rem;color:#555;line-height:1.6;margin-bottom:32px}
  a{display:inline-block;padding:14px 32px;border-radius:12px;border:none;background:linear-gradient(135deg,#2020a0,#4040cc);color:#fff;font-family:'Syne',sans-serif;font-size:.95rem;font-weight:700;cursor:pointer;text-decoration:none;transition:opacity .2s}
  a:hover{opacity:.85}
`;

export default function Success() {
  return (
    <>
      <style>{css}</style>
      <div className="wrap">
        <span className="icon">🎉</span>
        <h1>You&apos;re in!</h1>
        <p>Payment confirmed. You now have lifetime access to InterviewHub — unlimited AI interview practice, forever.</p>
        <Link href="/app">Start practicing →</Link>
      </div>
    </>
  );
}
