"use client"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Shield, Zap, Users, Ticket, ArrowRight, Star } from "lucide-react"
import Link from "next/link"
import SyncWalletButton from "@/components/SyncWalletButton";


export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="h-8 w-8 text-primary" />
            <Link href="/home" className="text-2xl font-bold font-sans text-foreground">truefanz Pro</Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/marketplace" className="text-muted-foreground hover:text-foreground transition-colors">
              Marketplace
            </Link>

            <Link href="/my-tickets" className="text-muted-foreground hover:text-foreground transition-colors">
              My Tickets
            </Link>
          </nav>
          <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
  <SyncWalletButton />
</div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-4 bg-accent/10 text-accent border-accent/20">
            Powered by CHZ Token
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold font-sans mb-6 text-foreground">
            Your Ticket directly from Team
            <span className="text-primary block">Securely & Instantly</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto font-serif">
            The world's first blockchain-powered sports ticket exchange. 
            Buy directly from teams at a face value using CHZ tokens.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8">
              Browse Tickets
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
            <Link href="/my-tickets" className="text-muted-foreground hover:text-foreground transition-colors">
              Check My Tickets
            </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-sans mb-4 text-foreground">Why Choose truefanz Pro?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-serif">
              To provide tickets at a fair value without any ticket resellers' price hike. 
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-border bg-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="font-sans">Secure QR Codes</CardTitle>
                <CardDescription className="font-serif">
                  Only verified ticket owners can display QR codes. Advanced blockchain verification prevents fraud.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border bg-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="font-sans">CHZ Token Payments</CardTitle>
                <CardDescription className="font-serif">
                  Lightning-fast transactions with Chiliz tokens. Lower fees, instant settlements, global accessibility.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border bg-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="font-sans">Official Team Sales</CardTitle>
                <CardDescription className="font-serif">
                  Buy directly from professional sports teams. Guaranteed authenticity and face-value pricing.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Ticket className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold font-sans">truefanz Pro</span>
              </div>
              <p className="text-muted-foreground font-serif">
                The future of sports ticket trading, powered by blockchain technology.
              </p>
            </div>
            <div>
              <h3 className="font-semibold font-sans mb-4">Platform</h3>
              <ul className="space-y-2 text-muted-foreground font-serif">
                <li>
                  <Link href="/marketplace" className="hover:text-foreground transition-colors">
                    Marketplace
                  </Link>
                </li>

                <li>
                  <Link href="/my-tickets" className="hover:text-foreground transition-colors">
                    My Tickets
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold font-sans mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground font-serif">
                <li>
                  <Link href="/help" className="hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="hover:text-foreground transition-colors">
                    Security
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground transition-colors">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold font-sans mb-4">Legal</h3>
              <ul className="space-y-2 text-muted-foreground font-serif">
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/compliance" className="hover:text-foreground transition-colors">
                    Compliance
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground font-serif">
            <p>&copy; 2024 truefanz Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
