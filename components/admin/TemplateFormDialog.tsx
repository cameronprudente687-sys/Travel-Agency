"use client"

import { useState } from "react"
import { Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createTemplate, updateTemplate } from "@/actions/templates"

interface TemplateFormDialogProps {
  template?: any
  trigger?: React.ReactNode
}

const BUDGET_LEVELS = [
  { value: "UNDER_3K", label: "Under $3K" },
  { value: "THREE_TO_5K", label: "$3K - $5K" },
  { value: "FIVE_TO_10K", label: "$5K - $10K" },
  { value: "TEN_TO_20K", label: "$10K - $20K" },
  { value: "OVER_20K", label: "Over $20K" },
]

const PACE_LEVELS = [
  { value: "slow", label: "Slow" },
  { value: "moderate", label: "Moderate" },
  { value: "fast", label: "Fast" },
]

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
]

const TRAVELER_TYPES = [
  "COUPLE",
  "SOLO",
  "FAMILY_YOUNG_KIDS",
  "FAMILY_TEENS",
  "GROUP_FRIENDS",
  "MULTI_GEN",
  "HONEYMOON",
  "ANNIVERSARY",
]

function parseJsonArray(value: any): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

function formatLabel(value: string): string {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function TemplateFormDialog({ template, trigger }: TemplateFormDialogProps) {
  const isEditing = !!template
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const existingStyles = parseJsonArray(template?.travelStyles)
  const existingTypes = parseJsonArray(template?.travelerTypes)
  const existingHighlights = parseJsonArray(template?.highlights)
  const existingIncludes = parseJsonArray(template?.includes)
  const existingExcludes = parseJsonArray(template?.excludes)

  const [title, setTitle] = useState(template?.title ?? "")
  const [destination, setDestination] = useState(template?.destination ?? "")
  const [country, setCountry] = useState(template?.country ?? "")
  const [region, setRegion] = useState(template?.region ?? "")
  const [flagEmoji, setFlagEmoji] = useState(template?.flagEmoji ?? "")
  const [summary, setSummary] = useState(template?.summary ?? "")
  const [description, setDescription] = useState(template?.description ?? "")
  const [durationDays, setDurationDays] = useState<number>(template?.durationDays ?? 7)
  const [budgetLevel, setBudgetLevel] = useState(template?.budgetLevel ?? "")
  const [paceLevel, setPaceLevel] = useState(template?.paceLevel ?? "")
  const [travelStyles, setTravelStyles] = useState<string[]>(existingStyles)
  const [travelerTypes, setTravelerTypes] = useState<string[]>(existingTypes)
  const [isFeatured, setIsFeatured] = useState(template?.isFeatured ?? false)
  const [isBestSeller, setIsBestSeller] = useState(template?.isBestSeller ?? false)
  const [isSignature, setIsSignature] = useState(template?.isSignature ?? false)
  const [basePrice, setBasePrice] = useState<string>(template?.basePrice?.toString() ?? "")
  const [highlights, setHighlights] = useState(existingHighlights.join("\n"))
  const [includes, setIncludes] = useState(existingIncludes.join("\n"))
  const [excludes, setExcludes] = useState(existingExcludes.join("\n"))

  function toggleArrayItem(arr: string[], item: string, setter: (v: string[]) => void) {
    if (arr.includes(item)) {
      setter(arr.filter((i) => i !== item))
    } else {
      setter([...arr, item])
    }
  }

  function splitLines(text: string): string[] {
    return text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const input = {
        title,
        destination,
        country,
        region: region || undefined,
        flagEmoji: flagEmoji || undefined,
        summary,
        description,
        durationDays,
        budgetLevel,
        paceLevel,
        travelStyles,
        travelerTypes,
        isFeatured,
        isBestSeller,
        isSignature,
        basePrice: basePrice ? parseFloat(basePrice) : undefined,
        highlights: splitLines(highlights),
        includes: splitLines(includes),
        excludes: splitLines(excludes).length > 0 ? splitLines(excludes) : undefined,
      }

      if (isEditing) {
        await updateTemplate(template.id, input)
        toast.success("Template updated successfully")
      } else {
        await createTemplate(input)
        toast.success("Template created successfully")
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
        {trigger || <Button variant="navy" className="gap-2"><Plus className="h-4 w-4" />New Template</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isEditing ? "Edit Template" : "Create New Template"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-medium">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Romantic Paris Getaway"
              className="h-12 text-base"
              required
            />
          </div>

          {/* Destination / Country / Region row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="destination" className="text-base font-medium">
                Destination
              </Label>
              <Input
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Paris"
                className="h-12 text-base"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country" className="text-base font-medium">
                Country
              </Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. France"
                className="h-12 text-base"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region" className="text-base font-medium">
                Region <span className="text-gray-400 text-sm">(optional)</span>
              </Label>
              <Input
                id="region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="e.g. Ile-de-France"
                className="h-12 text-base"
              />
            </div>
          </div>

          {/* Flag Emoji / Duration row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="flagEmoji" className="text-base font-medium">
                Flag Emoji
              </Label>
              <Input
                id="flagEmoji"
                value={flagEmoji}
                onChange={(e) => setFlagEmoji(e.target.value)}
                placeholder="e.g. \uD83C\uDDEB\uD83C\uDDF7"
                className="h-12 text-base w-24"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="durationDays" className="text-base font-medium">
                Duration (days)
              </Label>
              <Input
                id="durationDays"
                type="number"
                min={1}
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value) || 1)}
                className="h-12 text-base"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="basePrice" className="text-base font-medium">
                Base Price <span className="text-gray-400 text-sm">(optional)</span>
              </Label>
              <Input
                id="basePrice"
                type="number"
                min={0}
                step={0.01}
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="e.g. 4500"
                className="h-12 text-base"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <Label htmlFor="summary" className="text-base font-medium">
              Summary
            </Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="A brief overview of this itinerary..."
              className="min-h-[80px] text-base"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Full description of the template..."
              className="min-h-[120px] text-base"
              required
            />
          </div>

          {/* Budget Level / Pace Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-base font-medium">Budget Level</Label>
              <Select value={budgetLevel} onValueChange={setBudgetLevel} required>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select budget level" />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_LEVELS.map((b) => (
                    <SelectItem key={b.value} value={b.value}>
                      {b.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-base font-medium">Pace Level</Label>
              <Select value={paceLevel} onValueChange={setPaceLevel} required>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select pace" />
                </SelectTrigger>
                <SelectContent>
                  {PACE_LEVELS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Travel Styles */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Travel Styles</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {TRAVEL_STYLES.map((style) => (
                <label
                  key={style}
                  className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <Checkbox
                    checked={travelStyles.includes(style)}
                    onCheckedChange={() =>
                      toggleArrayItem(travelStyles, style, setTravelStyles)
                    }
                  />
                  <span className="text-sm font-medium">{formatLabel(style)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Traveler Types */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Traveler Types</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {TRAVELER_TYPES.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <Checkbox
                    checked={travelerTypes.includes(type)}
                    onCheckedChange={() =>
                      toggleArrayItem(travelerTypes, type, setTravelerTypes)
                    }
                  />
                  <span className="text-sm font-medium">{formatLabel(type)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Switches */}
          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="isFeatured" className="text-base font-medium cursor-pointer">
                Featured
              </Label>
              <Switch
                id="isFeatured"
                checked={isFeatured}
                onCheckedChange={setIsFeatured}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isBestSeller" className="text-base font-medium cursor-pointer">
                Best Seller
              </Label>
              <Switch
                id="isBestSeller"
                checked={isBestSeller}
                onCheckedChange={setIsBestSeller}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isSignature" className="text-base font-medium cursor-pointer">
                Signature
              </Label>
              <Switch
                id="isSignature"
                checked={isSignature}
                onCheckedChange={setIsSignature}
              />
            </div>
          </div>

          {/* Highlights */}
          <div className="space-y-2">
            <Label htmlFor="highlights" className="text-base font-medium">
              Highlights <span className="text-gray-400 text-sm">(one per line)</span>
            </Label>
            <Textarea
              id="highlights"
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
              placeholder={"Private Eiffel Tower dinner\nSeine River cruise\nVersailles day trip"}
              className="min-h-[100px] text-base"
            />
          </div>

          {/* Includes */}
          <div className="space-y-2">
            <Label htmlFor="includes" className="text-base font-medium">
              Includes <span className="text-gray-400 text-sm">(one per line)</span>
            </Label>
            <Textarea
              id="includes"
              value={includes}
              onChange={(e) => setIncludes(e.target.value)}
              placeholder={"Luxury hotel accommodation\nPrivate transfers\nDaily breakfast"}
              className="min-h-[100px] text-base"
            />
          </div>

          {/* Excludes */}
          <div className="space-y-2">
            <Label htmlFor="excludes" className="text-base font-medium">
              Excludes{" "}
              <span className="text-gray-400 text-sm">(one per line, optional)</span>
            </Label>
            <Textarea
              id="excludes"
              value={excludes}
              onChange={(e) => setExcludes(e.target.value)}
              placeholder={"International flights\nTravel insurance"}
              className="min-h-[80px] text-base"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="h-12 px-6 text-base"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="h-12 px-8 text-base">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Template"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
