"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SecureQRModal } from "@/components/secure-qr-modal"
import { Calendar, MapPin, Ticket, QrCode, Shield, Download, Share2, AlertTriangle } from "lucide-react"
import Link from "next/link"

const mockUserTickets = [
  {
    id: "TKT-001",
    title: "Lakers vs Warriors",
    date: "Dec 25, 2024",
    time: "8:00 PM",
    venue: "Crypto.com Arena",
    location: "Los Angeles, CA",
    section: "Section 101",
    row: "Row 12",
    seats: "Seats 5-6",
    price: 2500,
    purchaseDate: "2024-12-20",
    status: "active",
    image: "/basketball-arena.png",
    qrEnabled: true,
    transferable: true,
    category: "Basketball",
    eventDate: "2024-12-25",
  },
  {
    id: "TKT-002",
    title: "Real Madrid vs Barcelona",
    date: "Jan 15, 2025",
    time: "3:00 PM",
    venue: "Santiago Bernabéu",
    location: "Madrid, Spain",
    section: "Tribune Nord",
    row: "Row 8",
    seats: "Seats 15-16",
    price: 3200,
    purchaseDate: "2024-12-18",
    status: "active",
    image: "/soccer-stadium-match.png",
    qrEnabled: true,
    transferable: true,
    category: "Soccer",
    eventDate: "2025-01-15",
  },
  {
    id: "TKT-003",
    title: "Celtics vs Heat",
    date: "Dec 28, 2024",
    time: "7:30 PM",
    venue: "TD Garden",
    location: "Boston, MA",
    section: "Balcony 301",
    row: "Row 5",
    seats: "Seats 10-11",
    price: 1800,
    purchaseDate: "2024-12-12",
    status: "used",
    image: "/basketball-arena.png",
    qrEnabled: false,
    transferable: false,
    category: "Basketball",
    eventDate: "2024-12-28",
  },
]

export default function MyTicketsPage() {
  const [selectedTicket, setSelectedTicket] = useState<(typeof mockUserTickets)[0] | null>(null)
  const [showQRModal, setShowQRModal] = useState(false)

  const activeTickets = mockUserTickets.filter((ticket) => ticket.status === "active")
  const usedTickets = mockUserTickets.filter((ticket) => ticket.status === "used")

  const handleShowQR = (ticket: (typeof mockUserTickets)[0]) => {
    setSelectedTicket(ticket)
    setShowQRModal(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 text-white">Active</Badge>
      case "used":
        return <Badge variant="secondary">Used</Badge>
      case "expired":
        return <Badge variant="destructive">Expired</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const isEventSoon = (eventDate: string) => {
    const event = new Date(eventDate)
    const now = new Date()
    const diffHours = (event.getTime() - now.getTime()) / (1000 * 60 * 60)
    return diffHours <= 24 && diffHours > 0
  }

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
            <Link href="/teams" className="text-muted-foreground hover:text-foreground transition-colors">
              Official Teams
            </Link>
            <Link href="/wallet" className="text-muted-foreground hover:text-foreground transition-colors">
              CHZ Wallet
            </Link>
            <Link href="/my-tickets" className="text-primary font-medium">
              My Tickets
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              <Shield className="h-3 w-3 mr-1" />
              Verified
            </Badge>
            <Button variant="outline" size="sm">
              Profile
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-sans mb-2 text-foreground">My Tickets</h1>
          <p className="text-xl text-muted-foreground font-serif">Your purchased tickets with secure QR code access</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Ticket className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold font-sans">{activeTickets.length}</p>
                  <p className="text-sm text-muted-foreground font-serif">Active Tickets</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <QrCode className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold font-sans">{activeTickets.filter((t) => t.qrEnabled).length}</p>
                  <p className="text-sm text-muted-foreground font-serif">QR Ready</p>
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
        </div>

        {/* Tickets Tabs */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto">
            <TabsTrigger value="active">Active Tickets ({activeTickets.length})</TabsTrigger>
            <TabsTrigger value="history">History ({usedTickets.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {activeTickets.length === 0 ? (
              <div className="text-center py-12">
                <Ticket className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold font-sans mb-2">No active tickets</h3>
                <p className="text-muted-foreground font-serif mb-4">Browse the marketplace to find your next event</p>
                <Link href="/marketplace">
                  <Button className="bg-primary hover:bg-primary/90">Browse Tickets</Button>
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTickets.map((ticket) => (
                  <Card
                    key={ticket.id}
                    className="border-border bg-card hover:shadow-lg transition-all duration-200 overflow-hidden"
                  >
                    <div className="relative">
                      <div className="aspect-video bg-muted">
                        <img
                          src={ticket.image || "/placeholder.svg"}
                          alt={ticket.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute top-3 left-3 flex gap-2">
                        {getStatusBadge(ticket.status)}
                        {isEventSoon(ticket.eventDate) && (
                          <Badge className="bg-orange-500 text-white">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Soon
                          </Badge>
                        )}
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                          <Shield className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="pb-3">
                      <CardTitle className="font-sans text-lg">{ticket.title}</CardTitle>
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

                      <div className="space-y-2 pt-2">
                        <div className="text-sm text-muted-foreground font-serif">
                          {ticket.section} • {ticket.row} • {ticket.seats}
                        </div>
                        <div className="text-sm text-muted-foreground font-serif">
                          Purchased: {new Date(ticket.purchaseDate).toLocaleDateString()}
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-lg font-bold text-primary font-sans">
                            {ticket.price.toLocaleString()} CHZ
                          </span>
                          <div className="flex gap-2">
                            {ticket.qrEnabled && (
                              <Button
                                size="sm"
                                className="bg-primary hover:bg-primary/90"
                                onClick={() => handleShowQR(ticket)}
                              >
                                <QrCode className="h-3 w-3 mr-1" />
                                Show QR
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                          {ticket.transferable && (
                            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                              <Share2 className="h-3 w-3 mr-1" />
                              Transfer
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            {usedTickets.length === 0 ? (
              <div className="text-center py-12">
                <Ticket className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold font-sans mb-2">No ticket history</h3>
                <p className="text-muted-foreground font-serif">Your used tickets will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {usedTickets.map((ticket) => (
                  <Card key={ticket.id} className="border-border bg-card">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden">
                          <img
                            src={ticket.image || "/placeholder.svg"}
                            alt={ticket.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold font-sans">{ticket.title}</h3>
                              <p className="text-sm text-muted-foreground font-serif">
                                {ticket.date} • {ticket.venue}
                              </p>
                              <p className="text-sm text-muted-foreground font-serif">
                                {ticket.section} • {ticket.seats}
                              </p>
                            </div>
                            <div className="text-right">
                              {getStatusBadge(ticket.status)}
                              <p className="text-sm text-muted-foreground font-serif mt-1">
                                {ticket.price.toLocaleString()} CHZ
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {selectedTicket && (
        <SecureQRModal
          isOpen={showQRModal}
          onClose={() => {
            setShowQRModal(false)
            setSelectedTicket(null)
          }}
          ticket={selectedTicket}
        />
      )}
    </div>
  )
}
