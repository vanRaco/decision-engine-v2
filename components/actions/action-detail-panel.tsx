"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConfidenceBadge } from "@/components/ui/confidence-badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Euro,
  BarChart3,
  History,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight,
  Car,
  MapPin,
  Gauge,
  Calendar,
  Zap,
} from "lucide-react"
import type { Action, Vehicle, ReasoningFactor } from "@/lib/mock-data"
import { countries } from "@/lib/mock-data"

interface ActionDetailPanelProps {
  action: Action | null
  vehicle: Vehicle | null
  open: boolean
  onClose: () => void
  onApprove: () => void
  onReject: () => void
  onViewVehicle: () => void
}

function FactorRow({ factor }: { factor: ReasoningFactor }) {
  const impactIcon = {
    positive: <TrendingUp className="h-4 w-4 text-emerald-500" />,
    negative: <TrendingDown className="h-4 w-4 text-red-500" />,
    neutral: <Minus className="h-4 w-4 text-slate-400" />,
  }

  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0">
      <div className="mt-0.5">{impactIcon[factor.impact]}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium text-sm">{factor.name}</span>
          <span className="text-xs text-muted-foreground">Weight: {Math.round(factor.weight * 100)}%</span>
        </div>
        <p className="text-sm text-muted-foreground">{factor.description}</p>
      </div>
    </div>
  )
}

function ConfidenceBreakdown({ breakdown }: { breakdown: Action["reasoning"]["confidenceBreakdown"] }) {
  const metrics = [
    { label: "Data Quality", value: breakdown.dataQuality, color: "bg-blue-500" },
    { label: "Market Stability", value: breakdown.marketStability, color: "bg-purple-500" },
    { label: "Model Accuracy", value: breakdown.modelAccuracy, color: "bg-emerald-500" },
    { label: "Historical Success", value: breakdown.historicalSuccess, color: "bg-amber-500" },
  ]

  return (
    <div className="space-y-3">
      {metrics.map((metric) => (
        <div key={metric.label}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-muted-foreground">{metric.label}</span>
            <span className="text-sm font-medium">{Math.round(metric.value * 100)}%</span>
          </div>
          <Progress value={metric.value * 100} className="h-2" />
        </div>
      ))}
    </div>
  )
}

