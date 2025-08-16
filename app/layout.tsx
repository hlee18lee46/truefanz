import type React from "react";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Manrope } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geist = Geist({ subsets: ["latin"], display: "swap", variable: "--font-geist" });
const manrope = Manrope({ subsets: ["latin"], display: "swap", variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "truefanz Pro - Sports Ticket Exchange Platform",
  description: "Exchange sports tickets securely with CHZ tokens",
  generator: "v0.app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${manrope.variable} antialiased`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
