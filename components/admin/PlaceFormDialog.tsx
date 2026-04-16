"use client"

import { useState } from "react"
import { Plus, Hotel, Utensils, Sparkles, MapPin } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { createPlace, updatePlace } from "@/actions/places"

// Quick category groups
const CATEGORY_GROUPS = [
  { value: "HOTEL", label: "Hotel", icon: Hotel, color: "primary" },
  { value: "RESTAURANT", label: "Restaurant", icon: Utensils, color: "amber" },
  { value: "EXPERIENCE", label: "Experience", icon: Sparkles, color: "gold" },
]

const SUB_CATEGORIES: Record<string, { value: string; label: string }[]> = {
  HOTEL: [
    { value: "HOTEL", label: "Hotel" },
    { value: "BOUTIQUE_HOTEL", label: "Boutique" },
    { value: "RESORT", label: "Resort" },
    { value: "VILLA", label: "Villa" },
    { value: "SPA", label: "Spa / Wellness" },
  ],
  RESTAURANT: [
    { value: "RESTAURANT", label: "Restaurant" },
    { value: "CAFE", label: "Cafe" },
    { value: "BAR", label: "Bar" },
  ],
  EXPERIENCE: [
    { value: "EXPERIENCE", label: "Experience" },
    { value: "ACTIVITY", label: "Activity" },
    { value: "TOUR", label: "Tour" },
    { value: "LANDMARK", label: "Landmark" },
    { value: "BEACH", label: "Beach" },
  ],
}

// Category-specific quick tags
const QUICK_TAGS: Record<string, string[]> = {
  HOTEL: ["Luxury", "Boutique", "Spa", "Ocean View", "Central", "Romantic", "Family-Friendly", "Design Hotel", "Historic", "Pool", "Rooftop", "Quiet"],
  BOUTIQUE_HOTEL: ["Luxury", "Boutique", "Spa", "Ocean View", "Central", "Romantic", "Family-Friendly", "Design Hotel", "Historic", "Pool", "Rooftop", "Quiet"],
  RESORT: ["Luxury", "All-Inclusive", "Beachfront", "Spa", "Family-Friendly", "Adults Only", "Pool", "Golf"],
  VILLA: ["Private", "Pool", "Ocean View", "Luxury", "Romantic", "Family", "Countryside"],
  SPA: ["Wellness", "Luxury", "Couples", "Day Spa", "Resort Spa", "Thermal", "Holistic"],
  RESTAURANT: ["Fine Dining", "Local Favorite", "Seafood", "Italian", "French", "Rooftop", "Romantic", "Wine Bar", "Tasting Menu", "Brunch", "Family-Friendly", "Casual", "Upscale"],
  CAFE: ["Coffee", "Brunch", "Bakery", "Terrace", "Local Spot", "Historic"],
  BAR: ["Wine Bar", "Cocktails", "Rooftop", "Hotel Bar", "Local", "Jazz"],
  EXPERIENCE: ["Cultural", "Food Experience", "Wellness", "Scenic", "Adventure", "Private Tour", "Family-Friendly", "Romantic", "Iconic", "Hidden Gem"],
  ACTIVITY: ["Outdoor", "Water Sports", "Hiking", "Cycling", "Photography", "Cooking Class", "Wine Tasting"],
  TOUR: ["Walking Tour", "Private", "Food Tour", "History", "Architecture", "Day Trip"],
  LANDMARK: ["Historic", "Iconic", "Scenic", "Must-See", "Photography"],
  BEACH: ["Swimming", "Snorkeling", "Quiet", "Family", "Beach Club", "Scenic"],
}

function parseJsonArray(value: any): string[] {
  if (!value) return []
  try { return Array.isArray(value) ? value : JSON.parse(value) } catch { return [] }
}

function getCategoryGroup(cat: string): string {
  if (["HOTEL", "BOUTIQUE_HOTEL", "RESORT", "VILLA", "SPA"].includes(cat)) return "HOTEL"
  if (["RESTAURANT", "CAFE", "BAR"].includes(cat)) return "RESTAURANT"
  return "EXPERIENCE"
}

interface Props {
  place?: any
  trigger?: React.ReactNode
}

