"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-sand-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-serif font-semibold text-primary-700">Voyagr</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#how-it-works" className="text-sm text-gray-600 hover:text-primary-700 transition-colors">
              How It Works
            </Link>
            <Link href="/#destinations" className="text-sm text-gray-600 hover:text-primary-700 transition-colors">
              Destinations
            </Link>
            <Link href="/#testimonials" className="text-sm text-gray-600 hover:text-primary-700 transition-colors">
              Stories
            </Link>
            <Link href="/login" className="text-sm text-gray-600 hover:text-primary-700 transition-colors">
              Advisor Login
            </Link>
            <Button asChild variant="gold" size="sm">
              <Link href="/survey">Plan My Trip</Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-sand-200 pt-4 space-y-3">
            <Link href="/#how-it-works" className="block text-sm text-gray-600 py-1" onClick={() => setIsOpen(false)}>
              How It Works
            </Link>
            <Link href="/#destinations" className="block text-sm text-gray-600 py-1" onClick={() => setIsOpen(false)}>
              Destinations
            </Link>
            <Link href="/#testimonials" className="block text-sm text-gray-600 py-1" onClick={() => setIsOpen(false)}>
              Stories
            </Link>
            <Link href="/login" className="block text-sm text-gray-600 py-1" onClick={() => setIsOpen(false)}>
              Advisor Login
            </Link>
            <Button asChild variant="gold" className="w-full">
              <Link href="/survey" onClick={() => setIsOpen(false)}>Plan My Trip</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}
