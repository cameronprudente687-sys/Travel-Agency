"use client"

import { useState } from "react"
import { Star, ExternalLink } from "lucide-react"
import { PlaceActions } from "./PlaceActions"
import { PlacePreview } from "./QuickPreview"

const categoryEmoji: Record<string, string> = {
  HOTEL: "🏨", RESORT: "🌴", BOUTIQUE_HOTEL: "🏡", VILLA: "🏰",
  RESTAURANT: "🍽️", CAFE: "☕", BAR: "🍸", EXPERIENCE: "✨",
  ACTIVITY: "🎯", TOUR: "🗺️", SPA: "🧘", BEACH: "🏖️", LANDMARK: "🏛️",
}

interface Props {
  place: any
  bestFor: string[]
}

export function PlaceCard({ place, bestFor }: Props) {
  const [preview, setPreview] = useState(false)

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 p-4 hover:border-primary-200 transition-colors">
        {/* Clickable top area for preview */}
        <button
          onClick={() => setPreview(true)}
          className="w-full text-left"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">{categoryEmoji[place.category] || "📍"}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-gray-900 text-base hover:text-primary-700 transition-colors truncate">
                  {place.name}
                </span>
                {place.isTopPick && <Star className="w-4 h-4 fill-gold-400 text-gold-400 shrink-0" />}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {place.category.replace(/_/g, " ")}
                {place.priceLevel ? ` · ${"$".repeat(place.priceLevel)}` : ""}
                {place.rating ? ` · ${place.rating}★` : ""}
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">{place.whyWeRecommend}</p>

          {bestFor.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {bestFor.slice(0, 3).map(t => (
                <span key={t} className="text-xs text-gray-500 bg-gray-50 rounded px-1.5 py-0.5">{t.replace(/_/g, " ")}</span>
              ))}
            </div>
          )}
        </button>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
          <PlaceActions place={place} />
          {place.website && (
            <a href={place.website} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-primary-600 flex items-center gap-0.5 ml-auto">
              <ExternalLink className="w-3 h-3" /> Website
            </a>
          )}
        </div>
      </div>

      <PlacePreview place={place} open={preview} onClose={() => setPreview(false)} />
    </>
  )
}
