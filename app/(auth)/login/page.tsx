"use client"

import { useState } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Compass, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Invalid email or password")
      setLoading(false)
    } else {
      // Fetch session to check role for redirect
      const res = await fetch("/api/auth/session")
      const session = await res.json()
      const role = session?.user?.role

      if (role === "CLIENT") {
        router.push("/my-trip")
      } else {
        router.push("/dashboard")
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-700 rounded-full mb-4">
              <Compass className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-primary-900">Welcome to Voyagr</h1>
            <p className="text-sm text-gray-500 mt-1">Sign in to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="h-12 text-base"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="h-12 text-base pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" variant="navy" className="w-full h-12 text-base" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 space-y-2 text-center">
            <p className="text-xs text-gray-400">Advisor: admin@voyagr.com / voyagr2024</p>
            <p className="text-xs text-gray-400">Customer demo: emily.watson@example.com / emily2025</p>
          </div>
        </div>

        <p className="text-center text-sm text-primary-300 mt-6">
          <a href="/" className="text-gold-400 hover:text-gold-300">Back to homepage</a>
        </p>
      </div>
    </div>
  )
}
