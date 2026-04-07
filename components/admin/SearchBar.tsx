"use client"

import { useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"

interface Props {
  basePath: string
  placeholder?: string
  paramName?: string
  preserveParams?: string[]
}

export function SearchBar({ basePath, placeholder = "Search...", paramName = "q", preserveParams = [] }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get(paramName) || "")

  const updateSearch = useCallback((newValue: string) => {
    const params = new URLSearchParams()
    // Preserve other params (like tab, status)
    for (const key of preserveParams) {
      const existing = searchParams.get(key)
      if (existing) params.set(key, existing)
    }
    if (newValue.trim()) params.set(paramName, newValue.trim())
    const qs = params.toString()
    router.push(qs ? `${basePath}?${qs}` : basePath)
  }, [router, basePath, paramName, searchParams, preserveParams])

  const handleChange = (newValue: string) => {
    setValue(newValue)
    clearTimeout((window as any).__searchTimeout)
    ;(window as any).__searchTimeout = setTimeout(() => updateSearch(newValue), 300)
  }

  const handleClear = () => {
    setValue("")
    updateSearch("")
  }

  return (
    <div className="relative flex-1 max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <Input
        value={value}
        onChange={e => handleChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-8 h-10 text-base"
      />
      {value && (
        <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
