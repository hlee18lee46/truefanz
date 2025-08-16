// scripts/uploadPinataFolder.ts
import fs from "node:fs";
import path from "node:path";
import PinataClient from "@pinata/sdk";
import "dotenv/config";

const PINATA_JWT = process.env.PINATA_JWT;
if (!PINATA_JWT) throw new Error("Missing PINATA_JWT in .env");

const EVENT_SLUG = "psg-ny-2025-01";         // folder name + tokenURI prefix
const OUT_DIR = path.join("metadata", EVENT_SLUG);

function ensureJsons(count = 100) {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  // Example seats A-1-1 .. A-10-10 (100 seats)
  const sections = ["A"];
  const rows = Array.from({ length: 10 }, (_, i) => i + 1);
  const seats = Array.from({ length: 10 }, (_, i) => i + 1);

  const made: string[] = [];
  for (const section of sections) {
    for (const row of rows) {
      for (const seat of seats) {
        const seatLabel = `${section}-${row}-${seat}`;
        const obj = {
          name: `PSG vs ETH New Yorkers — Seat ${seatLabel}`,
          description: `Official match ticket for ${EVENT_SLUG}. Section ${section}, Row ${row}, Seat ${seat}.`,
          image: "ipfs://bafybeigdyrplaceholder/psg-ticket.png", // replace later if you upload an image
          attributes: [
            { trait_type: "Section", value: section },
            { trait_type: "Row", value: row },
            { trait_type: "Seat", value: seat },
            { trait_type: "Event", value: EVENT_SLUG },
          ],
        };
        const filename = path.join(OUT_DIR, `${seatLabel}.json`);
        fs.writeFileSync(filename, JSON.stringify(obj, null, 2));
        made.push(filename);
        if (made.length >= count) return made;
      }
    }
  }
  return made;
}

async function main() {
  const files = ensureJsons(100);

  const pinata = new PinataClient({ pinataJWTKey: PINATA_JWT });

  // Pin the whole folder as ONE pin
  const res = await pinata.pinFromFS(OUT_DIR, {
    pinataMetadata: { name: `metadata-${EVENT_SLUG}` },
  });

  // You’ll use this as your baseURI in the NFT contract
  const baseURI = `ipfs://${res.IpfsHash}/`;
  console.log("Pinned folder CID:", res.IpfsHash);
  console.log("Use baseURI:", baseURI);
  console.log(`Pinned ${files.length} metadata files to ${OUT_DIR}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});