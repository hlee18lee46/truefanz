"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  History,
  Shield,
  Ticket,
  TrendingUp,
  Copy,
  ExternalLink,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"

const mockWalletData = {
  balance: 15750.25,
  usdValue: 2362.54,
  address: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
  connected: true,
  transactions: [
    {
      id: 1,
      type: "purchase",
      amount: -2500,
      description: "Lakers vs Warriors Tickets",
      date: "2024-12-20",
      time: "14:30",
      status: "completed",
      txHash: "0x1234...5678",
      ticketId: "TKT-001",
    },
    {
      id: 2,
      type: "deposit",
      amount: 5000,
      description: "CHZ Deposit from Exchange",
      date: "2024-12-18",
      time: "09:15",
      status: "completed",
      txHash: "0x2345...6789",
    },
    {
      id: 3,
      type: "sale",
      amount: 3200,
      description: "Sold: Real Madrid vs Barcelona",
      date: "2024-12-15",
      time: "16:45",
      status: "completed",
      txHash: "0x3456...7890",
      ticketId: "TKT-002",
    },
    {
      id: 4,
      type: "purchase",
      amount: -1800,
      description: "Celtics vs Heat Tickets",
      date: "2024-12-12",
      time: "11:20",
      status: "completed",
      txHash: "0x4567...8901",
      ticketId: "TKT-003",
    },
    {
      id: 5,
      type: "deposit",
      amount: 10000,
      description: "CHZ Deposit from Bank",
      date: "2024-12-10",
      time: "08:00",
      status: "completed",
      txHash: "0x5678...9012",
    },
  ],
}

export default function WalletPage() {
  const [isConnected, setIsConnected] = useState(mockWalletData.connected)
  const [showAddress, setShowAddress] = useState(false)
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")

  const copyAddress = () => {
    navigator.clipboard.writeText(mockWalletData.address)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "purchase":
        return <ArrowUpRight className="h-4 w-4 text-red-500" />
      case "sale":
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />
      case "deposit":
        return <Plus className="h-4 w-4 text-blue-500" />
      default:
        return <History className="h-4 w-4 text-muted-foreground" />
    }
  }

  if (!isConnected) {
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
              <Link href="/wallet" className="text-primary font-medium">
                CHZ Wallet
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Get Started
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-primary/10 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Wallet className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold font-sans mb-4">Connect Your CHZ Wallet</h1>
            <p className="text-muted-foreground font-serif mb-8">
              Connect your Chiliz wallet to start buying and selling sports tickets with CHZ tokens.
            </p>
            <div className="space-y-3">
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
                onClick={() => setIsConnected(true)}
              >
                Connect Wallet
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                Create New Wallet
              </Button>
            </div>
            <div className="mt-8 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-serif">Secure blockchain transactions</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="font-serif">Low transaction fees</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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
            <Link href="/wallet" className="text-primary font-medium">
              CHZ Wallet
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              <Wallet className="h-3 w-3 mr-1" />
              Connected
            </Badge>
            <Button variant="outline" size="sm">
              Profile
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Wallet Overview */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-sans mb-2 text-foreground">CHZ Wallet</h1>
          <p className="text-xl text-muted-foreground font-serif">Manage your Chiliz tokens and transactions</p>
        </div>

        {/* Balance Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardDescription className="font-serif">Total Balance</CardDescription>
              <CardTitle className="text-3xl font-bold font-sans text-primary">
                {mockWalletData.balance.toLocaleString()} CHZ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground font-serif">
                ≈ ${mockWalletData.usdValue.toLocaleString()} USD
              </p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500 font-serif">+2.4% (24h)</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardDescription className="font-serif">Wallet Address</CardDescription>
              <CardTitle className="text-lg font-mono">
                {showAddress ? mockWalletData.address : formatAddress(mockWalletData.address)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyAddress}>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowAddress(!showAddress)}>
                  {showAddress ? "Hide" : "Show"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardDescription className="font-serif">Network Status</CardDescription>
              <CardTitle className="flex items-center gap-2 font-sans">
                <div className="h-2 w-2 bg-green-500 rounded-full" />
                Connected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground font-serif">Chiliz Chain</p>
              <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-sans">Transaction History</CardTitle>
                <CardDescription className="font-serif">Your recent CHZ token transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockWalletData.transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(tx.type)}
                        <div>
                          <p className="font-semibold font-sans">{tx.description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground font-serif">
                            <span>
                              {tx.date} at {tx.time}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {tx.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold font-sans ${tx.amount > 0 ? "text-green-500" : "text-red-500"}`}>
                          {tx.amount > 0 ? "+" : ""}
                          {tx.amount.toLocaleString()} CHZ
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          {tx.ticketId && (
                            <Link href={`/tickets/${tx.ticketId}`}>
                              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                <Ticket className="h-3 w-3 mr-1" />
                                Ticket
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deposit">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-sans">Deposit CHZ Tokens</CardTitle>
                <CardDescription className="font-serif">Add CHZ tokens to your wallet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium font-sans mb-2 block">Amount (CHZ)</label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="text-lg"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setDepositAmount("1000")}>
                      1,000 CHZ
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDepositAmount("5000")}>
                      5,000 CHZ
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDepositAmount("10000")}>
                      10,000 CHZ
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold font-sans">Deposit Methods</h3>
                  <div className="grid gap-3">
                    <Button variant="outline" className="justify-start h-auto p-4 bg-transparent">
                      <div className="text-left">
                        <p className="font-semibold font-sans">Bank Transfer</p>
                        <p className="text-sm text-muted-foreground font-serif">1-3 business days • No fees</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start h-auto p-4 bg-transparent">
                      <div className="text-left">
                        <p className="font-semibold font-sans">Credit/Debit Card</p>
                        <p className="text-sm text-muted-foreground font-serif">Instant • 2.5% fee</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start h-auto p-4 bg-transparent">
                      <div className="text-left">
                        <p className="font-semibold font-sans">Crypto Exchange</p>
                        <p className="text-sm text-muted-foreground font-serif">5-15 minutes • Network fees apply</p>
                      </div>
                    </Button>
                  </div>
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90" disabled={!depositAmount}>
                  Continue Deposit
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdraw">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-sans">Withdraw CHZ Tokens</CardTitle>
                <CardDescription className="font-serif">Transfer CHZ tokens to external wallet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium font-sans mb-2 block">Amount (CHZ)</label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="text-lg"
                    />
                    <p className="text-sm text-muted-foreground font-serif mt-1">
                      Available: {mockWalletData.balance.toLocaleString()} CHZ
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium font-sans mb-2 block">Destination Address</label>
                    <Input placeholder="0x..." className="font-mono" />
                  </div>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-semibold font-sans mb-2">Withdrawal Information</h4>
                  <div className="space-y-1 text-sm text-muted-foreground font-serif">
                    <p>• Network fee: ~0.1 CHZ</p>
                    <p>• Processing time: 5-15 minutes</p>
                    <p>• Minimum withdrawal: 100 CHZ</p>
                  </div>
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90" disabled={!withdrawAmount}>
                  Withdraw CHZ
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
