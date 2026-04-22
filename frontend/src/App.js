import { useState } from "react";

const LANGUAGES = ["C++", "Python", "JavaScript", "Java", "TypeScript", "Go", "Rust"];

const BADGE_COLORS = {
  syntax:  { bg: "#422006", color: "#fbbf24" },
  runtime: { bg: "#450a0a", color: "#f87171" },
  logic:   { bg: "#172554", color: "#60a5fa" },
  none:    { bg: "#052e16", color: "#4ade80" },
};

function BugResult({ result }) {
  const bt = (result.bug_type || "none").toLowerCase();
  const badge = BADGE_COLORS[bt] || BADGE_COLORS.none;

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={{ ...styles.badge, background: badge.bg, color: badge.color }}>
          {bt}
        </span>
        {result.line != null && (
          <span style={styles.lineNum}>Line {result.line}</span>
        )}
      </div>

      <div style={styles.grid}>
        <Field label="Issue" value={result.issue} />
        <Field label="Why" value={result.explanation} />
        <div style={{ gridColumn: "1 / -1" }}>
          <p style={styles.fieldLabel}>Fix</p>
          <pre style={styles.fixPre}>{result.fix}</pre>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p style={styles.fieldLabel}>{label}</p>
      <p style={styles.fieldVal}>{value || "—"}</p>
    </div>
  );
}

export default function App() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("C++");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleDebug() {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Server error");
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleDebug();
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>AI Code Debugger</h1>
          <p style={styles.subtitle}>Paste code · Pick language · Get the fix</p>
        </header>

        <div style={styles.controls}>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={styles.select}
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          <button
            onClick={handleDebug}
            disabled={loading || !code.trim()}
            style={{
              ...styles.btn,
              opacity: loading || !code.trim() ? 0.45 : 1,
              cursor: loading || !code.trim() ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Analyzing…" : "Debug  ⌘↵"}
          </button>
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste your code here…"
          style={styles.textarea}
          spellCheck={false}
        />

        {error && <p style={styles.error}>{error}</p>}
        {result && <BugResult result={result} />}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    padding: "2.5rem 1rem",
    background: "#0f0f0f",
  },
  container: {
    width: "100%",
    maxWidth: 680,
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  header: { marginBottom: "0.5rem" },
  title: {
    fontSize: 24,
    fontWeight: 600,
    color: "#e8e8e8",
    letterSpacing: "-0.02em",
  },
  subtitle: { fontSize: 13, color: "#666", marginTop: 4 },
  controls: { display: "flex", gap: 10 },
  select: {
    flex: "0 0 150px",
    background: "#1a1a1a",
    color: "#e8e8e8",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 13,
    fontFamily: "inherit",
    cursor: "pointer",
  },
  btn: {
    flex: 1,
    background: "#a78bfa",
    color: "#0f0f0f",
    border: "none",
    borderRadius: 8,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "inherit",
    transition: "opacity .15s",
  },
  textarea: {
    width: "100%",
    minHeight: 220,
    background: "#1a1a1a",
    color: "#e8e8e8",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    padding: "14px",
    fontSize: 13,
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    resize: "vertical",
    lineHeight: 1.6,
    outline: "none",
  },
  card: {
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: 10,
    overflow: "hidden",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    background: "#141414",
    borderBottom: "1px solid #2a2a2a",
  },
  badge: {
    fontSize: 11,
    fontWeight: 600,
    padding: "2px 9px",
    borderRadius: 20,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  lineNum: { fontSize: 12, color: "#666" },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 0,
    padding: "14px",
    gap: 16,
  },
  fieldLabel: { fontSize: 11, color: "#555", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" },
  fieldVal: { fontSize: 13, color: "#ccc", lineHeight: 1.5 },
  fixPre: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 12,
    background: "#0f0f0f",
    border: "1px solid #2a2a2a",
    borderRadius: 6,
    padding: "10px 12px",
    color: "#a78bfa",
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
    marginTop: 6,
  },
  error: { color: "#f87171", fontSize: 13, padding: "10px 0" },
};
