"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function updateSetting(key: string, value: string) {
  await db.businessSetting.update({
    where: { key },
    data: { value },
  })
  revalidatePath("/settings")
}

export async function updateSettings(updates: { key: string; value: string }[]) {
  for (const { key, value } of updates) {
    await db.businessSetting.update({
      where: { key },
      data: { value },
    })
  }
  revalidatePath("/settings")
}
