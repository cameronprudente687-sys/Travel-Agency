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
import { createPlace, updatePlace } from "@/actions/places"

interface PlaceFormDialogProps {
  place?: any
  trigger?: React.ReactNode
}

const CATEGORIES = [
  { value: "HOTEL", label: "Hotel" },
  { value: "RESORT", label: "Resort" },
  { value: "BOUTIQUE_HOTEL", label: "Boutique Hotel" },
  { value: "VILLA", label: "Villa" },
  { value: "RESTAURANT", label: "Restaurant" },
  { value: "CAFE", label: "Cafe" },
  { value: "BAR", label: "Bar" },
  { value: "EXPERIENCE", label: "Experience" },
  { value: "ACTIVITY", label: "Activity" },
  { value: "TOUR", label: "Tour" },
  { value: "SPA", label: "Spa" },
  { value: "BEACH", label: "Beach" },
  { value: "LANDMARK", label: "Landmark" },
]

const PRICE_LEVELS = [
  { value: "1", label: "$" },
  { value: "2", label: "$$" },
  { value: "3", label: "$$$" },
  { value: "4", label: "$$$$" },
]

const BEST_FOR_OPTIONS = [
  "COUPLE",
  "SOLO",
  "FAMILY_YOUNG_KIDS",
  "FAMILY_TEENS",
  "GROUP_FRIENDS",
  "HONEYMOON",
  "ANNIVERSARY",
  "FOODIE",
  "ADVENTURE",
  "CULTURAL",
  "LUXURY",
  "WELLNESS",
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

export function PlaceFormDialog({ place, trigger }: PlaceFormDialogProps) {
  const isEditing = !!place
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const existingBestFor = parseJsonArray(place?.bestFor)

  const [name, setName] = useState(place?.name ?? "")
  const [destination, setDestination] = useState(place?.destination ?? "")
  const [country, setCountry] = useState(place?.country ?? "")
  const [flagEmoji, setFlagEmoji] = useState(place?.flagEmoji ?? "")
  const [category, setCategory] = useState(place?.category ?? "")
  const [description, setDescription] = useState(place?.description ?? "")
  const [priceLevel, setPriceLevel] = useState<string>(
    place?.priceLevel?.toString() ?? ""
  )
  const [rating, setRating] = useState<string>(place?.rating?.toString() ?? "")
  const [address, setAddress] = useState(place?.address ?? "")
  const [website, setWebsite] = useState(place?.website ?? "")
  const [whyWeRecommend, setWhyWeRecommend] = useState(place?.whyWeRecommend ?? "")
  const [bestFor, setBestFor] = useState<string[]>(existingBestFor)
  const [isTopPick, setIsTopPick] = useState(place?.isTopPick ?? false)
  const [isFeatured, setIsFeatured] = useState(place?.isFeatured ?? false)

  function toggleArrayItem(arr: string[], item: string, setter: (v: string[]) => void) {
    if (arr.includes(item)) {
      setter(arr.filter((i) => i !== item))
    } else {
      setter([...arr, item])
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const input = {
        name,
        destination,
        country,
        flagEmoji: flagEmoji || undefined,
        category,
        description,
        priceLevel: priceLevel ? parseInt(priceLevel) : undefined,
        rating: rating ? parseFloat(rating) : undefined,
        address: address || undefined,
        website: website || undefined,
        whyWeRecommend,
        bestFor: bestFor.length > 0 ? bestFor : undefined,
        isFeatured,
        isTopPick,
      }

      if (isEditing) {
        await updatePlace(place.id, input)
        toast.success("Place updated successfully")
      } else {
        await createPlace(input)
        toast.success("Place created successfully")
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
        {trigger || <Button variant="navy" className="gap-2"><Plus className="h-4 w-4" />New Place</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isEditing ? "Edit Place" : "Add New Place"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-medium">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Le Meurice"
              className="h-12 text-base"
              required
            />
          </div>

          {/* Destination / Country / Flag row */}
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
          </div>

          {/* Category / Price Level / Rating row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-base font-medium">Category</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-base font-medium">
                Price Level <span className="text-gray-400 text-sm">(optional)</span>
              </Label>
              <Select value={priceLevel} onValueChange={setPriceLevel}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select price" />
                </SelectTrigger>
                <SelectContent>
                  {PRICE_LEVELS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating" className="text-base font-medium">
                Rating <span className="text-gray-400 text-sm">(0-5)</span>
              </Label>
              <Input
                id="rating"
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="e.g. 4.5"
                className="h-12 text-base"
              />
            </div>
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
              placeholder="Describe this place..."
              className="min-h-[100px] text-base"
              required
            />
          </div>

          {/* Address / Website */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address" className="text-base font-medium">
                Address <span className="text-gray-400 text-sm">(optional)</span>
              </Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 228 Rue de Rivoli, 75001 Paris"
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="text-base font-medium">
                Website <span className="text-gray-400 text-sm">(optional)</span>
              </Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="e.g. https://lemeurice.com"
                className="h-12 text-base"
              />
            </div>
          </div>

          {/* Why We Recommend */}
          <div className="space-y-2">
            <Label htmlFor="whyWeRecommend" className="text-base font-medium">
              Why We Recommend
            </Label>
            <Textarea
              id="whyWeRecommend"
              value={whyWeRecommend}
              onChange={(e) => setWhyWeRecommend(e.target.value)}
              placeholder="What makes this place special..."
              className="min-h-[100px] text-base"
              required
            />
          </div>

          {/* Best For */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Best For</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {BEST_FOR_OPTIONS.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <Checkbox
                    checked={bestFor.includes(option)}
                    onCheckedChange={() =>
                      toggleArrayItem(bestFor, option, setBestFor)
                    }
                  />
                  <span className="text-sm font-medium">{formatLabel(option)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Switches */}
          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="isTopPick" className="text-base font-medium cursor-pointer">
                Top Pick
              </Label>
              <Switch
                id="isTopPick"
                checked={isTopPick}
                onCheckedChange={setIsTopPick}
              />
            </div>
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
              {isEditing ? "Save Changes" : "Add Place"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
