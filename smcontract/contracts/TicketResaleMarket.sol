// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { IEventTicketing, ITicketNft } from "./interfaces/Interface.sol";
import "./library/Error.sol";

/**
 * @title TicketResaleMarket
 * @notice Secondary marketplace for ticket NFTs.
 * @dev Allows owners of ticket NFTs to list and sell to others with a royalty/fee.
 *      Function names and events are preserved from the original contract.
 */
contract TicketResaleMarket is ReentrancyGuard {
    using ResaleMarketErrors for *;
    
    // ---- Types ----

    /// @notice Mirrors the upstream EventTicketing status enum layout.
    enum Status { Upcoming, Passed, Canceled, Closed }

    struct Listing {
        uint256 ticketId;   // event id associated with this NFT
        uint256 tokenId;    // the NFT token id listed
        address seller;     // current owner at the time of listing
        uint256 price;      // listing price in wei
        bool active;        // listing status
    }

    // ---- Storage ----

    /// @notice Admin/owner of the marketplace
    address public owner;

    /// @notice Reference to the EventTicketing contract
    IEventTicketing public eventTicketing;

    /// @notice Reference to the Ticket NFT contract
    IERC721 public ticketNft;

    /// @notice Royalty/fee in basis points (1e4 = 100%)
    uint16 public royaltyBps;

    /// @notice Recipient of royalties/fees
    address payable public feeRecipient;

    /// @notice Maximum allowed listing price
    uint256 public maxPrice = 1000 ether;

    /// @notice tokenId => listing
    mapping(uint256 => Listing) public listings;

    // ---- Events (preserved names/signatures) ----

    event TicketListed(
        uint256 indexed tokenId,
        uint256 indexed ticketId,
        address indexed seller,
        uint256 price
    );

    event TicketSold(
        uint256 indexed tokenId,
        uint256 indexed ticketId,
        address indexed seller,
        address buyer,
        uint256 price,
        uint256 royaltyAmount
    );

    event RoyaltyUpdated(uint16 newRoyaltyBps);
    event FeeRecipientUpdated(address indexed newRecipient);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event MaxPriceUpdated(uint256 newMaxPrice);

    // ---- Modifiers ----

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert ResaleMarketErrors.NotOwner();
        }
        _;
    }

    // ---- Constructor ----

    /**
     * @param eventTicketingAddress Address of EventTicketing contract
     * @param ticketNftAddress Address of Ticket NFT (ERC721) contract
     * @param feeRecipient_ Recipient of royalties
     * @param royaltyBps_ Royalty in basis points (<= 10_000)
     */
    constructor(
        address eventTicketingAddress,
        address ticketNftAddress,
        address payable feeRecipient_,
        uint16 royaltyBps_
    ) ReentrancyGuard() {
        if (eventTicketingAddress == address(0) || 
            ticketNftAddress == address(0) || 
            feeRecipient_ == address(0)) {
            revert ResaleMarketErrors.ZeroAddress();
        }
        if (royaltyBps_ > 10_000) {
            revert ResaleMarketErrors.InvalidRoyalty();
        }

        owner = msg.sender;
        eventTicketing = IEventTicketing(eventTicketingAddress);
        ticketNft = IERC721(ticketNftAddress);
        feeRecipient = feeRecipient_;
        royaltyBps = royaltyBps_;
    }

    // ---- Admin Functions (names preserved) ----

    /**
     * @notice Update royalty bps
     * @param newRoyaltyBps New royalty in bps (<= 10_000)
     */
    function setRoyalty(uint16 newRoyaltyBps) external onlyOwner {
        require(newRoyaltyBps <= 10_000, "Resale: royalty too high");
        royaltyBps = newRoyaltyBps;
        emit RoyaltyUpdated(newRoyaltyBps);
    }

    /**
     * @notice Update fee recipient
     * @param newRecipient New recipient address
     */
    function setFeeRecipient(address payable newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Resale: zero addr");
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(newRecipient);
    }

    /**
     * @notice Update the max listing price
     * @param newMaxPrice New max price (wei)
     */
    function setMaxPrice(uint256 newMaxPrice) external onlyOwner {
        require(newMaxPrice > 0, "Resale: max price must be > 0");
        maxPrice = newMaxPrice;
        emit MaxPriceUpdated(newMaxPrice);
    }

    /**
     * @notice Transfer marketplace ownership
     * @param newOwner New owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Resale: zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    // ---- Resale Lifecycle (names preserved) ----

    /**
     * @notice List a ticket for resale (requires prior approval/approvalForAll).
     * @param tokenId Token id to list
     * @param price Listing price in wei (must be > 0 and <= maxPrice)
     */
    function listTicket(uint256 tokenId, uint256 price) external {
        require(price > 0 && price <= maxPrice, "Resale: invalid price");
        require(ticketNft.ownerOf(tokenId) == msg.sender, "Resale: not owner");
        require(
            ticketNft.isApprovedForAll(msg.sender, address(this)) ||
            ticketNft.getApproved(tokenId) == address(this),
            "Resale: not approved"
        );
        require(!listings[tokenId].active, "Resale: already listed");

        // Fetch event/ticket id from NFT contract
        uint256 ticketId = ITicketNft(address(ticketNft)).ticketOfToken(tokenId);

        // Only allow listing for Upcoming events
        require(eventTicketing.getStatus(ticketId) == uint8(Status.Upcoming), "Resale: event not upcoming");

        listings[tokenId] = Listing({
            ticketId: ticketId,
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            active: true
        });

        emit TicketListed(tokenId, ticketId, msg.sender, price);
    }

    /**
     * @notice Buy a listed ticket.
     * @param tokenId Token id to buy
     */
    function buyTicket(uint256 tokenId) external payable nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.active, "Resale: not listed");
        require(msg.value >= listing.price, "Resale: insufficient payment");
        require(msg.sender != listing.seller, "Resale: self purchase");

        // Re-validate event state at purchase time (listing could be stale)
        require(eventTicketing.getStatus(listing.ticketId) == uint8(Status.Upcoming), "Resale: event not upcoming");

        // Ensure seller still owns the token and approval still holds (listing may be stale)
        require(ticketNft.ownerOf(tokenId) == listing.seller, "Resale: seller no longer owner");
        require(
            ticketNft.isApprovedForAll(listing.seller, address(this)) ||
            ticketNft.getApproved(tokenId) == address(this),
            "Resale: approval missing"
        );

        // Effects
        listing.active = false;

        uint256 price = listing.price;
        uint256 royaltyAmount = (price * royaltyBps) / 10_000;
        uint256 sellerAmount = price - royaltyAmount;

        // Interactions
        // 1) Transfer NFT to buyer
        ticketNft.safeTransferFrom(listing.seller, msg.sender, tokenId);

        // 2) Pay royalty (if any)
        if (royaltyAmount > 0) {
            (bool royaltyOk, ) = feeRecipient.call{value: royaltyAmount}("");
            require(royaltyOk, "Resale: royalty transfer failed");
        }

        // 3) Pay seller
        if (sellerAmount > 0) {
            (bool sellerOk, ) = payable(listing.seller).call{value: sellerAmount}("");
            require(sellerOk, "Resale: seller transfer failed");
        }

        // 4) Refund any excess to buyer
        if (msg.value > price) {
            (bool refundOk, ) = payable(msg.sender).call{value: msg.value - price}("");
            require(refundOk, "Resale: refund failed");
        }

        emit TicketSold(
            listing.tokenId,
            listing.ticketId,
            listing.seller,
            msg.sender,
            price,
            royaltyAmount
        );
    }

    /**
     * @notice Cancel an active listing.
     * @param tokenId Token id to unlist
     *
     * @dev Preserves the original behavior of signaling cancellation by emitting
     *      TicketListed with price=0 (as in your initial contract).
     */
    function cancelListing(uint256 tokenId) external {
        Listing storage listing = listings[tokenId];
        require(listing.active, "Resale: not listed");
        require(listing.seller == msg.sender, "Resale: not seller");

        listing.active = false;
        emit TicketListed(tokenId, listing.ticketId, msg.sender, 0); // price=0 => cancellation signal
    }

    // ---- Views (names preserved) ----

    /**
     * @notice Get a listing by tokenId.
     * @param tokenId Token id
     * @return ticketId_ The event ticket id
     * @return tokenId_2 The token id (echo)
     * @return seller The seller address
     * @return price The listing price
     * @return active Whether the listing is active
     */
    function getListing(uint256 tokenId)
        external
        view
        returns (uint256 ticketId_, uint256 tokenId_2, address seller, uint256 price, bool active)
    {
        Listing memory l = listings[tokenId];
        return (l.ticketId, l.tokenId, l.seller, l.price, l.active);
    }

    // ---- Safety ----

    receive() external payable {
        revert("Resale: send via buyTicket()");
    }

    fallback() external payable {
        revert("Resale: invalid call");
    }
}
