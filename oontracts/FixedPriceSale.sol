// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @notice Minimal fixed-price marketplace for already-minted tickets.
/// - Seller lists tokenId with a price (in native CHZ wei).
/// - Buyer pays price; contract transfers NFT from seller to buyer (needs Approval).
/// - Funds forwarded to seller, optional platform fee to treasury.
contract FixedPriceSale is ReentrancyGuard, Ownable {
    struct Listing {
        address seller;
        uint256 price; // in wei (CHZ has 18 decimals on Chiliz)
    }

    IERC721 public immutable ticket;
    address public feeRecipient;
    uint96 public feeBps; // e.g., 250 = 2.5%

    mapping(uint256 => Listing) public listings;

    event Listed(address indexed seller, uint256 indexed tokenId, uint256 price);
    event Unlisted(address indexed seller, uint256 indexed tokenId);
    event Purchased(address indexed buyer, uint256 indexed tokenId, uint256 price, uint256 fee);

    constructor(address _ticket, address _feeRecipient, uint96 _feeBps) {
        require(_ticket != address(0), "ticket=0");
        ticket = IERC721(_ticket);
        feeRecipient = _feeRecipient;
        feeBps = _feeBps;
    }

    function setFee(address _recipient, uint96 _bps) external onlyOwner {
        feeRecipient = _recipient;
        feeBps = _bps;
    }

    /// @notice Seller (must be current owner) lists for sale.
    function list(uint256 tokenId, uint256 price) external {
        require(ticket.ownerOf(tokenId) == msg.sender, "not owner");
        require(price > 0, "price=0");
        listings[tokenId] = Listing({seller: msg.sender, price: price});
        emit Listed(msg.sender, tokenId, price);
    }

    function unlist(uint256 tokenId) external {
        Listing memory l = listings[tokenId];
        require(l.seller == msg.sender, "not seller");
        delete listings[tokenId];
        emit Unlisted(msg.sender, tokenId);
    }

    /// @notice Buyer purchases a listed tokenId by paying the exact price (CHZ, native).
    function buy(uint256 tokenId) external payable nonReentrant {
        Listing memory l = listings[tokenId];
        require(l.price > 0, "not listed");
        require(msg.value == l.price, "wrong price");

        // compute fee
        uint256 fee = (l.price * feeBps) / 10_000;
        uint256 payout = l.price - fee;

        // pull NFT from seller -> buyer (seller must have approved this contract)
        // safer to use safeTransferFrom
        ticket.safeTransferFrom(l.seller, msg.sender, tokenId);

        // clear listing
        delete listings[tokenId];

        // pay seller & fee recipient
        if (fee > 0 && feeRecipient != address(0)) {
            (bool ok1, ) = payable(feeRecipient).call{value: fee}("");
            require(ok1, "fee xfer failed");
        }
        (bool ok2, ) = payable(l.seller).call{value: payout}("");
        require(ok2, "seller xfer failed");

        emit Purchased(msg.sender, tokenId, l.price, fee);
    }
}