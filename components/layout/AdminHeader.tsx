"use client"

import { useSession } from "next-auth/react"
import { getInitials } from "@/lib/utils"

interface AdminHeaderProps {
  title: string
  subtitle?: string
}

export function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const { data: session } = useSession()
  const name = session?.user?.name || "Advisor"

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-700 rounded-full flex items-center justify-center text-white text-xs font-semibold">
            {getInitials(name)}
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-medium text-gray-900">{name}</div>
            <div className="text-xs text-gray-500">{session?.user?.email}</div>
          </div>
      </div>
    </header>
  )
}
