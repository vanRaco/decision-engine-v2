"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConfidenceBadge } from "@/components/ui/confidence-badge"
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts"
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  Check,
  ChevronRight,
  Calendar,
  BarChart3,
} from "lucide-react"
import { generatePacingForecast, generatePacingData } from "@/lib/mock-data"

interface PacingDashboardProps {
  onApproveIntervention: (interventionId: string) => void
  onViewCohort: (cohortId: string) => void
}

export function PacingDashboard({ onApproveIntervention, onViewCohort }: PacingDashboardProps) {
  const [selectedTab, setSelectedTab] = useState("overview")
  const [approvedInterventions, setApprovedInterventions] = useState<Set<string>>(new Set())

  const forecast = useMemo(() => generatePacingForecast(), [])
  const pacingData = useMemo(() => generatePacingData(forecast.volumeTarget), [forecast.volumeTarget])

  const volumeGap = forecast.volumeTarget - forecast.volumeForecast
  const volumeProgress = (forecast.volumeActual / forecast.volumeTarget) * 100

  const compressionIndex = forecast.compressionRisk === "high" ? 75 : forecast.compressionRisk === "medium" ? 50 : 25

  const handleApprove = (id: string) => {
    setApprovedInterventions((prev) => new Set([...prev, id]))
    onApproveIntervention(id)
  }

  const getConfidenceLevel = (confidence: number): "high" | "medium" | "low" => {
    if (confidence >= 0.75) return "high"
    if (confidence >= 0.6) return "medium"
    return "low"
  }

  // Chart data for pacing
  const chartData = pacingData.map((d) => ({
    day: d.day,
    target: d.target,
    actual: d.actual || null,
    forecast: d.forecast || null,
  }))

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              Day {forecast.currentDay} of 30
            </div>
            <div className="text-2xl font-bold">{forecast.daysRemaining}d left</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Target className="h-4 w-4" />
              Volume Progress
            </div>
            <div className="text-2xl font-bold">{forecast.volumeActual.toLocaleString()}</div>
            <Progress value={volumeProgress} className="mt-2 h-2" />
            <div className="text-xs text-muted-foreground mt-1">of {forecast.volumeTarget.toLocaleString()} target</div>
          </CardContent>
        </Card>
        <Card className={volumeGap > 0 ? "border-amber-200" : "border-emerald-200"}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              {volumeGap > 0 ? (
                <TrendingDown className="h-4 w-4 text-amber-500" />
              ) : (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              )}
              Forecast Gap
            </div>
            <div className={`text-2xl font-bold ${volumeGap > 0 ? "text-amber-600" : "text-emerald-600"}`}>
              {volumeGap > 0 ? `-${volumeGap}` : `+${Math.abs(volumeGap)}`}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Forecast: {forecast.volumeForecast.toLocaleString()} units
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <BarChart3 className="h-4 w-4" />
              RPI Forecast
            </div>
            <div
              className={`text-2xl font-bold ${forecast.rpiForecast >= forecast.rpiTarget ? "text-emerald-600" : "text-amber-600"}`}
            >
              {forecast.rpiForecast.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">Target: {forecast.rpiTarget}%</div>
          </CardContent>
        </Card>
        <Card className={compressionIndex > 60 ? "border-red-200 bg-red-50/50" : ""}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <AlertTriangle className={`h-4 w-4 ${compressionIndex > 60 ? "text-red-500" : ""}`} />
              Compression Risk
            </div>
            <div
              className={`text-2xl font-bold ${compressionIndex > 60 ? "text-red-600" : compressionIndex > 40 ? "text-amber-600" : "text-emerald-600"}`}
            >
              {compressionIndex}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {compressionIndex > 60 ? "High fire-sale risk" : "Manageable"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Pacing Chart</TabsTrigger>
          <TabsTrigger value="at-risk">
            At-Risk Cohorts
            <Badge variant="destructive" className="ml-2 h-5 px-1.5">
              {forecast.cohortRisks?.length || 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="interventions">
            Interventions
            <Badge variant="outline" className="ml-2 h-5 px-1.5">
              {forecast.interventions?.length || 0}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Pacing Chart */}
        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Volume Pacing vs Target</CardTitle>
              <CardDescription>Cumulative sales progress through the month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]" style={{ minWidth: 0, minHeight: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
                    />
                    <Tooltip
                      contentStyle={{ fontSize: 12 }}
                      formatter={(value: number) => [value?.toLocaleString() || "N/A", ""]}
                      labelFormatter={(label) => `Day ${label}`}
                    />
                    <ReferenceLine
                      x={forecast.currentDay}
                      stroke="#6b7280"
                      strokeDasharray="5 5"
                      label={{ value: "Today", fontSize: 11 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="#9ca3af"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="Target"
                    />
                    <Area
                      type="monotone"
                      dataKey="actual"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorActual)"
                      dot={false}
                      name="Actual"
                    />
                    <Area
                      type="monotone"
                      dataKey="forecast"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="3 3"
                      fillOpacity={1}
                      fill="url(#colorForecast)"
                      dot={false}
                      name="Forecast"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <span className="text-muted-foreground">Target</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground">Actual</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-muted-foreground">Forecast</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* At-Risk Cohorts - Use cohortRisks array */}
        <TabsContent value="at-risk" className="mt-4">
          <div className="space-y-4">
            {(forecast.cohortRisks || []).map((cohort) => (
              <Card key={cohort.id} className="border-l-4 border-l-amber-500">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{cohort.name}</h4>
                        <Badge variant="outline">{cohort.vehicleCount} vehicles</Badge>
                        <Badge
                          variant="outline"
                          className={
                            cohort.riskLevel === "high"
                              ? "bg-red-100 text-red-700"
                              : cohort.riskLevel === "medium"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                          }
                        >
                          {cohort.riskLevel} risk
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <span>Avg {cohort.avgDaysInStock}d in stock</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onViewCohort(cohort.id)}>
                      View Vehicles
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className="mt-4 p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 text-sm font-medium mb-2">
                      <Zap className="h-4 w-4 text-amber-500" />
                      Suggested Action
                    </div>
                    <p className="text-sm">{cohort.suggestedAction}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Interventions - Use correct field names from PacingIntervention */}
        <TabsContent value="interventions" className="mt-4">
          <div className="space-y-4">
            {(forecast.interventions || []).map((intervention) => {
              const isApproved = approvedInterventions.has(intervention.id)
              return (
                <Card key={intervention.id} className={isApproved ? "border-emerald-200 bg-emerald-50/30" : ""}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={
                              intervention.type === "pricing"
                                ? "bg-red-100 text-red-700"
                                : intervention.type === "channel"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-purple-100 text-purple-700"
                            }
                          >
                            {intervention.type}
                          </Badge>
                          <ConfidenceBadge level={getConfidenceLevel(intervention.confidence)} size="sm" />
                          {isApproved && (
                            <Badge className="bg-emerald-100 text-emerald-700">
                              <Check className="h-3 w-3 mr-1" />
                              Approved
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium">{intervention.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{intervention.vehicleCount} vehicles</span>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-sm">
                          <span className="text-emerald-600 font-medium">+{intervention.expectedVolumeImpact}</span>
                          <span className="text-muted-foreground"> volume</span>
                        </div>
                        <div className="text-sm">
                          <span className={intervention.expectedRpiImpact >= 0 ? "text-emerald-600" : "text-amber-600"}>
                            {intervention.expectedRpiImpact >= 0 ? "+" : ""}
                            {intervention.expectedRpiImpact.toFixed(1)}%
                          </span>
                          <span className="text-muted-foreground"> RPI</span>
                        </div>
                      </div>
                    </div>
                    {!isApproved && (
                      <div className="mt-4 flex items-center gap-2">
                        <Button size="sm" onClick={() => handleApprove(intervention.id)}>
                          <Check className="h-4 w-4 mr-1" />
                          Approve & Execute
                        </Button>
                        <Button variant="outline" size="sm">
                          Modify
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
