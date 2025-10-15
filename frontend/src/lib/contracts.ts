// Type definitions for contract data
export interface Ticket {
  id: bigint;
  creator: string;
  price: bigint;
  eventName: string;
  description: string;
  eventTimestamp: bigint;
  location: string;
  closed: boolean;
  canceled: boolean;
  metadata: string;
  maxSupply: bigint;
  sold: bigint;
  totalCollected: bigint;
  totalRefunded: bigint;
  proceedsWithdrawn: boolean;
}

export interface NFTTicket {
  tokenId: bigint;
  ticketId: bigint;
  eventName: string;
  description: string;
  eventTimestamp: bigint;
  location: string;
  owner: string;
}

// Re-export contract addresses and ABIs from abiAndAddress
export {
  TicketNftAddress as ticketNftAddress,
  EventTicketingAddress as eventTicketingAddress,
  TicketResaleMarketAddress as resaleMarketAddress,
  TicketNftAbi as ticketNftAbi,
  EventTicketingAbi as eventTicketingAbi,
  TicketResaleMarketAbi as resaleMarketAbi
} from './abiAndAddress'
