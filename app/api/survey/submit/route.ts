import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { generateTravelerSummary } from "@/lib/itinerary-generator"

const surveySchema = z.object({
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),

  travelerType: z.string().optional(),
  groupSize: z.number().optional(),
  childrenAges: z.array(z.string()).optional(),

  tripDurationMin: z.number().optional(),
  tripDurationMax: z.number().optional(),
  tripYear: z.number().optional(),
  tripMonths: z.array(z.number()).optional(),
  budget: z.string().optional(),
  budgetFlexible: z.boolean().optional(),

  destinationsKnown: z.boolean().optional(),
  destinationsPartial: z.boolean().optional(),
  destinationsList: z.array(z.string()).optional(),
  destinationOpenTo: z.array(z.string()).optional(),
  openToSuggestions: z.boolean().optional(),

  travelStyles: z.array(z.string()).optional(),
  pacePreference: z.string().optional(),
  accommodationType: z.array(z.string()).optional(),

  interests: z.array(z.string()).optional(),
  mustHaveExperiences: z.string().optional(),
  avoidExperiences: z.string().optional(),

  diningImportance: z.number().optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  diningStyle: z.string().optional(),

  countriesVisited: z.array(z.string()).optional(),
  favoriteTrip: z.string().optional(),
  worstTripAspect: z.string().optional(),

  celebrationDetails: z.string().optional(),
  accessibilityNeeds: z.string().optional(),
  otherRequests: z.string().optional(),

  planningInvolvement: z.string().optional(),
  communicationPref: z.string().optional(),

  tripFeeling: z.string().optional(),
  oneWord: z.string().optional(),
})

// Build survey data object, only including fields that were actually provided
function buildSurveyData(data: z.infer<typeof surveySchema>) {
  const result: Record<string, any> = {}

  // Simple string fields — only set if provided
  const stringFields = [
    "travelerType", "budget", "pacePreference", "diningStyle",
    "mustHaveExperiences", "avoidExperiences", "favoriteTrip", "worstTripAspect",
    "celebrationDetails", "accessibilityNeeds", "otherRequests",
    "planningInvolvement", "communicationPref", "tripFeeling", "oneWord",
  ] as const
  for (const f of stringFields) {
    if (data[f] !== undefined) result[f] = data[f]
  }

  // Number fields
  if (data.groupSize !== undefined) result.groupSize = data.groupSize
  if (data.tripDurationMin !== undefined) result.tripDurationMin = data.tripDurationMin
  if (data.tripDurationMax !== undefined) result.tripDurationMax = data.tripDurationMax
  if (data.tripYear !== undefined) result.tripYear = data.tripYear
  if (data.diningImportance !== undefined) result.diningImportance = data.diningImportance

  // Boolean fields
  if (data.budgetFlexible !== undefined) result.budgetFlexible = data.budgetFlexible
  if (data.destinationsKnown !== undefined) result.destinationsKnown = data.destinationsKnown
  if (data.openToSuggestions !== undefined) result.openToSuggestions = data.openToSuggestions

  // JSON array fields — only set if provided
  const jsonArrayFields = [
    "childrenAges", "tripMonths", "destinationsList", "destinationOpenTo",
    "travelStyles", "accommodationType", "interests", "dietaryRestrictions",
    "countriesVisited",
  ] as const
  for (const f of jsonArrayFields) {
    if (data[f] !== undefined) result[f] = JSON.stringify(data[f])
  }

  return result
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = surveySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Create or update lead — do NOT reset status on update
    const existingLead = await db.customerLead.findUnique({ where: { email: data.email } })
    const lead = await db.customerLead.upsert({
      where: { email: data.email },
      update: {
        firstName: data.firstName,
        lastName: data.lastName,
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        // Only set to NEW if this is truly a new submission (no existing lead)
        ...(existingLead ? {} : { status: "NEW" }),
      },
      create: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        status: "NEW",
        source: "website_survey",
      },
    })

    // Build survey data — only include fields that were actually submitted
    const surveyData = buildSurveyData(data)

    await db.tripSurvey.upsert({
      where: { leadId: lead.id },
      update: surveyData,
      create: { leadId: lead.id, ...surveyData },
    })

    // Read back the full survey for summary generation
    const fullSurvey = await db.tripSurvey.findUnique({ where: { leadId: lead.id } })

    // Generate traveler summary from complete survey data
    const summaryData = generateTravelerSummary({
      travelerType: fullSurvey?.travelerType,
      groupSize: fullSurvey?.groupSize,
      travelStyles: fullSurvey?.travelStyles,
      pacePreference: fullSurvey?.pacePreference,
      destinationsList: fullSurvey?.destinationsList,
      destinationsKnown: fullSurvey?.destinationsKnown,
      openToSuggestions: fullSurvey?.openToSuggestions,
      budget: fullSurvey?.budget,
      tripDurationMin: fullSurvey?.tripDurationMin,
      tripDurationMax: fullSurvey?.tripDurationMax,
      interests: fullSurvey?.interests,
      diningStyle: fullSurvey?.diningStyle,
      diningImportance: fullSurvey?.diningImportance,
      mustHaveExperiences: fullSurvey?.mustHaveExperiences,
      avoidExperiences: fullSurvey?.avoidExperiences,
      tripFeeling: fullSurvey?.tripFeeling,
      oneWord: fullSurvey?.oneWord,
      accommodationType: fullSurvey?.accommodationType,
    })

    await db.generatedTravelerSummary.upsert({
      where: { leadId: lead.id },
      update: {
        travelerSummary: summaryData.travelerSummary,
        idealTripStyle: summaryData.idealTripStyle,
        bestFitDestinations: JSON.stringify(summaryData.bestFitDestinations),
        pacingRecommendation: summaryData.pacingRecommendation,
        routeSuggestion: summaryData.routeSuggestion,
        hotelStyle: summaryData.hotelStyle,
        diningFocus: summaryData.diningFocus,
        activitiesRecommended: JSON.stringify(summaryData.activitiesRecommended),
        avoidPatterns: JSON.stringify(summaryData.avoidPatterns),
        advisorNotes: summaryData.advisorNotes,
        matchingTemplates: JSON.stringify(summaryData.matchingTemplates),
      },
      create: {
        leadId: lead.id,
        travelerSummary: summaryData.travelerSummary,
        idealTripStyle: summaryData.idealTripStyle,
        bestFitDestinations: JSON.stringify(summaryData.bestFitDestinations),
        pacingRecommendation: summaryData.pacingRecommendation,
        routeSuggestion: summaryData.routeSuggestion,
        hotelStyle: summaryData.hotelStyle,
        diningFocus: summaryData.diningFocus,
        activitiesRecommended: JSON.stringify(summaryData.activitiesRecommended),
        avoidPatterns: JSON.stringify(summaryData.avoidPatterns),
        advisorNotes: summaryData.advisorNotes,
        matchingTemplates: JSON.stringify(summaryData.matchingTemplates),
      },
    })

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      summary: summaryData.travelerSummary,
    })
  } catch (error) {
    console.error("Survey submit error:", error)
    return NextResponse.json(
      { error: "Failed to submit survey" },
      { status: 500 }
    )
  }
}
