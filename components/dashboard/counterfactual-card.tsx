"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, AlertTriangle } from "lucide-react"
import type { CounterfactualMetrics } from "@/lib/mock-data"

interface CounterfactualCardProps {
  data: CounterfactualMetrics
}

export function CounterfactualCard({ data }: CounterfactualCardProps) {
  const rpiDelta = data.projectedRpiIfFollowed - data.actualRpi
  const daysDelta = data.actualDaysToSell - data.projectedDaysIfFollowed

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/30">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <CardTitle className="text-base text-amber-900">Counterfactual Analysis</CardTitle>
        </div>
        <CardDescription className="text-amber-700">
          If DE recommendations were followed across all markets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* RPI Comparison */}
        <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">RPI Impact</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-700">{data.actualRpi.toFixed(1)}%</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold text-emerald-600">{data.projectedRpiIfFollowed.toFixed(1)}%</span>
            </div>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">+{rpiDelta.toFixed(1)} pts</Badge>
        </div>

        {/* Days to Sell Comparison */}
        <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Days to Sell</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-700">{data.actualDaysToSell}d</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold text-emerald-600">{data.projectedDaysIfFollowed}d</span>
            </div>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">-{daysDelta} days</Badge>
        </div>

        {/* Margin Leakage */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-900">Margin Leakage</p>
              <p className="text-xs text-muted-foreground">
                {data.vehiclesAffected.toLocaleString()} vehicles affected
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-red-600">€{(data.marginLeakage / 1000).toFixed(0)}k</p>
              <p className="text-xs text-muted-foreground">recoverable value</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
