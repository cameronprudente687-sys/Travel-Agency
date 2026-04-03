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
