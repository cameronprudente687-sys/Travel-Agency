"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { createCollection, updateCollection } from "@/actions/collections"

interface Props {
  collection?: any
  trigger?: React.ReactNode
}

export function CollectionFormDialog({ collection, trigger }: Props) {
  const isEdit = !!collection
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [title, setTitle] = useState(collection?.title ?? "")
  const [description, setDescription] = useState(collection?.description ?? "")
  const [emoji, setEmoji] = useState(collection?.emoji ?? "")
  const [isPublic, setIsPublic] = useState(collection?.isPublic ?? true)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const input = { title, description, emoji: emoji || undefined, isPublic }
      if (isEdit) {
        await updateCollection(collection.id, input)
        toast.success("Collection updated")
      } else {
        await createCollection(input)
        toast.success("Collection created")
      }
      setOpen(false)
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="navy"><Plus className="mr-2 h-4 w-4" />New Collection</Button>}
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif">{isEdit ? "Edit Collection" : "New Collection"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div><Label className="text-sm font-medium mb-1.5 block">Title *</Label><Input className="text-base" value={title} onChange={e => setTitle(e.target.value)} required /></div>
          <div><Label className="text-sm font-medium mb-1.5 block">Description *</Label><Textarea className="text-base" value={description} onChange={e => setDescription(e.target.value)} required /></div>
          <div><Label className="text-sm font-medium mb-1.5 block">Emoji</Label><Input className="w-20 text-base" placeholder="💕" value={emoji} onChange={e => setEmoji(e.target.value)} /></div>
          <div className="flex items-center gap-3"><Switch checked={isPublic} onCheckedChange={setIsPublic} /><Label className="text-base">Public</Label></div>
          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="navy" disabled={loading}>{loading ? "Saving..." : isEdit ? "Save Changes" : "Create Collection"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
