"use client"

import { useAccount, useBalance } from "wagmi"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, ShoppingBag, TicketIcon, Activity, Users, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"
import { useRecentTickets, useUserTickets, formatPrice } from "@/hooks/use-contracts"
import { useMemo, useEffect, useState } from "react"
import { formatEther } from "viem"
import { toast } from "react-toastify"
import { EventTicketingAbi, EventTicketingAddress } from "@/lib/abiAndAddress"
import { useReadContract, useReadContracts } from "wagmi"
import { useUserStats } from "@/hooks/use-user-stats"

export default function Dashboard() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const { userStats, loading: userStatsLoading } = useUserStats()

  // Get total tickets count
  const { data: totalTickets, isLoading: loadingTotalTickets } = useReadContract({
    address: EventTicketingAddress,
    abi: EventTicketingAbi,
    functionName: 'getTotalTickets',
  })

  // Get recent tickets data
  const { data: recentTicketsData, isLoading: loadingRecentTickets } = useReadContract({
    address: EventTicketingAddress,
    abi: EventTicketingAbi,
    functionName: 'getRecentTickets',
  })


  // Stats cards data
  const stats = useMemo(() => [
    {
      label: "Events Attended",
      value: userStats.attendedEvents.toString(),
      change: userStats.attendedEvents > 0 ? "Based on ticket ownership" : "Connect to see your events",
      icon: Calendar,
      color: "from-[#dd7e9a] to-[#dd7e9a]"
    },
    {
      label: "Total Spent",
      value: `${Number(userStats.totalSpent).toFixed(2)} BASE`,
      change: userStats.attendedEvents > 0 ? "Based on ticket ownership" : "No purchases yet",
      icon: DollarSign,
      color: "from-green-500 to-emerald-500"
    },
    {
      label: "Events Created",
      value: userStats.createdEvents.toString(),
      change: userStats.createdEvents > 0 ? 
        `${userStats.createdEvents} events launched` : "Create your first event",
      icon: Plus,
      color: "from-[#dd7e9a] to-[#dd7e9a]"
    },
    {
      label: "Revenue Earned",
      value: `${userStats.totalRevenue} BASE`,
      change: userStats.createdEvents > 0 ? 
        `From ${userStats.createdEvents} events` : "No revenue yet",
      icon: Users,
      color: "from-orange-500 to-red-500"
    },
  ], [userStats])

  interface Ticket {
    id: bigint;
    creator: string;
    eventName: string;
    eventTimestamp: bigint;
    price: bigint;
    canceled: boolean;
    closed: boolean;
    passed: boolean;
    sold: bigint;
    maxSupply: bigint;
    totalCollected: bigint;
  }

  // Generate recent activity from tickets data
  const recentActivity = useMemo(() => {
    if (!recentTicketsData || !address) return []
    
    const tickets = recentTicketsData as unknown[]
    
    return tickets
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((ticket: any) => ticket.creator.toLowerCase() === address.toLowerCase())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => new Date(Number(b.eventTimestamp)).getTime() - new Date(Number(a.eventTimestamp)).getTime())
      .slice(0, 5)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((ticket: any) => ({
        id: Number(ticket.id),
        action: ticket.canceled ? `Canceled ${ticket.eventName}` : `Created ${ticket.eventName}`,
        time: new Date(Number(ticket.eventTimestamp) * 1000).toLocaleDateString(),
        amount: `${formatEther(ticket.price)} BASE`,
        type: ticket.canceled ? "cancel" : "create",
        status: ticket.closed ? "Closed" : ticket.canceled ? "Canceled" : ticket.passed ? "Passed": ticket.sold >= ticket.maxSupply ? "Sold Out" : "Active",
        sold: Number(ticket.sold),
        maxSupply: Number(ticket.maxSupply)
      }))
  }, [recentTicketsData, address])

  // Platform stats
  const platformStats = useMemo(() => {
    if (!recentTicketsData) return null
    
    const tickets = recentTicketsData as unknown[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeEvents = tickets.filter((t: any) => !t.closed && !t.canceled && !t.passed).length
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalSold = tickets.reduce((sum: number, t: any) => sum + Number(t.sold), 0)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalRevenue = tickets.reduce((sum: number, t: any) => sum + Number(t.totalCollected), 0)
    
    return {
      totalEvents: tickets.length,
      activeEvents,
      totalTicketsSold: totalSold,
      totalPlatformRevenue: formatEther(BigInt(totalRevenue))
    }
  }, [recentTicketsData])

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push("/")
    }
  }, [isConnected, router])

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""

  const quickActions = [
    {
      title: "Marketplace",
      description: "Browse and purchase event tickets",
      icon: ShoppingBag,
      href: "/marketplace",
      gradient: "from-[#dd7e9a] to-[#dd7e9a]",
    },
    {
      title: "My Tickets",
      description: "View and manage your NFT tickets",
      icon: TicketIcon,
      href: "/tickets",
      gradient: "from-[#dd7e9a] to-[#dd7e9a]",
    },
    {
      title: "Create Event",
      description: "Launch your own ticketed event",
      icon: Plus,
      href: "/create-event",
      gradient: "from-[#dd7e9a] to-[#dd7e9a]",
    },
  ]

  return (
    <div className="min-h-screen bg-[#252525] text-foreground pt-12">
      <div className="pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-6xl font-bold mb-4">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-[#dd7e9a] to-[#dd7e9a] bg-clip-text text-transparent">
                {shortAddress}
              </span>
            </h1>
            <p className="text-slate-300 text-xl">Manage your events and tickets on the decentralized web</p>
          </div>

          {/* Platform Overview */}
          {platformStats && (
            <div className="mb-12">
              <h2 className="text-3xl font-semibold mb-6 bg-gradient-to-r from-[#dd7e9a] to-[#dd7e9a] bg-clip-text text-transparent">
                Platform Overview
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="bg-gradient-to-br from-slate-800/80 to-[#dd7e9a]/30 border-[#dd7e9a]/30">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-white">{platformStats.totalEvents}</p>
                    <p className="text-slate-300 text-sm">Total Events</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-slate-800/80 to-blue-900/30 border-blue-500/30">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-white">{platformStats.activeEvents}</p>
                    <p className="text-slate-300 text-sm">Active Events</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-slate-800/80 to-green-900/30 border-green-500/30">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-white">{platformStats.totalTicketsSold}</p>
                    <p className="text-slate-300 text-sm">Tickets Sold</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-slate-800/80 to-orange-900/30 border-orange-500/30">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-white">{platformStats.totalPlatformRevenue}</p>
                    <p className="text-slate-300 text-sm">Platform Revenue (BASE)</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Personal Stats */}
          <div className="mb-12">
            <h2 className="text-3xl font-semibold mb-6 bg-gradient-to-r from-[#dd7e9a] to-[#dd7e9a] bg-clip-text text-transparent">
              Your Stats
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <Card key={index} className="bg-gradient-to-br from-slate-800/80 to-[#dd7e9a]/30 border-[#dd7e9a]/30 overflow-hidden relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10`} />
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <Icon className="h-8 w-8 text-[#dd7e9a]" />
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-white mb-2">
                          {/* {Number(stat.value).toFixed(2)} */}
                          {stat.value}
                        </p>
                        <p className="text-slate-300 font-medium mb-1">{stat.label}</p>
                        <p className="text-green-400 text-sm font-medium">{stat.change}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="mb-12">
            <h2 className="text-3xl font-semibold mb-6 bg-gradient-to-r from-[#dd7e9a] to-[#dd7e9a] bg-clip-text text-transparent">
              Quick Actions
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Link key={index} href={action.href}>
                    <Card className="group cursor-pointer bg-gradient-to-br from-slate-800/80 to-[#dd7e9a]/30 border-[#dd7e9a]/30 overflow-hidden relative hover:border-[#dd7e9a]/60 transition-all duration-300">
                      <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
                      <CardContent className="p-8 text-center relative z-10">
                        <div
                          className={`w-20 h-20 rounded-full bg-gradient-to-br ${action.gradient} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}
                        >
                          <Icon className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-white">{action.title}</h3>
                        <p className="text-slate-300 text-base">{action.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Recent Activity Section */}
          <div>
            <Card className="bg-gradient-to-br from-slate-800/80 to-[#dd7e9a]/30 border-[#dd7e9a]/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white text-2xl">
                  <Activity className="h-6 w-6 text-[#dd7e9a]" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity
                    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
                    .map((activity, index) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-6 bg-slate-700/30 rounded-xl border border-slate-600/30"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${
                            activity.type === 'cancel' ? 'bg-red-400' : 'bg-blue-400'
                          }`} />
                          <div>
                            <p className="text-white font-medium text-lg">{activity.action}</p>
                            <p className="text-slate-400">{activity.time}</p>
                            <p className="text-slate-500 text-sm">
                              {activity.sold}/{activity.maxSupply} tickets sold
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge
                            variant="outline"
                            className={`border-[#dd7e9a]/50 px-4 py-2 ${
                              activity.status === 'Active' 
                                ? 'text-green-300 bg-green-500/10 border-green-500/50'
                                : activity.status === 'Canceled'
                                ? 'text-red-300 bg-red-500/10 border-red-500/50'
                                : activity.status === 'Sold Out'
                                ? 'text-yellow-300 bg-yellow-500/10 border-yellow-500/50'
                                : activity.status === 'Passed'
                                ? 'text-gray-300 bg-gray-500/10 border-gray-500/50'
                                : 'text-gray-300 bg-gray-500/10 border-gray-500/50'
                            }`}
                          >
                            {activity.status}
                          </Badge>
                          <span className="text-[#dd7e9a]/80 font-mono text-sm">
                            {activity.amount}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-400">No recent activity. Create your first event to get started!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}