export function ActionDetailPanel({
  action,
  vehicle,
  open,
  onClose,
  onApprove,
  onReject,
  onViewVehicle,
}: ActionDetailPanelProps) {
  const [activeTab, setActiveTab] = useState("reasoning")

  if (!action || !vehicle) return null

  const { reasoning, marketContext, similarDecisions, alternativeActions } = action

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col h-full" hideClose>
        <SheetHeader className="p-6 pb-4 border-b shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg">{action.title}</SheetTitle>
              <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
            </div>
            <Button variant="outline" size="sm" onClick={onClose} className="shrink-0 bg-transparent">
              Close
            </Button>
          </div>

          {/* Vehicle Quick Info */}
          <button
            onClick={onViewVehicle}
            className="mt-4 flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left w-full"
          >
            <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center">
              <Car className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">
                {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.variant}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {countries[vehicle.country].flag} {vehicle.country}
                </span>
                <span className="flex items-center gap-1">
                  <Gauge className="h-3 w-3" />
                  {vehicle.mileage.toLocaleString()} km
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {vehicle.daysInStock}d in stock
                </span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Impact Summary */}
          <div className="flex items-center gap-4 mt-4">
            {action.impact.netUplift !== undefined && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700">
                <Euro className="h-4 w-4" />
                <span className="font-semibold">+€{action.impact.netUplift.toLocaleString()}</span>
              </div>
            )}
            {action.impact.daysChange !== undefined && (
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full",
                  action.impact.daysChange < 0 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700",
                )}
              >
                <Clock className="h-4 w-4" />
                <span className="font-semibold">
                  {action.impact.daysChange > 0 ? "+" : ""}
                  {action.impact.daysChange}d
                </span>
              </div>
            )}
            <ConfidenceBadge level={action.confidence} showLabel />
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-6 mt-4 grid grid-cols-4 shrink-0">
            <TabsTrigger value="reasoning" className="text-xs">
              <Lightbulb className="h-3.5 w-3.5 mr-1.5" />
              Reasoning
            </TabsTrigger>
            <TabsTrigger value="market" className="text-xs">
              <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
              Market
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs">
              <History className="h-3.5 w-3.5 mr-1.5" />
              Similar
            </TabsTrigger>
            <TabsTrigger value="alternatives" className="text-xs">
              <Zap className="h-3.5 w-3.5 mr-1.5" />
              Alternatives
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-6">
            {/* Reasoning Tab */}
            <TabsContent value="reasoning" className="mt-0 space-y-6">
              <div className="p-4 rounded-lg bg-blue-600 border-2 border-blue-700 shadow-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-white mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">DE Recommendation</h4>
                    <p className="text-sm text-blue-50">{reasoning.summary}</p>
                  </div>
                </div>
              </div>

              {/* Playbook */}
              {reasoning.playbook && (
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    Playbook
                  </Badge>
                  <span className="text-muted-foreground">{reasoning.playbook}</span>
                </div>
              )}

              {/* Factors */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Decision Factors
                </h4>
                <div className="border rounded-lg divide-y">
                  {reasoning.factors.map((factor, idx) => (
                    <FactorRow key={idx} factor={factor} />
                  ))}
                </div>
              </div>

              {/* Data Points */}
              <div>
                <h4 className="font-medium mb-3">Supporting Data</h4>
                <div className="grid grid-cols-2 gap-3">
                  {reasoning.dataPoints.map((dp, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-muted/50">
                      <div className="text-xs text-muted-foreground mb-1">{dp.label}</div>
                      <div className="font-semibold">{dp.value}</div>
                      <div className="text-xs text-muted-foreground mt-1">Source: {dp.source}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confidence Breakdown */}
              <div>
                <h4 className="font-medium mb-3">Confidence Breakdown</h4>
                <div className="p-4 border rounded-lg">
                  <ConfidenceBreakdown breakdown={reasoning.confidenceBreakdown} />
                </div>
              </div>
            </TabsContent>

            {/* Market Tab */}
            <TabsContent value="market" className="mt-0 space-y-6">
              {/* Market Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground mb-1">Similar Vehicles</div>
                  <div className="text-2xl font-bold">{marketContext.similarVehiclesCount}</div>
                  <div className="text-xs text-muted-foreground">in market</div>
                </div>
                <div className="p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground mb-1">Avg Days on Market</div>
                  <div className="text-2xl font-bold">{marketContext.avgDaysOnMarket}</div>
                  <div className="text-xs text-muted-foreground">days</div>
                </div>
              </div>

              {/* Price Range */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3">Price Distribution</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Market Low</span>
                    <span className="font-medium">€{marketContext.priceRange.min.toLocaleString()}</span>
                  </div>
                  <div className="relative h-3 bg-muted rounded-full">
                    <div
                      className="absolute h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                      style={{ left: "15%", right: "15%" }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow"
                      style={{ left: `${50 + vehicle.pricePosition * 2}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Market High</span>
                    <span className="font-medium">€{marketContext.priceRange.max.toLocaleString()}</span>
                  </div>
                  <div className="text-center pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Current vehicle: </span>
                    <span className="font-medium">€{vehicle.marketValue.toLocaleString()}</span>
                    <span
                      className={cn("ml-2 text-sm", vehicle.pricePosition > 0 ? "text-amber-600" : "text-emerald-600")}
                    >
                      ({vehicle.pricePosition > 0 ? "+" : ""}
                      {vehicle.pricePosition}% vs avg)
                    </span>
                  </div>
                </div>
              </div>

              {/* Demand Trend */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Demand Trend</h4>
                  <Badge
                    variant="outline"
                    className={cn(
                      marketContext.demandTrend === "increasing" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                      marketContext.demandTrend === "stable" && "bg-blue-50 text-blue-700 border-blue-200",
                      marketContext.demandTrend === "decreasing" && "bg-red-50 text-red-700 border-red-200",
                    )}
                  >
                    {marketContext.demandTrend === "increasing" && <TrendingUp className="h-3 w-3 mr-1" />}
                    {marketContext.demandTrend === "stable" && <Minus className="h-3 w-3 mr-1" />}
                    {marketContext.demandTrend === "decreasing" && <TrendingDown className="h-3 w-3 mr-1" />}
                    {marketContext.demandTrend.charAt(0).toUpperCase() + marketContext.demandTrend.slice(1)}
                  </Badge>
                </div>
              </div>

              {/* Recent Sales */}
              <div>
                <h4 className="font-medium mb-3">Recent Similar Sales</h4>
                <div className="space-y-2">
                  {marketContext.recentSales.map((sale, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          {sale.channel.replace("-", " ")}
                        </Badge>
                        <span className="font-medium">€{sale.price.toLocaleString()}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{sale.daysToSell}d to sell</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Competitor Pricing */}
              {marketContext.competitorPricing && (
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Competitor Pricing</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Budget</div>
                      <div className="font-semibold">€{marketContext.competitorPricing.low.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Mid-range</div>
                      <div className="font-semibold">€{marketContext.competitorPricing.mid.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Premium</div>
                      <div className="font-semibold">€{marketContext.competitorPricing.high.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Similar Decisions Tab */}
            <TabsContent value="history" className="mt-0 space-y-4">
              <p className="text-sm text-muted-foreground">How similar vehicles performed with comparable decisions:</p>
              {similarDecisions.map((decision, idx) => (
                <div key={idx} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{decision.vehicleDescription}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">{decision.date.toLocaleDateString()}</div>
                    </div>
                    {decision.wasDeRecommendation ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Followed DE
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        <XCircle className="h-3 w-3 mr-1" />
                        Override
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Decision: </span>
                    <span>{decision.decision}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-3 border-t">
                    <div>
                      <div className="text-xs text-muted-foreground">Sold Price</div>
                      <div className="font-semibold">€{decision.outcome.soldPrice.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Days to Sell</div>
                      <div className="font-semibold">{decision.outcome.daysToSell}d</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">RPI</div>
                      <div className="font-semibold">{decision.outcome.rpi.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* Alternatives Tab */}
            <TabsContent value="alternatives" className="mt-0 space-y-4">
              <p className="text-sm text-muted-foreground">
                Other options DE considered and why they weren&apos;t recommended:
              </p>
              {alternativeActions.map((alt, idx) => (
                <div key={idx} className="p-4 border rounded-lg border-dashed">
                  <div className="flex items-start justify-between mb-3">
                    <div className="font-medium">{alt.action}</div>
                    <ConfidenceBadge level={alt.confidence} size="sm" />
                  </div>

                  <div className="flex items-center gap-4 mb-3 text-sm">
                    {alt.expectedImpact.rpi !== undefined && (
                      <div
                        className={cn(
                          "flex items-center gap-1",
                          alt.expectedImpact.rpi >= 0 ? "text-emerald-600" : "text-red-600",
                        )}
                      >
                        <span>
                          RPI: {alt.expectedImpact.rpi > 0 ? "+" : ""}
                          {alt.expectedImpact.rpi}%
                        </span>
                      </div>
                    )}
                    {alt.expectedImpact.days !== undefined && (
                      <div
                        className={cn(
                          "flex items-center gap-1",
                          alt.expectedImpact.days <= 0 ? "text-emerald-600" : "text-amber-600",
                        )}
                      >
                        <span>
                          Days: {alt.expectedImpact.days > 0 ? "+" : ""}
                          {alt.expectedImpact.days}
                        </span>
                      </div>
                    )}
                    {alt.expectedImpact.netValue !== undefined && (
                      <div
                        className={cn(
                          "flex items-center gap-1",
                          alt.expectedImpact.netValue >= 0 ? "text-emerald-600" : "text-red-600",
                        )}
                      >
                        <span>
                          Value: {alt.expectedImpact.netValue > 0 ? "+" : "€"}
                          {alt.expectedImpact.netValue}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 rounded bg-amber-50 text-amber-800 text-sm">
                    <span className="font-medium">Why not: </span>
                    {alt.whyNotRecommended}
                  </div>
                </div>
              ))}
            </TabsContent>
          </div>
        </Tabs>

        {/* Action Buttons */}
        <div className="p-6 border-t bg-muted/30 shrink-0">
          <div className="flex items-center gap-3">
            <Button onClick={onApprove} className="flex-1 gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Approve Action
            </Button>
            <Button variant="outline" onClick={onReject} className="flex-1 gap-2 bg-transparent">
              <XCircle className="h-4 w-4" />
              Override
            </Button>
          </div>
          <Button variant="ghost" onClick={onViewVehicle} className="w-full mt-2 gap-2">
            <ExternalLink className="h-4 w-4" />
            View Full Vehicle Details
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
