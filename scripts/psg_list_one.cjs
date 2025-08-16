require("dotenv").config();
const { ethers } = require("hardhat");

const SALE = process.env.NEXT_PUBLIC_FIXED_SALE_ADDRESS;
const abi = [
  "function list(uint256 tokenId, uint256 priceWei)",
];

async function main() {
  const [signer] = await ethers.getSigners(); // PSG wallet
  console.log("PSG signer:", await signer.getAddress());
  const sale = new ethers.Contract(SALE, abi, signer);

  const tokenId = 0;                 // <-- pick one of your 0..19 tokens
  const priceCHZ = "2500";           // CHZ
  const tx = await sale.list(tokenId, ethers.utils.parseEther(priceCHZ));
  console.log("list tx:", tx.hash);
  await tx.wait();
  console.log(`Listed token #${tokenId} for ${priceCHZ} CHZ`);
}
main().catch((e) => { console.error(e); process.exit(1); });