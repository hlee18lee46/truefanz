require("dotenv").config();
const { ethers } = require("hardhat");

const NFT = process.env.NEXT_PUBLIC_PSG_NFT_ADDRESS;
const SALE = process.env.NEXT_PUBLIC_FIXED_SALE_ADDRESS;

const abi = ["function setApprovalForAll(address operator,bool approved)"];
async function main() {
  const [signer] = await ethers.getSigners(); // must be PSG wallet
  console.log("PSG signer:", await signer.getAddress());

  const nft = new ethers.Contract(NFT, abi, signer);
  const tx = await nft.setApprovalForAll(SALE, true);
  console.log("tx:", tx.hash);
  await tx.wait();
  console.log("Approved:", SALE);
}
main().catch((e) => { console.error(e); process.exit(1); });