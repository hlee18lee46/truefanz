// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TicketExchangeCHZ
 * @notice Minimal, safe marketplace for ERC721 "ticket" NFTs priced in native CHZ on Chiliz Chain.
 * - Sellers escrow the NFT in the contract on listing.
 * - Buyers pay in native CHZ (msg.value == price).
 * - Marketplace takes a fee (bps) and forwards the rest to the seller.
 */
contract TicketExchangeCHZ is IERC721Receiver, Ownable, Pausable, ReentrancyGuard {
    struct Listing {
        address seller;
        address nft;
        uint256 tokenId;
        uint256 price; // in wei (CHZ)
        bool active;
    }

    uint256 public nextListingId;
    mapping(uint256 => Listing) public listings;

    // fee in basis points (e.g. 250 = 2.5%)
    uint96 public feeBps;
    address public feeRecipient;

    event Listed(uint256 indexed listingId, address indexed seller, address indexed nft, uint256 tokenId, uint256 price);
    event Cancelled(uint256 indexed listingId);
    event Purchased(uint256 indexed listingId, address indexed buyer, uint256 price, uint256 fee, uint256 sellerProceeds);
    event FeeUpdated(uint96 feeBps, address feeRecipient);
    event Paused(address indexed by);
    event Unpaused(address indexed by);

    error InvalidPrice();
    error NotOwnerOrApproved();
    error NotSeller();
    error NotActive();
    error InvalidRecipient();
    error ValueMismatch();

    constructor(uint96 _feeBps, address _feeRecipient) Ownable(msg.sender) {
        require(_feeBps <= 1000, "fee too high"); // max 10%
        if (_feeRecipient == address(0)) revert InvalidRecipient();
        feeBps = _feeBps;
        feeRecipient = _feeRecipient;
        emit FeeUpdated(_feeBps, _feeRecipient);
    }

    // --------- Admin ---------
    function setFee(uint96 _feeBps, address _feeRecipient) external onlyOwner {
        require(_feeBps <= 1000, "fee too high");
        if (_feeRecipient == address(0)) revert InvalidRecipient();
        feeBps = _feeBps;
        feeRecipient = _feeRecipient;
        emit FeeUpdated(_feeBps, _feeRecipient);
    }

    function pause() external onlyOwner { _pause(); emit Paused(msg.sender); }
    function unpause() external onlyOwner { _unpause(); emit Unpaused(msg.sender); }

    // --------- Seller flow ---------
    /**
     * @dev Seller must own the NFT and approve this contract. NFT is moved into escrow.
     */
    function list(address nft, uint256 tokenId, uint256 price) external whenNotPaused nonReentrant returns (uint256 id) {
        if (price == 0) revert InvalidPrice();
        IERC721 erc721 = IERC721(nft);

        // check ownership and approval
        address owner = erc721.ownerOf(tokenId);
        if (owner != msg.sender) revert NotOwnerOrApproved();
        if (
            erc721.getApproved(tokenId) != address(this) &&
            !erc721.isApprovedForAll(msg.sender, address(this))
        ) {
            revert NotOwnerOrApproved();
        }

        // pull into escrow
        erc721.safeTransferFrom(msg.sender, address(this), tokenId);

        id = nextListingId++;
        listings[id] = Listing({
            seller: msg.sender,
            nft: nft,
            tokenId: tokenId,
            price: price,
            active: true
        });

        emit Listed(id, msg.sender, nft, tokenId, price);
    }

    function cancel(uint256 listingId) external nonReentrant {
        Listing storage lst = listings[listingId];
        if (!lst.active) revert NotActive();
        if (lst.seller != msg.sender) revert NotSeller();

        lst.active = false;
        IERC721(lst.nft).safeTransferFrom(address(this), lst.seller, lst.tokenId);
        emit Cancelled(listingId);
    }

    // --------- Buyer flow ---------
    function buy(uint256 listingId) external payable whenNotPaused nonReentrant {
        Listing storage lst = listings[listingId];
        if (!lst.active) revert NotActive();
        if (msg.value != lst.price) revert ValueMismatch();

        // effects
        lst.active = false;

        // interactions: fee then seller
        uint256 fee = (msg.value * feeBps) / 10_000;
        uint256 toSeller = msg.value - fee;

        // transfer NFT to buyer first to avoid locking in case of payout issues
        IERC721(lst.nft).safeTransferFrom(address(this), msg.sender, lst.tokenId);

        // pay fee
        (bool fs, ) = feeRecipient.call{value: fee}("");
        require(fs, "fee transfer failed");

        // pay seller
        (bool ss, ) = lst.seller.call{value: toSeller}("");
        require(ss, "seller transfer failed");

        emit Purchased(listingId, msg.sender, msg.value, fee, toSeller);
    }

    // --------- Views ---------
    function getListing(uint256 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }

    // --------- ERC721 Receiver ---------
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    // --------- Fallbacks blocked ---------
    receive() external payable {
        // only purchases should send funds; block accidental sends
        revert("direct CHZ not accepted");
    }
    fallback() external payable {
        revert("direct CHZ not accepted");
    }
}
