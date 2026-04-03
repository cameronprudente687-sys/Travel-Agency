"use client"

import { useState } from "react"
import { updateLeadStatus } from "@/actions/leads"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const STATUSES = [
  { value: "NEW", label: "New", color: "bg-blue-500" },
  { value: "CONTACTED", label: "Contacted", color: "bg-yellow-500" },
  { value: "PLANNING", label: "Planning", color: "bg-amber-500" },
  { value: "PROPOSAL_SENT", label: "Proposal Sent", color: "bg-purple-500" },
  { value: "BOOKED", label: "Booked", color: "bg-green-500" },
  { value: "COMPLETED", label: "Completed", color: "bg-emerald-500" },
  { value: "ARCHIVED", label: "Archived", color: "bg-gray-500" },
] as const

interface LeadStatusSelectProps {
  leadId: string
  currentStatus: string
}

export function LeadStatusSelect({ leadId, currentStatus }: LeadStatusSelectProps) {
  const [status, setStatus] = useState(currentStatus)
  const [isUpdating, setIsUpdating] = useState(false)

  async function handleChange(newStatus: string) {
    setIsUpdating(true)
    const previousStatus = status
    setStatus(newStatus)

    try {
      await updateLeadStatus(leadId, newStatus)
      const statusLabel = STATUSES.find((s) => s.value === newStatus)?.label ?? newStatus
      toast.success(`Status updated to ${statusLabel}`)
    } catch {
      setStatus(previousStatus)
      toast.error("Failed to update status")
    } finally {
      setIsUpdating(false)
    }
  }

  const currentStatusConfig = STATUSES.find((s) => s.value === status)

  return (
    <Select value={status} onValueChange={handleChange} disabled={isUpdating}>
      <SelectTrigger className="w-[220px] text-base">
        <SelectValue>
          <span className="flex items-center gap-2">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${currentStatusConfig?.color ?? "bg-gray-400"}`}
            />
            <span>{currentStatusConfig?.label ?? status}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s.value} value={s.value} className="text-base py-2">
            <span className="flex items-center gap-2">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${s.color}`} />
              <span>{s.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
