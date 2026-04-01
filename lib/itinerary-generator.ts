import { parseJsonField } from "@/lib/utils"

interface SurveyData {
  travelerType?: string | null
  groupSize?: number | null
  travelStyles?: string | null
  pacePreference?: string | null
  destinationsList?: string | null
  destinationsKnown?: boolean
  openToSuggestions?: boolean
  budget?: string | null
  tripDurationMin?: number | null
  tripDurationMax?: number | null
  interests?: string | null
  diningStyle?: string | null
  diningImportance?: number | null
  mustHaveExperiences?: string | null
  avoidExperiences?: string | null
  tripFeeling?: string | null
  oneWord?: string | null
  accommodationType?: string | null
}

interface GeneratedSummary {
  travelerSummary: string
  idealTripStyle: string
  bestFitDestinations: Array<{ destination: string; reason: string; score: number }>
  pacingRecommendation: string
  routeSuggestion: string
  hotelStyle: string
  diningFocus: string
  activitiesRecommended: string[]
  avoidPatterns: string[]
  advisorNotes: string
  matchingTemplates: Array<{ templateId?: string; title: string; score: number; reason: string }>
}

const destinationProfiles: Record<string, {
  styles: string[]; pace: string[]; budget: string[]; interests: string[]
}> = {
  Iceland: {
    styles: ['ADVENTURE', 'SCENIC', 'WELLNESS'],
    pace: ['moderate', 'fast'],
    budget: ['FIVE_TO_10K', 'TEN_TO_20K'],
    interests: ['nature', 'photography', 'hiking', 'hot springs'],
  },
  Paris: {
    styles: ['CULTURAL', 'ROMANTIC', 'FOODIE', 'LUXURY'],
    pace: ['slow', 'moderate'],
    budget: ['FIVE_TO_10K', 'TEN_TO_20K', 'OVER_20K'],
    interests: ['art', 'food', 'history', 'fashion', 'romance'],
  },
  "Amalfi Coast": {
    styles: ['ROMANTIC', 'LUXURY', 'SCENIC', 'FOODIE'],
    pace: ['slow', 'moderate'],
    budget: ['TEN_TO_20K', 'OVER_20K'],
    interests: ['beaches', 'food', 'romance', 'scenery', 'boating'],
  },
  Japan: {
    styles: ['CULTURAL', 'FOODIE', 'ADVENTURE', 'SCENIC'],
    pace: ['moderate', 'fast'],
    budget: ['FIVE_TO_10K', 'TEN_TO_20K'],
    interests: ['culture', 'food', 'history', 'nature', 'technology'],
  },
  Greece: {
    styles: ['ROMANTIC', 'CULTURAL', 'LUXURY', 'SCENIC'],
    pace: ['slow', 'moderate'],
    budget: ['FIVE_TO_10K', 'TEN_TO_20K', 'OVER_20K'],
    interests: ['beaches', 'history', 'food', 'romance', 'sailing'],
  },
  Morocco: {
    styles: ['ADVENTURE', 'CULTURAL', 'FOODIE'],
    pace: ['moderate', 'fast'],
    budget: ['THREE_TO_5K', 'FIVE_TO_10K'],
    interests: ['culture', 'markets', 'history', 'desert', 'food'],
  },
  Switzerland: {
    styles: ['SCENIC', 'LUXURY', 'ADVENTURE', 'WELLNESS'],
    pace: ['slow', 'moderate'],
    budget: ['TEN_TO_20K', 'OVER_20K'],
    interests: ['mountains', 'skiing', 'hiking', 'luxury', 'nature'],
  },
  "New Zealand": {
    styles: ['ADVENTURE', 'SCENIC', 'CULTURAL'],
    pace: ['moderate', 'fast'],
    budget: ['FIVE_TO_10K', 'TEN_TO_20K'],
    interests: ['adventure', 'nature', 'hiking', 'bungee jumping', 'maori culture'],
  },
  Spain: {
    styles: ['CULTURAL', 'FOODIE', 'ROMANTIC', 'ADVENTURE'],
    pace: ['moderate', 'fast'],
    budget: ['FIVE_TO_10K', 'TEN_TO_20K'],
    interests: ['food', 'culture', 'flamenco', 'beaches', 'architecture'],
  },
  Maldives: {
    styles: ['LUXURY', 'ROMANTIC', 'WELLNESS'],
    pace: ['slow'],
    budget: ['TEN_TO_20K', 'OVER_20K'],
    interests: ['beaches', 'diving', 'romance', 'luxury', 'snorkeling'],
  },
}

