"use client"

import { useState } from "react"
import Link from "next/link"
import { Star, Clock, DollarSign, Map } from "lucide-react"
import { TemplateActions } from "./TemplateActions"
import { TemplatePreview } from "./QuickPreview"

const budgetLabel: Record<string, string> = {
  UNDER_3K: "Budget", THREE_TO_5K: "Mid-Range", FIVE_TO_10K: "Premium",
  TEN_TO_20K: "Luxury", OVER_20K: "Ultra Luxury",
}

interface Props {
  template: any
  styles: string[]
  types: string[]
  highlights: string[]
  featured?: boolean
}

export function TemplateCard({ template, styles, types, highlights, featured }: Props) {
  const [preview, setPreview] = useState(false)

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Compact header — clickable for preview */}
        <button onClick={() => setPreview(true)} className="w-full text-left bg-primary-900 px-5 py-4 text-white flex items-center gap-3">
          <span className="text-3xl shrink-0">{template.flagEmoji}</span>
          <div className="flex-1 min-w-0">
            <span className="font-serif font-bold text-lg leading-tight hover:text-gold-300 transition-colors block truncate">
              {template.title}
            </span>
            <p className="text-primary-300 text-sm truncate">{template.destination}, {template.country}</p>
          </div>
          {template.isSignature && <span className="shrink-0 text-xs bg-gold-500 text-white rounded-full px-2 py-0.5 font-medium">Signature</span>}
          {template.isBestSeller && !template.isSignature && <span className="shrink-0 text-xs bg-green-500 text-white rounded-full px-2 py-0.5 font-medium">Best Seller</span>}
        </button>

        <div className="p-5 space-y-3">
          {/* Key stats */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gray-400" /> {template.durationDays} days</span>
            <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-gray-400" /> {budgetLabel[template.budgetLevel]}</span>
            <span className="flex items-center gap-1"><Map className="w-3.5 h-3.5 text-gray-400" /> {template._count?.days || 0} day plans</span>
            {template.basePrice && <span className="ml-auto font-semibold text-primary-700">from ${template.basePrice.toLocaleString()}</span>}
          </div>

          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{template.summary}</p>

          {/* Highlights on featured */}
          {featured && highlights.length > 0 && (
            <div className="space-y-1">
              {highlights.slice(0, 3).map((h, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                  <Star className="w-3 h-3 text-gold-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{h}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {styles.slice(0, 3).map(s => (
              <span key={s} className="text-xs text-primary-700 bg-primary-50 rounded px-1.5 py-0.5">{s}</span>
            ))}
            {types.slice(0, 2).map(t => (
              <span key={t} className="text-xs text-gray-500 bg-gray-50 rounded px-1.5 py-0.5">{t.replace(/_/g, " ")}</span>
            ))}
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-gray-100">
            <TemplateActions template={template} />
          </div>
        </div>
      </div>

      <TemplatePreview template={template} open={preview} onClose={() => setPreview(false)} />
    </>
  )
}
