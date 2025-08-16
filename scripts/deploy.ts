// scripts/deploy.ts
import { ethers } from "hardhat";
import { Tusky } from "tusky";

const tusky = new Tusky({
  apiKey: process.env.TUSKY_API_KEY!,
});

async function uploadMetadata() {
  const vaultId = process.env.TUSKY_VAULT_ID!;
  
  const { file } = await tusky.files.upload({
    vaultId,
    file: {
      name: "ticket-1.json",
      content: JSON.stringify({
        name: "PSG Ticket #1",
        description: "PSG vs Opponent, Section A, Row 1, Seat 1",
        image: "ipfs://...", // replace with Tusky image URL
      }),
    },
  });

  console.log("Tusky file uploaded:", file);
  return file.url;
}

async function main() {
  // Upload metadata first
  const baseURI = await uploadMetadata();

  const PSGTicket = await ethers.getContractFactory("PSGTicketNFT");
  const psgTicket = await PSGTicket.deploy("PSG Ticket", "PSGT", baseURI);

  await psgTicket.deployed();
  console.log("PSG Ticket NFT deployed to:", psgTicket.address);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});