"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ChevronUp, ChevronDown, Trash2, Plus, Wand2,
  Pencil, Check, X, Eye, EyeOff, Luggage, MapPin, Calendar, ArrowRight
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

// Build section options from existing items
function getSectionOptions(items: ChecklistItemData[]) {
  const dayNums = Array.from(new Set(items.filter(i => i.category === "DAY_ACTIVITY" && i.dayNumber).map(i => i.dayNumber!)))
  dayNums.sort((a, b) => a - b)

  const options = [
    { value: "PRE_TRIP", label: "Before Trip" },
    ...dayNums.map(d => ({ value: `DAY_${d}`, label: `Day ${d}` })),
    { value: "DURING_TRIP", label: "During Trip" },
    { value: "POST_TRIP", label: "After Trip" },
  ]

  // Add some day options even if they don't exist yet
  if (dayNums.length === 0) {
    for (let i = 1; i <= 3; i++) options.splice(i, 0, { value: `DAY_${i}`, label: `Day ${i}` })
  }

  return options
}

function parseSectionValue(val: string): { category: string; dayNumber: number | null } {
  if (val.startsWith("DAY_")) return { category: "DAY_ACTIVITY", dayNumber: parseInt(val.slice(4)) }
  return { category: val, dayNumber: null }
}

function toSectionValue(item: ChecklistItemData): string {
  if (item.category === "DAY_ACTIVITY" && item.dayNumber) return `DAY_${item.dayNumber}`
  return item.category
}

