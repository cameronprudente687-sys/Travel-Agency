"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { createVersion, updateVersion } from "@/actions/versions"
import { toast } from "sonner"

interface Props {
  leadId: string
  version?: any
  trigger?: React.ReactNode
}

export function VersionFormDialog({ leadId, version, trigger }: Props) {
  const isEdit = !!version
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const parseJson = (val: any, fallback: any) => {
    if (!val) return fallback
    try { return typeof val === "string" ? JSON.parse(val) : val } catch { return fallback }
  }

  const [title, setTitle] = useState(version?.title || "")
  const [summary, setSummary] = useState(version?.summary || "")
  const [destinations, setDestinations] = useState(parseJson(version?.destinations, []).join(", "))
  const [durationDays, setDurationDays] = useState(version?.durationDays || 7)
  const [estimatedCost, setEstimatedCost] = useState(version?.estimatedCost || "")
  const [notes, setNotes] = useState(version?.notes || "")
  const [status, setStatus] = useState(version?.status || "draft")

  const [itineraryText, setItineraryText] = useState(() => {
    const items = parseJson(version?.itinerary, [])
    return items.map((d: any) => `Day ${d.day || d.dayNumber || ""}: ${d.title || ""} - ${d.location || ""} - ${d.description || ""}`).join("\n")
  })

  const [hotelText, setHotelText] = useState(() => {
    const items = parseJson(version?.hotelIdeas, [])
    return items.map((h: any) => `${h.name || ""} (${h.location || ""}) - ${h.description || ""}`).join("\n")
  })

  const [expText, setExpText] = useState(() => {
    const items = parseJson(version?.experiences, [])
    return items.map((e: any) => `${e.name || ""} - ${e.description || ""}`).join("\n")
  })

  const handleSubmit = async () => {
    if (!title.trim() || !summary.trim()) {
      toast.error("Title and summary are required")
      return
    }
    setLoading(true)
    try {
      const destArr = destinations.split(",").map((d: string) => d.trim()).filter(Boolean)

      const itinerary = itineraryText.split("\n").filter(Boolean).map((line: string, i: number) => {
        const parts = line.replace(/^Day \d+:\s*/, "").split(" - ")
        return { day: i + 1, title: parts[0] || "", location: parts[1] || "", description: parts[2] || "" }
      })

      const hotelIdeas = hotelText.split("\n").filter(Boolean).map((line: string) => {
        const match = line.match(/^(.+?)\s*\((.+?)\)\s*-\s*(.*)$/)
        if (match) return { name: match[1], location: match[2], description: match[3] }
        return { name: line, location: "", description: "" }
      })

      const experiences = expText.split("\n").filter(Boolean).map((line: string) => {
        const parts = line.split(" - ")
        return { name: parts[0] || "", description: parts[1] || "", emoji: "✨" }
      })

      const input = {
        title,
        summary,
        destinations: destArr,
        durationDays: Number(durationDays),
        estimatedCost: estimatedCost ? Number(estimatedCost) : undefined,
        itinerary,
        hotelIdeas,
        experiences,
        notes,
        status,
      }

      if (isEdit) {
        await updateVersion(version.id, leadId, input)
        toast.success("Version updated")
      } else {
        await createVersion(leadId, input)
        toast.success("Version created")
      }
      setOpen(false)
    } catch (e) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="navy" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            New Version
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif">
            {isEdit ? "Edit Trip Version" : "Create Trip Version"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Version Title *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Luxury Italy: Rome & Amalfi" className="text-base" />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Summary *</Label>
            <Textarea value={summary} onChange={e => setSummary(e.target.value)} placeholder="Brief overview of this version..." className="h-20 text-base" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Destinations</Label>
              <Input value={destinations} onChange={e => setDestinations(e.target.value)} placeholder="Rome, Amalfi Coast" className="text-base" />
              <p className="text-xs text-gray-400 mt-1">Comma-separated</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Duration (days)</Label>
              <Input type="number" min={1} value={durationDays} onChange={e => setDurationDays(e.target.value)} className="text-base" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Estimated Cost ($)</Label>
              <Input type="number" value={estimatedCost} onChange={e => setEstimatedCost(e.target.value)} placeholder="12000" className="text-base" />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="text-base"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="finalized">Finalized</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Day-by-Day Itinerary</Label>
            <Textarea value={itineraryText} onChange={e => setItineraryText(e.target.value)} placeholder={"Day 1: Arrive Rome - Rome - Private transfer, evening walk\nDay 2: Ancient Rome - Rome - Colosseum and Forum tour"} className="h-36 text-sm font-mono" />
            <p className="text-xs text-gray-400 mt-1">One day per line: Day N: Title - Location - Description</p>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Hotel Ideas</Label>
            <Textarea value={hotelText} onChange={e => setHotelText(e.target.value)} placeholder={"Hotel de Russie (Rome) - 5-star luxury near Piazza del Popolo\nLe Sirenuse (Positano) - Iconic Amalfi Coast hotel"} className="h-24 text-sm font-mono" />
            <p className="text-xs text-gray-400 mt-1">One per line: Name (Location) - Description</p>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Experiences</Label>
            <Textarea value={expText} onChange={e => setExpText(e.target.value)} placeholder={"Private Boat Charter - Full-day boat along the Amalfi Coast\nPasta-Making Class - Learn pasta in Trastevere"} className="h-24 text-sm font-mono" />
            <p className="text-xs text-gray-400 mt-1">One per line: Name - Description</p>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Internal Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any planning notes for this version..." className="h-20 text-base" />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="navy" onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Version"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
