import { prisma } from "@/lib/prisma";

// Whether anyone is watching the approval queue.
//
// This is the thing that decides if a child waits for a person or gets their
// hint straight away, so it is deliberately conservative: presence has to be
// proven by a recent heartbeat, and anything uncertain counts as supervised,
// which is the safer answer because it means the hint waits.

// A teacher counts as online if the queue has checked in within this window.
// The queue polls every 5 seconds, so 90 seconds tolerates a slow network, a
// backgrounded tab and a browser throttling timers without declaring an
// attentive teacher absent.
export const ONLINE_WINDOW_MS = 90_000;

// How long a hint may sit unread before it is released anyway. Longer than the
// online window on purpose: a teacher has to be properly gone, not just
// between polls, before anything goes out unsupervised.
export const STALE_AFTER_MS = 120_000;

function since(ms: number) {
  return new Date(Date.now() - ms);
}

// The heartbeat. Called by the approval queue while a teacher is looking at it.
export function markTeacherSeen(teacherId: string) {
  return prisma.teacher.update({
    where: { id: teacherId },
    data: { lastSeenAt: new Date() },
  });
}

export async function teachersOnline() {
  return prisma.teacher.count({
    where: { lastSeenAt: { gte: since(ONLINE_WINDOW_MS) } },
  });
}

// The question every hint asks before it is filed.
//
// On a database error this returns true, meaning supervised, meaning the hint
// waits for a person. Failing the other way would release hints to children
// because a query timed out.
export async function isSupervised(): Promise<boolean> {
  try {
    return (await teachersOnline()) > 0;
  } catch {
    return true;
  }
}

// Hints raised while someone was watching, which nobody then read. Used by the
// stream so a child is not left waiting on a teacher who closed their laptop.
// Both conditions have to hold: the hint is old enough, and no teacher has
// been seen since.
export async function releaseStaleHints(studentId: string) {
  const nobodyAround = (await teachersOnline()) === 0;
  if (!nobodyAround) return 0;

  const { count } = await prisma.hintEvent.updateMany({
    where: {
      studentId,
      status: "PROPOSED",
      createdAt: { lte: since(STALE_AFTER_MS) },
    },
    data: { status: "APPROVED", autoApprovedAt: new Date() },
  });
  return count;
}

// What a teacher sees about the time they were away.
export function autoApprovedHints(limit = 50) {
  return prisma.hintEvent.findMany({
    where: { autoApprovedAt: { not: null } },
    orderBy: { autoApprovedAt: "desc" },
    take: limit,
    include: { student: { select: { displayName: true } } },
  });
}
