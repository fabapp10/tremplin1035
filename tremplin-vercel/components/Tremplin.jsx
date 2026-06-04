"use client";

import React, { useState, useRef } from "react";
import {
  FileText, Mail, MessageSquareText, Camera, ArrowLeft,
  Sparkles, Copy, Check, Loader2, Upload, Lightbulb,
  Briefcase, GraduationCap, Languages, Heart, Wrench, Download,
  Lock, LogOut, Star, Zap, Clock, Target
} from "lucide-react";

/* ============================================================
   TREMPLIN — assistant de candidature propulsé par l'IA
   Prototype : CV · Lettre de motivation · Prépa entretien · Photo
   ============================================================ */

const C = {
  ink: "#19283D",
  inkSoft: "#3A4B63",
  paper: "#F5EFE2",
  paperDeep: "#ECE3D0",
  card: "#FBF7EE",
  amber: "#D9803B",
  amberDeep: "#B5612A",
  line: "#D8CDB6",
  muted: "#7C7461",
  ok: "#3E7C5A",
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Hanken+Grotesk:wght@400;500;600;700&display=swap');
@keyframes tr-rise { from { opacity:0; transform:translateY(14px);} to {opacity:1; transform:translateY(0);} }
@keyframes tr-spin { to { transform: rotate(360deg);} }
@keyframes tr-float { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-10px);} }
.tr-float { animation: tr-float 5s ease-in-out infinite; }
.tr-rise { animation: tr-rise .5s cubic-bezier(.2,.7,.2,1) both; }
.tr-price { transition: transform .2s ease, box-shadow .2s ease; }
.tr-price:hover { transform: translateY(-5px); box-shadow: 0 24px 50px -28px rgba(25,40,61,.5); }
.tr-spin { animation: tr-spin 1s linear infinite; }
.tr-card:hover { transform: translateY(-4px); box-shadow: 0 18px 40px -22px rgba(25,40,61,.45); }
.tr-card { transition: transform .25s ease, box-shadow .25s ease; }
.tr-btn { transition: transform .15s ease, background .2s ease, opacity .2s; }
.tr-btn:hover:not(:disabled) { transform: translateY(-1px); }
.tr-btn:active:not(:disabled) { transform: translateY(0); }
.tr-field:focus { outline: none; border-color: ${C.amber}; box-shadow: 0 0 0 3px rgba(217,128,59,.15); }
::placeholder { color: ${C.muted}; opacity:.7; }
.tr-edit { cursor: text; border-radius: 4px; transition: background .12s, box-shadow .12s; }
.tr-edit:hover { background: rgba(217,128,59,.14); }
.tr-edit:focus { outline: none; background: rgba(217,128,59,.16); box-shadow: 0 0 0 2px rgba(217,128,59,.35); }
.tr-swatch:hover { transform: scale(1.06); }
html { scroll-behavior: smooth; }
.tr-btn:focus-visible, .tr-field:focus-visible, button:focus-visible, [tabindex]:focus-visible { outline: 3px solid rgba(217,128,59,.6); outline-offset: 2px; border-radius: 8px; }
.tr-card:active { transform: translateY(-2px) scale(.995); }
.tr-price:active { transform: translateY(-3px) scale(.995); }
.tr-num { font-variant-numeric: tabular-nums; }
@keyframes tr-stagger { from { opacity:0; transform: translateY(18px);} to { opacity:1; transform: translateY(0);} }
.tr-stagger > * { animation: tr-stagger .55s cubic-bezier(.2,.7,.2,1) both; }
.tr-stagger > *:nth-child(1){ animation-delay:.04s } .tr-stagger > *:nth-child(2){ animation-delay:.10s }
.tr-stagger > *:nth-child(3){ animation-delay:.16s } .tr-stagger > *:nth-child(4){ animation-delay:.22s }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; }
  html { scroll-behavior: auto; }
}
@media print {
  @page { size: A4; margin: 14mm; }
  body * { visibility: hidden !important; }
  .tr-printable, .tr-printable * { visibility: visible !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .tr-printable { position: absolute !important; left: 0; top: 0; width: 180mm !important; margin: 0 !important; box-shadow: none !important; }
  .tr-noprint { display: none !important; }
  .tr-edit:hover { background: transparent !important; box-shadow: none !important; }
}
`;

/* ---------- appel API Claude (texte + vision) ---------- */
async function callClaude(messages, system) {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, messages }),
  });
  if (!res.ok) throw new Error("Erreur API " + res.status);
  const data = await res.json();
  return (data.content || [])
    .map((i) => (i.type === "text" ? i.text : ""))
    .filter(Boolean)
    .join("\n");
}

function parseJSON(text) {
  const clean = text.replace(/```json|```/g, "").trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("pas de JSON");
  return JSON.parse(clean.slice(start, end + 1));
}

/* ---------- petits composants UI ---------- */
function Field({ label, icon, value, onChange, placeholder, area, rows = 3 }) {
  const base = {
    width: "100%", border: `1.5px solid ${C.line}`, background: "#fff",
    borderRadius: 10, padding: "12px 14px", fontFamily: "'Hanken Grotesk',sans-serif",
    fontSize: 16, color: C.ink, resize: "vertical", boxSizing: "border-box",
  };
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <span style={{
        display: "flex", alignItems: "center", gap: 6, fontSize: 12.5,
        fontWeight: 600, color: C.inkSoft, marginBottom: 6, letterSpacing: .2,
        textTransform: "uppercase",
      }}>
        {icon}{label}
      </span>
      {area ? (
        <textarea className="tr-field" style={base} rows={rows}
          value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input className="tr-field" style={base}
          value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </label>
  );
}

function Btn({ children, onClick, disabled, loading, ghost }) {
  return (
    <button className="tr-btn" onClick={onClick} disabled={disabled || loading}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8, border: "none",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        background: ghost ? "transparent" : C.ink,
        color: ghost ? C.ink : C.paper,
        borderRadius: 999, padding: ghost ? "10px 16px" : "13px 26px",
        fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 600, fontSize: 14.5,
        boxShadow: ghost ? "none" : `inset 0 0 0 1px ${C.line}`,
        opacity: disabled ? .45 : 1,
      }}>
      {loading ? <Loader2 size={17} className="tr-spin" /> : children}
    </button>
  );
}

function CopyBtn({ text }) {
  const [done, setDone] = useState(false);
  return (
    <button className="tr-btn" onClick={() => {
      navigator.clipboard?.writeText(text); setDone(true); setTimeout(() => setDone(false), 1600);
    }}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6, border: `1.5px solid ${C.line}`,
        background: "#fff", color: done ? C.ok : C.inkSoft, borderRadius: 999,
        padding: "7px 14px", fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 600,
        fontSize: 13, cursor: "pointer",
      }}>
      {done ? <Check size={15} /> : <Copy size={15} />}{done ? "Copié" : "Copier"}
    </button>
  );
}

function PrintButton() {
  return (
    <button className="tr-btn" onClick={() => window.print()}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6, border: `1.5px solid ${C.ink}`,
        background: C.ink, color: C.paper, borderRadius: 999,
        padding: "7px 14px", fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 600,
        fontSize: 13, cursor: "pointer",
      }}>
      <Download size={15} />Télécharger PDF
    </button>
  );
}

function OutputBox({ title, children, copyText, printable }) {
  return (
    <div className="tr-rise" style={{
      background: C.card, border: `1.5px solid ${C.line}`, borderRadius: 14,
      padding: "22px 24px", marginTop: 18,
    }}>
      <div className="tr-noprint" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 10, flexWrap: "wrap" }}>
        <h3 style={{ margin: 0, fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 19, color: C.ink }}>{title}</h3>
        <div style={{ display: "flex", gap: 8 }}>
          {copyText && <CopyBtn text={copyText} />}
          {printable && <PrintButton />}
        </div>
      </div>
      {children}
    </div>
  );
}

function ErrBox({ msg }) {
  if (!msg) return null;
  return <div role="alert" aria-live="assertive" style={{
    marginTop: 14, padding: "10px 14px", borderRadius: 10, fontSize: 13.5,
    background: "#fbeae0", color: C.amberDeep, border: `1px solid ${C.amber}`,
    fontFamily: "'Hanken Grotesk',sans-serif",
  }}>{msg}</div>;
}

/* texte simple → paragraphes */
function Prose({ text }) {
  return (
    <div style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 15, lineHeight: 1.7, color: C.ink, whiteSpace: "pre-wrap" }}>
      {text}
    </div>
  );
}

/* ============================================================
   MODULE 1 — CV
   ============================================================ */
function ModuleCV() {
  const [f, setF] = useState({
    nom: "", titre: "", contact: "", ville: "",
    exp: "", formation: "", competences: "", langues: "", interets: "",
  });
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));
  const [cv, setCv] = useState(null);   // données éditables du CV généré
  const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [tpl, setTpl] = useState("atlas");
  const [theme, setTheme] = useState(THEMES[0]);

  const update = (path, val) => setCv((c) => setIn(c, path, val));
  const t = {
    primary: theme.primary, accent: theme.accent, accentDeep: darken(theme.accent, 0.18),
    paper: C.paper, line: C.line, muted: C.muted, inkSoft: C.inkSoft,
  };

  async function generate() {
    setErr(""); setCv(null); setRaw(""); setLoading(true);
    try {
      const sys = "Tu es un expert en recrutement français. À partir des informations brutes d'un candidat, tu rédiges un CV professionnel, percutant et concis en français. Reformule et valorise (verbes d'action, résultats chiffrés quand c'est plausible). Réponds UNIQUEMENT avec un objet JSON, sans texte autour, au format : {\"titre\":\"\",\"accroche\":\"phrase de 2 lignes\",\"experiences\":[{\"poste\":\"\",\"structure\":\"\",\"periode\":\"\",\"points\":[\"\",\"\"]}],\"formations\":[{\"intitule\":\"\",\"etablissement\":\"\",\"annee\":\"\"}],\"competences\":[\"\"],\"langues\":[\"\"],\"interets\":[\"\"]}";
      const u = `Nom: ${f.nom}\nTitre/métier visé: ${f.titre}\nVille: ${f.ville}\nExpériences: ${f.exp}\nFormations: ${f.formation}\nCompétences: ${f.competences}\nLangues: ${f.langues}\nCentres d'intérêt: ${f.interets}`;
      const txt = await callClaude([{ role: "user", content: u }], sys);
      setRaw(txt);
      try {
        const p = parseJSON(txt);
        setCv({
          nom: f.nom, titre: p.titre || f.titre, contact: f.contact, ville: f.ville,
          accroche: p.accroche || "", experiences: p.experiences || [], formations: p.formations || [],
          competences: p.competences || [], langues: p.langues || [], interets: p.interets || [],
        });
      } catch { setCv(null); }
    } catch (e) { setErr("Impossible de générer le CV. Réessaie dans un instant."); }
    setLoading(false);
  }

  const ready = f.nom && f.titre && (f.exp || f.formation);

  return (
    <ModuleShell wide title="Générateur de CV" sub="Réponds au questionnaire, l'IA rédige et structure un CV professionnel.">
      <Field label="Nom complet" value={f.nom} onChange={set("nom")} placeholder="Camille Dubois" />
      <Field label="Métier / titre visé" value={f.titre} onChange={set("titre")} placeholder="Chargée de communication" />
      <Field label="Contact" value={f.contact} onChange={set("contact")} placeholder="email · téléphone · LinkedIn" />
      <Field label="Ville" value={f.ville} onChange={set("ville")} placeholder="Lyon" />
      <Field label="Expériences" icon={<Briefcase size={13} />} area rows={4} value={f.exp} onChange={set("exp")}
        placeholder="Liste tes postes : intitulé, entreprise, dates, ce que tu y faisais. Écris en vrac, l'IA reformule." />
      <Field label="Formations" icon={<GraduationCap size={13} />} area value={f.formation} onChange={set("formation")}
        placeholder="Diplômes, écoles, années." />
      <Field label="Compétences" icon={<Wrench size={13} />} area value={f.competences} onChange={set("competences")}
        placeholder="Logiciels, savoir-faire, outils..." />
      <Field label="Langues" icon={<Languages size={13} />} value={f.langues} onChange={set("langues")} placeholder="Français, Anglais (courant)..." />
      <Field label="Centres d'intérêt" icon={<Heart size={13} />} value={f.interets} onChange={set("interets")} placeholder="Optionnel" />

      <Btn onClick={generate} loading={loading} disabled={!ready}><Sparkles size={17} />Générer mon CV</Btn>
      <ErrBox msg={err} />

      {cv && (
        <OutputBox title="Ton CV" copyText={cvToText(cv)} printable>
          <TemplatePicker tpl={tpl} setTpl={setTpl} />
          <ColorControls theme={theme} setTheme={setTheme} />
          <div className="tr-noprint" style={{
            fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 12.5, color: C.muted,
            margin: "0 0 14px", display: "flex", alignItems: "center", gap: 6,
          }}>
            <Lightbulb size={14} /> Clique sur n'importe quel texte du CV pour le modifier.
          </div>
          <div className="tr-printable">
            {tpl === "atlas" && <CVAtlas cv={cv} t={t} update={update} />}
            {tpl === "edito" && <CVEdito cv={cv} t={t} update={update} />}
            {tpl === "bloc" && <CVBloc cv={cv} t={t} update={update} />}
          </div>
        </OutputBox>
      )}
      {!cv && raw && <OutputBox title="Ton CV" copyText={raw}><Prose text={raw} /></OutputBox>}
    </ModuleShell>
  );
}

