import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";

const DIR = "metadata/psg-ny-2025-01";
const OUTPUT = "walrus-uris.json";

function put(filePath: string): string {
  // `walrus put <file>` prints a Blob ID in stdout; we parse the last 0x… hex
  const out = execFileSync("walrus", ["put", filePath], { encoding: "utf8" });
  const match = out.match(/0x[a-fA-F0-9]+/g);
  if (!match || match.length === 0) throw new Error(`No blob id in walrus output for ${filePath}:\n${out}`);
  return `walrus://${match[match.length - 1]}`;
}

function main() {
  const entries = fs.readdirSync(DIR).filter(f => f.endsWith(".json"));
  const map: Record<string,string> = {};

  for (const f of entries) {
    const seatLabel = path.basename(f, ".json"); // A-1-1
    const full = path.join(DIR, f);
    const uri = put(full);
    map[seatLabel] = uri;
    console.log(`${seatLabel} -> ${uri}`);
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(map, null, 2));
  console.log(`Wrote ${OUTPUT} with ${entries.length} walrus URIs`);
}

main();