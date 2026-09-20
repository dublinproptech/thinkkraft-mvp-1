import { approvedHintsForStudent } from "@/lib/db/hints";
import { requireStudent } from "@/lib/session";

export const dynamic = "force-dynamic";

// A Server-Sent Events stream of a student's approved hints.
// The browser opens this once; we push any new approved hints as they appear.
//
// studentId used to come from the query string, which meant anyone could listen
// to any child's hints by changing a number in the URL. It now comes from the
// session, so a child can only ever stream their own.
export async function GET(req: Request) {
  const who = await requireStudent();
  if (!who.ok) return who.response;

  const studentId = who.studentId;
  const encoder = new TextEncoder();
  const sent = new Set<string>();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;

      const push = (obj: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

      // On connect, mark existing approved hints as already seen so we only
      // push genuinely new ones after this point.
      const initial = await approvedHintsForStudent(studentId);
      initial.forEach((h) => sent.add(h.id));

      const tick = async () => {
        if (closed) return;
        const hints = await approvedHintsForStudent(studentId);
        for (const h of hints) {
          if (!sent.has(h.id)) {
            sent.add(h.id);
            push({ id: h.id, text: h.text });
          }
        }
      };

      const timer = setInterval(tick, 1500);

      // Clean up when the browser disconnects. The flag stops an in-flight
      // tick from enqueuing onto an already-closed controller.
      req.signal.addEventListener("abort", () => {
        closed = true;
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
