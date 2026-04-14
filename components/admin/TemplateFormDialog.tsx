"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus, MapPin, Users, Clock, Star, DollarSign, FileText } from "lucide-react"
import { createTemplate, updateTemplate } from "@/actions/templates"
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
  { value: "fast", label: "Active & Full" },
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
  const [tab, setTab] = useState<"basics" | "style" | "content">("basics")

  const [title, setTitle] = useState(template?.title || "")
  const [destination, setDestination] = useState(template?.destination || "")
  const [country, setCountry] = useState(template?.country || "")
  const [flagEmoji, setFlagEmoji] = useState(template?.flagEmoji || "")
  const [summary, setSummary] = useState(template?.summary || "")
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

  const toggleChip = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val])
  }

  const handleSubmit = async () => {
    if (!title.trim() || !destination.trim()) {
      toast.error("Title and destination are required")
      setTab("basics")
      return
    }
    setLoading(true)
    try {
      const input = {
        title, destination,
        country: country || destination.split(",")[0].trim(),
        flagEmoji: flagEmoji || undefined,
        summary: summary || `${destination} — ${durationDays} day itinerary`,
        description: summary || "",
        durationDays: Number(durationDays),
        travelStyles: styles,
        travelerTypes: types.length > 0 ? types : ["COUPLE"],
        budgetLevel: budget,
        paceLevel: pace,
        isFeatured, isBestSeller, isSignature,
        highlights: highlights.split("\n").filter(Boolean),
        includes: [],
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

  const tabs = [
    { key: "basics" as const, label: "Trip Basics", icon: MapPin },
    { key: "style" as const, label: "Style & Fit", icon: Users },
    { key: "content" as const, label: "Details", icon: FileText },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="navy"><Plus className="w-4 h-4 mr-1" /> New Template</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-5 pb-0">
          <DialogTitle className="text-xl font-serif">{isEdit ? "Edit Template" : "New Template"}</DialogTitle>
        </DialogHeader>

        {/* Tab nav — like itinerary builder */}
        <div className="flex gap-1 px-6 pt-3 pb-2 border-b border-gray-100">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.key ? "bg-primary-50 text-primary-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* BASICS TAB */}
          {tab === "basics" && (
            <div className="space-y-5">
              {/* Name — hero field */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Template Name *</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Paris & Provence Slow Luxury" className="text-lg h-12 font-medium" />
              </div>

              {/* Destination row */}
              <div className="grid grid-cols-6 gap-3">
                <div className="col-span-3">
                  <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Destination *</Label>
                  <Input value={destination} onChange={e => setDestination(e.target.value)} placeholder="Paris & Provence" className="text-base" />
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Country</Label>
                  <Input value={country} onChange={e => setCountry(e.target.value)} placeholder="France" className="text-base" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Flag</Label>
                  <Input value={flagEmoji} onChange={e => setFlagEmoji(e.target.value)} placeholder="🇫🇷" className="text-base text-center text-xl" />
                </div>
              </div>

              {/* Duration + Price — bigger, clearer */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-sand-50 rounded-xl p-4 border border-sand-200">
                  <Label className="text-xs text-gray-500 mb-1 block flex items-center gap-1"><Clock className="w-3 h-3" /> Duration</Label>
                  <div className="flex items-baseline gap-1.5">
                    <Input type="number" min={1} value={durationDays} onChange={e => setDurationDays(e.target.value)} className="text-2xl font-bold w-20 h-10 border-0 bg-transparent p-0 focus-visible:ring-0" />
                    <span className="text-sm text-gray-500">days</span>
                  </div>
                </div>
                <div className="bg-sand-50 rounded-xl p-4 border border-sand-200">
                  <Label className="text-xs text-gray-500 mb-1 block flex items-center gap-1"><DollarSign className="w-3 h-3" /> Starting From</Label>
                  <div className="flex items-baseline gap-1">
                    <span className="text-gray-400">$</span>
                    <Input type="number" value={basePrice} onChange={e => setBasePrice(e.target.value)} placeholder="—" className="text-2xl font-bold w-28 h-10 border-0 bg-transparent p-0 focus-visible:ring-0" />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Summary</Label>
                <Textarea value={summary} onChange={e => setSummary(e.target.value)} placeholder="A brief description of what makes this trip special..." className="h-20 text-base" />
              </div>
            </div>
          )}

          {/* STYLE TAB */}
          {tab === "style" && (
            <div className="space-y-6">
              {/* Travel styles */}
              <div>
                <Label className="text-sm font-medium text-gray-900 mb-3 block">Travel Style</Label>
                <div className="flex flex-wrap gap-2">
                  {TRAVEL_STYLES.map(s => (
                    <button key={s} type="button" onClick={() => toggleChip(styles, setStyles, s)}
                      className={`text-sm rounded-full px-4 py-2 font-medium transition-all ${
                        styles.includes(s)
                          ? "bg-primary-700 text-white shadow-sm"
                          : "bg-gray-50 text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-700"
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Traveler types */}
              <div>
                <Label className="text-sm font-medium text-gray-900 mb-3 block">Best For</Label>
                <div className="flex flex-wrap gap-2">
                  {TRAVELER_TYPES.map(t => (
                    <button key={t.value} type="button" onClick={() => toggleChip(types, setTypes, t.value)}
                      className={`text-sm rounded-full px-4 py-2 font-medium transition-all ${
                        types.includes(t.value)
                          ? "bg-primary-700 text-white shadow-sm"
                          : "bg-gray-50 text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-700"
                      }`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget + Pace — side by side with clear segmented look */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-900 mb-3 block">Budget Tier</Label>
                  <div className="flex flex-col gap-1.5">
                    {BUDGET_LEVELS.map(b => (
                      <button key={b.value} type="button" onClick={() => setBudget(b.value)}
                        className={`text-sm text-left rounded-lg px-4 py-2.5 font-medium transition-all ${
                          budget === b.value
                            ? "bg-primary-700 text-white"
                            : "bg-gray-50 text-gray-600 border border-gray-200 hover:border-primary-300"
                        }`}>
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-900 mb-3 block">Trip Pace</Label>
                  <div className="flex flex-col gap-1.5">
                    {PACE_LEVELS.map(p => (
                      <button key={p.value} type="button" onClick={() => setPace(p.value)}
                        className={`text-sm text-left rounded-lg px-4 py-2.5 font-medium transition-all ${
                          pace === p.value
                            ? "bg-primary-700 text-white"
                            : "bg-gray-50 text-gray-600 border border-gray-200 hover:border-primary-300"
                        }`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CONTENT TAB */}
          {tab === "content" && (
            <div className="space-y-5">
              {/* Highlights */}
              <div>
                <Label className="text-sm font-medium text-gray-900 mb-1.5 block flex items-center gap-1.5"><Star className="w-4 h-4 text-gold-500" /> Trip Highlights</Label>
                <Textarea value={highlights} onChange={e => setHighlights(e.target.value)} placeholder={"Private Louvre tour before crowds\nMichelin dining in Paris\nLavender fields of Provence\nWine tasting in Chateauneuf-du-Pape"} className="h-32 text-sm leading-relaxed" />
                <p className="text-xs text-gray-400 mt-1">One highlight per line — these show on the template card</p>
              </div>

              {/* Labels */}
              <div>
                <Label className="text-sm font-medium text-gray-900 mb-3 block">Template Labels</Label>
                <div className="flex items-center gap-5">
                  <label className="flex items-center gap-2.5 cursor-pointer bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-200 hover:border-primary-300 transition-colors">
                    <Switch checked={isSignature} onCheckedChange={setIsSignature} />
                    <span className="text-sm text-gray-700">Signature Trip</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-200 hover:border-primary-300 transition-colors">
                    <Switch checked={isBestSeller} onCheckedChange={setIsBestSeller} />
                    <span className="text-sm text-gray-700">Best Seller</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-200 hover:border-primary-300 transition-colors">
                    <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
                    <span className="text-sm text-gray-700">Featured</span>
                  </label>
                </div>
              </div>

              {/* Preview summary */}
              {(title || destination) && (
                <div className="bg-primary-900 text-white rounded-xl p-5">
                  <p className="text-xs text-primary-400 uppercase tracking-wide mb-2">Preview</p>
                  <div className="flex items-center gap-2 mb-1">
                    {flagEmoji && <span className="text-2xl">{flagEmoji}</span>}
                    <h3 className="font-serif font-bold text-lg">{title || "Template Name"}</h3>
                  </div>
                  <p className="text-primary-300 text-sm">{destination || "Destination"}{country ? `, ${country}` : ""}</p>
                  <div className="flex gap-3 mt-3 text-xs text-primary-400">
                    <span>{durationDays} days</span>
                    <span>{BUDGET_LEVELS.find(b => b.value === budget)?.label}</span>
                    <span>{PACE_LEVELS.find(p => p.value === pace)?.label}</span>
                    {basePrice && <span className="text-gold-300">from ${Number(basePrice).toLocaleString()}</span>}
                  </div>
                  {styles.length > 0 && (
                    <div className="flex gap-1.5 mt-2">
                      {styles.map(s => <span key={s} className="text-xs bg-white/10 rounded-full px-2 py-0.5">{s}</span>)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <div className="text-xs text-gray-400">
            {styles.length} style{styles.length !== 1 ? "s" : ""} · {types.length} traveler type{types.length !== 1 ? "s" : ""} · {durationDays} days
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="navy" onClick={handleSubmit} disabled={loading} className="min-w-[120px]">
              {loading ? "Saving..." : isEdit ? "Save Template" : "Create Template"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
