import { useState, useEffect } from "react"
import { useReadContract } from 'wagmi'
import { eventTicketingAbi, eventTicketingAddress } from "@/lib/contracts"
import { formatEther } from "viem"
import { toast } from "sonner"

interface TicketData {
  id: number
  creator: string
  price: bigint
  eventName: string
  description: string
  eventTimestamp: bigint
  location: string
  closed: boolean
  canceled: boolean
  metadata: string
  maxSupply: bigint
  sold: bigint
  totalCollected: bigint
  totalRefunded: bigint
  proceedsWithdrawn: boolean
}

export interface MarketplaceEvent {
  id: number
  eventTitle: string
  price: string
  date: string
  location: string
  image: string
  attendees: number
  ticketsLeft: number
  status: string
  category: string
  trending: boolean
  createdAt: string
  originalPrice: bigint
}

export function useMarketplaceEvents() {
  const [events, setEvents] = useState<MarketplaceEvent[]>([])
  const [loading, setLoading] = useState(true)
  
  // Read contract data
  const { data: recentTickets, error: ticketsError, isPending } = useReadContract({
    address: eventTicketingAddress,
    abi: eventTicketingAbi,
    functionName: 'getRecentTickets',
  })

  // Show loading state
  useEffect(() => {
    let toastId: string | number | undefined;
    
    if (isPending) {
      toastId = toast.loading('Loading events...');
    }
    
    return () => {
      if (toastId !== undefined) {
        toast.dismiss(toastId);
      }
    };
  }, [isPending])

  // Handle errors
  useEffect(() => {
    if (ticketsError) {
      console.error('Error loading events:', ticketsError)
      toast.error(`Failed to load events: ${ticketsError.message || 'Network error'}`)
    }
  }, [ticketsError])

  // Transform blockchain data to marketplace format
  useEffect(() => {
    if (recentTickets && Array.isArray(recentTickets)) {
      if (recentTickets.length === 0) {
        toast.info('No events found. Create one to get started!')
      } else {
        toast.success('Events loaded successfully')
      }
      const transformedEvents: MarketplaceEvent[] = recentTickets.map((ticket: TicketData) => {
        const eventDate = new Date(Number(ticket.eventTimestamp) * 1000)
        const now = new Date()
        const isPassed = eventDate < now
        const isCanceled = ticket.canceled
        const isClosed = ticket.closed
        const ticketsLeft = Number(ticket.maxSupply - ticket.sold)
        
        let status = "upcoming"
        if (isCanceled) status = "canceled"
        else if (isClosed) status = "closed"
        else if (isPassed) status = "passed"
        else if (ticketsLeft === 0) status = "sold_out"

        // Parse metadata for additional info
        let category = "Event"
        let image = "/metaverse-fashion-show.png"
        try {
          if (ticket.metadata) {
            const metadata = JSON.parse(ticket.metadata)
            category = metadata.category || "Event"
            image = metadata.image || "/metaverse-fashion-show.png"
          }
        } catch {
          console.log("Could not parse metadata")
        }

        return {
          id: Number(ticket.id),
          eventTitle: ticket.eventName,
          price: `${formatEther(ticket.price)} BASE`,
          date: eventDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }),
          location: ticket.location,
          image: image,
          attendees: Number(ticket.maxSupply),
          ticketsLeft: ticketsLeft,
          status: status,
          category: category,
          trending: ticket.sold > (ticket.maxSupply * BigInt(7)) / BigInt(10), // Trending if 70% sold
          createdAt: eventDate.toISOString(),
          originalPrice: ticket.price,
        }
      })

      setEvents(transformedEvents)
      setLoading(false)
    } else if (ticketsError) {
      console.error('Error fetching tickets:', ticketsError)
      setLoading(false)
    }
  }, [recentTickets, ticketsError])

  // Helper functions
  const getFeaturedEvents = (limit: number = 4) => {
    return events
      .filter(event => event.status === "upcoming")
      .sort((a, b) => {
        // Prioritize trending events
        if (a.trending && !b.trending) return -1
        if (!a.trending && b.trending) return 1
        // Then sort by tickets sold (popularity)
        const aSold = a.attendees - a.ticketsLeft
        const bSold = b.attendees - b.ticketsLeft
        return bSold - aSold
      })
      .slice(0, limit)
  }

  const getUpcomingEvents = () => {
    return events.filter(event => event.status === "upcoming")
  }

  const getTrendingEvents = () => {
    return events.filter(event => event.trending && event.status === "upcoming")
  }

  return {
    events,
    loading,
    error: ticketsError,
    getFeaturedEvents,
    getUpcomingEvents,
    getTrendingEvents
  }
}
