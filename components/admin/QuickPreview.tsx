"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Star, MapPin, ExternalLink, Globe, DollarSign, Clock, Edit } from "lucide-react"

// ==================== PLACE PREVIEW ====================

interface PlacePreviewProps {
  place: any
  open: boolean
  onClose: () => void
}

const categoryEmoji: Record<string, string> = {
  HOTEL: "🏨", RESORT: "🌴", BOUTIQUE_HOTEL: "🏡", VILLA: "🏰",
  RESTAURANT: "🍽️", CAFE: "☕", BAR: "🍸", EXPERIENCE: "✨",
  ACTIVITY: "🎯", TOUR: "🗺️", SPA: "🧘", BEACH: "🏖️", LANDMARK: "🏛️",
}

export function PlacePreview({ place, open, onClose }: PlacePreviewProps) {
  if (!place) return null

  const bestFor = place.bestFor ? (typeof place.bestFor === "string" ? JSON.parse(place.bestFor) : place.bestFor) : []
  const tags = place.tags ? (typeof place.tags === "string" ? JSON.parse(place.tags) : place.tags) : []

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span className="text-2xl">{categoryEmoji[place.category] || "📍"}</span>
            {place.name}
            {place.isTopPick && <Star className="w-4 h-4 fill-gold-400 text-gold-400" />}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Location + meta */}
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {place.destination}, {place.country}</span>
            <span>{place.category.replace(/_/g, " ")}</span>
            {place.priceLevel && <span className="text-gold-600 font-medium">{"$".repeat(place.priceLevel)}</span>}
            {place.rating && <span>{place.rating}★</span>}
          </div>

          {/* Description */}
          <p className="text-sm text-gray-700 leading-relaxed">{place.description}</p>

          {/* Why recommended — the key info */}
          <div className="bg-gold-50 rounded-lg p-3 border border-gold-100">
            <p className="text-xs font-medium text-gold-700 mb-1">Why We Recommend This</p>
            <p className="text-sm text-gray-700">{place.whyWeRecommend}</p>
          </div>

          {/* Best for */}
          {bestFor.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1.5">Best For</p>
              <div className="flex flex-wrap gap-1.5">
                {bestFor.map((t: string) => (
                  <span key={t} className="text-xs bg-primary-50 text-primary-700 rounded px-2 py-0.5">{t.replace(/_/g, " ")}</span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t: string) => (
                <span key={t} className="text-xs bg-gray-50 text-gray-500 rounded px-2 py-0.5">{t}</span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            <Button asChild variant="outline" size="sm">
              <a href={`/places/${place.id}`}><Edit className="w-3.5 h-3.5 mr-1" /> Open Full Details</a>
            </Button>
            {place.website && (
              <Button asChild variant="outline" size="sm">
                <a href={place.website} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3.5 h-3.5 mr-1" /> Website</a>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ==================== TEMPLATE PREVIEW ====================

interface TemplatePreviewProps {
  template: any
  open: boolean
  onClose: () => void
}

export function TemplatePreview({ template, open, onClose }: TemplatePreviewProps) {
  if (!template) return null

  const styles = template.travelStyles ? (typeof template.travelStyles === "string" ? JSON.parse(template.travelStyles) : template.travelStyles) : []
  const types = template.travelerTypes ? (typeof template.travelerTypes === "string" ? JSON.parse(template.travelerTypes) : template.travelerTypes) : []
  const highlights = template.highlights ? (typeof template.highlights === "string" ? JSON.parse(template.highlights) : template.highlights) : []

  const budgetLabel: Record<string, string> = {
    UNDER_3K: "Budget", THREE_TO_5K: "Mid-Range", FIVE_TO_10K: "Premium",
    TEN_TO_20K: "Luxury", OVER_20K: "Ultra Luxury",
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span className="text-2xl">{template.flagEmoji}</span>
            {template.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Key stats */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gray-400" /> {template.destination}, {template.country}</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gray-400" /> {template.durationDays} days</span>
            <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-gray-400" /> {budgetLabel[template.budgetLevel]}</span>
          </div>

          {template.basePrice && (
            <p className="text-lg font-semibold text-primary-700">from ${template.basePrice.toLocaleString()}</p>
          )}

          <p className="text-sm text-gray-700 leading-relaxed">{template.summary}</p>

          {/* Highlights */}
          {highlights.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Highlights</p>
              <div className="space-y-1.5">
                {highlights.slice(0, 6).map((h: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <Star className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" /> {h}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Styles + types */}
          <div className="flex flex-wrap gap-1.5">
            {styles.map((s: string) => (
              <span key={s} className="text-xs bg-primary-50 text-primary-700 rounded px-2 py-0.5">{s}</span>
            ))}
            {types.slice(0, 3).map((t: string) => (
              <span key={t} className="text-xs bg-gray-50 text-gray-500 rounded px-2 py-0.5">{t.replace(/_/g, " ")}</span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            <Button asChild variant="navy" size="sm">
              <a href={`/templates/${template.id}`}>Open Full Template</a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
