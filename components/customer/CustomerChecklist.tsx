"use client"

import { useState, useTransition } from "react"
import { toggleChecklistCompletion } from "@/actions/checklist"
import { CheckCircle, Circle, Plane, MapPin, Luggage, Flag } from "lucide-react"
import { toast } from "sonner"

interface ChecklistItemWithCompletion {
  id: string
  title: string
  description: string | null
  category: string
  dayNumber: number | null
  completions: { completed: boolean }[]
}

interface Props {
  userId: string
  preTripItems: ChecklistItemWithCompletion[]
  dayItems: ChecklistItemWithCompletion[]
  duringItems: ChecklistItemWithCompletion[]
  postItems: ChecklistItemWithCompletion[]
  completedCount: number
  totalCount: number
}

function ChecklistSection({
  title,
  icon: Icon,
  items,
  userId,
}: {
  title: string
  icon: any
  items: ChecklistItemWithCompletion[]
  userId: string
}) {
  if (items.length === 0) return null

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-primary-900">{title}</h3>
        <span className="text-xs bg-primary-100 text-primary-700 rounded-full px-2 py-0.5 ml-1">
          {items.filter(i => i.completions.length > 0 && i.completions[0].completed).length}/{items.length}
        </span>
      </div>
      <div className="space-y-2">
        {items.map(item => (
          <ChecklistRow key={item.id} item={item} userId={userId} />
        ))}
      </div>
    </div>
  )
}

function ChecklistRow({ item, userId }: { item: ChecklistItemWithCompletion; userId: string }) {
  const isCompleted = item.completions.length > 0 && item.completions[0].completed
  const [checked, setChecked] = useState(isCompleted)
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    const newVal = !checked
    setChecked(newVal)
    startTransition(async () => {
      try {
        await toggleChecklistCompletion(item.id, userId, newVal)
        if (newVal) toast.success(`Checked off: ${item.title}`)
      } catch {
        setChecked(!newVal)
        toast.error("Failed to update")
      }
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
        checked
          ? "bg-green-50 border-green-200"
          : "bg-white border-gray-100 hover:border-primary-200 hover:bg-primary-50/30"
      } ${isPending ? "opacity-60" : ""}`}
    >
      {checked ? (
        <CheckCircle className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
      ) : (
        <Circle className="w-6 h-6 text-gray-300 shrink-0 mt-0.5" />
      )}
      <div className="flex-1 min-w-0">
        <div className={`font-medium text-base ${checked ? "text-green-700 line-through" : "text-gray-800"}`}>
          {item.dayNumber ? `Day ${item.dayNumber}: ` : ""}{item.title}
        </div>
        {item.description && (
          <p className={`text-sm mt-0.5 ${checked ? "text-green-600" : "text-gray-500"}`}>
            {item.description}
          </p>
        )}
      </div>
    </button>
  )
}

export function CustomerChecklist({ userId, preTripItems, dayItems, duringItems, postItems, completedCount, totalCount }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-serif font-bold text-primary-900">Your Trip Checklist</h3>
        <span className="text-sm text-gray-500">{completedCount} of {totalCount} complete</span>
      </div>

      <ChecklistSection title="Before Your Trip" icon={Luggage} items={preTripItems} userId={userId} />
      <ChecklistSection title="Day-by-Day" icon={MapPin} items={dayItems} userId={userId} />
      <ChecklistSection title="During Your Trip" icon={Plane} items={duringItems} userId={userId} />
      <ChecklistSection title="After Your Trip" icon={Flag} items={postItems} userId={userId} />

      {totalCount === 0 && (
        <div className="text-center py-12 text-gray-400">
          <CheckCircle className="w-8 h-8 mx-auto mb-3" />
          <p>Your travel checklist is being prepared by your advisor.</p>
        </div>
      )}
    </div>
  )
}
