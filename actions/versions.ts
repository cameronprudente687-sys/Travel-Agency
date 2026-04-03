"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

interface VersionInput {
  title: string
  summary: string
  destinations: string[]
  durationDays: number
  estimatedCost?: number
  itinerary: any[]
  hotelIdeas: any[]
  experiences: any[]
  notes?: string
  status?: string
}

function toData(input: VersionInput) {
  return {
    title: input.title,
    summary: input.summary,
    destinations: JSON.stringify(input.destinations),
    durationDays: input.durationDays,
    estimatedCost: input.estimatedCost || null,
    itinerary: JSON.stringify(input.itinerary),
    hotelIdeas: JSON.stringify(input.hotelIdeas),
    experiences: JSON.stringify(input.experiences),
    notes: input.notes || null,
    status: input.status || "draft",
  }
}

export async function createVersion(leadId: string, input: VersionInput) {
  const count = await db.tripVersion.count({ where: { leadId } })
  const version = await db.tripVersion.create({
    data: { leadId, versionNumber: count + 1, ...toData(input) },
  })
  revalidatePath(`/leads/${leadId}`)
  return version
}

export async function updateVersion(id: string, leadId: string, input: VersionInput) {
  await db.tripVersion.update({ where: { id }, data: toData(input) })
  revalidatePath(`/leads/${leadId}`)
}

export async function deleteVersion(id: string, leadId: string) {
  await db.tripVersion.delete({ where: { id } })
  revalidatePath(`/leads/${leadId}`)
}

export async function duplicateVersion(id: string) {
  const source = await db.tripVersion.findUnique({ where: { id } })
  if (!source) return
  const count = await db.tripVersion.count({ where: { leadId: source.leadId } })
  const copy = await db.tripVersion.create({
    data: {
      leadId: source.leadId,
      versionNumber: count + 1,
      title: `${source.title} (Copy)`,
      summary: source.summary,
      destinations: source.destinations,
      durationDays: source.durationDays,
      estimatedCost: source.estimatedCost,
      itinerary: source.itinerary,
      hotelIdeas: source.hotelIdeas,
      experiences: source.experiences,
      notes: source.notes,
      status: "draft",
    },
  })
  revalidatePath(`/leads/${source.leadId}`)
  return copy
}
