import Link from "next/link"
import { ArrowRight, CheckCircle, Star, MapPin, Globe, Users, Clock, Compass, Heart, Mountain, Utensils, Waves, Camera, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const destinations = [
  { name: "Iceland", emoji: "🇮🇸", tagline: "Fire & Ice", style: "Adventure", image: "from-blue-900 to-slate-700" },
  { name: "Amalfi Coast", emoji: "🇮🇹", tagline: "La Dolce Vita", style: "Romantic", image: "from-teal-600 to-blue-800" },
  { name: "Paris", emoji: "🇫🇷", tagline: "The City of Light", style: "Cultural", image: "from-indigo-700 to-purple-900" },
  { name: "Santorini", emoji: "🇬🇷", tagline: "White & Blue", style: "Luxury", image: "from-sky-500 to-blue-700" },
  { name: "Morocco", emoji: "🇲🇦", tagline: "Sensory Odyssey", style: "Cultural", image: "from-amber-700 to-orange-900" },
  { name: "Swiss Alps", emoji: "🇨🇭", tagline: "Peaks & Valleys", style: "Scenic", image: "from-emerald-700 to-teal-900" },
]

const tripStyles = [
  { label: "Romantic Escapes", icon: Heart, desc: "Intimate experiences for couples and honeymooners", color: "rose" },
  { label: "Family Adventures", icon: Users, desc: "Multi-generational travel everyone actually enjoys", color: "amber" },
  { label: "Cultural Immersion", icon: Globe, desc: "Deep dives into history, art, food, and local life", color: "indigo" },
  { label: "Luxury Retreats", icon: Star, desc: "Elevated experiences with uncompromising quality", color: "gold" },
  { label: "Adventure Travel", icon: Mountain, desc: "Active exploration for those who crave the outdoors", color: "emerald" },
  { label: "Slow Travel", icon: Clock, desc: "Unhurried journeys where depth beats breadth", color: "teal" },
]

const testimonials = [
  {
    name: "Sarah & James T.",
    trip: "Honeymoon in Amalfi, June 2024",
    quote: "We told them we wanted to feel like we were in a dream. That's exactly what they built. Every single detail — the private boat, the restaurant on the cliff, the villa — was perfect. I genuinely can't imagine planning a trip any other way.",
    rating: 5,
  },
  {
    name: "The Nakamura Family",
    trip: "Japan & Kyoto, Spring 2024",
    quote: "Three generations, three very different wish lists. Somehow Voyagr found a route that made everyone happy. The kids still talk about the robot restaurant. My mother-in-law still talks about the ryokan. We're already planning our next trip.",
    rating: 5,
  },
  {
    name: "Mark D.",
    trip: "Solo Iceland Adventure, February 2024",
    quote: "I'd tried planning Iceland myself three times and always gave up. The logistics are genuinely complex. One call with my advisor and everything clicked. She knew the best roads for the northern lights, which hot springs weren't overrun, the lot. Worth every penny.",
    rating: 5,
  },
]

const faqs = [
  {
    q: "How is Voyagr different from booking a trip myself?",
    a: "We go beyond logistics. Our advisors take time to understand who you are as a traveler — your pace, priorities, travel history, and what you actually want to feel on this trip. Then we design an itinerary that fits your life, with access to properties and experiences you can't easily find on your own.",
  },
  {
    q: "What does the planning process look like?",
    a: "It starts with our survey — about 10 minutes to tell us everything we need to know. We'll analyze your profile, match you with the right destinations and templates, then your dedicated advisor will reach out to schedule a planning call. From there we build your itinerary collaboratively until it's exactly right.",
  },
  {
    q: "How much does it cost?",
    a: "Our planning fee starts at $500 per trip (for budget trips) and ranges to $1,500+ for complex, multi-destination luxury itineraries. This fee covers unlimited revisions, 24/7 trip support, and all booking management. Most clients find the fee pays for itself in time saved and upgrades secured.",
  },
  {
    q: "Do you book flights?",
    a: "Yes — we can handle the entire trip from air to accommodation to experiences and transfers. Many clients prefer to use miles for flights, in which case we guide you through the best redemption options while we book everything else.",
  },
  {
    q: "What kinds of trips do you specialize in?",
    a: "We're strongest on Europe (especially Italy, Greece, France, and Scandinavia), Japan, Morocco, and luxury island trips (Maldives, Caribbean). We're growing our Latin America and Southeast Asia programs. If you have a destination in mind, ask — we'll be honest about our depth there.",
  },
  {
    q: "Can you handle last-minute trips?",
    a: "We can work within tight windows, though the best experiences require advance booking. For most international trips, 60–90 days is our sweet spot. Give us what you've got and we'll tell you what's possible.",
  },
  {
    q: "What if I want to change the itinerary after you've built it?",
    a: "Unlimited revisions. We iterate until the plan feels right. Most clients go through 2–3 rounds before everything clicks.",
  },
  {
    q: "How do I get started?",
    a: "Fill out our trip survey — it takes about 10 minutes and gives us everything we need to start your traveler profile. Your advisor will be in touch within 24 hours.",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center text-white pt-16">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(201,168,76,0.3) 0%, transparent 50%),
                              radial-gradient(circle at 75% 75%, rgba(201,168,76,0.3) 0%, transparent 50%)`
          }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-8 text-sm text-gold-300 border border-white/20">
            <Compass className="w-4 h-4" />
            Boutique Travel Planning
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight mb-6">
            Travel designed around{" "}
            <span className="text-gold-400">how you actually</span>{" "}
            want to experience it.
          </h1>

          <p className="text-lg sm:text-xl text-primary-200 max-w-2xl mx-auto mb-10 leading-relaxed">
            We take the time to understand who you are as a traveler — your pace, passions,
            and what you want to feel — then we build the trip that's been waiting for you.
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
              <span>Dedicated advisor within 24 hours</span>
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
              From dream to departure
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Most travel planning starts with destinations. We start with you.
              Here's how it works.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", icon: "📋", title: "Tell Us About You", desc: "Fill out our thoughtful 10-minute survey. Your travel history, preferences, must-haves, and the feeling you're after." },
              { step: "02", icon: "🔍", title: "We Build Your Profile", desc: "Your advisor analyzes your responses and creates a personalized traveler profile with matched destinations and styles." },
              { step: "03", icon: "✈️", title: "Collaborative Design", desc: "We craft an itinerary with you — sharing ideas, refining details, adding magic. We iterate until it feels exactly right." },
              { step: "04", icon: "🌍", title: "You Travel, We Support", desc: "We handle all bookings, confirmations, and logistics. 24/7 trip support means we're with you every step of the way." },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-md text-3xl mb-4 border border-sand-200">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-gold-500 mb-2">{item.step}</div>
                <h3 className="text-lg font-semibold text-primary-800 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                {i < 3 && (
                  <div className="hidden md:block absolute right-0 top-8 text-gray-300 text-2xl">→</div>
                )}
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
                Most travel platforms show you the same 50 things everyone sees.
                We build journeys that match how you think, move, and feel —
                because the details that matter to you don't matter to someone else.
              </p>
              <ul className="space-y-4">
                {[
                  { icon: MapPin, text: "Hidden gems you'd never find on TripAdvisor" },
                  { icon: Clock, text: "The right pace for how you actually travel" },
                  { icon: Utensils, text: "Restaurants that locals actually love" },
                  { icon: Camera, text: "Experiences crafted for your specific interests" },
                  { icon: Waves, text: "Properties with character, not just star ratings" },
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
                  <div className="text-xs text-primary-500 mt-1">8 days • Adventure</div>
                </div>
                <div className="bg-gold-50 rounded-2xl p-6 h-36 flex flex-col justify-end">
                  <div className="text-3xl mb-2">🏰</div>
                  <div className="font-serif font-semibold text-primary-800">Loire Valley</div>
                  <div className="text-xs text-primary-500 mt-1">5 days • Cultural</div>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="bg-sand-200 rounded-2xl p-6 h-36 flex flex-col justify-end">
                  <div className="text-3xl mb-2">⛵</div>
                  <div className="font-serif font-semibold text-primary-800">Greek Islands</div>
                  <div className="text-xs text-primary-500 mt-1">10 days • Romantic</div>
                </div>
                <div className="bg-primary-900 rounded-2xl p-6 h-48 flex flex-col justify-end">
                  <div className="text-4xl mb-2">🗼</div>
                  <div className="font-serif font-semibold text-white">Tokyo & Kyoto</div>
                  <div className="text-xs text-primary-300 mt-1">12 days • Cultural</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trip Styles */}
      <section id="trip-styles" className="py-24 bg-sand-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-gold-600 text-sm font-semibold uppercase tracking-wider mb-3">Find Your Style</p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-primary-900 mb-4">
              Every kind of traveler, served well
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Whether you're chasing adventure, romance, history, or simply stillness —
              we know how to build it beautifully.
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

      {/* Featured Destinations */}
      <section id="destinations" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-gold-600 text-sm font-semibold uppercase tracking-wider mb-3">Where We Go</p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-primary-900 mb-4">
              Destinations we know deeply
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              We don't claim to know every corner of the world. These are the places
              where our expertise runs deep and our recommendations go beyond the obvious.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((dest, i) => (
              <div
                key={i}
                className={`bg-gradient-to-br ${dest.image} rounded-2xl p-6 text-white relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform`}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="relative z-10">
                  <span className="text-4xl">{dest.emoji}</span>
                  <div className="mt-8">
                    <div className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">{dest.style}</div>
                    <h3 className="text-xl font-serif font-bold">{dest.name}</h3>
                    <p className="text-sm text-white/80 mt-1">{dest.tagline}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button asChild variant="outline" size="lg" className="border-primary-200 text-primary-700 hover:bg-primary-50">
              <Link href="/survey">
                Tell us where you want to go
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-primary-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-gold-400 text-sm font-semibold uppercase tracking-wider mb-3">Client Stories</p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
              Trips that stay with you
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-primary-800 rounded-xl p-6 border border-primary-700">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-gold-400 text-gold-400" />
                  ))}
                </div>
                <p className="text-primary-200 text-sm leading-relaxed mb-6 italic">
                  "{t.quote}"
                </p>
                <div>
                  <div className="font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-primary-400 mt-0.5">{t.trip}</div>
                </div>
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
              Everything you want to know
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
      <section className="py-24 bg-gradient-to-r from-primary-800 to-primary-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
            Ready to stop planning and start traveling?
          </h2>
          <p className="text-primary-300 text-lg mb-10 max-w-xl mx-auto">
            Fill out our survey — it takes 10 minutes and gives us everything
            we need to design your perfect trip.
          </p>
          <Button asChild variant="gold" size="xl" className="shadow-2xl">
            <Link href="/survey">
              Begin My Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <p className="text-primary-400 text-sm mt-4">
            Free to start. Your advisor will be in touch within 24 hours.
          </p>
        </div>
      </section>
    </div>
  )
}
