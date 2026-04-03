"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createDestinationEntry,
  updateDestinationEntry,
} from "@/actions/destinations"

const CATEGORIES = [
  "GENERAL",
  "BEST_TIME_TO_VISIT",
  "NEIGHBORHOODS",
  "TRANSPORTATION",
  "FOOD_CULTURE",
  "HIDDEN_GEMS",
  "LUXURY_TIPS",
  "FAMILY_TIPS",
  "ROMANCE_TIPS",
  "ADVENTURE_TIPS",
] as const

interface DestinationFormDialogProps {
  entry?: any
  trigger?: React.ReactNode
}

export function DestinationFormDialog({
  entry,
  trigger,
}: DestinationFormDialogProps) {
  const isEditing = !!entry

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [destination, setDestination] = useState(entry?.destination ?? "")
  const [country, setCountry] = useState(entry?.country ?? "")
  const [region, setRegion] = useState(entry?.region ?? "")
  const [flagEmoji, setFlagEmoji] = useState(entry?.flagEmoji ?? "")
  const [category, setCategory] = useState(entry?.category ?? "GENERAL")
  const [title, setTitle] = useState(entry?.title ?? "")
  const [content, setContent] = useState(entry?.content ?? "")
  const [tags, setTags] = useState(() => {
    if (!entry?.tags) return ""
    const parsed =
      typeof entry.tags === "string" ? JSON.parse(entry.tags) : entry.tags
    return Array.isArray(parsed) ? parsed.join(", ") : ""
  })
  const [isFeatured, setIsFeatured] = useState(entry?.isFeatured ?? false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const parsedTags = tags
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean)

      const input = {
        destination,
        country,
        region: region || undefined,
        flagEmoji: flagEmoji || undefined,
        category,
        title,
        content,
        tags: parsedTags.length > 0 ? parsedTags : undefined,
        isFeatured,
      }

      if (isEditing) {
        await updateDestinationEntry(entry.id, input)
        toast.success("Destination entry updated")
      } else {
        await createDestinationEntry(input)
        toast.success("Destination entry created")
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
        {trigger || <Button variant="navy"><Plus className="mr-2 h-4 w-4" />New Destination</Button>}
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? "Edit Destination Entry" : "New Destination Entry"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-base">Destination</Label>
              <Input
                className="text-base"
                placeholder="Paris"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base">Country</Label>
              <Input
                className="text-base"
                placeholder="France"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-base">Region (optional)</Label>
              <Input
                className="text-base"
                placeholder="Ile-de-France"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base">Flag Emoji</Label>
              <Input
                className="w-20 text-base"
                placeholder="🇫🇷"
                value={flagEmoji}
                onChange={(e) => setFlagEmoji(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-base">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-base">Title</Label>
            <Input
              className="text-base"
              placeholder="Entry title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base">Content</Label>
            <Textarea
              className="h-40 text-base"
              placeholder="Write destination knowledge here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base">Tags (comma-separated)</Label>
            <Input
              className="text-base"
              placeholder="culture, food, architecture"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={isFeatured}
              onCheckedChange={setIsFeatured}
            />
            <Label className="text-base">Featured</Label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="navy" disabled={loading}>
              {loading ? "Saving..." : isEditing ? "Save Changes" : "Create Entry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
