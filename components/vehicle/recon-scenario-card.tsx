"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConfidenceBadge, type ConfidenceLevel } from "@/components/ui/confidence-badge"
import { Check, Clock, Euro, TrendingUp, Wrench } from "lucide-react"

interface ReconScenario {
  id: string
  name: string
  description: string
  repairItems: {
    item: string
    cost: number
    timeAdd: number
  }[]
  totalCost: number
  timeDelay: number
  estimatedPrice: number
  netProfit: number
  roi: number
  confidence: ConfidenceLevel
  isRecommended: boolean
}

interface ReconScenarioCardProps {
  scenario: ReconScenario
  basePrice: number
  selected?: boolean
  onSelect: () => void
}

export function ReconScenarioCard({ scenario, basePrice, selected, onSelect }: ReconScenarioCardProps) {
  const priceUplift = scenario.estimatedPrice - basePrice

  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-all cursor-pointer",
        selected ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "hover:border-muted-foreground/30",
        scenario.isRecommended && !selected && "border-emerald-200 bg-emerald-50/30",
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold">{scenario.name}</h4>
          {scenario.isRecommended && (
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Recommended</Badge>
          )}
        </div>
        <ConfidenceBadge level={scenario.confidence} size="sm" />
      </div>

      <p className="text-sm text-muted-foreground mb-4">{scenario.description}</p>

      {/* Repair items */}
      {scenario.repairItems.length > 0 && (
        <div className="space-y-1 mb-4 p-3 bg-muted/50 rounded-md">
          {scenario.repairItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{item.item}</span>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span>€{item.cost}</span>
                <span>+{item.timeAdd}d</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Repair Cost</div>
          <div className="flex items-center gap-1 font-semibold">
            <Euro className="h-4 w-4 text-muted-foreground" />
            {scenario.totalCost > 0 ? `€${scenario.totalCost.toLocaleString()}` : "€0"}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Time Delay</div>
          <div className="flex items-center gap-1 font-semibold">
            <Clock className="h-4 w-4 text-muted-foreground" />
            {scenario.timeDelay > 0 ? `+${scenario.timeDelay} days` : "None"}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Est. Sale Price</div>
          <div className="flex items-center gap-1 font-semibold">
            €{scenario.estimatedPrice.toLocaleString()}
            {priceUplift > 0 && <span className="text-emerald-600 text-sm">(+€{priceUplift.toLocaleString()})</span>}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Net Profit</div>
          <div
            className={cn(
              "flex items-center gap-1 font-semibold",
              scenario.netProfit > 0 ? "text-emerald-600" : "text-foreground",
            )}
          >
            <TrendingUp className="h-4 w-4" />€{scenario.netProfit.toLocaleString()}
          </div>
        </div>
      </div>

      {/* ROI */}
      {scenario.roi > 0 && (
        <div className="text-sm">
          <span className="text-muted-foreground">ROI: </span>
          <span
            className={cn(
              "font-semibold",
              scenario.roi >= 1.5 ? "text-emerald-600" : scenario.roi >= 1 ? "text-blue-600" : "text-amber-600",
            )}
          >
            {(scenario.roi * 100).toFixed(0)}%
          </span>
        </div>
      )}

      {/* Selection indicator */}
      <div className="mt-4 pt-3 border-t">
        <Button variant={selected ? "default" : "outline"} size="sm" className="w-full gap-1">
          {selected ? (
            <>
              <Check className="h-4 w-4" />
              Selected
            </>
          ) : (
            "Select This Option"
          )}
        </Button>
      </div>
    </div>
  )
}
