import { useState, useEffect, useRef, useCallback } from "react";

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
  /* ── CHAT ── */
  .chat-area{height:420px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;padding:4px 0 8px;scroll-behavior:smooth}
  .chat-area::-webkit-scrollbar{width:3px}
  .chat-area::-webkit-scrollbar-track{background:transparent}
  .chat-area::-webkit-scrollbar-thumb{background:#2a2a50;border-radius:2px}
  .msg{display:flex;gap:8px;animation:fadeUp .25s ease}
  .msg-ai{flex-direction:row}
  .msg-user{flex-direction:row-reverse}
  .avatar{width:28px;height:28px;border-radius:50%;background:#12122a;border:1px solid #2a2a50;display:flex;align-items:center;justify-content:center;font-size:.82rem;flex-shrink:0;margin-top:2px}
  .bubble{max-width:85%;padding:10px 14px;border-radius:14px;font-family:'DM Mono',monospace;font-size:.82rem;line-height:1.55}
  .bubble-ai{background:#0d0d20;border:1px solid #1a1a35;border-top-left-radius:4px;color:#ccc}
  .bubble-user{background:#20208a;border:1px solid #3030b0;border-top-right-radius:4px;color:#eeeeff}
  .thinking{display:flex;gap:4px;align-items:center}
  .t-dot{width:5px;height:5px;background:#4040c0;border-radius:50%;animation:bounce 1.2s infinite}
  .t-dot:nth-child(2){animation-delay:.2s}.t-dot:nth-child(3){animation-delay:.4s}
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
  .speak-indicator{font-family:'DM Mono',monospace;font-size:.68rem;color:#3030a0;text-align:center;margin-top:6px;min-height:16px}
`;

/* ── API ─────────────────────────────────────────────────────── */
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
  const speak = useCallback((text) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "es-ES";
    utt.rate = 0.92;
    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find(v => v.lang.startsWith("es"));
    if (esVoice) utt.voice = esVoice;
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
  }, []);
  const stop = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);
  return { speak, stop, speaking };
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
    rec.lang = "es-ES";
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
  { role: "Diseñador UX/UI", company: "Startup de tecnología", jd: "Buscamos diseñador UX/UI con experiencia en Figma, investigación de usuarios, prototipado rápido y trabajo en equipos ágiles. Valoramos pensamiento sistémico y pasión por la usabilidad." },
  { role: "Asistente Administrativo", company: "Empresa de consultoría", jd: "Asistente administrativo para gestión de agendas, coordinación de reuniones, manejo de documentación, atención a clientes internos y soporte al equipo directivo." },
  { role: "Community Manager", company: "Agencia de marketing", jd: "Community manager con experiencia en redes sociales, creación de contenido, análisis de métricas, gestión de comunidades y campañas digitales para marcas de consumo." },
];

const SC = n => n >= 80 ? "great" : n >= 60 ? "ok" : "low";

/* ── APP ─────────────────────────────────────────────────────── */
export default function App() {
  const [phase, setPhase] = useState("setup");

  // Setup
  const [jobRole, setJobRole] = useState("");
  const [company, setCompany] = useState("");
  const [jdText, setJdText] = useState("");
  const [numQ, setNumQ] = useState("5");
  const [startLoading, setStartLoading] = useState(false);
  const [startErr, setStartErr] = useState("");

  // Interview
  const [apiMessages, setApiMessages] = useState([]);
  const [displayMessages, setDisplayMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [aiThinking, setAiThinking] = useState(false);
  const [interviewErr, setInterviewErr] = useState("");

  // Results
  const [evaluation, setEvaluation] = useState(null);
  const [evalLoading, setEvalLoading] = useState(false);

  const chatEndRef = useRef(null);
  const { speak, stop, speaking } = useTTS();
  const { recording, supported: micOk, startRec, stopRec } = useSTT();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages, aiThinking]);

  const buildSystem = useCallback(() =>
    `Eres un entrevistador senior de RRHH para el puesto de "${jobRole}" en ${company || "nuestra empresa"}. Conduces entrevistas REALES y exigentes.
Descripción del puesto: ${jdText}

REGLAS DE COMPORTAMIENTO:
1. Al recibir [INICIAR]: preséntate en 1 oración y haz tu primera pregunta específica al puesto.
2. Evalúa CADA respuesta antes de continuar:
   - Si la respuesta es vaga, muy corta (menos de 2-3 oraciones), o no responde la pregunta: NO pases a la siguiente. Pide que elabore con ejemplos concretos. Ejemplo: "Entiendo, pero ¿puedes darme un ejemplo específico de cuándo hiciste eso?"
   - Si el candidato dice solo "sí", "no", "claro", o frases de una palabra: exige más. Ejemplo: "Necesito que me cuentes con más detalle. ¿Qué hiciste exactamente?"
   - Si la respuesta es evasiva o genérica: señálalo y repregunta. Ejemplo: "Eso suena muy general. ¿Qué hiciste TÚ específicamente en esa situación?"
   - Solo avanza a la siguiente pregunta cuando la respuesta sea suficientemente completa y concreta.
3. Puedes hacer hasta 2 preguntas de seguimiento por pregunta principal antes de avanzar.
4. Cuenta solo las ${numQ} preguntas PRINCIPALES (no los follow-ups).
5. NO digas "excelente", "genial", "perfecto" ni valides respuestas malas. Usa frases neutras como "Entiendo", "De acuerdo", "Cuéntame más".
6. Cuando el candidato responda la pregunta principal #${numQ} de forma aceptable: cierra la entrevista con amabilidad e incluye exactamente "|||FIN|||" al final.
7. Habla siempre en español. Máx 3 oraciones por turno. Sé directo y profesional, no condescendiente.`,
    [jobRole, company, jdText, numQ]
  );

  /* ── START INTERVIEW ── */
  const startInterview = async () => {
    setStartLoading(true);
    setStartErr("");
    const trigger = [{ role: "user", content: "[INICIAR]" }];
    try {
      const text = await callAI(buildSystem(), trigger);
      setApiMessages([...trigger, { role: "assistant", content: text }]);
      setDisplayMessages([{ role: "assistant", content: text }]);
      setPhase("interview");
      speak(text);
    } catch (e) {
      setStartErr("Error al iniciar: " + e.message);
    }
    setStartLoading(false);
  };

  /* ── SEND MESSAGE ── */
  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || aiThinking) return;
    stop(); stopRec();

    const userMsg = { role: "user", content: trimmed };
    const newApi = [...apiMessages, userMsg];
    setApiMessages(newApi);
    setDisplayMessages(prev => [...prev, userMsg]);
    setInputText("");
    setAiThinking(true);
    setInterviewErr("");

    try {
      const raw = await callAI(buildSystem(), newApi);
      const isEnd = raw.includes("|||FIN|||");
      const cleanText = raw.replace("|||FIN|||", "").trim();
      const aiMsg = { role: "assistant", content: cleanText };

      setApiMessages([...newApi, { role: "assistant", content: raw }]);
      setDisplayMessages(prev => [...prev, aiMsg]);
      speak(cleanText);

      if (isEnd) {
        setTimeout(() => finishInterview([...newApi, aiMsg]), 2500);
      }
    } catch (e) {
      setInterviewErr("Error: " + e.message + ". Intenta de nuevo.");
    }
    setAiThinking(false);
  };

  /* ── FINISH & EVALUATE ── */
  const finishInterview = async (history) => {
    setPhase("done");
    setEvalLoading(true);

    const transcript = history
      .filter(m => m.content !== "[INICIAR]")
      .map(m => `${m.role === "assistant" ? "Entrevistador" : "Candidato"}: ${m.content}`)
      .join("\n\n");

    const evalSystem =
      `Eres un evaluador de entrevistas ESTRICTO y HONESTO para el puesto de "${jobRole}".
Analiza la calidad REAL de las respuestas del candidato. Sé crítico:
- Respuestas vagas, cortas o sin ejemplos concretos = puntaje bajo (20-40)
- Respuestas aceptables pero genéricas = puntaje medio (40-65)
- Respuestas con ejemplos reales, métricas y estructura = puntaje alto (65-85)
- Respuestas excepcionales, método STAR completo, muy específicas = 85-100
NO infles el puntaje. Si las respuestas fueron malas, dilo claramente.
Responde ÚNICAMENTE con JSON válido sin texto extra:
{"puntaje":45,"nivel":"Necesitas más preparación","fortalezas":["punto concreto1"],"mejoras":["punto concreto1","punto concreto2","punto concreto3"],"recomendacion":"consejo directo y honesto en 1-2 oraciones"}`;

    try {
      const raw = await callAI(evalSystem, [{ role: "user", content: transcript }], 600);
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) setEvaluation(JSON.parse(match[0]));
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

  const restart = () => {
    stop(); stopRec();
    setPhase("setup");
    setJobRole(""); setCompany(""); setJdText("");
    setApiMessages([]); setDisplayMessages([]);
    setInputText(""); setEvaluation(null);
    setStartErr(""); setInterviewErr("");
  };

  const pi = phase === "setup" ? 0 : phase === "interview" ? 1 : 2;

  return (
    <>
      <style>{css}</style>
      <div className="shell">
        <div className="hd">
          <div className="hd-tag">// AI Interview Trainer · con voz</div>
          <div className="hd-title">Practica para el trabajo que quieres</div>
          <div className="hd-sub">Conversación real con un entrevistador de IA</div>
        </div>

        <div className="steps">
          {[["Tu trabajo", 1], ["Entrevista", 2], ["Resultados", 3]].map(([lbl, n], i) => (
            <div key={n} className={`step-btn${i < pi ? " done" : i === pi ? " active" : ""}`}>
              <div className="step-num">{i < pi ? "✓" : n}</div>
              {lbl}
            </div>
          ))}
        </div>

        {/* ── SETUP ── */}
        {phase === "setup" && (
          <div className="card" key="setup">
            <div className="card-title">¿A qué trabajo quieres aplicar?</div>
            <div className="card-desc">Pega la descripción real del anuncio y practica con un entrevistador de IA en conversación real.</div>
            <div className="row">
              <div className="field">
                <label>Puesto</label>
                <input value={jobRole} onChange={e => setJobRole(e.target.value)} placeholder="ej. Diseñador UX/UI" />
              </div>
              <div className="field">
                <label>Empresa</label>
                <input value={company} onChange={e => setCompany(e.target.value)} placeholder="ej. Google (opcional)" />
              </div>
            </div>
            <div className="field">
              <label>Descripción del trabajo</label>
              <textarea
                rows={6}
                placeholder="Pega aquí el texto del anuncio: requisitos, responsabilidades, habilidades buscadas..."
                value={jdText}
                onChange={e => setJdText(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: ".7rem", color: "#444", fontFamily: "'DM Mono',monospace", marginBottom: 8 }}>Ejemplos rápidos:</div>
              {EXAMPLES.map(ex => (
                <span key={ex.role} className="badge" onClick={() => { setJobRole(ex.role); setCompany(ex.company); setJdText(ex.jd); }}>
                  {ex.role}
                </span>
              ))}
            </div>
            <div className="field" style={{ maxWidth: 220 }}>
              <label>Número de preguntas</label>
              <select value={numQ} onChange={e => setNumQ(e.target.value)}>
                <option value="3">3 — Rápido</option>
                <option value="5">5 — Normal</option>
                <option value="7">7 — Completo</option>
                <option value="10">10 — Intensivo</option>
              </select>
            </div>
            <button className="btn" onClick={startInterview} disabled={startLoading || !jobRole.trim() || !jdText.trim()}>
              {startLoading ? "Preparando entrevistador..." : "Iniciar entrevista →"}
            </button>
            {startLoading && (
              <div className="loader">
                <div className="dot" /><div className="dot" /><div className="dot" />
                Preparando tu entrevistador de IA...
              </div>
            )}
            {startErr && <div className="err-box">{startErr}</div>}
          </div>
        )}

        {/* ── INTERVIEW ── */}
        {phase === "interview" && (
          <div className="card" key="interview">
            <div className="job-chip">
              <div className="job-icon">💼</div>
              <div>
                <div className="job-company">{company || "Empresa"}</div>
                <div className="job-role">{jobRole}</div>
              </div>
            </div>

            <div className="chat-area">
              {displayMessages.map((msg, i) => (
                <div key={i} className={`msg msg-${msg.role === "assistant" ? "ai" : "user"}`}>
                  {msg.role === "assistant" && <div className="avatar">🎙</div>}
                  <div className={`bubble bubble-${msg.role === "assistant" ? "ai" : "user"}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {aiThinking && (
                <div className="msg msg-ai">
                  <div className="avatar">🎙</div>
                  <div className="bubble bubble-ai thinking">
                    <div className="t-dot" /><div className="t-dot" /><div className="t-dot" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="speak-indicator">
              {speaking ? "🔊 Entrevistador hablando..." : recording ? "🔴 Grabando — toca detener y luego enviar" : ""}
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
                placeholder={aiThinking ? "Entrevistador respondiendo..." : "Tu respuesta..."}
                disabled={aiThinking}
              />
              <button className="send-btn" onClick={() => sendMessage(inputText)} disabled={aiThinking || !inputText.trim()}>
                ➤
              </button>
            </div>

            <button className="end-btn" onClick={() => finishInterview(apiMessages)}>
              Terminar entrevista y ver resultados
            </button>
          </div>
        )}

        {/* ── RESULTS ── */}
        {phase === "done" && (
          <div className="card" key="done">
            <div className="card-title">Entrevista completada 🎉</div>
            <div className="card-desc" style={{ marginBottom: 20 }}>
              Evaluación para <strong style={{ color: "#eeeeff" }}>{jobRole}</strong>{company ? ` en ${company}` : ""}
            </div>

            {evalLoading && (
              <div className="loader">
                <div className="dot" /><div className="dot" /><div className="dot" />
                Analizando tu desempeño...
              </div>
            )}

            {evaluation && (
              <>
                <div className="summary-bar">
                  <div className={`summary-ring ${SC(evaluation.puntaje)}`}>{evaluation.puntaje}</div>
                  <div>
                    <div className="summary-label">Puntaje general</div>
                    <div className="summary-val">{evaluation.nivel}</div>
                  </div>
                </div>
                <div className="fb">
                  <div className="fb-head">Fortalezas</div>
                  <div className="fb-body">
                    {evaluation.fortalezas?.map((f, i) => (
                      <div className="li" key={i}><span className="li-dot" style={{ color: "#4ecc96" }}>✓</span>{f}</div>
                    ))}
                  </div>
                </div>
                <div className="fb">
                  <div className="fb-head">Áreas de mejora</div>
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
              {startLoading ? "Preparando..." : "Repetir entrevista →"}
            </button>
            <button className="btn-ghost" onClick={restart}>Practicar para otro trabajo</button>
          </div>
        )}
      </div>
    </>
  );
}
