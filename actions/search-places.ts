"use server"

import { db } from "@/lib/db"

export async function searchSavedPlaces(query: string, category?: string) {
  const where: any = {}

  if (query && query.length >= 2) {
    where.OR = [
      { name: { contains: query } },
      { destination: { contains: query } },
      { description: { contains: query } },
    ]
  }

  if (category) {
    if (category === "HOTEL_ANY") {
      where.category = { in: ["HOTEL", "RESORT", "BOUTIQUE_HOTEL", "VILLA"] }
    } else if (category === "DINING") {
      where.category = { in: ["RESTAURANT", "CAFE", "BAR"] }
    } else if (category === "EXPERIENCE_ANY") {
      where.category = { in: ["EXPERIENCE", "ACTIVITY", "TOUR", "SPA"] }
    } else {
      where.category = category
    }
  }

  const places = await db.savedPlace.findMany({
    where,
    orderBy: [{ isTopPick: "desc" }, { isFeatured: "desc" }, { name: "asc" }],
    take: 20,
  })

  return places
}

export async function getAllSavedPlaces() {
  return db.savedPlace.findMany({
    orderBy: [{ isTopPick: "desc" }, { destination: "asc" }, { name: "asc" }],
  })
}