const TEMPLATES = [
  { id: "atlas", name: "Atlas", desc: "Colonne sombre" },
  { id: "edito", name: "Édito", desc: "Épuré, éditorial" },
  { id: "bloc", name: "Bloc", desc: "Bandeau graphique" },
];

function TemplatePicker({ tpl, setTpl }) {
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
      {TEMPLATES.map((t) => {
        const on = tpl === t.id;
        return (
          <button key={t.id} className="tr-btn" onClick={() => setTpl(t.id)} style={{
            cursor: "pointer", textAlign: "left", borderRadius: 12, padding: "9px 15px",
            border: `1.5px solid ${on ? C.ink : C.line}`,
            background: on ? C.ink : "#fff", color: on ? C.paper : C.inkSoft,
            fontFamily: "'Hanken Grotesk',sans-serif",
          }}>
            <div style={{ fontWeight: 700, fontSize: 13.5 }}>{t.name}</div>
            <div style={{ fontSize: 11.5, opacity: .75 }}>{t.desc}</div>
          </button>
        );
      })}
    </div>
  );
}

/* helpers partagés entre modèles */
function initialsOf(nom) {
  return (nom || "").split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}
function splitLines(s) {
  return (s || "").split(/[·,\n]/).map((x) => x.trim()).filter(Boolean);
}

/* écrit une valeur dans une copie immuable de l'objet, selon un chemin */
function setIn(obj, path, val) {
  if (path.length === 0) return val;
  const [k, ...rest] = path;
  const copy = Array.isArray(obj) ? [...obj] : { ...obj };
  copy[k] = setIn(obj ? obj[k] : undefined, rest, val);
  return copy;
}

/* assombrit une couleur hex */
function darken(hex, amt) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  const r = Math.round(((n >> 16) & 255) * (1 - amt));
  const g = Math.round(((n >> 8) & 255) * (1 - amt));
  const b = Math.round((n & 255) * (1 - amt));
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

/* élément de texte éditable en cliquant dessus */
function E({ value, onChange, style, block }) {
  const Tag = block ? "div" : "span";
  return (
    <Tag className="tr-edit" contentEditable suppressContentEditableWarning
      onBlur={(e) => { const v = e.currentTarget.innerText; if (v !== value) onChange(v); }}
      style={{ whiteSpace: block ? "pre-line" : "normal", display: block ? "block" : "inline", ...style }}>
      {value}
    </Tag>
  );
}

/* CV éditable -> texte brut (pour le bouton Copier) */
function cvToText(cv) {
  const L = [];
  L.push(cv.nom, cv.titre, [cv.ville, cv.contact].filter(Boolean).join(" · "), "");
  if (cv.accroche) L.push(cv.accroche, "");
  if (cv.experiences?.length) { L.push("EXPÉRIENCES"); cv.experiences.forEach((e) => { L.push(`${e.poste} · ${e.structure} (${e.periode})`); (e.points || []).forEach((p) => L.push("  - " + p)); }); L.push(""); }
  if (cv.formations?.length) { L.push("FORMATION"); cv.formations.forEach((e) => L.push(`${e.intitule} — ${e.etablissement} (${e.annee})`)); L.push(""); }
  if (cv.competences?.length) L.push("COMPÉTENCES : " + cv.competences.join(", "));
  if (cv.langues?.length) L.push("LANGUES : " + cv.langues.join(", "));
  if (cv.interets?.length) L.push("CENTRES D'INTÉRÊT : " + cv.interets.join(", "));
  return L.join("\n");
}

/* palettes de couleurs */
const THEMES = [
  { name: "Encre & ambre", primary: "#19283D", accent: "#D9803B" },
  { name: "Forêt", primary: "#1F3A2E", accent: "#4F9D69" },
  { name: "Bordeaux", primary: "#3A1F2B", accent: "#C2566F" },
  { name: "Azur", primary: "#18233A", accent: "#4A82C2" },
  { name: "Graphite", primary: "#272727", accent: "#C9893B" },
];

function ColorControls({ theme, setTheme }) {
  const swatch = (p) => (
    <button key={p.name} className="tr-btn tr-swatch" onClick={() => setTheme(p)} title={p.name} style={{
      display: "flex", alignItems: "center", gap: 7, cursor: "pointer", borderRadius: 999,
      border: `1.5px solid ${theme.name === p.name ? C.ink : C.line}`, background: "#fff",
      padding: "5px 11px 5px 6px", fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 12.5, color: C.inkSoft, fontWeight: 600,
    }}>
      <span style={{ display: "flex" }}>
        <span style={{ width: 14, height: 14, borderRadius: "50%", background: p.primary }} />
        <span style={{ width: 14, height: 14, borderRadius: "50%", background: p.accent, marginLeft: -5, border: "1.5px solid #fff" }} />
      </span>
      {p.name}
    </button>
  );
  const picker = (label, key) => (
    <label style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 12.5, color: C.inkSoft, fontWeight: 600, cursor: "pointer" }}>
      {label}
      <input type="color" value={theme[key]}
        onChange={(e) => setTheme({ ...theme, [key]: e.target.value, name: "Perso" })}
        style={{ width: 26, height: 26, border: "none", background: "none", padding: 0, cursor: "pointer" }} />
    </label>
  );
  return (
    <div style={{ background: C.paper, border: `1px solid ${C.line}`, borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
      <div style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 11.5, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.muted, marginBottom: 10 }}>Couleurs</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        {THEMES.map(swatch)}
        <span style={{ width: 1, height: 24, background: C.line, margin: "0 4px" }} />
        {picker("Foncé", "primary")}
        {picker("Accent", "accent")}
      </div>
    </div>
  );
}

/* ===== Modèle 1 — ATLAS (colonne sombre) ===== */
function CVAtlas({ cv, t, update }) {
  const H = ({ children, dark }) => (
    <div style={{
      fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 11,
      letterSpacing: 1.8, textTransform: "uppercase",
      color: dark ? t.accent : t.accentDeep,
      display: "flex", alignItems: "center", gap: 8,
      margin: dark ? "22px 0 11px" : "0 0 13px",
    }}>
      {children}
      <span style={{ flex: 1, height: 1, background: dark ? "rgba(255,255,255,.18)" : t.line }} />
    </div>
  );
  return (
    <div style={{
      display: "flex", background: "#fff", borderRadius: 14, overflow: "hidden",
      border: `1px solid ${t.line}`, boxShadow: "0 14px 40px -26px rgba(25,40,61,.4)", minHeight: 560,
    }}>
      <aside style={{ width: "37%", minWidth: 200, background: t.primary, color: t.paper, padding: "30px 22px" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: t.accent, display: "grid", placeItems: "center", marginBottom: 18, fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 24, color: t.primary }}>{initialsOf(cv.nom) || "•"}</div>

        <H dark>Contact</H>
        <div style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 13, lineHeight: 1.75, color: "rgba(245,239,226,.88)", wordBreak: "break-word" }}>
          <E value={cv.ville} onChange={(v) => update(["ville"], v)} block style={{ marginBottom: 2 }} />
          <E value={cv.contact} onChange={(v) => update(["contact"], v)} block />
        </div>

        {cv.competences?.length > 0 && <>
          <H dark>Compétences</H>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {cv.competences.map((c, i) => (
              <div key={i} style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 13, color: "rgba(245,239,226,.92)" }}>
                <span style={{ color: t.accent, marginRight: 7 }}>—</span>
                <E value={c} onChange={(v) => update(["competences", i], v)} />
              </div>
            ))}
          </div>
        </>}

        {cv.langues?.length > 0 && <>
          <H dark>Langues</H>
          {cv.langues.map((l, i) => <E key={i} value={l} onChange={(v) => update(["langues", i], v)} block style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 13, color: "rgba(245,239,226,.92)", marginBottom: 5 }} />)}
        </>}

        {cv.interets?.length > 0 && <>
          <H dark>Centres d'intérêt</H>
          {cv.interets.map((l, i) => <E key={i} value={l} onChange={(v) => update(["interets", i], v)} block style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 13, color: "rgba(245,239,226,.92)", marginBottom: 5 }} />)}
        </>}
      </aside>

      <section style={{ flex: 1, padding: "32px 30px" }}>
        <E value={cv.nom} onChange={(v) => update(["nom"], v)} block style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 32, color: t.primary, lineHeight: 1.05 }} />
        <E value={cv.titre} onChange={(v) => update(["titre"], v)} block style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 14, color: t.accentDeep, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 6 }} />

        {cv.accroche && <E value={cv.accroche} onChange={(v) => update(["accroche"], v)} block style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 14.5, lineHeight: 1.65, color: t.inkSoft, margin: "16px 0 26px" }} />}

        {cv.experiences?.length > 0 && <>
          <H>Expériences</H>
          {cv.experiences.map((e, i) => (
            <div key={i} style={{ position: "relative", paddingLeft: 18, marginBottom: 16 }}>
              <span style={{ position: "absolute", left: 0, top: 6, width: 8, height: 8, borderRadius: "50%", background: t.accent }} />
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 14.5, color: t.primary, fontFamily: "'Hanken Grotesk',sans-serif" }}>
                  <E value={e.poste} onChange={(v) => update(["experiences", i, "poste"], v)} />
                  <span style={{ fontWeight: 500, color: t.inkSoft }}> · <E value={e.structure} onChange={(v) => update(["experiences", i, "structure"], v)} /></span>
                </span>
                <E value={e.periode} onChange={(v) => update(["experiences", i, "periode"], v)} style={{ fontSize: 12.5, color: t.muted, fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 600 }} />
              </div>
              <ul style={{ margin: "6px 0 0", paddingLeft: 16 }}>
                {(e.points || []).map((p, j) => <li key={j} style={{ fontSize: 13.8, lineHeight: 1.55, color: t.inkSoft, fontFamily: "'Hanken Grotesk',sans-serif", marginBottom: 2 }}><E value={p} onChange={(v) => update(["experiences", i, "points", j], v)} /></li>)}
              </ul>
            </div>
          ))}
        </>}

        {cv.formations?.length > 0 && <div style={{ marginTop: 22 }}>
          <H>Formation</H>
          {cv.formations.map((e, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 14, marginBottom: 7 }}>
              <span style={{ color: t.primary, fontWeight: 600 }}>
                <E value={e.intitule} onChange={(v) => update(["formations", i, "intitule"], v)} />
                <span style={{ fontWeight: 400, color: t.inkSoft }}> — <E value={e.etablissement} onChange={(v) => update(["formations", i, "etablissement"], v)} /></span>
              </span>
              <E value={e.annee} onChange={(v) => update(["formations", i, "annee"], v)} style={{ color: t.muted, fontWeight: 600, fontSize: 12.5 }} />
            </div>
          ))}
        </div>}
      </section>
    </div>
  );
}

