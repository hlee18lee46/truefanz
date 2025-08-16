"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { QrCode, Shield, Clock, AlertTriangle, CheckCircle, Eye, EyeOff, Fingerprint, Lock } from "lucide-react"

interface SecureQRModalProps {
  isOpen: boolean
  onClose: () => void
  ticket: {
    id: string
    title: string
    date: string
    time: string
    venue: string
    location: string
    section: string
    row: string
    seats: string
    eventDate: string
  }
}

export function SecureQRModal({ isOpen, onClose, ticket }: SecureQRModalProps) {
  const [verificationStep, setVerificationStep] = useState<"verify" | "authenticated" | "qr-display">("verify")
  const [showQR, setShowQR] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(300) // 5 minutes in seconds
  const [isVerifying, setIsVerifying] = useState(false)

  // Generate a mock QR code data
  const qrData = `TICKET:${ticket.id}:${Date.now()}:VERIFIED`

  // Calculate time until event
  const getTimeUntilEvent = () => {
    const eventDateTime = new Date(`${ticket.eventDate} ${ticket.time}`)
    const now = new Date()
    const diffMs = eventDateTime.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffMs < 0) return "Event has started"
    if (diffHours < 1) return `${diffMinutes} minutes until event`
    return `${diffHours}h ${diffMinutes}m until event`
  }

  // Countdown timer for QR display
  useEffect(() => {
    if (verificationStep === "qr-display" && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setVerificationStep("verify")
            setShowQR(false)
            return 300
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [verificationStep, timeRemaining])

  const handleBiometricVerification = async () => {
    setIsVerifying(true)

    // Simulate biometric verification
    setTimeout(() => {
      setIsVerifying(false)
      setVerificationStep("authenticated")

      // Auto-proceed to QR display after brief success message
      setTimeout(() => {
        setVerificationStep("qr-display")
        setShowQR(true)
      }, 1500)
    }, 2000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const renderQRCode = () => {
    // In a real app, this would be a proper QR code library
    return (
      <div className="w-64 h-64 bg-white border-4 border-primary rounded-lg flex items-center justify-center mx-auto">
        <div className="text-center">
          <QrCode className="h-32 w-32 text-primary mx-auto mb-2" />
          <p className="text-xs text-muted-foreground font-mono">{ticket.id}</p>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-sans flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Secure Ticket Access
          </DialogTitle>
          <DialogDescription className="font-serif">
            {verificationStep === "verify" && "Verify your identity to display your ticket QR code"}
            {verificationStep === "authenticated" && "Identity verified successfully"}
            {verificationStep === "qr-display" && "Your secure ticket QR code"}
          </DialogDescription>
        </DialogHeader>

        {/* Ticket Info */}
        <Card className="border-border bg-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-sans">{ticket.title}</CardTitle>
            <CardDescription className="font-serif">
              {ticket.date} • {ticket.time}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <p className="font-serif">
                {ticket.venue}, {ticket.location}
              </p>
              <p className="font-serif">
                {ticket.section} • {ticket.row} • {ticket.seats}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-serif">{getTimeUntilEvent()}</span>
            </div>
          </CardContent>
        </Card>

        {verificationStep === "verify" && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center">
                <Fingerprint className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold font-sans mb-2">Identity Verification Required</h3>
                <p className="text-sm text-muted-foreground font-serif">
                  For security, only verified ticket owners can display QR codes. This prevents unauthorized access and
                  ticket fraud.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-serif">Blockchain ownership verification</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4 text-primary" />
                <span className="font-serif">Biometric authentication</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-serif">Time-limited QR display</span>
              </div>
            </div>

            <Button
              onClick={handleBiometricVerification}
              disabled={isVerifying}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isVerifying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Verifying Identity...
                </>
              ) : (
                <>
                  <Fingerprint className="h-4 w-4 mr-2" />
                  Verify with Biometrics
                </>
              )}
            </Button>
          </div>
        )}

        {verificationStep === "authenticated" && (
          <div className="text-center py-8 space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <div>
              <h3 className="font-semibold font-sans mb-2">Identity Verified!</h3>
              <p className="text-sm text-muted-foreground font-serif">Preparing your secure QR code...</p>
            </div>
          </div>
        )}

        {verificationStep === "qr-display" && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              {showQR ? (
                renderQRCode()
              ) : (
                <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center mx-auto">
                  <div className="text-center">
                    <EyeOff className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground font-serif">QR Code Hidden</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-serif">QR Code Display</span>
                <Button variant="outline" size="sm" onClick={() => setShowQR(!showQR)}>
                  {showQR ? (
                    <>
                      <EyeOff className="h-3 w-3 mr-1" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3 mr-1" />
                      Show
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-semibold text-orange-800 font-sans">Security Notice</span>
                </div>
                <p className="text-xs text-orange-700 font-serif">
                  This QR code will automatically hide in {formatTime(timeRemaining)} for security. Only show this code
                  to venue staff for entry.
                </p>
              </div>

              <Separator />

              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="h-3 w-3 text-primary" />
                  <span className="font-serif">Verified ownership: {ticket.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-primary" />
                  <span className="font-serif">Generated: {new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            <Button variant="outline" onClick={onClose} className="w-full bg-transparent">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
