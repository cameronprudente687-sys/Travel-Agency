"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createChecklistItem(portalId: string, data: {
  title: string
  description?: string
  category: string
  dayNumber?: number
  sortOrder?: number
  isCustomerVisible?: boolean
  isRequired?: boolean
}) {
  const count = await db.checklistItem.count({ where: { portalId } })
  await db.checklistItem.create({
    data: {
      portalId,
      title: data.title,
      description: data.description || null,
      category: data.category,
      dayNumber: data.dayNumber || null,
      sortOrder: data.sortOrder ?? count,
      isCustomerVisible: data.isCustomerVisible ?? true,
      isRequired: data.isRequired ?? false,
      isGenerated: false,
    },
  })
  revalidatePath(`/my-trip`)
  revalidatePath(`/leads`)
}

export async function updateChecklistItem(id: string, data: {
  title?: string
  description?: string
  category?: string
  dayNumber?: number
  isCustomerVisible?: boolean
  isRequired?: boolean
}) {
  await db.checklistItem.update({
    where: { id },
    data: { ...data, isGenerated: false },
  })
  revalidatePath(`/my-trip`)
  revalidatePath(`/leads`)
}

export async function deleteChecklistItem(id: string) {
  await db.checklistItem.delete({ where: { id } })
  revalidatePath(`/my-trip`)
  revalidatePath(`/leads`)
}

export async function reorderChecklistItems(items: { id: string; sortOrder: number }[]) {
  for (const item of items) {
    await db.checklistItem.update({
      where: { id: item.id },
      data: { sortOrder: item.sortOrder },
    })
  }
  revalidatePath(`/my-trip`)
  revalidatePath(`/leads`)
}

export async function toggleChecklistCompletion(itemId: string, userId: string, completed: boolean, notes?: string) {
  if (completed) {
    await db.checklistCompletion.upsert({
      where: { itemId_userId: { itemId, userId } },
      update: { completed: true, notes, completedAt: new Date() },
      create: { itemId, userId, completed: true, notes },
    })
  } else {
    await db.checklistCompletion.deleteMany({ where: { itemId, userId } })
  }
  revalidatePath(`/my-trip`)
}

export async function applyChecklistTemplate(portalId: string, templateId: string) {
  const template = await db.checklistTemplate.findUnique({ where: { id: templateId } })
  if (!template) return

  const items = JSON.parse(template.items) as Array<{
    title: string; description?: string; category?: string; dayNumber?: number
  }>

  const existingCount = await db.checklistItem.count({ where: { portalId } })

  for (let i = 0; i < items.length; i++) {
    await db.checklistItem.create({
      data: {
        portalId,
        title: items[i].title,
        description: items[i].description || null,
        category: items[i].category || "PRE_TRIP",
        dayNumber: items[i].dayNumber || null,
        sortOrder: existingCount + i,
        isCustomerVisible: true,
        isGenerated: false, // template items count as manual/custom
      },
    })
  }
  revalidatePath(`/my-trip`)
  revalidatePath(`/leads`)
}

/**
 * Generate checklist from the published itinerary.
 * - Extracts REAL items: hotels, activities, meals, transport per day
 * - Adds standard pre-trip prep items
 * - Only replaces isGenerated=true items (preserves manual additions)
 * - Called automatically when a trip is published
 */
export async function generateChecklistFromItinerary(portalId: string) {
  const portal = await db.clientPortalPage.findUnique({
    where: { id: portalId },
    include: { proposal: { include: { version: true } } },
  })
  if (!portal?.proposal?.version) return

  const version = portal.proposal.version
  const itinerary = JSON.parse(version.itinerary || "[]") as any[]
  const hotels = JSON.parse(version.hotelIdeas || "[]") as any[]
  const experiences = JSON.parse(version.experiences || "[]") as any[]

  // Delete only auto-generated items (preserves custom + edited items)
  await db.checklistItem.deleteMany({
    where: { portalId, isGenerated: true },
  })

  // Get max sortOrder from remaining custom items
  const remaining = await db.checklistItem.findMany({
    where: { portalId },
    orderBy: { sortOrder: "desc" },
    take: 1,
  })
  let sort = remaining.length > 0 ? remaining[0].sortOrder + 1 : 0

  // Helper to create a generated item
  const add = async (title: string, category: string, dayNumber?: number, description?: string) => {
    await db.checklistItem.create({
      data: {
        portalId, title, category,
        dayNumber: dayNumber || null,
        description: description || null,
        sortOrder: sort++,
        isCustomerVisible: true,
        isGenerated: true,
      },
    })
  }

  // ==================== PRE-TRIP ITEMS ====================
  await add("Passport verified and valid", "PRE_TRIP")
  await add("Travel insurance confirmed", "PRE_TRIP")
  await add("Flights booked and confirmed", "PRE_TRIP")
  await add("Accommodations confirmed", "PRE_TRIP")
  await add("Packing complete", "PRE_TRIP")

  // ==================== DAY-BY-DAY ITEMS FROM ITINERARY ====================
  for (const day of itinerary) {
    const dayNum = day.day || day.dayNumber
    const activities = Array.isArray(day.activities) ? day.activities : []
    const meals = Array.isArray(day.meals) ? day.meals : []

    // Day header
    await add(
      day.title || `Day ${dayNum}`,
      "DAY_ACTIVITY",
      dayNum,
      day.location ? `${day.location}${day.description ? ` — ${day.description}` : ""}` : day.description || undefined,
    )

    // Hotel check-in for this day
    if (day.accommodation) {
      await add(`Check in: ${day.accommodation}`, "DAY_ACTIVITY", dayNum)
    }

    // Activities from this day
    for (const act of activities) {
      if (act && typeof act === "string" && act.trim()) {
        await add(act.trim(), "DAY_ACTIVITY", dayNum)
      }
    }

    // Meals/restaurants from this day
    for (const meal of meals) {
      if (meal && typeof meal === "string" && meal.trim()) {
        await add(meal.trim(), "DAY_ACTIVITY", dayNum)
      }
    }

    // Transport notes as a checklist item
    if (day.transportNotes) {
      await add(day.transportNotes, "DAY_ACTIVITY", dayNum)
    }
  }

  // ==================== TRIP-LEVEL ITEMS ====================
  // Add experiences that aren't already covered by day activities
  const dayActivityTitles = new Set(
    itinerary.flatMap((d: any) => {
      const acts = Array.isArray(d.activities) ? d.activities : []
      return acts.map((a: string) => a?.trim().toLowerCase()).filter(Boolean)
    })
  )

  for (const exp of experiences) {
    if (exp.name && !dayActivityTitles.has(exp.name.trim().toLowerCase())) {
      await add(exp.name, "DURING_TRIP", undefined, exp.description || undefined)
    }
  }

  revalidatePath(`/my-trip`)
  revalidatePath(`/leads`)
}
