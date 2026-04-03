"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

interface PastTripInput {
  title: string
  destination: string
  country: string
  flagEmoji?: string
  clientName: string
  tripDate: string
  durationDays: number
  summary: string
  highlights: string[]
  travelStyle: string
  travelerType: string
  budgetLevel: string
  testimonial?: string
  rating?: number
  advisorNotes?: string
}

function toData(input: PastTripInput) {
  return {
    title: input.title,
    destination: input.destination,
    country: input.country,
    flagEmoji: input.flagEmoji || null,
    clientName: input.clientName,
    tripDate: input.tripDate,
    durationDays: input.durationDays,
    summary: input.summary,
    highlights: JSON.stringify(input.highlights),
    travelStyle: input.travelStyle,
    travelerType: input.travelerType,
    budgetLevel: input.budgetLevel,
    testimonial: input.testimonial || null,
    rating: input.rating || null,
    advisorNotes: input.advisorNotes || null,
  }
}

export async function createPastTrip(input: PastTripInput) {
  const trip = await db.pastTrip.create({ data: toData(input) })
  revalidatePath("/past-trips")
  return trip
}

export async function updatePastTrip(id: string, input: PastTripInput) {
  await db.pastTrip.update({ where: { id }, data: toData(input) })
  revalidatePath(`/past-trips/${id}`)
  revalidatePath("/past-trips")
}

export async function deletePastTrip(id: string) {
  await db.pastTrip.delete({ where: { id } })
  revalidatePath("/past-trips")
}
