"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

interface DestinationInput {
  destination: string
  country: string
  region?: string
  flagEmoji?: string
  category: string
  title: string
  content: string
  tags?: string[]
  isFeatured?: boolean
}

function toData(input: DestinationInput) {
  return {
    destination: input.destination,
    country: input.country,
    region: input.region || null,
    flagEmoji: input.flagEmoji || null,
    category: input.category,
    title: input.title,
    content: input.content,
    tags: input.tags ? JSON.stringify(input.tags) : null,
    isFeatured: input.isFeatured || false,
  }
}

export async function createDestinationEntry(input: DestinationInput) {
  const entry = await db.destinationKnowledgeEntry.create({ data: toData(input) })
  revalidatePath("/destinations")
  return entry
}

export async function updateDestinationEntry(id: string, input: DestinationInput) {
  await db.destinationKnowledgeEntry.update({ where: { id }, data: toData(input) })
  revalidatePath(`/destinations/${id}`)
  revalidatePath("/destinations")
}

export async function deleteDestinationEntry(id: string) {
  await db.destinationKnowledgeEntry.delete({ where: { id } })
  revalidatePath("/destinations")
}
