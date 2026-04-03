"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DestinationFormDialog } from "./DestinationFormDialog"
import { deleteDestinationEntry } from "@/actions/destinations"
import { Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"

export function DestinationActions({ entry }: { entry: any }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Delete this knowledge entry?")) return
    setDeleting(true)
    try {
      await deleteDestinationEntry(entry.id)
      toast.success("Entry deleted")
      router.push("/destinations")
    } catch {
      toast.error("Failed to delete")
      setDeleting(false)
    }
  }

  return (
    <div className="flex gap-2">
      <DestinationFormDialog
        entry={entry}
        trigger={<Button variant="outline" size="sm"><Edit className="w-4 h-4 mr-1" /> Edit</Button>}
      />
      <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleting} className="text-red-600 hover:bg-red-50 border-red-200">
        <Trash2 className="w-4 h-4 mr-1" /> {deleting ? "Deleting..." : "Delete"}
      </Button>
    </div>
  )
}
