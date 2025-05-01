"use client"

import type React from "react"
import { Navbar } from "@/components/navbar"
import { Toaster } from "sonner"

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Toaster position="top-center" />
      <main className="flex-1 flex items-center justify-center p-6 md:p-10 pt-32 pb-20">{children}</main>
    </div>
  )
}
