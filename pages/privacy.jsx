import Head from "next/head";
import Link from "next/link";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Syne',sans-serif;background:#07080f;color:#eeeeff;min-height:100vh}
  .wrap{max-width:720px;margin:0 auto;padding:60px 24px 80px}
  .back{font-family:'DM Mono',monospace;font-size:.78rem;color:#4040a0;text-decoration:none;display:inline-block;margin-bottom:40px;transition:color .2s}
  .back:hover{color:#8080ff}
  h1{font-size:2rem;font-weight:800;letter-spacing:-.03em;margin-bottom:8px;background:linear-gradient(135deg,#eeeeff,#6060cc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .date{font-family:'DM Mono',monospace;font-size:.72rem;color:#333;margin-bottom:40px}
  h2{font-size:1.1rem;font-weight:700;margin:36px 0 10px;color:#aaaaff}
  p{font-family:'DM Mono',monospace;font-size:.82rem;color:#555;line-height:1.8;margin-bottom:12px}
  a{color:#6060cc;text-decoration:none}
  a:hover{color:#9090ff}
  ul{font-family:'DM Mono',monospace;font-size:.82rem;color:#555;line-height:1.8;padding-left:20px;margin-bottom:12px}
  li{margin-bottom:6px}
  .contact-box{background:#0a0a18;border:1px solid #1a1a30;border-radius:14px;padding:20px 24px;margin-top:40px}
  .contact-box p{margin:0}
`;

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy · InterviewHub</title>
        <meta name="description" content="InterviewHub privacy policy — how we handle your data." />
      </Head>
      <style>{css}</style>
      <div className="wrap">
        <Link href="/" className="back">← Back to InterviewHub</Link>

        <h1>Privacy Policy</h1>
        <p className="date">Last updated: May 2025</p>

        <p>InterviewHub ("we", "our", or "us") is committed to protecting your privacy. This policy explains what data we collect, how we use it, and your rights.</p>

        <h2>1. What We Collect</h2>
        <ul>
          <li><strong>Account information</strong>: If you sign in, we collect your email address via Clerk (our auth provider). You can also sign in with Google.</li>
          <li><strong>Payment information</strong>: Payments are processed by Stripe. We never see or store your card details. Stripe shares only your email and payment status with us.</li>
          <li><strong>Interview content</strong>: Your interview questions and answers are sent to Groq (our AI provider) to generate responses and evaluations. We do not store your interview transcripts on our servers.</li>
          <li><strong>Usage data</strong>: Basic analytics to understand how the app is used (no personal data tied to sessions).</li>
        </ul>

        <h2>2. What We Don't Collect</h2>
        <ul>
          <li>We do not record or store your microphone audio.</li>
          <li>Video recordings (Pro feature) are stored entirely in your browser — they never leave your device and are never uploaded to our servers.</li>
          <li>We do not sell your data to third parties.</li>
          <li>We do not use your data for advertising.</li>
        </ul>

        <h2>3. Third-Party Services</h2>
        <ul>
          <li><strong>Clerk</strong> — handles authentication. <a href="https://clerk.com/privacy" target="_blank" rel="noopener noreferrer">clerk.com/privacy</a></li>
          <li><strong>Stripe</strong> — handles payments. <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">stripe.com/privacy</a></li>
          <li><strong>Groq</strong> — processes interview text with AI. <a href="https://groq.com/privacy-policy" target="_blank" rel="noopener noreferrer">groq.com/privacy-policy</a></li>
          <li><strong>Vercel</strong> — hosts the application. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">vercel.com/legal/privacy-policy</a></li>
        </ul>

        <h2>4. Cookies</h2>
        <p>We use cookies only for authentication (Clerk session tokens) and payment status. We do not use tracking or advertising cookies.</p>

        <h2>5. Data Retention</h2>
        <p>Interview history is stored locally in your browser (localStorage) and is never uploaded to our servers. You can clear it anytime from within the app. Account data is retained as long as your account is active. You may request deletion at any time by contacting us.</p>

        <h2>6. Your Rights</h2>
        <ul>
          <li>Access or export your data</li>
          <li>Delete your account and all associated data</li>
          <li>Opt out of any future communications</li>
        </ul>
        <p>To exercise any of these rights, email us at the address below.</p>

        <h2>7. Children</h2>
        <p>InterviewHub is not directed at children under 13. We do not knowingly collect data from minors.</p>

        <h2>8. Changes to This Policy</h2>
        <p>We may update this policy from time to time. The "last updated" date at the top will reflect any changes. Continued use of the app after changes constitutes acceptance.</p>

        <div className="contact-box">
          <p>Questions about this policy? Contact us at <a href="mailto:juanalvarado2012@gmail.com">juanalvarado2012@gmail.com</a></p>
        </div>
      </div>
    </>
  );
}
