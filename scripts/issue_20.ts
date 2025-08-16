import { ethers } from "hardhat";
import "dotenv/config";

const seats = Array.from({ length: 20 }, (_, i) => `A-1-${i + 1}`);

async function main() {
  const addr = process.env.PSG_NFT_ADDRESS;
  const to = process.env.PSG_WALLET;
  if (!addr || !to) throw new Error("Missing env: PSG_NFT_ADDRESS / PSG_WALLET");

  const nft = await ethers.getContractAt("TicketNFT", addr);
  const tx = await nft.batchMintWithSeats(to, seats);
  console.log("Mint tx:", tx.hash);
  await tx.wait();

  const next = await nft.nextTokenId();
  console.log("Next token id:", next.toString()); // should be 20
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});