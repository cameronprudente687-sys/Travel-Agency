"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { TemplateFormDialog } from "./TemplateFormDialog"
import { deleteTemplate, duplicateTemplate } from "@/actions/templates"
import { Edit, Copy, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface Props {
  template: any
}

export function TemplateActions({ template }: Props) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this template?")) return
    setDeleting(true)
    try {
      await deleteTemplate(template.id)
      toast.success("Template deleted")
      router.push("/templates")
    } catch {
      toast.error("Failed to delete")
      setDeleting(false)
    }
  }

  const handleDuplicate = async () => {
    try {
      await duplicateTemplate(template.id)
      toast.success("Template duplicated")
      router.push("/templates")
    } catch {
      toast.error("Failed to duplicate")
    }
  }

  return (
    <div className="flex gap-2">
      <TemplateFormDialog
        template={template}
        trigger={
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-1" /> Edit
          </Button>
        }
      />
      <Button variant="outline" size="sm" onClick={handleDuplicate}>
        <Copy className="w-4 h-4 mr-1" /> Duplicate
      </Button>
      <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleting} className="text-red-600 hover:bg-red-50 border-red-200">
        <Trash2 className="w-4 h-4 mr-1" /> {deleting ? "Deleting..." : "Delete"}
      </Button>
    </div>
  )
}