/* ===== Modèle 2 — ÉDITO (épuré, une colonne, éditorial) ===== */
function CVEdito({ cv, t, update }) {
  const H = ({ children }) => (
    <div style={{ fontFamily: "'Fraunces',serif", fontStyle: "italic", fontWeight: 600, fontSize: 19, color: t.primary, margin: "26px 0 12px", display: "flex", alignItems: "center", gap: 12 }}>
      {children}<span style={{ flex: 1, height: 1.5, background: t.line }} />
    </div>
  );
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "44px 48px", border: `1px solid ${t.line}`, boxShadow: "0 14px 40px -26px rgba(25,40,61,.4)" }}>
      <div style={{ textAlign: "center", borderBottom: `2px solid ${t.primary}`, paddingBottom: 22 }}>
        <E value={cv.nom} onChange={(v) => update(["nom"], v)} block style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 40, color: t.primary, lineHeight: 1, letterSpacing: -.5 }} />
        <E value={cv.titre} onChange={(v) => update(["titre"], v)} block style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 13.5, color: t.accentDeep, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", marginTop: 10 }} />
        <div style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 13, color: t.muted, marginTop: 12, display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
          <E value={cv.ville} onChange={(v) => update(["ville"], v)} />
          <E value={cv.contact} onChange={(v) => update(["contact"], v)} />
        </div>
      </div>

      {cv.accroche && <E value={cv.accroche} onChange={(v) => update(["accroche"], v)} block style={{ fontFamily: "'Fraunces',serif", fontSize: 16, lineHeight: 1.6, color: t.inkSoft, textAlign: "center", maxWidth: 540, margin: "22px auto 4px" }} />}

      {cv.experiences?.length > 0 && <><H>Expériences</H>
        {cv.experiences.map((e, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
              <span style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 15, color: t.primary }}>
                <E value={e.poste} onChange={(v) => update(["experiences", i, "poste"], v)} />
                <span style={{ fontWeight: 500, color: t.inkSoft }}> · <E value={e.structure} onChange={(v) => update(["experiences", i, "structure"], v)} /></span>
              </span>
              <E value={e.periode} onChange={(v) => update(["experiences", i, "periode"], v)} style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 12.5, color: t.muted, fontWeight: 600 }} />
            </div>
            <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
              {(e.points || []).map((p, j) => <li key={j} style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 14, lineHeight: 1.55, color: t.inkSoft, marginBottom: 2 }}><E value={p} onChange={(v) => update(["experiences", i, "points", j], v)} /></li>)}
            </ul>
          </div>
        ))}</>}

      {cv.formations?.length > 0 && <><H>Formation</H>
        {cv.formations.map((e, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 14, marginBottom: 6 }}>
            <span style={{ color: t.primary, fontWeight: 600 }}>
              <E value={e.intitule} onChange={(v) => update(["formations", i, "intitule"], v)} />
              <span style={{ fontWeight: 400, color: t.inkSoft }}> — <E value={e.etablissement} onChange={(v) => update(["formations", i, "etablissement"], v)} /></span>
            </span>
            <E value={e.annee} onChange={(v) => update(["formations", i, "annee"], v)} style={{ color: t.muted, fontWeight: 600, fontSize: 12.5 }} />
          </div>
        ))}</>}

      <div style={{ display: "flex", gap: 44, flexWrap: "wrap", marginTop: 8 }}>
        {cv.competences?.length > 0 && (
          <div style={{ flex: 1, minWidth: 200 }}>
            <H>Compétences</H>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {cv.competences.map((c, i) => <span key={i} style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 12.5, border: `1px solid ${t.line}`, color: t.primary, padding: "4px 11px", borderRadius: 999 }}><E value={c} onChange={(v) => update(["competences", i], v)} /></span>)}
            </div>
          </div>
        )}
        {(cv.langues?.length > 0 || cv.interets?.length > 0) && (
          <div style={{ flex: 1, minWidth: 180 }}>
            {cv.langues?.length > 0 && <><H>Langues</H><div style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 14, color: t.inkSoft, lineHeight: 1.7 }}>{cv.langues.map((l, i) => <E key={i} value={l} onChange={(v) => update(["langues", i], v)} block />)}</div></>}
            {cv.interets?.length > 0 && <><H>Intérêts</H><div style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 14, color: t.inkSoft, lineHeight: 1.7 }}>{cv.interets.map((l, i) => <E key={i} value={l} onChange={(v) => update(["interets", i], v)} block />)}</div></>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== Modèle 3 — BLOC (bandeau graphique en tête) ===== */
function CVBloc({ cv, t, update }) {
  const H = ({ children }) => (
    <div style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: t.primary, margin: "22px 0 12px", paddingLeft: 12, borderLeft: `4px solid ${t.accent}` }}>{children}</div>
  );
  return (
    <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", border: `1px solid ${t.line}`, boxShadow: "0 14px 40px -26px rgba(25,40,61,.4)" }}>
      <div style={{ background: t.primary, padding: "30px 34px", display: "flex", alignItems: "center", gap: 22 }}>
        <div style={{ width: 70, height: 70, borderRadius: 16, background: t.accent, display: "grid", placeItems: "center", flexShrink: 0, fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 26, color: t.primary }}>{initialsOf(cv.nom) || "•"}</div>
        <div style={{ flex: 1 }}>
          <E value={cv.nom} onChange={(v) => update(["nom"], v)} block style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 30, color: t.paper, lineHeight: 1.05 }} />
          <E value={cv.titre} onChange={(v) => update(["titre"], v)} block style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 13.5, color: t.accent, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginTop: 5 }} />
          <div style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 12.5, color: "rgba(245,239,226,.78)", marginTop: 8, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <E value={cv.ville} onChange={(v) => update(["ville"], v)} />
            <E value={cv.contact} onChange={(v) => update(["contact"], v)} />
          </div>
        </div>
      </div>

      <div style={{ padding: "8px 34px 34px" }}>
        {cv.accroche && <E value={cv.accroche} onChange={(v) => update(["accroche"], v)} block style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 14.5, lineHeight: 1.65, color: t.inkSoft, margin: "22px 0 4px" }} />}

        {cv.experiences?.length > 0 && <><H>Expériences</H>
          {cv.experiences.map((e, i) => (
            <div key={i} style={{ marginBottom: 15 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                <span style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 14.5, color: t.primary }}>
                  <E value={e.poste} onChange={(v) => update(["experiences", i, "poste"], v)} />
                  <span style={{ fontWeight: 500, color: t.inkSoft }}> · <E value={e.structure} onChange={(v) => update(["experiences", i, "structure"], v)} /></span>
                </span>
                <span style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 12.5, color: "#fff", fontWeight: 600, background: t.accentDeep, padding: "1px 9px", borderRadius: 999 }}><E value={e.periode} onChange={(v) => update(["experiences", i, "periode"], v)} /></span>
              </div>
              <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
                {(e.points || []).map((p, j) => <li key={j} style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 14, lineHeight: 1.55, color: t.inkSoft, marginBottom: 2 }}><E value={p} onChange={(v) => update(["experiences", i, "points", j], v)} /></li>)}
              </ul>
            </div>
          ))}</>}

        {cv.formations?.length > 0 && <><H>Formation</H>
          {cv.formations.map((e, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 14, marginBottom: 6 }}>
              <span style={{ color: t.primary, fontWeight: 600 }}>
                <E value={e.intitule} onChange={(v) => update(["formations", i, "intitule"], v)} />
                <span style={{ fontWeight: 400, color: t.inkSoft }}> — <E value={e.etablissement} onChange={(v) => update(["formations", i, "etablissement"], v)} /></span>
              </span>
              <E value={e.annee} onChange={(v) => update(["formations", i, "annee"], v)} style={{ color: t.muted, fontWeight: 600, fontSize: 12.5 }} />
            </div>
          ))}</>}

        <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
          {cv.competences?.length > 0 && (
            <div style={{ flex: 1, minWidth: 200 }}>
              <H>Compétences</H>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {cv.competences.map((c, i) => <span key={i} style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 12.5, background: C.paperDeep, color: t.primary, padding: "4px 11px", borderRadius: 8 }}><E value={c} onChange={(v) => update(["competences", i], v)} /></span>)}
              </div>
            </div>
          )}
          {(cv.langues?.length > 0 || cv.interets?.length > 0) && (
            <div style={{ flex: 1, minWidth: 180 }}>
              {cv.langues?.length > 0 && <><H>Langues</H><div style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 14, color: t.inkSoft, lineHeight: 1.7 }}>{cv.langues.map((l, i) => <E key={i} value={l} onChange={(v) => update(["langues", i], v)} block />)}</div></>}
              {cv.interets?.length > 0 && <><H>Intérêts</H><div style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 14, color: t.inkSoft, lineHeight: 1.7 }}>{cv.interets.map((l, i) => <E key={i} value={l} onChange={(v) => update(["interets", i], v)} block />)}</div></>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function ModuleLettre() {
  const [f, setF] = useState({ nom: "", coords: "", ville: "", poste: "", entreprise: "", adresse: "", annonce: "", profil: "", ton: "Professionnel et chaleureux" });
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));
  const [out, setOut] = useState(null); const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(false); const [err, setErr] = useState("");

  const dateFr = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  async function generate() {
    setErr(""); setOut(null); setRaw(""); setLoading(true);
    try {
      const sys = `Tu es un expert en candidatures françaises. Rédige le corps d'une lettre de motivation personnalisée, sincère et convaincante, adaptée précisément à l'entreprise et au poste. Structure du corps : salutation ("Madame, Monsieur," sur sa propre ligne), accroche montrant l'intérêt pour CETTE entreprise, adéquation profil/besoin, projection/motivation, puis formule de politesse finale. Ton : ${f.ton}. Environ 280 mots, prêt à envoyer, sans crochets ni mentions à compléter, sans en-tête d'adresse ni date (gérés ailleurs), sans signature de nom à la fin. Réponds UNIQUEMENT en JSON : {"objet":"Objet de la lettre (court)","corps":"texte complet avec sauts de ligne entre paragraphes"}`;
      const u = `Candidat : ${f.nom}\nPoste visé : ${f.poste}\nEntreprise : ${f.entreprise}\nAnnonce / description du poste : ${f.annonce}\nProfil / atouts du candidat : ${f.profil}`;
      const txt = await callClaude([{ role: "user", content: u }], sys);
      setRaw(txt);
      try { setOut(parseJSON(txt)); } catch { setOut({ objet: `Candidature au poste de ${f.poste}`, corps: txt }); }
    } catch (e) { setErr("Impossible de générer la lettre. Réessaie."); }
    setLoading(false);
  }
  const ready = f.poste && f.entreprise && f.profil;

  const copyText = out
    ? `${f.nom}\n${f.coords}\n\n${f.entreprise}\n${f.adresse}\n\n${f.ville ? f.ville + ", le " : ""}${dateFr}\n\nObjet : ${out.objet}\n\n${out.corps}\n\n${f.nom}`
    : "";

  return (
    <ModuleShell title="Lettre de motivation" sub="L'IA adapte ta lettre à l'entreprise et au poste précis où tu postules.">
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220 }}><Field label="Ton nom" value={f.nom} onChange={set("nom")} placeholder="Camille Dubois" /></div>
        <div style={{ flex: 1, minWidth: 220 }}><Field label="Ta ville" value={f.ville} onChange={set("ville")} placeholder="Lyon" /></div>
      </div>
      <Field label="Tes coordonnées" value={f.coords} onChange={set("coords")} placeholder="Adresse · email · téléphone" />
      <Field label="Poste visé" value={f.poste} onChange={set("poste")} placeholder="Chargé de communication" />
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220 }}><Field label="Entreprise" value={f.entreprise} onChange={set("entreprise")} placeholder="Nom de l'entreprise" /></div>
        <div style={{ flex: 1, minWidth: 220 }}><Field label="Adresse de l'entreprise" value={f.adresse} onChange={set("adresse")} placeholder="12 rue des Lilas, 69000 Lyon" /></div>
      </div>
      <Field label="Annonce / description du poste" area rows={4} value={f.annonce} onChange={set("annonce")}
        placeholder="Colle l'annonce ou décris la mission : plus c'est précis, plus la lettre est ciblée." />
      <Field label="Tes atouts pour ce poste" area value={f.profil} onChange={set("profil")}
        placeholder="Expériences, compétences et qualités qui collent au poste." />
      <Btn onClick={generate} loading={loading} disabled={!ready}><Sparkles size={17} />Rédiger la lettre</Btn>
      <ErrBox msg={err} />

      {out && (
        <OutputBox title="Ta lettre de motivation" copyText={copyText} printable>
          <div className="tr-printable" style={{ background: "#fff", borderRadius: 10, padding: "34px 38px", border: `1px solid ${C.line}`, fontFamily: "'Hanken Grotesk',sans-serif", color: C.ink }}>
            {/* en-tête : expéditeur à gauche, entreprise à droite */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: 30, flexWrap: "wrap" }}>
              <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>
                <div style={{ fontWeight: 700 }}>{f.nom}</div>
                {f.coords && f.coords.split(/[·,\n]/).map((c, i) => c.trim() && <div key={i} style={{ color: C.inkSoft }}>{c.trim()}</div>)}
              </div>
              <div style={{ fontSize: 13.5, lineHeight: 1.6, textAlign: "right" }}>
                <div style={{ fontWeight: 700 }}>{f.entreprise}</div>
                {f.adresse && f.adresse.split(/[·,\n]/).map((c, i) => c.trim() && <div key={i} style={{ color: C.inkSoft }}>{c.trim()}</div>)}
              </div>
            </div>

            {/* lieu + date, à droite */}
            <div style={{ textAlign: "right", fontSize: 13.5, color: C.inkSoft, margin: "26px 0 22px" }}>
              {f.ville ? `${f.ville}, le ${dateFr}` : `Le ${dateFr}`}
            </div>

            {/* objet */}
            <div style={{ fontSize: 14, marginBottom: 22 }}>
              <span style={{ fontWeight: 700 }}>Objet : </span>{out.objet}
            </div>

            {/* corps */}
            <div style={{ fontSize: 14.5, lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{out.corps}</div>

            {/* signature */}
            <div style={{ textAlign: "right", marginTop: 26, fontWeight: 600 }}>{f.nom}</div>
          </div>
        </OutputBox>
      )}
    </ModuleShell>
  );
}

