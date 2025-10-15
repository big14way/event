// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @notice Custom errors for EventTicketing contract
library EventTicketingErrors {
    // Access control
    error NotAuthorized();
    error OnlyCreator();
    error OnlyOwnerOrCreator();
    
    // Validation
    error ZeroAddress();
    error InvalidFee(uint256 feeBps);
    error EventStarted();
    error EventNotFound();
    error EventClosed();
    error EventCanceled();
    error EventNotPassed();
    error EventNotCanceled();
    error AlreadyRegistered();
    error SoldOut();
    error InvalidPrice();
    error InvalidTimestamp();
    error InvalidMaxSupply();
    error InvalidLocation();
    error InvalidName();
    error InvalidDescription();
    error NothingToRefund();
    error AlreadyWithdrawn();
    error InvalidPaymentAmount(uint256 expected, uint256 actual);
    error ProceedsAlreadyWithdrawn();
    error InvalidCall();
}

/// @notice Custom errors for TicketNft contract
library TicketNftErrors {
    error NotMinter();
    error ZeroAddress();
    error InvalidImageUri();
    error TokenDoesNotExist();
}

/// @notice Custom errors for TicketResaleMarket contract
library ResaleMarketErrors {
    error NotOwner();
    error InvalidPrice();
    error NotListed();
    error NotSeller();
    error SelfPurchase();
    error InsufficientPayment();
    error TransferFailed();
    error NotApproved();
    error EventNotUpcoming();
    error ZeroAddress();
    error InvalidRoyalty();
}