export function PlaceFormDialog({ place, trigger }: Props) {
  const isEdit = !!place
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState(place?.name || "")
  const [destination, setDestination] = useState(place?.destination || "")
  const [country, setCountry] = useState(place?.country || "")
  const [category, setCategory] = useState(place?.category || "")
  const [categoryGroup, setCategoryGroup] = useState(place?.category ? getCategoryGroup(place.category) : "")
  const [tags, setTags] = useState<string[]>(parseJsonArray(place?.tags))
  const [note, setNote] = useState(place?.whyWeRecommend || "")
  const [isTopPick, setIsTopPick] = useState(place?.isTopPick || false)

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const selectCategoryGroup = (group: string) => {
    setCategoryGroup(group)
    // Auto-select the first sub-category
    const subs = SUB_CATEGORIES[group]
    if (subs && subs.length > 0) setCategory(subs[0].value)
  }

  const availableTags = QUICK_TAGS[category] || QUICK_TAGS[categoryGroup] || []

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Name is required"); return }
    if (!category) { toast.error("Please select a category"); return }
    setLoading(true)
    try {
      const input = {
        name: name.trim(),
        destination: destination.trim() || "Unknown",
        country: country.trim() || "",
        category,
        description: note || name,
        whyWeRecommend: note || `Saved from Voyagr`,
        tags: tags.length > 0 ? tags : undefined,
        isTopPick,
      }
      if (isEdit) {
        await updatePlace(place.id, input)
        toast.success("Place updated")
      } else {
        await createPlace(input)
        toast.success(`${name} saved to your library`)
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
        {trigger || <Button variant="navy"><Plus className="w-4 h-4 mr-1" /> New Place</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[88vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-5 pb-0">
          <DialogTitle className="text-xl font-serif">{isEdit ? "Edit Place" : "Save a New Place"}</DialogTitle>
          {!isEdit && <p className="text-sm text-gray-500 mt-1">Add a hotel, restaurant, or experience to your library.</p>}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Step 1: What type? — big visual buttons */}
          {!isEdit && (
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-3 block">What kind of place?</Label>
              <div className="grid grid-cols-3 gap-3">
                {CATEGORY_GROUPS.map(g => {
                  const Icon = g.icon
                  const active = categoryGroup === g.value
                  return (
                    <button key={g.value} type="button" onClick={() => selectCategoryGroup(g.value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        active ? "border-primary-600 bg-primary-50" : "border-gray-200 bg-white hover:border-gray-300"
                      }`}>
                      <Icon className={`w-6 h-6 ${active ? "text-primary-700" : "text-gray-400"}`} />
                      <span className={`text-sm font-medium ${active ? "text-primary-800" : "text-gray-600"}`}>{g.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Sub-category if needed */}
          {categoryGroup && SUB_CATEGORIES[categoryGroup] && SUB_CATEGORIES[categoryGroup].length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {SUB_CATEGORIES[categoryGroup].map(sub => (
                <button key={sub.value} type="button" onClick={() => setCategory(sub.value)}
                  className={`text-xs rounded-full px-3 py-1.5 font-medium transition-colors ${
                    category === sub.value ? "bg-primary-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>
                  {sub.label}
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Name + location — the essentials */}
          <div>
            <Label className="text-sm font-medium text-gray-900 mb-1.5 block">Place Name *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder={
              categoryGroup === "HOTEL" ? "e.g., Le Sirenuse" :
              categoryGroup === "RESTAURANT" ? "e.g., Da Enzo al 29" :
              "e.g., Private Vatican Tour"
            } className="text-lg h-12 font-medium" autoFocus />
          </div>

          <div className="grid grid-cols-5 gap-3">
            <div className="col-span-3">
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-1"><MapPin className="w-3 h-3" /> City / Destination</Label>
              <Input value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g., Positano" className="text-base" />
            </div>
            <div className="col-span-2">
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Country</Label>
              <Input value={country} onChange={e => setCountry(e.target.value)} placeholder="e.g., Italy" className="text-base" />
            </div>
          </div>

          {/* Step 3: Quick tags — category-specific */}
          {availableTags.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-2 block">Quick Tags</Label>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map(tag => (
                  <button key={tag} type="button" onClick={() => toggleTag(tag)}
                    className={`text-sm rounded-full px-3.5 py-1.5 font-medium transition-all ${
                      tags.includes(tag)
                        ? "bg-primary-700 text-white shadow-sm"
                        : "bg-gray-50 text-gray-600 border border-gray-200 hover:border-primary-300"
                    }`}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Optional note */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Quick Note <span className="text-gray-400 font-normal">(optional)</span></Label>
            <Input value={note} onChange={e => setNote(e.target.value)} placeholder={
              categoryGroup === "HOTEL" ? "e.g., Amazing spa, perfect for couples" :
              categoryGroup === "RESTAURANT" ? "e.g., Best carbonara in Rome, reservation needed" :
              "e.g., Book 2 weeks ahead, incredible views"
            } className="text-base" />
          </div>

          {/* Top pick toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={isTopPick} onChange={e => setIsTopPick(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-primary-700 focus:ring-primary-500" />
            <span className="text-sm text-gray-700">Mark as a top pick</span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-400">
            {tags.length > 0 ? `${tags.length} tag${tags.length > 1 ? "s" : ""}` : "No tags"} · {category.replace(/_/g, " ") || "No category"}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="navy" onClick={handleSave} disabled={loading} className="min-w-[120px]">
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Save Place"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
