"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

const STATUSES = [
  { value: "", label: "All Leads" },
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "PLANNING", label: "Planning" },
  { value: "PROPOSAL_SENT", label: "Proposal Sent" },
  { value: "BOOKED", label: "Booked" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ARCHIVED", label: "Archived" },
]

const statusColors: Record<string, string> = {
  NEW: "bg-blue-500",
  CONTACTED: "bg-yellow-500",
  PLANNING: "bg-amber-500",
  PROPOSAL_SENT: "bg-purple-500",
  BOOKED: "bg-green-500",
  COMPLETED: "bg-emerald-500",
  ARCHIVED: "bg-gray-400",
}

interface Props {
  counts: Record<string, number>
  total: number
}

export function LeadFilters({ counts, total }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentStatus = searchParams.get("status") || ""
  const currentSearch = searchParams.get("q") || ""
  const [search, setSearch] = useState(currentSearch)

  const updateParams = (status: string, q: string) => {
    const params = new URLSearchParams()
    if (status) params.set("status", status)
    if (q) params.set("q", q)
    const qs = params.toString()
    router.push(qs ? `/leads?${qs}` : "/leads")
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    // Debounce: update after typing stops
    clearTimeout((window as any).__leadSearchTimeout)
    ;(window as any).__leadSearchTimeout = setTimeout(() => {
      updateParams(currentStatus, value)
    }, 300)
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search by name, email, or destination..."
          className="pl-9 h-11 text-base"
        />
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map(s => {
          const count = s.value ? (counts[s.value] || 0) : total
          const isActive = currentStatus === s.value
          return (
            <button
              key={s.value}
              onClick={() => updateParams(s.value, search)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary-700 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-700"
              }`}
            >
              {s.value && <span className={`w-2 h-2 rounded-full ${statusColors[s.value]}`} />}
              {s.label}
              <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
              }`}>{count}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
