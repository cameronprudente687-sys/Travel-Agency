import Link from "next/link"
import { CheckCircle, Mail, Clock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sand-50 to-white flex items-center justify-center pt-16">
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-8">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-primary-900 mb-4">
          Your profile is in our hands.
        </h1>

        <p className="text-gray-600 text-lg mb-10 leading-relaxed">
          Thank you for taking the time to tell us about yourself as a traveler.
          We've already started reviewing your profile, and your dedicated advisor
          will be in touch within 24 hours.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {[
            { icon: Mail, title: "Check your inbox", desc: "We'll send a confirmation email shortly" },
            { icon: Clock, title: "24-hour response", desc: "Your advisor will reach out tomorrow" },
            { icon: Star, title: "Custom proposal", desc: "A full itinerary built just for you" },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl border border-sand-200 p-5 shadow-sm">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                <item.icon className="w-5 h-5 text-primary-700" />
              </div>
              <div className="font-semibold text-primary-800 text-sm mb-1">{item.title}</div>
              <div className="text-xs text-gray-500">{item.desc}</div>
            </div>
          ))}
        </div>

        <div className="bg-primary-50 rounded-2xl border border-primary-100 p-6 mb-8">
          <p className="text-primary-700 text-sm leading-relaxed">
            <strong>While you wait:</strong> Think about that one experience you've always wanted but
            never quite made happen. We love building trips around those moments.
            It's a good thing to bring up on your planning call.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="navy">
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
