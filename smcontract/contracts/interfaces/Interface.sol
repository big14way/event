// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface ITicketNft {
    function mintForRegistrant(
        address to,
        uint256 ticketId,
        string memory eventName,
        string memory description,
        uint256 eventTimestamp,
        string memory location
    ) external returns (uint256);

    function ticketOfToken(uint256 tokenId) external view returns (uint256);
} 

/**
 * @title IEventTicketing
 * @dev Minimal interface for querying event status.
 */
interface IEventTicketing {
    function getStatus(uint256 ticketId) external view returns (uint8);
}
