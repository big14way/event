# Deployment Guide for Base Network

## Prerequisites

1. Get a BaseScan API key from https://basescan.org/myapikey
2. Have ETH on Base Sepolia (testnet) or Base Mainnet for deployment

## Setup

### 1. Set your private key and API key using Hardhat vars:

```bash
npx hardhat vars set PRIVATE_KEY_2
# Enter your private key (without 0x prefix)

npx hardhat vars set ETHERSCAN_API_KEY
# Enter your BaseScan API key
```

### 2. Update the deployer address in the deployment script

Edit `ignition/modules/EventTicketing.ts` and update the `deployerAddress` to your wallet address (the one that will receive platform fees).

## Deploy to Base Sepolia (Testnet)

```bash
npx hardhat ignition deploy ./ignition/modules/EventTicketing.ts --network baseSepolia
```

## Deploy to Base Mainnet

```bash
npx hardhat ignition deploy ./ignition/modules/EventTicketing.ts --network base
```

## Verify Contracts

After deployment, verify the contracts on BaseScan:

### For Base Sepolia:
```bash
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

### For Base Mainnet:
```bash
npx hardhat verify --network base <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## Network Information

- **Base Sepolia (Testnet)**
  - Chain ID: 84532
  - RPC: https://sepolia.base.org
  - Explorer: https://sepolia.basescan.org
  - Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

- **Base Mainnet**
  - Chain ID: 8453
  - RPC: https://mainnet.base.org
  - Explorer: https://basescan.org

## Contract Addresses

### Base Sepolia (Deployed)
- **TicketNFT**: `0x8486E62b5975A4241818b564834A5f51ae2540B6` ([View on BaseScan](https://sepolia.basescan.org/address/0x8486E62b5975A4241818b564834A5f51ae2540B6#code))
- **EventTicketing**: `0xe3D37E5c036CC0bb4E0A170D49cc9212ABc8f985` ([View on BaseScan](https://sepolia.basescan.org/address/0xe3D37E5c036CC0bb4E0A170D49cc9212ABc8f985#code))
- **TicketResaleMarket**: `0x7BEe53CBeF0580Fdd2Bf1794E8111Ee8Fc93ed43` ([View on BaseScan](https://sepolia.basescan.org/address/0x7BEe53CBeF0580Fdd2Bf1794E8111Ee8Fc93ed43#code))

All contracts are verified and ready to use!

### Base Mainnet
- TicketNFT: (Not deployed yet)
- EventTicketing: (Not deployed yet)
- TicketResaleMarket: (Not deployed yet)
