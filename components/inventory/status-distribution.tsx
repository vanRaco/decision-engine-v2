"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Vehicle, VehicleStatus } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface StatusDistributionProps {
  vehicles: Vehicle[]
  onStatusClick: (status: VehicleStatus | "all") => void
  activeStatus: VehicleStatus | "all"
}

const statusConfig: Record<VehicleStatus, { label: string; color: string; bgColor: string }> = {
  intake: { label: "Intake", color: "bg-slate-500", bgColor: "bg-slate-100" },
  recon: { label: "Recon", color: "bg-orange-500", bgColor: "bg-orange-100" },
  ready: { label: "Ready", color: "bg-blue-500", bgColor: "bg-blue-100" },
  listed: { label: "Listed", color: "bg-emerald-500", bgColor: "bg-emerald-100" },
  offer: { label: "In Offer", color: "bg-violet-500", bgColor: "bg-violet-100" },
  sold: { label: "Sold", color: "bg-gray-400", bgColor: "bg-gray-100" },
}

export function StatusDistribution({ vehicles, onStatusClick, activeStatus }: StatusDistributionProps) {
  const statusCounts = (Object.keys(statusConfig) as VehicleStatus[]).reduce(
    (acc, status) => {
      acc[status] = vehicles.filter((v) => v.status === status).length
      return acc
    },
    {} as Record<VehicleStatus, number>,
  )

  const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0)

  // Filter out sold for the pipeline view
  const pipelineStatuses = (Object.keys(statusConfig) as VehicleStatus[]).filter((s) => s !== "sold")

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Stock Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Visual pipeline bar */}
        <div className="flex h-3 w-full overflow-hidden rounded-full mb-4">
          {pipelineStatuses.map((status) => {
            const count = statusCounts[status]
            const percentage = (count / total) * 100
            if (percentage === 0) return null
            return (
              <div
                key={status}
                className={cn(statusConfig[status].color, "transition-all")}
                style={{ width: `${percentage}%` }}
                title={`${statusConfig[status].label}: ${count}`}
              />
            )
          })}
        </div>

        {/* Status buttons */}
        <div className="grid grid-cols-3 gap-2">
          {pipelineStatuses.map((status) => (
            <button
              key={status}
              onClick={() => onStatusClick(activeStatus === status ? "all" : status)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg p-2 transition-colors",
                activeStatus === status
                  ? cn(
                      statusConfig[status].bgColor,
                      "ring-2 ring-offset-1",
                      `ring-${statusConfig[status].color.replace("bg-", "")}`,
                    )
                  : "hover:bg-muted",
              )}
            >
              <div className={cn("h-2 w-2 rounded-full", statusConfig[status].color)} />
              <span className="text-lg font-semibold">{statusCounts[status]}</span>
              <span className="text-xs text-muted-foreground">{statusConfig[status].label}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
