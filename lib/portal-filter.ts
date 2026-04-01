// Filters data to show only client-safe content in the portal
export function filterProposalForPortal(proposal: any) {
  if (!proposal) return null

  // Remove internal-only fields
  const { ...filtered } = proposal

  // Don't expose internal pricing details or advisor notes on full pricing
  return {
    id: filtered.id,
    title: filtered.title,
    status: filtered.status,
    introMessage: filtered.introMessage,
    itinerarySummary: filtered.itinerarySummary,
    inclusions: filtered.inclusions,
    exclusions: filtered.exclusions,
    termsNotes: filtered.termsNotes,
    advisorSignOff: filtered.advisorSignOff,
    sentAt: filtered.sentAt,
  }
}

export function filterVersionForPortal(version: any) {
  if (!version) return null

  return {
    id: version.id,
    title: version.title,
    summary: version.summary,
    destinations: version.destinations,
    durationDays: version.durationDays,
    itinerary: version.itinerary,
    hotelIdeas: version.hotelIdeas,
    experiences: version.experiences,
    // Don't expose cost estimates to client
  }
}

export function filterLeadForPortal(lead: any) {
  if (!lead) return null

  return {
    id: lead.id,
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
  }
}
