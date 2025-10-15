"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAccount, useReadContract } from 'wagmi'
import { Search, TrendingUp, Clock, Calendar, Users, Sparkles, AlertCircle } from "lucide-react"
import { eventTicketingAbi, eventTicketingAddress } from "@/lib/contracts"
import { EventCard } from "@/components/event-card"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useMarketplaceEvents, MarketplaceEvent } from "@/hooks/use-marketplace-events"


export default function Marketplace() {
  const router = useRouter()
  const { isConnected, chainId } = useAccount()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("trending")
  const [activeTab, setActiveTab] = useState("upcoming")
  const { events, loading } = useMarketplaceEvents()
  
  // Check if user is on the correct network
  const isCorrectNetwork = chainId 

  // Read contract data
  const { data: totalTickets, error: totalTicketsError } = useReadContract({
    address: eventTicketingAddress,
    abi: eventTicketingAbi,
    functionName: 'getTotalTickets',
  })

  // Handle contract errors
  useEffect(() => {
    if (totalTicketsError) {
      toast.error(`Failed to load tickets: ${totalTicketsError.message}`)
      console.error('Total tickets error:', totalTicketsError)
    }
  }, [totalTicketsError])

  // Redirect to landing page if wallet is not connected
  if (!isConnected) {
    toast.error("Please connect your wallet to access the marketplace")
    router.push("/")
    return null
  }

  const getEventsByTab = () => {
    let filteredEvents = events

    switch (activeTab) {
      case "upcoming":
        filteredEvents = events.filter(event => event.status === "upcoming")
        break
      case "passed":
        filteredEvents = events.filter(event => event.status === "passed")
        break
      case "canceled":
        filteredEvents = events.filter(event => event.status === "canceled")
        break
      case "closed":
        filteredEvents = events.filter(event => event.status === "closed" || event.status === "sold_out")
        break
      default:
        filteredEvents = events.filter(event => event.status === "upcoming")
    }

    // Apply search filter
    if (searchTerm) {
      filteredEvents = filteredEvents.filter(
        (event) =>
          event.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply sorting
    if (sortBy === "recent") {
      filteredEvents = [...filteredEvents].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (sortBy === "trending") {
      filteredEvents = [...filteredEvents].sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0))
    }

    return filteredEvents
  }

  const getTabCount = (tab: string) => {
    switch (tab) {
      case "upcoming":
        return events.filter(event => event.status === "upcoming").length
      case "passed":
        return events.filter(event => event.status === "passed").length
      case "canceled":
        return events.filter(event => event.status === "canceled").length
      case "closed":
        return events.filter(event => event.status === "closed" || event.status === "sold_out").length
      default:
        return 0
    }
  }

  const filteredEvents = getEventsByTab()

  return (
    <div className="mb-12 min-h-screen bg-gradient-to-br from-slate-900 via-[#dd7e9a]/10 to-slate-900 text-foreground">
      <div className="pb-16 px-4 pt-8">
        <div className="container mx-auto max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold mb-6">
              Event{" "}
              <span className="bg-gradient-to-r from-[#dd7e9a] to-[#dd7e9a] bg-clip-text text-transparent">
                Marketplace
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
              Discover amazing events and secure your NFT tickets on the blockchain. 
              All transactions are verified, fraud-proof, and powered by smart contracts.
            </p>
          </div>

          {/* Network Warning */}
          {!isCorrectNetwork && (
            <div className="mb-8">
              <Card className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border-orange-500/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-400 flex-shrink-0" />
                    <div>
                      <p className="text-orange-200 font-medium">Wrong Network</p>
                      <p className="text-orange-300 text-sm">Please switch to Sepolia testnet to interact with events.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search and Filters */}
          <div className="mb-12">
            <div className="flex flex-col xl:flex-row gap-6">
              {/* Search Bar */}
              <div className="flex-1 w-full">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-slate-400 w-5 h-5 group-focus-within:text-[#dd7e9a] transition-colors" />
                  <Input
                    placeholder="Search events by name, location, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 bg-slate-800/50 border-slate-600 focus:border-[#dd7e9a] focus:ring-[#dd7e9a]/20 text-white text-lg backdrop-blur-sm"
                  />
                  {searchTerm && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <Badge variant="secondary" className="bg-[#dd7e9a]/20 text-[#dd7e9a]/80 border-[#dd7e9a]/30">
                        {filteredEvents.length} results
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Sort Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  variant={sortBy === "trending" ? "default" : "outline"}
                  onClick={() => setSortBy("trending")}
                  className={`h-12 px-6 transition-all duration-200 ${
                    sortBy === "trending"
                      ? "bg-gradient-to-r from-[#dd7e9a] to-[#dd7e9a] hover:from-[#c06b8a] hover:to-[#c06b8a] shadow-lg"
                      : "border-slate-600 text-slate-300 hover:border-[#dd7e9a] hover:text-white"
                  }`}
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Trending
                </Button>
                <Button
                  variant={sortBy === "recent" ? "default" : "outline"}
                  onClick={() => setSortBy("recent")}
                  className={`h-12 px-6 transition-all duration-200 ${
                    sortBy === "recent"
                      ? "bg-gradient-to-r from-[#dd7e9a] to-[#dd7e9a] hover:from-[#c06b8a] hover:to-[#c06b8a] shadow-lg"
                      : "border-slate-600 text-slate-300 hover:border-blue-500 hover:text-white"
                  }`}
                >
                  <Clock className="w-5 h-5 mr-2" />
                  Recent
                </Button>
              </div>
            </div>
          </div>

          {/* Event Tabs */}
          <div className="flex justify-center mb-12">
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-2 border border-slate-600/50 shadow-xl">
              <div className="flex flex-wrap gap-1">
                {[
                  { key: "upcoming", label: "Upcoming", color: "purple" },
                  { key: "passed", label: "Passed", color: "green" },
                  { key: "canceled", label: "Canceled", color: "red" },
                  { key: "closed", label: "Closed", color: "gray" }
                ].map((tab) => {
                  const count = getTabCount(tab.key)
                  const isActive = activeTab === tab.key
                  return (
                    <Button
                      key={tab.key}
                      variant={isActive ? "default" : "ghost"}
                      onClick={() => setActiveTab(tab.key)}
                      className={`h-10 px-6 transition-all duration-200 ${
                        isActive
                          ? `bg-gradient-to-r ${
                              tab.color === "purple" ? "from-[#dd7e9a] to-[#dd7e9a]" :
                              tab.color === "green" ? "from-green-600 to-emerald-600" :
                              tab.color === "red" ? "from-red-600 to-[#dd7e9a]" :
                              "from-gray-600 to-slate-600"
                            } shadow-lg`
                          : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                      }`}
                    >
                      {tab.label}
                      {count > 0 && (
                        <Badge
                          variant="secondary"
                          className={`ml-2 text-xs ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-slate-600/50 text-slate-300"
                          }`}
                        >
                          {count}
                        </Badge>
                      )}
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center p-12">
              <Card className="bg-slate-800/50 border-[#dd7e9a]/30 backdrop-blur-sm max-w-md mx-auto">
                <CardContent className="p-8">
                  <div className="w-12 h-12 border-4 border-[#dd7e9a] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                  <h3 className="text-xl font-semibold text-white mb-2">Loading Events</h3>
                  <p className="text-slate-300">Fetching latest events from the blockchain...</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Events Grid */}
          {!loading && filteredEvents.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-semibold text-white">
                  {activeTab === "upcoming" && "Upcoming Events"}
                  {activeTab === "passed" && "Past Events"} 
                  {activeTab === "canceled" && "Canceled Events"}
                  {activeTab === "closed" && "Closed Events"}
                  {searchTerm && (
                    <span className="text-[#dd7e9a] ml-2">
                      matching &quot;{searchTerm}&quot;
                    </span>
                  )}
                </h2>
                <Badge variant="outline" className="border-[#dd7e9a]/50 text-[#dd7e9a]/80">
                  {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[...filteredEvents]
                  .sort((a, b) => (sortBy === "recent" ? b.id - a.id : a.id - b.id))
                  .map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredEvents.length === 0 && (
            <div className="text-center py-20">
              <div className="mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#dd7e9a]/20 to-[#dd7e9a]/20 flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-12 h-12 text-[#dd7e9a]" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">No Events Found</h3>
                <p className="text-xl text-slate-400 max-w-md mx-auto">
                  {searchTerm 
                    ? `No events match your search for "${searchTerm}"`
                    : `No ${activeTab} events are currently available`
                  }
                </p>
              </div>
              
              {searchTerm && (
                <Button
                  onClick={() => setSearchTerm("")}
                  className="bg-gradient-to-r from-[#dd7e9a] to-[#dd7e9a] hover:from-[#c06b8a] hover:to-[#c06b8a]"
                >
                  Clear Search
                </Button>
              )}
              
              {!searchTerm && events.length === 0 && (
                <Card className="bg-slate-800/30 border-slate-600/50 max-w-lg mx-auto mt-8">
                  <CardContent className="p-6">
                    <p className="text-slate-400 mb-4">Be the first to create an event!</p>
                    <Button
                      onClick={() => router.push("/create-event")}
                      className="bg-gradient-to-r from-[#dd7e9a] to-[#dd7e9a] hover:from-[#c06b8a] hover:to-[#c06b8a]"
                    >
                      Create Event
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          {/* Platform Stats */}
          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="bg-gradient-to-br from-slate-800/60 to-[#dd7e9a]/30 border-[#dd7e9a]/30 backdrop-blur-sm hover:border-[#dd7e9a]/50 transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#dd7e9a] to-[#dd7e9a] flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-[#dd7e9a] to-[#dd7e9a] bg-clip-text text-transparent mb-2">
                    {totalTickets ? Number(totalTickets) : 0}
                  </div>
                  <div className="text-slate-400 font-medium">Total Events Created</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-800/60 to-green-900/30 border-green-500/30 backdrop-blur-sm hover:border-green-400/50 transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                    {events.filter(e => e.status === "upcoming").length}
                  </div>
                  <div className="text-slate-400 font-medium">Active Events</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-800/60 to-blue-900/30 border-blue-500/30 backdrop-blur-sm hover:border-blue-400/50 transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#dd7e9a] to-[#dd7e9a] flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-[#dd7e9a] to-[#dd7e9a] bg-clip-text text-transparent mb-2">
                    {events.reduce((sum, e) => sum + e.attendees, 0).toLocaleString()}
                  </div>
                  <div className="text-slate-400 font-medium">Total Capacity</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-800/60 to-yellow-900/30 border-yellow-500/30 backdrop-blur-sm hover:border-yellow-400/50 transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
                    Zero
                  </div>
                  <div className="text-slate-400 font-medium">Fraud Cases</div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}