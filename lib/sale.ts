// lib/sale.ts
import { ethers } from "ethers";

export const PSG_NFT_ADDRESS = process.env.NEXT_PUBLIC_PSG_NFT_ADDRESS!;
export const FIXED_SALE_ADDRESS = process.env.NEXT_PUBLIC_FIXED_SALE_ADDRESS!;

export const psgAbi = [
  "function setApprovalForAll(address operator,bool approved)",
  "function isApprovedForAll(address owner,address operator) view returns (bool)",
  "function ownerOf(uint256 tokenId) view returns (address)",
];

export const saleAbi = [
  "function listings(uint256) view returns (address seller, uint256 price)",
  "function list(uint256 tokenId, uint256 price)",
];

export function toWei(amountChz: string) {
  return ethers.utils.parseEther(amountChz);
}