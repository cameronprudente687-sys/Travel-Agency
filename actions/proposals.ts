"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { slugify } from "@/lib/utils"

interface ProposalInput {
  title: string
  introMessage: string
  itinerarySummary: string
  pricing: Record<string, string>
  inclusions: string[]
  exclusions: string[]
  termsNotes?: string
  advisorSignOff?: string
  status?: string
  versionId?: string
}

function toData(input: ProposalInput) {
  return {
    title: input.title,
    introMessage: input.introMessage,
    itinerarySummary: input.itinerarySummary,
    pricing: JSON.stringify(input.pricing),
    inclusions: JSON.stringify(input.inclusions),
    exclusions: JSON.stringify(input.exclusions),
    termsNotes: input.termsNotes || null,
    advisorSignOff: input.advisorSignOff || null,
    status: input.status || "DRAFT",
    versionId: input.versionId || null,
  }
}

export async function createProposal(leadId: string, input: ProposalInput) {
  const proposal = await db.proposal.create({
    data: { leadId, ...toData(input) },
  })
  revalidatePath(`/leads/${leadId}`)
  revalidatePath("/proposals")
  return proposal
}

export async function updateProposal(id: string, leadId: string, input: ProposalInput) {
  const data: any = toData(input)
  if (input.status === "SENT") data.sentAt = new Date()
  await db.proposal.update({ where: { id }, data })
  revalidatePath(`/leads/${leadId}`)
  revalidatePath(`/proposals/${id}`)
  revalidatePath("/proposals")
}

export async function deleteProposal(id: string, leadId: string) {
  await db.proposal.delete({ where: { id } })
  revalidatePath(`/leads/${leadId}`)
  revalidatePath("/proposals")
}

export async function publishToPortal(proposalId: string, leadId: string) {
  const lead = await db.customerLead.findUnique({ where: { id: leadId } })
  const proposal = await db.proposal.findUnique({ where: { id: proposalId } })
  if (!lead || !proposal) return

  const slug = slugify(`${lead.firstName}-${proposal.title}`.toLowerCase().slice(0, 50)) + `-${Date.now().toString(36)}`

  await db.clientPortalPage.upsert({
    where: { leadId },
    update: {
      proposalId,
      title: proposal.title,
      slug,
      welcomeMessage: proposal.introMessage.slice(0, 300),
      tripHighlights: proposal.inclusions,
    },
    create: {
      leadId,
      proposalId,
      slug,
      title: proposal.title,
      welcomeMessage: proposal.introMessage.slice(0, 300),
      tripHighlights: proposal.inclusions,
    },
  })
  revalidatePath(`/leads/${leadId}`)
  revalidatePath(`/proposals/${proposalId}`)
  revalidatePath("/proposals")
}
