"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConfidenceBadge } from "@/components/ui/confidence-badge"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  TrendingDown,
  TrendingUp,
  Minus,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Car,
  Shield,
  Zap,
} from "lucide-react"
import type { PricingCohort } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface BulkPricingViewProps {
  cohorts: PricingCohort[]
}

const actionIcons = {
  "price-drop": TrendingDown,
  "price-increase": TrendingUp,
  hold: Minus,
  "channel-switch": Zap,
}

const riskColors = {
  low: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  medium: "bg-amber-500/10 text-amber-600 border-amber-200",
  high: "bg-red-500/10 text-red-600 border-red-200",
}

export function BulkPricingView({ cohorts }: BulkPricingViewProps) {
  const [selectedCohort, setSelectedCohort] = useState<PricingCohort | null>(null)
  const [adjustedChange, setAdjustedChange] = useState<number>(0)
  const [expandedCohorts, setExpandedCohorts] = useState<Set<string>>(new Set())

  const pendingCohorts = cohorts.filter((c) => c.status === "pending")
  const totalVehicles = cohorts.reduce((sum, c) => sum + c.vehicleCount, 0)
  const totalPotentialRpi = cohorts
    .filter((c) => c.suggestedAction !== "hold")
    .reduce((sum, c) => sum + c.expectedRpiImpact * c.vehicleCount, 0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value)
  }

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedCohorts)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedCohorts(newExpanded)
  }

  const openConfigDialog = (cohort: PricingCohort) => {
    setSelectedCohort(cohort)
    setAdjustedChange(cohort.suggestedChange)
  }

  return (
    <>
      <div className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cohorts Pending</p>
                  <p className="text-2xl font-semibold">{pendingCohorts.length}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Vehicles Affected</p>
                  <p className="text-2xl font-semibold">{totalVehicles.toLocaleString()}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <Car className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Potential RPI Impact</p>
                  <p
                    className={cn(
                      "text-2xl font-semibold",
                      totalPotentialRpi > 0 ? "text-emerald-600" : "text-red-600",
                    )}
                  >
                    {totalPotentialRpi > 0 ? "+" : ""}
                    {(totalPotentialRpi / totalVehicles).toFixed(2)} pts
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Guardrails Active</p>
                  <p className="text-2xl font-semibold">12</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cohort list */}
        <Card>
          <CardHeader>
            <CardTitle>Bulk Pricing Opportunities</CardTitle>
            <CardDescription>
              Cohort-based repricing suggestions with guardrails. Review and approve to execute.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {cohorts.map((cohort) => {
              const ActionIcon = actionIcons[cohort.suggestedAction]
              const isExpanded = expandedCohorts.has(cohort.id)

              return (
                <Collapsible key={cohort.id} open={isExpanded} onOpenChange={() => toggleExpanded(cohort.id)}>
                  <div
                    className={cn(
                      "rounded-lg border p-4 transition-colors",
                      cohort.status === "pending" && "bg-card",
                      cohort.status === "approved" && "bg-emerald-500/5 border-emerald-200",
                      cohort.status === "executed" && "bg-muted/50",
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {/* Action icon */}
                      <div
                        className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                          cohort.suggestedAction === "price-drop" && "bg-red-500/10",
                          cohort.suggestedAction === "price-increase" && "bg-emerald-500/10",
                          cohort.suggestedAction === "hold" && "bg-muted",
                          cohort.suggestedAction === "channel-switch" && "bg-blue-500/10",
                        )}
                      >
                        <ActionIcon
                          className={cn(
                            "h-5 w-5",
                            cohort.suggestedAction === "price-drop" && "text-red-600",
                            cohort.suggestedAction === "price-increase" && "text-emerald-600",
                            cohort.suggestedAction === "hold" && "text-muted-foreground",
                            cohort.suggestedAction === "channel-switch" && "text-blue-600",
                          )}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{cohort.name}</h4>
                          <Badge variant="outline" className={riskColors[cohort.riskLevel]}>
                            {cohort.riskLevel} risk
                          </Badge>
                          <ConfidenceBadge level={cohort.confidence} showLabel={false} />
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{cohort.description}</p>

                        <div className="flex items-center gap-6 text-sm">
                          <div>
                            <span className="text-muted-foreground">Vehicles:</span>{" "}
                            <span className="font-medium">{cohort.vehicleCount}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Price vs Market:</span>{" "}
                            <span
                              className={cn(
                                "font-medium",
                                cohort.pricePosition > 102 && "text-red-600",
                                cohort.pricePosition < 98 && "text-emerald-600",
                              )}
                            >
                              {cohort.pricePosition > 100 ? "+" : ""}
                              {(cohort.pricePosition - 100).toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Days Impact:</span>{" "}
                            <span
                              className={cn(
                                "font-medium",
                                cohort.expectedDaysImpact < 0 && "text-emerald-600",
                                cohort.expectedDaysImpact > 0 && "text-red-600",
                              )}
                            >
                              {cohort.expectedDaysImpact > 0 ? "+" : ""}
                              {cohort.expectedDaysImpact}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">RPI Impact:</span>{" "}
                            <span
                              className={cn(
                                "font-medium",
                                cohort.expectedRpiImpact > 0 && "text-emerald-600",
                                cohort.expectedRpiImpact < 0 && "text-red-600",
                              )}
                            >
                              {cohort.expectedRpiImpact > 0 ? "+" : ""}
                              {cohort.expectedRpiImpact.toFixed(1)} pts
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {cohort.status === "pending" && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => openConfigDialog(cohort)}>
                              Configure
                            </Button>
                            <Button size="sm">Approve</Button>
                          </>
                        )}
                        {cohort.status === "approved" && (
                          <Badge className="bg-emerald-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Approved
                          </Badge>
                        )}
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm">
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>

                    <CollapsibleContent>
                      <div className="mt-4 pt-4 border-t">
                        <div className="grid grid-cols-3 gap-4">
                          {/* Suggested action details */}
                          <div>
                            <h5 className="text-sm font-medium mb-2">Suggested Action</h5>
                            <div className="p-3 rounded-lg bg-muted/50">
                              {cohort.suggestedAction === "price-drop" && (
                                <p className="text-sm">
                                  Reduce price by{" "}
                                  <span className="font-semibold text-red-600">
                                    {Math.abs(cohort.suggestedChange)}%
                                  </span>
                                </p>
                              )}
                              {cohort.suggestedAction === "price-increase" && (
                                <p className="text-sm">
                                  Increase price by{" "}
                                  <span className="font-semibold text-emerald-600">{cohort.suggestedChange}%</span>
                                </p>
                              )}
                              {cohort.suggestedAction === "channel-switch" && (
                                <p className="text-sm">Switch to export channel for better liquidity</p>
                              )}
                              {cohort.suggestedAction === "hold" && (
                                <p className="text-sm">Maintain current pricing - performing well</p>
                              )}
                            </div>
                          </div>

                          {/* Guardrails */}
                          <div>
                            <h5 className="text-sm font-medium mb-2">Active Guardrails</h5>
                            <div className="space-y-1">
                              {cohort.guardrailsApplied.length > 0 ? (
                                cohort.guardrailsApplied.map((g, i) => (
                                  <div key={i} className="flex items-center gap-2 text-sm">
                                    <Shield className="h-3 w-3 text-blue-600" />
                                    <span className="text-muted-foreground">{g}</span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-muted-foreground">No specific guardrails</p>
                              )}
                            </div>
                          </div>

                          {/* Sample vehicles */}
                          <div>
                            <h5 className="text-sm font-medium mb-2">Sample Vehicles</h5>
                            <Button variant="outline" size="sm" className="w-full bg-transparent">
                              View {cohort.vehicleCount} vehicles
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Configuration Dialog */}
      <Dialog open={!!selectedCohort} onOpenChange={() => setSelectedCohort(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Configure Cohort Action</DialogTitle>
            <DialogDescription>Adjust parameters and guardrails before approving</DialogDescription>
          </DialogHeader>

          {selectedCohort && (
            <div className="space-y-6 py-4">
              <div>
                <h4 className="font-medium mb-1">{selectedCohort.name}</h4>
                <p className="text-sm text-muted-foreground">{selectedCohort.vehicleCount} vehicles affected</p>
              </div>

              {selectedCohort.suggestedAction === "price-drop" ||
              selectedCohort.suggestedAction === "price-increase" ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Price Change</label>
                    <span
                      className={cn("text-sm font-semibold", adjustedChange < 0 ? "text-red-600" : "text-emerald-600")}
                    >
                      {adjustedChange > 0 ? "+" : ""}
                      {adjustedChange}%
                    </span>
                  </div>
                  <Slider
                    value={[adjustedChange]}
                    onValueChange={([v]) => setAdjustedChange(v)}
                    min={-10}
                    max={5}
                    step={0.5}
                    className="my-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>-10%</span>
                    <span>0%</span>
                    <span>+5%</span>
                  </div>
                </div>
              ) : null}

              <div>
                <h5 className="text-sm font-medium mb-2">Impact Preview</h5>
                <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-xs text-muted-foreground">Expected Days Change</p>
                    <p
                      className={cn(
                        "font-semibold",
                        selectedCohort.expectedDaysImpact < 0 ? "text-emerald-600" : "text-red-600",
                      )}
                    >
                      {selectedCohort.expectedDaysImpact > 0 ? "+" : ""}
                      {selectedCohort.expectedDaysImpact} days
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Expected RPI Change</p>
                    <p
                      className={cn(
                        "font-semibold",
                        selectedCohort.expectedRpiImpact > 0 ? "text-emerald-600" : "text-red-600",
                      )}
                    >
                      {selectedCohort.expectedRpiImpact > 0 ? "+" : ""}
                      {selectedCohort.expectedRpiImpact.toFixed(1)} pts
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium mb-2">Guardrails</h5>
                <div className="space-y-2">
                  {selectedCohort.guardrailsApplied.map((g, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded border bg-blue-500/5 border-blue-200">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">{g}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCohort(null)}>
              Cancel
            </Button>
            <Button onClick={() => setSelectedCohort(null)}>Approve with Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
