// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title PrimarySale
 * @notice Fixed-price primary sale for an ERC721 collection (e.g., PSG tickets).
 *         Seller (PSG) lists tokenIds with a price; buyer pays native token (CHZ on Chiliz),
 *         contract forwards funds to treasury minus feeBps.
 */
contract PrimarySale is Ownable, Pausable {
    IERC721 public immutable nft;
    address public treasury;
    uint16 public feeBps; // e.g., 250 = 2.5%

    mapping(uint256 => uint256) public priceOf; // tokenId => price (in wei)

    event Listed(uint256 indexed tokenId, uint256 price);
    event Unlisted(uint256 indexed tokenId);
    event Purchased(address indexed buyer, uint256 indexed tokenId, uint256 price, uint256 fee, uint256 payout);
    event TreasuryUpdated(address indexed newTreasury);
    event FeeBpsUpdated(uint16 newFeeBps);

    error NotOwnerOfToken();
    error NotApprovedForAll();
    error InvalidPrice();
    error WrongPayment(uint256 expected, uint256 sent);

    constructor(address _nft, address _treasury, uint16 _feeBps) Ownable(msg.sender) {
        require(_nft != address(0) && _treasury != address(0), "zero addr");
        nft = IERC721(_nft);
        treasury = _treasury;
        feeBps = _feeBps;
    }

    // --- Admin (PSG) ---

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "zero addr");
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }

    function setFeeBps(uint16 _feeBps) external onlyOwner {
        require(_feeBps <= 1000, "fee too high");
        feeBps = _feeBps;
        emit FeeBpsUpdated(_feeBps);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    /// @notice List a token for fixed price sale.
    function list(uint256 tokenId, uint256 price) external whenNotPaused onlyOwner {
        // Owner = team; token must be owned by team wallet
        if (nft.ownerOf(tokenId) != owner()) revert NotOwnerOfToken();
        if (!nft.isApprovedForAll(owner(), address(this))) revert NotApprovedForAll();
        if (price == 0) revert InvalidPrice();

        priceOf[tokenId] = price;
        emit Listed(tokenId, price);
    }

    /// @notice Unlist a token.
    function unlist(uint256 tokenId) external onlyOwner {
        delete priceOf[tokenId];
        emit Unlisted(tokenId);
    }

    // --- Buyer ---

    function buy(uint256 tokenId) external payable whenNotPaused {
        uint256 p = priceOf[tokenId];
        if (p == 0) revert InvalidPrice();
        if (msg.value != p) revert WrongPayment(p, msg.value);

        // compute fee & payout
        uint256 fee = (p * feeBps) / 10_000;
        uint256 payout = p - fee;

        // clear listing first (reentrancy-safe flow)
        delete priceOf[tokenId];

        // transfer NFT from owner (team) to buyer
        nft.safeTransferFrom(owner(), msg.sender, tokenId);

        // forward funds
        (bool ok1, ) = payable(treasury).call{value: payout}("");
        require(ok1, "payout fail");
        if (fee > 0) {
            (bool ok2, ) = payable(owner()).call{value: fee}("");
            require(ok2, "fee fail");
        }

        emit Purchased(msg.sender, tokenId, p, fee, payout);
    }

    receive() external payable {}
}