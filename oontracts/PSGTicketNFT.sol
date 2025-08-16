// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract PSGTicketNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;
    address public minter;
    string private _baseTokenURI;

    event MinterUpdated(address indexed newMinter);
    event BaseURISet(string newBaseURI);
    event Minted(address indexed to, uint256 indexed tokenId, string seatLabel);

    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        address initialOwner,
        address initialMinter
    ) ERC721(name_, symbol_) Ownable(initialOwner) {
        _baseTokenURI = baseURI_;
        minter = initialMinter;
        emit BaseURISet(baseURI_);
        emit MinterUpdated(initialMinter);
    }

    modifier onlyMinter() {
        require(msg.sender == minter, "not minter");
        _;
    }

    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
        emit BaseURISet(newBaseURI);
    }

    function setMinter(address newMinter) external onlyOwner {
        minter = newMinter;
        emit MinterUpdated(newMinter);
    }

    function baseTokenURI() external view returns (string memory) {
        return _baseTokenURI;
    }

    function mintWithSeat(address to, string calldata seatLabel) public onlyMinter returns (uint256 tokenId) {
        tokenId = nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, string(abi.encodePacked(_baseTokenURI, seatLabel, ".json")));
        emit Minted(to, tokenId, seatLabel);
    }

    function batchMintWithSeats(address to, string[] calldata seatLabels) external onlyMinter {
        for (uint256 i = 0; i < seatLabels.length; i++) {
            mintWithSeat(to, seatLabels[i]);
        }
    }

    function totalMinted() external view returns (uint256) {
        return nextTokenId;
    }
}