"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Calendar, Shield, Ticket, Trophy, Users } from "lucide-react"
import Link from "next/link"

const mockTeams = [
  {
    id: 1,
    name: "Los Angeles Lakers",
    sport: "Basketball",
    league: "NBA",
    city: "Los Angeles",
    venue: "Crypto.com Arena",
    logo: "/placeholder.svg?height=80&width=80&text=LAL",
    coverImage: "/basketball-arena.png",
    verified: true,
    partnership: "Official Partner",
    upcomingGames: 8,
    avgPrice: 2200,
    description: "One of the most successful franchises in NBA history with 17 championships.",
    colors: ["#552583", "#FDB927"],
  },
  {
    id: 2,
    name: "Real Madrid",
    sport: "Soccer",
    league: "La Liga",
    city: "Madrid",
    venue: "Santiago Bernabéu",
    logo: "/placeholder.svg?height=80&width=80&text=RM",
    coverImage: "/soccer-stadium-match.png",
    verified: true,
    partnership: "Official Partner",
    upcomingGames: 12,
    avgPrice: 3500,
    description: "The most successful club in European football with 14 Champions League titles.",
    colors: ["#FFFFFF", "#00529F"],
  },
  {
    id: 3,
    name: "Kansas City Chiefs",
    sport: "Football",
    league: "NFL",
    city: "Kansas City",
    venue: "Arrowhead Stadium",
    logo: "/placeholder.svg?height=80&width=80&text=KC",
    coverImage: "/american-football-stadium.png",
    verified: true,
    partnership: "Official Partner",
    upcomingGames: 6,
    avgPrice: 4200,
    description: "Super Bowl champions known for their explosive offense and passionate fanbase.",
    colors: ["#E31837", "#FFB81C"],
  },
  {
    id: 4,
    name: "Boston Celtics",
    sport: "Basketball",
    league: "NBA",
    city: "Boston",
    venue: "TD Garden",
    logo: "/placeholder.svg?height=80&width=80&text=BOS",
    coverImage: "/basketball-arena.png",
    verified: true,
    partnership: "Official Partner",
    upcomingGames: 9,
    avgPrice: 1900,
    description: "Historic franchise with 17 NBA championships and legendary Celtic pride.",
    colors: ["#007A33", "#BA9653"],
  },
  {
    id: 5,
    name: "Manchester United",
    sport: "Soccer",
    league: "Premier League",
    city: "Manchester",
    venue: "Old Trafford",
    logo: "/placeholder.svg?height=80&width=80&text=MU",
    coverImage: "/soccer-stadium-match.png",
    verified: true,
    partnership: "Official Partner",
    upcomingGames: 11,
    avgPrice: 2800,
    description: "One of the most successful English clubs with a global fanbase.",
    colors: ["#DA020E", "#FBE122"],
  },
  {
    id: 6,
    name: "Dallas Cowboys",
    sport: "Football",
    league: "NFL",
    city: "Dallas",
    venue: "AT&T Stadium",
    logo: "/placeholder.svg?height=80&width=80&text=DAL",
    coverImage: "/american-football-stadium.png",
    verified: true,
    partnership: "Official Partner",
    upcomingGames: 5,
    avgPrice: 3800,
    description: "America's Team with a rich history and state-of-the-art stadium.",
    colors: ["#003594", "#869397"],
  },
]

export default function TeamsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSport, setSelectedSport] = useState("all")
  const [selectedLeague, setSelectedLeague] = useState("all")

  const filteredTeams = mockTeams.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.venue.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSport = selectedSport === "all" || team.sport.toLowerCase() === selectedSport
    const matchesLeague = selectedLeague === "all" || team.league.toLowerCase() === selectedLeague
    return matchesSearch && matchesSport && matchesLeague
  })

  const leagues = Array.from(new Set(mockTeams.map((team) => team.league)))

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
            <Link href="/marketplace" className="text-muted-foreground hover:text-foreground transition-colors">
              Marketplace
            </Link>
            <Link href="/teams" className="text-primary font-medium">
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
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-6 w-6 text-primary" />
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              Official Partners
            </Badge>
          </div>
          <h1 className="text-4xl font-bold font-sans mb-2 text-foreground">Professional Sports Teams</h1>
          <p className="text-xl text-muted-foreground font-serif">
            Buy tickets directly from official team sources at face value with guaranteed authenticity
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search teams, cities, or venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg bg-card border-border focus:border-primary"
              />
            </div>
            <div className="flex gap-3">
              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger className="w-40 bg-card">
                  <SelectValue placeholder="Sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  <SelectItem value="basketball">Basketball</SelectItem>
                  <SelectItem value="soccer">Soccer</SelectItem>
                  <SelectItem value="football">Football</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedLeague} onValueChange={setSelectedLeague}>
                <SelectTrigger className="w-40 bg-card">
                  <SelectValue placeholder="League" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leagues</SelectItem>
                  {leagues.map((league) => (
                    <SelectItem key={league} value={league.toLowerCase()}>
                      {league}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold font-sans">{filteredTeams.length}</p>
                  <p className="text-sm text-muted-foreground font-serif">Partner Teams</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold font-sans">
                    {filteredTeams.reduce((sum, team) => sum + team.upcomingGames, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground font-serif">Upcoming Games</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold font-sans">100%</p>
                  <p className="text-sm text-muted-foreground font-serif">Verified</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold font-sans">2.4M+</p>
                  <p className="text-sm text-muted-foreground font-serif">Fans Served</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teams Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <Card
              key={team.id}
              className="border-border bg-card hover:shadow-lg transition-all duration-200 overflow-hidden group"
            >
              <div className="relative">
                <div className="aspect-video bg-muted">
                  <img
                    src={team.coverImage || "/placeholder.svg"}
                    alt={team.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="absolute top-3 left-3">
                  <Badge className="bg-primary text-primary-foreground">
                    <Shield className="h-3 w-3 mr-1" />
                    {team.partnership}
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-3">
                  <div className="bg-background/90 backdrop-blur-sm rounded-full p-2">
                    <img
                      src={team.logo || "/placeholder.svg"}
                      alt={`${team.name} logo`}
                      className="w-12 h-12 rounded-full"
                    />
                  </div>
                </div>
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="font-sans text-lg mb-1">{team.name}</CardTitle>
                    <CardDescription className="font-serif text-sm">
                      <div className="flex items-center gap-1 mb-1">
                        <Trophy className="h-3 w-3" />
                        {team.league} • {team.sport}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {team.venue}, {team.city}
                      </div>
                    </CardDescription>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground font-serif mt-2">{team.description}</p>

                <div className="flex items-center justify-between pt-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground font-serif">{team.upcomingGames} upcoming games</div>
                    <div className="text-sm text-muted-foreground font-serif">
                      From {team.avgPrice.toLocaleString()} CHZ
                    </div>
                  </div>
                  <Link href={`/teams/${team.id}`}>
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      View Games
                    </Button>
                  </Link>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {filteredTeams.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold font-sans mb-2">No teams found</h3>
            <p className="text-muted-foreground font-serif">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
