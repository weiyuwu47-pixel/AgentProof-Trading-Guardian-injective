import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

export async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

export async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function latestJsonFile(dirPath: string, prefix: string): Promise<string> {
  const entries = await readdir(dirPath);
  const matches = entries
    .filter((entry) => entry.startsWith(prefix) && entry.endsWith(".json"))
    .sort();

  if (matches.length === 0) {
    throw new Error(`No ${prefix}*.json files found in ${dirPath}`);
  }

  return path.join(dirPath, matches[matches.length - 1]);
}

export function timestampForFile(date = new Date()): string {
  return date.toISOString().replace(/[:.]/g, "-");
}
