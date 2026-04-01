import { parseJsonField } from "@/lib/utils"

interface DestinationProfile {
  destination: string
  country: string
  region: string
  flagEmoji: string
  styles: string[]
  pace: string[]
  budget: string[]
  interests: string[]
  travelerTypes: string[]
  bestMonths: number[]
  tagline: string
}

const destinations: DestinationProfile[] = [
  {
    destination: 'Paris', country: 'France', region: 'Western Europe', flagEmoji: '🇫🇷',
    styles: ['CULTURAL', 'ROMANTIC', 'FOODIE', 'LUXURY'],
    pace: ['slow', 'moderate'],
    budget: ['FIVE_TO_10K', 'TEN_TO_20K', 'OVER_20K'],
    interests: ['art', 'food', 'history', 'fashion', 'romance', 'architecture'],
    travelerTypes: ['COUPLE', 'HONEYMOON', 'ANNIVERSARY', 'SOLO', 'GROUP_FRIENDS'],
    bestMonths: [4, 5, 6, 9, 10],
    tagline: 'The city of light never loses its magic',
  },
  {
    destination: 'Santorini', country: 'Greece', region: 'Mediterranean', flagEmoji: '🇬🇷',
    styles: ['ROMANTIC', 'LUXURY', 'SCENIC', 'CULTURAL'],
    pace: ['slow', 'moderate'],
    budget: ['TEN_TO_20K', 'OVER_20K'],
    interests: ['beaches', 'sunsets', 'romance', 'wine', 'sailing', 'photography'],
    travelerTypes: ['COUPLE', 'HONEYMOON', 'ANNIVERSARY', 'GROUP_FRIENDS'],
    bestMonths: [5, 6, 9, 10],
    tagline: 'Where the sunsets outlast every expectation',
  },
  {
    destination: 'Iceland', country: 'Iceland', region: 'Northern Europe', flagEmoji: '🇮🇸',
    styles: ['ADVENTURE', 'SCENIC', 'WELLNESS'],
    pace: ['moderate', 'fast'],
    budget: ['FIVE_TO_10K', 'TEN_TO_20K'],
    interests: ['nature', 'photography', 'hiking', 'hot springs', 'northern lights', 'waterfalls'],
    travelerTypes: ['COUPLE', 'SOLO', 'GROUP_FRIENDS', 'ADVENTURE'],
    bestMonths: [6, 7, 8, 12, 1, 2],
    tagline: 'Raw, dramatic, and utterly unforgettable',
  },
  {
    destination: 'Kyoto', country: 'Japan', region: 'East Asia', flagEmoji: '🇯🇵',
    styles: ['CULTURAL', 'FOODIE', 'SCENIC', 'WELLNESS'],
    pace: ['slow', 'moderate'],
    budget: ['FIVE_TO_10K', 'TEN_TO_20K'],
    interests: ['culture', 'history', 'food', 'zen', 'temples', 'cherry blossoms', 'tea ceremony'],
    travelerTypes: ['COUPLE', 'SOLO', 'ANNIVERSARY', 'MULTI_GEN'],
    bestMonths: [3, 4, 10, 11],
    tagline: 'Ancient temples, zen gardens, and sublime cuisine',
  },
  {
    destination: 'Amalfi Coast', country: 'Italy', region: 'Southern Europe', flagEmoji: '🇮🇹',
    styles: ['ROMANTIC', 'LUXURY', 'SCENIC', 'FOODIE'],
    pace: ['slow', 'moderate'],
    budget: ['TEN_TO_20K', 'OVER_20K'],
    interests: ['beaches', 'food', 'romance', 'scenery', 'boating', 'wine', 'history'],
    travelerTypes: ['COUPLE', 'HONEYMOON', 'ANNIVERSARY', 'GROUP_FRIENDS'],
    bestMonths: [5, 6, 9, 10],
    tagline: 'Cliffside villages, cerulean water, and la dolce vita',
  },
  {
    destination: 'Marrakech', country: 'Morocco', region: 'North Africa', flagEmoji: '🇲🇦',
    styles: ['ADVENTURE', 'CULTURAL', 'FOODIE'],
    pace: ['moderate', 'fast'],
    budget: ['THREE_TO_5K', 'FIVE_TO_10K'],
    interests: ['culture', 'markets', 'history', 'food', 'architecture', 'hammam', 'desert'],
    travelerTypes: ['COUPLE', 'SOLO', 'GROUP_FRIENDS', 'ADVENTURE'],
    bestMonths: [3, 4, 10, 11],
    tagline: 'A sensory feast wrapped in ancient medina walls',
  },
  {
    destination: 'Swiss Alps', country: 'Switzerland', region: 'Central Europe', flagEmoji: '🇨🇭',
    styles: ['SCENIC', 'LUXURY', 'ADVENTURE', 'WELLNESS'],
    pace: ['slow', 'moderate'],
    budget: ['TEN_TO_20K', 'OVER_20K'],
    interests: ['mountains', 'skiing', 'hiking', 'luxury', 'nature', 'trains', 'fondue'],
    travelerTypes: ['COUPLE', 'FAMILY_TEENS', 'MULTI_GEN', 'SOLO', 'GROUP_FRIENDS'],
    bestMonths: [12, 1, 2, 7, 8],
    tagline: 'Dramatic peaks, pristine air, and timeless elegance',
  },
  {
    destination: 'Maldives', country: 'Maldives', region: 'Indian Ocean', flagEmoji: '🇲🇻',
    styles: ['LUXURY', 'ROMANTIC', 'WELLNESS'],
    pace: ['slow'],
    budget: ['TEN_TO_20K', 'OVER_20K'],
    interests: ['beaches', 'diving', 'romance', 'luxury', 'snorkeling', 'overwater bungalows'],
    travelerTypes: ['COUPLE', 'HONEYMOON', 'ANNIVERSARY'],
    bestMonths: [12, 1, 2, 3, 4],
    tagline: 'Overwater luxury in paradise',
  },
  {
    destination: 'Barcelona', country: 'Spain', region: 'Southern Europe', flagEmoji: '🇪🇸',
    styles: ['CULTURAL', 'FOODIE', 'ADVENTURE'],
    pace: ['moderate', 'fast'],
    budget: ['THREE_TO_5K', 'FIVE_TO_10K'],
    interests: ['architecture', 'food', 'beaches', 'nightlife', 'art', 'culture'],
    travelerTypes: ['COUPLE', 'SOLO', 'GROUP_FRIENDS', 'FAMILY_TEENS'],
    bestMonths: [4, 5, 9, 10],
    tagline: 'Gaudí, tapas, and the pulse of the Mediterranean',
  },
  {
    destination: 'New Zealand', country: 'New Zealand', region: 'Oceania', flagEmoji: '🇳🇿',
    styles: ['ADVENTURE', 'SCENIC', 'CULTURAL'],
    pace: ['moderate', 'fast'],
    budget: ['FIVE_TO_10K', 'TEN_TO_20K'],
    interests: ['adventure', 'nature', 'hiking', 'bungee jumping', 'maori culture', 'fjords'],
    travelerTypes: ['COUPLE', 'SOLO', 'GROUP_FRIENDS', 'FAMILY_TEENS'],
    bestMonths: [11, 12, 1, 2, 3],
    tagline: 'The adventure capital at the edge of the world',
  },
]

