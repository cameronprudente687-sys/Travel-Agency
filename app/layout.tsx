import type { Metadata } from "next"
import "./globals.css"
import { SessionProvider } from "@/components/providers/SessionProvider"
import { Toaster } from "sonner"

export const metadata: Metadata = {
  title: "Voyagr — Tailored Travel, Built Around the Traveler",
  description: "Boutique travel planning that starts with who you are, not where you want to go.",
  keywords: ["travel advisor", "boutique travel", "luxury travel", "custom itinerary", "travel planning"],
  openGraph: {
    title: "Voyagr",
    description: "Tailored travel, built around the traveler.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
