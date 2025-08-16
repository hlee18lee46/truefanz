import { ethers } from "hardhat";
import "dotenv/config";

async function main() {
  const baseCid = process.env.PINATA_FOLDER_CID; // e.g. Qm... for the 20 JSONs folder
  const owner = process.env.PSG_WALLET;
  const minter = process.env.PSG_WALLET;

  if (!baseCid || !owner || !minter) throw new Error("Missing env: PINATA_FOLDER_CID / PSG_WALLET");
  const baseURI = `ipfs://${baseCid}/`;

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const Factory = await ethers.getContractFactory("TicketNFT");
  const nft = await Factory.deploy("PSG vs ETH NYC 2025-01", "PSGNY25", baseURI, owner, minter);
  await nft.deployed();

  console.log("TicketNFT deployed:", nft.address);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});