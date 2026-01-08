"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Brain,
  Target,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Info,
  Download,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Mock analytics data
const modelPerformance = {
  pricingAccuracy: 94.2,
  channelAccuracy: 87.5,
  daysToSellAccuracy: 78.3,
  overrideRate: 12.4,
  overrideSuccess: 34.2,
}

const overrideAnalysis = [
  { reason: "Dealer relationship", count: 45, successRate: 28, avgRpiImpact: -1.2 },
  { reason: "Local market knowledge", count: 32, successRate: 52, avgRpiImpact: 0.8 },
  { reason: "Aging stock priority", count: 28, successRate: 18, avgRpiImpact: -2.4 },
  { reason: "Brand protection", count: 24, successRate: 71, avgRpiImpact: 1.5 },
  { reason: "Customer order", count: 18, successRate: 89, avgRpiImpact: 2.1 },
]

const segmentPerformance = [
  { segment: "BEV", rpi: 96.2, daysAvg: 42, volume: 234, trend: "rising" as const },
  { segment: "PHEV", rpi: 94.8, daysAvg: 38, volume: 312, trend: "stable" as const },
  { segment: "Diesel", rpi: 91.3, daysAvg: 56, volume: 567, trend: "falling" as const },
  { segment: "Petrol", rpi: 93.7, daysAvg: 44, volume: 423, trend: "stable" as const },
  { segment: "Hybrid (HEV)", rpi: 95.1, daysAvg: 35, volume: 189, trend: "rising" as const },
]

const channelPerformance = [
  { channel: "Dealer ROFR", rpi: 97.2, daysAvg: 28, volume: 412, conversion: 68 },
  { channel: "Fixed Price", rpi: 94.1, daysAvg: 45, volume: 534, conversion: 42 },
  { channel: "Auction", rpi: 91.8, daysAvg: 52, volume: 289, conversion: 78 },
  { channel: "Export", rpi: 99.4, daysAvg: 38, volume: 156, conversion: 85 },
  { channel: "Make Offer", rpi: 93.5, daysAvg: 61, volume: 234, conversion: 35 },
]

