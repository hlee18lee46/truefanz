require('dotenv/config');
const { ethers } = require('hardhat');

async function main() {
  const base = process.env.TICKET_BASE_URI;
  const owner = process.env.PSG_WALLET;
  if (!base || !owner) throw new Error('Missing TICKET_BASE_URI or PSG_WALLET');

  // 👇 use the actual contract name from your .sol file / artifacts
  const Factory = await ethers.getContractFactory('PSGTicketNFT');
  const nft = await Factory.deploy('PSG Tickets', 'PSGT', base, owner, owner);
  const rc = await nft.deployTransaction.wait();

  console.log('PSGTicketNFT deployed at:', nft.address);
  console.log('tx:', rc && rc.transactionHash);
}

main().catch((e) => { console.error(e); process.exit(1); });