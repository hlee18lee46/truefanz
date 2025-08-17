"use client"

import { useEffect, useMemo, useState } from "react"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, MapPin, Calendar, Star, Heart, ArrowUpDown, Ticket } from "lucide-react"
import Link from "next/link"

// ---- ABIs & env
import PSGTicketNFT from "@/lib/abis/PSGTicketNFT.json"
import PrimarySale from "@/lib/abis/PrimarySale.json"
const psgNftAbi = (PSGTicketNFT as any).abi
const saleAbi = (PrimarySale as any).abi

const NFT_ADDRESS  = process.env.NEXT_PUBLIC_PSG_NFT_ADDRESS!
const SALE_ADDRESS = process.env.NEXT_PUBLIC_FIXED_SALE_ADDRESS!
const CHILIZ_RPC   = process.env.NEXT_PUBLIC_CHILIZ_RPC || "https://spicy-rpc.chiliz.com"

// ---- your existing mock data (unchanged)
const mockTickets = [
  {
    id: 1,
    title: "Lakers vs Warriors",
    date: "Dec 25, 2024",
    time: "8:00 PM",
    venue: "Crypto.com Arena",
    location: "Los Angeles, CA",
    price: 2500,
    originalPrice: 3000,
    section: "Section 101",
    row: "Row 12",
    seats: "Seats 5-6",
    seller: "SportsFan2024",
    sellerRating: 4.9,
    category: "Basketball",
    image: "/basketball-arena.png",
    verified: true,
    trending: true,
  },
  {
    id: 6,
    title: "Cowboys vs Giants",
    date: "Jan 8, 2025",
    time: "1:00 PM",
    venue: "AT&T Stadium",
    location: "Arlington, TX",
    price: 3500,
    originalPrice: 4000,
    section: "Club Level 250",
    row: "Row 3",
    seats: "Seats 12-13",
    seller: "CowboysNation",
    sellerRating: 4.6,
    category: "Football",
    image: "/american-football-stadium.png",
    verified: true,
    trending: false,
  },
]

