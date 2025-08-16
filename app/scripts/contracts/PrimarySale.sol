// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface ITicketNFT {
    function mintWithSeat(address to, string calldata seatLabel) external returns (uint256);
}

contract PrimarySale is Ownable {
    struct Seat {
        bool listed;
        bool sold;
        uint256 priceWei;    // price in CHZ (native), in wei
        uint256 tokenId;     // filled when sold
    }

    ITicketNFT public immutable ticket;
    address public treasury;

    mapping(string => Seat) public seats; // seatLabel => Seat
    uint256 public totalListed;
    uint256 public totalSold;

    event SeatListed(string indexed seatLabel, uint256 priceWei);
    event SeatPriceUpdated(string indexed seatLabel, uint256 priceWei);
    event Purchased(address indexed buyer, string indexed seatLabel, uint256 priceWei, uint256 tokenId);
    event TreasuryChanged(address indexed newTreasury);

    constructor(address ticketNFT, address teamTreasury, address initialOwner) Ownable(initialOwner) {
        require(ticketNFT != address(0) && teamTreasury != address(0), "zero addr");
        ticket = ITicketNFT(ticketNFT);
        treasury = teamTreasury;
        emit TreasuryChanged(teamTreasury);
    }

    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "zero addr");
        treasury = newTreasury;
        emit TreasuryChanged(newTreasury);
    }

    // --- Inventory management ---

    function batchListSeats(string[] calldata seatLabels, uint256 priceWei) external onlyOwner {
        require(priceWei > 0, "price=0");
        for (uint256 i = 0; i < seatLabels.length; i++) {
            string calldata s = seatLabels[i];
            Seat storage seat = seats[s];
            require(!seat.listed, "already listed");
            seats[s] = Seat({listed: true, sold: false, priceWei: priceWei, tokenId: 0});
            emit SeatListed(s, priceWei);
            unchecked { totalListed++; }
        }
    }

    function setSeatPrice(string calldata seatLabel, uint256 priceWei) external onlyOwner {
        require(priceWei > 0, "price=0");
        Seat storage seat = seats[seatLabel];
        require(seat.listed && !seat.sold, "not listable");
        seat.priceWei = priceWei;
        emit SeatPriceUpdated(seatLabel, priceWei);
    }

    // --- Purchase ---

    receive() external payable {} // in case someone sends CHZ directly

    function buy(string calldata seatLabel) external payable returns (uint256 tokenId) {
        Seat storage seat = seats[seatLabel];
        require(seat.listed, "not listed");
        require(!seat.sold, "sold");
        require(msg.value == seat.priceWei, "bad msg.value");

        tokenId = ticket.mintWithSeat(msg.sender, seatLabel);
        seat.sold = true;
        seat.tokenId = tokenId;
        unchecked { totalSold++; }

        (bool ok, ) = payable(treasury).call{value: msg.value}("");
        require(ok, "treasury xfer failed");

        emit Purchased(msg.sender, seatLabel, seat.priceWei, tokenId);
    }
}