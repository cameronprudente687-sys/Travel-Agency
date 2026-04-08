"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

interface TemplateInput {
  title: string
  destination: string
  country: string
  region?: string
  flagEmoji?: string
  summary: string
  description: string
  durationDays: number
  travelStyles: string[]
  travelerTypes: string[]
  budgetLevel: string
  paceLevel: string
  status?: string
  isFeatured?: boolean
  isBestSeller?: boolean
  isSignature?: boolean
  bestMonths?: number[]
  highlights: string[]
  includes: string[]
  excludes?: string[]
  basePrice?: number
  priceNotes?: string
}

function toData(input: TemplateInput) {
  return {
    title: input.title,
    destination: input.destination,
    country: input.country,
    region: input.region || null,
    flagEmoji: input.flagEmoji || null,
    summary: input.summary,
    description: input.description,
    durationDays: input.durationDays,
    travelStyles: JSON.stringify(input.travelStyles),
    travelerTypes: JSON.stringify(input.travelerTypes),
    budgetLevel: input.budgetLevel,
    paceLevel: input.paceLevel,
    status: input.status || "ACTIVE",
    isFeatured: input.isFeatured || false,
    isBestSeller: input.isBestSeller || false,
    isSignature: input.isSignature || false,
    bestMonths: input.bestMonths ? JSON.stringify(input.bestMonths) : null,
    highlights: JSON.stringify(input.highlights),
    includes: JSON.stringify(input.includes),
    excludes: input.excludes ? JSON.stringify(input.excludes) : null,
    basePrice: input.basePrice || null,
    priceNotes: input.priceNotes || null,
  }
}

export async function createTemplate(input: TemplateInput) {
  const template = await db.itineraryTemplate.create({ data: toData(input) })
  revalidatePath("/templates")
  return template
}

export async function updateTemplate(id: string, input: TemplateInput) {
  await db.itineraryTemplate.update({ where: { id }, data: toData(input) })
  revalidatePath(`/templates/${id}`)
  revalidatePath("/templates")
}

export async function deleteTemplate(id: string) {
  await db.itineraryTemplate.delete({ where: { id } })
  revalidatePath("/templates")
}

export async function duplicateTemplate(id: string) {
  const source = await db.itineraryTemplate.findUnique({
    where: { id },
    include: { days: true },
  })
  if (!source) return
  const { id: _, createdAt, updatedAt, days, collections, ...rest } = source as any
  const copy = await db.itineraryTemplate.create({
    data: { ...rest, title: `${source.title} (Copy)`, isFeatured: false, isBestSeller: false },
  })
  for (const day of days) {
    const { id: __, templateId, ...dayRest } = day
    await db.templateDay.create({ data: { ...dayRest, templateId: copy.id } })
  }
  revalidatePath("/templates")
  return copy
}

export async function saveVersionAsTemplate(versionId: string, overrides: {
  title: string
  destination: string
  country: string
  flagEmoji?: string
  travelStyles: string[]
  travelerTypes: string[]
  budgetLevel: string
  paceLevel: string
  isSignature?: boolean
  isBestSeller?: boolean
}) {
  const version = await db.tripVersion.findUnique({ where: { id: versionId } })
  if (!version) throw new Error("Version not found")

  const itinerary = JSON.parse(version.itinerary || "[]") as any[]
  const hotels = JSON.parse(version.hotelIdeas || "[]") as any[]
  const experiences = JSON.parse(version.experiences || "[]") as any[]
  const destinations = JSON.parse(version.destinations || "[]") as string[]

  // Build highlights from itinerary + experiences (strip client-specific content)
  const highlights = [
    ...experiences.map((e: any) => e.name).filter(Boolean),
    ...itinerary.slice(0, 4).map((d: any) => d.title).filter(Boolean),
  ].slice(0, 8)

  // Build includes from hotels + experiences
  const includes = [
    `${itinerary.length} days / ${Math.max(itinerary.length - 1, 1)} nights accommodation`,
    ...hotels.map((h: any) => h.name ? `Stay: ${h.name}` : null).filter(Boolean).slice(0, 3),
    ...experiences.map((e: any) => e.name).filter(Boolean).slice(0, 3),
    "Detailed day-by-day itinerary",
    "Dedicated trip support",
  ]

  const template = await db.itineraryTemplate.create({
    data: {
      title: overrides.title,
      destination: overrides.destination || destinations.join(", "),
      country: overrides.country,
      flagEmoji: overrides.flagEmoji || null,
      summary: version.summary || `${overrides.destination} — ${itinerary.length} day itinerary`,
      description: version.summary || "",
      durationDays: version.durationDays || itinerary.length,
      travelStyles: JSON.stringify(overrides.travelStyles),
      travelerTypes: JSON.stringify(overrides.travelerTypes),
      budgetLevel: overrides.budgetLevel,
      paceLevel: overrides.paceLevel,
      status: "ACTIVE",
      isFeatured: false,
      isBestSeller: overrides.isBestSeller || false,
      isSignature: overrides.isSignature || false,
      highlights: JSON.stringify(highlights),
      includes: JSON.stringify(includes),
      basePrice: version.estimatedCost || null,
    },
  })

  // Create template days from itinerary — stripped of client-specific notes
  for (let i = 0; i < itinerary.length; i++) {
    const day = itinerary[i]
    await db.templateDay.create({
      data: {
        templateId: template.id,
        dayNumber: i + 1,
        title: day.title || `Day ${i + 1}`,
        location: day.location || "",
        description: day.description || "",
        activities: JSON.stringify(
          Array.isArray(day.activities) ? day.activities : []
        ),
        meals: day.meals ? JSON.stringify(
          Array.isArray(day.meals) ? day.meals : []
        ) : null,
        accommodation: day.accommodation || null,
        transportNotes: day.transportNotes || null,
      },
    })
  }

  revalidatePath("/templates")
  return template
}
