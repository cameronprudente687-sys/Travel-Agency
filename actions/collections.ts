"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

interface CollectionInput {
  title: string
  description: string
  emoji?: string
  isPublic?: boolean
  sortOrder?: number
}

export async function createCollection(input: CollectionInput) {
  const col = await db.tripCollection.create({
    data: {
      title: input.title,
      description: input.description,
      emoji: input.emoji || null,
      isPublic: input.isPublic ?? true,
      sortOrder: input.sortOrder ?? 0,
    },
  })
  revalidatePath("/collections")
  return col
}

export async function updateCollection(id: string, input: CollectionInput) {
  await db.tripCollection.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description,
      emoji: input.emoji || null,
      isPublic: input.isPublic ?? true,
      sortOrder: input.sortOrder ?? 0,
    },
  })
  revalidatePath(`/collections/${id}`)
  revalidatePath("/collections")
}

export async function deleteCollection(id: string) {
  await db.tripCollection.delete({ where: { id } })
  revalidatePath("/collections")
}

export async function addTemplateToCollection(collectionId: string, templateId: string) {
  const count = await db.tripCollectionItem.count({ where: { collectionId } })
  await db.tripCollectionItem.create({
    data: { collectionId, templateId, sortOrder: count + 1 },
  })
  revalidatePath(`/collections/${collectionId}`)
}

export async function removeTemplateFromCollection(collectionId: string, templateId: string) {
  await db.tripCollectionItem.deleteMany({ where: { collectionId, templateId } })
  revalidatePath(`/collections/${collectionId}`)
}
