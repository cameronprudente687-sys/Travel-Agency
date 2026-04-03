"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CollectionFormDialog } from "./CollectionFormDialog"
import { deleteCollection } from "@/actions/collections"
import { Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"

export function CollectionActions({ collection }: { collection: any }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Delete this collection? Templates won't be deleted.")) return
    setDeleting(true)
    try {
      await deleteCollection(collection.id)
      toast.success("Collection deleted")
      router.push("/collections")
    } catch {
      toast.error("Failed to delete")
      setDeleting(false)
    }
  }

  return (
    <div className="flex gap-2">
      <CollectionFormDialog
        collection={collection}
        trigger={<Button variant="outline" size="sm"><Edit className="w-4 h-4 mr-1" /> Edit</Button>}
      />
      <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleting} className="text-red-600 hover:bg-red-50 border-red-200">
        <Trash2 className="w-4 h-4 mr-1" /> {deleting ? "Deleting..." : "Delete"}
      </Button>
    </div>
  )
}
