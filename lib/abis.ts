// lib/abis.ts
export const erc721Abi = [
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function isApprovedForAll(address owner, address operator) view returns (bool)",
    "function setApprovalForAll(address operator, bool approved)",
  ];
  
  export const fixedPriceSaleAbi = [
    "function listToken(address nft, uint256 tokenId, uint256 price) external",
    "event Listed(address indexed seller, address indexed nft, uint256 indexed tokenId, uint256 price)"
  ];