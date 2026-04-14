"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ChevronUp, ChevronDown, Trash2, Plus, Wand2,
  Pencil, Check, X, Eye, EyeOff, Luggage, MapPin, Calendar
} from "lucide-react"
import {
  createChecklistItem, updateChecklistItem, deleteChecklistItem,
  reorderChecklistItems, generateChecklistFromItinerary, applyChecklistTemplate,
} from "@/actions/checklist"
import { toast } from "sonner"

interface ChecklistItemData {
  id: string
  title: string
  description: string | null
  category: string
  dayNumber: number | null
  sortOrder: number
  isCustomerVisible: boolean
  isRequired: boolean
  isGenerated: boolean
}

interface Props {
  portalId: string
  items: ChecklistItemData[]
  checklistTemplates?: any[]
}

export function ChecklistEditor({ portalId, items, checklistTemplates = [] }: Props) {
  const [isPending, startTransition] = useTransition()
  const [addingItem, setAddingItem] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newCategory, setNewCategory] = useState("PRE_TRIP")

  // Group items by section
  const preTripItems = items.filter(i => i.category === "PRE_TRIP")
  const duringItems = items.filter(i => i.category === "DURING_TRIP")
  const postItems = items.filter(i => i.category === "POST_TRIP")
  const dayItems = items.filter(i => i.category === "DAY_ACTIVITY")

  // Group day items by dayNumber
  const dayGroups = new Map<number, ChecklistItemData[]>()
  for (const item of dayItems) {
    const d = item.dayNumber || 0
    if (!dayGroups.has(d)) dayGroups.set(d, [])
    dayGroups.get(d)!.push(item)
  }
  const sortedDayNumbers = Array.from(dayGroups.keys()).sort((a, b) => a - b)

  const generatedCount = items.filter(i => i.isGenerated).length
  const manualCount = items.filter(i => !i.isGenerated).length

  const handleGenerate = () => {
    const msg = manualCount > 0
      ? `This will refresh ${generatedCount} itinerary items. Your ${manualCount} custom item${manualCount > 1 ? "s" : ""} will be preserved. Continue?`
      : "Generate checklist from the published itinerary?"
    if (!confirm(msg)) return
    startTransition(async () => {
      try {
        await generateChecklistFromItinerary(portalId)
        toast.success("Checklist synced with itinerary")
      } catch { toast.error("Failed to generate") }
    })
  }

  const handleApplyTemplate = (templateId: string) => {
    startTransition(async () => {
      try {
        await applyChecklistTemplate(portalId, templateId)
        toast.success("Template items added")
      } catch { toast.error("Failed to apply") }
    })
  }

  const handleAddItem = () => {
    if (!newTitle.trim()) return
    startTransition(async () => {
      try {
        await createChecklistItem(portalId, { title: newTitle.trim(), category: newCategory })
        setNewTitle("")
        setAddingItem(false)
        toast.success("Reminder added")
      } catch { toast.error("Failed to add") }
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Trip Checklist</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {generatedCount > 0 && <span>{generatedCount} from itinerary</span>}
            {generatedCount > 0 && manualCount > 0 && <span> · </span>}
            {manualCount > 0 && <span>{manualCount} added manually</span>}
            {items.length === 0 && "No items yet"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isPending}>
            <Wand2 className="w-3.5 h-3.5 mr-1" /> {items.length > 0 ? "Sync" : "Generate"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAddingItem(true)} disabled={addingItem}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Reminder
          </Button>
        </div>
      </div>

      {/* Templates */}
      {checklistTemplates.length > 0 && items.length === 0 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs text-gray-500">Quick start:</span>
          {checklistTemplates.map(t => (
            <button key={t.id} onClick={() => handleApplyTemplate(t.id)} disabled={isPending}
              className="text-xs bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-full px-2.5 py-1 transition-colors">
              {t.name}
            </button>
          ))}
        </div>
      )}

      {/* Add manual item form */}
      {addingItem && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-sand-50 rounded-lg border border-sand-200">
          <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Add a reminder..." className="text-sm flex-1 bg-white" autoFocus onKeyDown={e => e.key === "Enter" && handleAddItem()} />
          <Select value={newCategory} onValueChange={setNewCategory}>
            <SelectTrigger className="w-28 text-xs bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PRE_TRIP">Pre-Trip</SelectItem>
              <SelectItem value="DURING_TRIP">During Trip</SelectItem>
              <SelectItem value="POST_TRIP">After Trip</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="navy" onClick={handleAddItem} disabled={isPending || !newTitle.trim()}><Check className="w-3.5 h-3.5" /></Button>
          <Button size="sm" variant="outline" onClick={() => { setAddingItem(false); setNewTitle("") }}><X className="w-3.5 h-3.5" /></Button>
        </div>
      )}

      {/* Items grouped by section */}
      <div className="space-y-4">
        {/* Pre-Trip */}
        {preTripItems.length > 0 && (
          <ChecklistSection icon={Luggage} title="Before Your Trip" items={preTripItems} />
        )}

        {/* Day-by-Day */}
        {sortedDayNumbers.map(dayNum => {
          const dayItemList = dayGroups.get(dayNum)!
          return (
            <ChecklistSection
              key={dayNum}
              icon={Calendar}
              title={dayNum > 0 ? `Day ${dayNum}` : "Trip Items"}
              items={dayItemList}
            />
          )
        })}

        {/* During Trip (not tied to a specific day) */}
        {duringItems.length > 0 && (
          <ChecklistSection icon={MapPin} title="During Trip" items={duringItems} />
        )}

        {/* Post Trip */}
        {postItems.length > 0 && (
          <ChecklistSection icon={Check} title="After Trip" items={postItems} />
        )}
      </div>

      {items.length === 0 && (
        <p className="text-sm text-gray-400 py-6 text-center">
          Click &ldquo;Generate&rdquo; to build the checklist from the published itinerary, or add reminders manually.
        </p>
      )}

      {manualCount > 0 && generatedCount > 0 && (
        <p className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-50">
          Syncing refreshes itinerary items. Your manually added reminders are always preserved.
        </p>
      )}
    </div>
  )
}

