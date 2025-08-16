"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Calendar, Clock, Star, Shield, ArrowLeft, Trophy, Users, Ticket, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

// Mock data - in real app this would come from API
const mockTeam = {
  id: 1,
  name: "Los Angeles Lakers",
  sport: "Basketball",
  league: "NBA",
  city: "Los Angeles",
  venue: "Crypto.com Arena",
  logo: "/placeholder.svg?height=120&width=120&text=LAL",
  coverImage: "/basketball-arena.png",
  verified: true,
  partnership: "Official Partner",
  description: "One of the most successful franchises in NBA history with 17 championships.",
  colors: ["#552583", "#FDB927"],
  stats: {
    championships: 17,
    founded: 1947,
    capacity: 20000,
    fanbase: "2.1M",
  },
  upcomingGames: [
    {
      id: 1,
      opponent: "Golden State Warriors",
      date: "Dec 25, 2024",
      time: "8:00 PM",
      type: "Home",
      importance: "Christmas Day Game",
      ticketsAvailable: 1250,
      priceRange: { min: 1800, max: 8500 },
      sections: [
        { name: "Upper Level", price: 1800, available: 450 },
        { name: "Lower Level", price: 3200, available: 380 },
        { name: "Club Level", price: 5500, available: 180 },
        { name: "Courtside", price: 8500, available: 24 },
      ],
    },
    {
      id: 2,
      opponent: "Boston Celtics",
      date: "Dec 28, 2024",
      time: "7:30 PM",
      type: "Home",
      importance: "Rivalry Game",
      ticketsAvailable: 890,
      priceRange: { min: 2200, max: 9200 },
      sections: [
        { name: "Upper Level", price: 2200, available: 320 },
        { name: "Lower Level", price: 3800, available: 280 },
        { name: "Club Level", price: 6200, available: 150 },
        { name: "Courtside", price: 9200, available: 18 },
      ],
    },
    {
      id: 3,
      opponent: "Miami Heat",
      date: "Jan 3, 2025",
      time: "8:30 PM",
      type: "Home",
      importance: "Regular Season",
      ticketsAvailable: 1450,
      priceRange: { min: 1600, max: 7200 },
      sections: [
        { name: "Upper Level", price: 1600, available: 520 },
        { name: "Lower Level", price: 2800, available: 420 },
        { name: "Club Level", price: 4800, available: 200 },
        { name: "Courtside", price: 7200, available: 28 },
      ],
    },
  ],
}

export default function TeamDetailPage() {
  const params = useParams()
  const [selectedGame, setSelectedGame] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Ticket className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-sans text-foreground">truefanz Pro</span>
          </Link>
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
        {/* Back Button */}
        <Link
          href="/teams"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Teams
        </Link>

        {/* Team Header */}
        <div className="relative rounded-lg overflow-hidden mb-8">
          <div className="aspect-[3/1] bg-muted">
            <img
              src={mockTeam.coverImage || "/placeholder.svg"}
              alt={mockTeam.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 flex items-end gap-4">
            <div className="bg-background/90 backdrop-blur-sm rounded-full p-3">
              <img
                src={mockTeam.logo || "/placeholder.svg"}
                alt={`${mockTeam.name} logo`}
                className="w-16 h-16 rounded-full"
              />
            </div>
            <div className="text-white">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-primary text-primary-foreground">
                  <Shield className="h-3 w-3 mr-1" />
                  {mockTeam.partnership}
                </Badge>
              </div>
              <h1 className="text-4xl font-bold font-sans mb-1">{mockTeam.name}</h1>
              <p className="text-lg font-serif opacity-90">
                {mockTeam.league} • {mockTeam.venue}, {mockTeam.city}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Team Stats */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-sans">Team Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold font-sans">{mockTeam.stats.championships}</p>
                    <p className="text-sm text-muted-foreground font-serif">Championships</p>
                  </div>
                  <div className="text-center">
                    <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold font-sans">{mockTeam.stats.founded}</p>
                    <p className="text-sm text-muted-foreground font-serif">Founded</p>
                  </div>
                  <div className="text-center">
                    <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold font-sans">{mockTeam.stats.capacity.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground font-serif">Capacity</p>
                  </div>
                  <div className="text-center">
                    <Star className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold font-sans">{mockTeam.stats.fanbase}</p>
                    <p className="text-sm text-muted-foreground font-serif">Fans</p>
                  </div>
                </div>
                <Separator className="my-4" />
                <p className="text-muted-foreground font-serif">{mockTeam.description}</p>
              </CardContent>
            </Card>

            {/* Upcoming Games */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-sans">Upcoming Games</CardTitle>
                <CardDescription className="font-serif">Official tickets available at face value</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockTeam.upcomingGames.map((game) => (
                  <div
                    key={game.id}
                    className={`border border-border rounded-lg p-4 transition-all cursor-pointer ${
                      selectedGame === game.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedGame(selectedGame === game.id ? null : game.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold font-sans text-lg">vs {game.opponent}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground font-serif">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {game.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {game.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {game.type}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="mb-2">
                          {game.importance}
                        </Badge>
                        <p className="text-sm text-muted-foreground font-serif">
                          {game.ticketsAvailable} tickets available
                        </p>
                        <p className="font-semibold font-sans">
                          {game.priceRange.min.toLocaleString()} - {game.priceRange.max.toLocaleString()} CHZ
                        </p>
                      </div>
                    </div>

                    {selectedGame === game.id && (
                      <div className="border-t border-border pt-4 mt-4">
                        <h4 className="font-semibold font-sans mb-3">Available Sections</h4>
                        <div className="grid md:grid-cols-2 gap-3">
                          {game.sections.map((section) => (
                            <div
                              key={section.name}
                              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                            >
                              <div>
                                <p className="font-semibold font-sans">{section.name}</p>
                                <p className="text-sm text-muted-foreground font-serif">
                                  {section.available} available
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-primary font-sans">{section.price.toLocaleString()} CHZ</p>
                                <Button size="sm" className="mt-1 bg-primary hover:bg-primary/90">
                                  Select
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Purchase */}
            <Card className="border-border bg-card sticky top-24">
              <CardHeader>
                <CardTitle className="font-sans">Official Team Store</CardTitle>
                <CardDescription className="font-serif">Guaranteed authentic tickets at face value</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="font-serif">100% Authentic Guarantee</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Ticket className="h-4 w-4 text-primary" />
                    <span className="font-serif">Face Value Pricing</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-primary" />
                    <span className="font-serif">Official Team Partnership</span>
                  </div>
                </div>

                <Separator />

                <Button className="w-full bg-primary hover:bg-primary/90">Browse All Games</Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Team Website
                </Button>
              </CardContent>
            </Card>

            {/* Season Info */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-sans">2024-25 Season</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-serif">Games Remaining</span>
                  <span className="font-semibold font-sans">42</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-serif">Home Games</span>
                  <span className="font-semibold font-sans">21</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-serif">Current Record</span>
                  <span className="font-semibold font-sans">18-12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-serif">Conference Rank</span>
                  <span className="font-semibold font-sans">#4 West</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
