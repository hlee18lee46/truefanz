import 'dotenv/config';
import { ethers } from 'hardhat';

async function main() {
  const base = process.env.TICKET_BASE_URI;
  const owner = process.env.PSG_WALLET; // team wallet owns the collection & sets minter
  if (!base || !owner) throw new Error('Missing TICKET_BASE_URI or PSG_WALLET');

  const Factory = await ethers.getContractFactory('TicketNFT'); // your compiled ERC721URIStorage minter
  const nft = await Factory.deploy(
    'PSG Tickets',
    'PSGT',
    base,
    owner,      // initialOwner
    owner       // initialMinter (team can mint)
  );
  const tx = await nft.deployTransaction.wait();
  console.log('PSGTicketNFT:', nft.address, 'deployed in tx', tx?.transactionHash);
}

main().catch((e) => { console.error(e); process.exit(1); });