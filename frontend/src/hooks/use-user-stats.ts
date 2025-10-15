import { useState, useEffect } from "react"
import { useAccount, useReadContract } from 'wagmi'
import { eventTicketingAbi, eventTicketingAddress, ticketNftAbi, ticketNftAddress } from "@/lib/contracts"
import { formatEther } from "viem"

interface UserStats {
  attendedEvents: number
  totalSpent: string
  createdEvents: number
  totalRevenue: string
  ownedTickets: number
}

export function useUserStats() {
  const { address, isConnected } = useAccount()
  const [userStats, setUserStats] = useState<UserStats>({
    attendedEvents: 0,
    totalSpent: "0",
    createdEvents: 0,
    totalRevenue: "0",
    ownedTickets: 0
  })
  const [loading, setLoading] = useState(true)

  // Get user's NFT balance (number of tickets owned)
  const { data: nftBalance } = useReadContract({
    address: ticketNftAddress,
    abi: ticketNftAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected
    }
  })

  // Get recent tickets to calculate created events, revenue, and spending
  const { data: recentTicketsData } = useReadContract({
    address: eventTicketingAddress,
    abi: eventTicketingAbi,
    functionName: 'getRecentTickets',
    query: {
      enabled: !!address && isConnected
    }
  })

  useEffect(() => {
    if (!address || !isConnected) {
      setUserStats({
        attendedEvents: 0,
        totalSpent: "0",
        createdEvents: 0,
        totalRevenue: "0",
        ownedTickets: 0
      })
      setLoading(false)
      return
    }

    // Get number of NFT tickets owned
    const ownedTickets = nftBalance ? Number(nftBalance) : 0

    // Process created events and revenue
    let createdEvents = 0
    let totalRevenueBigInt = BigInt(0)
    let totalSpentBigInt = BigInt(0)
    let attendedEvents = 0

    if (recentTicketsData && Array.isArray(recentTicketsData)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tickets = recentTicketsData as any[]
      
      // Calculate events created by user
      const createdByUser = tickets.filter(ticket => 
        ticket.creator.toLowerCase() === address.toLowerCase()
      )
      
      createdEvents = createdByUser.length
      totalRevenueBigInt = createdByUser.reduce((sum, ticket) => 
        sum + BigInt(ticket.totalCollected || 0), BigInt(0)
      )

      // Estimate spending based on owned tickets and average ticket prices
      // This is an approximation since we don't have direct purchase tracking
      if (ownedTickets > 0 && tickets.length > 0) {
        const averagePrice = tickets.reduce((sum, ticket) => 
          sum + BigInt(ticket.price || 0), BigInt(0)
        ) / BigInt(tickets.length)
        
        totalSpentBigInt = averagePrice * BigInt(ownedTickets)
        attendedEvents = ownedTickets
      }
    }

    setUserStats({
      attendedEvents,
      totalSpent: formatEther(totalSpentBigInt),
      createdEvents,
      totalRevenue: formatEther(totalRevenueBigInt),
      ownedTickets
    })
    
    setLoading(false)
  }, [nftBalance, recentTicketsData, address, isConnected])

  return {
    userStats,
    loading,
    isConnected
  }
}
