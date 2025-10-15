// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./library/EventTicketingLib.sol";
import { ITicketNft } from "./interfaces/Interface.sol";
import "./library/Error.sol";

/**
 * @title EventTicketing
 * @notice Create and manage ticketed events; users register by paying the price and receive an ERC721 ticket.
 * @dev Uses a dedicated Ticket NFT contract for minting and a library for accounting helpers.
 */
contract EventTicketing is Ownable, ReentrancyGuard {
    using EventTicketingLib for *;

    // -------- Types --------

    /// @notice Lifecycle status for an event/ticket
    enum Status { Upcoming, Passed, Canceled, Closed }

    // -------- Storage --------

    ITicketNft public ticketNft;

    /// @notice ticketId => Ticket data
    mapping(uint256 => EventTicketingLib.Ticket) public tickets;

    /// @notice ticketId => list of registrants
    mapping(uint256 => address[]) private registrants;

    /// @notice ticketId => (registrant => registered?)
    mapping(uint256 => mapping(address => bool)) public isRegistered;

    /// @notice ticketId => (registrant => amount paid)
    mapping(uint256 => mapping(address => uint256)) public paidAmount;

    /// @notice Incremental ticket id counter
    uint256 private _ticketIds;

    /// @notice Platform fee in basis points (1e4 = 100%)
    uint16 public platformFeeBps;

    /// @notice Platform fee recipient
    address payable public feeRecipient;

    /// @dev Refund batching cursor to prevent OOG on cancellation
    /// @dev ticketId => next index in registrants[ticketId] to refund
    mapping(uint256 => uint256) private _refundCursor;

    /// @dev Max refunds processed per cancelTicket() call to avoid gas griefing
    uint256 private constant _REFUND_BATCH_SIZE = 150;

    // -------- Events (names preserved) --------

    event TicketCreated(
        uint256 indexed ticketId,
        address indexed creator,
        uint256 price,
        string eventName,
        string description,
        uint256 eventTimestamp,
        uint256 maxSupply
    );

    event Registered(uint256 indexed ticketId, address indexed registrant, uint256 nftTokenId);
    event TicketUpdated(uint256 indexed ticketId, uint256 newPrice, uint256 newTimestamp, string newLocation);
    event TicketClosed(uint256 indexed ticketId, address indexed closedBy);
    event TicketCanceled(uint256 indexed ticketId, address indexed canceledBy);
    event RefundClaimed(uint256 indexed ticketId, address indexed user, uint256 amount);
    event ProceedsWithdrawn(uint256 indexed ticketId, address indexed creator, uint256 creatorAmount, uint256 feeAmount);
    event MaxSupplyUpdated(uint256 indexed ticketId, uint256 newMaxSupply);
    event ServiceFeeUpdated(uint16 newFeeBps);
    event FeeRecipientUpdated(address indexed newRecipient);

    // -------- Constructor --------

    /**
     * @param ticketNftAddress Address of the Ticket NFT contract
     * @param feeRecipient_ Platform fee recipient
     * @param feeBps Platform fee in basis points (<= 10_000)
     */
    constructor(address ticketNftAddress, address payable feeRecipient_, uint16 feeBps) Ownable(msg.sender) {
        if (ticketNftAddress == address(0)) {
            revert EventTicketingErrors.ZeroAddress();
        }
        if (feeRecipient_ == address(0)) {
            revert EventTicketingErrors.ZeroAddress();
        }
        if (feeBps > 10_000) {
            revert EventTicketingErrors.InvalidFee(feeBps);
        }
        
        ticketNft = ITicketNft(ticketNftAddress);
        feeRecipient = feeRecipient_;
        platformFeeBps = feeBps;
    }

    // -------- Admin --------

    /**
     * @notice Update the ticket NFT contract address
     * @param ticketNftAddress New NFT contract address
     */
    function setTicketNft(address ticketNftAddress) external onlyOwner {
        if (ticketNftAddress == address(0)) {
            revert EventTicketingErrors.ZeroAddress();
        }
        ticketNft = ITicketNft(ticketNftAddress);
    }

    /**
     * @notice Update platform fee
     * @param feeBps New fee in basis points (<= 10_000)
     */
    function setServiceFee(uint16 feeBps) external onlyOwner {
        if (feeBps > 10_000) {
            revert EventTicketingErrors.InvalidFee(feeBps);
        }
        platformFeeBps = feeBps;
        emit ServiceFeeUpdated(feeBps);
    }

    /**
     * @notice Update platform fee recipient
     * @param newRecipient Address of new recipient
     */
    function setFeeRecipient(address payable newRecipient) external onlyOwner {
        if (newRecipient == address(0)) {
            revert EventTicketingErrors.ZeroAddress();
        }
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(newRecipient);
    }

    // -------- Ticket Lifecycle --------

    /**
     * @notice Create a new event
     * @param price Price in wei (native token)
     * @param eventName Name of the event
     * @param description Event description
     * @param eventTimestamp Unix timestamp in the future
     * @param maxSupply Maximum number of seats
     * @param metadata Arbitrary metadata string (e.g., IPFS CID)
     * @param location Event location
     * @return newId The newly created ticket/event id
     */
    function createTicket(
        uint256 price,
        string calldata eventName,
        string calldata description,
        uint256 eventTimestamp,
        uint256 maxSupply,
        string calldata metadata,
        string calldata location
    ) external returns (uint256 newId) {
        if (eventTimestamp <= block.timestamp) {
            revert EventTicketingErrors.InvalidTimestamp();
        }
        if (maxSupply == 0) {
            revert EventTicketingErrors.InvalidMaxSupply();
        }
        if (bytes(eventName).length == 0) {
            revert EventTicketingErrors.InvalidName();
        }
        if (bytes(description).length == 0) {
            revert EventTicketingErrors.InvalidDescription();
        }
        // Price can be zero if you want free events; keep your original semantics:
        // If you want to forbid free events, uncomment the next line:
        // require(price > 0, "EventTicketing: price > 0");

        unchecked { _ticketIds++; }
        newId = _ticketIds;

        _createTicket(newId, price, eventName, description, eventTimestamp, maxSupply, metadata, location);

        emit TicketCreated(newId, msg.sender, price, eventName, description, eventTimestamp, maxSupply);
    }

    /**
     * @dev Internal helper to write the ticket struct
     */
    function _createTicket(
        uint256 newId,
        uint256 price,
        string memory eventName,
        string memory description,
        uint256 eventTimestamp,
        uint256 maxSupply,
        string memory metadata,
        string memory location
    ) internal {
        tickets[newId] = EventTicketingLib.Ticket({
            id: newId,
            creator: payable(msg.sender),
            price: price,
            eventName: eventName,
            description: description,
            eventTimestamp: eventTimestamp,
            location: location,
            closed: false,
            canceled: false,
            metadata: metadata,
            maxSupply: maxSupply,
            sold: 0,
            totalCollected: 0,
            totalRefunded: 0,
            proceedsWithdrawn: false
        });
        // refund cursor implicitly 0 for newId
    }

    /**
     * @notice Register for an event by paying the exact price, and receive an NFT
     * @param ticketId The event id
     * @return nftTokenId The minted NFT token id
     */
    function register(uint256 ticketId) external payable nonReentrant returns (uint256 nftTokenId) {
        EventTicketingLib.Ticket storage t = tickets[ticketId];
        if (t.id == 0) {
            revert EventTicketingErrors.EventNotFound();
        }
        if (t.closed) {
            revert EventTicketingErrors.EventClosed();
        }
        if (t.canceled) {
            revert EventTicketingErrors.EventCanceled();
        }
        if (block.timestamp >= t.eventTimestamp) {
            revert EventTicketingErrors.EventNotPassed();
        }
        if (isRegistered[ticketId][msg.sender]) {
            revert EventTicketingErrors.AlreadyRegistered();
        }
        if (t.sold >= t.maxSupply) {
            revert EventTicketingErrors.SoldOut();
        }
        if (msg.value != t.price) {
            revert EventTicketingErrors.InvalidPaymentAmount(t.price, msg.value);
        }

        // Effects
        EventTicketingLib.escrowFunds(paidAmount, tickets, ticketId, msg.value);
        EventTicketingLib.recordRegistration(registrants, isRegistered, ticketId, msg.sender);

        // Interactions (after effects)
        nftTokenId = _mintNFT(msg.sender, ticketId, t.eventName, t.description, t.eventTimestamp, t.location);

        emit Registered(ticketId, msg.sender, nftTokenId);
    }

    /**
     * @dev Mint via the Ticket NFT contract
     */
    function _mintNFT(
        address to,
        uint256 ticketId,
        string memory eventName,
        string memory description,
        uint256 eventTimestamp,
        string memory location
    ) internal returns (uint256) {
        return ticketNft.mintForRegistrant(to, ticketId, eventName, description, eventTimestamp, location);
    }

    /**
     * @notice Organizer updates price, location, and timestamp
     * @param ticketId The event id
     * @param newPrice New price (wei)
     * @param newLocation New location
     * @param newEventTimestamp New future timestamp
     */
    function updateTicket(
        uint256 ticketId,
        uint256 newPrice,
        string calldata newLocation,
        uint256 newEventTimestamp
    ) external {
        EventTicketingLib.Ticket storage t = tickets[ticketId];
        if (t.id == 0) {
            revert EventTicketingErrors.EventNotFound();
        }
        if (msg.sender != t.creator) {
            revert EventTicketingErrors.OnlyCreator();
        }
        if (t.canceled) {
            revert EventTicketingErrors.EventCanceled();
        }
        if (t.closed) {
            revert EventTicketingErrors.EventClosed();
        }
        if (block.timestamp >= t.eventTimestamp) {
            revert EventTicketingErrors.EventStarted();
        }
        if (newEventTimestamp <= block.timestamp) {
            revert EventTicketingErrors.InvalidTimestamp();
        }
        if (newPrice == 0) {
            revert EventTicketingErrors.InvalidPrice();
        }
        if (bytes(newLocation).length == 0) {
            revert EventTicketingErrors.InvalidLocation();
        }

        EventTicketingLib.updateTicketDetails(t, newPrice, newLocation, newEventTimestamp);

        emit TicketUpdated(ticketId, newPrice, newEventTimestamp, newLocation);
    }

    /**
     * @notice Organizer increases/decreases max supply (cannot go below sold)
     * @param ticketId The event id
     * @param newMaxSupply New maximum supply
     */
    function updateMaxSupply(uint256 ticketId, uint256 newMaxSupply) external {
        EventTicketingLib.Ticket storage t = tickets[ticketId];
        if (t.id == 0) {
            revert EventTicketingErrors.EventNotFound();
        }
        if (msg.sender != t.creator) {
            revert EventTicketingErrors.OnlyCreator();
        }
        if (t.canceled) {
            revert EventTicketingErrors.EventCanceled();
        }
        if (t.closed) {
            revert EventTicketingErrors.EventClosed();
        }
        if (newMaxSupply < t.sold) {
            revert EventTicketingErrors.InvalidMaxSupply();
        }
        if (newMaxSupply == 0) {
            revert EventTicketingErrors.InvalidMaxSupply();
        }

        t.maxSupply = newMaxSupply;
        emit MaxSupplyUpdated(ticketId, newMaxSupply);
    }

    /**
     * @notice Close an event (stops new registrations)
     * @param ticketId The event id
     */
    function closeTicket(uint256 ticketId) external {
        EventTicketingLib.Ticket storage t = tickets[ticketId];
        if (t.id == 0) {
            revert EventTicketingErrors.EventNotFound();
        }
        if (msg.sender != t.creator && msg.sender != owner()) {
            revert EventTicketingErrors.NotAuthorized();
        }
        if (t.closed) {
            revert EventTicketingErrors.EventClosed();
        }
        if (t.canceled) {
            revert EventTicketingErrors.EventCanceled();
        }
        t.closed = true;
        emit TicketClosed(ticketId, msg.sender);
    }

    /**
     * @notice Cancel an event and automatically process refunds in batches to avoid OOG.
     *         Can be called repeatedly by the organizer or owner until all refunds are processed.
     * @param ticketId The event id
     */
    function cancelTicket(uint256 ticketId) external nonReentrant {
        EventTicketingLib.Ticket storage t = tickets[ticketId];
        if (t.id == 0) {
            revert EventTicketingErrors.EventNotFound();
        }
        if (msg.sender != t.creator && msg.sender != owner()) {
            revert EventTicketingErrors.NotAuthorized();
        }

        // First call sets canceled/closed; subsequent calls only continue refunds
        if (!t.canceled) {
            t.canceled = true;
            t.closed = true;
            emit TicketCanceled(ticketId, msg.sender);
        }

        // Process up to _REFUND_BATCH_SIZE refunds per call
        address[] storage regs = registrants[ticketId];
        uint256 cursor = _refundCursor[ticketId];
        uint256 end = cursor + _REFUND_BATCH_SIZE;
        if (end > regs.length) end = regs.length;

        for (uint256 i = cursor; i < end; i++) {
            address payable refundee = payable(regs[i]);
            uint256 amt = paidAmount[ticketId][refundee];
            if (amt > 0) {
                // Effects
                EventTicketingLib.processRefund(paidAmount, tickets, ticketId, refundee, amt);
                emit RefundClaimed(ticketId, refundee, amt);
            }
        }

        _refundCursor[ticketId] = end;
        // When end == regs.length, all refunds are processed.
    }

    // -------- Settlement --------

    /**
     * @notice Organizer withdraws proceeds after event has passed and not canceled.
     * @param ticketId The event id
     */
    function withdrawProceeds(uint256 ticketId) external nonReentrant {
        EventTicketingLib.Ticket storage t = tickets[ticketId];
        if (t.id == 0) {
            revert EventTicketingErrors.EventNotFound();
        }
        if (msg.sender != t.creator) {
            revert EventTicketingErrors.OnlyCreator();
        }
        if (t.canceled) {
            revert EventTicketingErrors.EventCanceled();
        }
        if (block.timestamp < t.eventTimestamp) {
            revert EventTicketingErrors.EventNotPassed();
        }
        if (t.proceedsWithdrawn) {
            revert EventTicketingErrors.ProceedsAlreadyWithdrawn();
        }

        _settleProceeds(ticketId, t);
    }

    /**
     * @notice Anyone can trigger settlement after event passed (not canceled).
     * @param ticketId The event id
     */
    function finalizeEvent(uint256 ticketId) external nonReentrant {
        EventTicketingLib.Ticket storage t = tickets[ticketId];
        if (t.id == 0) {
            revert EventTicketingErrors.EventNotFound();
        }
        if (t.canceled) {
            revert EventTicketingErrors.EventCanceled();
        }
        if (block.timestamp < t.eventTimestamp) {
            revert EventTicketingErrors.EventNotPassed();
        }
        if (t.proceedsWithdrawn) {
            revert EventTicketingErrors.ProceedsAlreadyWithdrawn();
        }

        _settleProceeds(ticketId, t);
    }

    /**
     * @dev Internal settlement that calculates fee, pays fee, and pays creator.
     */
    function _settleProceeds(uint256 ticketId, EventTicketingLib.Ticket storage t) internal {
        uint256 net = EventTicketingLib.calculateNetAmount(t);
        uint256 fee = EventTicketingLib.calculateFee(net, platformFeeBps);
        uint256 toCreator = net - fee;

        t.proceedsWithdrawn = true;

        // Interactions after all effects
        EventTicketingLib.transferFee(feeRecipient, fee);
        EventTicketingLib.transferToCreator(t.creator, toCreator);

        emit ProceedsWithdrawn(ticketId, t.creator, toCreator, fee);
    }

    /**
     * @notice Registered users can claim their refund if event is canceled.
     *         (This complements batched refunds in cancelTicket.)
     * @param ticketId The event id
     */
    function claimRefund(uint256 ticketId) external nonReentrant {
        EventTicketingLib.Ticket storage t = tickets[ticketId];
        if (t.id == 0) {
            revert EventTicketingErrors.EventNotFound();
        }
        if (!t.canceled) {
            revert EventTicketingErrors.EventNotCanceled();
        }

        uint256 amt = paidAmount[ticketId][msg.sender];
        if (amt == 0) {
            revert EventTicketingErrors.NothingToRefund();
        }

        // Effects & Interactions
        EventTicketingLib.processRefund(paidAmount, tickets, ticketId, payable(msg.sender), amt);

        emit RefundClaimed(ticketId, msg.sender, amt);
    }

    // -------- Views --------

    /**
     * @notice Whether an event is open and has tickets left
     */
    function isAvailable(uint256 ticketId) public view returns (bool) {
        EventTicketingLib.Ticket storage t = tickets[ticketId];
        if (t.id == 0 || t.closed || t.canceled || block.timestamp >= t.eventTimestamp) return false;
        if (t.sold >= t.maxSupply) return false;
        return true;
    }

    /**
     * @notice Remaining tickets for an event
     */
    function ticketsLeft(uint256 ticketId) external view returns (uint256) {
        EventTicketingLib.Ticket storage t = tickets[ticketId];
        if (t.id == 0) return 0;
        if (t.sold >= t.maxSupply) return 0;
        return t.maxSupply - t.sold;
    }

    /**
     * @notice Get the list of registrants (addresses) for an event
     */
    function getRegistrants(uint256 ticketId) external view returns (address[] memory) {
        return registrants[ticketId];
    }

    /**
     * @notice Get the current status of an event
     */
    function getStatus(uint256 ticketId) public view returns (Status) {
        EventTicketingLib.Ticket storage t = tickets[ticketId];
        if (t.id == 0) revert EventTicketingErrors.EventNotFound();
        if (t.canceled) return Status.Canceled;
        if (t.closed) {
            if (block.timestamp < t.eventTimestamp) return Status.Closed;
        }
        if (block.timestamp >= t.eventTimestamp) return Status.Passed;
        return Status.Upcoming;
    }

    /**
     * @notice Get up to the latest 100 tickets for dashboard views
     */
    function getRecentTickets() external view returns (EventTicketingLib.Ticket[] memory) {
        uint256 totalTickets = _ticketIds;
        if (totalTickets == 0) {
            return new EventTicketingLib.Ticket[](0);
        }

        uint256 limit = totalTickets > 100 ? 100 : totalTickets;
        uint256 startIndex = totalTickets > 100 ? totalTickets - 100 + 1 : 1;

        EventTicketingLib.Ticket[] memory recentTickets = new EventTicketingLib.Ticket[](limit);

        for (uint256 i = 0; i < limit; i++) {
            recentTickets[i] = tickets[startIndex + i];
        }

        return recentTickets;
    }

    /**
     * @notice Total number of tickets created (ticketId counter)
     */
    function getTotalTickets() external view returns (uint256) {
        return _ticketIds;
    }

    // -------- Safety --------

    receive() external payable {
        revert EventTicketingErrors.InvalidCall();
    }

    fallback() external payable {
        revert EventTicketingErrors.InvalidCall();
    }
}
