require('dotenv/config');
const { ethers } = require('hardhat');

const SEATS = [
  "A-1-1","A-1-2","A-1-3","A-1-4","A-1-5",
  "A-2-1","A-2-2","A-2-3","A-2-4","A-2-5",
  "A-3-1","A-3-2","A-3-3","A-3-4","A-3-5",
  "A-4-1","A-4-2","A-4-3","A-4-4","A-4-5",
];

async function main() {
  const addr = process.env.PSG_NFT_ADDRESS;
  const to = process.env.PSG_WALLET;
  if (!addr || !to) throw new Error('Missing PSG_NFT_ADDRESS or PSG_WALLET');

  // If your contract needs minter perms, the deployer should be owner
  const nft = await ethers.getContractAt('PSGTicketNFT', addr);
  const [signer] = await ethers.getSigners();

  // Optional: ensure signer is minter if your contract uses onlyMinter
  if (nft.setMinter) {
    const tx = await nft.setMinter(signer.address);
    await tx.wait();
    console.log('Minter set to:', signer.address);
  }

  for (const seat of SEATS) {
    const tx = await nft.mintWithSeat(to, seat);
    const rc = await tx.wait();
    const ev = rc.logs.find(() => true); // optional parsing
    console.log(`Minted seat ${seat} -> tx ${rc.transactionHash}`);
  }

  // Quick sanity checks
  if (nft.nextTokenId) {
    const total = await nft.nextTokenId();
    console.log('nextTokenId:', total.toString()); // equals total minted so far
  }
  const sampleId = 0; // first token if fresh collection
  try {
    const uri = await nft.tokenURI(sampleId);
    const owner = await nft.ownerOf(sampleId);
    console.log('sample tokenURI:', uri);
    console.log('ownerOf(0):', owner);
  } catch (e) {
    console.log('Sample checks skipped (maybe non-zero start):', e.message);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });