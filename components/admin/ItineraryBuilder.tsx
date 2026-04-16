"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Plus, Trash2, GripVertical, ChevronUp, ChevronDown,
  Hotel, Utensils, Sparkles, Train, MapPin, Calendar,
  FileText, ArrowRight, Copy
} from "lucide-react"
import { createVersion, updateVersion } from "@/actions/versions"
import { createTemplate } from "@/actions/templates"
import { toast } from "sonner"
import { PlacePicker } from "./PlacePicker"
import { SurveyPanel } from "./SurveyPanel"
import { saveCustomPlaceToLibrary } from "@/actions/save-to-library"

// ==================== TYPES ====================

interface DayItem {
  id: string
  title: string
  location: string
  description: string
  accommodation: string
  accommodationNote: string
  activities: string[]
  activityNotes: string[]
  meals: string[]
  mealNotes: string[]
  transports: string[]
  transportNotes: string[]
}

interface HotelItem {
  id: string
  name: string
  location: string
  description: string
  whyRecommended: string
}

interface ExperienceItem {
  id: string
  name: string
  description: string
  emoji: string
}

interface PricingData {
  flights: string
  hotels: string
  experiences: string
  transfers: string
  total: string
  notes: string
  showOnPortal: boolean
}

// ==================== HELPERS ====================

let counter = 0
const uid = () => `item_${Date.now()}_${counter++}`

function emptyDay(dayNum: number): DayItem {
  return { id: uid(), title: `Day ${dayNum}`, location: "", description: "", accommodation: "", accommodationNote: "", activities: [], activityNotes: [], meals: [], mealNotes: [], transports: [], transportNotes: [] }
}

function parseJson(val: any, fb: any) {
  if (!val) return fb
  try { return typeof val === "string" ? JSON.parse(val) : val } catch { return fb }
}

// ==================== MAIN COMPONENT ====================

interface Props {
  leadId?: string
  version?: any
  templates?: any[]
  trigger?: React.ReactNode
  survey?: any
  clientName?: string
  mode?: "version" | "template"
}

export function ItineraryBuilder({ leadId, version, templates = [], trigger, survey, clientName, mode = "version" }: Props) {
  const isTemplateMode = mode === "template"
  const isEdit = !!version
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "days" | "hotels" | "experiences" | "pricing">("overview")

  // Overview
  const [title, setTitle] = useState(version?.title || "")
  const [summary, setSummary] = useState(version?.summary || "")
  const [destinations, setDestinations] = useState(
    parseJson(version?.destinations, []).join(", ")
  )
  const [notes, setNotes] = useState(() => {
    if (version?.notes) {
      try { const p = JSON.parse(version.notes); return p.advisorNotes || "" } catch { return version.notes }
    }
    return ""
  })
  const [status, setStatus] = useState(version?.status || "draft")

  // Days
  const [days, setDays] = useState<DayItem[]>(() => {
    const parsed = parseJson(version?.itinerary, [])
    if (parsed.length > 0) {
      return parsed.map((d: any, i: number) => ({
        id: uid(),
        title: d.title || `Day ${i + 1}`,
        location: d.location || "",
        description: d.description || "",
        accommodation: d.accommodation || "",
        accommodationNote: d.accommodationNote || "",
        activities: Array.isArray(d.activities) ? d.activities : parseJson(d.activities, []),
        activityNotes: Array.isArray(d.activityNotes) ? d.activityNotes : parseJson(d.activityNotes, []),
        meals: Array.isArray(d.meals) ? d.meals : parseJson(d.meals, []),
        mealNotes: Array.isArray(d.mealNotes) ? d.mealNotes : parseJson(d.mealNotes, []),
        transports: Array.isArray(d.transports) ? d.transports : (d.transportNotes ? [d.transportNotes] : []),
        transportNotes: Array.isArray(d.transportNotes) && Array.isArray(d.transports) ? d.transportNotes : (d.transportNote ? [d.transportNote] : []),
      }))
    }
    return [emptyDay(1)]
  })

  // Hotels
  const [hotels, setHotels] = useState<HotelItem[]>(() => {
    const parsed = parseJson(version?.hotelIdeas, [])
    return parsed.map((h: any) => ({ id: uid(), name: h.name || "", location: h.location || "", description: h.description || "", whyRecommended: h.whyRecommended || "" }))
  })

  // Experiences
  const [experiences, setExperiences] = useState<ExperienceItem[]>(() => {
    const parsed = parseJson(version?.experiences, [])
    return parsed.map((e: any) => ({ id: uid(), name: e.name || "", description: e.description || "", emoji: e.emoji || "✨" }))
  })

  // Pricing
  const [pricing, setPricing] = useState<PricingData>(() => {
    // Try to load saved pricing from version notes
    if (version?.notes) {
      try {
        const parsed = JSON.parse(version.notes)
        if (parsed.pricing) return { ...parsed.pricing, showOnPortal: parsed.pricing.showOnPortal ?? false }
      } catch {}
    }
    if (version?.estimatedCost) {
      return { flights: "", hotels: "", experiences: "", transfers: "", total: `$${version.estimatedCost.toLocaleString()}`, notes: "", showOnPortal: false }
    }
    return { flights: "", hotels: "", experiences: "", transfers: "", total: "", notes: "", showOnPortal: false }
  })

  // ==================== DAY OPERATIONS ====================

  const addDay = () => {
    setDays(prev => [...prev, emptyDay(prev.length + 1)])
  }

  const removeDay = (id: string) => {
    setDays(prev => prev.filter(d => d.id !== id).map((d, i) => ({ ...d, title: d.title.match(/^Day \d+$/) ? `Day ${i + 1}` : d.title })))
  }

  const moveDay = (idx: number, dir: -1 | 1) => {
    setDays(prev => {
      const arr = [...prev]
      const target = idx + dir
      if (target < 0 || target >= arr.length) return arr
      ;[arr[idx], arr[target]] = [arr[target], arr[idx]]
      return arr
    })
  }

  const updateDay = (id: string, field: keyof DayItem, value: any) => {
    setDays(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d))
  }

  const addActivity = (dayId: string) => {
    setDays(prev => prev.map(d => d.id === dayId ? { ...d, activities: [...d.activities, ""], activityNotes: [...d.activityNotes, ""] } : d))
  }

  const updateActivity = (dayId: string, idx: number, value: string) => {
    setDays(prev => prev.map(d => d.id === dayId ? { ...d, activities: d.activities.map((a, i) => i === idx ? value : a) } : d))
  }

  const updateActivityNote = (dayId: string, idx: number, value: string) => {
    setDays(prev => prev.map(d => d.id === dayId ? { ...d, activityNotes: d.activityNotes.map((n, i) => i === idx ? value : n) } : d))
  }

  const removeActivity = (dayId: string, idx: number) => {
    setDays(prev => prev.map(d => d.id === dayId ? { ...d, activities: d.activities.filter((_, i) => i !== idx), activityNotes: d.activityNotes.filter((_, i) => i !== idx) } : d))
  }

  const addMeal = (dayId: string) => {
    setDays(prev => prev.map(d => d.id === dayId ? { ...d, meals: [...d.meals, ""], mealNotes: [...d.mealNotes, ""] } : d))
  }

  const updateMeal = (dayId: string, idx: number, value: string) => {
    setDays(prev => prev.map(d => d.id === dayId ? { ...d, meals: d.meals.map((m, i) => i === idx ? value : m) } : d))
  }

  const updateMealNote = (dayId: string, idx: number, value: string) => {
    setDays(prev => prev.map(d => d.id === dayId ? { ...d, mealNotes: d.mealNotes.map((n, i) => i === idx ? value : n) } : d))
  }

  const removeMeal = (dayId: string, idx: number) => {
    setDays(prev => prev.map(d => d.id === dayId ? { ...d, meals: d.meals.filter((_, i) => i !== idx), mealNotes: d.mealNotes.filter((_, i) => i !== idx) } : d))
  }

  const addTransport = (dayId: string) => {
    setDays(prev => prev.map(d => d.id === dayId ? { ...d, transports: [...d.transports, ""], transportNotes: [...d.transportNotes, ""] } : d))
  }

  const updateTransport = (dayId: string, idx: number, value: string) => {
    setDays(prev => prev.map(d => d.id === dayId ? { ...d, transports: d.transports.map((t, i) => i === idx ? value : t) } : d))
  }

  const updateTransportNote = (dayId: string, idx: number, value: string) => {
    setDays(prev => prev.map(d => d.id === dayId ? { ...d, transportNotes: d.transportNotes.map((n, i) => i === idx ? value : n) } : d))
  }

  const removeTransport = (dayId: string, idx: number) => {
    setDays(prev => prev.map(d => d.id === dayId ? { ...d, transports: d.transports.filter((_, i) => i !== idx), transportNotes: d.transportNotes.filter((_, i) => i !== idx) } : d))
  }

  const moveItem = (dayId: string, field: "activities" | "meals" | "transports", idx: number, dir: -1 | 1) => {
    const notesField = field === "activities" ? "activityNotes" : field === "meals" ? "mealNotes" : "transportNotes"
    setDays(prev => prev.map(d => {
      if (d.id !== dayId) return d
      const arr = [...d[field]]
      const notes = [...(d as any)[notesField]]
      const target = idx + dir
      if (target < 0 || target >= arr.length) return d
      ;[arr[idx], arr[target]] = [arr[target], arr[idx]]
      ;[notes[idx], notes[target]] = [notes[target], notes[idx]]
      return { ...d, [field]: arr, [notesField]: notes }
    }))
  }

  // ==================== HOTEL OPERATIONS ====================

  const addHotel = () => {
    setHotels(prev => [...prev, { id: uid(), name: "", location: "", description: "", whyRecommended: "" }])
  }

  const removeHotel = (id: string) => setHotels(prev => prev.filter(h => h.id !== id))

  const updateHotel = (id: string, field: keyof HotelItem, value: string) => {
    setHotels(prev => prev.map(h => h.id === id ? { ...h, [field]: value } : h))
  }

  const insertSavedHotel = (place: any) => {
    setHotels(prev => [...prev, {
      id: uid(), name: place.name, location: `${place.destination}, ${place.country}`,
      description: place.description, whyRecommended: place.whyWeRecommend,
    }])
    toast.success(`Added ${place.name}`)
  }

  // ==================== EXPERIENCE OPERATIONS ====================

  const addExperience = () => {
    setExperiences(prev => [...prev, { id: uid(), name: "", description: "", emoji: "✨" }])
  }

  const removeExperience = (id: string) => setExperiences(prev => prev.filter(e => e.id !== id))

  const updateExperience = (id: string, field: keyof ExperienceItem, value: string) => {
    setExperiences(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e))
  }

  const insertSavedExperience = (place: any) => {
    setExperiences(prev => [...prev, {
      id: uid(), name: place.name, description: place.whyWeRecommend || place.description, emoji: "✨",
    }])
    toast.success(`Added ${place.name}`)
  }

  // ==================== INSERT SAVED PLACE INTO DAY ====================

  const insertPlaceIntoDay = (dayId: string, place: any) => {
    const isHotel = ["HOTEL", "RESORT", "BOUTIQUE_HOTEL", "VILLA"].includes(place.category)
    const isDining = ["RESTAURANT", "CAFE", "BAR"].includes(place.category)

    if (isHotel) {
      // Set as accommodation AND add as an activity so it's visually obvious
      setDays(prev => prev.map(d => d.id === dayId
        ? { ...d, accommodation: place.name, activities: [...d.activities, `Check in: ${place.name}`] }
        : d))
      // Also add to the trip-level hotels list
      const alreadyAdded = hotels.some(h => h.name === place.name)
      if (!alreadyAdded) {
        setHotels(prev => [...prev, {
          id: uid(), name: place.name, location: `${place.destination}, ${place.country}`,
          description: place.description, whyRecommended: place.whyWeRecommend,
        }])
      }
      toast.success(`Added ${place.name} to Day ${days.findIndex(d => d.id === dayId) + 1}`)
    } else if (isDining) {
      setDays(prev => prev.map(d => d.id === dayId
        ? { ...d, meals: [...d.meals, place.name] }
        : d))
      toast.success(`Added ${place.name} to Day ${days.findIndex(d => d.id === dayId) + 1}`)
    } else {
      setDays(prev => prev.map(d => d.id === dayId
        ? { ...d, activities: [...d.activities, place.name] }
        : d))
      toast.success(`Added ${place.name} to Day ${days.findIndex(d => d.id === dayId) + 1}`)
    }
  }

  // ==================== SAVE TO LIBRARY ====================

  const saveToLibrary = async (name: string, category: string) => {
    if (!name.trim()) return
    const dest = destinations.split(",")[0]?.trim() || "Unknown"
    try {
      await saveCustomPlaceToLibrary({
        name: name.trim(),
        destination: dest,
        country: "",
        category,
      })
      toast.success(`Saved "${name}" to your library`)
    } catch {
      toast.error("Failed to save")
    }
  }

  // ==================== LOAD FROM TEMPLATE ====================

  const loadFromTemplate = (template: any) => {
    setTitle(template.title || "")
    setSummary(template.summary || "")
    setDestinations(template.destination || "")

    const templateDays = template.days || []
    if (templateDays.length > 0) {
      setDays(templateDays.sort((a: any, b: any) => a.dayNumber - b.dayNumber).map((d: any) => ({
        id: uid(),
        title: d.title || `Day ${d.dayNumber}`,
        location: d.location || "",
        description: d.description || "",
        accommodation: d.accommodation || "",
        accommodationNote: "",
        activities: parseJson(d.activities, []),
        activityNotes: [],
        meals: parseJson(d.meals, []),
        mealNotes: [],
        transports: d.transportNotes ? [d.transportNotes] : [],
        transportNotes: [],
      })))
    }

    toast.success(`Loaded template: ${template.title}`)
    setActiveTab("days")
  }

  // ==================== SAVE ====================

  const handleSave = async () => {
    if (!title.trim()) { toast.error("Please add a trip title"); return }
    setLoading(true)
    try {
      const destArr = destinations.split(",").map((d: string) => d.trim()).filter(Boolean)

      const totalEstimate = pricing.total
        ? parseFloat(pricing.total.replace(/[^0-9.]/g, "")) || undefined
        : undefined

      const input = {
        title,
        summary: summary || `${destArr.join(" & ")} — ${days.length} day itinerary`,
        destinations: destArr,
        durationDays: days.length,
        estimatedCost: totalEstimate,
        notes: JSON.stringify({
          pricing: { flights: pricing.flights, hotels: pricing.hotels, experiences: pricing.experiences, transfers: pricing.transfers, total: pricing.total, notes: pricing.notes, showOnPortal: pricing.showOnPortal },
          advisorNotes: notes,
        }),
        itinerary: days.map((d, i) => ({
          day: i + 1,
          title: d.title,
          location: d.location,
          description: d.description,
          accommodation: d.accommodation,
          accommodationNote: d.accommodationNote || undefined,
          activities: d.activities.filter(Boolean),
          activityNotes: d.activityNotes.filter((_, idx) => d.activities[idx]),
          meals: d.meals.filter(Boolean),
          mealNotes: d.mealNotes.filter((_, idx) => d.meals[idx]),
          transports: d.transports.filter(Boolean),
          transportNotes: d.transportNotes.filter((_, idx) => d.transports[idx]),
          // Legacy compat: also save first transport as transportNotes string
          ...(d.transports[0] ? { transportNotesLegacy: d.transports[0] } : {}),
        })),
        hotelIdeas: hotels.filter(h => h.name).map(h => ({
          name: h.name, location: h.location, description: h.description, whyRecommended: h.whyRecommended,
        })),
        experiences: experiences.filter(e => e.name).map(e => ({
          name: e.name, description: e.description, emoji: e.emoji,
        })),
        status,
      }

      if (isTemplateMode) {
        await createTemplate({
          title,
          destination: destArr.join(", "),
          country: destArr[0] || "",
          summary: input.summary,
          description: input.summary,
          durationDays: days.length,
          travelStyles: [],
          travelerTypes: ["COUPLE"],
          budgetLevel: "FIVE_TO_10K",
          paceLevel: "moderate",
          highlights: experiences.filter(e => e.name).map(e => e.name),
          includes: [],
        }, days.map((d, i) => ({
          dayNumber: i + 1,
          title: d.title,
          location: d.location,
          description: d.description,
          activities: d.activities.filter(Boolean),
          meals: d.meals.filter(Boolean),
          accommodation: d.accommodation,
          transportNotes: d.transports.filter(Boolean).join("; "),
        })))
        toast.success("Saved to your Trip Library!")
      } else if (isEdit) {
        await updateVersion(version.id, leadId!, input)
        toast.success("Itinerary updated")
      } else {
        await createVersion(leadId!, input)
        toast.success("Itinerary created")
      }
      setOpen(false)
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  // ==================== TAB CONFIG ====================

  // Count all items including day-level ones
  const totalHotels = hotels.length + days.filter(d => d.accommodation).length
  const totalMeals = days.reduce((sum, d) => sum + d.meals.filter(Boolean).length, 0)
  const totalExperiences = experiences.length + days.reduce((sum, d) => sum + d.activities.filter(Boolean).length, 0)

  const tabs = [
    { key: "overview" as const, label: "Trip Overview", icon: FileText },
    { key: "days" as const, label: `Days (${days.length})`, icon: Calendar },
    { key: "hotels" as const, label: `Hotels (${totalHotels})`, icon: Hotel },
    { key: "experiences" as const, label: `Experiences (${totalExperiences})`, icon: Sparkles },
    { key: "pricing" as const, label: "Pricing", icon: MapPin },
  ]

  // ==================== RENDER ====================

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="navy" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Build Itinerary
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className={`${survey ? "max-w-6xl" : "max-w-4xl"} max-h-[90vh] overflow-hidden flex flex-col p-0`}>
        <DialogHeader className="px-6 pt-5 pb-0">
          <DialogTitle className="text-xl font-serif">
            {isTemplateMode ? "Build New Trip" : isEdit ? "Edit Itinerary" : "Build New Itinerary"}
          </DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex gap-1 px-6 pt-3 pb-2 border-b border-gray-100 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
        {/* Main builder content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Start from Template */}
          {!isEdit && activeTab === "overview" && templates.length > 0 && (
            <div className="mb-6 bg-sand-50 rounded-xl border border-sand-200 p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Start from a template</p>
              <div className="flex flex-wrap gap-2">
                {templates.slice(0, 8).map((t: any) => (
                  <button
                    key={t.id}
                    onClick={() => loadFromTemplate(t)}
                    className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1.5 hover:border-primary-300 hover:text-primary-700 transition-colors flex items-center gap-1"
                  >
                    {t.flagEmoji} {t.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-5">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Trip Title *</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Romantic Italy: Rome & Amalfi Coast" className="text-base h-11" />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Destinations</Label>
                <Input value={destinations} onChange={e => setDestinations(e.target.value)} placeholder="e.g., Rome, Amalfi Coast, Capri" className="text-base" />
                <p className="text-xs text-gray-400 mt-1">Comma-separated</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Trip Summary</Label>
                <Textarea value={summary} onChange={e => setSummary(e.target.value)} placeholder="Brief overview of this trip version..." className="h-24 text-base" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="text-base"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="finalized">Finalized</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Days</Label>
                  <div className="text-2xl font-bold text-primary-700 mt-1">{days.length} days</div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Advisor Notes (internal)</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Internal planning notes..." className="h-20 text-base" />
              </div>
            </div>
          )}

          {/* DAYS TAB */}
          {activeTab === "days" && (
            <div className="space-y-4">
              {days.map((day, idx) => (
                <div key={day.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* Day Header */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-primary-50 border-b border-primary-100">
                    <div className="w-8 h-8 rounded-full bg-primary-700 text-white text-sm font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <Input
                      value={day.title}
                      onChange={e => updateDay(day.id, "title", e.target.value)}
                      className="flex-1 bg-transparent border-0 text-base font-semibold text-primary-900 focus-visible:ring-0 px-1 h-8"
                      placeholder="Day title"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => moveDay(idx, -1)} disabled={idx === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                      <button onClick={() => moveDay(idx, 1)} disabled={idx === days.length - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
                      {days.length > 1 && (
                        <button onClick={() => removeDay(day.id)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                  </div>

                  {/* Day Body */}
                  <div className="p-4 space-y-4">
                    {/* Location + Description */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-gray-500 mb-1 block">Location</Label>
                        <Input value={day.location} onChange={e => updateDay(day.id, "location", e.target.value)} placeholder="e.g., Rome" className="text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500 mb-1 block">Description</Label>
                        <Input value={day.description} onChange={e => updateDay(day.id, "description", e.target.value)} placeholder="What happens this day..." className="text-sm" />
                      </div>
                    </div>

                    {/* HOTEL — clear dedicated section */}
                    <div className="bg-primary-50/50 rounded-lg p-3 border border-primary-100">
                      <Label className="text-xs text-primary-700 font-semibold mb-1.5 block flex items-center gap-1"><Hotel className="w-3.5 h-3.5" /> Where to Stay</Label>
                      <Input value={day.accommodation} onChange={e => updateDay(day.id, "accommodation", e.target.value)} placeholder="Type a hotel name or use 'From Saved' below" className="text-sm" />
                      {day.accommodation && (
                        <Input value={day.accommodationNote} onChange={e => updateDay(day.id, "accommodationNote", e.target.value)} placeholder="Note: e.g., ocean view room, spa property" className="text-xs text-gray-500 border-0 border-b border-gray-200 rounded-none px-0 h-7 focus-visible:ring-0 mt-1 mb-1 italic" />
                      )}
                      <div className="flex gap-3 items-center">
                        <PlacePicker mode="hotel" onSelect={(p) => insertPlaceIntoDay(day.id, p)} trigger={
                          <button type="button" className="text-xs text-primary-600 hover:text-primary-800 flex items-center gap-1"><Hotel className="w-3 h-3" /> From saved</button>
                        } />
                        {day.accommodation && (
                          <button type="button" onClick={() => saveToLibrary(day.accommodation, "HOTEL")} className="text-xs text-gray-400 hover:text-green-600 flex items-center gap-1">
                            <Plus className="w-3 h-3" /> Save to library
                          </button>
                        )}
                      </div>
                    </div>

                    {/* RESTAURANTS — clear dedicated section */}
                    <div className="bg-amber-50/50 rounded-lg p-3 border border-amber-100">
                      <Label className="text-xs text-amber-700 font-semibold mb-1.5 block flex items-center gap-1"><Utensils className="w-3.5 h-3.5" /> Where to Eat</Label>
                      <div className="space-y-1.5">
                        {day.meals.map((meal, mi) => (
                          <div key={mi}>
                            <div className="flex items-center gap-1">
                              <div className="flex flex-col shrink-0">
                                <button onClick={() => moveItem(day.id, "meals", mi, -1)} disabled={mi === 0} className="text-gray-300 hover:text-gray-500 disabled:opacity-0 p-0.5"><ChevronUp className="w-3 h-3" /></button>
                                <button onClick={() => moveItem(day.id, "meals", mi, 1)} disabled={mi === day.meals.length - 1} className="text-gray-300 hover:text-gray-500 disabled:opacity-0 p-0.5"><ChevronDown className="w-3 h-3" /></button>
                              </div>
                              <Input value={meal} onChange={e => updateMeal(day.id, mi, e.target.value)} placeholder="e.g., Da Enzo al 29" className="text-sm flex-1 bg-white" />
                              {meal && <button type="button" onClick={() => saveToLibrary(meal, "RESTAURANT")} className="text-gray-300 hover:text-green-600 p-1" title="Save to library"><Plus className="w-3 h-3" /></button>}
                              <button onClick={() => removeMeal(day.id, mi)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-3 h-3" /></button>
                            </div>
                            {meal && <input value={day.mealNotes[mi] || ""} onChange={e => updateMealNote(day.id, mi, e.target.value)} placeholder="Note: e.g., great for lunch, rooftop view" className="text-xs text-gray-400 italic w-full border-0 border-b border-gray-100 ml-7 px-0 py-0.5 focus:outline-none focus:border-gray-300 bg-transparent" />}
                          </div>
                        ))}
                        <div className="flex gap-3 items-center">
                          <button onClick={() => addMeal(day.id)} className="text-xs text-amber-700 hover:text-amber-900 flex items-center gap-1 py-1"><Plus className="w-3 h-3" /> Add custom</button>
                          <PlacePicker mode="dining" onSelect={(p) => insertPlaceIntoDay(day.id, p)} trigger={
                            <button type="button" className="text-xs text-amber-600 hover:text-amber-800 flex items-center gap-1 py-1"><Utensils className="w-3 h-3" /> From saved</button>
                          } />
                        </div>
                      </div>
                    </div>

                    {/* ACTIVITIES — clear dedicated section */}
                    <div className="bg-gold-50/30 rounded-lg p-3 border border-gold-100">
                      <Label className="text-xs text-gold-700 font-semibold mb-1.5 block flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> Activities & Experiences</Label>
                      <div className="space-y-1.5">
                        {day.activities.map((act, ai) => (
                          <div key={ai}>
                            <div className="flex items-center gap-1">
                              <div className="flex flex-col shrink-0">
                                <button onClick={() => moveItem(day.id, "activities", ai, -1)} disabled={ai === 0} className="text-gray-300 hover:text-gray-500 disabled:opacity-0 p-0.5"><ChevronUp className="w-3 h-3" /></button>
                                <button onClick={() => moveItem(day.id, "activities", ai, 1)} disabled={ai === day.activities.length - 1} className="text-gray-300 hover:text-gray-500 disabled:opacity-0 p-0.5"><ChevronDown className="w-3 h-3" /></button>
                              </div>
                              <Input value={act} onChange={e => updateActivity(day.id, ai, e.target.value)} placeholder="e.g., Private Colosseum tour" className="text-sm flex-1 bg-white" />
                              {act && <button type="button" onClick={() => saveToLibrary(act, "EXPERIENCE")} className="text-gray-300 hover:text-green-600 p-1" title="Save to library"><Plus className="w-3 h-3" /></button>}
                              <button onClick={() => removeActivity(day.id, ai)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-3 h-3" /></button>
                            </div>
                            {act && <input value={day.activityNotes[ai] || ""} onChange={e => updateActivityNote(day.id, ai, e.target.value)} placeholder="Note: e.g., book in advance, 2hrs" className="text-xs text-gray-400 italic w-full border-0 border-b border-gray-100 ml-7 px-0 py-0.5 focus:outline-none focus:border-gray-300 bg-transparent" />}
                          </div>
                        ))}
                        <div className="flex gap-3 items-center">
                          <button onClick={() => addActivity(day.id)} className="text-xs text-gold-700 hover:text-gold-900 flex items-center gap-1 py-1"><Plus className="w-3 h-3" /> Add custom</button>
                          <PlacePicker mode="experience" onSelect={(p) => insertPlaceIntoDay(day.id, p)} trigger={
                            <button type="button" className="text-xs text-gold-600 hover:text-gold-800 flex items-center gap-1 py-1"><Sparkles className="w-3 h-3" /> From saved</button>
                          } />
                        </div>
                      </div>
                    </div>

                    {/* Transport — multiple items */}
                    <div className="bg-gray-50/50 rounded-lg p-3 border border-gray-100">
                      <Label className="text-xs text-gray-600 font-semibold mb-1.5 block flex items-center gap-1"><Train className="w-3.5 h-3.5" /> Transportation</Label>
                      <div className="space-y-1.5">
                        {day.transports.map((tr, ti) => (
                          <div key={ti}>
                            <div className="flex items-center gap-1">
                              <div className="flex flex-col shrink-0">
                                <button onClick={() => moveItem(day.id, "transports", ti, -1)} disabled={ti === 0} className="text-gray-300 hover:text-gray-500 disabled:opacity-0 p-0.5"><ChevronUp className="w-3 h-3" /></button>
                                <button onClick={() => moveItem(day.id, "transports", ti, 1)} disabled={ti === day.transports.length - 1} className="text-gray-300 hover:text-gray-500 disabled:opacity-0 p-0.5"><ChevronDown className="w-3 h-3" /></button>
                              </div>
                              <Input value={tr} onChange={e => updateTransport(day.id, ti, e.target.value)} placeholder="e.g., Private transfer to airport" className="text-sm flex-1 bg-white" />
                              <button onClick={() => removeTransport(day.id, ti)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-3 h-3" /></button>
                            </div>
                            {tr && <input value={day.transportNotes[ti] || ""} onChange={e => updateTransportNote(day.id, ti, e.target.value)} placeholder="Note: e.g., leave at 2:30 PM, 45 min" className="text-xs text-gray-400 italic w-full border-0 border-b border-gray-100 ml-7 px-0 py-0.5 focus:outline-none focus:border-gray-300 bg-transparent" />}
                          </div>
                        ))}
                        <button onClick={() => addTransport(day.id)} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 py-1"><Plus className="w-3 h-3" /> Add transport</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={addDay} className="w-full border-dashed border-gray-300 text-gray-600">
                <Plus className="w-4 h-4 mr-2" /> Add Day {days.length + 1}
              </Button>
            </div>
          )}

          {/* HOTELS TAB */}
          {activeTab === "hotels" && (
            <div className="space-y-4">
              {hotels.map(hotel => (
                <div key={hotel.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Hotel className="w-5 h-5 text-primary-600" />
                      <span className="font-medium text-gray-700 text-sm">Hotel</span>
                    </div>
                    <button onClick={() => removeHotel(hotel.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">Name *</Label>
                      <Input value={hotel.name} onChange={e => updateHotel(hotel.id, "name", e.target.value)} placeholder="e.g., Le Sirenuse" className="text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">Location</Label>
                      <Input value={hotel.location} onChange={e => updateHotel(hotel.id, "location", e.target.value)} placeholder="e.g., Positano" className="text-sm" />
                    </div>
                  </div>
                  <div className="mb-3">
                    <Label className="text-xs text-gray-500 mb-1 block">Description</Label>
                    <Input value={hotel.description} onChange={e => updateHotel(hotel.id, "description", e.target.value)} placeholder="Brief description" className="text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Why recommended</Label>
                    <Input value={hotel.whyRecommended} onChange={e => updateHotel(hotel.id, "whyRecommended", e.target.value)} placeholder="Why this hotel is a great fit" className="text-sm" />
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <PlacePicker mode="hotel" onSelect={insertSavedHotel} trigger={
                  <Button variant="navy" className="flex-1"><Hotel className="w-4 h-4 mr-2" /> From Saved Hotels</Button>
                } />
                <Button variant="outline" onClick={addHotel} className="flex-1 border-dashed border-gray-300 text-gray-600">
                  <Plus className="w-4 h-4 mr-2" /> Add Custom Hotel
                </Button>
              </div>
            </div>
          )}

          {/* EXPERIENCES TAB */}
          {activeTab === "experiences" && (
            <div className="space-y-4">
              {experiences.map(exp => (
                <div key={exp.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{exp.emoji}</span>
                      <span className="font-medium text-gray-700 text-sm">Experience</span>
                    </div>
                    <button onClick={() => removeExperience(exp.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="col-span-2">
                      <Label className="text-xs text-gray-500 mb-1 block">Name *</Label>
                      <Input value={exp.name} onChange={e => updateExperience(exp.id, "name", e.target.value)} placeholder="e.g., Private Boat Charter" className="text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">Emoji</Label>
                      <Input value={exp.emoji} onChange={e => updateExperience(exp.id, "emoji", e.target.value)} placeholder="✨" className="text-sm w-16" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Description</Label>
                    <Input value={exp.description} onChange={e => updateExperience(exp.id, "description", e.target.value)} placeholder="What makes this experience special" className="text-sm" />
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <PlacePicker mode="experience" onSelect={insertSavedExperience} trigger={
                  <Button variant="navy" className="flex-1"><Sparkles className="w-4 h-4 mr-2" /> From Saved Experiences</Button>
                } />
                <Button variant="outline" onClick={addExperience} className="flex-1 border-dashed border-gray-300 text-gray-600">
                  <Plus className="w-4 h-4 mr-2" /> Add Custom Experience
                </Button>
              </div>
            </div>
          )}

          {/* PRICING TAB */}
          {activeTab === "pricing" && (
            <div className="space-y-5">
              {/* Visibility toggle */}
              <div className="flex items-center justify-between bg-sand-50 rounded-xl p-4 border border-sand-200">
                <div>
                  <p className="text-sm font-medium text-gray-800">Client Portal Visibility</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {pricing.showOnPortal ? "Pricing will be visible to your client on their trip portal" : "Pricing is internal only — your client will not see it"}
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch checked={pricing.showOnPortal} onCheckedChange={v => setPricing(p => ({ ...p, showOnPortal: v }))} />
                  <span className="text-sm text-gray-600">{pricing.showOnPortal ? "Visible" : "Internal"}</span>
                </label>
              </div>

              <p className="text-xs text-gray-400">Rough estimate ranges for internal planning{pricing.showOnPortal ? " and client reference" : ""}.</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Flights Estimate</Label>
                  <Input value={pricing.flights} onChange={e => setPricing(p => ({ ...p, flights: e.target.value }))} placeholder="e.g., $2,000 - $3,000" className="text-base" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Hotels Estimate</Label>
                  <Input value={pricing.hotels} onChange={e => setPricing(p => ({ ...p, hotels: e.target.value }))} placeholder="e.g., $6,000 - $8,000" className="text-base" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Experiences Estimate</Label>
                  <Input value={pricing.experiences} onChange={e => setPricing(p => ({ ...p, experiences: e.target.value }))} placeholder="e.g., $2,000 - $3,000" className="text-base" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Transfers Estimate</Label>
                  <Input value={pricing.transfers} onChange={e => setPricing(p => ({ ...p, transfers: e.target.value }))} placeholder="e.g., $800 - $1,200" className="text-base" />
                </div>
              </div>
              <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
                <Label className="text-sm font-semibold text-primary-800 mb-1.5 block">Total Estimate Range</Label>
                <Input value={pricing.total} onChange={e => setPricing(p => ({ ...p, total: e.target.value }))} placeholder="e.g., $12,000 - $16,000" className="text-lg font-semibold" />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Pricing Notes</Label>
                <Textarea value={pricing.notes} onChange={e => setPricing(p => ({ ...p, notes: e.target.value }))} placeholder="e.g., Peak summer adds 15%. Prices per person based on double occupancy." className="h-20 text-base" />
              </div>
            </div>
          )}
        </div>

        {/* Survey sidebar */}
        {survey && clientName && (
          <SurveyPanel survey={survey} clientName={clientName} />
        )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <div className="text-xs text-gray-400">
            {days.length} days · {hotels.length} hotels · {experiences.length} experiences
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="navy" onClick={handleSave} disabled={loading} className="min-w-[120px]">
              {loading ? "Saving..." : isTemplateMode ? "Save to Library" : isEdit ? "Save Itinerary" : "Create Itinerary"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
