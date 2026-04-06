"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Compass, Eye, EyeOff, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function WelcomeForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [checking, setChecking] = useState(true)
  const [valid, setValid] = useState(false)
  const [userName, setUserName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) { setChecking(false); return }
    fetch(`/api/invite/verify?token=${token}`)
      .then(r => r.json())
      .then(data => {
        setValid(data.valid)
        if (data.name) setUserName(data.name)
        setChecking(false)
      })
      .catch(() => setChecking(false))
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password.length < 8) { setError("Password must be at least 8 characters"); return }
    if (password !== confirmPassword) { setError("Passwords do not match"); return }

    setLoading(true)
    try {
      const res = await fetch("/api/invite/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Failed to set password"); setLoading(false); return }
      setSuccess(true)
      setTimeout(() => router.push("/login"), 2500)
    } catch {
      setError("Something went wrong")
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="text-white text-center">
        <Compass className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p className="text-primary-200">Setting things up...</p>
      </div>
    )
  }

  if (!token || !valid) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-xl font-serif font-bold text-primary-900 mb-2">Invalid or Expired Link</h1>
        <p className="text-sm text-gray-500 mb-6">This setup link is no longer valid. Please contact your travel advisor for a new one.</p>
        <Button variant="navy" onClick={() => router.push("/login")}>Go to Sign In</Button>
      </div>
    )
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h1 className="text-xl font-serif font-bold text-primary-900 mb-2">You&apos;re All Set!</h1>
        <p className="text-sm text-gray-500">Your password has been saved. Redirecting you to sign in...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-700 rounded-full mb-4">
            <Compass className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-primary-900">
            Welcome{userName ? `, ${userName.split(" ")[0]}` : ""}!
          </h1>
          <p className="text-sm text-gray-500 mt-1">Set your password to access your trip portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Create a Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                minLength={8}
                className="h-12 text-base pr-10"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Confirm Password</Label>
            <Input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              className="h-12 text-base"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <Button type="submit" variant="gold" className="w-full h-12 text-base" disabled={loading}>
            {loading ? "Saving..." : "Set Password & Continue"}
          </Button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          After setting your password, you can sign in anytime to view your trip.
        </p>
      </div>
    </div>
  )
}

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center px-4">
      <Suspense fallback={
        <div className="text-white text-center">
          <Compass className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-primary-200">Loading...</p>
        </div>
      }>
        <WelcomeForm />
      </Suspense>
    </div>
  )
}
