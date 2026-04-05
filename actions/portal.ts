"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { slugify } from "@/lib/utils"
import bcrypt from "bcryptjs"

export async function publishPortal(portalId: string) {
  await db.clientPortalPage.update({
    where: { id: portalId },
    data: { portalStatus: "PUBLISHED", publishedAt: new Date(), isActive: true },
  })
  revalidatePath(`/leads`)
  revalidatePath(`/proposals`)
}

export async function unpublishPortal(portalId: string) {
  await db.clientPortalPage.update({
    where: { id: portalId },
    data: { portalStatus: "UNPUBLISHED", isActive: false },
  })
  revalidatePath(`/leads`)
  revalidatePath(`/proposals`)
}

export async function updatePortalVisibility(portalId: string, visibleSections: string[]) {
  await db.clientPortalPage.update({
    where: { id: portalId },
    data: { visibleSections: JSON.stringify(visibleSections) },
  })
  revalidatePath(`/my-trip`)
}

export async function updatePortalDates(portalId: string, startDate: string, endDate: string) {
  await db.clientPortalPage.update({
    where: { id: portalId },
    data: {
      travelStartDate: startDate ? new Date(startDate) : null,
      travelEndDate: endDate ? new Date(endDate) : null,
    },
  })
  revalidatePath(`/my-trip`)
}

export async function updatePortalMessage(portalId: string, advisorMessage: string) {
  await db.clientPortalPage.update({
    where: { id: portalId },
    data: { advisorMessage },
  })
  revalidatePath(`/my-trip`)
}

export async function createCustomerAccount(leadId: string) {
  const lead = await db.customerLead.findUnique({ where: { id: leadId } })
  if (!lead) throw new Error("Lead not found")

  // Check if account already exists
  const existing = await db.user.findUnique({ where: { email: lead.email } })
  if (existing) {
    if (existing.role === "CLIENT") return existing
    throw new Error("Email already used by an advisor account")
  }

  // Create a simple password from first name + last 4 of email
  const simplePassword = `${lead.firstName.toLowerCase()}2025`
  const hashedPassword = await bcrypt.hash(simplePassword, 12)

  const user = await db.user.create({
    data: {
      email: lead.email,
      name: `${lead.firstName} ${lead.lastName}`,
      role: "CLIENT",
      password: hashedPassword,
      leadId: leadId,
    },
  })

  revalidatePath(`/leads/${leadId}`)
  return { user, tempPassword: simplePassword }
}
