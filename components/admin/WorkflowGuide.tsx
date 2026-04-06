"use client"

import { CheckCircle, Circle, ClipboardList, Map, FileText, Globe, UserPlus } from "lucide-react"

interface Props {
  hasSurvey: boolean
  hasVersions: boolean
  hasProposals: boolean
  hasPortal: boolean
  portalPublished: boolean
  hasCustomerAccount: boolean
}

const steps = [
  { key: "survey", label: "Review Survey", desc: "Check traveler preferences and AI summary", icon: ClipboardList },
  { key: "itinerary", label: "Build Itinerary", desc: "Create a trip version with the visual builder", icon: Map },
  { key: "proposal", label: "Generate Proposal", desc: "Auto-generate a proposal from the itinerary", icon: FileText },
  { key: "portal", label: "Publish Portal", desc: "Make the trip visible to your customer", icon: Globe },
  { key: "account", label: "Create Customer Login", desc: "Grant your customer access to their trip", icon: UserPlus },
]

export function WorkflowGuide({ hasSurvey, hasVersions, hasProposals, hasPortal, portalPublished, hasCustomerAccount }: Props) {
  const completed = [
    hasSurvey,
    hasVersions,
    hasProposals,
    hasPortal && portalPublished,
    hasCustomerAccount,
  ]

  const currentStep = completed.findIndex(c => !c)
  const allDone = completed.every(Boolean)

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Advisor Workflow</h3>
        {allDone && (
          <span className="text-xs bg-green-100 text-green-700 rounded-full px-2.5 py-0.5 font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Complete
          </span>
        )}
      </div>

      <div className="space-y-1">
        {steps.map((step, idx) => {
          const done = completed[idx]
          const isCurrent = idx === currentStep
          const Icon = step.icon

          return (
            <div
              key={step.key}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isCurrent
                  ? "bg-primary-50 border border-primary-200"
                  : done
                  ? "opacity-70"
                  : ""
              }`}
            >
              {done ? (
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
              ) : isCurrent ? (
                <div className="w-5 h-5 rounded-full border-2 border-primary-600 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-primary-600" />
                </div>
              ) : (
                <Circle className="w-5 h-5 text-gray-300 shrink-0" />
              )}
              <Icon className={`w-4 h-4 shrink-0 ${done ? "text-green-500" : isCurrent ? "text-primary-700" : "text-gray-400"}`} />
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${done ? "text-gray-500 line-through" : isCurrent ? "text-primary-800" : "text-gray-600"}`}>
                  {step.label}
                </div>
                {isCurrent && (
                  <p className="text-xs text-primary-600 mt-0.5">{step.desc}</p>
                )}
              </div>
              {done && <span className="text-xs text-green-600">Done</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
