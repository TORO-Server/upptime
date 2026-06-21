import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export default defineEventHandler(async () => {
  const file = resolve(process.cwd(), "public/data/summary.json");
  const text = await readFile(file, "utf-8");
  return JSON.parse(text);
});
