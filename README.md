# EventBase- DeFi Event Ticketing Platform

EventBase is a decentralized event ticketing platform built on Base Network that revolutionizes the events industry through DeFi mechanisms. The platform provide instant ticket transactions, fraud-proof NFT tickets, and real-time revenue distribution.

## Key Features

- NFT-Based Tickets: Each ticket is a unique ERC-721 token ensuring authenticity
- Instant Settlements: Real-time revenue distribution using kaia's speed
- Zero Fraud Risk: Blockchain-verified ticket authenticity
- P2P Transfers: Secure ticket transfers between users
- Dynamic Pricing: Smart contract-based pricing adjustments
- Cross-Platform Integration: Metaverse-ready ticket system

## Architecture

The platform consists of three main components:

### Smart Contracts
Core ticketing logic built with Solidity 0.8.28:
- EventTicketing.sol: Main ticketing contract with DeFi mechanisms
- TicketNft.sol: ERC-721 NFT implementation for tickets
- EventTicketingLib.sol: Shared utilities and gas optimizations

**[View Smart Contract Documentation](./smcontract/README.md)** for detailed technical information, deployment guides, and API reference.

### Frontend Application
Modern web application built with Next.js 15:
- TypeScript for type safety
- Wagmi v2 for Web3 React hooks
- RainbowKit for multi-wallet connection
- Tailwind CSS for responsive design

**[View Frontend Documentation](./frontend/README.md)** for setup instructions, component details, and development guide.

### Blockchain Network
- Network:Base sepolia Testnet (Chain ID: 84532)
- Performance: 1M+ TPS with sub-second finality
- Compatibility: Full EVM compatibility
- Token: Base (native token)

## Contract Addresses (Base Sepolia Testnet)

All contracts are deployed and verified on Base Sepolia:

- **TicketNft**: `0x8486E62b5975A4241818b564834A5f51ae2540B6` 
  - [View on BaseScan](https://sepolia.basescan.org/address/0x8486E62b5975A4241818b564834A5f51ae2540B6)
  
- **EventTicketing**: `0xe3D37E5c036CC0bb4E0A170D49cc9212ABc8f985` 
  - [View on BaseScan](https://sepolia.basescan.org/address/0xe3D37E5c036CC0bb4E0A170D49cc9212ABc8f985)
  
- **TicketResaleMarket**: `0x7BEe53CBeF0580Fdd2Bf1794E8111Ee8Fc93ed43` 
  - [View on BaseScan](https://sepolia.basescan.org/address/0x7BEe53CBeF0580Fdd2Bf1794E8111Ee8Fc93ed43)

**Deployment Date**: October 2024  
**Network**: Base Sepolia Testnet (Chain ID: 84532)  
**Status**: ✅ Active and Tested

## Usage

### For Event Attendees
1. Connect your Web3 wallet to the platform
2. Browse available events in the marketplace
3. Purchase tickets with KAIA Kairos tokens
4. Manage your ticket NFTs in your portfolio
5. Transfer tickets to other users if needed

### For Event Organizers
1. Connect wallet and create new events
2. Set event details, pricing, and capacity
3. Monitor ticket sales in real-time
4. Withdraw proceeds after event completion
5. Cancel events with automatic refunds if needed

## Getting Started

### Prerequisites
- Node.js v18+ and npm
- MetaMask or another Web3 wallet
- Base Sepolia testnet ETH ([Get from faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/big14way/event.git
cd EventBase-main
```

2. **Setup Smart Contracts**
```bash
cd smcontract
npm install
cp .env.example .env
# Edit .env and add your private key and BaseScan API key
```

3. **Setup Frontend**
```bash
cd ../frontend
npm install
cp .env.example .env.local
# Edit .env.local and add your WalletConnect Project ID
```

4. **Run the Application**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` to see the application.

### Environment Variables

**Smart Contract** (smcontract/.env):
- `PRIVATE_KEY`: Your wallet private key (for deployment)
- `BASESCAN_API_KEY`: BaseScan API key for contract verification

**Frontend** (frontend/.env.local):
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: Get from [WalletConnect Cloud](https://cloud.walletconnect.com)

⚠️ **Never commit .env files to git. They are included in .gitignore.**

## Demo

- Live Application: Coming Soon
- Smart Contracts: Deployed on Base Sepolia Testnet
- Block Explorer: [BaseScan](https://sepolia.basescan.org/)

## Hackathon Submission

This project was built for the Base Wave Stablecoin Summer Hackathon and demonstrates:

- DeFi Innovation: Novel financial primitives for event ticketing
- Technical Excellence: Production-ready smart contracts with advanced security
- User Experience: Seamless Web3 integration with modern UI
- Market Impact: Addresses real-world problems in the $68B ticketing industry

### Submission Categories
- Primary: DeFi Innovation
- Secondary: NFT Utilities, Web3 UX

## License

This project is licensed under the MIT License.

## Contributing

We welcome contributions!



## Support

For support and questions:
- GitHub Issues: Create an issue for bug reports or feature requests
- Community: Join our Discord server (link coming soon)
# EventBase-Ticket
