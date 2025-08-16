// scripts/uploadPinata.ts
import fs from "fs";
import path from "path";
import pinataSDK from "@pinata/sdk";

const pinata = new pinataSDK({
  pinataJWTKey: process.env.PINATA_JWT,
});

async function main() {
  const metadataDir = "metadata/psg-ny-2025-01";
  const files = fs.readdirSync(metadataDir);

  // only take first 20 seats
  const limitedFiles = files.slice(0, 20);

  for (const file of limitedFiles) {
    const filepath = path.join(metadataDir, file);
    const readableStream = fs.createReadStream(filepath);

    const result = await pinata.pinFileToIPFS(readableStream, {
      pinataMetadata: { name: file },
    });

    console.log(`${file} → ipfs://${result.IpfsHash}`);
  }
}

main().catch(console.error);