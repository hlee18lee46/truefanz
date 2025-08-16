import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

const PSG_NFT_ADDRESS = process.env.PSG_NFT_ADDRESS!;
const PSG_WALLET = process.env.PSG_WALLET!; // team treasury/owner wallet

async function main() {
  if (!PSG_NFT_ADDRESS || !PSG_WALLET) {
    throw new Error("Missing PSG_NFT_ADDRESS or PSG_WALLET in .env");
  }

  const mapPath = path.join(process.cwd(), "walrus-uris.json");
  const map = JSON.parse(fs.readFileSync(mapPath, "utf8")) as Record<string, string>;

  const [signer] = await ethers.getSigners(); // this must be the contract's `minter`
  console.log("Minter:", signer.address);

  const nft = await ethers.getContractAt("TicketNFT", PSG_NFT_ADDRESS);

  // Gas-safe batch in chunks (e.g., 100 at a time)
  const seatLabels = Object.keys(map).sort(); // deterministic order
  const chunkSize = 100;

  for (let i = 0; i < seatLabels.length; i += chunkSize) {
    const chunk = seatLabels.slice(i, i + chunkSize);
    console.log(`Minting ${chunk.length} tickets [${i}..${i+chunk.length-1}]`);

    for (const seat of chunk) {
      const uri = map[seat];
      const tx = await nft.mintWithURI(PSG_WALLET, seat, uri);
      await tx.wait();
    }
  }

  console.log("Done minting");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});