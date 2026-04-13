"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Compass, LayoutDashboard, Users, Map, Star,
  MapPin, Settings, BookOpen,
  LogOut
} from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Leads", href: "/leads", icon: Users },
  { label: "Templates", href: "/templates", icon: Map },
  { label: "Past Trips", href: "/past-trips", icon: Star },
  { label: "Saved Places", href: "/places", icon: MapPin },
  { label: "Settings", href: "/settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-primary-900 text-white flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-primary-800">
        <div className="w-8 h-8 bg-gold-500 rounded-full flex items-center justify-center shrink-0">
          <Compass className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="font-serif font-semibold text-lg leading-none">Voyagr</div>
          <div className="text-xs text-primary-300 mt-0.5">Advisor Portal</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary-700 text-white"
                      : "text-primary-300 hover:bg-primary-800 hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="px-3 py-4 border-t border-primary-800 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary-300 hover:bg-primary-800 hover:text-white transition-colors"
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          View Website
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary-300 hover:bg-primary-800 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