export function ChecklistEditor({ portalId, items, checklistTemplates = [] }: Props) {
  const [isPending, startTransition] = useTransition()
  const [addingItem, setAddingItem] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newSection, setNewSection] = useState("PRE_TRIP")

  // Group items by section
  const preTripItems = items.filter(i => i.category === "PRE_TRIP")
  const duringItems = items.filter(i => i.category === "DURING_TRIP")
  const postItems = items.filter(i => i.category === "POST_TRIP")
  const dayItems = items.filter(i => i.category === "DAY_ACTIVITY")

  const dayGroups = new Map<number, ChecklistItemData[]>()
  for (const item of dayItems) {
    const d = item.dayNumber || 0
    if (!dayGroups.has(d)) dayGroups.set(d, [])
    dayGroups.get(d)!.push(item)
  }
  const sortedDayNumbers = Array.from(dayGroups.keys()).sort((a, b) => a - b)

  const generatedCount = items.filter(i => i.isGenerated).length
  const manualCount = items.filter(i => !i.isGenerated).length
  const sectionOptions = getSectionOptions(items)

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

  const handleAddItem = () => {
    if (!newTitle.trim()) return
    const { category, dayNumber } = parseSectionValue(newSection)
    startTransition(async () => {
      try {
        await createChecklistItem(portalId, { title: newTitle.trim(), category, dayNumber: dayNumber || undefined })
        setNewTitle("")
        setAddingItem(false)
        toast.success("Reminder added")
      } catch { toast.error("Failed to add") }
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
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
            <button key={t.id} onClick={() => { startTransition(async () => { try { await applyChecklistTemplate(portalId, t.id); toast.success("Applied") } catch {} }) }} disabled={isPending}
              className="text-xs bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-full px-2.5 py-1 transition-colors">
              {t.name}
            </button>
          ))}
        </div>
      )}

      {/* Add item form — with section picker */}
      {addingItem && (
        <div className="mb-4 p-3 bg-sand-50 rounded-lg border border-sand-200 space-y-2">
          <div className="flex items-center gap-2">
            <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Add a reminder..." className="text-sm flex-1 bg-white" autoFocus onKeyDown={e => e.key === "Enter" && handleAddItem()} />
            <Button size="sm" variant="navy" onClick={handleAddItem} disabled={isPending || !newTitle.trim()}><Check className="w-3.5 h-3.5" /></Button>
            <Button size="sm" variant="outline" onClick={() => { setAddingItem(false); setNewTitle("") }}><X className="w-3.5 h-3.5" /></Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Add to:</span>
            <Select value={newSection} onValueChange={setNewSection}>
              <SelectTrigger className="w-36 h-7 text-xs bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {sectionOptions.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Items grouped by section */}
      <div className="space-y-4">
        {preTripItems.length > 0 && (
          <ChecklistSection icon={Luggage} title="Before Your Trip" items={preTripItems} allSections={sectionOptions} />
        )}
        {sortedDayNumbers.map(dayNum => (
          <ChecklistSection key={dayNum} icon={Calendar} title={dayNum > 0 ? `Day ${dayNum}` : "Trip Items"} items={dayGroups.get(dayNum)!} allSections={sectionOptions} />
        ))}
        {duringItems.length > 0 && (
          <ChecklistSection icon={MapPin} title="During Trip" items={duringItems} allSections={sectionOptions} />
        )}
        {postItems.length > 0 && (
          <ChecklistSection icon={Check} title="After Trip" items={postItems} allSections={sectionOptions} />
        )}
      </div>

      {items.length === 0 && (
        <p className="text-sm text-gray-400 py-6 text-center">
          Click &ldquo;Generate&rdquo; to build from the itinerary, or add reminders manually.
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

// ==================== SECTION ====================

function ChecklistSection({ icon: Icon, title, items, allSections }: {
  icon: any; title: string; items: ChecklistItemData[]; allSections: { value: string; label: string }[]
}) {
  const [isPending, startTransition] = useTransition()

  const handleReorder = (idx: number, dir: -1 | 1) => {
    const target = idx + dir
    if (target < 0 || target >= items.length) return
    const reordered = items.map((item, i) => {
      if (i === idx) return { id: item.id, sortOrder: items[target].sortOrder }
      if (i === target) return { id: item.id, sortOrder: items[idx].sortOrder }
      return { id: item.id, sortOrder: item.sortOrder }
    })
    startTransition(async () => {
      try { await reorderChecklistItems(reordered) } catch {}
    })
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="w-3.5 h-3.5 text-primary-600" />
        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{title}</span>
        <span className="text-xs text-gray-400">({items.length})</span>
      </div>
      <div className="space-y-1 ml-5">
        {items.map((item, idx) => (
          <EditableChecklistItem key={item.id} item={item} index={idx} total={items.length} onReorder={handleReorder} allSections={allSections} />
        ))}
      </div>
    </div>
  )
}

// ==================== EDITABLE ITEM ====================

function EditableChecklistItem({ item, index, total, onReorder, allSections }: {
  item: ChecklistItemData; index: number; total: number;
  onReorder: (idx: number, dir: -1 | 1) => void;
  allSections: { value: string; label: string }[]
}) {
  const [editing, setEditing] = useState(false)
  const [moving, setMoving] = useState(false)
  const [title, setTitle] = useState(item.title)
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    if (!title.trim() || title === item.title) { setEditing(false); return }
    startTransition(async () => {
      try { await updateChecklistItem(item.id, { title: title.trim() }); setEditing(false) } catch { toast.error("Failed") }
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      try { await deleteChecklistItem(item.id) } catch { toast.error("Failed") }
    })
  }

  const handleToggleVisibility = () => {
    startTransition(async () => {
      try { await updateChecklistItem(item.id, { isCustomerVisible: !item.isCustomerVisible }) } catch {}
    })
  }

  const handleMoveToSection = (sectionValue: string) => {
    const { category, dayNumber } = parseSectionValue(sectionValue)
    startTransition(async () => {
      try {
        await updateChecklistItem(item.id, { category, dayNumber: dayNumber || undefined })
        setMoving(false)
        toast.success("Moved")
      } catch { toast.error("Failed to move") }
    })
  }

  return (
    <div className={`rounded-md group transition-colors ${editing ? "bg-primary-50 p-2" : "hover:bg-gray-50 py-1.5 px-2"} ${!item.isCustomerVisible ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-1">
        {/* Reorder */}
        <div className="flex flex-col shrink-0">
          <button onClick={() => onReorder(index, -1)} disabled={index === 0} className="text-gray-300 hover:text-gray-500 disabled:opacity-0 p-0.5"><ChevronUp className="w-3 h-3" /></button>
          <button onClick={() => onReorder(index, 1)} disabled={index === total - 1} className="text-gray-300 hover:text-gray-500 disabled:opacity-0 p-0.5"><ChevronDown className="w-3 h-3" /></button>
        </div>

        {/* Dot */}
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.isGenerated ? "bg-primary-400" : "bg-gold-400"}`} />

        {/* Content */}
        {editing ? (
          <Input value={title} onChange={e => setTitle(e.target.value)} className="text-sm flex-1 h-7 bg-white" autoFocus
            onKeyDown={e => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") { setTitle(item.title); setEditing(false) } }} />
        ) : (
          <button onClick={() => setEditing(true)} className="flex-1 text-left min-w-0">
            <span className="text-sm text-gray-700 block truncate">{item.title}</span>
            {item.description && <span className="text-xs text-gray-400 block truncate">{item.description}</span>}
          </button>
        )}

        {/* Actions */}
        {editing ? (
          <>
            <button onClick={handleSave} disabled={isPending} className="text-green-600 p-0.5"><Check className="w-3.5 h-3.5" /></button>
            <button onClick={() => { setTitle(item.title); setEditing(false) }} className="text-gray-400 p-0.5"><X className="w-3.5 h-3.5" /></button>
          </>
        ) : (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-primary-600 p-0.5" title="Edit"><Pencil className="w-3 h-3" /></button>
            <button onClick={() => setMoving(!moving)} className="text-gray-400 hover:text-primary-600 p-0.5" title="Move to section"><ArrowRight className="w-3 h-3" /></button>
            <button onClick={handleToggleVisibility} className="text-gray-400 hover:text-primary-600 p-0.5">
              {item.isCustomerVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </button>
            <button onClick={handleDelete} disabled={isPending} className="text-gray-400 hover:text-red-600 p-0.5"><Trash2 className="w-3 h-3" /></button>
          </div>
        )}
      </div>

      {/* Move to section dropdown */}
      {moving && (
        <div className="flex items-center gap-2 mt-1.5 ml-7">
          <span className="text-xs text-gray-500">Move to:</span>
          <div className="flex flex-wrap gap-1">
            {allSections.filter(s => s.value !== toSectionValue(item)).map(s => (
              <button key={s.value} onClick={() => handleMoveToSection(s.value)} disabled={isPending}
                className="text-xs bg-primary-50 text-primary-700 hover:bg-primary-100 rounded px-2 py-0.5 transition-colors">
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
