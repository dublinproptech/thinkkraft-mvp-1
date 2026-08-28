const BASE = process.env.AI_SERVICE_URL ?? "http://localhost:8000";

export async function aiHealth() {
  try {
    const res = await fetch(`${BASE}/health`, { cache: "no-store" });
    if (!res.ok) throw new Error(`status ${res.status}`);
    return { status: "ok", ai: await res.json() };
  } catch (e) {
    return { status: "error", detail: String(e) };
  }
}