const weeklyTrend = [
  { week: "W1", actual: 94.2, predicted: 94.5 },
  { week: "W2", actual: 93.8, predicted: 94.1 },
  { week: "W3", actual: 95.1, predicted: 94.8 },
  { week: "W4", actual: 94.5, predicted: 94.6 },
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d")
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <AppLayout title="Analytics" subtitle="Model performance, closed-loop learning, and decision quality">
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex items-center justify-between">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="model">Model Performance</TabsTrigger>
              <TabsTrigger value="overrides">Override Analysis</TabsTrigger>
              <TabsTrigger value="segments">Segment Insights</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="ytd">Year to date</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Portfolio RPI</span>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      +1.2%
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold">94.5%</div>
                  <div className="text-xs text-muted-foreground mt-1">vs 93.3% target</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Avg Days to Sell</span>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                      -3d
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold">42</div>
                  <div className="text-xs text-muted-foreground mt-1">vs 45 target</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">DE Adoption Rate</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <Minus className="h-3 w-3 mr-1" />
                      0%
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold">87.6%</div>
                  <div className="text-xs text-muted-foreground mt-1">recommendations followed</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Prediction Accuracy</span>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      +2.1%
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold">91.2%</div>
                  <div className="text-xs text-muted-foreground mt-1">within 5% of actual</div>
                </CardContent>
              </Card>
            </div>

            {/* RPI Trend Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  RPI Performance vs Prediction
                </CardTitle>
                <CardDescription>Weekly comparison of actual RPI against Decision Engine predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-around gap-4 pt-8">
                  {weeklyTrend.map((week) => (
                    <div key={week.week} className="flex flex-col items-center gap-2 flex-1">
                      <div className="flex items-end gap-1 h-40">
                        <div
                          className="w-8 bg-primary/20 rounded-t"
                          style={{ height: `${(week.predicted - 90) * 20}%` }}
                        />
                        <div className="w-8 bg-primary rounded-t" style={{ height: `${(week.actual - 90) * 20}%` }} />
                      </div>
                      <span className="text-sm text-muted-foreground">{week.week}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-primary/20" />
                    <span className="text-sm text-muted-foreground">Predicted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-primary" />
                    <span className="text-sm text-muted-foreground">Actual</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Channel Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Channel Performance</CardTitle>
                <CardDescription>RPI and conversion by sales channel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {channelPerformance.map((channel) => (
                    <div key={channel.channel} className="flex items-center gap-4">
                      <div className="w-28 font-medium text-sm">{channel.channel}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">RPI</span>
                          <span className="font-medium">{channel.rpi}%</span>
                        </div>
                        <Progress value={channel.rpi} className="h-2" />
                      </div>
                      <div className="w-20 text-right">
                        <div className="text-sm font-medium">{channel.daysAvg}d</div>
                        <div className="text-xs text-muted-foreground">avg days</div>
                      </div>
                      <div className="w-20 text-right">
                        <div className="text-sm font-medium">{channel.volume}</div>
                        <div className="text-xs text-muted-foreground">sales</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Model Performance Tab */}
        {activeTab === "model" && (
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Model Accuracy Scores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Pricing Accuracy</span>
                    <span className="text-sm font-medium">{modelPerformance.pricingAccuracy}%</span>
                  </div>
                  <Progress value={modelPerformance.pricingAccuracy} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1">Recommended price within 5% of final sale price</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Channel Accuracy</span>
                    <span className="text-sm font-medium">{modelPerformance.channelAccuracy}%</span>
                  </div>
                  <Progress value={modelPerformance.channelAccuracy} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1">Recommended channel was optimal for RPI</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Days-to-Sell Accuracy</span>
                    <span className="text-sm font-medium">{modelPerformance.daysToSellAccuracy}%</span>
                  </div>
                  <Progress value={modelPerformance.daysToSellAccuracy} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1">Predicted days within 7 days of actual</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Recommendation Outcomes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-emerald-50 rounded-lg text-center">
                    <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-emerald-700">87.6%</div>
                    <div className="text-sm text-emerald-600">Followed DE</div>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg text-center">
                    <AlertTriangle className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-amber-700">12.4%</div>
                    <div className="text-sm text-amber-600">Overridden</div>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Override Impact</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    When users override DE recommendations, outcomes are{" "}
                    <span className="font-semibold text-red-600">34% worse</span> on average. Exceptions: &quot;Customer
                    order&quot; and &quot;Brand protection&quot; overrides show positive outcomes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Override Analysis Tab */}
        {activeTab === "overrides" && (
          <Card>
            <CardHeader>
              <CardTitle>Override Reason Analysis</CardTitle>
              <CardDescription>Understanding when human overrides help or hurt outcomes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-sm">Override Reason</th>
                      <th className="text-right py-3 px-4 font-medium text-sm">Count</th>
                      <th className="text-right py-3 px-4 font-medium text-sm">Success Rate</th>
                      <th className="text-right py-3 px-4 font-medium text-sm">Avg RPI Impact</th>
                      <th className="text-center py-3 px-4 font-medium text-sm">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overrideAnalysis.map((item) => (
                      <tr key={item.reason} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{item.reason}</td>
                        <td className="py-3 px-4 text-right">{item.count}</td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={cn("font-medium", item.successRate >= 50 ? "text-emerald-600" : "text-red-600")}
                          >
                            {item.successRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={cn("font-medium", item.avgRpiImpact >= 0 ? "text-emerald-600" : "text-red-600")}
                          >
                            {item.avgRpiImpact >= 0 ? "+" : ""}
                            {item.avgRpiImpact}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {item.successRate >= 50 ? (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Allow
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 border-red-200">
                              <XCircle className="h-3 w-3 mr-1" />
                              Discourage
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="font-medium text-blue-900 mb-2">Insights</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    &bull; &quot;Customer order&quot; overrides have the highest success rate (89%) and should be
                    encouraged
                  </li>
                  <li>
                    &bull; &quot;Aging stock priority&quot; overrides often lead to worse outcomes - consider adjusting
                    DE timing
                  </li>
                  <li>
                    &bull; &quot;Local market knowledge&quot; shows mixed results - may indicate regional model
                    calibration needed
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Segment Insights Tab */}
        {activeTab === "segments" && (
          <Card>
            <CardHeader>
              <CardTitle>Segment Performance</CardTitle>
              <CardDescription>RPI, days-to-sell, and trends by powertrain segment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-sm">Segment</th>
                      <th className="text-right py-3 px-4 font-medium text-sm">RPI</th>
                      <th className="text-right py-3 px-4 font-medium text-sm">Avg Days</th>
                      <th className="text-right py-3 px-4 font-medium text-sm">Volume</th>
                      <th className="text-center py-3 px-4 font-medium text-sm">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {segmentPerformance.map((segment) => (
                      <tr key={segment.segment} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{segment.segment}</td>
                        <td className="py-3 px-4 text-right font-medium">{segment.rpi}%</td>
                        <td className="py-3 px-4 text-right">{segment.daysAvg}</td>
                        <td className="py-3 px-4 text-right">{segment.volume}</td>
                        <td className="py-3 px-4 text-center">
                          {segment.trend === "rising" && (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Rising
                            </Badge>
                          )}
                          {segment.trend === "stable" && (
                            <Badge variant="outline">
                              <Minus className="h-3 w-3 mr-1" />
                              Stable
                            </Badge>
                          )}
                          {segment.trend === "falling" && (
                            <Badge className="bg-red-100 text-red-700 border-red-200">
                              <TrendingDown className="h-3 w-3 mr-1" />
                              Falling
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
