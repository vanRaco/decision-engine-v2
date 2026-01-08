"use client"

import { cn } from "@/lib/utils"
import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
  }
  status?: "success" | "warning" | "danger" | "neutral"
  className?: string
  onClick?: () => void
}

const statusColors = {
  success: "border-l-emerald-500",
  warning: "border-l-amber-500",
  danger: "border-l-red-500",
  neutral: "border-l-slate-300",
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  status = "neutral",
  className,
  onClick,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 border-l-4",
        statusColors[status],
        onClick && "cursor-pointer hover:bg-accent/50 transition-colors",
        className,
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tabular-nums">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="rounded-lg bg-muted p-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>
      {trend && (
        <div
          className={cn(
            "flex items-center gap-1 mt-3 text-xs font-medium",
            trend.value >= 0 ? "text-emerald-600" : "text-red-600",
          )}
        >
          {trend.value >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          <span>
            {trend.value >= 0 ? "+" : ""}
            {trend.value}%
          </span>
          <span className="text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </div>
  )
}