interface RecommendationResult {
  destination: string
  country: string
  flagEmoji: string
  score: number
  tagline: string
  reasons: string[]
}

interface SurveyPreferences {
  travelStyles?: string | null
  pacePreference?: string | null
  budget?: string | null
  interests?: string | null
  travelerType?: string | null
  tripMonths?: string | null
}

export function recommendDestinations(
  preferences: SurveyPreferences
): RecommendationResult[] {
  const styles = parseJsonField<string[]>(preferences.travelStyles, [])
  const interests = parseJsonField<string[]>(preferences.interests, [])
  const months = parseJsonField<number[]>(preferences.tripMonths, [])
  const pace = preferences.pacePreference || 'moderate'
  const budget = preferences.budget || 'FIVE_TO_10K'
  const travelerType = preferences.travelerType || 'COUPLE'

  return destinations
    .map(dest => {
      let score = 0
      const reasons: string[] = []

      const styleMatches = styles.filter(s => dest.styles.includes(s))
      if (styleMatches.length > 0) {
        score += styleMatches.length * 12
        reasons.push(`Matches your ${styleMatches.map(s => s.toLowerCase()).join(' and ')} travel style`)
      }

      if (dest.pace.includes(pace)) {
        score += 10
        reasons.push(`Perfect ${pace}-pace destination`)
      }

      if (dest.budget.includes(budget)) {
        score += 12
        reasons.push('Fits your budget')
      }

      const interestMatches = interests.filter(i =>
        dest.interests.some(di => di.toLowerCase().includes(i.toLowerCase()))
      )
      if (interestMatches.length > 0) {
        score += interestMatches.length * 7
        reasons.push(`Aligns with your interest in ${interestMatches.slice(0, 2).join(' and ')}`)
      }

      if (dest.travelerTypes.includes(travelerType)) {
        score += 8
        reasons.push(`Popular with ${travelerType.replace(/_/g, ' ').toLowerCase()}s`)
      }

      if (months.length > 0) {
        const monthMatch = months.some(m => dest.bestMonths.includes(m))
        if (monthMatch) {
          score += 8
          reasons.push('Ideal timing for your travel dates')
        }
      }

      return {
        destination: dest.destination,
        country: dest.country,
        flagEmoji: dest.flagEmoji,
        score,
        tagline: dest.tagline,
        reasons: reasons.slice(0, 3),
      }
    })
    .filter(r => r.score > 20)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
}
