import Link from "next/link"
import { Compass, Mail, Phone, Instagram, Facebook } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-primary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gold-500 rounded-full flex items-center justify-center">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-serif font-semibold">Voyagr</span>
            </div>
            <p className="text-primary-200 text-sm leading-relaxed max-w-xs">
              Personalized travel planning built around you — your pace,
              your style, and what makes a trip feel unforgettable.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-primary-300 hover:text-gold-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-primary-300 hover:text-gold-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="mailto:hello@voyagr.com" className="text-primary-300 hover:text-gold-400 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-gold-400 uppercase tracking-wider mb-4">Explore</h4>
            <ul className="space-y-2">
              <li><Link href="/#how-it-works" className="text-sm text-primary-300 hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="/#faq" className="text-sm text-primary-300 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/survey" className="text-sm text-primary-300 hover:text-white transition-colors">Plan My Trip</Link></li>
              <li><Link href="/login" className="text-sm text-primary-300 hover:text-white transition-colors">Sign In</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-gold-400 uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-primary-300">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <a href="mailto:hello@voyagr.com" className="hover:text-white transition-colors">hello@voyagr.com</a>
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-300">
                <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                <a href="tel:+18005551234" className="hover:text-white transition-colors">+1 (800) 555-1234</a>
              </li>
            </ul>
            <div className="mt-6">
              <Link
                href="/survey"
                className="inline-block bg-gold-500 hover:bg-gold-600 text-white text-sm font-semibold px-5 py-2.5 rounded-md transition-colors"
              >
                Start Planning
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-primary-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-primary-400">
            &copy; {new Date().getFullYear()} Voyagr Travel. All rights reserved.
          </p>
          <p className="text-xs text-primary-500">
            Website created by Cameron Prudente
          </p>
        </div>
      </div>
    </footer>
  )
}
