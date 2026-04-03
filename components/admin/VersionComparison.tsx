"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeftRight, MapPin, Clock, DollarSign } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Version {
  id: string
  versionNumber: number
  title: string
  summary: string
  destinations: string
  durationDays: number
  estimatedCost: number | null
  itinerary: string
  hotelIdeas: string
  experiences: string
  notes: string | null
  status: string
}

interface Props {
  versions: Version[]
}

function parseJson(val: string | null, fb: any[]) {
  if (!val) return fb
  try { return JSON.parse(val) } catch { return fb }
}

function VersionColumn({ v }: { v: Version }) {
  const dests = parseJson(v.destinations, [])
  const itinerary = parseJson(v.itinerary, [])
  const hotels = parseJson(v.hotelIdeas, [])
  const exps = parseJson(v.experiences, [])

  return (
    <div className="space-y-4">
      <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-primary-500">V{v.versionNumber}</span>
          <span className={`text-xs rounded-full px-2 py-0.5 ${v.status === "finalized" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
            {v.status}
          </span>
        </div>
        <h3 className="font-semibold text-primary-900 text-base">{v.title}</h3>
        <p className="text-sm text-gray-600 mt-1">{v.summary}</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-lg border p-3 text-center">
          <MapPin className="w-4 h-4 text-gray-400 mx-auto mb-1" />
          <div className="text-xs text-gray-500">Destinations</div>
          <div className="text-sm font-medium">{dests.length}</div>
        </div>
        <div className="bg-white rounded-lg border p-3 text-center">
          <Clock className="w-4 h-4 text-gray-400 mx-auto mb-1" />
          <div className="text-xs text-gray-500">Days</div>
          <div className="text-sm font-medium">{v.durationDays}</div>
        </div>
        <div className="bg-white rounded-lg border p-3 text-center">
          <DollarSign className="w-4 h-4 text-gray-400 mx-auto mb-1" />
          <div className="text-xs text-gray-500">Est. Cost</div>
          <div className="text-sm font-medium">{v.estimatedCost ? formatCurrency(v.estimatedCost) : "TBD"}</div>
        </div>
      </div>

      {dests.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Destinations</div>
          <div className="flex flex-wrap gap-1">
            {dests.map((d: string) => (
              <span key={d} className="text-xs bg-primary-50 text-primary-700 rounded-full px-2 py-0.5">{d}</span>
            ))}
          </div>
        </div>
      )}

      {itinerary.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Itinerary ({itinerary.length} days)</div>
          <div className="space-y-1">
            {itinerary.map((day: any, i: number) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="w-5 h-5 rounded-full bg-primary-700 text-white text-xs flex items-center justify-center shrink-0 mt-0.5">{day.day || i + 1}</span>
                <div>
                  <span className="font-medium text-gray-800">{day.title}</span>
                  {day.location && <span className="text-gray-400 ml-1">· {day.location}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hotels.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Hotels</div>
          <div className="space-y-1">
            {hotels.map((h: any, i: number) => (
              <div key={i} className="text-sm text-gray-700">
                <span className="font-medium">{h.name}</span>
                {h.location && <span className="text-gray-400"> · {h.location}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {exps.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Experiences</div>
          <div className="space-y-1">
            {exps.map((e: any, i: number) => (
              <div key={i} className="text-sm text-gray-700">
                {e.emoji || "✨"} {e.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {v.notes && (
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Notes</div>
          <p className="text-sm text-gray-600 italic">{v.notes}</p>
        </div>
      )}
    </div>
  )
}

export function VersionComparison({ versions }: Props) {
  const [open, setOpen] = useState(false)
  const [leftId, setLeftId] = useState(versions[0]?.id || "")
  const [rightId, setRightId] = useState(versions[1]?.id || versions[0]?.id || "")

  const leftVersion = versions.find(v => v.id === leftId)
  const rightVersion = versions.find(v => v.id === rightId)

  if (versions.length < 2) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-primary-200 text-primary-700">
          <ArrowLeftRight className="w-4 h-4 mr-1" />
          Compare Versions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif">Compare Trip Versions</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">Left</Label>
            <Select value={leftId} onValueChange={setLeftId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {versions.map(v => (
                  <SelectItem key={v.id} value={v.id}>V{v.versionNumber}: {v.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">Right</Label>
            <Select value={rightId} onValueChange={setRightId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {versions.map(v => (
                  <SelectItem key={v.id} value={v.id}>V{v.versionNumber}: {v.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 border-t pt-6">
          {leftVersion && <VersionColumn v={leftVersion} />}
          {rightVersion && <VersionColumn v={rightVersion} />}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={className} {...props}>{children}</label>
}
