"use client"

import { useState, useEffect, useTransition } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Hotel, Utensils, Sparkles, Star, MapPin, Plus, Check } from "lucide-react"
import { searchSavedPlaces } from "@/actions/search-places"

interface SavedPlace {
  id: string
  name: string
  destination: string
  country: string
  flagEmoji: string | null
  category: string
  description: string
  priceLevel: number | null
  rating: number | null
  whyWeRecommend: string
  bestFor: string | null
  isTopPick: boolean
  isFeatured: boolean
}

type PickMode = "hotel" | "dining" | "experience"

interface Props {
  mode: PickMode
  onSelect: (place: SavedPlace) => void
  trigger?: React.ReactNode
}

const modeConfig = {
  hotel: { label: "Hotel", icon: Hotel, category: "HOTEL_ANY", color: "primary" },
  dining: { label: "Restaurant", icon: Utensils, category: "DINING", color: "amber" },
  experience: { label: "Experience", icon: Sparkles, category: "EXPERIENCE_ANY", color: "gold" },
}

const categoryEmoji: Record<string, string> = {
  HOTEL: "🏨", RESORT: "🌴", BOUTIQUE_HOTEL: "🏡", VILLA: "🏰",
  RESTAURANT: "🍽️", CAFE: "☕", BAR: "🍸",
  EXPERIENCE: "✨", ACTIVITY: "🎯", TOUR: "🗺️", SPA: "🧘",
}

export function PlacePicker({ mode, onSelect, trigger }: Props) {
  const config = modeConfig[mode]
  const Icon = config.icon
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SavedPlace[]>([])
  const [isPending, startTransition] = useTransition()
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    // Load initial results on open
    startTransition(async () => {
      const places = await searchSavedPlaces("", config.category)
      setResults(places)
    })
  }, [open])

  const handleSearch = (value: string) => {
    setQuery(value)
    startTransition(async () => {
      const places = await searchSavedPlaces(value, config.category)
      setResults(places)
    })
  }

  const handleSelect = (place: SavedPlace) => {
    setSelected(place.id)
    // Close dialog first, then call onSelect so parent state updates cleanly
    setOpen(false)
    // Small delay to let the dialog close animation finish before updating parent state
    setTimeout(() => {
      onSelect(place)
      setSelected(null)
      setQuery("")
    }, 100)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 rounded-lg px-2.5 py-1.5 transition-colors"
          >
            <Icon className="w-3.5 h-3.5" />
            From saved {config.label.toLowerCase()}s
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle className="text-lg font-serif flex items-center gap-2">
            <Icon className="w-5 h-5 text-primary-600" />
            Choose a Saved {config.label}
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="px-5 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={query}
              onChange={e => handleSearch(e.target.value)}
              placeholder={`Search ${config.label.toLowerCase()}s by name or destination...`}
              className="pl-9 text-base h-11"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {isPending && results.length === 0 && (
            <div className="py-8 text-center text-sm text-gray-400">Searching...</div>
          )}

          {!isPending && results.length === 0 && (
            <div className="py-8 text-center">
              <Icon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No saved {config.label.toLowerCase()}s found</p>
              <p className="text-xs text-gray-300 mt-1">Try a different search or add places in Saved Places</p>
            </div>
          )}

          <div className="space-y-2">
            {results.map(place => {
              const isSelected = selected === place.id
              return (
                <button
                  key={place.id}
                  onClick={() => handleSelect(place)}
                  className={`w-full text-left rounded-xl border p-4 transition-all ${
                    isSelected
                      ? "border-green-300 bg-green-50"
                      : "border-gray-100 bg-white hover:border-primary-200 hover:bg-primary-50/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl shrink-0 mt-0.5">
                      {categoryEmoji[place.category] || "📍"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 text-base">{place.name}</span>
                        {place.isTopPick && <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400 shrink-0" />}
                        {isSelected && <Check className="w-4 h-4 text-green-600 shrink-0" />}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {place.destination}, {place.country}
                        {place.priceLevel && (
                          <span className="text-gold-600 ml-1">{"$".repeat(place.priceLevel)}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{place.whyWeRecommend}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
