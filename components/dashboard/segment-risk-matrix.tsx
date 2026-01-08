"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, Zap, Fuel, Leaf } from "lucide-react"
import type { SegmentPerformance } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface SegmentRiskMatrixProps {
  data: SegmentPerformance[]
}

export function SegmentRiskMatrix({ data }: SegmentRiskMatrixProps) {
  const FuelIcon = ({ type }: { type: SegmentPerformance["fuelType"] }) => {
    if (type === "electric") return <Zap className="h-3.5 w-3.5 text-blue-500" />
    if (type === "hybrid") return <Leaf className="h-3.5 w-3.5 text-emerald-500" />
    return <Fuel className="h-3.5 w-3.5 text-slate-500" />
  }

  const TrendIcon = ({ trend }: { trend: SegmentPerformance["trend"] }) => {
    if (trend === "up") return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
    if (trend === "down") return <TrendingDown className="h-3.5 w-3.5 text-red-500" />
    return <Minus className="h-3.5 w-3.5 text-slate-400" />
  }

  // Sort by risk level and volume gap
  const sortedData = [...data].sort((a, b) => {
    const riskOrder = { high: 0, medium: 1, low: 2 }
    if (riskOrder[a.riskLevel] !== riskOrder[b.riskLevel]) {
      return riskOrder[a.riskLevel] - riskOrder[b.riskLevel]
    }
    return a.volumeActual / a.volumeTarget - b.volumeActual / b.volumeTarget
  })

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Segment Risk Matrix</CardTitle>
        <CardDescription>Performance by vehicle segment and fuel type</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sortedData.map((segment) => {
            const volumePct = Math.round((segment.volumeActual / segment.volumeTarget) * 100)

            return (
              <div
                key={segment.segment}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  segment.riskLevel === "high" && "bg-red-50/50 border-red-100",
                  segment.riskLevel === "medium" && "bg-amber-50/50 border-amber-100",
                  segment.riskLevel === "low" && "bg-slate-50/50 border-slate-100",
                )}
              >
                <div className="flex items-center gap-3">
                  <FuelIcon type={segment.fuelType} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{segment.segment}</p>
                      <TrendIcon trend={segment.trend} />
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">{segment.fuelType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">RPI</p>
                    <p
                      className={cn(
                        "font-semibold",
                        segment.rpi >= 94 ? "text-emerald-600" : segment.rpi >= 92 ? "text-amber-600" : "text-red-600",
                      )}
                    >
                      {segment.rpi.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">DTS</p>
                    <p
                      className={cn(
                        "font-semibold",
                        segment.daysToSell <= 25
                          ? "text-emerald-600"
                          : segment.daysToSell <= 35
                            ? "text-amber-600"
                            : "text-red-600",
                      )}
                    >
                      {segment.daysToSell}d
                    </p>
                  </div>
                  <div className="text-right min-w-[60px]">
                    <p className="text-xs text-muted-foreground">Volume</p>
                    <p className="font-semibold">{volumePct}%</p>
                  </div>
                  <Badge
                    variant={
                      segment.riskLevel === "high"
                        ? "destructive"
                        : segment.riskLevel === "medium"
                          ? "outline"
                          : "secondary"
                    }
                    className="w-14 justify-center"
                  >
                    {segment.riskLevel === "high" ? "High" : segment.riskLevel === "medium" ? "Med" : "Low"}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
