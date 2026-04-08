"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus } from "lucide-react"
import { createTemplate, updateTemplate } from "@/actions/templates"
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
  template?: any
  trigger?: React.ReactNode
}

export function TemplateFormDialog({ template, trigger }: Props) {
  const isEdit = !!template
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [title, setTitle] = useState(template?.title || "")
  const [destination, setDestination] = useState(template?.destination || "")
  const [country, setCountry] = useState(template?.country || "")
  const [flagEmoji, setFlagEmoji] = useState(template?.flagEmoji || "")
  const [summary, setSummary] = useState(template?.summary || "")
  const [description, setDescription] = useState(template?.description || "")
  const [durationDays, setDurationDays] = useState(template?.durationDays || 7)
  const [basePrice, setBasePrice] = useState(template?.basePrice || "")
  const [styles, setStyles] = useState<string[]>(parseJson(template?.travelStyles, []))
  const [types, setTypes] = useState<string[]>(parseJson(template?.travelerTypes, []))
  const [budget, setBudget] = useState(template?.budgetLevel || "FIVE_TO_10K")
  const [pace, setPace] = useState(template?.paceLevel || "moderate")
  const [isFeatured, setIsFeatured] = useState(template?.isFeatured || false)
  const [isBestSeller, setIsBestSeller] = useState(template?.isBestSeller || false)
  const [isSignature, setIsSignature] = useState(template?.isSignature || false)
  const [highlights, setHighlights] = useState(parseJson(template?.highlights, []).join("\n"))
  const [includes, setIncludes] = useState(parseJson(template?.includes, []).join("\n"))

  const toggleChip = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val])
  }

  const handleSubmit = async () => {
    if (!title.trim() || !destination.trim()) {
      toast.error("Title and destination are required")
      return
    }
    setLoading(true)
    try {
      const input = {
        title, destination,
        country: country || destination.split(",")[0].trim(),
        flagEmoji: flagEmoji || undefined,
        summary: summary || `${destination} — ${durationDays} day itinerary`,
        description: description || summary || "",
        durationDays: Number(durationDays),
        travelStyles: styles,
        travelerTypes: types,
        budgetLevel: budget,
        paceLevel: pace,
        isFeatured, isBestSeller, isSignature,
        highlights: highlights.split("\n").filter(Boolean),
        includes: includes.split("\n").filter(Boolean),
        basePrice: basePrice ? Number(basePrice) : undefined,
      }
      if (isEdit) {
        await updateTemplate(template.id, input)
        toast.success("Template updated")
      } else {
        await createTemplate(input)
        toast.success("Template created")
      }
      setOpen(false)
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="navy"><Plus className="w-4 h-4 mr-1" /> New Template</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-serif">{isEdit ? "Edit Template" : "New Template"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-1">
          {/* Name + destination */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Template Name *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Paris & Provence Slow Luxury" className="text-base h-11" />
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-2">
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Destination *</Label>
              <Input value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g., Paris & Provence" className="text-base" />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Country</Label>
              <Input value={country} onChange={e => setCountry(e.target.value)} placeholder="France" className="text-base" />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Flag</Label>
              <Input value={flagEmoji} onChange={e => setFlagEmoji(e.target.value)} placeholder="🇫🇷" className="text-base text-center" />
            </div>
          </div>

          {/* Duration + price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Duration (days)</Label>
              <Input type="number" min={1} value={durationDays} onChange={e => setDurationDays(e.target.value)} className="text-base" />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Starting Price ($)</Label>
              <Input type="number" value={basePrice} onChange={e => setBasePrice(e.target.value)} placeholder="Optional" className="text-base" />
            </div>
          </div>

          {/* Travel styles — chips */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Travel Style</Label>
            <div className="flex flex-wrap gap-1.5">
              {TRAVEL_STYLES.map(s => (
                <button key={s} type="button" onClick={() => toggleChip(styles, setStyles, s)}
                  className={`text-xs rounded-full px-3 py-1.5 font-medium transition-colors ${styles.includes(s) ? "bg-primary-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >{s}</button>
              ))}
            </div>
          </div>

          {/* Traveler types — chips */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Best For</Label>
            <div className="flex flex-wrap gap-1.5">
              {TRAVELER_TYPES.map(t => (
                <button key={t} type="button" onClick={() => toggleChip(types, setTypes, t)}
                  className={`text-xs rounded-full px-3 py-1.5 font-medium transition-colors ${types.includes(t) ? "bg-primary-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >{t.replace(/_/g, " ")}</button>
              ))}
            </div>
          </div>

          {/* Budget + Pace — pill selectors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Budget Tier</Label>
              <div className="flex flex-wrap gap-1.5">
                {BUDGET_LEVELS.map(b => (
                  <button key={b.value} type="button" onClick={() => setBudget(b.value)}
                    className={`text-xs rounded-full px-3 py-1.5 font-medium transition-colors ${budget === b.value ? "bg-primary-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >{b.label}</button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Pace</Label>
              <div className="flex flex-wrap gap-1.5">
                {PACE_LEVELS.map(p => (
                  <button key={p.value} type="button" onClick={() => setPace(p.value)}
                    className={`text-xs rounded-full px-3 py-1.5 font-medium transition-colors ${pace === p.value ? "bg-primary-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >{p.label}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Summary — single textarea */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Summary</Label>
            <Textarea value={summary} onChange={e => setSummary(e.target.value)} placeholder="Brief description of this trip..." className="h-16 text-base" />
          </div>

          {/* Highlights — one per line */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Highlights</Label>
            <Textarea value={highlights} onChange={e => setHighlights(e.target.value)} placeholder={"Private Louvre tour\nMichelin dining\nWine tasting in Provence"} className="h-20 text-sm" />
            <p className="text-xs text-gray-400 mt-1">One per line</p>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer"><Switch checked={isSignature} onCheckedChange={setIsSignature} /><span className="text-sm text-gray-700">Signature</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><Switch checked={isBestSeller} onCheckedChange={setIsBestSeller} /><span className="text-sm text-gray-700">Best Seller</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><Switch checked={isFeatured} onCheckedChange={setIsFeatured} /><span className="text-sm text-gray-700">Featured</span></label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="navy" onClick={handleSubmit} disabled={loading} className="min-w-[120px]">
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Template"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