/* ============================================================
   MODULE 3 — Préparation entretien
   ============================================================ */
function ModuleEntretien() {
  const [f, setF] = useState({ poste: "", entreprise: "", profil: "" });
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));
  const [out, setOut] = useState(null); const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(false); const [err, setErr] = useState("");

  async function generate() {
    setErr(""); setOut(null); setRaw(""); setLoading(true);
    try {
      const sys = 'Tu es coach en recrutement. Tu prépares un candidat à un entretien précis. Réponds UNIQUEMENT en JSON, format : {"points_cles":["3-4 messages clés à faire passer"],"qualites":["3 qualités à mettre en avant, avec un mini-exemple chacune"],"defauts":["2 défauts à présenter intelligemment (formulation + ce qu\'on met en place)"],"competences":["3-4 compétences sur lesquelles insister pour CE poste"],"questions":["3 questions pertinentes à poser au recruteur"]}';
      const u = `Poste : ${f.poste}\nEntreprise : ${f.entreprise}\nProfil du candidat : ${f.profil}`;
      const txt = await callClaude([{ role: "user", content: u }], sys);
      setRaw(txt);
      try { setOut(parseJSON(txt)); } catch { setOut(null); }
    } catch (e) { setErr("Impossible de générer la préparation. Réessaie."); }
    setLoading(false);
  }
  const ready = f.poste && f.profil;

  const Block = ({ icon, title, items, tone }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 14, color: tone || C.ink, marginBottom: 7 }}>{icon}{title}</div>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {items.map((it, i) => <li key={i} style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 14.5, lineHeight: 1.6, color: C.inkSoft, marginBottom: 5 }}>{it}</li>)}
      </ul>
    </div>
  );

  return (
    <ModuleShell title="Préparation à l'entretien" sub="Messages clés, qualités/défauts à présenter, compétences à valoriser et questions à poser.">
      <Field label="Poste / entretien" value={f.poste} onChange={set("poste")} placeholder="Chargé de communication" />
      <Field label="Entreprise" value={f.entreprise} onChange={set("entreprise")} placeholder="Nom de l'entreprise (optionnel)" />
      <Field label="Ton profil" area rows={4} value={f.profil} onChange={set("profil")}
        placeholder="Décris ton parcours, tes forces, ton expérience pertinente." />
      <Btn onClick={generate} loading={loading} disabled={!ready}><Sparkles size={17} />Préparer mon entretien</Btn>
      <ErrBox msg={err} />
      {out && (
        <OutputBox title="Ta feuille de route" copyText={raw} printable>
          <div className="tr-printable" style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 10, padding: "26px 30px" }}>
            <div style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 22, color: C.ink, marginBottom: 4 }}>Préparation à l'entretien</div>
            <div style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 13.5, color: C.muted, marginBottom: 18 }}>{[f.poste, f.entreprise].filter(Boolean).join(" · ")}</div>
            {out.points_cles && <Block icon={<Lightbulb size={16} />} title="Messages clés à faire passer" items={out.points_cles} tone={C.amberDeep} />}
            {out.qualites && <Block icon={<Check size={16} />} title="Qualités à mettre en avant" items={out.qualites} tone={C.ok} />}
            {out.defauts && <Block icon={<Wrench size={16} />} title="Défauts à présenter intelligemment" items={out.defauts} />}
            {out.competences && <Block icon={<Sparkles size={16} />} title="Compétences à valoriser pour ce poste" items={out.competences} tone={C.amberDeep} />}
            {out.questions && <Block icon={<MessageSquareText size={16} />} title="Questions à poser au recruteur" items={out.questions} />}
          </div>
        </OutputBox>
      )}
      {!out && raw && <OutputBox title="Ta feuille de route" copyText={raw}><Prose text={raw} /></OutputBox>}
    </ModuleShell>
  );
}

/* ============================================================
   MODULE 4 — Photo de CV (analyse par l'IA via vision)
   ============================================================ */
function ModulePhoto() {
  const [img, setImg] = useState(null);
  const [out, setOut] = useState(""); const [loading, setLoading] = useState(false); const [err, setErr] = useState("");
  const fileRef = useRef(null);

  function onFile(e) {
    const file = e.target.files?.[0]; if (!file) return;
    const r = new FileReader();
    r.onload = () => setImg({ data: r.result.split(",")[1], url: r.result, type: file.type });
    r.readAsDataURL(file);
  }

  async function analyze() {
    if (!img) return;
    setErr(""); setOut(""); setLoading(true);
    try {
      const sys = "Tu es directeur photo spécialisé dans les portraits professionnels. Analyse cette photo comme photo de CV/LinkedIn et donne un retour structuré et bienveillant en français : 1) Note globale sur 10. 2) Ce qui fonctionne. 3) Ce qu'il faut améliorer (cadrage, lumière, arrière-plan, expression, tenue). 4) 3 conseils concrets pour la reprendre. Sois précis et actionnable, format texte clair avec titres.";
      const txt = await callClaude([{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: img.type || "image/jpeg", data: img.data } },
          { type: "text", text: "Analyse ma photo pour un CV et dis-moi comment l'améliorer." },
        ],
      }], sys);
      setOut(txt);
    } catch (e) { setErr("Analyse impossible. Vérifie l'image et réessaie."); }
    setLoading(false);
  }

  return (
    <ModuleShell title="Photo de CV" sub="Importe ta photo : l'IA l'analyse et te dit précisément comment l'améliorer.">
      <div style={{
        background: "#fff5e9", border: `1px solid ${C.amber}`, borderRadius: 12, padding: "13px 16px",
        fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 13.5, lineHeight: 1.55, color: C.amberDeep, marginBottom: 18,
      }}>
        <strong>Note sur ce prototype.</strong> L'IA <em>analyse et conseille</em> ta photo (réel, via la vision). La <em>génération</em> d'une photo idéale demande un service d'image dédié — je t'explique comment le brancher en bas de page.
      </div>

      <div onClick={() => fileRef.current?.click()} style={{
        border: `2px dashed ${C.line}`, borderRadius: 14, padding: img ? 14 : "40px 20px", textAlign: "center",
        cursor: "pointer", background: C.card,
      }}>
        <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
        {img ? (
          <img src={img.url} alt="aperçu" style={{ maxHeight: 230, borderRadius: 10, margin: "0 auto", display: "block" }} />
        ) : (
          <div style={{ color: C.muted, fontFamily: "'Hanken Grotesk',sans-serif" }}>
            <Upload size={26} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 14.5, fontWeight: 600, color: C.inkSoft }}>Clique pour importer ta photo</div>
            <div style={{ fontSize: 12.5 }}>JPG ou PNG</div>
          </div>
        )}
      </div>
      <div style={{ marginTop: 16 }}>
        <Btn onClick={analyze} loading={loading} disabled={!img}><Camera size={17} />Analyser ma photo</Btn>
      </div>
      <ErrBox msg={err} />
      {out && (
        <OutputBox title="Analyse de ta photo" copyText={out} printable>
          <div className="tr-printable" style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 10, padding: "26px 30px" }}>
            <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 18 }}>
              {img && <img src={img.url} alt="photo" style={{ width: 120, borderRadius: 10, border: `1px solid ${C.line}` }} />}
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 22, color: C.ink }}>Analyse de ta photo de CV</div>
                <div style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 13.5, color: C.muted, marginTop: 4 }}>Retour et conseils générés par l'IA</div>
              </div>
            </div>
            <Prose text={out} />
          </div>
        </OutputBox>
      )}
    </ModuleShell>
  );
}

/* ---------- coquille de module ---------- */
function ModuleShell({ title, sub, children, wide }) {
  return (
    <div className="tr-rise" style={{ maxWidth: wide ? 860 : 720, margin: "0 auto", paddingBottom: 60 }}>
      <h2 style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 30, color: C.ink, margin: "8px 0 4px" }}>{title}</h2>
      <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 15, color: C.muted, margin: "0 0 26px" }}>{sub}</p>
      <div style={{ background: C.paper, border: `1.5px solid ${C.line}`, borderRadius: 18, padding: "26px 28px" }}>
        {children}
      </div>
    </div>
  );
}
/* ============================================================
   DONNÉES — outils & forfaits
   ============================================================ */
const MODULES = [
  { id: "cv", n: "01", icon: FileText, title: "Créer mon CV", desc: "Un questionnaire guidé, l'IA rédige un CV structuré et percutant." },
  { id: "lettre", n: "02", icon: Mail, title: "Lettre de motivation", desc: "Personnalisée selon l'entreprise et le poste exact visé." },
  { id: "entretien", n: "03", icon: MessageSquareText, title: "Préparer l'entretien", desc: "Messages clés, qualités/défauts, compétences et questions à poser." },
  { id: "photo", n: "04", icon: Camera, title: "Photo de CV", desc: "Analyse de ta photo par l'IA et conseils d'amélioration." },
];

