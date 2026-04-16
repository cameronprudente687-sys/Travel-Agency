"use client"

import { useState, useTransition } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Bookmark, Calendar, Hotel, Sparkles, MapPin, Star } from "lucide-react"
import { saveVersionAsTemplate } from "@/actions/templates"
import { toast } from "sonner"

const TRAVEL_STYLES = ["LUXURY", "ADVENTURE", "CULTURAL", "ROMANTIC", "FAMILY", "SOLO", "WELLNESS", "FOODIE", "SCENIC"]
const TRAVELER_TYPES = [
  { value: "COUPLE", label: "Couples" },
  { value: "SOLO", label: "Solo" },
  { value: "FAMILY_YOUNG_KIDS", label: "Families (kids)" },
  { value: "FAMILY_TEENS", label: "Families (teens)" },
  { value: "GROUP_FRIENDS", label: "Friend Groups" },
  { value: "MULTI_GEN", label: "Multi-Gen" },
  { value: "HONEYMOON", label: "Honeymoon" },
  { value: "ANNIVERSARY", label: "Anniversary" },
]
const PACE_LEVELS = [
  { value: "slow", label: "Slow & Deep" },
  { value: "moderate", label: "Balanced" },
  { value: "fast", label: "Active & Full" },
]

function parseJson(val: any, fb: any) {
  if (!val) return fb
  try { return typeof val === "string" ? JSON.parse(val) : val } catch { return fb }
}

interface Props {
  version: any
  trigger?: React.ReactNode
}

