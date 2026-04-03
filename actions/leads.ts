"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function updateLeadStatus(leadId: string, status: string) {
  await db.customerLead.update({
    where: { id: leadId },
    data: { status },
  })
  revalidatePath(`/leads/${leadId}`)
  revalidatePath("/leads")
  revalidatePath("/dashboard")
}

export async function addLeadNote(leadId: string, content: string, author: string) {
  await db.leadNote.create({
    data: { leadId, content, author },
  })
  revalidatePath(`/leads/${leadId}`)
}

export async function deleteLeadNote(noteId: string, leadId: string) {
  await db.leadNote.delete({ where: { id: noteId } })
  revalidatePath(`/leads/${leadId}`)
}

export async function deleteLead(leadId: string) {
  await db.customerLead.delete({ where: { id: leadId } })
  revalidatePath("/leads")
  revalidatePath("/dashboard")
}
