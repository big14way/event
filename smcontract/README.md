# EventBase Smart Contracts

This directory contains the smart contracts for the EventBase decentralized event ticketing platform, built on Solidity 0.8.28 and deployed on base kairos testnet.

## Contract Overview

### Core Contracts

#### EventTicketing.sol
The main contract handling all ticketing logic including:
- Event creation and management
- Ticket registration and payments
- Revenue distribution and fee handling
- Event cancellation with automatic refunds
- Access control and security measures

**Key Features:**
- Gas-optimized batch refund processing
- ReentrancyGuard protection
- Dynamic fee calculation
- Event lifecycle management
- Comprehensive error handling

#### TicketNft.sol
ERC-721 NFT contract for ticket tokens:
- Mints unique NFT tickets for each registration
- Handles ticket metadata and URI management
- Supports ticket transfers between users
- Integrates with main EventTicketing contract

#### EventTicketingLib.sol
Shared library containing utility functions:
- Fee calculations and transfers
- Amount validations
- Gas-optimized helper functions
- Reusable contract logic

## Deployed Addresses

**Base Sepolia Testnet:**
- **EventTicketing**: `0x6815e76CE475451D42363f4b55533720f19Ebada`
- **TicketNft**: `0xF708183DA2f773c213F93A3220eC5922fd73C720`
- **TicketResaleMarket**: `0xaD0299Ef4496d86B1F9CB71dc778F6a660eD4Af8`

**Block Explorer:**
- [EventTicketing Contract](https://kairos.basescan.io//address/0x6815e76CE475451D42363f4b55533720f19Ebada#code)
- [TicketNft Contract](https://kairos.basescan.io/address/0xF708183DA2f773c213F93A3220eC5922fd73C720#code)
- [TicketResaleMarket Contract](https://kairos.basescan.io/address/0xaD0299Ef4496d86B1F9CB71dc778F6a660eD4Af8#code)

## Security Features

### Access Control
- Owner-only administrative functions
- Creator-only event management functions
- User-specific registration validation

### Reentrancy Protection
- ReentrancyGuard on all payable functions
- Checks-Effects-Interactions pattern
- State updates before external calls

### Input Validation
- Comprehensive parameter checking
- Custom error messages
- Boundary condition handling

### Gas Optimization
- Batch processing for refunds
- Efficient storage patterns
- Minimal external calls

### Error Messages
- `EventNotFound`: Invalid ticket ID provided
- `AlreadyRegistered`: User already registered for event
- `SoldOut`: Event has reached maximum capacity
- `EventClosed`: Registration period has ended
- `InvalidPaymentAmount`: Incorrect payment sent
- `Unauthorized`: Caller lacks required permissions
