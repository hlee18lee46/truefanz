TrueFanz Pro — Chiliz Spicy Testnet (88882)

End-to-end setup for minting PSG tickets (ERC-721), listing them at fixed price from the team wallet, and enabling fans to buy on Chiliz Spicy testnet.

Contents
	•	Contracts
	•	Hardhat setup
	•	Environment variables
	•	Deploy scripts
	•	Typical flow (mint → list → buy → unlist)
	•	Frontend env hookup
	•	Troubleshooting

⸻

Contracts

1) PSGTicketNFT.sol (ERC-721)
	•	Standard ERC-721 with tokenURI(uint256) returning IPFS metadata.
	•	Team wallet mints 20 tickets (IDs 0..19) and sets base URI to IPFS.
	•	Used by frontend to fetch:
	•	name / image
	•	attributes (e.g., Section, Row, Seat, Venue, Location, Date, Time, EventDate)

Key functions
	•	mintTo(address to, uint256 tokenId) (or your project’s mint function)
	•	tokenURI(uint256 tokenId) view returns (string)
	•	ownerOf(uint256 tokenId) view returns (address)

Your UI reads metadata via ipfsToHttp() and displays full event details (not just “PSG Ticket #N”).

⸻

2) PrimarySale.sol (Fixed-Price listing)

Primary marketplace for team wallet only. Buyers pay in CHZ.

Minimal surface
	•	list(uint256 tokenId, uint256 priceWei) — onlyOwner (team) can list
	•	buy(uint256 tokenId) — any wallet can purchase with msg.value == price
	•	unlist(uint256 tokenId) — onlyOwner can unlist
	•	priceOf(uint256 tokenId) view returns (uint256)
	•	nft() view returns (address) — the ERC-721 address
	•	feeBps(), setFeeBps(uint16) — optional platform fee (basis points)
	•	treasury(), setTreasury(address) — fee destination
	•	pause()/unpause() — optional circuit breaker

Notes
	•	Contract holds no custody of NFTs if you use setApprovalForAll; on buy, it transfers from team wallet → buyer.
	•	Reverts with OwnableUnauthorizedAccount if non-team tries to call list.



Environment Variables
Private keys or secrets got redacted. 

Create .env (root):


PRIVY_APP_ID=
NEXT_PUBLIC_PRIVY_APP_ID=
PRIVATE_KEY=

EXCHANGE_FEE_BPS=5
EXCHANGE_FEE_RECIPIENT=0xyour_treasury_or_team_wallet

CHILIZ_RPC=https://spicy-rpc.chiliz.com
PSG_TREASURY=
PSG_WALLET=
USER_WALLET=

PINATA_API_KEY=
PINATA_API_SECRET=
PINATA_JWT=
TEAM_OWNER=
TEAM_TREASURY=

TICKET_BASE_URI=

PSG_NFT_ADDRESS=

NEXT_PUBLIC_PSG_NFT_ADDRESS=
NEXT_PUBLIC_PSG_WALLET=
NEXT_PUBLIC_PSG_SUPPLY=20 
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
NEXT_PUBLIC_CHILIZ_RPC=https://spicy-rpc.chiliz.com
NEXT_PUBLIC_CHILIZ_CHAIN_ID=88882

NEXT_PUBLIC_FIXED_SALE_ADDRESS=
NEXT_PUBLIC_TEAM_WALLETS=


Deploy Scripts

Put these under scripts/. We used CommonJS (.cjs) to avoid ES module friction.

scripts/deploy_nft.cjs
scripts/deploy_primary_sale.cjs

Deploy commands

npx hardhat compile
npx hardhat run scripts/deploy_nft.cjs --network chilizSpicy
# copy address → .env NEXT_PUBLIC_PSG_NFT_ADDRESS

npx hardhat run scripts/deploy_primary_sale.cjs --network chilizSpicy
# copy address → .env NEXT_PUBLIC_FIXED_SALE_ADDRESS


