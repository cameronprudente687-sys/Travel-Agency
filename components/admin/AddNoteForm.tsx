"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import { addLeadNote } from "@/actions/leads"
import { toast } from "sonner"

export function AddNoteForm({ leadId }: { leadId: string }) {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) return
    setLoading(true)
    try {
      await addLeadNote(leadId, content.trim(), "Alexandra Rivera")
      setContent("")
      toast.success("Note saved")
    } catch {
      toast.error("Failed to save note")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Add Note</h4>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-base resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary-300"
        placeholder="Internal notes about this lead..."
      />
      <Button variant="navy" size="sm" className="mt-2" onClick={handleSubmit} disabled={loading || !content.trim()}>
        <MessageSquare className="w-4 h-4 mr-1" />
        {loading ? "Saving..." : "Save Note"}
      </Button>
    </div>
  )
}
