"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import crypto from "crypto"

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

  const existing = await db.user.findUnique({ where: { email: lead.email } })
  if (existing) {
    if (existing.role === "CLIENT") {
      // Return existing account with a fresh invite token
      const token = crypto.randomBytes(32).toString("hex")
      await db.user.update({
        where: { id: existing.id },
        data: { inviteToken: token, tokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      })
      revalidatePath(`/leads/${leadId}`)
      return { user: existing, inviteToken: token }
    }
    throw new Error("Email already used by an advisor account")
  }

  // Generate invite token and a placeholder password (customer will set their own)
  const token = crypto.randomBytes(32).toString("hex")
  const placeholderPassword = await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 12)

  const user = await db.user.create({
    data: {
      email: lead.email,
      name: `${lead.firstName} ${lead.lastName}`,
      role: "CLIENT",
      password: placeholderPassword,
      leadId: leadId,
      inviteToken: token,
      tokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  })

  revalidatePath(`/leads/${leadId}`)
  return { user, inviteToken: token }
}
