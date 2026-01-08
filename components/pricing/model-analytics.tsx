"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ConfidenceBadge } from "@/components/ui/confidence-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Settings2,
  FlaskConical,
} from "lucide-react"
import type { ModelPerformance, OverrideAnalysis, ElasticityData } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts"

interface ModelAnalyticsProps {
  performance: ModelPerformance[]
  overrides: OverrideAnalysis[]
  elasticities: ElasticityData[]
}

const recommendationConfig = {
  "reduce-automation": {
    label: "Reduce Automation",
    color: "bg-orange-500/10 text-orange-600 border-orange-200",
    icon: AlertTriangle,
  },
  "increase-automation": {
    label: "Increase Automation",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    icon: CheckCircle2,
  },
  "keep-manual": {
    label: "Keep Manual",
    color: "bg-blue-500/10 text-blue-600 border-blue-200",
    icon: Settings2,
  },
  investigate: {
    label: "Investigate",
    color: "bg-amber-500/10 text-amber-600 border-amber-200",
    icon: AlertTriangle,
  },
}

export function ModelAnalytics({ performance, overrides, elasticities }: ModelAnalyticsProps) {
  const [selectedSegment, setSelectedSegment] = useState<string>("all")

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value)
  }

  const filteredPerformance =
    selectedSegment === "all" ? performance : performance.filter((p) => p.segment === selectedSegment)

  // Calculate overall stats
  const avgError = performance.reduce((sum, p) => sum + p.meanAbsoluteError, 0) / performance.length
  const avgOverrideRate = performance.reduce((sum, p) => sum + p.overrideRate, 0) / performance.length
  const totalPredictions = performance.reduce((sum, p) => sum + p.totalPredictions, 0)

  // Elasticity chart data
  const elasticityChartData = elasticities.map((e) => ({
    priceChange: e.priceChange,
    demandChange: e.demandChange,
    segment: e.segment,
    channel: e.channel,
    sampleSize: e.sampleSize,
  }))

  return (
    <div className="space-y-4">
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Model Performance</TabsTrigger>
          <TabsTrigger value="overrides">Override Analysis</TabsTrigger>
          <TabsTrigger value="elasticities">Price Elasticities</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Predictions</p>
                  <p className="text-2xl font-semibold">{totalPredictions.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Absolute Error</p>
                  <p className="text-2xl font-semibold">{formatCurrency(avgError)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Override Rate</p>
                  <p className="text-2xl font-semibold">{avgOverrideRate.toFixed(1)}%</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Segments Tracked</p>
                  <p className="text-2xl font-semibold">{performance.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Prediction Accuracy by Segment</CardTitle>
                  <CardDescription>Model error, bias, and override outcomes by vehicle segment</CardDescription>
                </div>
                <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter segment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Segments</SelectItem>
                    {[...new Set(performance.map((p) => p.segment))].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Segment</TableHead>
                      <TableHead>Fuel</TableHead>
                      <TableHead className="text-right">Predictions</TableHead>
                      <TableHead className="text-right">MAE (€)</TableHead>
                      <TableHead className="text-right">MAPE (%)</TableHead>
                      <TableHead className="text-center">Bias</TableHead>
                      <TableHead className="text-center">Confidence</TableHead>
                      <TableHead className="text-right">Override Rate</TableHead>
                      <TableHead className="text-center">Override Impact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPerformance.map((p, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{p.segment}</TableCell>
                        <TableCell className="capitalize">{p.fuelType}</TableCell>
                        <TableCell className="text-right">{p.totalPredictions.toLocaleString()}</TableCell>
                        <TableCell
                          className={cn(
                            "text-right",
                            p.meanAbsoluteError > 800 && "text-red-600",
                            p.meanAbsoluteError < 400 && "text-emerald-600",
                          )}
                        >
                          {formatCurrency(p.meanAbsoluteError)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right",
                            p.meanPercentageError > 3 && "text-red-600",
                            p.meanPercentageError < 2 && "text-emerald-600",
                          )}
                        >
                          {p.meanPercentageError.toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            {p.bias > 0.5 ? (
                              <ArrowUpRight className="h-4 w-4 text-red-600" />
                            ) : p.bias < -0.5 ? (
                              <ArrowDownRight className="h-4 w-4 text-amber-600" />
                            ) : (
                              <Minus className="h-4 w-4 text-emerald-600" />
                            )}
                            <span
                              className={cn(
                                "text-sm",
                                Math.abs(p.bias) > 1 && "text-red-600",
                                Math.abs(p.bias) < 0.5 && "text-emerald-600",
                              )}
                            >
                              {p.bias > 0 ? "+" : ""}
                              {p.bias.toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <ConfidenceBadge level={p.confidence} showLabel={false} />
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right",
                            p.overrideRate > 20 && "text-amber-600",
                            p.overrideRate < 10 && "text-emerald-600",
                          )}
                        >
                          {p.overrideRate}%
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={cn(
                              p.overrideOutcome > 0 && "bg-emerald-500/10 text-emerald-600 border-emerald-200",
                              p.overrideOutcome < 0 && "bg-red-500/10 text-red-600 border-red-200",
                              p.overrideOutcome === 0 && "bg-muted",
                            )}
                          >
                            {p.overrideOutcome > 0 ? "+" : ""}
                            {p.overrideOutcome.toFixed(1)} RPI
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Highlight problem areas */}
              <div className="mt-4 p-4 rounded-lg bg-amber-500/5 border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Attention Required: BEV Segment</p>
                    <p className="text-sm text-amber-700 mt-1">
                      BEV predictions show high error (4.2%) and positive bias (+2.8%), indicating systematic
                      overestimation. Human overrides in this segment improve outcomes by +1.8 RPI points. Consider
                      recalibrating EV models or keeping manual review for this segment.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Override Analysis Tab */}
        <TabsContent value="overrides" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Override Pattern Analysis</CardTitle>
              <CardDescription>
                Understanding when human overrides help or hurt outcomes to improve automation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overrides.map((override) => {
                  const config = recommendationConfig[override.recommendation] || recommendationConfig["investigate"]
                  const Icon = config.icon

                  return (
                    <div key={override.reasonCode} className="p-4 rounded-lg border flex items-center justify-between">
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                            override.avgRpiImpact > 0 ? "bg-emerald-500/10" : "bg-red-500/10",
                          )}
                        >
                          {override.avgRpiImpact > 0 ? (
                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{override.reasonLabel}</h4>
                            <Badge variant="outline" className="text-xs">
                              {override.count} overrides
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">Segments: {override.segments.join(", ")}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">RPI Impact:</span>{" "}
                              <span
                                className={cn(
                                  "font-medium",
                                  override.avgRpiImpact > 0 ? "text-emerald-600" : "text-red-600",
                                )}
                              >
                                {override.avgRpiImpact > 0 ? "+" : ""}
                                {override.avgRpiImpact.toFixed(1)} pts
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Days Impact:</span>{" "}
                              <span
                                className={cn(
                                  "font-medium",
                                  override.avgDaysImpact < 0 ? "text-emerald-600" : "text-red-600",
                                )}
                              >
                                {override.avgDaysImpact > 0 ? "+" : ""}
                                {override.avgDaysImpact} days
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={config.color}>
                          <Icon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Key insights */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <h4 className="font-medium">Ready for More Automation</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    "Local market knowledge" overrides show minimal RPI improvement (+0.8 pts) with sufficient sample
                    size. Consider incorporating these patterns into the model to reduce manual intervention.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <h4 className="font-medium">Investigate Further</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    "Volume target pressure" overrides show negative RPI impact (-2.4 pts). This may indicate misaligned
                    incentives or unrealistic targets driving suboptimal decisions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Elasticities Tab */}
        <TabsContent value="elasticities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Price Elasticity Analysis</CardTitle>
              <CardDescription>How price changes affect demand and days-to-sell by segment and channel</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Elasticity chart */}
              <div style={{ width: "100%", height: 350, minWidth: 0, minHeight: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      type="number"
                      dataKey="priceChange"
                      name="Price Change"
                      unit="%"
                      domain={[-10, 0]}
                      label={{ value: "Price Change (%)", position: "bottom", offset: 0 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="demandChange"
                      name="Demand Change"
                      unit="%"
                      domain={[0, 70]}
                      label={{ value: "Demand Change (%)", angle: -90, position: "insideLeft" }}
                    />
                    <ZAxis type="number" dataKey="sampleSize" range={[50, 400]} name="Sample Size" />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const data = payload[0].payload
                        return (
                          <div className="bg-popover border rounded-lg shadow-lg p-3">
                            <p className="font-medium">{data.segment}</p>
                            <p className="text-sm text-muted-foreground capitalize">{data.channel}</p>
                            <div className="mt-2 space-y-1 text-sm">
                              <p>Price: {data.priceChange}%</p>
                              <p>Demand: +{data.demandChange}%</p>
                              <p>Sample: {data.sampleSize} vehicles</p>
                            </div>
                          </div>
                        )
                      }}
                    />
                    <Scatter
                      name="C-Segment"
                      data={elasticityChartData.filter((e) => e.segment === "C-Segment")}
                      fill="#6366f1"
                    />
                    <Scatter
                      name="Premium SUV"
                      data={elasticityChartData.filter((e) => e.segment === "Premium SUV")}
                      fill="#10b981"
                    />
                    <Scatter name="BEV" data={elasticityChartData.filter((e) => e.segment === "BEV")} fill="#f59e0b" />
                    <Legend />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              {/* Elasticity table */}
              <div className="mt-6 rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Segment</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead className="text-right">Price Change</TableHead>
                      <TableHead className="text-right">Demand Change</TableHead>
                      <TableHead className="text-right">Days Impact</TableHead>
                      <TableHead className="text-right">Sample Size</TableHead>
                      <TableHead className="text-center">Confidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {elasticities.map((e, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{e.segment}</TableCell>
                        <TableCell className="capitalize">{e.channel.replace("-", " ")}</TableCell>
                        <TableCell className="text-right text-red-600">{e.priceChange}%</TableCell>
                        <TableCell className="text-right text-emerald-600">+{e.demandChange}%</TableCell>
                        <TableCell className="text-right text-emerald-600">{e.daysToSellChange} days</TableCell>
                        <TableCell className="text-right">{e.sampleSize}</TableCell>
                        <TableCell className="text-center">
                          <ConfidenceBadge level={e.confidence} showLabel={false} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Key insight */}
              <div className="mt-4 p-4 rounded-lg bg-blue-500/5 border border-blue-200">
                <div className="flex items-start gap-3">
                  <FlaskConical className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">Key Finding: BEV High Elasticity</p>
                    <p className="text-sm text-blue-700 mt-1">
                      BEV segment shows 3x higher elasticity than Premium SUV (-5% price → +65% demand vs +22%). This
                      suggests aggressive pricing for aging BEV stock may recover volume faster with acceptable RPI
                      impact. However, confidence is lower due to smaller sample sizes.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
