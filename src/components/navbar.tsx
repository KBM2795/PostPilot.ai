"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogOut, Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { SignOutButton } from "@clerk/nextjs"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const isLoggedIn =
    pathname.includes("/dashboard") || pathname.includes("/profile") || pathname.includes("/onboarding")

  return (
    <header className="w-full py-4 px-6 md:px-10 bg-background/80 backdrop-blur-md fixed top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-bold gradient-text">PostPilot.ai</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className={`text-sm font-medium ${pathname === "/" ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
          >
            Home
          </Link>
          <Link
            href="/#features"
            className={`text-sm font-medium ${pathname === "/features" ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
          >
            Features
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className={`text-sm font-medium ${pathname.includes("/dashboard") ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className={`text-sm font-medium ${pathname.includes("/profile") ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
              >
                Profile
              </Link>
              
                <div className="flex items-center gap-2">
                <SignOutButton>
                  <Button variant="ghost" className="text-sm font-medium hover:bg-orange-300">
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </Button>
                </SignOutButton>
                </div>
              
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-sm font-medium hover:bg-orange-300">
                  Login
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="text-sm font-medium">Sign Up</Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background shadow-md p-4 z-50">
          <nav className="flex flex-col gap-4">
            <Link
              href="/"
              className={`text-sm font-medium ${pathname === "/" ? "text-primary" : "text-muted-foreground"}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/features"
              className={`text-sm font-medium ${pathname === "/features" ? "text-primary" : "text-muted-foreground"}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>

            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium ${pathname.includes("/dashboard") ? "text-primary" : "text-muted-foreground"}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className={`text-sm font-medium ${pathname.includes("/profile") ? "text-primary" : "text-muted-foreground"}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-muted-foreground"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link href="/signup" className="text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
