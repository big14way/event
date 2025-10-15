import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import {
  ticketNftAddress,
  eventTicketingAddress,
  ticketNftAbi,
  eventTicketingAbi,
  NFTTicket,
  Ticket
} from '@/lib/contracts'

// Hook for reading recent tickets from EventTicketing contract
export function useRecentTickets() {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: eventTicketingAddress,
    abi: eventTicketingAbi,
    functionName: 'getRecentTickets',
  })

  return {
    tickets: data as Ticket[] | undefined,
    isLoading,
    isError,
    refetch
  }
}

// Hook for reading user's NFT tickets
export function useUserTickets(userAddress: `0x${string}` | undefined) {
  const { data: balance } = useReadContract({
    address: ticketNftAddress,
    abi: ticketNftAbi,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
  })

  return {
    ticketCount: balance ? Number(balance) : 0,
    isLoading: !balance && userAddress,
  }
}

// Hook for reading ticket details by ID
export function useTicketDetails(ticketId: bigint | undefined) {
  const { data, isLoading, isError } = useReadContract({
    address: eventTicketingAddress,
    abi: eventTicketingAbi,
    functionName: 'tickets',
    args: ticketId !== undefined ? [ticketId] : undefined,
  })

  return {
    ticket: data as Ticket | undefined,
    isLoading,
    isError
  }
}

// Hook for checking if user is registered for a ticket
export function useIsRegistered(ticketId: bigint | undefined, userAddress: `0x${string}` | undefined) {
  const { data } = useReadContract({
    address: eventTicketingAddress,
    abi: eventTicketingAbi,
    functionName: 'isRegistered',
    args: ticketId !== undefined && userAddress ? [ticketId, userAddress] : undefined,
  })

  return {
    isRegistered: data as boolean | undefined
  }
}

// Hook for registering for a ticket (purchasing)
export function useRegisterForTicket() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const register = async (ticketId: bigint, price: bigint) => {
    writeContract({
      address: eventTicketingAddress,
      abi: eventTicketingAbi,
      functionName: 'register',
      args: [ticketId],
      value: price,
    })
  }

  return {
    register,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error
  }
}

// Hook for creating a new ticket
export function useCreateTicket() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const createTicket = async (
    price: string,
    eventName: string,
    description: string,
    eventTimestamp: bigint,
    maxSupply: bigint,
    metadata: string,
    location: string
  ) => {
    writeContract({
      address: eventTicketingAddress,
      abi: eventTicketingAbi,
      functionName: 'createTicket',
      args: [
        parseEther(price),
        eventName,
        description,
        eventTimestamp,
        BigInt(maxSupply),
        metadata,
        location
      ],
    })
  }

  return {
    createTicket,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error
  }
}

// Hook for getting NFT token details
export function useNFTTokenDetails(tokenId: bigint | undefined) {
  const { data: metadata } = useReadContract({
    address: ticketNftAddress,
    abi: ticketNftAbi,
    functionName: 'getTicketMetadata',
    args: tokenId !== undefined ? [tokenId] : undefined,
  })

  const eventName = metadata?.eventName
  const description = metadata?.description

  const eventTimestamp = metadata?.eventTimestamp
  const location = metadata?.location
  const ticketId = metadata?.ticketId

  const { data: owner } = useReadContract({
    address: ticketNftAddress,
    abi: ticketNftAbi,
    functionName: 'ownerOf',
    args: tokenId !== undefined ? [tokenId] : undefined,
  })

  return {
    nftTicket: tokenId !== undefined ? {
      tokenId,
      ticketId: (ticketId as unknown) as bigint,
      eventName: (eventName as unknown) as string,
      description: (description as unknown) as string,
      eventTimestamp: (eventTimestamp as unknown) as bigint,
      location: (location as unknown) as string,
      owner: (owner as unknown) as string,
    } as NFTTicket : undefined,
    isLoading: tokenId !== undefined && (!eventName || !description)
  }
}

// Hook for transferring NFT tickets
export function useTransferTicket() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const transferTicket = async (from: `0x${string}`, to: `0x${string}`, tokenId: bigint) => {
    writeContract({
      address: ticketNftAddress,
      abi: ticketNftAbi,
      functionName: 'transferFrom',
      args: [from, to, tokenId],
    })
  }

  return {
    transferTicket,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error
  }
}

// Utility functions
export const formatPrice = (price: bigint) => formatEther(price)
export const parsePrice = (price: string) => parseEther(price)
