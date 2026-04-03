"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

interface PlaceInput {
  name: string
  destination: string
  country: string
  flagEmoji?: string
  category: string
  description: string
  priceLevel?: number
  rating?: number
  address?: string
  website?: string
  whyWeRecommend: string
  bestFor?: string[]
  tags?: string[]
  isFeatured?: boolean
  isTopPick?: boolean
}

function toData(input: PlaceInput) {
  return {
    name: input.name,
    destination: input.destination,
    country: input.country,
    flagEmoji: input.flagEmoji || null,
    category: input.category,
    description: input.description,
    priceLevel: input.priceLevel || null,
    rating: input.rating || null,
    address: input.address || null,
    website: input.website || null,
    whyWeRecommend: input.whyWeRecommend,
    bestFor: input.bestFor ? JSON.stringify(input.bestFor) : null,
    tags: input.tags ? JSON.stringify(input.tags) : null,
    isFeatured: input.isFeatured || false,
    isTopPick: input.isTopPick || false,
  }
}

export async function createPlace(input: PlaceInput) {
  const place = await db.savedPlace.create({ data: toData(input) })
  revalidatePath("/places")
  return place
}

export async function updatePlace(id: string, input: PlaceInput) {
  await db.savedPlace.update({ where: { id }, data: toData(input) })
  revalidatePath(`/places/${id}`)
  revalidatePath("/places")
}

export async function deletePlace(id: string) {
  await db.savedPlace.delete({ where: { id } })
  revalidatePath("/places")
}
