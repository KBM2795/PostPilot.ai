import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "next-themes"
import { ClerkProvider} from '@clerk/nextjs'
import { FeedbackBot } from "@/components/feedback-bot"
import { Analytics } from "@vercel/analytics/react"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PostPilot.ai - AI LinkedIn Post Generator",
  description: "Create engaging LinkedIn posts with our AI assistant",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <FeedbackBot />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
    </ClerkProvider>
  )
}
