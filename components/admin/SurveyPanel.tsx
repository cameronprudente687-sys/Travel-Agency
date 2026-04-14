"use client"

import { useState } from "react"
import {
  Users, DollarSign, Clock, Calendar, MapPin, Heart,
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

const budgetLabel: Record<string, string> = {
  UNDER_3K: "Under $3K", THREE_TO_5K: "$3K–$5K", FIVE_TO_10K: "$5K–$10K",
  TEN_TO_20K: "$10K–$20K", OVER_20K: "$20K+",
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
      <button
        onClick={() => setExpanded(true)}
        className="fixed right-0 top-1/3 z-50 bg-primary-700 text-white px-2 py-6 rounded-l-lg shadow-lg hover:bg-primary-600 transition-colors"
        title="Show survey"
      >
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
        {/* Trip feeling — most important */}
        {survey.tripFeeling && (
          <div className="bg-white rounded-lg p-3 border border-primary-100">
            <p className="text-xs text-primary-600 font-semibold mb-1 flex items-center gap-1"><Heart className="w-3 h-3" /> How they want it to feel</p>
            <p className="text-sm text-gray-800 italic leading-relaxed">&ldquo;{survey.tripFeeling}&rdquo;</p>
            {survey.oneWord && <p className="text-xs text-primary-600 font-semibold mt-1.5">{survey.oneWord}</p>}
          </div>
        )}

        {/* Key stats */}
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <p className="text-xs text-gray-500 font-semibold mb-2">Trip Basics</p>
          <div className="grid grid-cols-2 gap-2">
            {survey.travelerType && (
              <Stat icon={Users} label={survey.travelerType.replace(/_/g, " ")} sub={survey.groupSize ? `${survey.groupSize} travelers` : undefined} />
            )}
            {survey.budget && (
              <Stat icon={DollarSign} label={budgetLabel[survey.budget] || survey.budget} />
            )}
            {survey.tripDurationMin && (
              <Stat icon={Calendar} label={`${survey.tripDurationMin}–${survey.tripDurationMax} days`} />
            )}
            {survey.pacePreference && (
              <Stat icon={Clock} label={`${survey.pacePreference} pace`} />
            )}
          </div>
        </div>

        {/* Destinations */}
        {destinations.length > 0 && (
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <p className="text-xs text-gray-500 font-semibold mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" /> Destinations</p>
            <div className="flex flex-wrap gap-1">
              {destinations.map((d: string) => (
                <span key={d} className="text-xs bg-primary-50 text-primary-700 rounded-full px-2 py-0.5 font-medium">{d}</span>
              ))}
            </div>
          </div>
        )}

        {/* Travel style */}
        {styles.length > 0 && (
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <p className="text-xs text-gray-500 font-semibold mb-2 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Travel Style</p>
            <div className="flex flex-wrap gap-1">
              {styles.map((s: string) => (
                <span key={s} className="text-xs bg-gold-50 text-gold-700 rounded-full px-2 py-0.5 font-medium">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Accommodation */}
        {accommodations.length > 0 && (
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <p className="text-xs text-gray-500 font-semibold mb-2 flex items-center gap-1"><Hotel className="w-3 h-3" /> Stay Preferences</p>
            <div className="flex flex-wrap gap-1">
              {accommodations.map((a: string) => (
                <span key={a} className="text-xs bg-gray-50 text-gray-600 rounded px-2 py-0.5">{a.replace(/_/g, " ")}</span>
              ))}
            </div>
          </div>
        )}

        {/* Dining */}
        {(survey.diningStyle || survey.diningImportance) && (
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <p className="text-xs text-gray-500 font-semibold mb-2 flex items-center gap-1"><Utensils className="w-3 h-3" /> Food & Dining</p>
            <div className="space-y-1 text-xs text-gray-700">
              {survey.diningStyle && <p>Style: <span className="font-medium capitalize">{survey.diningStyle}</span></p>}
              {survey.diningImportance && <p>Importance: <span className="font-medium">{survey.diningImportance}/10</span></p>}
              {restrictions.length > 0 && restrictions[0] !== "none" && (
                <p>Restrictions: {restrictions.join(", ")}</p>
              )}
            </div>
          </div>
        )}

        {/* Interests */}
        {interests.length > 0 && (
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <p className="text-xs text-gray-500 font-semibold mb-2 flex items-center gap-1"><Star className="w-3 h-3" /> Interests</p>
            <div className="flex flex-wrap gap-1">
              {interests.map((i: string) => (
                <span key={i} className="text-xs bg-gray-50 text-gray-600 rounded px-2 py-0.5">{i}</span>
              ))}
            </div>
          </div>
        )}

        {/* Must-haves */}
        {survey.mustHaveExperiences && (
          <div className="bg-white rounded-lg p-3 border border-green-100">
            <p className="text-xs text-green-700 font-semibold mb-1">Must-Haves</p>
            <p className="text-xs text-gray-700 leading-relaxed">{survey.mustHaveExperiences}</p>
          </div>
        )}

        {/* Avoid */}
        {survey.avoidExperiences && (
          <div className="bg-white rounded-lg p-3 border border-amber-100">
            <p className="text-xs text-amber-700 font-semibold mb-1">Avoid</p>
            <p className="text-xs text-gray-700 leading-relaxed">{survey.avoidExperiences}</p>
          </div>
        )}

        {/* Special notes */}
        {(survey.celebrationDetails || survey.accessibilityNeeds || survey.otherRequests) && (
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <p className="text-xs text-gray-500 font-semibold mb-2">Special Notes</p>
            <div className="space-y-1.5 text-xs text-gray-700">
              {survey.celebrationDetails && <p><span className="font-medium">Celebration:</span> {survey.celebrationDetails}</p>}
              {survey.accessibilityNeeds && <p><span className="font-medium">Accessibility:</span> {survey.accessibilityNeeds}</p>}
              {survey.otherRequests && <p><span className="font-medium">Other:</span> {survey.otherRequests}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ icon: Icon, label, sub }: { icon: any; label: string; sub?: string }) {
  return (
    <div className="flex items-start gap-1.5">
      <Icon className="w-3.5 h-3.5 text-primary-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-medium text-gray-800 capitalize">{label}</p>
        {sub && <p className="text-xs text-gray-500">{sub}</p>}
      </div>
    </div>
  )
}
