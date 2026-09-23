import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import { Prisma } from "@/generated/prisma/client";

// The three things every admin route does: check the caller is an admin,
// validate the body, and turn a database complaint into a message a person can
// act on. Written once here so no route has to remember, and so the panel gets
// the same shape of error whatever went wrong.

type Handler<T> = (input: T) => Promise<Response>;

export async function adminAction<S extends z.ZodTypeAny>(
  req: Request,
  schema: S,
  handler: Handler<z.infer<S>>,
): Promise<Response> {
  const who = await requireAdmin();
  if (!who.ok) return who.response;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    // First message only: the panel shows it beside the form, and a list of
    // every field at once reads as noise.
    const first = parsed.error.issues[0];
    return Response.json(
      { error: first?.message ?? "That is not a valid request." },
      { status: 400 },
    );
  }

  try {
    return await handler(parsed.data);
  } catch (e) {
    const writing = req.method === "POST" || req.method === "PUT";
    return Response.json(
      { error: describe(e, writing) },
      { status: statusFor(e, writing) },
    );
  }
}

// Read-only routes still need the guard, and still need errors not to leak a
// stack trace to the browser.
export async function adminRead(handler: () => Promise<Response>): Promise<Response> {
  const who = await requireAdmin();
  if (!who.ok) return who.response;
  try {
    return await handler();
  } catch (e) {
    return Response.json({ error: describe(e) }, { status: statusFor(e) });
  }
}

function statusFor(e: unknown, writing = false) {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2002") return 409;
    // On a write, a broken foreign key means the thing being pointed at does
    // not exist, which is bad input. On a delete it means something still
    // points at this, which is a conflict.
    if (e.code === "P2003" || e.code === "P2014") return writing ? 400 : 409;
    if (e.code === "P2025") return 404;
  }
  return 500;
}

// Prisma's own messages describe the schema, not the problem. These describe
// the problem.
function describe(e: unknown, writing = false) {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2002") {
      // Where the clashing field is named depends on the driver. Prisma 7 with
      // the pg adapter buries the constraint name at
      // meta.driverAdapterError.cause.constraint.index, older setups put it in
      // meta.target. Searching the whole of meta covers both without betting on
      // either, and the constraint names carry the field name either way.
      const on = JSON.stringify(e.meta ?? {});
      if (on.includes("orderNo")) return "That course already has a lesson at that number.";
      if (on.includes("email")) return "That email is already in use.";
      return "Something with those details already exists.";
    }
    if (e.code === "P2003" || e.code === "P2014") {
      return writing
        ? "That points at something which does not exist."
        : "Something else still refers to this, so it cannot be removed.";
    }
    if (e.code === "P2025") return "That no longer exists.";
  }
  console.error("admin route failed:", e);
  return "Something went wrong. Try again in a moment.";
}
