"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { createProposal, updateProposal } from "@/actions/proposals"
import { toast } from "sonner"

interface Props {
  leadId: string
  proposal?: any
  versions?: { id: string; title: string; versionNumber: number }[]
  trigger?: React.ReactNode
}

export function ProposalFormDialog({ leadId, proposal, versions = [], trigger }: Props) {
  const isEdit = !!proposal
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const parseJson = (val: any, fallback: any) => {
    if (!val) return fallback
    try { return typeof val === "string" ? JSON.parse(val) : val } catch { return fallback }
  }

  const [title, setTitle] = useState(proposal?.title || "")
  const [status, setStatus] = useState(proposal?.status || "DRAFT")
  const [versionId, setVersionId] = useState(proposal?.versionId || "none")
  const [introMessage, setIntroMessage] = useState(proposal?.introMessage || "")
  const [itinerarySummary, setItinerarySummary] = useState(proposal?.itinerarySummary || "")
  const [inclusions, setInclusions] = useState(parseJson(proposal?.inclusions, []).join("\n"))
  const [exclusions, setExclusions] = useState(parseJson(proposal?.exclusions, []).join("\n"))
  const [advisorSignOff, setAdvisorSignOff] = useState(proposal?.advisorSignOff || "")

  // Pricing as simple key-value pairs
  const pricingObj = parseJson(proposal?.pricing, {})
  const [pricingText, setPricingText] = useState(
    Object.entries(pricingObj).map(([k, v]) => `${k}: ${v}`).join("\n")
  )

  const handleSubmit = async () => {
    if (!title.trim() || !introMessage.trim()) {
      toast.error("Title and introduction are required")
      return
    }
    setLoading(true)
    try {
      const pricing: Record<string, string> = {}
      pricingText.split("\n").filter(Boolean).forEach(line => {
        const idx = line.indexOf(":")
        if (idx > 0) {
          pricing[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
        }
      })

      const input = {
        title,
        introMessage,
        itinerarySummary,
        pricing,
        inclusions: inclusions.split("\n").filter(Boolean),
        exclusions: exclusions.split("\n").filter(Boolean),
        advisorSignOff,
        status,
        versionId: versionId && versionId !== "none" ? versionId : undefined,
      }

      if (isEdit) {
        await updateProposal(proposal.id, leadId, input)
        toast.success("Proposal updated")
      } else {
        await createProposal(leadId, input)
        toast.success("Proposal created")
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
            Build Proposal
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif">
            {isEdit ? "Edit Proposal" : "Create Proposal"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Proposal Title *</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Romantic Italy Honeymoon" className="text-base" />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="text-base"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="SENT">Sent</SelectItem>
                  <SelectItem value="VIEWED">Viewed</SelectItem>
                  <SelectItem value="ACCEPTED">Accepted</SelectItem>
                  <SelectItem value="DECLINED">Declined</SelectItem>
                  <SelectItem value="REVISED">Revised</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {versions.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Link to Trip Version</Label>
              <Select value={versionId} onValueChange={setVersionId}>
                <SelectTrigger className="text-base"><SelectValue placeholder="Select a version (optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No linked version</SelectItem>
                  {versions.map(v => (
                    <SelectItem key={v.id} value={v.id}>V{v.versionNumber}: {v.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Introduction Message *</Label>
            <Textarea value={introMessage} onChange={e => setIntroMessage(e.target.value)} placeholder="Dear [Client], I'm thrilled to share your personalized itinerary..." className="h-28 text-base" />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Itinerary Summary</Label>
            <Textarea value={itinerarySummary} onChange={e => setItinerarySummary(e.target.value)} placeholder="Brief overview of the trip plan..." className="h-24 text-base" />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Pricing</Label>
            <Textarea value={pricingText} onChange={e => setPricingText(e.target.value)} placeholder={"flights_estimate: $2,000-3,000\naccommodation: $6,000-8,000\ntotal_range: $12,000-16,000"} className="h-24 text-sm font-mono" />
            <p className="text-xs text-gray-400 mt-1">One per line: label: value</p>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">What's Included</Label>
            <Textarea value={inclusions} onChange={e => setInclusions(e.target.value)} placeholder={"10 nights luxury accommodation\nPrivate airport transfers\nDaily breakfast"} className="h-24 text-base" />
            <p className="text-xs text-gray-400 mt-1">One item per line</p>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">What's Not Included</Label>
            <Textarea value={exclusions} onChange={e => setExclusions(e.target.value)} placeholder={"International flights\nTravel insurance\nPersonal expenses"} className="h-20 text-base" />
            <p className="text-xs text-gray-400 mt-1">One item per line</p>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Advisor Sign-Off</Label>
            <Textarea value={advisorSignOff} onChange={e => setAdvisorSignOff(e.target.value)} placeholder="This trip has been designed with love... — Alexandra" className="h-16 text-base" />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="navy" onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Proposal"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
