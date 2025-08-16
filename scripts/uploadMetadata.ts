import "dotenv/config";
import { Tusky, File } from "@tusky-io/ts-sdk";

async function main() {
  const apiKey = process.env.TUSKY_API_KEY!;
  const vaultId = process.env.TUSKY_VAULT_ID!;
  if (!apiKey || !vaultId) throw new Error("Missing TUSKY_API_KEY or TUSKY_VAULT_ID in .env");

  const client = new Tusky({ apiKey });

  const metadata = {
    name: "PSG Ticket #1",
    description: "PSG vs ETH New Yorkers — Section A, Row 1, Seat 1",
    image: "ipfs://placeholder",
    attributes: [
      { trait_type: "Section", value: "A" },
      { trait_type: "Row", value: "1" },
      { trait_type: "Seat", value: "1" },
      { trait_type: "Event", value: "PSG vs ETH New Yorkers" },
    ],
  };

  const filename = "ticket-1.json";
  const fileBuffer = Buffer.from(JSON.stringify(metadata, null, 2));

  // ✅ Use File.create to upload into your vault
  const res = await File.create(client, {
    vaultId,
    name: filename,
    data: fileBuffer,
  });

  console.log("File created:", res);

  const url =
    res?.url || res?.file?.url || res?.data?.url || res?.location || res?.publicUrl || res?.link;
  if (url) console.log("Public URL:", url);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});