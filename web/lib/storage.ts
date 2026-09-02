import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const DIR = path.join(process.cwd(), "storage", "projects");

export async function saveSb3(bytes: Buffer): Promise<string> {
  await mkdir(DIR, { recursive: true });
  const ref = `${randomUUID()}.sb3`;
  await writeFile(path.join(DIR, ref), bytes);
  return ref;
}
