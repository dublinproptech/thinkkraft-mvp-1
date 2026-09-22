import { approvedHintsForStudent } from "@/lib/db/hints";
import { requireStudent } from "@/lib/session";

export const dynamic = "force-dynamic";

// How many already-approved hints a child sees when they open the workspace.
// Enough to catch up on a lesson without replaying their whole history.
const BACKLOG = 20;

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

  // Optional filter, not an identity: studentId still comes from the session,
  // so naming someone else's lesson only narrows your own hints.
  const lessonId = new URL(req.url).searchParams.get("lessonId") ?? undefined;
  const encoder = new TextEncoder();
  const sent = new Set<string>();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;

      const push = (obj: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

      // On connect, send the hints a teacher has already approved.
      //
      // This used to mark them all as seen and send nothing, which meant a
      // child only ever saw a hint approved while they happened to have the
      // page open. Approve one before they open the workspace, or let them
      // reload, and it was gone for good.
      //
      // Everything already approved counts as seen, including hints older than
      // the backlog. Otherwise the poll below would treat them as new and
      // deliver the child's entire history a second and a half later.
      //
      // Newest first from the database, so reverse the slice we do send: the
      // panel puts each arriving hint on top, which leaves the newest on top.
      // backlog says whether a hint is being caught up on or has just been
      // approved. The panel announces the second kind and stays quiet about the
      // first, so opening the page does not fire twenty notifications.
      const initial = await approvedHintsForStudent(studentId, lessonId);
      initial.forEach((h) => sent.add(h.id));
      for (const h of initial.slice(0, BACKLOG).reverse()) {
        push({ id: h.id, text: h.text, level: h.level, backlog: true });
      }

      const tick = async () => {
        if (closed) return;
        const hints = await approvedHintsForStudent(studentId, lessonId);
        for (const h of hints) {
          if (!sent.has(h.id)) {
            sent.add(h.id);
            push({ id: h.id, text: h.text, level: h.level, backlog: false });
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
