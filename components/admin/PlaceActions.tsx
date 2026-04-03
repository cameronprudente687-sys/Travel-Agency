"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PlaceFormDialog } from "./PlaceFormDialog"
import { deletePlace } from "@/actions/places"
import { Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"

export function PlaceActions({ place }: { place: any }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Delete this place?")) return
    setDeleting(true)
    try {
      await deletePlace(place.id)
      toast.success("Place deleted")
      router.push("/places")
    } catch {
      toast.error("Failed to delete")
      setDeleting(false)
    }
  }

  return (
    <div className="flex gap-2">
      <PlaceFormDialog
        place={place}
        trigger={<Button variant="outline" size="sm"><Edit className="w-4 h-4 mr-1" /> Edit</Button>}
      />
      <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleting} className="text-red-600 hover:bg-red-50 border-red-200">
        <Trash2 className="w-4 h-4 mr-1" /> {deleting ? "Deleting..." : "Delete"}
      </Button>
    </div>
  )
}
