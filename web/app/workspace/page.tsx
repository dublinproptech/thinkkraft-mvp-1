"use client";

import { useEffect, useState } from "react";

const SCRATCH_URL =
  process.env.NEXT_PUBLIC_SCRATCH_URL ??
  "https://scratch.mit.edu/projects/editor/";

export default function WorkspacePage() {
  const [studentId] = useState(() =>
    typeof window === "undefined"
      ? ""
      : (new URLSearchParams(window.location.search).get("studentId") ?? ""),
  );
  const [lessonId] = useState(() =>
    typeof window === "undefined"
      ? ""
      : (new URLSearchParams(window.location.search).get("lessonId") ?? ""),
  );
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Read who and which lesson from the URL, e.g. /workspace?studentId=..&lessonId=..

  async function save() {
    setErr(null);
    setMsg(null);
    if (!studentId || !lessonId) {
      setErr("Missing studentId or lessonId in the URL.");
      return;
    }
    if (!file) {
      setErr("Choose your saved .sb3 file first.");
      return;
    }

    const form = new FormData();
    form.append("file", file);
    form.append("studentId", studentId);
    form.append("lessonId", lessonId);

    const res = await fetch("/api/projects", {
      method: "POST",
      body: form,
    }).then((r) => r.json());
    if (res.error) {
      setErr(res.error);
      return;
    }
    setMsg(`Saved. Project id: ${res.project.id}`);
  }

  return (
    <main className="wrap">
      <div className="brand">
        <span className="mark">✦</span> ThinkKraft <small>.ai</small>
      </div>
      <span className="badge" style={{ marginTop: 24 }}>
        Phase 2 · workspace
      </span>
      <h1 style={{ fontSize: 34, margin: "14px 0 6px", color: "var(--navy)" }}>
        Build your project
      </h1>
      <p className="muted" style={{ fontSize: 15 }}>
        Student {studentId || "?"} · lesson {lessonId || "?"}
      </p>

      <div className="card" style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 18, color: "var(--navy)" }}>
          1. Make your game
        </h2>
        <p className="muted" style={{ margin: "8px 0 14px" }}>
          Open Scratch, build your project, then use File then Save to your
          computer to get a .sb3 file.
        </p>
        <a
          className="btn btn-primary"
          href={SCRATCH_URL}
          target="_blank"
          rel="noreferrer"
        >
          Open Scratch editor
        </a>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 18, color: "var(--navy)" }}>2. Save it here</h2>
        <p className="muted" style={{ margin: "8px 0 12px" }}>
          Upload the .sb3 file you just saved.
        </p>
        <input
          type="file"
          accept=".sb3"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <div style={{ marginTop: 14 }}>
          <button className="btn btn-primary" onClick={save}>
            Save project
          </button>
        </div>
        {err && (
          <p style={{ color: "var(--coral)", fontWeight: 700, marginTop: 14 }}>
            {err}
          </p>
        )}
        {msg && (
          <p style={{ color: "var(--navy)", fontWeight: 700, marginTop: 14 }}>
            {msg}
          </p>
        )}
      </div>
    </main>
  );
}
