"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { publishPortal, unpublishPortal, updatePortalMessage, updatePortalDates, createCustomerAccount } from "@/actions/portal"
import { generateChecklistFromItinerary, createChecklistItem, deleteChecklistItem, applyChecklistTemplate } from "@/actions/checklist"
import { Globe, GlobeLock, UserPlus, Plus, Trash2, ListChecks, Wand2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface Props {
  portal: any
  leadId: string
  checklistItems?: any[]
  checklistTemplates?: any[]
}

export function PortalControls({ portal, leadId, checklistItems = [], checklistTemplates = [] }: Props) {
  const [isPending, startTransition] = useTransition()

  const handlePublish = () => {
    startTransition(async () => {
      try {
        await publishPortal(portal.id)
        toast.success("Portal published! Customer can now access their trip.")
      } catch { toast.error("Failed to publish") }
    })
  }

  const handleUnpublish = () => {
    if (!confirm("This will remove customer access to the portal. Continue?")) return
    startTransition(async () => {
      try {
        await unpublishPortal(portal.id)
        toast.success("Portal unpublished")
      } catch { toast.error("Failed to unpublish") }
    })
  }

  const handleCreateAccount = () => {
    startTransition(async () => {
      try {
        const result = await createCustomerAccount(leadId) as any
        toast.success(`Customer account created! Temp password: ${result.tempPassword}`)
      } catch (e: any) {
        toast.error(e.message || "Failed to create account")
      }
    })
  }

  const handleGenerateChecklist = () => {
    startTransition(async () => {
      try {
        await generateChecklistFromItinerary(portal.id)
        toast.success("Checklist generated from itinerary")
      } catch { toast.error("Failed to generate checklist") }
    })
  }

  return (
    <div className="space-y-4">
      {/* Portal Status & Publish Controls */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Portal Controls</h3>

        <div className="flex items-center gap-3 mb-4">
          <span className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full ${
            portal.portalStatus === "PUBLISHED" ? "bg-green-100 text-green-700" :
            portal.portalStatus === "UNPUBLISHED" ? "bg-red-100 text-red-700" :
            "bg-gray-100 text-gray-600"
          }`}>
            {portal.portalStatus === "PUBLISHED" ? <Globe className="w-3.5 h-3.5" /> : <GlobeLock className="w-3.5 h-3.5" />}
            {portal.portalStatus}
          </span>
          {portal.portalStatus === "PUBLISHED" && (
            <a href={`/portal/${portal.slug}`} target="_blank" className="text-xs text-primary-600 hover:underline">
              View public portal
            </a>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {portal.portalStatus !== "PUBLISHED" ? (
            <Button variant="navy" size="sm" onClick={handlePublish} disabled={isPending}>
              <Globe className="w-4 h-4 mr-1" /> Publish to Customer
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleUnpublish} disabled={isPending} className="text-red-600 border-red-200 hover:bg-red-50">
              <GlobeLock className="w-4 h-4 mr-1" /> Unpublish
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleCreateAccount} disabled={isPending}>
            <UserPlus className="w-4 h-4 mr-1" /> Create Customer Login
          </Button>
        </div>
      </div>

      {/* Advisor Message */}
      <AdvisorMessageEditor portalId={portal.id} currentMessage={portal.advisorMessage || ""} />

      {/* Checklist Management */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Trip Checklist ({checklistItems.length} items)</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleGenerateChecklist} disabled={isPending}>
              <Wand2 className="w-4 h-4 mr-1" /> Auto-Generate
            </Button>
            <AddChecklistItemDialog portalId={portal.id} />
          </div>
        </div>

        {/* Checklist template selector */}
        {checklistTemplates.length > 0 && (
          <div className="mb-4">
            <ApplyTemplateSelector portalId={portal.id} templates={checklistTemplates} />
          </div>
        )}

        {/* Existing items */}
        <div className="space-y-2">
          {checklistItems.map((item: any) => (
            <ChecklistItemRow key={item.id} item={item} />
          ))}
          {checklistItems.length === 0 && (
            <p className="text-sm text-gray-400 py-4 text-center">No checklist items yet. Generate from itinerary or add manually.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function AdvisorMessageEditor({ portalId, currentMessage }: { portalId: string; currentMessage: string }) {
  const [msg, setMsg] = useState(currentMessage)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updatePortalMessage(portalId, msg)
      toast.success("Advisor message saved")
    } catch { toast.error("Failed to save") }
    finally { setSaving(false) }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <Label className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Advisor Message to Customer</Label>
      <Textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder="A personal note to your client..." className="h-20 text-base mb-2" />
      <Button variant="navy" size="sm" onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Message"}
      </Button>
    </div>
  )
}

function AddChecklistItemDialog({ portalId }: { portalId: string }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("PRE_TRIP")
  const [dayNumber, setDayNumber] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim()) return
    setLoading(true)
    try {
      await createChecklistItem(portalId, {
        title, description, category,
        dayNumber: dayNumber ? parseInt(dayNumber) : undefined,
      })
      setTitle(""); setDescription(""); setDayNumber("")
      setOpen(false)
      toast.success("Checklist item added")
    } catch { toast.error("Failed to add item") }
    finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="navy" size="sm"><Plus className="w-4 h-4 mr-1" /> Add Item</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle className="font-serif">Add Checklist Item</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-2">
          <div><Label className="text-sm font-medium mb-1 block">Title *</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Passport ready" className="text-base" /></div>
          <div><Label className="text-sm font-medium mb-1 block">Description</Label><Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional details" className="text-base" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-1 block">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="text-base"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRE_TRIP">Pre-Trip</SelectItem>
                  <SelectItem value="DURING_TRIP">During Trip</SelectItem>
                  <SelectItem value="DAY_ACTIVITY">Day Activity</SelectItem>
                  <SelectItem value="POST_TRIP">Post-Trip</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1 block">Day #</Label>
              <Input type="number" min={1} value={dayNumber} onChange={e => setDayNumber(e.target.value)} placeholder="Optional" className="text-base" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="navy" onClick={handleSubmit} disabled={loading}>{loading ? "Adding..." : "Add Item"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ChecklistItemRow({ item }: { item: any }) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteChecklistItem(item.id)
        toast.success("Item removed")
      } catch { toast.error("Failed to remove") }
    })
  }

  const categoryLabel: Record<string, string> = {
    PRE_TRIP: "Pre-Trip",
    DURING_TRIP: "During",
    DAY_ACTIVITY: "Day",
    POST_TRIP: "Post",
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <ListChecks className="w-4 h-4 text-gray-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800">
          {item.dayNumber ? `Day ${item.dayNumber}: ` : ""}{item.title}
        </div>
        {item.description && <div className="text-xs text-gray-500">{item.description}</div>}
      </div>
      <span className="text-xs bg-gray-200 text-gray-600 rounded px-1.5 py-0.5 shrink-0">
        {categoryLabel[item.category] || item.category}
      </span>
      {!item.isCustomerVisible && (
        <span className="text-xs bg-amber-100 text-amber-700 rounded px-1.5 py-0.5 shrink-0">Internal</span>
      )}
      <button onClick={handleDelete} disabled={isPending} className="text-red-400 hover:text-red-600 shrink-0">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

function ApplyTemplateSelector({ portalId, templates }: { portalId: string; templates: any[] }) {
  const [isPending, startTransition] = useTransition()

  const handleApply = (templateId: string) => {
    startTransition(async () => {
      try {
        await applyChecklistTemplate(portalId, templateId)
        toast.success("Template applied to checklist")
      } catch { toast.error("Failed to apply template") }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">Apply template:</span>
      {templates.map(t => (
        <button
          key={t.id}
          onClick={() => handleApply(t.id)}
          disabled={isPending}
          className="text-xs bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-full px-3 py-1 transition-colors"
        >
          {t.name}
        </button>
      ))}
    </div>
  )
}
