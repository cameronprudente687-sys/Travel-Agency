"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { slugify } from "@/lib/utils"
import { generateChecklistFromItinerary } from "./checklist"

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

export async function generateProposalFromVersion(leadId: string, versionId: string, clientFirstName: string) {
  const version = await db.tripVersion.findUnique({ where: { id: versionId } })
  if (!version) throw new Error("Version not found")

  const destinations = JSON.parse(version.destinations || "[]")
  const itinerary = JSON.parse(version.itinerary || "[]")
  const hotels = JSON.parse(version.hotelIdeas || "[]")
  const experiences = JSON.parse(version.experiences || "[]")

  const destText = destinations.join(" & ")
  const daysCount = itinerary.length || version.durationDays

  // Auto-generate intro
  const introMessage = `Dear ${clientFirstName}, I'm excited to share your personalized ${destText} itinerary. This ${daysCount}-day journey has been designed around your preferences, pace, and travel style. Every detail — from the hotels to the experiences — has been chosen with your trip in mind.`

  // Auto-generate summary from itinerary
  const summaryParts = itinerary.slice(0, 4).map((d: any) => d.title || `Day ${d.day}`).join(", ")
  const itinerarySummary = `${version.summary || ""}\n\nHighlights: ${summaryParts}${itinerary.length > 4 ? `, and ${itinerary.length - 4} more days of curated experiences.` : "."}`

  // Build inclusions from version data
  const inclusions: string[] = []
  inclusions.push(`${daysCount} days / ${daysCount - 1} nights accommodation`)
  if (hotels.length > 0) inclusions.push(`Curated hotels: ${hotels.map((h: any) => h.name).join(", ")}`)
  if (experiences.length > 0) inclusions.push(`${experiences.length} curated experiences`)
  inclusions.push("Detailed day-by-day itinerary")
  inclusions.push("Restaurant recommendations")
  inclusions.push("Dedicated trip support")

  const exclusions = ["International flights", "Travel insurance", "Personal expenses", "Meals not specified"]

  // Build pricing from version
  const pricing: Record<string, string> = {}
  if (version.estimatedCost) {
    pricing.total_estimate = `$${version.estimatedCost.toLocaleString()}`
  }

  const proposal = await db.proposal.create({
    data: {
      leadId,
      versionId,
      title: version.title,
      status: "DRAFT",
      introMessage,
      itinerarySummary: itinerarySummary.trim(),
      pricing: JSON.stringify(pricing),
      inclusions: JSON.stringify(inclusions),
      exclusions: JSON.stringify(exclusions),
      advisorSignOff: `This itinerary has been personally designed for you. I'm confident you'll love it. — Your Voyagr Advisor`,
    },
  })

  revalidatePath(`/leads/${leadId}`)
  revalidatePath("/proposals")
  return proposal
}

/**
 * One-click: generate proposal from version + create portal + publish.
 */
export async function publishTripFromVersion(leadId: string, versionId: string, clientFirstName: string) {
  const lead = await db.customerLead.findUnique({ where: { id: leadId } })
  if (!lead) throw new Error("Lead not found")

  let proposal = await db.proposal.findFirst({ where: { versionId } })
  if (!proposal) {
    proposal = await generateProposalFromVersion(leadId, versionId, clientFirstName)
  }

  const slug = slugify(`${lead.firstName}-${proposal.title}`.toLowerCase().slice(0, 50)) + `-${Date.now().toString(36)}`

  await db.clientPortalPage.upsert({
    where: { leadId },
    update: {
      proposalId: proposal.id,
      title: proposal.title,
      welcomeMessage: proposal.introMessage.slice(0, 300),
      tripHighlights: proposal.inclusions,
      portalStatus: "PUBLISHED",
      publishedAt: new Date(),
      isActive: true,
    },
    create: {
      leadId,
      proposalId: proposal.id,
      slug,
      title: proposal.title,
      welcomeMessage: proposal.introMessage.slice(0, 300),
      tripHighlights: proposal.inclusions,
      portalStatus: "PUBLISHED",
      publishedAt: new Date(),
      isActive: true,
    },
  })

  await db.proposal.update({
    where: { id: proposal.id },
    data: { status: "SENT", sentAt: new Date() },
  })

  // Auto-generate checklist from the itinerary
  const portalPage = await db.clientPortalPage.findUnique({ where: { leadId } })
  if (portalPage) {
    await generateChecklistFromItinerary(portalPage.id)
  }

  revalidatePath(`/leads/${leadId}`)
  return proposal
}
