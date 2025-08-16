"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Wallet, Shield, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  ticketDetails: {
    title: string
    date: string
    venue: string
    section: string
    seats: string
    price: number
  }
}

export function PaymentModal({ isOpen, onClose, ticketDetails }: PaymentModalProps) {
  const [paymentStep, setPaymentStep] = useState<"confirm" | "processing" | "success" | "error">("confirm")
  const [walletBalance] = useState(15750.25)
  const router = useRouter()

  const handlePayment = async () => {
    setPaymentStep("processing")

    // Simulate payment processing
    setTimeout(() => {
      if (Math.random() > 0.1) {
        // 90% success rate
        setPaymentStep("success")
      } else {
        setPaymentStep("error")
      }
    }, 3000)
  }

  const handleViewTickets = () => {
    onClose()
    router.push("/my-tickets")
  }

  const networkFee = 2.5
  const totalAmount = ticketDetails.price + networkFee

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-sans">
            {paymentStep === "confirm" && "Confirm Payment"}
            {paymentStep === "processing" && "Processing Payment"}
            {paymentStep === "success" && "Payment Successful"}
            {paymentStep === "error" && "Payment Failed"}
          </DialogTitle>
          <DialogDescription className="font-serif">
            {paymentStep === "confirm" && "Review your ticket purchase details"}
            {paymentStep === "processing" && "Please wait while we process your transaction"}
            {paymentStep === "success" && "Your tickets have been purchased successfully"}
            {paymentStep === "error" && "There was an issue processing your payment"}
          </DialogDescription>
        </DialogHeader>

        {paymentStep === "confirm" && (
          <div className="space-y-6">
            {/* Ticket Details */}
            <Card className="border-border bg-muted/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-sans">{ticketDetails.title}</CardTitle>
                <CardDescription className="font-serif">
                  {ticketDetails.date} • {ticketDetails.venue}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground font-serif">
                  {ticketDetails.section} • {ticketDetails.seats}
                </p>
              </CardContent>
            </Card>

            {/* Payment Breakdown */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-serif">Ticket Price</span>
                <span className="font-sans">{ticketDetails.price.toLocaleString()} CHZ</span>
              </div>
              <div className="flex justify-between">
                <span className="font-serif">Network Fee</span>
                <span className="font-sans">{networkFee} CHZ</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span className="font-sans">Total</span>
                <span className="font-sans text-primary">{totalAmount.toLocaleString()} CHZ</span>
              </div>
            </div>

            {/* Wallet Info */}
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-primary" />
                    <span className="font-serif">CHZ Wallet Balance</span>
                  </div>
                  <span className="font-sans">{walletBalance.toLocaleString()} CHZ</span>
                </div>
                <div className="mt-2 text-sm text-muted-foreground font-serif">
                  Remaining after purchase: {(walletBalance - totalAmount).toLocaleString()} CHZ
                </div>
              </CardContent>
            </Card>

            {/* Security Features */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-3 w-3 text-primary" />
                <span className="font-serif">Blockchain-secured transaction</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3 text-primary" />
                <span className="font-serif">Instant ticket delivery</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={walletBalance < totalAmount}
              >
                {walletBalance < totalAmount ? "Insufficient Balance" : "Pay with CHZ"}
              </Button>
            </div>
          </div>
        )}

        {paymentStep === "processing" && (
          <div className="text-center py-8 space-y-4">
            <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
            <div>
              <h3 className="font-semibold font-sans mb-2">Processing Payment</h3>
              <p className="text-sm text-muted-foreground font-serif">
                Please wait while we confirm your transaction on the blockchain...
              </p>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              Transaction ID: 0x1234...5678
            </Badge>
          </div>
        )}

        {paymentStep === "success" && (
          <div className="text-center py-8 space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <div>
              <h3 className="font-semibold font-sans mb-2">Payment Successful!</h3>
              <p className="text-sm text-muted-foreground font-serif">
                Your tickets have been added to your account. You can view them in your profile.
              </p>
            </div>
            <div className="space-y-2">
              <Button onClick={handleViewTickets} className="w-full bg-primary hover:bg-primary/90">
                View My Tickets
              </Button>
              <Button variant="outline" onClick={onClose} className="w-full bg-transparent">
                Continue Shopping
              </Button>
            </div>
          </div>
        )}

        {paymentStep === "error" && (
          <div className="text-center py-8 space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <div>
              <h3 className="font-semibold font-sans mb-2">Payment Failed</h3>
              <p className="text-sm text-muted-foreground font-serif">
                There was an issue processing your payment. Please try again or contact support.
              </p>
            </div>
            <div className="space-y-2">
              <Button onClick={() => setPaymentStep("confirm")} className="w-full bg-primary hover:bg-primary/90">
                Try Again
              </Button>
              <Button variant="outline" onClick={onClose} className="w-full bg-transparent">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