const PLANS = {
  essentiel: {
    id: "essentiel", name: "Essentiel", price: "19,90", tagline: "L'essentiel pour postuler vite et bien",
    tools: ["cv", "lettre"],
    features: ["Générateur de CV illimité", "3 modèles + couleurs personnalisables", "Lettres de motivation ciblées par entreprise", "Édition libre de chaque mot", "Export PDF de tous les documents"],
  },
  complet: {
    id: "complet", name: "Complet", price: "29,90", popular: true, tagline: "Toute la boîte à outils de candidature",
    tools: ["cv", "lettre", "entretien", "photo"],
    features: ["Tout le forfait Essentiel", "Préparation d'entretien sur-mesure", "Analyse IA de ta photo de CV", "Qualités, défauts & compétences à valoriser", "Accès prioritaire aux nouveautés"],
  },
};
const PLAN_LIST = [PLANS.essentiel, PLANS.complet];

/* ---------- Google ---------- */
function GoogleIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 5.1 29.5 3 24 3 16 3 9.1 7.6 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 45c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 36 26.7 37 24 37c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.1 40.3 16 45 24 45z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.3 5.3C41.4 36.7 45 31 45 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}
function GoogleBtn({ onClick, label = "Continuer avec Google" }) {
  return (
    <button className="tr-btn" onClick={onClick} style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 11, width: "100%",
      background: "#fff", color: "#3c4043", border: "1.5px solid #dadce0", borderRadius: 10,
      padding: "13px", fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 600, fontSize: 15, cursor: "pointer",
    }}>
      <GoogleIcon />{label}
    </button>
  );
}

/* ---------- carte de prix réutilisable ---------- */
function PriceCard({ plan, onChoose, cta = "Choisir ce forfait" }) {
  const pop = plan.popular;
  return (
    <div className="tr-price" style={{
      flex: 1, minWidth: 260, maxWidth: 360, background: pop ? C.ink : C.card,
      color: pop ? C.paper : C.ink, border: `1.5px solid ${pop ? C.ink : C.line}`,
      borderRadius: 20, padding: "30px 28px", position: "relative",
      boxShadow: pop ? "0 22px 50px -26px rgba(25,40,61,.6)" : "none",
    }}>
      {pop && (
        <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: C.amber, color: C.ink, fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: .5, padding: "5px 14px", borderRadius: 999, display: "flex", alignItems: "center", gap: 5 }}>
          <Star size={13} /> Le plus choisi
        </div>
      )}
      <div style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", color: pop ? C.amber : C.amberDeep }}>{plan.name}</div>
      <div style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 13.5, color: pop ? "rgba(245,239,226,.75)" : C.muted, marginTop: 4, minHeight: 36 }}>{plan.tagline}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "16px 0 20px" }}>
        <span className="tr-num" style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 46, lineHeight: 1 }}>{plan.price}€</span>
        <span style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 14, color: pop ? "rgba(245,239,226,.7)" : C.muted }}>/ mois</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 24 }}>
        {plan.features.map((feat, i) => (
          <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 14, lineHeight: 1.4, color: pop ? "rgba(245,239,226,.95)" : C.inkSoft }}>
            <Check size={17} color={pop ? C.amber : C.amberDeep} style={{ flexShrink: 0, marginTop: 1 }} />{feat}
          </div>
        ))}
      </div>
      <button className="tr-btn" onClick={() => onChoose(plan)} style={{
        width: "100%", border: "none", cursor: "pointer", borderRadius: 999, padding: "14px",
        fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 15,
        background: pop ? C.amber : C.ink, color: pop ? C.ink : C.paper,
      }}>{cta}</button>
    </div>
  );
}

/* ============================================================
   LANDING PAGE
   ============================================================ */
function MiniCV() {
  // visuel décoratif du hero
  const Bar = ({ w, c, h = 7 }) => <div style={{ width: w, height: h, borderRadius: 4, background: c }} />;
  return (
    <div style={{ position: "relative", width: 300, height: 380 }}>
      <div style={{ position: "absolute", inset: 0, transform: "rotate(6deg)", background: C.card, border: `1.5px solid ${C.line}`, borderRadius: 16, top: 24, left: 26, width: 270, height: 340, boxShadow: "0 20px 50px -30px rgba(25,40,61,.5)" }} />
      <div className="tr-float" style={{ position: "relative", display: "flex", width: 280, height: 360, background: "#fff", borderRadius: 16, overflow: "hidden", border: `1.5px solid ${C.line}`, boxShadow: "0 30px 60px -30px rgba(25,40,61,.55)" }}>
        <div style={{ width: "38%", background: C.ink, padding: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: C.amber, marginBottom: 16 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {[0, 1, 2, 3, 4].map((i) => <Bar key={i} w={i % 2 ? "70%" : "90%"} c="rgba(245,239,226,.5)" />)}
          </div>
          <div style={{ height: 14 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {[0, 1, 2].map((i) => <Bar key={i} w={"80%"} c="rgba(217,128,59,.6)" />)}
          </div>
        </div>
        <div style={{ flex: 1, padding: 18 }}>
          <Bar w="75%" c={C.ink} h={13} />
          <div style={{ height: 8 }} />
          <Bar w="50%" c={C.amber} h={8} />
          <div style={{ height: 22 }} />
          {[0, 1, 2].map((g) => (
            <div key={g} style={{ marginBottom: 16 }}>
              <Bar w="60%" c={C.inkSoft} h={8} />
              <div style={{ height: 7 }} />
              <Bar w="100%" c={C.line} />
              <div style={{ height: 5 }} />
              <Bar w="92%" c={C.line} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   LANDING PAGE — style "Rezi" (clair, dense, orienté conversion)
   ============================================================ */
const GREEN = "#1FA463";

function Stat({ value, label }) {
  return (
    <div style={{ textAlign: "center", padding: "0 14px" }}>
      <div style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 38, color: C.ink, letterSpacing: -1 }}>{value}</div>
      <div style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 13.5, color: C.muted, marginTop: 2, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
    </div>
  );
}

/* mini visuels produits pour les blocs de fonctionnalités */
function MockKeyword() {
  const Tag = ({ children, ok }) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 12.5, fontWeight: 600, padding: "5px 11px", borderRadius: 999, margin: 3, background: ok ? "rgba(31,164,99,.12)" : "rgba(217,128,59,.14)", color: ok ? GREEN : C.amberDeep }}>
      {ok ? <Check size={13} /> : <Zap size={13} />}{children}
    </span>
  );
  return (
    <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 16, padding: 22, boxShadow: "0 20px 50px -30px rgba(25,40,61,.4)" }}>
      <div style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.muted, marginBottom: 12 }}>Mots-clés de l'annonce</div>
      <div style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 13.5, color: C.inkSoft, marginBottom: 6 }}>Déjà présents :</div>
      <div><Tag ok>Travail en équipe</Tag><Tag ok>Sens du contact</Tag><Tag ok>Organisation</Tag></div>
      <div style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 13.5, color: C.inkSoft, margin: "12px 0 6px" }}>À ajouter :</div>
      <div><Tag>Relation client</Tag><Tag>Autonomie</Tag></div>
    </div>
  );
}
function MockWriter() {
  return (
    <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 16, padding: 22, boxShadow: "0 20px 50px -30px rgba(25,40,61,.4)" }}>
      <div style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 13.5, color: C.muted, marginBottom: 10 }}>Qu'as-tu fait dans ce poste ?</div>
      <div style={{ background: C.paper, borderRadius: 10, padding: "10px 12px", fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 13.5, color: C.inkSoft, marginBottom: 14 }}>géré l'équipe support, réduit les délais</div>
      <button style={{ background: C.ink, color: C.paper, border: "none", borderRadius: 999, padding: "9px 16px", fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 14 }}><Sparkles size={14} />Rédiger</button>
      <div style={{ display: "flex", gap: 9, alignItems: "flex-start", fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 13.5, lineHeight: 1.5, color: C.ink }}>
        <Check size={16} color={GREEN} style={{ flexShrink: 0, marginTop: 2 }} />
        Encadré une équipe support de 6 personnes et réduit le délai de réponse de 40 % en 3 mois.
      </div>
    </div>
  );
}
function MockColors() {
  const sw = ["#19283D", "#1F3A2E", "#3A1F2B", "#18233A", "#272727"];
  const ac = ["#D9803B", "#4F9D69", "#C2566F", "#4A82C2", "#C9893B"];
  return (
    <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 16, padding: 22, boxShadow: "0 20px 50px -30px rgba(25,40,61,.4)" }}>
      <div style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.muted, marginBottom: 14 }}>Couleurs du CV</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        {sw.map((s, i) => (
          <span key={i} style={{ display: "flex", border: i === 0 ? `2px solid ${C.ink}` : "2px solid transparent", borderRadius: 999, padding: 2 }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: s }} />
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: ac[i], marginLeft: -7, border: "2px solid #fff" }} />
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {["Atlas", "Édito", "Bloc"].map((t, i) => (
          <div key={t} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ height: 60, borderRadius: 8, border: `1px solid ${C.line}`, background: i === 0 ? `linear-gradient(105deg, ${C.ink} 38%, #fff 38%)` : i === 1 ? "#fff" : C.ink, marginBottom: 6 }} />
            <span style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 12, color: C.inkSoft, fontWeight: 600 }}>{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function MockInterview() {
  const Row = ({ icon, c, txt }) => (
    <div style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 11, fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 13.5, lineHeight: 1.4, color: C.ink }}>
      <span style={{ color: c, flexShrink: 0, marginTop: 1 }}>{icon}</span>{txt}
    </div>
  );
  return (
    <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 16, padding: 22, boxShadow: "0 20px 50px -30px rgba(25,40,61,.4)" }}>
      <div style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.muted, marginBottom: 14 }}>Ta feuille de route</div>
      <Row icon={<Check size={16} />} c={GREEN} txt="Qualité : rigueur — exemple chiffré à l'appui" />
      <Row icon={<Wrench size={16} />} c={C.amberDeep} txt="Défaut : impatience, et comment tu le gères" />
      <Row icon={<Target size={16} />} c={C.ink} txt="Compétence à valoriser : relation client" />
      <Row icon={<MessageSquareText size={16} />} c={C.ink} txt="Question à poser sur l'équipe et la roadmap" />
    </div>
  );
}

