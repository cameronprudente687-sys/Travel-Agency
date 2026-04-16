"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function saveCustomPlaceToLibrary(data: {
  name: string
  destination: string
  country: string
  category: string
  description?: string
  whyWeRecommend?: string
}) {
  // Check if already exists
  const existing = await db.savedPlace.findFirst({
    where: { name: data.name, destination: data.destination },
  })
  if (existing) return existing

  const place = await db.savedPlace.create({
    data: {
      name: data.name,
      destination: data.destination || "Unknown",
      country: data.country || "Unknown",
      category: data.category,
      description: data.description || data.name,
      whyWeRecommend: data.whyWeRecommend || `Added from itinerary builder`,
    },
  })

  revalidatePath("/places")
  return place
}
