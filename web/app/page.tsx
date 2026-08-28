"use client";

import { useEffect, useState } from "react";

// A tiny status dashboard. Its only job in Phase 0 is to prove, visually and
// in the theme, that the three moving parts are alive and can talk:
//   - the web app itself (this page rendered, so it is up)
//   - the database (checked through /api/health)
//   - the AI service, and through it Ollama (checked through /api/ai-check)

type State = "wait" | "ok" | "bad";

function Row({
  label,
  state,
  detail,
}: {
  label: string;
  state: State;
  detail?: string;
}) {
  return (
    <div className="card">
      <div className="status">
        <span className={`dot ${state}`} />
        {label}
      </div>
      {detail && (
        <p className="muted" style={{ margin: "10px 0 0" }}>
          {detail}
        </p>
      )}
    </div>
  );
}

export default function Home() {
  const [db, setDb] = useState<State>("wait");
  const [ai, setAi] = useState<State>("wait");
  const [aiDetail, setAiDetail] = useState<string>("checking...");
  const [dbDetail, setDbDetail] = useState<string>("checking...");

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => {
        setDb(d.db === "connected" ? "ok" : "bad");
        setDbDetail(
          d.db === "connected"
            ? "Postgres connected"
            : (d.detail ?? "unreachable"),
        );
      })
      .catch(() => {
        setDb("bad");
        setDbDetail("request failed");
      });

    fetch("/api/ai-check")
      .then((r) => r.json())
      .then((d) => {
        setAi(d.status === "ok" ? "ok" : "bad");
        setAiDetail(
          d.status === "ok"
            ? "AI service reachable"
            : (d.detail ?? "unreachable"),
        );
      })
      .catch(() => {
        setAi("bad");
        setAiDetail("request failed");
      });
  }, []);

  return (
    <main className="wrap">
      <div className="brand">
        <span className="mark">✦</span> ThinkKraft <small>.ai</small>
      </div>

      <span className="badge" style={{ marginTop: 24 }}>
        Phase 0 · foundations
      </span>
      <h1 style={{ fontSize: 40, margin: "14px 0 6px", color: "var(--navy)" }}>
        The skeleton is running
      </h1>
      <p className="muted" style={{ fontSize: 16, maxWidth: 560 }}>
        If all three below are green, your web app, database and AI service are
        wired together and talking.
      </p>

      <div className="grid" style={{ marginTop: 24 }}>
        <Row
          label="Web app"
          state="ok"
          detail="This page rendered, so the Next.js app is up"
        />
        <Row label="Database" state={db} detail={dbDetail} />
        <Row label="AI service" state={ai} detail={aiDetail} />
      </div>
    </main>
  );
}
