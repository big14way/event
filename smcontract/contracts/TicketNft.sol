// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { Base64 } from "@openzeppelin/contracts/utils/Base64.sol";
import "./library/Error.sol";

/**
 * @title TicketNft
 * @dev ERC721 implementation for event tickets, issued as NFTs.
 *      Each NFT represents a unique registration for an event and
 *      contains embedded metadata (event name, description, date, location).
 */
contract TicketNft is ERC721, Ownable {
    using Strings for uint256;
    
    /// @dev Counter for incremental token IDs
    uint256 private _tokenIds;

    /// @dev Address authorized to mint tickets (usually EventTicketing contract)
    address public minter;

    /// @dev Common image URI for all tickets (can be updated by owner)
    string public imageUri;

    /// @dev Ticket metadata storage per tokenId
    struct TicketMetadata {
        uint256 ticketId;
        string eventName;
        string description;
        uint256 eventTimestamp;
        string location;
    }

    /// @dev Mapping from tokenId → ticket metadata
    mapping(uint256 => TicketMetadata) private _ticketMetadata;

    /// @notice Emitted when a new minter is assigned
    event MinterChanged(address indexed oldMinter, address indexed newMinter);

    /// @notice Emitted when a ticket is minted
    event TicketMinted(address indexed to, uint256 indexed tokenId, uint256 indexed ticketId);

    /// @notice Emitted when the global image URI is updated
    event ImageUriUpdated(string newImageUri);

    /**
     * @notice Constructor
     * @param name_ ERC721 collection name
     * @param symbol_ ERC721 collection symbol
     * @param imageUri_ Default image URI for all NFTs
     */
    constructor(
        string memory name_,
        string memory symbol_,
        string memory imageUri_
    ) ERC721(name_, symbol_) Ownable(msg.sender) {
        if (bytes(imageUri_).length == 0) {
            revert TicketNftErrors.InvalidImageUri();
        }
        imageUri = imageUri_;
    }

    /// @dev Restricts function access to only the authorized minter
    modifier onlyMinter() {
        require(minter == msg.sender, "TicketNft: caller is not minter");
        _;
    }

    /**
     * @notice Assign a new minter contract
     * @dev Only callable by owner
     * @param newMinter Address of the new minter contract
     */
    function setMinter(address newMinter) external onlyOwner {
        require(newMinter != address(0), "TicketNft: zero address");
        emit MinterChanged(minter, newMinter);
        minter = newMinter;
    }

    /**
     * @notice Mint a new ticket NFT for a registrant
     * @dev Only callable by the authorized minter
     * @param to Recipient address of the NFT
     * @param ticketId Event ticket ID (from EventTicketing contract)
     * @param eventName Event name
     * @param description Event description
     * @param eventTimestamp Event date/time (Unix timestamp)
     * @param location Event location
     * @return newTokenId The minted NFT token ID
     */
    function mintForRegistrant(
        address to,
        uint256 ticketId,
        string memory eventName,
        string memory description,
        uint256 eventTimestamp,
        string memory location
    ) external onlyMinter returns (uint256 newTokenId) {
        require(to != address(0), "TicketNft: zero address");

        unchecked {
            _tokenIds++;
        }
        newTokenId = _tokenIds;

        _safeMint(to, newTokenId);

        _ticketMetadata[newTokenId] = TicketMetadata({
            ticketId: ticketId,
            eventName: eventName,
            description: description,
            eventTimestamp: eventTimestamp,
            location: location
        });

        emit TicketMinted(to, newTokenId, ticketId);
    }

    /**
     * @notice Returns the metadata for a given token
     * @param tokenId NFT token ID
     */
    function getTicketMetadata(uint256 tokenId) external view returns (TicketMetadata memory) {
        ownerOf(tokenId);
        return _ticketMetadata[tokenId];
    }

    /**
     * @notice Returns the token URI with on-chain metadata
     * @param tokenId NFT token ID
     * @return URI JSON metadata encoded in Base64
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        ownerOf(tokenId);

        TicketMetadata memory m = _ticketMetadata[tokenId];

        string memory json = string(
            abi.encodePacked(
                '{"name": "', m.eventName, " #", Strings.toString(tokenId), '",',
                '"description": "', m.description, '",',
                '"image": "', imageUri, '",',
                '"attributes": [',
                '{"trait_type": "Event ID", "value": "', Strings.toString(m.ticketId), '"},',
                '{"trait_type": "Event Date", "value": "', Strings.toString(m.eventTimestamp), '"},',
                '{"trait_type": "Location", "value": "', m.location, '"}',
                ']}'
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
    }

    /**
     * @notice Update the global image URI for all tickets
     * @dev Only callable by owner
     * @param newImageUri New image URI
     */
    function setImageUri(string memory newImageUri) external onlyOwner {
        require(bytes(newImageUri).length > 0, "TicketNft: imageUri required");
        imageUri = newImageUri;
        emit ImageUriUpdated(newImageUri);
    }
}
