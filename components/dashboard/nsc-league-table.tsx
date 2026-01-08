"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
} from "lucide-react"
import { countries, type NSCPerformance } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface NSCLeagueTableProps {
  data: NSCPerformance[]
  onDrillDown?: (nsc: NSCPerformance) => void
}

type SortField = "rpi" | "daysToSell" | "adherence" | "volume" | "arbitrage"

export function NSCLeagueTable({ data, onDrillDown }: NSCLeagueTableProps) {
  const [sortField, setSortField] = useState<SortField>("rpi")
  const [sortDesc, setSortDesc] = useState(true)

  const sortedData = [...data].sort((a, b) => {
    let aVal: number, bVal: number
    switch (sortField) {
      case "rpi":
        aVal = a.rpiActual
        bVal = b.rpiActual
        break
      case "daysToSell":
        aVal = b.daysToSellActual // Invert for days - lower is better
        bVal = a.daysToSellActual
        break
      case "adherence":
        aVal = a.playbookAdherence
        bVal = b.playbookAdherence
        break
      case "volume":
        aVal = a.volumeActual / a.volumeTarget
        bVal = b.volumeActual / b.volumeTarget
        break
      case "arbitrage":
        aVal = a.arbitrageCaptured - a.arbitrageMissed
        bVal = b.arbitrageCaptured - b.arbitrageMissed
        break
      default:
        aVal = a.rpiActual
        bVal = b.rpiActual
    }
    return sortDesc ? bVal - aVal : aVal - bVal
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDesc(!sortDesc)
    } else {
      setSortField(field)
      setSortDesc(true)
    }
  }

  const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
    if (trend === "up") return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
    if (trend === "down") return <TrendingDown className="h-3.5 w-3.5 text-red-500" />
    return <Minus className="h-3.5 w-3.5 text-slate-400" />
  }

  const getRpiStatus = (actual: number, target: number) => {
    const delta = actual - target
    if (delta >= 1) return { color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 }
    if (delta >= -1) return { color: "text-amber-600", bg: "bg-amber-50", icon: AlertTriangle }
    return { color: "text-red-600", bg: "bg-red-50", icon: XCircle }
  }

  const getAdherenceColor = (value: number) => {
    if (value >= 85) return "text-emerald-600"
    if (value >= 70) return "text-amber-600"
    return "text-red-600"
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">NSC Performance League</CardTitle>
            <CardDescription>Click any row to drill down to VIN-level details</CardDescription>
          </div>
          <div className="flex gap-1">
            {(["rpi", "daysToSell", "adherence", "arbitrage"] as SortField[]).map((field) => (
              <Button
                key={field}
                variant={sortField === field ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleSort(field)}
              >
                {field === "rpi" && "RPI"}
                {field === "daysToSell" && "DTS"}
                {field === "adherence" && "Adherence"}
                {field === "arbitrage" && "Arbitrage"}
                {sortField === field && <ArrowUpDown className="ml-1 h-3 w-3" />}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left py-2 px-4 font-medium text-muted-foreground">#</th>
                <th className="text-left py-2 px-4 font-medium text-muted-foreground">NSC</th>
                <th className="text-right py-2 px-4 font-medium text-muted-foreground">RPI</th>
                <th className="text-right py-2 px-4 font-medium text-muted-foreground">Days to Sell</th>
                <th className="text-right py-2 px-4 font-medium text-muted-foreground">Volume</th>
                <th className="text-right py-2 px-4 font-medium text-muted-foreground">Adherence</th>
                <th className="text-right py-2 px-4 font-medium text-muted-foreground">Net Arbitrage</th>
                <th className="text-center py-2 px-4 font-medium text-muted-foreground">Risk</th>
                <th className="py-2 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((nsc, index) => {
                const rpiStatus = getRpiStatus(nsc.rpiActual, nsc.rpiTarget)
                const volumePct = Math.round((nsc.volumeActual / nsc.volumeTarget) * 100)
                const netArbitrage = nsc.arbitrageCaptured - nsc.arbitrageMissed

                return (
                  <tr
                    key={nsc.country}
                    className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => onDrillDown?.(nsc)}
                  >
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold",
                          index === 0 && "bg-amber-100 text-amber-700",
                          index === 1 && "bg-slate-100 text-slate-600",
                          index === 2 && "bg-orange-100 text-orange-700",
                          index > 2 && "bg-muted text-muted-foreground",
                        )}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{countries[nsc.country].flag}</span>
                        <div>
                          <p className="font-medium">{nsc.nscName}</p>
                          <p className="text-xs text-muted-foreground">{countries[nsc.country].name}</p>
                        </div>
                        <TrendIcon trend={nsc.trend} />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded", rpiStatus.bg)}>
                              <rpiStatus.icon className={cn("h-3.5 w-3.5", rpiStatus.color)} />
                              <span className={cn("font-semibold", rpiStatus.color)}>{nsc.rpiActual.toFixed(1)}%</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Target: {nsc.rpiTarget}%</p>
                            <p>Delta: {(nsc.rpiActual - nsc.rpiTarget).toFixed(1)} pts</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={cn(
                          "font-medium",
                          nsc.daysToSellActual <= nsc.daysToSellTarget ? "text-emerald-600" : "text-red-600",
                        )}
                      >
                        {nsc.daysToSellActual}d
                      </span>
                      <span className="text-muted-foreground text-xs ml-1">/ {nsc.daysToSellTarget}d</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              volumePct >= 90 ? "bg-emerald-500" : volumePct >= 75 ? "bg-amber-500" : "bg-red-500",
                            )}
                            style={{ width: `${Math.min(volumePct, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium w-10">{volumePct}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={cn("font-semibold", getAdherenceColor(nsc.playbookAdherence))}>
                        {nsc.playbookAdherence}%
                      </span>
                      <span className="text-muted-foreground text-xs ml-1">({nsc.overrideRate}% override)</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={cn("font-semibold", netArbitrage > 0 ? "text-emerald-600" : "text-red-600")}>
                        {netArbitrage > 0 ? "+" : ""}€{(netArbitrage / 1000).toFixed(0)}k
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={
                          nsc.compressionIndex > 65
                            ? "destructive"
                            : nsc.compressionIndex > 45
                              ? "outline"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {nsc.compressionIndex > 65 ? "High" : nsc.compressionIndex > 45 ? "Med" : "Low"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