// ==================== SECTION GROUP ====================

function ChecklistSection({ icon: Icon, title, items }: {
  icon: any; title: string; items: ChecklistItemData[]
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="w-3.5 h-3.5 text-primary-600" />
        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{title}</span>
        <span className="text-xs text-gray-400">({items.length})</span>
      </div>
      <div className="space-y-1 ml-5">
        {items.map(item => (
          <EditableChecklistItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}

// ==================== EDITABLE ITEM ROW ====================

function EditableChecklistItem({ item }: { item: ChecklistItemData }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(item.title)
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    if (!title.trim() || title === item.title) { setEditing(false); return }
    startTransition(async () => {
      try {
        await updateChecklistItem(item.id, { title: title.trim() })
        setEditing(false)
      } catch { toast.error("Failed to update") }
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      try { await deleteChecklistItem(item.id) } catch { toast.error("Failed to remove") }
    })
  }

  const handleToggleVisibility = () => {
    startTransition(async () => {
      try { await updateChecklistItem(item.id, { isCustomerVisible: !item.isCustomerVisible }) } catch {}
    })
  }

  return (
    <div className={`flex items-center gap-2 py-1.5 px-2 rounded-md group transition-colors ${
      editing ? "bg-primary-50" : "hover:bg-gray-50"
    } ${!item.isCustomerVisible ? "opacity-50" : ""}`}>

      {/* Generated indicator */}
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.isGenerated ? "bg-primary-400" : "bg-gold-400"}`}
        title={item.isGenerated ? "From itinerary" : "Manually added"} />

      {editing ? (
        <Input value={title} onChange={e => setTitle(e.target.value)} className="text-sm flex-1 h-7 bg-white" autoFocus
          onKeyDown={e => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") { setTitle(item.title); setEditing(false) } }} />
      ) : (
        <button onClick={() => setEditing(true)} className="flex-1 text-left min-w-0">
          <span className="text-sm text-gray-700 block truncate">{item.title}</span>
          {item.description && <span className="text-xs text-gray-400 block truncate">{item.description}</span>}
        </button>
      )}

      {editing ? (
        <>
          <button onClick={handleSave} disabled={isPending} className="text-green-600 p-0.5"><Check className="w-3.5 h-3.5" /></button>
          <button onClick={() => { setTitle(item.title); setEditing(false) }} className="text-gray-400 p-0.5"><X className="w-3.5 h-3.5" /></button>
        </>
      ) : (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-primary-600 p-0.5"><Pencil className="w-3 h-3" /></button>
          <button onClick={handleToggleVisibility} className="text-gray-400 hover:text-primary-600 p-0.5">
            {item.isCustomerVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </button>
          <button onClick={handleDelete} disabled={isPending} className="text-gray-400 hover:text-red-600 p-0.5"><Trash2 className="w-3 h-3" /></button>
        </div>
      )}
    </div>
  )
}
