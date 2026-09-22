"use client";

import { useEffect } from "react";

// The three states every list on this panel can be in, and the dialog every
// form opens in. Written once so a loading table looks the same everywhere.

export function TableState({
  loading,
  error,
  empty,
  emptyText,
  onRetry,
}: {
  loading: boolean;
  error: string | null;
  empty: boolean;
  emptyText: string;
  onRetry: () => void;
}) {
  if (loading) return <Skeleton />;
  if (error) {
    return (
      <div className="panel empty">
        <h3>That did not load</h3>
        <p>{error}</p>
        <div className="panel-actions">
          <button className="btn-solid btn-sm" onClick={onRetry}>
            Try again
          </button>
        </div>
      </div>
    );
  }
  if (empty) {
    return (
      <div className="panel empty">
        <h3>Nothing here yet</h3>
        <p>{emptyText}</p>
      </div>
    );
  }
  return null;
}

// Three shimmering rows, so a slow list looks like it is arriving rather than
// like nothing happened.
export function Skeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="table-wrap skeleton-wrap" aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton skeleton-row" />
      ))}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <>
      <span className="spinner" aria-hidden="true" />
      {label ? <span>{label}</span> : <span className="sr-only">Working</span>}
    </>
  );
}

export function Modal({
  title,
  note,
  onClose,
  children,
}: {
  title: string;
  note?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  // Escape closes it, which is the one keyboard behaviour a dialog has to have.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="modal-back"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      // Clicking the backdrop closes; clicking the dialog itself must not.
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            {note && <p className="modal-note">{note}</p>}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

// A count of what refers to a row. It is also what stops the row being
// deleted, so it is worth showing before anyone tries.
export function Count({ n, one }: { n: number; one: string }) {
  return (
    <span className={n ? "pill pill-on" : "pill"}>
      {n} {one}
      {n === 1 ? "" : "s"}
    </span>
  );
}
