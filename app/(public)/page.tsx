import Link from "next/link"
import { ArrowRight, CheckCircle, Star, MapPin, Globe, Users, Clock, Compass, Heart, Mountain, Utensils, Waves, Camera, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const tripStyles = [
  { label: "Romantic Escapes", icon: Heart, desc: "Thoughtfully planned getaways for couples and honeymooners" },
  { label: "Family Adventures", icon: Users, desc: "Trips designed so every generation has the time of their life" },
  { label: "Cultural Immersion", icon: Globe, desc: "Deep experiences in history, art, food, and local life" },
  { label: "Luxury Retreats", icon: Star, desc: "Elevated stays and experiences with every detail considered" },
  { label: "Adventure Travel", icon: Mountain, desc: "Active exploration for travelers who love the outdoors" },
  { label: "Slow Travel", icon: Clock, desc: "Fewer places, deeper experiences, no rushing" },
]

const faqs = [
  {
    q: "How is this different from booking a trip myself?",
    a: "When you book on your own, you get the same recommendations everyone sees. When you work with me, I take the time to understand how you travel — your pace, your priorities, what excites you — and I build an itinerary around that. You also get access to properties and experiences that aren't easy to find online.",
  },
  {
    q: "What does the planning process look like?",
    a: "It starts with a short survey — about 10 minutes. I review your responses, build your traveler profile, and then design an itinerary tailored to you. From there, we refine it together until every detail feels right.",
  },
  {
    q: "How much does it cost?",
    a: "Planning fees start at $500 and range to $1,500+ for complex multi-destination itineraries. The fee covers unlimited revisions, full booking management, and trip support. Most clients find it pays for itself in time saved and better experiences.",
  },
  {
    q: "Do you book flights too?",
    a: "Yes — I can handle the entire trip from flights to accommodation to experiences and transfers. If you prefer to use miles, I can guide you through the best redemption options while I take care of everything else.",
  },
  {
    q: "Can you work with last-minute trips?",
    a: "I can work within tight timelines, though the best experiences require advance planning. For most international trips, 60–90 days is ideal. Share what you have and I'll tell you what's possible.",
  },
  {
    q: "What if I want to change the itinerary?",
    a: "Unlimited revisions — I refine until it feels right. Most clients go through 2–3 rounds before everything clicks.",
  },
  {
    q: "How do I get started?",
    a: "Fill out the trip survey. It takes about 10 minutes and gives me everything I need to start designing your trip.",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center text-white pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/backgrounds/resort.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/80 via-primary-900/65 to-primary-900/85" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-8 text-sm text-gold-300 border border-white/20">
            <Compass className="w-4 h-4" />
            Personalized Travel Planning
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight mb-6">
            Your trip, designed around{" "}
            <span className="text-gold-400">how you want</span>{" "}
            to experience it.
          </h1>

          <p className="text-lg sm:text-xl text-primary-200 max-w-2xl mx-auto mb-10 leading-relaxed">
            Tell me how you like to travel — your pace, your passions, and what matters most —
            and I&apos;ll design an itinerary built entirely around you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="gold" size="xl" className="shadow-2xl">
              <Link href="/survey">
                Plan My Trip
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl" className="border-white/30 text-white bg-white/10 hover:bg-white/20">
              <Link href="#how-it-works">
                See How It Works
              </Link>
            </Button>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-primary-300">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-gold-400" />
              <span>10-minute survey</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-gold-400" />
              <span>Personalized itinerary</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-gold-400" />
              <span>Unlimited revisions</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 animate-bounce">
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-sand-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-gold-600 text-sm font-semibold uppercase tracking-wider mb-3">The Process</p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-primary-900 mb-4">
              From your vision to your trip
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Most travel planning starts with a destination. This starts with you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", icon: "📋", title: "Share Your Preferences", desc: "Fill out a 10-minute survey about how you travel — your style, your pace, your must-haves, and the feeling you're after." },
              { step: "02", icon: "🔍", title: "I Build Your Profile", desc: "I review your answers and create a personalized traveler profile matched to the right destinations and experiences." },
              { step: "03", icon: "✈️", title: "We Design Together", desc: "I put together a custom itinerary and we refine it together until every detail feels right." },
              { step: "04", icon: "🌍", title: "You Travel, I Support", desc: "I handle bookings, confirmations, and logistics — and I'm available throughout your trip if anything comes up." },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-md text-3xl mb-4 border border-sand-200">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-gold-500 mb-2">{item.step}</div>
                <h3 className="text-lg font-semibold text-primary-800 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Personalized Travel */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-gold-600 text-sm font-semibold uppercase tracking-wider mb-3">Why It Matters</p>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-primary-900 mb-6">
                The difference between a good trip and a{" "}
                <em className="text-gold-600 not-italic">life-changing one</em>
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Travel platforms show everyone the same recommendations.
                I design trips that match how you actually think, move, and feel —
                because the details that matter to you are different from everyone else&apos;s.
              </p>
              <ul className="space-y-4">
                {[
                  { icon: MapPin, text: "Places you'd never find on your own" },
                  { icon: Clock, text: "A pace that matches how you actually travel" },
                  { icon: Utensils, text: "Restaurants locals genuinely recommend" },
                  { icon: Camera, text: "Experiences chosen for your specific interests" },
                  { icon: Waves, text: "Properties with real character, not just star ratings" },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gold-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon className="w-4 h-4 text-gold-600" />
                    </div>
                    <span className="text-gray-700">{item.text}</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant="navy" size="lg" className="mt-8">
                <Link href="/survey">Start Your Traveler Profile</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-primary-50 rounded-2xl p-6 h-48 flex flex-col justify-end">
                  <div className="text-4xl mb-2">🌋</div>
                  <div className="font-serif font-semibold text-primary-800">Iceland Ring Road</div>
                  <div className="text-xs text-primary-500 mt-1">8 days · Adventure</div>
                </div>
                <div className="bg-gold-50 rounded-2xl p-6 h-36 flex flex-col justify-end">
                  <div className="text-3xl mb-2">🏰</div>
                  <div className="font-serif font-semibold text-primary-800">Loire Valley</div>
                  <div className="text-xs text-primary-500 mt-1">5 days · Cultural</div>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="bg-sand-200 rounded-2xl p-6 h-36 flex flex-col justify-end">
                  <div className="text-3xl mb-2">⛵</div>
                  <div className="font-serif font-semibold text-primary-800">Greek Islands</div>
                  <div className="text-xs text-primary-500 mt-1">10 days · Romantic</div>
                </div>
                <div className="bg-primary-900 rounded-2xl p-6 h-48 flex flex-col justify-end">
                  <div className="text-4xl mb-2">🗼</div>
                  <div className="font-serif font-semibold text-white">Tokyo & Kyoto</div>
                  <div className="text-xs text-primary-300 mt-1">12 days · Cultural</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trip Styles */}
      <section className="py-24 bg-sand-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-gold-600 text-sm font-semibold uppercase tracking-wider mb-3">Find Your Style</p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-primary-900 mb-4">
              Every kind of traveler, planned for well
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Whether you&apos;re after adventure, romance, culture, or stillness —
              your trip is built around exactly what you&apos;re looking for.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tripStyles.map((style, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                  <style.icon className="w-6 h-6 text-primary-700" />
                </div>
                <h3 className="font-semibold text-primary-800 mb-2">{style.label}</h3>
                <p className="text-sm text-gray-600">{style.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-gold-600 text-sm font-semibold uppercase tracking-wider mb-3">Common Questions</p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-primary-900">
              Good questions, honest answers
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border border-gray-100 rounded-lg px-4 bg-gray-50/50">
                <AccordionTrigger className="text-left text-primary-800 font-medium hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 text-white overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/backgrounds/beach.jpg')" }} />
        <div className="absolute inset-0 bg-primary-900/80" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
            Ready to travel better?
          </h2>
          <p className="text-primary-300 text-lg mb-10 max-w-xl mx-auto">
            Start with the survey. It takes 10 minutes, and it gives me everything
            I need to design a trip that actually fits you.
          </p>
          <Button asChild variant="gold" size="xl" className="shadow-2xl">
            <Link href="/survey">
              Begin My Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
