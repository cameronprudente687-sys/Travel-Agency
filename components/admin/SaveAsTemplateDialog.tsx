"use client"

import { useState, useTransition } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Bookmark } from "lucide-react"
import { saveVersionAsTemplate } from "@/actions/templates"
import { toast } from "sonner"

const TRAVEL_STYLES = ["LUXURY", "ADVENTURE", "CULTURAL", "ROMANTIC", "FAMILY", "SOLO", "WELLNESS", "FOODIE", "SCENIC"]
const TRAVELER_TYPES = ["COUPLE", "SOLO", "FAMILY_YOUNG_KIDS", "FAMILY_TEENS", "GROUP_FRIENDS", "MULTI_GEN", "HONEYMOON", "ANNIVERSARY"]
const BUDGET_LEVELS = [
  { value: "UNDER_3K", label: "Budget" },
  { value: "THREE_TO_5K", label: "Mid-Range" },
  { value: "FIVE_TO_10K", label: "Premium" },
  { value: "TEN_TO_20K", label: "Luxury" },
  { value: "OVER_20K", label: "Ultra Luxury" },
]
const PACE_LEVELS = [
  { value: "slow", label: "Slow & Deep" },
  { value: "moderate", label: "Balanced" },
  { value: "fast", label: "Active" },
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

  // Pre-fill from version data
  const destinations = parseJson(version.destinations, [])
  const [title, setTitle] = useState(version.title || "")
  const [destination, setDestination] = useState(destinations.join(", "))
  const [country, setCountry] = useState("")
  const [flagEmoji, setFlagEmoji] = useState("")
  const [styles, setStyles] = useState<string[]>([])
  const [types, setTypes] = useState<string[]>([])
  const [budget, setBudget] = useState("FIVE_TO_10K")
  const [pace, setPace] = useState("moderate")
  const [isSignature, setIsSignature] = useState(false)
  const [isBestSeller, setIsBestSeller] = useState(false)

  const toggleChip = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val])
  }

  const handleSave = () => {
    if (!title.trim() || !destination.trim()) {
      toast.error("Title and destination are required")
      return
    }
    startTransition(async () => {
      try {
        await saveVersionAsTemplate(version.id, {
          title, destination, country: country || destination.split(",")[0].trim(),
          flagEmoji: flagEmoji || undefined,
          travelStyles: styles, travelerTypes: types,
          budgetLevel: budget, paceLevel: pace,
          isSignature, isBestSeller,
        })
        toast.success("Saved as template!")
        setOpen(false)
      } catch {
        toast.error("Failed to save as template")
      }
    })
  }

  // Count what will be copied
  const itinerary = parseJson(version.itinerary, [])
  const hotels = parseJson(version.hotelIdeas, [])
  const experiences = parseJson(version.experiences, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Bookmark className="w-3.5 h-3.5 mr-1" /> Save as Template
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-serif">Save Itinerary as Template</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-1">
          {/* What gets saved — visual summary */}
          <div className="bg-primary-50 rounded-lg p-3 flex items-center gap-4 text-sm">
            <div className="text-center"><div className="text-lg font-bold text-primary-700">{itinerary.length}</div><div className="text-xs text-primary-500">days</div></div>
            <div className="text-center"><div className="text-lg font-bold text-primary-700">{hotels.length}</div><div className="text-xs text-primary-500">hotels</div></div>
            <div className="text-center"><div className="text-lg font-bold text-primary-700">{experiences.length}</div><div className="text-xs text-primary-500">experiences</div></div>
            <div className="text-xs text-primary-600 ml-auto">Client details excluded</div>
          </div>

          {/* Title */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Template Name *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Romantic Italy: Rome & Amalfi" className="text-base h-11" />
          </div>

          {/* Destination + emoji — side by side */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Destination *</Label>
              <Input value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g., Rome & Amalfi Coast" className="text-base" />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Flag</Label>
              <Input value={flagEmoji} onChange={e => setFlagEmoji(e.target.value)} placeholder="🇮🇹" className="text-base text-center" />
            </div>
          </div>

          {/* Travel styles — chip selector */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Travel Style</Label>
            <div className="flex flex-wrap gap-1.5">
              {TRAVEL_STYLES.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleChip(styles, setStyles, s)}
                  className={`text-xs rounded-full px-3 py-1.5 font-medium transition-colors ${
                    styles.includes(s)
                      ? "bg-primary-700 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Traveler types — chip selector */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Best For</Label>
            <div className="flex flex-wrap gap-1.5">
              {TRAVELER_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleChip(types, setTypes, t)}
                  className={`text-xs rounded-full px-3 py-1.5 font-medium transition-colors ${
                    types.includes(t)
                      ? "bg-primary-700 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {t.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Budget + Pace — pill selectors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Budget Tier</Label>
              <div className="flex flex-wrap gap-1.5">
                {BUDGET_LEVELS.map(b => (
                  <button
                    key={b.value}
                    type="button"
                    onClick={() => setBudget(b.value)}
                    className={`text-xs rounded-full px-3 py-1.5 font-medium transition-colors ${
                      budget === b.value
                        ? "bg-primary-700 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Pace</Label>
              <div className="flex flex-wrap gap-1.5">
                {PACE_LEVELS.map(p => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPace(p.value)}
                    className={`text-xs rounded-full px-3 py-1.5 font-medium transition-colors ${
                      pace === p.value
                        ? "bg-primary-700 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Signature / Best Seller toggles */}
          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch checked={isSignature} onCheckedChange={setIsSignature} />
              <span className="text-sm text-gray-700">Signature Trip</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch checked={isBestSeller} onCheckedChange={setIsBestSeller} />
              <span className="text-sm text-gray-700">Best Seller</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="navy" onClick={handleSave} disabled={isPending} className="min-w-[140px]">
              {isPending ? "Saving..." : "Save as Template"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