// ---- helpers for IPFS
function ipfsToHttp(u?: string) {
  if (!u) return u
  if (u.startsWith("ipfs://")) {
    const cidPath = u.replace("ipfs://", "")
    return `https://gateway.pinata.cloud/ipfs/${cidPath}`
  }
  return u
}

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [favorites, setFavorites] = useState<number[]>([])
  const [chainTickets, setChainTickets] = useState<typeof mockTickets>([])
  const [loading, setLoading] = useState(true)

  // ---- fetch live listings & append to mock
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const provider = new ethers.providers.JsonRpcProvider(CHILIZ_RPC)
        const sale = new ethers.Contract(SALE_ADDRESS, saleAbi, provider)
        const nft  = new ethers.Contract(NFT_ADDRESS, psgNftAbi, provider)

        // scan known minted token ids (adjust if yours differ)
        const ids = Array.from({ length: 20 }, (_, i) => i)

        const results: typeof mockTickets = []
        for (const tid of ids) {
          const priceWei: ethers.BigNumber = await sale.priceOf(tid)
          if (priceWei.gt(0)) {
            // try to load basic metadata
            let name = `PSG Ticket #${tid}`
            let image: string | undefined
            try {
              const uri: string = await nft.tokenURI(tid)
              const metaUrl = ipfsToHttp(uri)
              const meta = await fetch(metaUrl!).then(r => r.json()).catch(() => null)
              if (meta?.name) name = meta.name
              if (meta?.image) image = ipfsToHttp(meta.image)
            } catch {}

            const priceCHZ = Number(ethers.utils.formatUnits(priceWei, 18))

            // map to your card shape; keep id space separate to avoid clashing with mock ids
            results.push({
              id: 10_000 + tid,
              title: name,
              date: "Jan 15, 2025",
              time: "7:00 PM",
              venue: "Parc des Princes",
              location: "Paris, FR",
              price: priceCHZ,
              originalPrice: priceCHZ,
              section: "Section A",
              row: `Row ${Math.floor(tid / 5) + 1}`,
              seats: `Seat ${(tid % 5) + 1}`,
              seller: "PSG Official",
              sellerRating: 5.0,
              category: "Soccer",
              image: image || "/soccer-stadium-match.png",
              verified: true,
              trending: tid < 5,
            })
          }
        }

        if (mounted) setChainTickets(results)
      } catch (e) {
        console.error("Failed to load on-chain listings:", e)
        if (mounted) setChainTickets([])
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const allTickets = useMemo(() => [...mockTickets, ...chainTickets], [chainTickets])

  const toggleFavorite = (ticketId: number) => {
    setFavorites((prev) => (prev.includes(ticketId) ? prev.filter((id) => id !== ticketId) : [...prev, ticketId]))
  }

  const filteredTickets = allTickets.filter((ticket) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      ticket.title.toLowerCase().includes(q) ||
      ticket.venue.toLowerCase().includes(q) ||
      ticket.location.toLowerCase().includes(q)
    const matchesCategory = selectedCategory === "all" || ticket.category.toLowerCase() === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "date":
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      default:
        return 0
    }
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-2">
            <Ticket className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-sans text-foreground">truefanz Pro</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/marketplace" className="text-primary font-medium">
              Marketplace
            </Link>

                              <Link href="/my-tickets" className="hover:text-foreground transition-colors">
                                My Tickets
                              </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/sell">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Sell Tickets
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-sans mb-2 text-foreground">Ticket Marketplace</h1>
          <p className="text-xl text-muted-foreground font-serif">
            Get your game ticket from your team, say no to ticket-resellers.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search events, teams, or venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg bg-card border-border focus:border-primary"
              />
            </div>
            <div className="flex gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40 bg-card">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  <SelectItem value="basketball">Basketball</SelectItem>
                  <SelectItem value="soccer">Soccer</SelectItem>
                  <SelectItem value="football">Football</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 bg-card">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="all">All Tickets ({sortedTickets.length})</TabsTrigger>
            <TabsTrigger value="trending">
              Trending ({sortedTickets.filter((t) => t.trending).length})
            </TabsTrigger>
            <TabsTrigger value="favorites">Favorites ({favorites.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {loading ? (
              <div className="text-center text-muted-foreground py-12">Loading on-chain listings…</div>
            ) : (
              <TicketGrid tickets={sortedTickets} favorites={favorites} onToggleFavorite={toggleFavorite} />
            )}
          </TabsContent>

          <TabsContent value="trending" className="mt-6">
            <TicketGrid
              tickets={sortedTickets.filter((ticket) => ticket.trending)}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
            <TicketGrid
              tickets={sortedTickets.filter((ticket) => favorites.includes(ticket.id))}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function TicketGrid({
  tickets,
  favorites,
  onToggleFavorite,
}: {
  tickets: typeof mockTickets
  favorites: number[]
  onToggleFavorite: (id: number) => void
}) {
  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <Ticket className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold font-sans mb-2">No tickets found</h3>
        <p className="text-muted-foreground font-serif">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tickets.map((ticket) => (
        <Card
          key={ticket.id}
          className="border-border bg-card hover:shadow-lg transition-all duration-200 overflow-hidden group"
        >
          <div className="relative">
            <div className="aspect-video bg-muted">
              <img
                src={ticket.image || "/placeholder.svg"}
                alt={ticket.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <div className="absolute top-3 left-3 flex gap-2">
              {ticket.trending && <Badge className="bg-destructive text-destructive-foreground">Trending</Badge>}
              {ticket.verified && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  Verified
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 bg-background/80 hover:bg-background"
              onClick={() => onToggleFavorite(ticket.id)}
            >
              <Heart
                className={`h-4 w-4 ${
                  favorites.includes(ticket.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"
                }`}
              />
            </Button>
          </div>

          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="font-sans text-lg mb-1">{ticket.title}</CardTitle>
                <CardDescription className="font-serif text-sm">
                  <div className="flex items-center gap-1 mb-1">
                    <Calendar className="h-3 w-3" />
                    {ticket.date} • {ticket.time}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {ticket.venue}, {ticket.location}
                  </div>
                </CardDescription>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="text-sm text-muted-foreground font-serif">
                {ticket.section} • {ticket.row} • {ticket.seats}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary font-sans">
                      {ticket.price.toLocaleString()} CHZ
                    </span>
                    {ticket.originalPrice > ticket.price && (
                      <span className="text-sm text-muted-foreground line-through">
                        {ticket.originalPrice.toLocaleString()} CHZ
                      </span>
                    )}
                  </div>
                  {ticket.originalPrice > ticket.price && (
                    <div className="text-xs text-green-600 font-medium">
                      Save {(((ticket.originalPrice - ticket.price) / ticket.originalPrice) * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
                <Link href={`/marketplace/${ticket.id}`}>
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
