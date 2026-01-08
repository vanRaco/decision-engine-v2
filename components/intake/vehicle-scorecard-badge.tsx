"use client"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Flame, Thermometer, Snowflake, AlertTriangle, Zap, Clock, Car, FileWarning } from "lucide-react"
import type { VehicleScorecard, RiskFlag } from "@/lib/mock-data"

interface VehicleScorecardBadgeProps {
  scorecard: VehicleScorecard
  showDetails?: boolean
}

const demandIcons = {
  hot: Flame,
  warm: Thermometer,
  cool: Snowflake,
  cold: Snowflake,
}

const demandColors = {
  hot: "bg-rose-100 text-rose-700 border-rose-200",
  warm: "bg-amber-100 text-amber-700 border-amber-200",
  cool: "bg-sky-100 text-sky-700 border-sky-200",
  cold: "bg-slate-100 text-slate-600 border-slate-200",
}

const liquidityColors = {
  fast: "bg-emerald-100 text-emerald-700 border-emerald-200",
  normal: "bg-blue-100 text-blue-700 border-blue-200",
  slow: "bg-amber-100 text-amber-700 border-amber-200",
  stale: "bg-red-100 text-red-700 border-red-200",
}

const riskIcons: Record<RiskFlag["type"], typeof AlertTriangle> = {
  "ev-volatility": Zap,
  "odd-spec": Car,
  "high-mileage": Clock,
  "missing-history": FileWarning,
  "brand-sensitive": AlertTriangle,
  aging: Clock,
  recall: AlertTriangle,
}

export function VehicleScorecardBadge({ scorecard, showDetails = false }: VehicleScorecardBadgeProps) {
  const DemandIcon = demandIcons[scorecard.demandSignal]

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1.5">
        {/* Desirability score */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-sm font-medium">
              <span>{scorecard.desirability}</span>
              <span className="text-muted-foreground text-xs">/100</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">Desirability Score</p>
            <p className="text-xs text-muted-foreground">Based on spec, demand, and market position</p>
          </TooltipContent>
        </Tooltip>

        {/* Demand signal */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={`gap-1 ${demandColors[scorecard.demandSignal]}`}>
              <DemandIcon className="h-3 w-3" />
              {scorecard.demandSignal}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">Demand Signal: {scorecard.demandSignal}</p>
            <p className="text-xs text-muted-foreground">Current market interest level</p>
          </TooltipContent>
        </Tooltip>

        {/* Liquidity band */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={liquidityColors[scorecard.liquidityBand]}>
              {scorecard.liquidityBand}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">Liquidity: {scorecard.liquidityBand}</p>
            <p className="text-xs text-muted-foreground">Expected time to sell</p>
          </TooltipContent>
        </Tooltip>

        {/* Risk flags */}
        {scorecard.riskFlags.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className={`gap-1 ${
                  scorecard.riskFlags.some((f) => f.severity === "high")
                    ? "bg-red-100 text-red-700 border-red-200"
                    : "bg-amber-100 text-amber-700 border-amber-200"
                }`}
              >
                <AlertTriangle className="h-3 w-3" />
                {scorecard.riskFlags.length}
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="font-medium mb-1">Risk Flags</p>
              <ul className="space-y-1">
                {scorecard.riskFlags.map((flag, i) => {
                  const Icon = riskIcons[flag.type]
                  return (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <Icon className="h-3 w-3 mt-0.5 shrink-0" />
                      <span>{flag.description}</span>
                    </li>
                  )
                })}
              </ul>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Priority badge */}
        {showDetails && scorecard.recommendedPriority === "urgent" && (
          <Badge variant="destructive" className="text-xs">
            URGENT
          </Badge>
        )}
      </div>
    </TooltipProvider>
  )
}
