import { parseJsonField } from "@/lib/utils"

interface Template {
  id: string
  title: string
  destination: string
  travelStyles: string
  travelerTypes: string
  budgetLevel: string
  paceLevel: string
  durationDays: number
  summary: string
}

interface SurveyPreferences {
  travelStyles?: string | null
  travelerType?: string | null
  budget?: string | null
  pacePreference?: string | null
  tripDurationMin?: number | null
  tripDurationMax?: number | null
  destinationsList?: string | null
  interests?: string | null
}

interface TemplateMatch {
  template: Template
  score: number
  reasons: string[]
}

const budgetOrder = ['UNDER_3K', 'THREE_TO_5K', 'FIVE_TO_10K', 'TEN_TO_20K', 'OVER_20K']

export function scoreTemplatesForLead(
  templates: Template[],
  preferences: SurveyPreferences
): TemplateMatch[] {
  const surveyStyles = parseJsonField<string[]>(preferences.travelStyles, [])
  const destinations = parseJsonField<string[]>(preferences.destinationsList, [])
  const budget = preferences.budget || 'FIVE_TO_10K'
  const pace = preferences.pacePreference || 'moderate'
  const durationMin = preferences.tripDurationMin || 7
  const durationMax = preferences.tripDurationMax || 14
  const travelerType = preferences.travelerType || 'COUPLE'
  const budgetIndex = budgetOrder.indexOf(budget)

  return templates
    .map(template => {
      let score = 0
      const reasons: string[] = []

      const templateStyles = parseJsonField<string[]>(template.travelStyles, [])
      const templateTravelerTypes = parseJsonField<string[]>(template.travelerTypes, [])
      const templateBudgetIndex = budgetOrder.indexOf(template.budgetLevel)

      // Destination match (highest weight)
      if (destinations.length > 0) {
        const destMatch = destinations.some(d =>
          template.destination.toLowerCase().includes(d.toLowerCase()) ||
          d.toLowerCase().includes(template.destination.toLowerCase())
        )
        if (destMatch) {
          score += 35
          reasons.push('Destination match')
        }
      }

      // Style match
      const styleOverlap = surveyStyles.filter(s => templateStyles.includes(s))
      if (styleOverlap.length > 0) {
        const styleScore = Math.min(styleOverlap.length * 10, 25)
        score += styleScore
        reasons.push(`${styleOverlap.length} matching travel style${styleOverlap.length > 1 ? 's' : ''}`)
      }

      // Traveler type match
      if (templateTravelerTypes.includes(travelerType)) {
        score += 15
        reasons.push('Perfect traveler type fit')
      } else if (
        (travelerType === 'HONEYMOON' && templateTravelerTypes.includes('COUPLE')) ||
        (travelerType === 'ANNIVERSARY' && templateTravelerTypes.includes('COUPLE'))
      ) {
        score += 10
        reasons.push('Suitable for couples')
      }

      // Budget match (within 1 level = good, exact = best)
      const budgetDiff = Math.abs(budgetIndex - templateBudgetIndex)
      if (budgetDiff === 0) {
        score += 15
        reasons.push('Exact budget match')
      } else if (budgetDiff === 1) {
        score += 8
        reasons.push('Close budget alignment')
      }

      // Pace match
      if (template.paceLevel === pace) {
        score += 10
        reasons.push('Matching pace preference')
      }

      // Duration match
      if (
        template.durationDays >= durationMin &&
        template.durationDays <= durationMax
      ) {
        score += 5
        reasons.push('Duration fits preference')
      }

      return { template, score: Math.min(score, 100), reasons }
    })
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score)
}