export function SaveAsTemplateDialog({ version, trigger }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const destinations = parseJson(version.destinations, [])
  const itinerary = parseJson(version.itinerary, [])
  const hotels = parseJson(version.hotelIdeas, [])
  const experiences = parseJson(version.experiences, [])

  const [title, setTitle] = useState(version.title || "")
  const [destination, setDestination] = useState(destinations.join(", "))
  const [country, setCountry] = useState("")
  const [flagEmoji, setFlagEmoji] = useState("")
  const [styles, setStyles] = useState<string[]>([])
  const [types, setTypes] = useState<string[]>([])
  const [pace, setPace] = useState("moderate")
  const [isSignature, setIsSignature] = useState(false)
  const [isBestSeller, setIsBestSeller] = useState(false)

  const toggleChip = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val])
  }

  const handleSave = () => {
    if (!title.trim() || !destination.trim()) {
      toast.error("Template name and destination are required")
      return
    }
    startTransition(async () => {
      try {
        await saveVersionAsTemplate(version.id, {
          title, destination, country: country || destination.split(",")[0].trim(),
          flagEmoji: flagEmoji || undefined,
          travelStyles: styles, travelerTypes: types.length > 0 ? types : ["COUPLE"],
          budgetLevel: "FIVE_TO_10K", paceLevel: pace,
          isSignature, isBestSeller,
        })
        toast.success("Template saved! Find it in your Template Library.")
        setOpen(false)
      } catch {
        toast.error("Failed to save template")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Bookmark className="w-3.5 h-3.5 mr-1" /> Save as Template
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-5 pb-0">
          <DialogTitle className="text-xl font-serif">Save as Reusable Template</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">Turn this itinerary into a trip starter you can reuse for future clients.</p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* What's being saved — visual hero */}
          <div className="bg-primary-900 text-white rounded-xl p-5">
            <div className="flex items-center gap-4">
              {flagEmoji && <span className="text-4xl">{flagEmoji}</span>}
              <div className="flex-1">
                <h3 className="font-serif font-bold text-lg">{title || "Template Name"}</h3>
                <p className="text-primary-300 text-sm">{destination || "Destination"}{country ? `, ${country}` : ""}</p>
              </div>
            </div>
            <div className="flex gap-4 mt-4 pt-3 border-t border-white/10 text-sm text-primary-300">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {itinerary.length} days</span>
              <span className="flex items-center gap-1"><Hotel className="w-3.5 h-3.5" /> {hotels.length} hotels</span>
              <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> {experiences.length} experiences</span>
              {version.estimatedCost && <span className="ml-auto text-gold-300">from ${version.estimatedCost.toLocaleString()}</span>}
            </div>
          </div>

          <p className="text-xs text-gray-400 -mt-3">Client-specific details are automatically excluded from the template.</p>

          {/* Template name + destination */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Template Name *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Romantic Italy: Rome & Amalfi" className="text-lg h-12 font-medium" />
          </div>

          <div className="grid grid-cols-6 gap-3">
            <div className="col-span-3">
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Destination *</Label>
              <Input value={destination} onChange={e => setDestination(e.target.value)} placeholder="Rome & Amalfi Coast" className="text-base" />
            </div>
            <div className="col-span-2">
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Country</Label>
              <Input value={country} onChange={e => setCountry(e.target.value)} placeholder="Italy" className="text-base" />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Flag</Label>
              <Input value={flagEmoji} onChange={e => setFlagEmoji(e.target.value)} placeholder="🇮🇹" className="text-base text-center text-xl" />
            </div>
          </div>

          {/* Travel style */}
          <div>
            <Label className="text-sm font-medium text-gray-900 mb-3 block">Travel Style</Label>
            <div className="flex flex-wrap gap-2">
              {TRAVEL_STYLES.map(s => (
                <button key={s} type="button" onClick={() => toggleChip(styles, setStyles, s)}
                  className={`text-sm rounded-full px-4 py-2 font-medium transition-all ${
                    styles.includes(s) ? "bg-primary-700 text-white shadow-sm" : "bg-gray-50 text-gray-600 border border-gray-200 hover:border-primary-300"
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Best for */}
          <div>
            <Label className="text-sm font-medium text-gray-900 mb-3 block">Best For</Label>
            <div className="flex flex-wrap gap-2">
              {TRAVELER_TYPES.map(t => (
                <button key={t.value} type="button" onClick={() => toggleChip(types, setTypes, t.value)}
                  className={`text-sm rounded-full px-4 py-2 font-medium transition-all ${
                    types.includes(t.value) ? "bg-primary-700 text-white shadow-sm" : "bg-gray-50 text-gray-600 border border-gray-200 hover:border-primary-300"
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pace */}
          <div>
            <Label className="text-sm font-medium text-gray-900 mb-3 block">Trip Pace</Label>
            <div className="flex gap-2">
              {PACE_LEVELS.map(p => (
                <button key={p.value} type="button" onClick={() => setPace(p.value)}
                  className={`flex-1 text-sm rounded-lg px-4 py-2.5 font-medium text-center transition-all ${
                    pace === p.value ? "bg-primary-700 text-white" : "bg-gray-50 text-gray-600 border border-gray-200 hover:border-primary-300"
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Labels */}
          <div className="flex items-center gap-5">
            <label className="flex items-center gap-2.5 cursor-pointer bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-200 hover:border-primary-300 transition-colors">
              <Switch checked={isSignature} onCheckedChange={setIsSignature} />
              <span className="text-sm text-gray-700">Signature Trip</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-200 hover:border-primary-300 transition-colors">
              <Switch checked={isBestSeller} onCheckedChange={setIsBestSeller} />
              <span className="text-sm text-gray-700">Best Seller</span>
            </label>
          </div>

          {/* Day preview */}
          {itinerary.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-2 block flex items-center gap-1"><Star className="w-4 h-4 text-gold-500" /> Days included in this template</Label>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {itinerary.slice(0, 10).map((day: any, i: number) => (
                  <div key={i} className="flex items-center gap-1.5 bg-sand-50 border border-sand-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-600 whitespace-nowrap shrink-0">
                    <span className="w-5 h-5 rounded-full bg-primary-700 text-white text-xs flex items-center justify-center font-bold">{day.day || i + 1}</span>
                    {day.title || day.location || `Day ${i + 1}`}
                  </div>
                ))}
                {itinerary.length > 10 && <span className="text-xs text-gray-400 self-center">+{itinerary.length - 10}</span>}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-400">{itinerary.length} days · {styles.length} style{styles.length !== 1 ? "s" : ""} · {types.length} traveler type{types.length !== 1 ? "s" : ""}</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="navy" onClick={handleSave} disabled={isPending} className="min-w-[160px]">
              {isPending ? "Saving..." : "Save as Template"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
