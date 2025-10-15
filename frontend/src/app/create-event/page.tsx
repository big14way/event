"use client"

import { useState, useEffect } from "react"
import { useAccount } from 'wagmi'
import { useRouter } from "next/navigation"
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Calendar, MapPin, Users, DollarSign, Sparkles, ArrowLeft, Clock, Image, FileText, Coins } from "lucide-react"
import { eventTicketingAddress, eventTicketingAbi } from "@/lib/contracts"
import { toast } from "sonner"

export default function CreateEvent() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    price: "",
    totalSupply: "",
    bannerImage: null as File | null,
  })

  const { writeContract, data: hash, isPending: isSubmitting, error: writeError } = useWriteContract()
  const { isLoading: isTransactionPending, isSuccess: isTransactionSuccess, error: transactionError } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    if (isSubmitting) {
      toast.info("Creating event on blockchain...")
    }
  }, [isSubmitting]) 

  useEffect(() => {
    if (isTransactionPending) {
      toast.info("Transaction is being processed...")
    }
  }, [isTransactionPending])

  useEffect(() => {
    if (isTransactionSuccess) {
      toast.success("Event created successfully on blockchain!")
      router.push("/marketplace")
    }
  }, [isTransactionSuccess, router])

  useEffect(() => {
    if (writeError) {
      toast.error("Transaction denied")
    }
  }, [writeError])

  useEffect(() => {
    if (transactionError) {
      toast.error(`Transaction failed: ${transactionError.message}`)
    }
  }, [transactionError])

  const createTicket = () => {
    if (!formData.title || !formData.description || !formData.date || !formData.time || !formData.location || !formData.price || !formData.totalSupply) {
      toast.error("Please fill in all required fields")
      return
    }

    const price = parseFloat(formData.price)
    const totalSupply = parseInt(formData.totalSupply)
    
    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price greater than 0")
      return
    }
    
    if (isNaN(totalSupply) || totalSupply <= 0) {
      toast.error("Please enter a valid total supply greater than 0")
      return
    }

    // Check if event date is in the future
    const eventDateTime = new Date(`${formData.date}T${formData.time}`)
    if (eventDateTime <= new Date()) {
      toast.error("Event date must be in the future")
      return
    }

    writeContract({
      address: eventTicketingAddress as `0x${string}`,
      abi: eventTicketingAbi,
      functionName: 'createTicket',
      args: [
        BigInt(Math.floor(price * 10**18)),
        formData.title,
        formData.description,
        BigInt(eventDateTime.getTime() / 1000),
        BigInt(totalSupply),
        JSON.stringify({
          bannerImage: formData.bannerImage ? formData.bannerImage.name : "",
          date: formData.date,
          time: formData.time
        }),
        formData.location
      ],
    })
  }

  if (!isConnected) {
    router.push("/")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    createTicket()
  }

  const totalRevenue = formData.price && formData.totalSupply
    ? (Number.parseFloat(formData.price) * Number.parseInt(formData.totalSupply)).toFixed(2)
    : "0"

  const platformFee = formData.price && formData.totalSupply
    ? (Number.parseFloat(totalRevenue) * 0.025).toFixed(2) // 2.5% platform fee
    : "0"

  const yourEarnings = formData.price && formData.totalSupply
    ? (Number.parseFloat(totalRevenue) - Number.parseFloat(platformFee)).toFixed(2)
    : "0"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#dd7e9a]/10 to-slate-900">
      <div className="pb-16 px-4 pt-8">
        <div className="container mx-auto max-w-6xl">
          {/* Header with back button */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#dd7e9a] to-[#dd7e9a] flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-[#dd7e9a] to-[#dd7e9a] bg-clip-text text-transparent">
                  Create Your Event
                </h1>
                <p className="text-slate-300 text-lg mt-2">Launch your next amazing event on the blockchain</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid xl:grid-cols-3 gap-8">
              {/* Left Column - Event Details */}
              <div className="xl:col-span-2 space-y-8">
                {/* Basic Information */}
                <Card className="bg-gradient-to-br from-slate-800/90 to-[#dd7e9a]/20 border-[#dd7e9a]/30 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-white text-2xl">
                      <FileText className="h-6 w-6 text-[#dd7e9a]" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-[#dd7e9a]/80 font-medium flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Event Title *
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder={`Web3 Innovation Summit ${new Date().getFullYear()}`}
                        required
                        className="bg-slate-800/80 border-[#dd7e9a]/30 text-white focus:border-[#dd7e9a] focus:ring-[#dd7e9a]/20 h-12 text-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-[#dd7e9a]/80 font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Description *
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Join us for an incredible journey into the future of Web3 technology. Connect with industry leaders, discover innovative projects, and shape the decentralized future..."
                        rows={6}
                        required
                        className="bg-slate-800/80 border-[#dd7e9a]/30 text-white focus:border-[#dd7e9a] focus:ring-[#dd7e9a]/20 text-base resize-none"
                      />
                      <p className="text-slate-400 text-sm">Tell people what makes your event special</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Event Details */}
                <Card className="bg-gradient-to-br from-slate-800/90 to-blue-900/20 border-blue-500/30 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-white text-2xl">
                      <Calendar className="h-6 w-6 text-blue-400" />
                      Event Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="date" className="text-blue-200 font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Date *
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          required
                          className="bg-slate-800/80 border-blue-500/30 text-white focus:border-blue-400 focus:ring-blue-400/20 h-12 [&::-webkit-calendar-picker-indicator]:invert"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time" className="text-blue-200 font-medium flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Time *
                        </Label>
                        <Input
                          id="time"
                          type="time"
                          value={formData.time}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                          required
                          className="bg-slate-800/80 border-blue-500/30 text-white focus:border-blue-400 focus:ring-blue-400/20 h-12"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-blue-200 font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location *
                      </Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Convention Center, Miami Beach, FL"
                        required
                        className="bg-slate-800/80 border-blue-500/30 text-white focus:border-blue-400 focus:ring-blue-400/20 h-12 text-lg"
                      />
                      <p className="text-slate-400 text-sm">Where will your event take place?</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="banner" className="text-blue-200 font-medium flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        Event Banner
                      </Label>
                      <div 
                        className="border-2 border-dashed border-[#dd7e9a]/50 rounded-xl p-8 text-center bg-gradient-to-br from-[#dd7e9a]/10 to-[#dd7e9a]/10 hover:border-[#dd7e9a]/70 transition-colors cursor-pointer group"
                        onClick={() => document.getElementById('banner')?.click()}
                      >
                        <Upload className="h-12 w-12 text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                        <p className="text-blue-200 font-medium mb-2">
                          {formData.bannerImage ? formData.bannerImage.name : "Upload event banner"}
                        </p>
                        <p className="text-slate-400 text-sm">PNG, JPG up to 10MB</p>
                        <Input
                          id="banner"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => setFormData({ ...formData, bannerImage: e.target.files?.[0] || null })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Ticket Configuration & Summary */}
              <div className="space-y-8">
                {/* Ticket Configuration */}
                <Card className="bg-gradient-to-br from-slate-800/90 to-green-900/20 border-green-500/30 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-white text-2xl">
                      <Coins className="h-6 w-6 text-green-400" />
                      Pricing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-green-200 font-medium flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Price per Ticket *
                      </Label>
                      <div className="relative">
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="25.00 (minimum 0.01)"
                          required
                          className="bg-slate-800/80 border-green-500/30 text-white focus:border-green-400 focus:ring-green-400/20 h-12 text-lg pr-16"
                        />
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-400 font-medium">
                          BASE
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="totalSupply" className="text-green-200 font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Total Tickets *
                      </Label>
                      <Input
                        id="totalSupply"
                        type="number"
                        min="1"
                        value={formData.totalSupply}
                        onChange={(e) => setFormData({ ...formData, totalSupply: e.target.value })}
                        placeholder="1000 (minimum 1)"
                        required
                        className="bg-slate-800/80 border-green-500/30 text-white focus:border-green-400 focus:ring-green-400/20 h-12 text-lg"
                      />
                      <p className="text-slate-400 text-sm">How many people can attend?</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Revenue Summary */}
                <Card className="bg-gradient-to-br from-slate-800/90 to-yellow-900/20 border-yellow-500/30 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-white text-2xl">
                      <DollarSign className="h-6 w-6 text-yellow-400" />
                      Revenue Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                        <span className="text-slate-300">Gross Revenue:</span>
                        <span className="text-white font-mono text-lg">{totalRevenue} BASE</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                        <span className="text-slate-300">Platform Fee (2.5%):</span>
                        <span className="text-red-400 font-mono">-{platformFee} BASE</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-yellow-900/30 to-green-900/30 rounded-lg border border-yellow-500/30">
                        <span className="text-yellow-200 font-medium">Your Earnings:</span>
                        <span className="text-yellow-400 font-bold font-mono text-xl">{yourEarnings} BASE</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Create Button */}
                <Card className="bg-gradient-to-r from-[#dd7e9a]/30 to-[#dd7e9a]/30 border-[#dd7e9a]/30 shadow-2xl">
                  <CardContent className="p-6">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting || isTransactionPending}
                      className="w-full text-lg py-6 bg-gradient-to-r from-[#dd7e9a] via-[#dd7e9a] to-[#dd7e9a] hover:from-[#dd7e9a] hover:via-[#c06b8a] hover:to-[#c06b8a] text-white font-bold shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                    >
                      {isSubmitting || isTransactionPending ? (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Creating Event...
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Sparkles className="h-5 w-5" />
                          Create Event & Launch
                        </div>
                      )}
                    </Button>
                    <p className="text-slate-400 text-sm text-center mt-3">
                      Your event will be deployed to the blockchain
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}