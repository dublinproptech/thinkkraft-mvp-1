"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AppBar from "../components/AppBar";

type Child = {
  id: string;
  displayName: string;
  ageBand: string;
  user: { username: string | null } | null;
  enrolments: {
    status: string;
    cohort: { id: string; schedule: string; course: { title: string } };
  }[];
  _count: { projects: number; hintEvents: number };
};

type Cohort = {
  id: string;
  schedule: string;
  course: { title: string; ageBand: string };
  teacher: { name: string };
};

// The parent's home. They add each child here, and the child then signs in on
// the normal login screen with the username and PIN set below.
export default function ParentDashboard() {
  const [children, setChildren] = useState<Child[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [cohortId, setCohortId] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Held after a successful add so the parent can read the sign-in details out
  // to their child. The PIN is never retrievable later: it is stored hashed.
  const [justAdded, setJustAdded] = useState<{ name: string; username: string; pin: string } | null>(
    null,
  );

  const load = useCallback(async () => {
    try {
      const [kidsRes, cohortsRes] = await Promise.all([
        fetch("/api/parents/children"),
        fetch("/api/cohorts"),
      ]);
      if (kidsRes.ok) setChildren((await kidsRes.json()).children ?? []);
      if (cohortsRes.ok) {
        const list: Cohort[] = (await cohortsRes.json()).cohorts ?? [];
        setCohorts(list);
        setCohortId((current) => current || list[0]?.id || "");
      }
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const first = setTimeout(() => void load(), 0);
    return () => clearTimeout(first);
  }, [load]);

  function resetForm() {
    setDisplayName("");
    setUsername("");
    setPin("");
    setError(null);
  }

  async function addChild(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setJustAdded(null);
    setBusy(true);

    try {
      // 1. Create the child account under this parent.
      const res = await fetch("/api/parents/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, ageBand: "9-13", username, pin }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(readError(body) ?? "We could not create that account.");
        return;
      }

      // 2. Enrol them into the chosen class. A child with no class has no
      // lessons to open, so this is part of adding them, not a later step.
      if (cohortId) {
        const enrol = await fetch("/api/enrolments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId: body.child.studentId, cohortId }),
        });
        if (!enrol.ok && enrol.status !== 409) {
          const enrolBody = await enrol.json().catch(() => null);
          setError(
            `${displayName} was created, but we could not enrol them: ${
              readError(enrolBody) ?? "please try again"
            }.`,
          );
        }
      }

      setJustAdded({ name: displayName, username, pin });
      setShowForm(false);
      resetForm();
      await load();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <AppBar links={[{ href: "/parent/consent", label: "Consent" }]} />

      <main className="shell">
        <div className="page-head">
          <h1>Your family</h1>
          <p>
            Add each child here. They then sign in on the same login page with the
            username and PIN you choose, and go straight to their lessons.
          </p>
        </div>

        {error && (
          <p className="notice notice-error" style={{ marginBottom: 18 }}>
            {error}
          </p>
        )}

        {justAdded && (
          <div className="panel panel-accent" style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 20, color: "var(--navy)", marginBottom: 8 }}>
              {justAdded.name} is ready to sign in
            </h2>
            <p style={{ margin: "0 0 14px", fontWeight: 700, color: "var(--navy)" }}>
              Write these down now. The PIN is stored securely and cannot be shown
              again, though you can always set a new one.
            </p>
            <div style={{ display: "flex", gap: 22, flexWrap: "wrap", marginBottom: 14 }}>
              <Credential label="Username" value={justAdded.username} />
              <Credential label="PIN" value={justAdded.pin} />
            </div>
            <button className="btn-ghost btn-sm" onClick={() => setJustAdded(null)}>
              Got it
            </button>
          </div>
        )}

        {loading ? (
          <div className="panel empty">
            <p>Loading your family...</p>
          </div>
        ) : (
          <>
            {children.length === 0 && !showForm ? (
              <div className="panel empty">
                <h3>No children yet</h3>
                <p style={{ marginBottom: 18 }}>
                  Add your first child to get them started in Scratch.
                </p>
                <button className="btn-solid" onClick={() => setShowForm(true)}>
                  Add a child
                </button>
              </div>
            ) : (
              <div className="grid" style={{ marginBottom: 20 }}>
                {children.map((child) => {
                  const enrolment = child.enrolments[0];
                  return (
                    <div key={child.id} className="panel">
                      <div className="status" style={{ marginBottom: 12 }}>
                        <div className={`dot ${enrolment ? "ok" : "wait"}`} />
                        <span style={{ fontSize: 19, color: "var(--navy)" }}>
                          {child.displayName}
                        </span>
                      </div>

                      <div style={{ marginBottom: 14 }}>
                        <Credential
                          label="Signs in as"
                          value={child.user?.username ?? "no account"}
                        />
                      </div>

                      <p className="muted" style={{ margin: "0 0 4px" }}>
                        {enrolment
                          ? `${enrolment.cohort.course.title} · ${enrolment.cohort.schedule}`
                          : "Not in a class yet"}
                      </p>
                      <p className="muted" style={{ margin: "0 0 16px" }}>
                        {child._count.projects} project
                        {child._count.projects === 1 ? "" : "s"} ·{" "}
                        {child._count.hintEvents} hint
                        {child._count.hintEvents === 1 ? "" : "s"} received
                      </p>

                      <Link
                        href={`/parent/recap?studentId=${child.id}`}
                        className="btn-ghost btn-sm"
                      >
                        See their recap
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}

            {children.length > 0 && !showForm && (
              <button className="btn-solid" onClick={() => setShowForm(true)}>
                Add another child
              </button>
            )}

            {showForm && (
              <form onSubmit={addChild} className="panel" style={{ maxWidth: 520 }}>
                <h2 style={{ fontSize: 21, color: "var(--navy)", marginBottom: 16 }}>
                  Add a child
                </h2>

                <div className="field">
                  <label htmlFor="child-name">Child&apos;s name</label>
                  <input
                    id="child-name"
                    className="input"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    maxLength={100}
                  />
                </div>

                <div className="field">
                  <label htmlFor="child-username">Username</label>
                  <input
                    id="child-username"
                    className="input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength={3}
                    maxLength={30}
                    pattern="[A-Za-z0-9_]+"
                    placeholder="alice123"
                  />
                  <span className="hint">
                    Letters, numbers and underscores. This is what your child types
                    to sign in, so no email address is needed.
                  </span>
                </div>

                <div className="field">
                  <label htmlFor="child-pin">PIN</label>
                  <input
                    id="child-pin"
                    className="input"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    required
                    inputMode="numeric"
                    pattern="\d{4,6}"
                    maxLength={6}
                    placeholder="4 to 6 digits"
                  />
                  <span className="hint">Short enough for your child to remember.</span>
                </div>

                {cohorts.length > 0 && (
                  <div className="field">
                    <label htmlFor="child-cohort">Class</label>
                    <select
                      id="child-cohort"
                      className="input"
                      value={cohortId}
                      onChange={(e) => setCohortId(e.target.value)}
                    >
                      {cohorts.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.course.title} · {c.schedule} · {c.teacher.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
                  <button type="submit" className="btn-solid" disabled={busy}>
                    {busy ? "Creating..." : "Create account"}
                  </button>
                  <button
                    type="button"
                    className="btn-ghost"
                    disabled={busy}
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </main>
    </>
  );
}

function Credential({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="muted" style={{ fontSize: 12.5, marginBottom: 3 }}>
        {label}
      </div>
      <code
        style={{
          fontSize: 16,
          fontWeight: 800,
          color: "var(--navy)",
          background: "var(--cream)",
          border: "2px solid var(--navy)",
          borderRadius: 8,
          padding: "5px 11px",
          display: "inline-block",
        }}
      >
        {value}
      </code>
    </div>
  );
}

function readError(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const { error } = body as { error?: unknown };
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const { fieldErrors, formErrors } = error as {
      fieldErrors?: Record<string, string[]>;
      formErrors?: string[];
    };
    for (const list of Object.values(fieldErrors ?? {})) {
      if (list?.[0]) return list[0];
    }
    return formErrors?.[0] ?? null;
  }
  return null;
}
