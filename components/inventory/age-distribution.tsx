"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Vehicle } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface AgeDistributionProps {
  vehicles: Vehicle[]
  onBucketClick: (bucket: string) => void
  activeBucket: string
}

const ageBuckets = [
  { key: "0-30", label: "0-30d", color: "bg-emerald-500", range: [0, 30] },
  { key: "31-60", label: "31-60d", color: "bg-yellow-500", range: [31, 60] },
  { key: "61-90", label: "61-90d", color: "bg-amber-500", range: [61, 90] },
  { key: "90+", label: "90d+", color: "bg-red-500", range: [91, Number.POSITIVE_INFINITY] },
]

export function AgeDistribution({ vehicles, onBucketClick, activeBucket }: AgeDistributionProps) {
  const activeVehicles = vehicles.filter((v) => v.status !== "sold")

  const bucketCounts = ageBuckets.map((bucket) => ({
    ...bucket,
    count: activeVehicles.filter((v) => v.daysInStock >= bucket.range[0] && v.daysInStock <= bucket.range[1]).length,
  }))

  const maxCount = Math.max(...bucketCounts.map((b) => b.count), 1)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Age Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {bucketCounts.map((bucket) => (
            <button
              key={bucket.key}
              onClick={() => onBucketClick(activeBucket === bucket.key ? "all" : bucket.key)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg p-2 transition-colors text-left",
                activeBucket === bucket.key ? "bg-muted ring-1 ring-primary" : "hover:bg-muted/50",
              )}
            >
              <span className="w-14 text-xs text-muted-foreground">{bucket.label}</span>
              <div className="flex-1 h-5 bg-muted rounded overflow-hidden">
                <div
                  className={cn(bucket.color, "h-full transition-all")}
                  style={{ width: `${(bucket.count / maxCount) * 100}%` }}
                />
              </div>
              <span
                className={cn(
                  "w-10 text-right text-sm font-medium",
                  bucket.key === "90+" && bucket.count > 0 && "text-red-600",
                )}
              >
                {bucket.count}
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
