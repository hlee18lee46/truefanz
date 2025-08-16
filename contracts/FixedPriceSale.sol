// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract FixedPriceSale is ReentrancyGuard, Ownable {
    IERC721 public immutable nft;

    // tokenId => price in wei (native CHZ on Chiliz)
    mapping(uint256 => uint256) public priceOf;

    event Listed(uint256 indexed tokenId, uint256 price);
    event Unlisted(uint256 indexed tokenId);
    event Purchased(uint256 indexed tokenId, address indexed buyer, uint256 price);

    constructor(address _nft, address initialOwner) Ownable(initialOwner) {
        require(_nft != address(0), "nft=0");
        nft = IERC721(_nft);
    }

    /// @notice List a token you (the contract owner) currently own.
    /// Must approve this contract (per‐token or isApprovedForAll) before listing.
    function list(uint256 tokenId, uint256 priceWei) external onlyOwner {
        require(nft.ownerOf(tokenId) == owner(), "not owner of token");
        require(
            nft.getApproved(tokenId) == address(this) ||
            nft.isApprovedForAll(owner(), address(this)),
            "sale not approved"
        );
        require(priceWei > 0, "price=0");
        priceOf[tokenId] = priceWei;
        emit Listed(tokenId, priceWei);
    }

    function unlist(uint256 tokenId) external onlyOwner {
        require(priceOf[tokenId] > 0, "not listed");
        delete priceOf[tokenId];
        emit Unlisted(tokenId);
    }

    /// @notice Buy a listed token by paying native CHZ equal to the listing price.
    function buy(uint256 tokenId) external payable nonReentrant {
        uint256 p = priceOf[tokenId];
        require(p > 0, "not listed");
        require(msg.value == p, "bad price");
        // transfer funds to seller (contract owner)
        (bool ok, ) = payable(owner()).call{value: msg.value}("");
        require(ok, "pay failed");
        // transfer NFT to buyer
        nft.safeTransferFrom(owner(), msg.sender, tokenId);
        // clear listing
        delete priceOf[tokenId];
        emit Purchased(tokenId, msg.sender, p);
    }

    /// @notice Emergency: if someone sends CHZ by mistake
    function sweep() external onlyOwner {
        (bool ok, ) = payable(owner()).call{value: address(this).balance}("");
        require(ok, "sweep failed");
    }
}