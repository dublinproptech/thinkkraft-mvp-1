import { approvedHintsForStudent } from "@/lib/db/hints";

export const dynamic = "force-dynamic";

// A Server-Sent Events stream of a student's approved hints.
// The browser opens this once; we push any new approved hints as they appear.
export async function GET(req: Request) {
  const studentId = new URL(req.url).searchParams.get("studentId");
  if (!studentId) return new Response("studentId required", { status: 400 });

  const encoder = new TextEncoder();
  const sent = new Set<string>();

  const stream = new ReadableStream({
    async start(controller) {
      const push = (obj: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

      // On connect, mark existing approved hints as already seen so we only
      // push genuinely new ones after this point.
      const initial = await approvedHintsForStudent(studentId);
      initial.forEach((h) => sent.add(h.id));

      const tick = async () => {
        const hints = await approvedHintsForStudent(studentId);
        for (const h of hints) {
          if (!sent.has(h.id)) {
            sent.add(h.id);
            push({ id: h.id, text: h.text });
          }
        }
      };

      const timer = setInterval(tick, 1500);

      // Clean up when the browser disconnects.
      req.signal.addEventListener("abort", () => {
        clearInterval(timer);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
