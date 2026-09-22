"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

// Fetching for the admin panel, in one place so every list behaves the same:
// a loader while it waits, a message when it fails, and a reload after a write.

async function parse(res: Response) {
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      typeof body?.error === "string" ? body.error : "Something went wrong.",
    );
  }
  return body;
}

export function useList<T>(url: string, key: string) {
  const [data, setData] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const body = await parse(await fetch(url));
      setData(body[key] ?? []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load that.");
      setData([]);
    }
  }, [url, key]);

  useEffect(() => {
    // Through a timer so the effect never sets state synchronously.
    const first = setTimeout(() => void load(), 0);
    return () => clearTimeout(first);
  }, [load]);

  return { data, error, reload: load, loading: data === null && error === null };
}

// A write, with the toast it deserves. Returns true when it landed, so a form
// knows whether to close.
export async function send(
  url: string,
  method: "POST" | "PUT" | "DELETE",
  body?: unknown,
  message?: string,
): Promise<boolean> {
  try {
    await parse(
      await fetch(url, {
        method,
        ...(body
          ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
          : {}),
      }),
    );
    if (message) toast.success(message);
    return true;
  } catch (e) {
    // The message is the one the route wrote, for example which lessons are
    // blocking a course from being deleted.
    toast.error(e instanceof Error ? e.message : "Something went wrong.");
    return false;
  }
}

// The same thing for an endpoint that returns one object rather than a list.
export function useOne<T>(url: string, key: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const body = await parse(await fetch(url));
      setData(body[key] ?? null);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load that.");
    }
  }, [url, key]);

  useEffect(() => {
    const first = setTimeout(() => void load(), 0);
    return () => clearTimeout(first);
  }, [load]);

  return { data, error, reload: load, loading: data === null && error === null };
}
