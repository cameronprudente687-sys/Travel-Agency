"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Compass, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SurveyStartPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleStart = () => {
    setLoading(true)
    router.push("/survey/step/1")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand-50 to-white pt-20">
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-700 rounded-full mb-6">
            <Compass className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-primary-900 mb-4">
            Let's build your perfect trip
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            This survey helps us understand you as a traveler — your pace, your passions,
            and what you want to feel. It takes about 10 minutes.
          </p>
        </div>

        {/* What to expect */}
        <div className="bg-white rounded-2xl border border-sand-200 p-8 mb-8 shadow-sm">
          <h3 className="font-semibold text-primary-800 mb-4">What we'll ask about:</h3>
          <ul className="space-y-3">
            {[
              "Who you're traveling with and your group size",
              "When you want to go and how long",
              "Your travel style and pace preferences",
              "Destinations you have in mind (or leave it open to us)",
              "Your interests, must-haves, and things to avoid",
              "Food and dining preferences",
              "Previous travel experiences that shaped your taste",
              "Special requests or celebrations",
              "How involved you want to be in planning",
              "The feeling you want from this trip",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Privacy note */}
        <div className="bg-primary-50 rounded-xl p-4 mb-8 text-sm text-primary-700">
          <strong>Your privacy matters.</strong> Everything you share is confidential and used
          only to design your trip. We'll never share your information with third parties.
        </div>

        {/* CTA */}
        <Button
          onClick={handleStart}
          variant="gold"
          size="xl"
          className="w-full shadow-lg"
          disabled={loading}
        >
          {loading ? "Getting ready..." : "Start My Survey"}
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>

        <p className="text-center text-sm text-gray-400 mt-4">
          Takes about 10 minutes · No commitment required
        </p>
      </div>
    </div>
  )
}
