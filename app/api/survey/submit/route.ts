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

    // Create or update lead
    const lead = await db.customerLead.upsert({
      where: { email: data.email },
      update: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        status: "NEW",
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

    // Create survey
    const survey = await db.tripSurvey.upsert({
      where: { leadId: lead.id },
      update: {
        travelerType: data.travelerType,
        groupSize: data.groupSize,
        childrenAges: data.childrenAges ? JSON.stringify(data.childrenAges) : null,
        tripDurationMin: data.tripDurationMin,
        tripDurationMax: data.tripDurationMax,
        tripYear: data.tripYear,
        tripMonths: data.tripMonths ? JSON.stringify(data.tripMonths) : null,
        budget: data.budget,
        budgetFlexible: data.budgetFlexible || false,
        destinationsKnown: data.destinationsKnown || false,
        destinationsList: data.destinationsList ? JSON.stringify(data.destinationsList) : null,
        destinationOpenTo: data.destinationOpenTo ? JSON.stringify(data.destinationOpenTo) : null,
        openToSuggestions: data.openToSuggestions || true,
        travelStyles: data.travelStyles ? JSON.stringify(data.travelStyles) : null,
        pacePreference: data.pacePreference,
        accommodationType: data.accommodationType ? JSON.stringify(data.accommodationType) : null,
        interests: data.interests ? JSON.stringify(data.interests) : null,
        mustHaveExperiences: data.mustHaveExperiences,
        avoidExperiences: data.avoidExperiences,
        diningImportance: data.diningImportance,
        dietaryRestrictions: data.dietaryRestrictions ? JSON.stringify(data.dietaryRestrictions) : null,
        diningStyle: data.diningStyle,
        countriesVisited: data.countriesVisited ? JSON.stringify(data.countriesVisited) : null,
        favoriteTrip: data.favoriteTrip,
        worstTripAspect: data.worstTripAspect,
        celebrationDetails: data.celebrationDetails,
        accessibilityNeeds: data.accessibilityNeeds,
        otherRequests: data.otherRequests,
        planningInvolvement: data.planningInvolvement,
        communicationPref: data.communicationPref,
        tripFeeling: data.tripFeeling,
        oneWord: data.oneWord,
      },
      create: {
        leadId: lead.id,
        travelerType: data.travelerType,
        groupSize: data.groupSize,
        childrenAges: data.childrenAges ? JSON.stringify(data.childrenAges) : null,
        tripDurationMin: data.tripDurationMin,
        tripDurationMax: data.tripDurationMax,
        tripYear: data.tripYear,
        tripMonths: data.tripMonths ? JSON.stringify(data.tripMonths) : null,
        budget: data.budget,
        budgetFlexible: data.budgetFlexible || false,
        destinationsKnown: data.destinationsKnown || false,
        destinationsList: data.destinationsList ? JSON.stringify(data.destinationsList) : null,
        destinationOpenTo: data.destinationOpenTo ? JSON.stringify(data.destinationOpenTo) : null,
        openToSuggestions: data.openToSuggestions || true,
        travelStyles: data.travelStyles ? JSON.stringify(data.travelStyles) : null,
        pacePreference: data.pacePreference,
        accommodationType: data.accommodationType ? JSON.stringify(data.accommodationType) : null,
        interests: data.interests ? JSON.stringify(data.interests) : null,
        mustHaveExperiences: data.mustHaveExperiences,
        avoidExperiences: data.avoidExperiences,
        diningImportance: data.diningImportance,
        dietaryRestrictions: data.dietaryRestrictions ? JSON.stringify(data.dietaryRestrictions) : null,
        diningStyle: data.diningStyle,
        countriesVisited: data.countriesVisited ? JSON.stringify(data.countriesVisited) : null,
        favoriteTrip: data.favoriteTrip,
        worstTripAspect: data.worstTripAspect,
        celebrationDetails: data.celebrationDetails,
        accessibilityNeeds: data.accessibilityNeeds,
        otherRequests: data.otherRequests,
        planningInvolvement: data.planningInvolvement,
        communicationPref: data.communicationPref,
        tripFeeling: data.tripFeeling,
        oneWord: data.oneWord,
      },
    })

    // Generate traveler summary
    const summaryData = generateTravelerSummary({
      travelerType: data.travelerType,
      groupSize: data.groupSize,
      travelStyles: data.travelStyles ? JSON.stringify(data.travelStyles) : null,
      pacePreference: data.pacePreference,
      destinationsList: data.destinationsList ? JSON.stringify(data.destinationsList) : null,
      destinationsKnown: data.destinationsKnown,
      openToSuggestions: data.openToSuggestions,
      budget: data.budget,
      tripDurationMin: data.tripDurationMin,
      tripDurationMax: data.tripDurationMax,
      interests: data.interests ? JSON.stringify(data.interests) : null,
      diningStyle: data.diningStyle,
      diningImportance: data.diningImportance,
      mustHaveExperiences: data.mustHaveExperiences,
      avoidExperiences: data.avoidExperiences,
      tripFeeling: data.tripFeeling,
      oneWord: data.oneWord,
      accommodationType: data.accommodationType ? JSON.stringify(data.accommodationType) : null,
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
