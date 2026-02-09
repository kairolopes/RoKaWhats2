import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "RokaWhats",
  description: "WhatsApp Clone",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        {children}
      </body>
    </html>
  )
}
