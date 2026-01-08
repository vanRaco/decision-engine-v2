"use client"

import type { Vehicle } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { TrendingUp, Clock, AlertTriangle, Zap, DollarSign } from "lucide-react"

interface InventoryStatsBarProps {
  vehicles: Vehicle[]
}

export function InventoryStatsBar({ vehicles }: InventoryStatsBarProps) {
  const activeVehicles = vehicles.filter((v) => v.status !== "sold")

  const totalValue = activeVehicles.reduce((sum, v) => sum + v.recommendedPrice, 0)
  const avgDays = Math.round(activeVehicles.reduce((sum, v) => sum + v.daysInStock, 0) / activeVehicles.length)
  const agingCount = activeVehicles.filter((v) => v.daysInStock > 60).length
  const withOffers = vehicles.filter((v) => v.status === "offer").length
  const exportOpps = activeVehicles.filter((v) => v.exportUplift && v.exportUplift > 500).length

  // Calculate week-over-week change (mock data)
  const weekChange = 3.2
  const isPositive = weekChange > 0

  const stats = [
    {
      label: "Portfolio Value",
      value: `€${(totalValue / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Avg Days in Stock",
      value: avgDays.toString(),
      icon: Clock,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-500/10",
      suffix: "days",
    },
    {
      label: "Aging Stock (60d+)",
      value: agingCount.toString(),
      icon: AlertTriangle,
      iconColor: agingCount > 50 ? "text-red-600" : "text-amber-600",
      bgColor: agingCount > 50 ? "bg-red-500/10" : "bg-amber-500/10",
    },
    {
      label: "Active Offers",
      value: withOffers.toString(),
      icon: TrendingUp,
      iconColor: "text-violet-600",
      bgColor: "bg-violet-500/10",
    },
    {
      label: "Export Opportunities",
      value: exportOpps.toString(),
      icon: Zap,
      iconColor: "text-cyan-600",
      bgColor: "bg-cyan-500/10",
    },
  ]

  return (
    <div className="flex items-center gap-6 border-b bg-muted/30 px-6 py-3">
      {stats.map((stat, index) => (
        <div key={stat.label} className="flex items-center gap-3">
          {index > 0 && <div className="h-8 w-px bg-border" />}
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-md", stat.bgColor)}>
            <stat.icon className={cn("h-4 w-4", stat.iconColor)} />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-semibold tabular-nums">{stat.value}</span>
              {stat.suffix && <span className="text-xs text-muted-foreground">{stat.suffix}</span>}
            </div>
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