function FeatureRow({ eyebrow, title, desc, bullets, mock, flip }) {
  return (
    <div style={{ display: "flex", gap: 48, alignItems: "center", flexWrap: "wrap", flexDirection: flip ? "row-reverse" : "row" }}>
      <div style={{ flex: 1, minWidth: 280 }}>
        <div style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 12.5, letterSpacing: 1.5, textTransform: "uppercase", color: C.amberDeep, marginBottom: 12 }}>{eyebrow}</div>
        <h3 style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 30, color: C.ink, margin: "0 0 14px", letterSpacing: -.5, lineHeight: 1.1 }}>{title}</h3>
        <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 16, lineHeight: 1.6, color: C.inkSoft, margin: "0 0 16px" }}>{desc}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {bullets.map((b, i) => (
            <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 14.5, color: C.ink }}>
              <Check size={18} color={GREEN} style={{ flexShrink: 0, marginTop: 1 }} />{b}
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 280 }}>{mock}</div>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${C.line}` }}>
      <button className="tr-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open} style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: "20px 0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <span style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 16.5, color: C.ink }}>{q}</span>
        <span style={{ fontFamily: "'Fraunces',serif", fontSize: 24, color: C.amberDeep, lineHeight: 1, flexShrink: 0 }}>{open ? "–" : "+"}</span>
      </button>
      {open && <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 15, lineHeight: 1.6, color: C.inkSoft, margin: "0 0 20px", maxWidth: 720 }}>{a}</p>}
    </div>
  );
}

function Landing({ onStart, goSection, onNavigate }) {
  const STEPS = [
    { n: "1", t: "Réponds au questionnaire", d: "Tu écris en vrac ton parcours. Pas besoin de soigner la forme." },
    { n: "2", t: "L'IA rédige et structure", d: "CV, lettre, prépa : tout est reformulé, valorisé et mis en page." },
    { n: "3", t: "Personnalise et postule", d: "Tu ajustes chaque mot, choisis tes couleurs, exportes en PDF." },
  ];
  const GRID = [
    { icon: FileText, t: "3 modèles de CV", d: "Atlas, Édito, Bloc — bascule en un clic." },
    { icon: Wrench, t: "Édition libre", d: "Clique sur n'importe quel mot pour le changer." },
    { icon: Sparkles, t: "Couleurs personnalisables", d: "Palettes prêtes ou tes propres teintes." },
    { icon: Mail, t: "Lettres ciblées", d: "Personnalisées par entreprise et par poste." },
    { icon: MessageSquareText, t: "Prépa entretien", d: "Messages clés, qualités, défauts, questions." },
    { icon: Camera, t: "Analyse de photo", d: "Retour IA pour une photo de CV nickel." },
    { icon: Download, t: "Export PDF", d: "Tous tes documents, prêts à envoyer." },
    { icon: Zap, t: "En quelques minutes", d: "De la page blanche au dossier complet." },
  ];
  const TESTI = [
    { txt: "J'ai réécrit mon CV en 10 minutes et décroché deux entretiens la semaine suivante.", a: "Témoignage d'exemple — à remplacer" },
    { txt: "Les lettres ciblées par entreprise m'ont fait gagner un temps fou.", a: "Témoignage d'exemple — à remplacer" },
    { txt: "La prépa d'entretien m'a donné exactement les bons arguments.", a: "Témoignage d'exemple — à remplacer" },
  ];
  const FAQ = [
    { q: "Comment l'IA rédige-t-elle mon CV ?", a: "Tu réponds à un questionnaire simple, puis l'IA reformule et structure tes informations en un CV professionnel : verbes d'action, mise en valeur des résultats, mise en page propre." },
    { q: "Les lettres sont-elles vraiment personnalisées ?", a: "Oui. Tu colles l'annonce et tes atouts, et la lettre est rédigée spécifiquement pour cette entreprise et ce poste, au format courrier français." },
    { q: "Quelle est la différence entre les deux forfaits ?", a: "L'Essentiel (19,90€/mois) couvre le CV et la lettre de motivation. Le Complet (29,90€/mois) débloque en plus la préparation d'entretien et l'analyse de photo." },
    { q: "Puis-je modifier ce que l'IA génère ?", a: "Entièrement. Chaque mot est éditable en cliquant dessus, et tu choisis modèle et couleurs. Tu gardes le contrôle total." },
    { q: "Puis-je résilier quand je veux ?", a: "Oui, sans engagement. Tu peux changer de forfait ou résilier à tout moment." },
  ];
  const goTarifs = (e) => { if (e) e.preventDefault(); goSection("tarifs"); };
  const link = (id) => (e) => { if (e) e.preventDefault(); goSection(id); };
  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(1100px 520px at 88% -8%, rgba(217,128,59,.10), transparent 60%), radial-gradient(900px 480px at -5% 4%, rgba(25,40,61,.06), transparent 55%), #fff" }}>
      {/* bandeau d'annonce */}
      <div style={{ background: C.ink, color: C.paper, textAlign: "center", fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 13.5, padding: "9px 16px" }}>
        Nouveau : prépare ton entretien avec l'IA — messages clés, qualités, défauts et questions à poser 🎯
      </div>

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(255,255,255,.92)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div onClick={link("haut")} style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: C.ink, display: "grid", placeItems: "center" }}><Sparkles size={16} color={C.amber} /></div>
            <span style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 22, color: C.ink }}>Tremplin</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <a href="#tarifs" onClick={goTarifs} className="tr-btn" style={{ display: "inline-block", textDecoration: "none", fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 600, fontSize: 14.5, color: C.ink, padding: "8px 12px", cursor: "pointer" }}>Tarifs</a>
            <button className="tr-btn" onClick={() => onStart(null)} aria-label="Se connecter" style={{ background: "transparent", border: "none", cursor: "pointer", fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 600, fontSize: 14.5, color: C.ink, padding: "8px 12px" }}>Connexion</button>
            <button className="tr-btn" onClick={() => onStart(null)} style={{ background: C.amber, color: C.ink, border: "none", cursor: "pointer", borderRadius: 999, padding: "11px 22px", fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 14.5 }}>Commencer</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header style={{ maxWidth: 1140, margin: "0 auto", padding: "64px 24px 56px", display: "flex", gap: 48, alignItems: "center", flexWrap: "wrap" }}>
        <div className="tr-stagger" style={{ flex: 1, minWidth: 320 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(217,128,59,.12)", color: C.amberDeep, borderRadius: 999, padding: "6px 14px", fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 13, marginBottom: 20 }}>
            <Sparkles size={14} />Candidature propulsée par l'IA
          </div>
          <h1 style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 58, lineHeight: 1.02, color: C.ink, margin: 0, letterSpacing: -1.5 }}>
            Le créateur de CV<br />qui décroche des <span style={{ color: C.amberDeep }}>entretiens.</span>
          </h1>
          <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 18.5, lineHeight: 1.55, color: C.inkSoft, margin: "22px 0 28px", maxWidth: 520 }}>
            Tremplin rédige, structure et cible ton CV, ta lettre et ta préparation d'entretien — pour qu'ils tapent juste auprès des recruteurs. En quelques minutes.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
            <button className="tr-btn" onClick={() => onStart(null)} style={{ background: C.amber, color: C.ink, border: "none", cursor: "pointer", borderRadius: 999, padding: "16px 32px", fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 16.5, display: "inline-flex", alignItems: "center", gap: 9 }}>
              Commencer — c'est parti<Zap size={18} />
            </button>
            <a href="#tarifs" onClick={goTarifs} className="tr-btn" style={{ textDecoration: "none", background: "transparent", color: C.ink, border: `1.5px solid ${C.line}`, borderRadius: 999, padding: "14px 26px", fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 16.5, cursor: "pointer" }}>Voir les tarifs</a>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 13.5, color: C.muted, marginTop: 18 }}><Check size={15} color={GREEN} />Sans engagement · Résiliable à tout moment</div>
        </div>
        <div style={{ flex: "0 0 auto", display: "grid", placeItems: "center", minWidth: 300, position: "relative" }}>
          <MiniCV />
          <div className="tr-float" style={{ position: "absolute", bottom: 8, left: -6, background: "#fff", border: `1px solid ${C.line}`, borderRadius: 12, padding: "12px 14px", boxShadow: "0 16px 40px -22px rgba(25,40,61,.5)", display: "flex", alignItems: "center", gap: 10, animationDelay: "1s" }}>
            <span style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(31,164,99,.14)", display: "grid", placeItems: "center" }}><Check size={20} color={GREEN} /></span>
            <span style={{ lineHeight: 1.15 }}>
              <span style={{ display: "block", fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 15, color: C.ink }}>CV optimisé</span>
              <span style={{ display: "block", fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 12, color: C.muted }}>prêt à envoyer</span>
            </span>
          </div>
        </div>
      </header>

      {/* STATS (exemples à remplacer) */}
      <section style={{ borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, background: C.paper }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "34px 24px", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 20 }}>
          <Stat value="4 outils" label="en un seul abonnement" />
          <Stat value="~5 min" label="pour un dossier complet" />
          <Stat value="100 %" label="éditable & personnalisable" />
        </div>
      </section>

      {/* FONCTIONNALITÉS ALTERNÉES */}
      <section id="outils" style={{ maxWidth: 1080, margin: "0 auto", padding: "72px 24px 16px", scrollMarginTop: 80 }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 38, color: C.ink, margin: 0, letterSpacing: -1 }}>Des outils pensés pour être recruté</h2>
          <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 17, color: C.muted, marginTop: 10 }}>Chaque étape de ta candidature, couverte par l'IA.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 72 }}>
          <FeatureRow eyebrow="Ciblage intelligent" title="Une lettre par entreprise, pas une lettre passe-partout" desc="Colle l'annonce, et l'IA repère ce qui compte pour ce poste précis, puis l'intègre naturellement à ta lettre." bullets={["Personnalisée par entreprise et poste", "Format courrier français impeccable", "Ton ajustable"]} mock={<MockKeyword />} />
          <FeatureRow flip eyebrow="Rédaction IA" title="Des formulations qui valorisent vraiment ton expérience" desc="Tu écris en vrac, l'IA transforme en phrases percutantes, orientées résultats — celles que les recruteurs veulent lire." bullets={["Verbes d'action et résultats chiffrés", "Reformulation professionnelle", "Tu gardes la main sur chaque mot"]} mock={<MockWriter />} />
          <FeatureRow eyebrow="Design" title="3 modèles, tes couleurs, zéro prise de tête" desc="Bascule entre trois mises en page modernes et adapte les couleurs à ton style. Tes données restent, seul le look change." bullets={["Modèles Atlas, Édito, Bloc", "Palettes prêtes + couleurs sur-mesure", "Aperçu instantané"]} mock={<MockColors />} />
          <FeatureRow flip eyebrow="Entretien" title="Arrive préparé, repars avec le poste" desc="L'IA te prépare une feuille de route : messages clés, qualités à mettre en avant, défauts bien présentés et questions à poser." bullets={["Qualités, défauts et compétences", "Questions à poser au recruteur", "Adapté au poste visé"]} mock={<MockInterview />} />
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section id="comment" style={{ maxWidth: 1080, margin: "0 auto", padding: "72px 24px", scrollMarginTop: 80 }}>
        <h2 style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 34, color: C.ink, margin: "0 0 44px", textAlign: "center", letterSpacing: -.8 }}>Trois étapes, c'est tout</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 24 }}>
          {STEPS.map((s) => (
            <div key={s.n} style={{ background: C.paper, borderRadius: 18, padding: "28px 24px" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.ink, color: C.amber, display: "grid", placeItems: "center", marginBottom: 16, fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 22 }}>{s.n}</div>
              <h3 style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 19, color: C.ink, margin: "0 0 8px" }}>{s.t}</h3>
              <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 14.5, lineHeight: 1.55, color: C.inkSoft, margin: 0 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* GRILLE DE FONCTIONNALITÉS */}
      <section style={{ background: C.ink }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "72px 24px" }}>
          <h2 style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 34, color: C.paper, margin: "0 0 8px", textAlign: "center", letterSpacing: -.8 }}>Tout ce qu'il faut, rien de superflu</h2>
          <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 16, color: "rgba(245,239,226,.7)", textAlign: "center", marginBottom: 44 }}>Une boîte à outils complète pour ta recherche d'emploi.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 16 }}>
            {GRID.map((g, i) => {
              const Icon = g.icon;
              return (
                <div key={i} style={{ background: "rgba(245,239,226,.05)", border: "1px solid rgba(245,239,226,.12)", borderRadius: 14, padding: "22px 20px" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: C.amber, display: "grid", placeItems: "center", marginBottom: 14 }}><Icon size={20} color={C.ink} /></div>
                  <h3 style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 16, color: C.paper, margin: "0 0 5px" }}>{g.t}</h3>
                  <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 13.5, lineHeight: 1.5, color: "rgba(245,239,226,.72)", margin: 0 }}>{g.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TARIFS */}
      <section id="tarifs" style={{ maxWidth: 1080, margin: "0 auto", padding: "72px 24px", scrollMarginTop: 80 }}>
        <h2 style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 38, color: C.ink, margin: "0 0 8px", textAlign: "center", letterSpacing: -1 }}>Un tarif honnête</h2>
        <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 16, color: C.muted, textAlign: "center", marginBottom: 48 }}>Choisis ton forfait. Change ou résilie quand tu veux.</p>
        <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap", alignItems: "stretch" }}>
          {PLAN_LIST.map((p) => <PriceCard key={p.id} plan={p} onChoose={onStart} />)}
        </div>
      </section>

      {/* TÉMOIGNAGES (exemples) */}
      <section style={{ background: C.paper }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "72px 24px" }}>
          <h2 style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 34, color: C.ink, margin: "0 0 40px", textAlign: "center", letterSpacing: -.8 }}>Ils ont retrouvé du temps — et des entretiens</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
            {TESTI.map((t, i) => (
              <div key={i} style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 16, padding: "26px 24px" }}>
                <div style={{ display: "flex", gap: 3, marginBottom: 12 }}>{[0, 1, 2, 3, 4].map((s) => <Star key={s} size={16} color={C.amber} fill={C.amber} />)}</div>
                <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 15.5, lineHeight: 1.55, color: C.ink, margin: "0 0 14px" }}>« {t.txt} »</p>
                <div style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 12.5, color: C.muted, fontStyle: "italic" }}>{t.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: 820, margin: "0 auto", padding: "72px 24px" }}>
        <h2 style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 34, color: C.ink, margin: "0 0 24px", textAlign: "center", letterSpacing: -.8 }}>Questions fréquentes</h2>
        <div>{FAQ.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}</div>
      </section>

      {/* CTA FINAL */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "20px 24px 80px" }}>
        <div style={{ background: C.ink, borderRadius: 28, padding: "60px 32px", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 40, color: C.paper, margin: "0 0 14px", letterSpacing: -1 }}>Prêt à postuler avec une longueur d'avance ?</h2>
          <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 17, color: "rgba(245,239,226,.75)", margin: "0 auto 28px", maxWidth: 500 }}>Crée ta candidature complète avec Tremplin, dès maintenant.</p>
          <button className="tr-btn" onClick={() => onStart(null)} style={{ background: C.amber, color: C.ink, border: "none", cursor: "pointer", borderRadius: 999, padding: "16px 36px", fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 16.5 }}>Commencer maintenant</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#fff", borderTop: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 24px 24px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 32 }}>
          <div style={{ maxWidth: 260 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: C.ink, display: "grid", placeItems: "center" }}><Sparkles size={15} color={C.amber} /></div>
              <span style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 20, color: C.ink }}>Tremplin</span>
            </div>
            <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 13.5, lineHeight: 1.6, color: C.muted, margin: 0 }}>Ta candidature, propulsée par l'IA.</p>
          </div>
          {[
            { h: "Outils", l: [
              { t: "Créateur de CV", to: "outils" }, { t: "Lettre de motivation", to: "outils" },
              { t: "Prépa entretien", to: "outils" }, { t: "Analyse de photo", to: "outils" },
            ] },
            { h: "Produit", l: [
              { t: "Tarifs", to: "tarifs" }, { t: "Modèles", to: "outils" }, { t: "Comment ça marche", to: "comment" },
            ] },
            { h: "Entreprise", l: [
              { t: "À propos", page: "apropos" }, { t: "Contact", page: "contact" },
              { t: "Confidentialité", page: "confidentialite" }, { t: "Mentions légales", page: "mentions" },
            ] },
          ].map((col) => (
            <div key={col.h}>
              <div style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 13, color: C.ink, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>{col.h}</div>
              {col.l.map((x) => {
                const base = { display: "block", background: "none", border: "none", padding: 0, textAlign: "left", textDecoration: "none", fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 14, color: C.inkSoft, marginBottom: 9, cursor: "pointer" };
                if (x.page) return <button key={x.t} className="tr-btn" onClick={() => onNavigate(x.page)} style={base}>{x.t}</button>;
                return <a key={x.t} href={`#${x.to}`} onClick={link(x.to)} className="tr-btn" style={base}>{x.t}</a>;
              })}
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${C.line}`, padding: "18px 24px", textAlign: "center", fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 12.5, color: C.muted }}>
          © 2026 Tremplin · Prototype de démonstration
        </div>
      </footer>
    </div>
  );
}

/* ============================================================
   ONBOARDING (choix forfait + connexion Google)
   ============================================================ */
function Onboarding({ pendingPlan, onClose, onComplete }) {
  const [plan, setPlan] = useState(pendingPlan);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(25,40,61,.55)", backdropFilter: "blur(4px)", display: "grid", placeItems: "center", padding: 18 }}>
      <div onClick={(e) => e.stopPropagation()} className="tr-rise" style={{ width: "100%", maxWidth: 440, background: C.paper, borderRadius: 20, padding: "30px 30px 28px", border: `1.5px solid ${C.line}`, boxShadow: "0 30px 70px -30px rgba(25,40,61,.7)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: C.ink, display: "grid", placeItems: "center" }}><Sparkles size={15} color={C.amber} /></div>
          <span style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 19, color: C.ink }}>Tremplin</span>
        </div>

        {!plan ? (
          <>
            <h3 style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 22, color: C.ink, margin: "10px 0 4px" }}>Choisis ton forfait</h3>
            <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 14, color: C.muted, margin: "0 0 18px" }}>Tu pourras changer à tout moment.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {PLAN_LIST.map((p) => (
                <button key={p.id} className="tr-btn" onClick={() => setPlan(p)} style={{ textAlign: "left", cursor: "pointer", border: `1.5px solid ${C.line}`, background: "#fff", borderRadius: 14, padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <span>
                    <span style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 16, color: C.ink }}>
                      {p.name}{p.popular && <span style={{ fontSize: 11, background: C.amber, color: C.ink, padding: "2px 8px", borderRadius: 999, fontWeight: 700 }}>Populaire</span>}
                    </span>
                    <span style={{ display: "block", fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 13, color: C.muted, marginTop: 3 }}>{p.tagline}</span>
                  </span>
                  <span style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 22, color: C.ink, whiteSpace: "nowrap" }}>{p.price}€<span style={{ fontSize: 12, color: C.muted, fontFamily: "'Hanken Grotesk',sans-serif" }}>/mois</span></span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h3 style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 22, color: C.ink, margin: "10px 0 4px" }}>Connecte-toi pour activer</h3>
            <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 14, color: C.muted, margin: "0 0 18px" }}>
              Forfait <strong style={{ color: C.ink }}>{plan.name}</strong> · {plan.price}€/mois
              <button onClick={() => setPlan(null)} style={{ background: "none", border: "none", color: C.amberDeep, cursor: "pointer", fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 13, fontWeight: 600, marginLeft: 8, textDecoration: "underline" }}>changer</button>
            </p>
            <GoogleBtn onClick={() => onComplete({ name: "Camille Dubois", email: "camille.dubois@gmail.com", plan })} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "16px 0", color: C.muted }}>
              <span style={{ flex: 1, height: 1, background: C.line }} /><span style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 12 }}>ou</span><span style={{ flex: 1, height: 1, background: C.line }} />
            </div>
            <button className="tr-btn" onClick={() => onComplete({ name: "Invité", email: "invite@tremplin.app", plan })} style={{ width: "100%", background: C.ink, color: C.paper, border: "none", cursor: "pointer", borderRadius: 10, padding: "12px", fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 600, fontSize: 14.5 }}>
              Continuer par e-mail
            </button>
            <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 11.5, color: C.muted, textAlign: "center", margin: "16px 0 0", lineHeight: 1.5 }}>
              Connexion et paiement <strong>simulés</strong> dans cette démo — aucun débit, aucun compte réel créé.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   WORKSPACE — l'application (accès selon le forfait)
   ============================================================ */
function Workspace({ account, setAccount, onLogout }) {
  const [view, setView] = useState("home");
  const [menu, setMenu] = useState(false);
  const [upgrade, setUpgrade] = useState(false);
  const plan = account.plan;
  const has = (id) => plan.tools.includes(id);

  const openModule = (id) => { if (has(id)) setView(id); else setUpgrade(true); };
  const doUpgrade = () => { setAccount({ ...account, plan: PLANS.complet }); setUpgrade(false); };

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(circle at 20% 0%, ${C.paperDeep}, ${C.paper})`, padding: "0 18px" }}>
      <header style={{ maxWidth: 980, margin: "0 auto", padding: "22px 0 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div onClick={() => setView("home")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: C.ink, display: "grid", placeItems: "center" }}><Sparkles size={16} color={C.amber} /></div>
          <span style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 22, color: C.ink, letterSpacing: -.3 }}>Tremplin</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {view !== "home" && <Btn ghost onClick={() => setView("home")}><ArrowLeft size={16} />Accueil</Btn>}
          <div style={{ position: "relative" }}>
            <button className="tr-btn" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-label="Menu du compte" style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer", background: "#fff", border: `1.5px solid ${C.line}`, borderRadius: 999, padding: "5px 12px 5px 6px" }}>
              <span style={{ width: 30, height: 30, borderRadius: "50%", background: C.ink, color: C.amber, display: "grid", placeItems: "center", fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 13 }}>{initialsOf(account.name) || "?"}</span>
              <span style={{ textAlign: "left", lineHeight: 1.1 }}>
                <span style={{ display: "block", fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 12.5, fontWeight: 700, color: C.ink }}>{account.name}</span>
                <span style={{ display: "block", fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 11, color: C.amberDeep, fontWeight: 600 }}>Forfait {plan.name}</span>
              </span>
            </button>
            {menu && (
              <div className="tr-rise" style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: "#fff", border: `1.5px solid ${C.line}`, borderRadius: 12, padding: 8, width: 220, boxShadow: "0 20px 50px -26px rgba(25,40,61,.5)", zIndex: 30 }}>
                <div style={{ padding: "8px 10px", fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 12.5, color: C.muted, borderBottom: `1px solid ${C.line}`, marginBottom: 4 }}>{account.email}</div>
                {plan.id === "essentiel" && (
                  <button className="tr-btn" onClick={() => { setMenu(false); setUpgrade(true); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: "9px 10px", borderRadius: 8, fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 14, fontWeight: 600, color: C.amberDeep }}><Zap size={15} />Passer au Complet</button>
                )}
                <button className="tr-btn" onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: "9px 10px", borderRadius: 8, fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 14, color: C.inkSoft }}><LogOut size={15} />Déconnexion</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 980, margin: "0 auto", paddingTop: 18 }}>
        {view === "home" && (
          <div className="tr-rise">
            <div style={{ maxWidth: 620, margin: "30px 0 6px" }}>
              <div style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", color: C.amberDeep, marginBottom: 12 }}>Bonjour {account.name.split(" ")[0]} 👋</div>
              <h1 style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 44, lineHeight: 1.05, color: C.ink, margin: 0 }}>
                Par quoi <span style={{ fontStyle: "italic", color: C.amberDeep }}>commences</span>-tu ?
              </h1>
              <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 17, lineHeight: 1.6, color: C.inkSoft, marginTop: 16 }}>
                Choisis un outil pour démarrer ta candidature.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 18, margin: "40px 0 60px" }}>
              {MODULES.map((m) => {
                const Icon = m.icon;
                const locked = !has(m.id);
                return (
                  <div key={m.id} className="tr-card" onClick={() => openModule(m.id)} style={{
                    cursor: "pointer", background: C.card, border: `1.5px solid ${C.line}`, borderRadius: 18, padding: "24px 22px",
                    position: "relative", opacity: locked ? .92 : 1,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: locked ? C.muted : C.ink, display: "grid", placeItems: "center" }}>
                        {locked ? <Lock size={19} color={C.paper} /> : <Icon size={21} color={C.paper} />}
                      </div>
                      {locked
                        ? <span style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 11, fontWeight: 700, background: C.ink, color: C.amber, padding: "3px 9px", borderRadius: 999 }}>Complet</span>
                        : <span style={{ fontFamily: "'Fraunces',serif", fontSize: 26, fontWeight: 600, color: C.line }}>{m.n}</span>}
                    </div>
                    <h3 style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 21, color: C.ink, margin: "0 0 6px" }}>{m.title}</h3>
                    <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 14, lineHeight: 1.5, color: C.muted, margin: 0 }}>{locked ? "Débloqué avec le forfait Complet." : m.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === "cv" && has("cv") && <ModuleCV />}
        {view === "lettre" && has("lettre") && <ModuleLettre />}
        {view === "entretien" && has("entretien") && <ModuleEntretien />}
        {view === "photo" && has("photo") && <ModulePhoto />}
      </main>

      {upgrade && (
        <div onClick={() => setUpgrade(false)} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(25,40,61,.55)", backdropFilter: "blur(4px)", display: "grid", placeItems: "center", padding: 18 }}>
          <div onClick={(e) => e.stopPropagation()} className="tr-rise" style={{ width: "100%", maxWidth: 420, background: C.paper, borderRadius: 20, padding: "30px", border: `1.5px solid ${C.line}`, textAlign: "center", boxShadow: "0 30px 70px -30px rgba(25,40,61,.7)" }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: C.ink, display: "grid", placeItems: "center", margin: "0 auto 16px" }}><Zap size={24} color={C.amber} /></div>
            <h3 style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 24, color: C.ink, margin: "0 0 8px" }}>Débloque tous les outils</h3>
            <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 15, lineHeight: 1.6, color: C.inkSoft, margin: "0 0 20px" }}>
              La préparation d'entretien et l'analyse de photo sont incluses dans le forfait <strong>Complet</strong> à 29,90€/mois (au lieu de 19,90€).
            </p>
            <button className="tr-btn" onClick={doUpgrade} style={{ width: "100%", background: C.amber, color: C.ink, border: "none", cursor: "pointer", borderRadius: 999, padding: "14px", fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Passer au Complet — 29,90€/mois</button>
            <button className="tr-btn" onClick={() => setUpgrade(false)} style={{ width: "100%", background: "none", color: C.muted, border: "none", cursor: "pointer", padding: "8px", fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 600, fontSize: 14 }}>Plus tard</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   PAGES STATIQUES (À propos, Contact, Confidentialité, Mentions)
   ============================================================ */
function PageBlock({ h, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      {h && <h2 style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 20, color: C.ink, margin: "0 0 8px", letterSpacing: -.3 }}>{h}</h2>}
      <div style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 15.5, lineHeight: 1.7, color: C.inkSoft }}>{children}</div>
    </div>
  );
}
function Fill({ children }) {
  return <span style={{ background: "rgba(217,128,59,.16)", color: C.amberDeep, borderRadius: 5, padding: "1px 6px", fontWeight: 600 }}>{children}</span>;
}
function LegalNote() {
  return (
    <div style={{ background: "#fff5e9", border: `1px solid ${C.amber}`, borderRadius: 12, padding: "13px 16px", fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 13.5, lineHeight: 1.55, color: C.amberDeep, marginBottom: 24 }}>
      <strong>Modèle à compléter.</strong> Remplace les éléments surlignés par tes informations réelles. Pour un site commercial en France, ces mentions sont obligatoires — fais-les valider si besoin.
    </div>
  );
}

