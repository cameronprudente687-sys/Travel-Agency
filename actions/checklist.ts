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
      isGenerated: false, // custom item
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
  // When an item is edited, mark it as no longer auto-generated
  // so it's protected from regeneration
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
    await db.checklistCompletion.deleteMany({
      where: { itemId, userId },
    })
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
        isGenerated: true,
      },
    })
  }
  revalidatePath(`/my-trip`)
  revalidatePath(`/leads`)
}

/**
 * Safe regeneration: only replaces untouched generated items.
 * Custom items and edited items (isGenerated=false) are preserved.
 */
export async function generateChecklistFromItinerary(portalId: string) {
  const portal = await db.clientPortalPage.findUnique({
    where: { id: portalId },
    include: { proposal: { include: { version: true } } },
  })
  if (!portal?.proposal?.version) return

  const itinerary = JSON.parse(portal.proposal.version.itinerary || "[]") as any[]

  // Delete only auto-generated items (preserves custom + edited items)
  await db.checklistItem.deleteMany({
    where: { portalId, isGenerated: true },
  })

  // Get current max sortOrder from remaining custom items
  const remaining = await db.checklistItem.findMany({
    where: { portalId },
    orderBy: { sortOrder: "desc" },
    take: 1,
  })
  let sortOrder = remaining.length > 0 ? remaining[0].sortOrder + 1 : 0

  // Add pre-trip items
  const preTripItems = [
    { title: "Passport verified and valid", category: "PRE_TRIP" },
    { title: "Travel insurance confirmed", category: "PRE_TRIP" },
    { title: "Flights booked and confirmed", category: "PRE_TRIP" },
    { title: "Accommodations confirmed", category: "PRE_TRIP" },
    { title: "Packing complete", category: "PRE_TRIP" },
  ]

  for (const item of preTripItems) {
    await db.checklistItem.create({
      data: {
        portalId, title: item.title, category: item.category,
        sortOrder: sortOrder++, isCustomerVisible: true, isGenerated: true,
      },
    })
  }

  // Add day-by-day items from itinerary
  for (const day of itinerary) {
    const dayNum = day.day || day.dayNumber
    await db.checklistItem.create({
      data: {
        portalId,
        title: day.title || `Day ${dayNum}`,
        description: day.description || null,
        category: "DAY_ACTIVITY",
        dayNumber: dayNum,
        sortOrder: sortOrder++,
        isCustomerVisible: true,
        isGenerated: true,
      },
    })
  }

  revalidatePath(`/my-trip`)
  revalidatePath(`/leads`)
}
