"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { generateProposalFromVersion } from "@/actions/proposals"
import { duplicateVersion, deleteVersion } from "@/actions/versions"
import { FileText, Copy, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { SaveAsTemplateDialog } from "./SaveAsTemplateDialog"

interface Props {
  version: any
  leadId: string
  leadFirstName: string
  hasProposal: boolean
}

export function VersionActions({ version, leadId, leadFirstName, hasProposal }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleGenerateProposal = () => {
    startTransition(async () => {
      try {
        await generateProposalFromVersion(leadId, version.id, leadFirstName)
        toast.success("Proposal generated from this itinerary")
      } catch (e: any) {
        toast.error(e.message || "Failed to generate proposal")
      }
    })
  }

  const handleDuplicate = () => {
    startTransition(async () => {
      try {
        await duplicateVersion(version.id)
        toast.success("Version duplicated")
      } catch {
        toast.error("Failed to duplicate")
      }
    })
  }

  const handleDelete = () => {
    if (!confirm("Delete this trip version?")) return
    startTransition(async () => {
      try {
        await deleteVersion(version.id, leadId)
        toast.success("Version deleted")
      } catch {
        toast.error("Failed to delete")
      }
    })
  }

  return (
    <div className="flex gap-1.5 flex-wrap">
      {!hasProposal && (
        <Button variant="navy" size="sm" onClick={handleGenerateProposal} disabled={isPending}>
          <FileText className="w-3.5 h-3.5 mr-1" /> Generate Proposal
        </Button>
      )}
      <SaveAsTemplateDialog version={version} />
      <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={isPending}>
        <Copy className="w-3.5 h-3.5 mr-1" /> Duplicate
      </Button>
      <Button variant="outline" size="sm" onClick={handleDelete} disabled={isPending} className="text-red-600 border-red-200 hover:bg-red-50">
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  )
}