const PAGE_META = {
  apropos: { title: "À propos", sub: "Notre raison d'être" },
  contact: { title: "Contact", sub: "On vous répond rapidement" },
  confidentialite: { title: "Politique de confidentialité", sub: "Vos données, vos droits" },
  mentions: { title: "Mentions légales", sub: "Informations légales" },
};

function PageContent({ page }) {
  if (page === "apropos") return (
    <>
      <PageBlock h="Notre mission">Tremplin aide chaque candidat à présenter le meilleur de lui-même. Trouver un emploi prend du temps et de l'énergie : nous mettons l'IA au service de l'essentiel — un CV clair, une lettre qui vise juste, un entretien bien préparé.</PageBlock>
      <PageBlock h="Comment c'est né">Tremplin part d'un constat simple : les bons profils sont souvent écartés non pas par manque de compétences, mais par une candidature qui ne met pas ces compétences en valeur. Notre but est de corriger ce déséquilibre.</PageBlock>
      <PageBlock h="Nos principes">Outils simples et rapides, respect de tes données, et tu gardes toujours le dernier mot sur ce que l'IA propose. Tu peux tout modifier, tout exporter.</PageBlock>
    </>
  );
  if (page === "contact") return (
    <>
      <PageBlock h="Une question, une suggestion ?">Écris-nous à <Fill>contact@tremplin.app</Fill> — nous répondons généralement sous 48h ouvrées.</PageBlock>
      <PageBlock h="Support">Pour toute question sur ton abonnement ou un problème technique : <Fill>support@tremplin.app</Fill>.</PageBlock>
      <PageBlock h="Réseaux">Retrouve-nous sur <Fill>LinkedIn</Fill> et <Fill>Instagram</Fill> (à compléter avec tes liens).</PageBlock>
    </>
  );
  if (page === "confidentialite") return (
    <>
      <LegalNote />
      <PageBlock h="Responsable du traitement">Le responsable du traitement des données est <Fill>[Nom de la société / de l'éditeur]</Fill>, joignable à <Fill>contact@tremplin.app</Fill>.</PageBlock>
      <PageBlock h="Données collectées">Compte (nom, e-mail via la connexion Google), informations saisies pour générer tes documents (parcours, expériences, photo), et données de paiement gérées par notre prestataire <Fill>[Stripe]</Fill> — nous ne stockons pas ton numéro de carte.</PageBlock>
      <PageBlock h="Finalités">Création de ton compte, génération de tes documents, gestion de ton abonnement, et amélioration du service.</PageBlock>
      <PageBlock h="Durée de conservation">Tes données sont conservées tant que ton compte est actif, puis supprimées sous <Fill>[délai à définir, ex. 12 mois]</Fill> après résiliation.</PageBlock>
      <PageBlock h="Tes droits (RGPD)">Tu disposes d'un droit d'accès, de rectification, de suppression, de portabilité et d'opposition. Pour les exercer : <Fill>contact@tremplin.app</Fill>. Tu peux aussi saisir la CNIL.</PageBlock>
      <PageBlock h="Cookies">Nous utilisons des cookies nécessaires au fonctionnement (connexion). Les cookies de mesure d'audience ne sont déposés qu'avec ton consentement.</PageBlock>
    </>
  );
  if (page === "mentions") return (
    <>
      <LegalNote />
      <PageBlock h="Éditeur du site">Ce site est édité par <Fill>[Nom / raison sociale]</Fill>, <Fill>[forme juridique, ex. SAS]</Fill> au capital de <Fill>[montant]</Fill>, dont le siège est situé <Fill>[adresse]</Fill>. Immatriculée au RCS de <Fill>[ville]</Fill> sous le numéro <Fill>[SIRET / RCS]</Fill>. TVA intracommunautaire : <Fill>[n° TVA]</Fill>.</PageBlock>
      <PageBlock h="Directeur de la publication"><Fill>[Nom du directeur de la publication]</Fill>.</PageBlock>
      <PageBlock h="Contact"><Fill>contact@tremplin.app</Fill> — <Fill>[téléphone]</Fill>.</PageBlock>
      <PageBlock h="Hébergeur">Le site est hébergé par <Fill>[nom de l'hébergeur, ex. Vercel / OVH]</Fill>, <Fill>[adresse de l'hébergeur]</Fill>, <Fill>[téléphone]</Fill>.</PageBlock>
      <PageBlock h="Propriété intellectuelle">L'ensemble des contenus de ce site est protégé. Toute reproduction sans autorisation est interdite.</PageBlock>
    </>
  );
  return null;
}

function StaticPage({ page, onHome, onStart, onNavigate }) {
  const meta = PAGE_META[page] || { title: "Page", sub: "" };
  const NAV = [
    { t: "À propos", page: "apropos" }, { t: "Contact", page: "contact" },
    { t: "Confidentialité", page: "confidentialite" }, { t: "Mentions légales", page: "mentions" },
  ];
  return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", flexDirection: "column" }}>
      <nav style={{ borderBottom: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button className="tr-btn" onClick={onHome} aria-label="Retour à l'accueil" style={{ display: "flex", alignItems: "center", gap: 9, background: "none", border: "none", cursor: "pointer" }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: C.ink, display: "grid", placeItems: "center" }}><Sparkles size={16} color={C.amber} /></div>
            <span style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 22, color: C.ink }}>Tremplin</span>
          </button>
          <button className="tr-btn" onClick={() => onStart(null)} style={{ background: C.amber, color: C.ink, border: "none", cursor: "pointer", borderRadius: 999, padding: "10px 20px", fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 14.5 }}>Commencer</button>
        </div>
      </nav>

      <main style={{ flex: 1, maxWidth: 760, margin: "0 auto", padding: "48px 24px 64px", width: "100%", boxSizing: "border-box" }}>
        <button className="tr-btn" onClick={onHome} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: C.amberDeep, fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 600, fontSize: 14, marginBottom: 20, padding: 0 }}><ArrowLeft size={16} />Accueil</button>
        <div style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 12.5, letterSpacing: 1.5, textTransform: "uppercase", color: C.amberDeep, marginBottom: 8 }}>{meta.sub}</div>
        <h1 style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, fontSize: 40, color: C.ink, margin: "0 0 28px", letterSpacing: -1 }}>{meta.title}</h1>
        <PageContent page={page} />
      </main>

      <footer style={{ borderTop: `1px solid ${C.line}`, background: C.paper }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px", display: "flex", gap: 18, flexWrap: "wrap", justifyContent: "center" }}>
          {NAV.map((n) => (
            <button key={n.page} className="tr-btn" onClick={() => onNavigate(n.page)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 13.5, fontWeight: page === n.page ? 700 : 500, color: page === n.page ? C.ink : C.inkSoft }}>{n.t}</button>
          ))}
        </div>
        <div style={{ padding: "0 24px 22px", textAlign: "center", fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 12.5, color: C.muted }}>© 2026 Tremplin · Prototype de démonstration</div>
      </footer>
    </div>
  );
}

