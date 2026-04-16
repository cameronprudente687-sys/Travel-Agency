"use client"

import { CheckCircle } from "lucide-react"

interface Props {
  completed: number
  total: number
  percent: number
}

export function TripProgress({ completed, total, percent }: Props) {
  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-lg mx-auto px-5 py-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-primary-500" /> Trip Progress
          </span>
          <span className="text-xs text-gray-400">{completed}/{total}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-primary-600 to-gold-500 h-2 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
        {percent === 100 && (
          <p className="text-xs text-green-600 font-medium mt-1.5 text-center">All set for your trip!</p>
        )}
      </div>
    </div>
  )
}
