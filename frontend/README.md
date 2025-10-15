# EventBase Frontend

This is the frontend application for EventBase, a decentralized event ticketing platform built with Next.js 15 and deployed on base network.

## Tech Stack

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Wagmi v2**: React hooks for Ethereum
- **RainbowKit**: Wallet connection library
- **Viem**: TypeScript interface for Ethereum
- **Radix UI**: Accessible component primitives
- **TanStack Query**: Data fetching and caching

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── create-event/       # Event creation page
│   │   ├── marketplace/        # Event marketplace
│   │   ├── tickets/           # User ticket management
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── providers.tsx      # Web3 providers
│   ├── components/            # React components
│   │   ├── event-card.tsx     # Event display
│   │   ├── ticket-management-system.tsx  # Ticket portfolio
│   │   ├── wallet-connect-button.tsx     # Wallet integration
│   │   └── ui/                # UI components
│   ├── data/                  # Static data
│   └── lib/                   # Utilities
├── public/                    # Static assets
└── package.json              # Dependencies
```

## Key Components

### EventCard Component
**Location**: `src/components/event-card.tsx`

Displays event information with real-time blockchain data:
- Event details (name, date, location, price)
- Live ticket availability
- Registration status checking
- Transaction handling with user feedback
- Error handling and loading states

### TicketManagementSystem Component
**Location**: `src/components/ticket-management-system.tsx`

Comprehensive ticket portfolio management:
- Display all user-owned ticket NFTs
- Ticket metadata and event details
- QR code generation for event entry
- Ticket transfer functionality
- Transaction history and blockchain verification

### WalletConnectButton Component
**Location**: `src/components/wallet-connect-button.tsx`

Multi-wallet connection with RainbowKit integration:
- Support for MetaMask, WalletConnect, Coinbase Wallet
- Network switching to base kairos testnet
- Balance display and account management
- Custom styling with Tailwind CSS

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with proper TypeScript types
4. Test thoroughly on base kairos testnet
5. Submit pull request
