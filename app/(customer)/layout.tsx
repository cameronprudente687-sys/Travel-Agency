import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Compass, LogOut } from "lucide-react"
import Link from "next/link"

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session) redirect("/login")
  if ((session.user as any)?.role !== "CLIENT") redirect("/dashboard")

  return (
    <div className="min-h-screen bg-white">
      {/* Customer Nav */}
      <nav className="bg-gradient-to-r from-primary-900 to-primary-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/my-trip" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gold-500 rounded-full flex items-center justify-center">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif font-semibold text-lg">Voyagr</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-primary-200">{session.user?.name}</span>
            <Link
              href="/api/auth/signout"
              className="text-primary-300 hover:text-white transition-colors text-sm flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Link>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}
