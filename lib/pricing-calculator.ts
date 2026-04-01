export interface PricingInput {
  destination: string
  durationDays: number
  travelerType: string
  groupSize: number
  budgetLevel: string
  accommodationType?: string
}

export interface PricingBreakdown {
  flights: { min: number; max: number; notes: string }
  accommodation: { min: number; max: number; perNight: { min: number; max: number }; notes: string }
  dining: { min: number; max: number; perDay: { min: number; max: number }; notes: string }
  activities: { min: number; max: number; notes: string }
  transfers: { min: number; max: number; notes: string }
  total: { min: number; max: number }
  perPersonTotal: { min: number; max: number }
  advisorFee: { min: number; max: number }
  notes: string
}

const destinationMultipliers: Record<string, number> = {
  'Maldives': 2.2,
  'Switzerland': 1.8,
  'Iceland': 1.5,
  'Japan': 1.3,
  'Greece': 1.2,
  'Amalfi Coast': 1.7,
  'Italy': 1.3,
  'France': 1.4,
  'Paris': 1.5,
  'Spain': 1.0,
  'Morocco': 0.7,
  'Portugal': 0.9,
  default: 1.1,
}

const budgetBaseRates: Record<string, { hotelPerNight: [number, number]; diningPerDay: [number, number]; flightBase: [number, number] }> = {
  UNDER_3K: {
    hotelPerNight: [60, 120],
    diningPerDay: [30, 60],
    flightBase: [400, 700],
  },
  THREE_TO_5K: {
    hotelPerNight: [120, 220],
    diningPerDay: [60, 100],
    flightBase: [500, 900],
  },
  FIVE_TO_10K: {
    hotelPerNight: [250, 450],
    diningPerDay: [100, 180],
    flightBase: [700, 1200],
  },
  TEN_TO_20K: {
    hotelPerNight: [450, 900],
    diningPerDay: [180, 300],
    flightBase: [1200, 2500],
  },
  OVER_20K: {
    hotelPerNight: [900, 2500],
    diningPerDay: [300, 600],
    flightBase: [2500, 8000],
  },
}

export function calculatePricing(input: PricingInput): PricingBreakdown {
  const rates = budgetBaseRates[input.budgetLevel] || budgetBaseRates.FIVE_TO_10K
  const destMult = destinationMultipliers[input.destination] || destinationMultipliers.default
  const nights = input.durationDays - 1
  const travelers = input.groupSize || 2

  // Flights (per person)
  const flightMin = rates.flightBase[0] * destMult
  const flightMax = rates.flightBase[1] * destMult
  const totalFlightMin = flightMin * travelers
  const totalFlightMax = flightMax * travelers

  // Accommodation (for group)
  const hotelRooms = travelers <= 2 ? 1 : Math.ceil(travelers / 2)
  const hotelNightMin = rates.hotelPerNight[0] * destMult * hotelRooms
  const hotelNightMax = rates.hotelPerNight[1] * destMult * hotelRooms
  const totalHotelMin = hotelNightMin * nights
  const totalHotelMax = hotelNightMax * nights

  // Dining (per day for group)
  const diningDayMin = rates.diningPerDay[0] * travelers * destMult
  const diningDayMax = rates.diningPerDay[1] * travelers * destMult
  const totalDiningMin = diningDayMin * input.durationDays
  const totalDiningMax = diningDayMax * input.durationDays

  // Activities
  const activitiesMin = (input.durationDays * 40 * travelers) * destMult
  const activitiesMax = (input.durationDays * 150 * travelers) * destMult

  // Transfers
  const transfersMin = 150 * travelers
  const transfersMax = 400 * travelers

  const grandMin = totalFlightMin + totalHotelMin + totalDiningMin + activitiesMin + transfersMin
  const grandMax = totalFlightMax + totalHotelMax + totalDiningMax + activitiesMax + transfersMax

  // Advisor fee (8-12% of trip cost, min $500 per person)
  const advisorMin = Math.max(grandMin * 0.08, 500 * travelers)
  const advisorMax = Math.max(grandMax * 0.10, 800 * travelers)

  return {
    flights: {
      min: Math.round(totalFlightMin),
      max: Math.round(totalFlightMax),
      notes: `Estimated economy to business class per person. Prices vary significantly by departure city and booking window.`,
    },
    accommodation: {
      min: Math.round(totalHotelMin),
      max: Math.round(totalHotelMax),
      perNight: {
        min: Math.round(hotelNightMin),
        max: Math.round(hotelNightMax),
      },
      notes: `${nights} nights for ${hotelRooms} room${hotelRooms > 1 ? 's' : ''}. Range covers standard to premium properties.`,
    },
    dining: {
      min: Math.round(totalDiningMin),
      max: Math.round(totalDiningMax),
      perDay: {
        min: Math.round(diningDayMin),
        max: Math.round(diningDayMax),
      },
      notes: 'Includes breakfast at hotel, casual lunches, and dinners. Fine dining nights will push toward upper range.',
    },
    activities: {
      min: Math.round(activitiesMin),
      max: Math.round(activitiesMax),
      notes: 'Guided tours, entrance fees, and curated experiences. Private guides add approximately 30-50%.',
    },
    transfers: {
      min: Math.round(transfersMin),
      max: Math.round(transfersMax),
      notes: 'Private airport transfers and in-destination transportation.',
    },
    total: {
      min: Math.round(grandMin),
      max: Math.round(grandMax),
    },
    perPersonTotal: {
      min: Math.round(grandMin / travelers),
      max: Math.round(grandMax / travelers),
    },
    advisorFee: {
      min: Math.round(advisorMin),
      max: Math.round(advisorMax),
    },
    notes: `Estimate for ${travelers} traveler${travelers > 1 ? 's' : ''} over ${input.durationDays} days in ${input.destination}. These are planning-level estimates only — final pricing will be confirmed after property selection and booking. Currency fluctuations and seasonal pricing apply.`,
  }
}
