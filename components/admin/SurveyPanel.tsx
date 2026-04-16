"use client"

import { useState } from "react"
import {
  Users, Clock, Calendar, MapPin, Heart,
  Utensils, Hotel, Star, ChevronRight, ChevronLeft, Sparkles
} from "lucide-react"

interface SurveyData {
  travelerType?: string | null
  groupSize?: number | null
  budget?: string | null
  tripDurationMin?: number | null
  tripDurationMax?: number | null
  pacePreference?: string | null
  travelStyles?: string | null
  accommodationType?: string | null
  interests?: string | null
  mustHaveExperiences?: string | null
  avoidExperiences?: string | null
  diningImportance?: number | null
  diningStyle?: string | null
  dietaryRestrictions?: string | null
  tripFeeling?: string | null
  oneWord?: string | null
  destinationsList?: string | null
  celebrationDetails?: string | null
  accessibilityNeeds?: string | null
  otherRequests?: string | null
}

function parseJson(val: string | null | undefined, fb: any[]) {
  if (!val) return fb
  try { return JSON.parse(val) } catch { return fb }
}

export function SurveyPanel({ survey, clientName }: { survey: SurveyData; clientName: string }) {
  const [expanded, setExpanded] = useState(true)

  const styles = parseJson(survey.travelStyles, [])
  const interests = parseJson(survey.interests, [])
  const destinations = parseJson(survey.destinationsList, [])
  const accommodations = parseJson(survey.accommodationType, [])
  const restrictions = parseJson(survey.dietaryRestrictions, [])

  if (!expanded) {
    return (
      <button onClick={() => setExpanded(true)}
        className="fixed right-0 top-1/3 z-50 bg-primary-700 text-white px-2 py-6 rounded-l-lg shadow-lg hover:bg-primary-600 transition-colors" title="Show survey">
        <ChevronLeft className="w-4 h-4 mb-1" />
        <span className="text-xs [writing-mode:vertical-lr] rotate-180">Survey</span>
      </button>
    )
  }

  return (
    <div className="w-72 shrink-0 border-l border-gray-100 bg-sand-50/50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-primary-900 text-white px-4 py-3 flex items-center justify-between z-10">
        <div>
          <p className="text-xs text-primary-400">Planning for</p>
          <p className="font-semibold text-sm">{clientName}</p>
        </div>
        <button onClick={() => setExpanded(false)} className="text-primary-400 hover:text-white p-1">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* Trip feeling — hero card */}
        {survey.tripFeeling && (
          <div className="bg-gradient-to-br from-primary-50 to-gold-50 rounded-xl p-4 border border-primary-100">
            <div className="flex items-center gap-1.5 mb-2">
              <Heart className="w-4 h-4 text-primary-600" />
              <p className="text-xs text-primary-700 font-semibold">The Feeling</p>
            </div>
            <p className="text-sm text-primary-900 font-serif italic leading-relaxed">&ldquo;{survey.tripFeeling}&rdquo;</p>
            {survey.oneWord && (
              <div className="mt-2 pt-2 border-t border-primary-100">
                <span className="text-xs bg-primary-700 text-white rounded-full px-2.5 py-0.5 font-medium">{survey.oneWord}</span>
              </div>
            )}
          </div>
        )}

        {/* Key stats — visual cards */}
        <div className="grid grid-cols-2 gap-2">
          {survey.travelerType && (
            <div className="bg-white rounded-lg p-2.5 border border-gray-100 text-center">
              <Users className="w-4 h-4 text-primary-500 mx-auto mb-1" />
              <p className="text-xs font-medium text-gray-800 capitalize">{survey.travelerType.replace(/_/g, " ")}</p>
              {survey.groupSize && <p className="text-xs text-gray-400">{survey.groupSize} travelers</p>}
            </div>
          )}
          {survey.tripDurationMin && (
            <div className="bg-white rounded-lg p-2.5 border border-gray-100 text-center">
              <Calendar className="w-4 h-4 text-primary-500 mx-auto mb-1" />
              <p className="text-xs font-medium text-gray-800">{survey.tripDurationMin}–{survey.tripDurationMax} days</p>
            </div>
          )}
          {survey.pacePreference && (
            <div className="bg-white rounded-lg p-2.5 border border-gray-100 text-center">
              <Clock className="w-4 h-4 text-primary-500 mx-auto mb-1" />
              <p className="text-xs font-medium text-gray-800 capitalize">{survey.pacePreference}</p>
              <p className="text-xs text-gray-400">pace</p>
            </div>
          )}
          {survey.diningStyle && (
            <div className="bg-white rounded-lg p-2.5 border border-gray-100 text-center">
              <Utensils className="w-4 h-4 text-primary-500 mx-auto mb-1" />
              <p className="text-xs font-medium text-gray-800 capitalize">{survey.diningStyle}</p>
              <p className="text-xs text-gray-400">dining</p>
            </div>
          )}
        </div>

        {/* Destinations */}
        {destinations.length > 0 && (
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <p className="text-xs text-gray-500 font-semibold mb-2 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-primary-500" /> Destinations</p>
            <div className="flex flex-wrap gap-1">
              {destinations.map((d: string) => (
                <span key={d} className="text-xs bg-primary-50 text-primary-700 rounded-full px-2.5 py-0.5 font-medium">{d}</span>
              ))}
            </div>
          </div>
        )}

        {/* Travel style */}
        {styles.length > 0 && (
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <p className="text-xs text-gray-500 font-semibold mb-2 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-gold-500" /> Travel Style</p>
            <div className="flex flex-wrap gap-1.5">
              {styles.map((s: string) => (
                <span key={s} className="text-xs bg-gradient-to-r from-gold-50 to-amber-50 text-gold-800 border border-gold-200 rounded-full px-2.5 py-0.5 font-medium">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Accommodation */}
        {accommodations.length > 0 && (
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <p className="text-xs text-gray-500 font-semibold mb-2 flex items-center gap-1"><Hotel className="w-3.5 h-3.5 text-primary-500" /> Stay Preferences</p>
            <div className="flex flex-wrap gap-1.5">
              {accommodations.map((a: string) => (
                <span key={a} className="text-xs bg-primary-50 text-primary-600 rounded-full px-2.5 py-0.5">{a.replace(/_/g, " ")}</span>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {interests.length > 0 && (
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <p className="text-xs text-gray-500 font-semibold mb-2 flex items-center gap-1"><Star className="w-3.5 h-3.5 text-gold-500" /> Interests</p>
            <div className="flex flex-wrap gap-1.5">
              {interests.map((i: string) => (
                <span key={i} className="text-xs bg-gray-50 text-gray-700 border border-gray-100 rounded-full px-2.5 py-0.5">{i}</span>
              ))}
            </div>
          </div>
        )}

        {/* Must-haves */}
        {survey.mustHaveExperiences && (
          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <p className="text-xs text-green-700 font-semibold mb-1 flex items-center gap-1">✓ Must-Haves</p>
            <p className="text-xs text-gray-700 leading-relaxed">{survey.mustHaveExperiences}</p>
          </div>
        )}

        {/* Avoid */}
        {survey.avoidExperiences && (
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
            <p className="text-xs text-amber-700 font-semibold mb-1 flex items-center gap-1">✗ Avoid</p>
            <p className="text-xs text-gray-700 leading-relaxed">{survey.avoidExperiences}</p>
          </div>
        )}

        {/* Dining */}
        {survey.diningImportance && (
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <p className="text-xs text-gray-500 font-semibold mb-2 flex items-center gap-1"><Utensils className="w-3.5 h-3.5" /> Dining</p>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                <div className="bg-primary-600 rounded-full h-1.5" style={{ width: `${(survey.diningImportance / 10) * 100}%` }} />
              </div>
              <span className="text-xs font-medium text-gray-700">{survey.diningImportance}/10</span>
            </div>
            {restrictions.length > 0 && restrictions[0] !== "none" && (
              <p className="text-xs text-gray-500 mt-1.5">Restrictions: {restrictions.filter((r: string) => r !== "none" && r !== "other_diet").join(", ")}</p>
            )}
          </div>
        )}

        {/* Special notes */}
        {(survey.celebrationDetails || survey.accessibilityNeeds || survey.otherRequests) && (
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <p className="text-xs text-gray-500 font-semibold mb-2">Special Notes</p>
            <div className="space-y-1.5 text-xs text-gray-700">
              {survey.celebrationDetails && <p>🎉 {survey.celebrationDetails}</p>}
              {survey.accessibilityNeeds && <p>♿ {survey.accessibilityNeeds}</p>}
              {survey.otherRequests && <p>📝 {survey.otherRequests}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
