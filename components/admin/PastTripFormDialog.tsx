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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createPastTrip, updatePastTrip } from "@/actions/past-trips"

const TRAVEL_STYLES = [
  "LUXURY",
  "ADVENTURE",
  "CULTURAL",
  "ROMANTIC",
  "FAMILY",
  "SOLO",
  "WELLNESS",
  "FOODIE",
  "SCENIC",
] as const

const TRAVELER_TYPES = [
  "COUPLE",
  "SOLO",
  "FAMILY_YOUNG_KIDS",
  "FAMILY_TEENS",
  "GROUP_FRIENDS",
  "MULTI_GEN",
  "HONEYMOON",
  "ANNIVERSARY",
] as const

const BUDGET_LEVELS = [
  "UNDER_3K",
  "THREE_TO_5K",
  "FIVE_TO_10K",
  "TEN_TO_20K",
  "OVER_20K",
] as const

interface PastTripFormDialogProps {
  trip?: any
  trigger?: React.ReactNode
}

export function PastTripFormDialog({
  trip,
  trigger,
}: PastTripFormDialogProps) {
  const isEditing = !!trip

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [title, setTitle] = useState(trip?.title ?? "")
  const [destination, setDestination] = useState(trip?.destination ?? "")
  const [country, setCountry] = useState(trip?.country ?? "")
  const [flagEmoji, setFlagEmoji] = useState(trip?.flagEmoji ?? "")
  const [clientName, setClientName] = useState(trip?.clientName ?? "")
  const [tripDate, setTripDate] = useState(trip?.tripDate ?? "")
  const [durationDays, setDurationDays] = useState<number>(
    trip?.durationDays ?? 7
  )
  const [summary, setSummary] = useState(trip?.summary ?? "")
  const [highlights, setHighlights] = useState(() => {
    if (!trip?.highlights) return ""
    const parsed =
      typeof trip.highlights === "string"
        ? JSON.parse(trip.highlights)
        : trip.highlights
    return Array.isArray(parsed) ? parsed.join("\n") : ""
  })
  const [travelStyle, setTravelStyle] = useState(
    trip?.travelStyle ?? "LUXURY"
  )
  const [travelerType, setTravelerType] = useState(
    trip?.travelerType ?? "COUPLE"
  )
  const [budgetLevel, setBudgetLevel] = useState(
    trip?.budgetLevel ?? "FIVE_TO_10K"
  )
  const [testimonial, setTestimonial] = useState(trip?.testimonial ?? "")
  const [rating, setRating] = useState<string>(
    trip?.rating?.toString() ?? "5"
  )
  const [advisorNotes, setAdvisorNotes] = useState(trip?.advisorNotes ?? "")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const parsedHighlights = highlights
        .split("\n")
        .map((h: string) => h.trim())
        .filter(Boolean)

      const input = {
        title,
        destination,
        country,
        flagEmoji: flagEmoji || undefined,
        clientName,
        tripDate,
        durationDays,
        summary,
        highlights: parsedHighlights,
        travelStyle,
        travelerType,
        budgetLevel,
        testimonial: testimonial || undefined,
        rating: parseInt(rating, 10),
        advisorNotes: advisorNotes || undefined,
      }

      if (isEditing) {
        await updatePastTrip(trip.id, input)
        toast.success("Past trip updated")
      } else {
        await createPastTrip(input)
        toast.success("Past trip created")
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
        {trigger || <Button variant="navy"><Plus className="mr-2 h-4 w-4" />New Past Trip</Button>}
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? "Edit Past Trip" : "New Past Trip"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-base">Title</Label>
            <Input
              className="text-base"
              placeholder="10-Day Italian Adventure"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-base">Destination</Label>
              <Input
                className="text-base"
                placeholder="Rome & Amalfi Coast"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base">Country</Label>
              <Input
                className="text-base"
                placeholder="Italy"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-base">Flag Emoji</Label>
              <Input
                className="w-20 text-base"
                placeholder="🇮🇹"
                value={flagEmoji}
                onChange={(e) => setFlagEmoji(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base">Client Name</Label>
              <Input
                className="text-base"
                placeholder="Sarah & James T."
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-base">Trip Date</Label>
              <Input
                className="text-base"
                placeholder="June 2024"
                value={tripDate}
                onChange={(e) => setTripDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base">Duration (days)</Label>
              <Input
                className="text-base"
                type="number"
                min={1}
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value, 10) || 1)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-base">Summary</Label>
            <Textarea
              className="text-base"
              placeholder="Brief summary of the trip..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base">Highlights (one per line)</Label>
            <Textarea
              className="h-40 text-base"
              placeholder={"Private Vatican tour\nAmalfi Coast boat day\nCooking class in Positano"}
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-base">Travel Style</Label>
              <Select value={travelStyle} onValueChange={setTravelStyle}>
                <SelectTrigger className="text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRAVEL_STYLES.map((style) => (
                    <SelectItem key={style} value={style}>
                      {style.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-base">Traveler Type</Label>
              <Select value={travelerType} onValueChange={setTravelerType}>
                <SelectTrigger className="text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRAVELER_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-base">Budget Level</Label>
              <Select value={budgetLevel} onValueChange={setBudgetLevel}>
                <SelectTrigger className="text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-base">Testimonial (optional)</Label>
            <Textarea
              className="text-base"
              placeholder="Client testimonial quote..."
              value={testimonial}
              onChange={(e) => setTestimonial(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base">Rating</Label>
            <Select value={rating} onValueChange={setRating}>
              <SelectTrigger className="w-24 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={n.toString()}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-base">Advisor Notes (optional)</Label>
            <Textarea
              className="text-base"
              placeholder="Internal notes about this trip..."
              value={advisorNotes}
              onChange={(e) => setAdvisorNotes(e.target.value)}
            />
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
              {loading
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Create Trip"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
