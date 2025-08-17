// app/marketplace/[id]/page.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PaymentModal } from "@/components/payment-modal"
import {
  MapPin,
  Calendar,
  Clock,
  Star,
  Shield,
  ArrowLeft,
  Heart,
  Share2,
  MessageCircle,
  Ticket,
  QrCode,
  Lock,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { usePrivy, useWallets } from "@privy-io/react-auth"
import { ethers } from "ethers"

// ABIs
import PSGTicketNFT from "@/lib/abis/PSGTicketNFT.json"
import PrimarySale from "@/lib/abis/PrimarySale.json"

const psgNftAbi = (PSGTicketNFT as any).abi
const saleAbi = (PrimarySale as any).abi

const NFT_ADDRESS = process.env.NEXT_PUBLIC_PSG_NFT_ADDRESS!
const SALE_ADDRESS = process.env.NEXT_PUBLIC_FIXED_SALE_ADDRESS!
const CHILIZ_RPC = process.env.NEXT_PUBLIC_CHILIZ_RPC || "https://spicy-rpc.chiliz.com"

// --- util
function ipfsToHttp(u?: string) {
  if (!u) return u
  if (u.startsWith("ipfs://")) {
    return `https://gateway.pinata.cloud/ipfs/${u.replace("ipfs://", "")}`
  }
  return u
}

// --- mock (unchanged)
const mockTicket = {
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
  seller: {
    name: "SportsFan2024",
    rating: 4.9,
    totalSales: 47,
    joinDate: "Jan 2023",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  category: "Basketball",
  image: "/basketball-arena.png",
  verified: true,
  trending: true,
  description:
    "Premium seats with excellent view of the court. These are some of the best seats in the house for this Christmas Day matchup between two of the NBA's biggest rivals.",
  features: ["Premium seating location", "Excellent court view", "Easy arena access", "Nearby concessions"],
  transferPolicy: "Tickets can be transferred up to 2 hours before event start time",
  refundPolicy: "Full refund available if event is cancelled",
}

export default function TicketDetailPage() {
  const params = useParams()
  const { ready, authenticated, login } = usePrivy()
  const { wallets } = useWallets()

  // same UI state you had
  const [isFavorite, setIsFavorite] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // on-chain state
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(true)
  const [isOnChain, setIsOnChain] = useState(false)
  const [tokenId, setTokenId] = useState<number | null>(null)
  const [onChainTitle, setOnChainTitle] = useState<string>("")
  const [onChainImage, setOnChainImage] = useState<string | undefined>(undefined)
  const [listed, setListed] = useState(false)
  const [priceWei, setPriceWei] = useState<ethers.BigNumber | null>(null)

  // simple rule: ids >= 10000 are real listings (id = 10000 + tokenId)
  useEffect(() => {
    const raw = Number(params?.id as string)
    if (!Number.isNaN(raw) && raw >= 10000) {
      setIsOnChain(true)
      setTokenId(raw - 10000)
    } else {
      setIsOnChain(false)
      setTokenId(null)
    }
  }, [params?.id])

  // read listing + metadata
  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!isOnChain || tokenId == null) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const provider = new ethers.providers.JsonRpcProvider(CHILIZ_RPC)
        const sale = new ethers.Contract(SALE_ADDRESS, saleAbi, provider)
        const nft = new ethers.Contract(NFT_ADDRESS, psgNftAbi, provider)

        const p: ethers.BigNumber = await sale.priceOf(tokenId)
        const isListed = p.gt(0)
        if (!mounted) return
        setListed(isListed)
        setPriceWei(isListed ? p : null)

        // basic tokenURI -> name/image (best-effort)
        let name = `PSG Ticket #${tokenId}`
        let img: string | undefined
        try {
          const uri: string = await nft.tokenURI(tokenId)
          const meta = await fetch(ipfsToHttp(uri)!).then((r) => r.json()).catch(() => null)
          if (meta?.name) name = meta.name
          if (meta?.image) img = ipfsToHttp(meta.image)
        } catch {
          // ignore metadata errors
        }
        if (!mounted) return
        setOnChainTitle(name)
        setOnChainImage(img)
      } catch (e) {
        console.error(e)
        if (mounted) setStatus("Failed to load on-chain listing.")
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [isOnChain, tokenId])

  const evmWallet = useMemo(
    () => wallets.find((w) => w.walletClientType === "privy" || w.address),
    [wallets]
  )

  async function getSigner() {
    if (!evmWallet) throw new Error("No wallet connected")
    const injected = await evmWallet.getEthereumProvider()
    const provider = new ethers.providers.Web3Provider(injected) // ethers v5
    return provider.getSigner()
  }

  async function buyOnChain() {
    try {
      setStatus("")
      if (!authenticated) await login()
      if (tokenId == null || !priceWei) {
        setStatus("Not purchasable.")
        return
      }
      const signer = await getSigner()
      const sale = new ethers.Contract(SALE_ADDRESS, saleAbi, signer)

      // catch revert early
      try {
        await sale.callStatic.buy(tokenId, { value: priceWei })
      } catch (e: any) {
        console.error("Static buy revert:", e)
        setStatus("Buy would revert. Ensure listing is active and you have enough CHZ.")
        return
      }

      setStatus("Sending buy transaction…")
      const tx = await sale.buy(tokenId, { value: priceWei /*, gasLimit: 300000 */ })
      await tx.wait()
      setStatus(`Success! tx: ${tx.hash}`)
    } catch (e: any) {
      console.error(e)
      setStatus(e?.message ?? "Error while buying")
    }
  }

  const priceDisplay = isOnChain && priceWei
    ? Number(ethers.utils.formatUnits(priceWei, 18)).toLocaleString()
    : mockTicket.price.toLocaleString()

  // ---- UI (kept your layout/styles)
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-2">
            <Ticket className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-sans text-foreground">truefanz Pro</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              {authenticated ? "Connected" : "Sign In"}
            </Button>
            <Link href="/sell">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Sell Tickets
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Image */}
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={(isOnChain && onChainImage) ? onChainImage : (mockTicket.image || "/placeholder.svg")}
                alt={(isOnChain ? onChainTitle : mockTicket.title) || "Ticket"}
                className="w-full aspect-video object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                {mockTicket.trending && <Badge className="bg-destructive text-destructive-foreground">Trending</Badge>}
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="bg-background/80 hover:bg-background"
                  onClick={() => setIsFavorite((v) => !v)}
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
                <Button variant="secondary" size="icon" className="bg-background/80 hover:bg-background">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Event Details */}
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl font-bold font-sans mb-2">
                      {isOnChain ? (onChainTitle || `PSG Ticket #${tokenId}`) : mockTicket.title}
                    </CardTitle>
                    <div className="space-y-2 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="font-serif">{mockTicket.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="font-serif">{mockTicket.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="font-serif">
                          {mockTicket.venue}, {mockTicket.location}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="seating">Seating</TabsTrigger>
                    <TabsTrigger value="policies">Policies</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="mt-4 space-y-4">
                    <p className="text-muted-foreground font-serif">{mockTicket.description}</p>
                    <div>
                      <h4 className="font-semibold font-sans mb-2">Features</h4>
                      <ul className="space-y-1">
                        {mockTicket.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground font-serif">
                            <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>

                  <TabsContent value="seating" className="mt-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground font-serif">Section</span>
                          <p className="font-semibold font-sans">{mockTicket.section}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground font-serif">Row</span>
                          <p className="font-semibold font-sans">{mockTicket.row}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground font-serif">Seats</span>
                          <p className="font-semibold font-sans">{mockTicket.seats}</p>
                        </div>
                      </div>
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <QrCode className="h-4 w-4 text-primary" />
                          <span className="font-semibold font-sans">Secure QR Code</span>
                        </div>
                        <p className="text-sm text-muted-foreground font-serif">
                          QR code will be revealed to the buyer after successful payment. Only the ticket owner can
                          display the QR code.
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="policies" className="mt-4 space-y-4">
                    <div>
                      <h4 className="font-semibold font-sans mb-2">Transfer Policy</h4>
                      <p className="text-sm text-muted-foreground font-serif">{mockTicket.transferPolicy}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold font-sans mb-2">Refund Policy</h4>
                      <p className="text-sm text-muted-foreground font-serif">{mockTicket.refundPolicy}</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <Card className="border-border bg-card sticky top-24">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-3xl font-bold text-primary font-sans">
                        {priceDisplay} CHZ
                      </span>
                      {/* keep your discount UI for mock */}
                      {!isOnChain && mockTicket.originalPrice > mockTicket.price && (
                        <span className="text-lg text-muted-foreground line-through">
                          {mockTicket.originalPrice.toLocaleString()} CHZ
                        </span>
                      )}
                    </div>
                    {!isOnChain && mockTicket.originalPrice > mockTicket.price && (
                      <div className="text-sm text-green-600 font-medium">
                        Save{" "}
                        {(((mockTicket.originalPrice - mockTicket.price) / mockTicket.originalPrice) * 100).toFixed(0)}%
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
                  disabled={isOnChain ? (!ready || !listed || !priceWei) : false}
                  onClick={() => {
                    if (isOnChain) {
                      buyOnChain()
                    } else {
                      setShowPaymentModal(true)
                    }
                  }}
                >
                  {isOnChain ? (listed ? "Buy with CHZ Tokens" : "Not Listed") : "Buy with CHZ Tokens"}
                </Button>

                <Separator />

                <Separator />

                {/* Security Features */}
                <div>
                  <h4 className="font-semibold font-sans mb-3">Security Features</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Lock className="h-3 w-3 text-primary" />
                      <span className="font-serif">Blockchain-secured transaction</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Shield className="h-3 w-3 text-primary" />
                      <span className="font-serif">Verified seller guarantee</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <QrCode className="h-3 w-3 text-primary" />
                      <span className="font-serif">Secure QR code delivery</span>
                    </div>
                  </div>

                  {!!status && (
                    <div className="mt-4 text-xs text-muted-foreground break-all">{status}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* keep your existing modal for mock flow */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        ticketDetails={{
          title: mockTicket.title,
          date: mockTicket.date,
          venue: mockTicket.venue,
          section: mockTicket.section,
          seats: mockTicket.seats,
          price: mockTicket.price,
        }}
      />
    </div>
  )
}