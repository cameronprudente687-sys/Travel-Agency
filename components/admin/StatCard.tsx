import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: { value: number; label: string }
  color?: "navy" | "gold" | "green" | "amber" | "rose" | "info"
  className?: string
}

const colorMap = {
  navy: { bg: "bg-primary-50", icon: "bg-primary-700 text-white", text: "text-primary-700" },
  gold: { bg: "bg-gold-50", icon: "bg-gold-500 text-white", text: "text-gold-700" },
  green: { bg: "bg-green-50", icon: "bg-green-600 text-white", text: "text-green-700" },
  amber: { bg: "bg-amber-50", icon: "bg-amber-500 text-white", text: "text-amber-700" },
  rose: { bg: "bg-rose-50", icon: "bg-rose-500 text-white", text: "text-rose-700" },
  info: { bg: "bg-blue-50", icon: "bg-blue-600 text-white", text: "text-blue-700" },
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, color = "navy", className }: StatCardProps) {
  const colors = colorMap[color]

  return (
    <div className={cn("bg-white rounded-xl border border-gray-100 p-5 shadow-sm", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={cn("text-3xl font-bold mt-1", colors.text)}>{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", colors.icon)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className={cn(
            "text-xs font-medium",
            trend.value > 0 ? "text-green-600" : trend.value < 0 ? "text-red-500" : "text-gray-500"
          )}>
            {trend.value > 0 ? "↑" : trend.value < 0 ? "↓" : "→"} {Math.abs(trend.value)}% {trend.label}
          </span>
        </div>
      )}
    </div>
  )
}
