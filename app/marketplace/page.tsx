"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, MapPin, Calendar, Star, Heart, ArrowUpDown, Ticket } from "lucide-react"
import Link from "next/link"

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
    id: 2,
    title: "Real Madrid vs Barcelona",
    date: "Jan 15, 2025",
    time: "3:00 PM",
    venue: "Santiago Bernabéu",
    location: "Madrid, Spain",
    price: 3200,
    originalPrice: 3200,
    section: "Tribune Nord",
    row: "Row 8",
    seats: "Seats 15-16",
    seller: "MadridFan",
    sellerRating: 4.8,
    category: "Soccer",
    image: "/soccer-stadium-match.png",
    verified: true,
    trending: false,
  },
  {
    id: 3,
    title: "Chiefs vs Bills",
    date: "Feb 2, 2025",
    time: "6:30 PM",
    venue: "Arrowhead Stadium",
    location: "Kansas City, MO",
    price: 4100,
    originalPrice: 4500,
    section: "Lower Level 134",
    row: "Row 25",
    seats: "Seats 1-2",
    seller: "ChiefsKingdom",
    sellerRating: 5.0,
    category: "Football",
    image: "/american-football-stadium.png",
    verified: true,
    trending: true,
  },
  {
    id: 4,
    title: "Celtics vs Heat",
    date: "Dec 28, 2024",
    time: "7:30 PM",
    venue: "TD Garden",
    location: "Boston, MA",
    price: 1800,
    originalPrice: 2200,
    section: "Balcony 301",
    row: "Row 5",
    seats: "Seats 10-11",
    seller: "BostonSports",
    sellerRating: 4.7,
    category: "Basketball",
    image: "/basketball-arena.png",
    verified: true,
    trending: false,
  },
  {
    id: 5,
    title: "Manchester United vs Liverpool",
    date: "Jan 20, 2025",
    time: "4:30 PM",
    venue: "Old Trafford",
    location: "Manchester, UK",
    price: 2800,
    originalPrice: 2800,
    section: "Stretford End",
    row: "Row 15",
    seats: "Seats 8-9",
    seller: "RedDevil",
    sellerRating: 4.9,
    category: "Soccer",
    image: "/soccer-stadium-match.png",
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

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [favorites, setFavorites] = useState<number[]>([])

  const toggleFavorite = (ticketId: number) => {
    setFavorites((prev) => (prev.includes(ticketId) ? prev.filter((id) => id !== ticketId) : [...prev, ticketId]))
  }

  const filteredTickets = mockTickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.location.toLowerCase().includes(searchQuery.toLowerCase())
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
          <Link href="/" className="flex items-center gap-2">
            <Ticket className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-sans text-foreground">truefanz Pro</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/marketplace" className="text-primary font-medium">
              Marketplace
            </Link>
            <Link href="/teams" className="text-muted-foreground hover:text-foreground transition-colors">
              Official Teams
            </Link>
            <Link href="/wallet" className="text-muted-foreground hover:text-foreground transition-colors">
              CHZ Wallet
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              Sell Tickets
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-sans mb-2 text-foreground">Ticket Marketplace</h1>
          <p className="text-xl text-muted-foreground font-serif">
            Discover and exchange sports tickets with verified sellers worldwide
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
            <TabsTrigger value="trending">Trending ({sortedTickets.filter((t) => t.trending).length})</TabsTrigger>
            <TabsTrigger value="favorites">Favorites ({favorites.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <TicketGrid tickets={sortedTickets} favorites={favorites} onToggleFavorite={toggleFavorite} />
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

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-muted-foreground">{ticket.sellerRating}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">by {ticket.seller}</span>
                </div>
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
