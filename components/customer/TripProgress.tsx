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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-medium text-gray-700">Trip Progress</span>
          </div>
          <span className="text-sm text-gray-500">{completed} of {total} items complete</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className="bg-gradient-to-r from-primary-600 to-gold-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        {percent === 100 && (
          <p className="text-sm text-green-600 font-medium mt-2 text-center">
            All items complete! You&apos;re all set for your trip.
          </p>
        )}
      </div>
    </div>
  )
}
