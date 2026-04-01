import { Badge } from "@/components/ui/badge"

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "gold" | "navy" | "success" | "warning" | "error" | "info" }> = {
  NEW: { label: "New", variant: "info" },
  CONTACTED: { label: "Contacted", variant: "secondary" },
  PLANNING: { label: "Planning", variant: "warning" },
  PROPOSAL_SENT: { label: "Proposal Sent", variant: "gold" },
  BOOKED: { label: "Booked", variant: "success" },
  COMPLETED: { label: "Completed", variant: "navy" },
  ARCHIVED: { label: "Archived", variant: "outline" },
}

interface LeadStatusBadgeProps {
  status: string
}

export function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: "outline" as const }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
