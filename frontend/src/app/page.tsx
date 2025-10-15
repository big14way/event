"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Calendar, MapPin, Users, Ticket, Star, Shield, Zap, Globe, RefreshCw, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import Image from "next/image"
import Link from "next/link"
import { useMarketplaceEvents } from "@/hooks/use-marketplace-events"
import { EventCard } from "@/components/event-card"
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function Home() {
  const { isConnected } = useAccount()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const { getFeaturedEvents, loading: eventsLoading } = useMarketplaceEvents()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    if (isConnected) {
      router.push("/dashboard")
    }
  }, [isConnected, router])

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ 
      behavior: "smooth",
      block: "start"
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden mb-6">
      {/* Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden min-h-screen flex items-center bg-[#242424]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 animate-gradient" />

        {/* Enhanced Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full animate-float blur-sm" />
        <div className="absolute top-40 right-20 w-16 h-16 bg-secondary/20 rounded-full animate-float animate-delay-200 blur-sm" />
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-primary/30 rounded-full animate-float animate-delay-400 blur-sm" />
        <div className="absolute top-1/2 right-1/4 w-8 h-8 bg-[#dd7e9a]/20 rounded-full animate-float animate-delay-600 blur-sm" />
        <div className="absolute bottom-40 right-10 w-14 h-14 bg-[#dd7e9a]/20 rounded-full animate-float animate-delay-800 blur-sm" />

        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <h1 className="text-3xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                The Future of{' '}
                <span className="bg-clip-text text-[#3a8d25]">
                  Event Ticketing
                </span>
              </h1>
            </div>

            <div className={`transition-all duration-1000 delay-200 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-10 max-w-4xl mx-auto leading-relaxed">
                Secure, transparent, and fraud-proof NFT tickets on the blockchain. Own your tickets, trade freely, and
                never worry about counterfeits again.
              </p>
            </div>

            <div className={`transition-all duration-1000 delay-400 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                {/* <WalletConnectButton className="w-full sm:w-auto min-w-[220px] text-lg px-8 py-4 animate-pulse-glow h-14 rounded-full bg-gradient-to-r from-[#dd7e9a] to-[#dd7e9a] hover:from-[#c06b8a] hover:to-[#c06b8a] shadow-lg shadow-[#dd7e9a]/25 transition-all duration-300" /> */}
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-gradient-to-r from-[#dd7e9a] to-[#dd7e9a] hover:from-[#c06b8a] hover:to-[#c06b8a] text-white transition-all duration-200 hover:shadow-lg hover:shadow-[#dd7e9a]/25"
                  onClick={() => scrollToSection("how-it-works")}
                >
                  Learn More <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Enhanced Stats */}
            <div className={`transition-all duration-1000 delay-600 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
                <div className="text-center group">
                  <div className="text-4xl md:text-5xl font-bold gradient-text animate-bounce-in bg-gradient-to-r from-[#dd7e9a] to-[#dd7e9a] bg-clip-text text-transparent mb-2">
                    10K+
                  </div>
                  <div className="text-sm md:text-base text-muted-foreground group-hover:text-white transition-colors">
                    Events Created
                  </div>
                </div>
                <div className="text-center group">
                  <div className="text-4xl md:text-5xl font-bold gradient-text animate-bounce-in animate-delay-200 bg-gradient-to-r from-[#dd7e9a] to-[#c06b8a] bg-clip-text text-transparent mb-2">
                    500K+
                  </div>
                  <div className="text-sm md:text-base text-muted-foreground group-hover:text-white transition-colors">
                    Tickets Sold
                  </div>
                </div>
                <div className="text-center group">
                  <div className="text-4xl md:text-5xl font-bold gradient-text animate-bounce-in animate-delay-400 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-2">
                    Zero
                  </div>
                  <div className="text-sm md:text-base text-muted-foreground group-hover:text-white transition-colors">
                    Counterfeits
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown 
              className="h-8 w-8 text-muted-foreground cursor-pointer hover:text-white transition-colors"
              onClick={() => scrollToSection("featured-events")}
            />
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section id="featured-events" className="py-20 px-4 bg-[#1a1a1a]">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-[#3a8d25] mb-3">
              Featured Events
            </h2>
            <p className="text-md text-muted-foreground max-w-2xl mx-auto">
              Discover amazing events from top organizers around the world
            </p>
          </div>

          {/* Featured Events Grid */}
          {eventsLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-[#dd7e9a] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading featured events...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {getFeaturedEvents(4).length > 0 ? (
                getFeaturedEvents(4).map((event) => (
                  <EventCard key={event.id} event={event} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Featured Events</h3>
                  <p className="text-muted-foreground mb-6">
                    Be the first to create an amazing event!
                  </p>
                  <Button
                    onClick={() => router.push('/create-event')}
                    className="bg-gradient-to-r from-[#dd7e9a] to-[#dd7e9a] hover:from-[#c06b8a] hover:to-[#c06b8a]"
                  >
                    Create Event
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="text-center mt-12">
            {isConnected ? (
              <Button
                variant="secondary"
                size="lg"
                className="bg-gradient-to-r from-[#dd7e9a] to-[#dd7e9a] hover:from-[#c06b8a] hover:to-[#c06b8a] text-white transition-all duration-200 hover:shadow-lg hover:shadow-[#dd7e9a]/25"
                onClick={() => router.push('/marketplace')}
              >
                View All Events <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-gradient-to-r from-[#dd7e9a] to-[#dd7e9a] hover:from-[#c06b8a] hover:to-[#c06b8a] text-white transition-all duration-200 hover:shadow-lg hover:shadow-[#dd7e9a]/25"
                    onClick={openConnectModal}
                  >
                    View All Events <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                )}
              </ConnectButton.Custom>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-[#1a1a1a]">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-[#3a8d25] mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to secure, verifiable event tickets
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-[#dd7e9a] to-[#c06b8a] rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform animate-pulse-glow shadow-xl shadow-[#dd7e9a]/30">
                  <Ticket className="h-12 w-12 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Buy NFT Tickets</h3>
              <p className="text-muted-foreground leading-relaxed">
                Connect your wallet and purchase authentic NFT tickets directly from event organizers. Each ticket is
                unique and stored on the blockchain.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-[#dd7e9a] to-[#c06b8a] rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform animate-pulse-glow animate-delay-200 shadow-xl shadow-[#dd7e9a]/30">
                  <Shield className="h-12 w-12 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Store Securely</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your tickets are safely stored in your crypto wallet. No more lost tickets or worrying about screenshots
                - your ownership is cryptographically verified.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-[#dd7e9a] to-[#c06b8a] rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform animate-pulse-glow animate-delay-400 shadow-xl shadow-[#dd7e9a]/30">
                  <Globe className="h-12 w-12 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Use & Trade</h3>
              <p className="text-muted-foreground leading-relaxed">
                Present your QR code at the event for instant verification. Transfer or resell your tickets anytime with
                full transparency and zero fraud risk.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 bg-[#1a1a1a]">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-[#3a8d25] mb-4">
              Why Choose EventBase?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Revolutionary features that make event ticketing better for everyone
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mx-20">
            <Card className="text-center p-4 hover:scale-105 duration-300 bg-[#dd7e9a]/20 border-[#dd7e9a]/30 hover:shadow-xl">
              <Shield className="h-16 w-16 text-[#dd7e9a] mx-auto mb-6 animate-pulse-glow" />
              <h3 className="text-xl font-semibold mb-4 text-white">100% Secure</h3>
              <p className="text-sm text-[#dd7e9a]/80 leading-relaxed">
                Blockchain-verified authenticity eliminates all counterfeiting risks
              </p>
            </Card>

            <Card className="text-center p-4 hover:scale-105 duration-300 bg-[#dd7e9a]/20 border-[#dd7e9a]/30 hover:shadow-xl">
              <Zap className="h-16 w-16 text-[#dd7e9a] mx-auto mb-6 animate-pulse-glow animate-delay-200" />
              <h3 className="text-xl font-semibold mb-4 text-white">Zero Fees</h3>
              <p className="text-sm text-[#dd7e9a]/80 leading-relaxed">
                No platform fees - organizers keep 100% of ticket sales revenue
              </p>
            </Card>

            <Card className="text-center p-4 hover:scale-105 duration-300 bg-[#dd7e9a]/20 border-[#dd7e9a]/30 hover:shadow-xl">
              <RefreshCw className="h-16 w-16 text-[#dd7e9a] mx-auto mb-6 animate-pulse-glow animate-delay-400" />
              <h3 className="text-xl font-semibold mb-4 text-white">Free Trading</h3>
              <p className="text-sm text-[#dd7e9a]/80 leading-relaxed">
                Transfer and resell tickets freely with transparent pricing
              </p>
            </Card>

            <Card className="text-center p-8 hover:scale-105 duration-300 bg-[#dd7e9a]/20 border-[#dd7e9a]/30 hover:shadow-xl">
              <Star className="h-16 w-16 text-[#dd7e9a] mx-auto mb-6 animate-pulse-glow animate-delay-600" />
              <h3 className="text-xl font-semibold mb-4 text-white">Own Forever</h3>
              <p className="text-sm text-[#dd7e9a]/80 leading-relaxed">
                Keep your tickets as collectible NFTs with permanent ownership
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 pt-4 border-t border-border bg-[#242424]">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between text-center">
            <div>
              <div className="flex items-center justify-center space-x-3">
                <Image src="/EventBase-logo.png" alt="EventBase" width={40} height={40} className="rounded-lg" />
                <span className="text-2xl font-bold bg-gradient-to-r from-[#dd7e9a] to-[#dd7e9a] bg-clip-text text-transparent">
                  EventBase
                </span>
              </div>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
                The future of event ticketing is here. Secure, transparent, and decentralized.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
              <Link href="https://github.com/EventBase10/EventBase-Ticket/edit/main/README.md" target="_blank" className="hover:text-primary transition-colors hover:underline">
                Documentation
              </Link>
              <Link href="/resources" className="hover:text-primary transition-colors hover:underline">
                Resources
              </Link>
              <Link href="#" className="hover:text-primary transition-colors hover:underline">
                Support
              </Link>
              <Link href="#" className="hover:text-primary transition-colors hover:underline">
                Privacy
              </Link>
            </div>
          </div>
          
          <div className="text-center pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} EventBase. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}