/* ============================================================
   COMPOSANT PRINCIPAL — routage pages / landing / app
   ============================================================ */
export default function Tremplin() {
  const [account, setAccount] = useState(null);
  const [page, setPage] = useState("home");
  const [onboarding, setOnboarding] = useState(false);
  const [pendingPlan, setPendingPlan] = useState(null);

  const start = (plan) => { setPendingPlan(plan); setOnboarding(true); };
  const complete = (acc) => { setAccount(acc); setOnboarding(false); setPendingPlan(null); };
  const navigate = (p) => { setPage(p); window.scrollTo({ top: 0 }); };
  const scrollToId = (id) => {
    if (id === "haut") { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  // depuis une page statique, revenir à l'accueil puis défiler vers la section
  const goSection = (id) => {
    if (page !== "home") { setPage("home"); setTimeout(() => scrollToId(id), 90); }
    else scrollToId(id);
  };

  let body;
  if (page !== "home") body = <StaticPage page={page} onHome={() => navigate("home")} onStart={start} onNavigate={navigate} />;
  else if (account) body = <Workspace account={account} setAccount={setAccount} onLogout={() => setAccount(null)} />;
  else body = <Landing onStart={start} goSection={goSection} onNavigate={navigate} />;

  return (
    <>
      <style>{FONTS}</style>
      {body}
      {onboarding && !account && (
        <Onboarding pendingPlan={pendingPlan} onClose={() => setOnboarding(false)} onComplete={complete} />
      )}
    </>
  );
}
