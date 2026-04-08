"use client"

import { useState, useTransition, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ChevronUp, ChevronDown, Trash2, Plus, Wand2,
  GripVertical, Pencil, Check, X, Eye, EyeOff, ListChecks
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

const categoryLabel: Record<string, string> = {
  PRE_TRIP: "Pre-Trip",
  DURING_TRIP: "During",
  DAY_ACTIVITY: "Day",
  POST_TRIP: "Post",
}

export function ChecklistEditor({ portalId, items, checklistTemplates = [] }: Props) {
  const [isPending, startTransition] = useTransition()
  const [addingItem, setAddingItem] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newCategory, setNewCategory] = useState("PRE_TRIP")

  const handleGenerate = () => {
    const hasCustom = items.some(i => !i.isGenerated)
    const msg = hasCustom
      ? "This will refresh auto-generated items. Your custom items will be preserved. Continue?"
      : "Generate checklist from the itinerary?"
    if (!confirm(msg)) return

    startTransition(async () => {
      try {
        await generateChecklistFromItinerary(portalId)
        toast.success("Checklist regenerated — custom items preserved")
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
        toast.success("Item added")
      } catch { toast.error("Failed to add") }
    })
  }

  const handleMove = (idx: number, direction: -1 | 1) => {
    const target = idx + direction
    if (target < 0 || target >= items.length) return
    const reordered = items.map((item, i) => {
      if (i === idx) return { id: item.id, sortOrder: items[target].sortOrder }
      if (i === target) return { id: item.id, sortOrder: items[idx].sortOrder }
      return { id: item.id, sortOrder: item.sortOrder }
    })
    startTransition(async () => {
      try {
        await reorderChecklistItems(reordered)
      } catch { toast.error("Failed to reorder") }
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Trip Checklist <span className="text-gray-400 normal-case font-normal">({items.length} items)</span>
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isPending}>
            <Wand2 className="w-3.5 h-3.5 mr-1" /> {items.length > 0 ? "Regenerate" : "Auto-Generate"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAddingItem(true)} disabled={addingItem}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Item
          </Button>
        </div>
      </div>

      {/* Templates */}
      {checklistTemplates.length > 0 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs text-gray-500">Quick add:</span>
          {checklistTemplates.map(t => (
            <button key={t.id} onClick={() => handleApplyTemplate(t.id)} disabled={isPending}
              className="text-xs bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-full px-2.5 py-1 transition-colors">
              {t.name}
            </button>
          ))}
        </div>
      )}

      {/* Inline add form */}
      {addingItem && (
        <div className="flex items-center gap-2 mb-3 p-3 bg-primary-50 rounded-lg border border-primary-100">
          <Input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="New checklist item..."
            className="text-sm flex-1 bg-white"
            autoFocus
            onKeyDown={e => e.key === "Enter" && handleAddItem()}
          />
          <Select value={newCategory} onValueChange={setNewCategory}>
            <SelectTrigger className="w-28 text-xs bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PRE_TRIP">Pre-Trip</SelectItem>
              <SelectItem value="DAY_ACTIVITY">Day</SelectItem>
              <SelectItem value="DURING_TRIP">During</SelectItem>
              <SelectItem value="POST_TRIP">Post</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="navy" onClick={handleAddItem} disabled={isPending || !newTitle.trim()}>
            <Check className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setAddingItem(false); setNewTitle("") }}>
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {/* Items list */}
      <div className="space-y-1">
        {items.map((item, idx) => (
          <EditableChecklistItem
            key={item.id}
            item={item}
            index={idx}
            total={items.length}
            onMove={handleMove}
          />
        ))}
      </div>

      {items.length === 0 && (
        <p className="text-sm text-gray-400 py-6 text-center">
          No checklist items yet. Click &ldquo;Auto-Generate&rdquo; to create from the itinerary, or add items manually.
        </p>
      )}

      {items.some(i => !i.isGenerated) && items.some(i => i.isGenerated) && (
        <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-50">
          Custom items are preserved when you regenerate. Only auto-generated items refresh.
        </p>
      )}
    </div>
  )
}

// ==================== EDITABLE ITEM ROW ====================

function EditableChecklistItem({ item, index, total, onMove }: {
  item: ChecklistItemData; index: number; total: number;
  onMove: (idx: number, dir: -1 | 1) => void
}) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(item.title)
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    if (!title.trim() || title === item.title) { setEditing(false); return }
    startTransition(async () => {
      try {
        await updateChecklistItem(item.id, { title: title.trim() })
        setEditing(false)
        toast.success("Updated")
      } catch { toast.error("Failed to update") }
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteChecklistItem(item.id)
        toast.success("Removed")
      } catch { toast.error("Failed to remove") }
    })
  }

  const handleToggleVisibility = () => {
    startTransition(async () => {
      try {
        await updateChecklistItem(item.id, { isCustomerVisible: !item.isCustomerVisible })
      } catch { toast.error("Failed to update") }
    })
  }

  return (
    <div className={`flex items-center gap-2 p-2.5 rounded-lg group transition-colors ${
      editing ? "bg-primary-50 border border-primary-100" : "bg-gray-50 hover:bg-gray-100"
    } ${!item.isCustomerVisible ? "opacity-60" : ""}`}>

      {/* Reorder buttons */}
      <div className="flex flex-col shrink-0">
        <button onClick={() => onMove(index, -1)} disabled={index === 0} className="text-gray-300 hover:text-gray-500 disabled:opacity-0 p-0.5">
          <ChevronUp className="w-3 h-3" />
        </button>
        <button onClick={() => onMove(index, 1)} disabled={index === total - 1} className="text-gray-300 hover:text-gray-500 disabled:opacity-0 p-0.5">
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Content */}
      {editing ? (
        <Input
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="text-sm flex-1 h-8 bg-white"
          autoFocus
          onKeyDown={e => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") { setTitle(item.title); setEditing(false) } }}
        />
      ) : (
        <button onClick={() => setEditing(true)} className="flex-1 text-left min-w-0">
          <span className="text-sm text-gray-800 block truncate">
            {item.dayNumber ? `Day ${item.dayNumber}: ` : ""}{item.title}
          </span>
          {item.description && <span className="text-xs text-gray-500 block truncate">{item.description}</span>}
        </button>
      )}

      {/* Category badge */}
      <span className="text-xs bg-gray-200 text-gray-600 rounded px-1.5 py-0.5 shrink-0">
        {categoryLabel[item.category] || item.category}
      </span>

      {/* Generated badge */}
      {item.isGenerated && (
        <span className="text-xs text-gray-400 shrink-0" title="Auto-generated — edits will protect this item from regeneration">auto</span>
      )}

      {/* Action buttons */}
      {editing ? (
        <>
          <button onClick={handleSave} disabled={isPending} className="text-green-600 hover:text-green-700 p-1"><Check className="w-3.5 h-3.5" /></button>
          <button onClick={() => { setTitle(item.title); setEditing(false) }} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-3.5 h-3.5" /></button>
        </>
      ) : (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-primary-600 p-1" title="Edit"><Pencil className="w-3 h-3" /></button>
          <button onClick={handleToggleVisibility} className="text-gray-400 hover:text-primary-600 p-1" title={item.isCustomerVisible ? "Hide from customer" : "Show to customer"}>
            {item.isCustomerVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </button>
          <button onClick={handleDelete} disabled={isPending} className="text-gray-400 hover:text-red-600 p-1" title="Delete"><Trash2 className="w-3 h-3" /></button>
        </div>
      )}
    </div>
  )
}