const hotelStyles: Record<string, string> = {
  LUXURY: 'Boutique luxury properties, 5-star hotels with personalized service',
  ADVENTURE: 'Comfortable lodges, eco-resorts, and mountain refuges',
  CULTURAL: 'Historic hotels, converted palaces, and locally-owned boutique properties',
  ROMANTIC: 'Intimate boutique hotels, cliff-top villas, and private suite retreats',
  FAMILY: 'Spacious resort properties with family suites and kid-friendly amenities',
  WELLNESS: 'Spa resorts, wellness retreats, and tranquil countryside estates',
  FOODIE: 'Design hotels near culinary hubs, properties with celebrated restaurants',
  SCENIC: 'Viewpoint lodges, panoramic suite hotels, and landscape-immersive stays',
}

const diningFocus: Record<string, string> = {
  slow: 'Long, leisurely meals at highly-rated local restaurants with advance reservations',
  moderate: 'Mix of celebrated restaurants, local markets, and authentic neighborhood eateries',
  fast: 'Street food exploration, food markets, and quick bites between sights',
}

export function generateTravelerSummary(survey: SurveyData): GeneratedSummary {
  const styles = parseJsonField<string[]>(survey.travelStyles, [])
  const destinations = parseJsonField<string[]>(survey.destinationsList, [])
  const interests = parseJsonField<string[]>(survey.interests, [])
  const accommodationTypes = parseJsonField<string[]>(survey.accommodationType, [])

  const pace = survey.pacePreference || 'moderate'
  const budget = survey.budget || 'FIVE_TO_10K'
  const travelerType = survey.travelerType || 'COUPLE'
  const groupSize = survey.groupSize || 2

  // Build traveler summary
  const travelerDescriptors: string[] = []
  if (travelerType === 'HONEYMOON') travelerDescriptors.push('honeymooning couple')
  else if (travelerType === 'COUPLE') travelerDescriptors.push('couple')
  else if (travelerType === 'FAMILY_YOUNG_KIDS') travelerDescriptors.push('family with young children')
  else if (travelerType === 'FAMILY_TEENS') travelerDescriptors.push('family with teenagers')
  else if (travelerType === 'SOLO') travelerDescriptors.push('solo traveler')
  else if (travelerType === 'GROUP_FRIENDS') travelerDescriptors.push(`group of ${groupSize} friends`)
  else if (travelerType === 'ANNIVERSARY') travelerDescriptors.push('couple celebrating an anniversary')
  else travelerDescriptors.push('traveler')

  const styleWords = styles.slice(0, 2).map(s => s.toLowerCase()).join(' and ')
  const paceWord = pace === 'slow' ? 'unhurried' : pace === 'fast' ? 'energetic' : 'balanced'

  const travelerSummary = `This ${travelerDescriptors[0]} is seeking a ${paceWord}, ${styleWords || 'culturally rich'} travel experience. ${
    survey.tripFeeling
      ? `They want to feel "${survey.tripFeeling}" — ${survey.oneWord ? `best captured by the word "${survey.oneWord}."` : 'a feeling that should guide every aspect of their itinerary.'}`
      : 'Their ideal trip balances discovery with comfort and genuine local immersion.'
  } ${
    interests.length > 0
      ? `Key interests include ${interests.slice(0, 3).join(', ')}, suggesting they value depth of experience over breadth of coverage.`
      : ''
  }`

  // Ideal trip style
  const primaryStyle = styles[0] || 'CULTURAL'
  const idealTripStyle = styles.length > 1
    ? `${capitalizeFirst(styles[0])} ${pace === 'slow' ? 'slow travel' : 'exploration'} with ${capitalizeFirst(styles[1])} undertones`
    : `${capitalizeFirst(primaryStyle)} ${pace === 'slow' ? 'immersion' : 'discovery'}`

  // Best fit destinations
  const bestFitDestinations: Array<{ destination: string; reason: string; score: number }> = []

  if (destinations.length > 0) {
    destinations.forEach((dest, i) => {
      bestFitDestinations.push({
        destination: dest,
        reason: `Traveler-requested destination — aligns with their ${styleWords || 'travel'} preferences and stated interests.`,
        score: 95 - (i * 5),
      })
    })
  } else {
    // Recommend based on preferences
    for (const [dest, profile] of Object.entries(destinationProfiles)) {
      let score = 50
      styles.forEach(s => { if (profile.styles.includes(s)) score += 10 })
      if (profile.pace.includes(pace)) score += 10
      if (profile.budget.includes(budget)) score += 10
      interests.forEach(i => { if (profile.interests.some(pi => pi.includes(i.toLowerCase()))) score += 5 })

      if (score > 60) {
        bestFitDestinations.push({
          destination: dest,
          reason: `Excellent match for ${styleWords || 'their'} travel style, preferred pace, and budget range.`,
          score: Math.min(score, 99),
        })
      }
    }
    bestFitDestinations.sort((a, b) => b.score - a.score)
  }

  // Pacing recommendation
  const pacingMap: Record<string, string> = {
    slow: 'Recommend 2-3 nights minimum per location. Prioritize depth over breadth — fewer places done well. Build in unscheduled afternoon time for wandering and discovery.',
    moderate: 'Balance structure with flexibility. Mix 2-night city stays with 3-night deep dives at key destinations. Allow one free day mid-trip to reset.',
    fast: 'High-energy itinerary with efficient routing. Focus on highlights and bucket-list moments. Minimize transit time with smart logistics.',
  }
  const pacingRecommendation = pacingMap[pace] || pacingMap.moderate

  // Route suggestion
  const topDests = bestFitDestinations.slice(0, 3).map(d => d.destination)
  const routeSuggestion = topDests.length > 1
    ? `Suggested routing: ${topDests.join(' → ')}. Consider opening in a gateway city before transitioning to the main experience destinations. End with a relaxed final night near the departure airport.`
    : topDests.length === 1
    ? `Focus the entire trip on ${topDests[0]}. With dedicated time in one destination, you can truly unlock the layers that most travelers miss.`
    : 'Multi-destination itinerary to be refined after destination consultation.'

  // Hotel style
  const primaryAccom = accommodationTypes[0] || (styles[0] || 'LUXURY')
  const hotelStyleKey = styles.find(s => hotelStyles[s]) || 'LUXURY'
  const hotelStyleText = hotelStyles[hotelStyleKey] || hotelStyles.LUXURY

  // Dining focus
  const diningFocusText = diningFocus[pace] || diningFocus.moderate

  // Activities
  const activitiesRecommended: string[] = []
  if (interests.includes('history') || styles.includes('CULTURAL')) {
    activitiesRecommended.push('Guided cultural and historical tours with expert local guides')
  }
  if (interests.includes('food') || styles.includes('FOODIE')) {
    activitiesRecommended.push('Curated food experiences: market tours, cooking classes, chef\'s table dinners')
  }
  if (styles.includes('ADVENTURE')) {
    activitiesRecommended.push('Outdoor adventures: hiking, cycling, or water sports tailored to fitness level')
  }
  if (styles.includes('WELLNESS')) {
    activitiesRecommended.push('Spa treatments and wellness experiences at top-rated facilities')
  }
  if (styles.includes('ROMANTIC') || travelerType === 'HONEYMOON') {
    activitiesRecommended.push('Private dining experiences, sunset cruises, and couples\' activities')
  }
  if (interests.includes('photography')) {
    activitiesRecommended.push('Photography-focused excursions at golden hour locations')
  }
  activitiesRecommended.push('Private airport transfers and in-destination transportation')

  // Avoid patterns
  const avoidPatterns: string[] = []
  if (survey.avoidExperiences) {
    avoidPatterns.push(survey.avoidExperiences)
  }
  if (pace === 'slow') {
    avoidPatterns.push('Avoid checklist-style touring with too many stops in one day')
  }
  if (budget === 'UNDER_3K') {
    avoidPatterns.push('Manage expectations around luxury property availability at this budget level')
  }
  avoidPatterns.push('Avoid peak tourist hours at major attractions — recommend early morning or private access')

  // Advisor notes
  const advisorNotes = `Key consideration: This traveler values ${survey.tripFeeling || 'meaningful experiences'} above all. ${
    budget === 'OVER_20K' || budget === 'TEN_TO_20K'
      ? 'Budget indicates genuine luxury is appropriate — focus on upgraded experiences and private access.'
      : budget === 'UNDER_3K'
      ? 'Budget is tight — focus on value picks and timing. Consider shoulder season.'
      : 'Mid-range budget with flexibility for special experiences.'
  } ${
    survey.mustHaveExperiences
      ? `Must-have: "${survey.mustHaveExperiences}" — prioritize building this into the core itinerary, not as an add-on.`
      : ''
  } Recommend a 30-minute call to refine details before proposing.`

  // Matching templates (placeholder - would be scored against actual DB)
  const matchingTemplates = bestFitDestinations.slice(0, 3).map((d, i) => ({
    title: `${d.destination} ${styles[0] ? capitalizeFirst(styles[0]) : 'Classic'} Experience`,
    score: d.score - (i * 8),
    reason: `Strong match based on destination preference and ${styleWords || 'travel'} style alignment.`,
  }))

  return {
    travelerSummary,
    idealTripStyle,
    bestFitDestinations: bestFitDestinations.slice(0, 5),
    pacingRecommendation,
    routeSuggestion,
    hotelStyle: hotelStyleText,
    diningFocus: diningFocusText,
    activitiesRecommended,
    avoidPatterns,
    advisorNotes,
    matchingTemplates,
  }
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
