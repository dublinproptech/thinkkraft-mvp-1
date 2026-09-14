"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApproveButton({ hintId }: { hintId: string }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function approve() {
    setBusy(true);
    // teacherId comes from the URL for now (real auth is Phase 7).
    const teacherId =
      new URLSearchParams(window.location.search).get("teacherId") ?? "";
    const res = await fetch("/api/hints/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hintId, teacherId }),
    });
    setBusy(false);
    if (res.ok) {
      router.refresh(); // re-fetch the server component so the approved hint drops off the list
    } else {
      alert(`Approve failed: ${res.status}`);
    }
  }

  return (
    <button className="btn btn-primary" onClick={approve} disabled={busy}>
      {busy ? "Approving..." : "Approve"}
    </button>
  );
}
