"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConfidenceBadge } from "@/components/ui/confidence-badge"
import {
  Play,
  Save,
  RotateCcw,
  Euro,
  AlertTriangle,
  Zap,
  Globe,
  BarChart3,
  Target,
  ArrowRight,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SimulationResult {
  volumeChange: number
  rpiChange: number
  daysChange: number
  revenueImpact: number
  affectedVehicles: number
  confidence: "high" | "medium" | "low"
}

interface SavedScenario {
  id: string
  name: string
  type: string
  description: string
  createdAt: Date
  lastResult?: {
    rpiChange: number
    volumeChange: number
  }
}

const savedScenarios: SavedScenario[] = [
  {
    id: "1",
    name: "BEV Fire Sale Prevention",
    type: "pacing",
    description: "Early intervention for aging BEVs before 90-day mark",
    createdAt: new Date("2024-01-15"),
    lastResult: { rpiChange: 1.2, volumeChange: 18 },
  },
  {
    id: "2",
    name: "PHEV Export Push",
    type: "channel",
    description: "Route PHEVs to NL/DE where demand is stronger",
    createdAt: new Date("2024-01-10"),
    lastResult: { rpiChange: 2.8, volumeChange: 12 },
  },
  {
    id: "3",
    name: "Diesel Stress Test",
    type: "shock",
    description: "15% market drop scenario for diesel inventory",
    createdAt: new Date("2024-01-08"),
    lastResult: { rpiChange: -4.2, volumeChange: -8 },
  },
  {
    id: "4",
    name: "Month-End Volume Push",
    type: "pacing",
    description: "Aggressive pricing for 60+ day stock",
    createdAt: new Date("2024-01-05"),
    lastResult: { rpiChange: -1.8, volumeChange: 45 },
  },
]

export default function SimulationPage() {
  const [activeTab, setActiveTab] = useState("price")
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<SimulationResult | null>(null)

  // Price simulation controls
  const [priceAdjustment, setPriceAdjustment] = useState([-5])
  const [priceSegment, setPriceSegment] = useState("all")
  const [priceAgeFilter, setPriceAgeFilter] = useState("all")

  // Channel simulation controls
  const [channelFrom, setChannelFrom] = useState("fixed-price")
  const [channelTo, setChannelTo] = useState("export")
  const [channelMinUplift, setChannelMinUplift] = useState([1000])

  // Market shock controls
  const [shockSegment, setShockSegment] = useState("bev")
  const [shockMagnitude, setShockMagnitude] = useState([-10])
  const [shockDuration, setShockDuration] = useState([14])

  // Pacing controls
  const [pacingAgeThreshold, setPacingAgeThreshold] = useState([60])
  const [pacingDiscount, setPacingDiscount] = useState([3])
  const [pacingTargetVolume, setPacingTargetVolume] = useState([150])

  const runSimulation = () => {
    setIsRunning(true)
    setTimeout(() => {
      setResult({
        volumeChange: Math.floor(Math.random() * 50) - 10,
        rpiChange: (Math.random() - 0.5) * 6,
        daysChange: Math.floor(Math.random() * 20) - 10,
        revenueImpact: Math.floor((Math.random() - 0.3) * 200000),
        affectedVehicles: Math.floor(Math.random() * 100) + 20,
        confidence: ["high", "medium", "low"][Math.floor(Math.random() * 3)] as SimulationResult["confidence"],
      })
      setIsRunning(false)
    }, 1500)
  }

  const resetSimulation = () => {
    setResult(null)
  }

  return (
    <AppLayout title="Simulation" subtitle="What-if scenario modeling and impact analysis">
      <div className="grid grid-cols-3 gap-6">
        {/* Left: Simulation Builder */}
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Scenario Builder
              </CardTitle>
              <CardDescription>Configure parameters to simulate different remarketing strategies</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="price" className="gap-2">
                    <Euro className="h-4 w-4" />
                    Price Change
                  </TabsTrigger>
                  <TabsTrigger value="channel" className="gap-2">
                    <Globe className="h-4 w-4" />
                    Channel Routing
                  </TabsTrigger>
                  <TabsTrigger value="shock" className="gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Market Shock
                  </TabsTrigger>
                  <TabsTrigger value="pacing" className="gap-2">
                    <Target className="h-4 w-4" />
                    Pacing Push
                  </TabsTrigger>
                </TabsList>

                {/* Price Change Tab */}
                <TabsContent value="price" className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="mb-3 block">Price Adjustment</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={priceAdjustment}
                            onValueChange={setPriceAdjustment}
                            min={-15}
                            max={10}
                            step={1}
                            className="flex-1"
                          />
                          <span
                            className={cn(
                              "w-16 text-right font-mono font-bold",
                              priceAdjustment[0] < 0 ? "text-red-600" : "text-emerald-600",
                            )}
                          >
                            {priceAdjustment[0] > 0 ? "+" : ""}
                            {priceAdjustment[0]}%
                          </span>
                        </div>
                      </div>

                      <div>
                        <Label className="mb-2 block">Segment</Label>
                        <Select value={priceSegment} onValueChange={setPriceSegment}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Segments</SelectItem>
                            <SelectItem value="bev">BEV Only</SelectItem>
                            <SelectItem value="phev">PHEV Only</SelectItem>
                            <SelectItem value="diesel">Diesel Only</SelectItem>
                            <SelectItem value="premium">Premium Brands</SelectItem>
                            <SelectItem value="volume">Volume Brands</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="mb-2 block">Age Filter</Label>
                        <Select value={priceAgeFilter} onValueChange={setPriceAgeFilter}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Ages</SelectItem>
                            <SelectItem value="0-30">0-30 days</SelectItem>
                            <SelectItem value="30-60">30-60 days</SelectItem>
                            <SelectItem value="60-90">60-90 days</SelectItem>
                            <SelectItem value="90+">90+ days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-3">Scenario Summary</h4>
                      <p className="text-sm text-muted-foreground">
                        Apply a <span className="font-semibold text-foreground">{priceAdjustment[0]}%</span> price
                        adjustment to{" "}
                        <span className="font-semibold text-foreground">
                          {priceSegment === "all" ? "all segments" : priceSegment}
                        </span>
                        {priceAgeFilter !== "all" && (
                          <>
                            {" "}
                            aged <span className="font-semibold text-foreground">{priceAgeFilter}</span> days
                          </>
                        )}
                        .
                      </p>
                      <div className="mt-4 pt-4 border-t">
                        <div className="text-sm text-muted-foreground mb-2">Estimated affected vehicles:</div>
                        <div className="text-2xl font-bold">~{priceSegment === "all" ? "127" : "34"} vehicles</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Channel Routing Tab */}
                <TabsContent value="channel" className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="mb-2 block">From Channel</Label>
                        <Select value={channelFrom} onValueChange={setChannelFrom}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed-price">Fixed Price</SelectItem>
                            <SelectItem value="auction">Auction</SelectItem>
                            <SelectItem value="dealer-rofr">Dealer ROFR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-center py-2">
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>

                      <div>
                        <Label className="mb-2 block">To Channel</Label>
                        <Select value={channelTo} onValueChange={setChannelTo}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="export">Export (Netherlands)</SelectItem>
                            <SelectItem value="export-de">Export (Germany)</SelectItem>
                            <SelectItem value="auction">Auction</SelectItem>
                            <SelectItem value="dealer-rofr">Dealer ROFR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="mb-3 block">Minimum Uplift Threshold</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={channelMinUplift}
                            onValueChange={setChannelMinUplift}
                            min={0}
                            max={3000}
                            step={100}
                            className="flex-1"
                          />
                          <span className="w-20 text-right font-mono font-bold text-emerald-600">
                            +{channelMinUplift[0].toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-3">Scenario Summary</h4>
                      <p className="text-sm text-muted-foreground">
                        Route vehicles from{" "}
                        <span className="font-semibold text-foreground">{channelFrom.replace("-", " ")}</span> to{" "}
                        <span className="font-semibold text-foreground">{channelTo.replace("-", " ")}</span> where
                        expected uplift exceeds{" "}
                        <span className="font-semibold text-foreground">{channelMinUplift[0].toLocaleString()}</span>.
                      </p>
                      <div className="mt-4 pt-4 border-t">
                        <div className="text-sm text-muted-foreground mb-2">Estimated affected vehicles:</div>
                        <div className="text-2xl font-bold">~28 vehicles</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Market Shock Tab */}
                <TabsContent value="shock" className="space-y-6">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-900">Stress Test Mode</h4>
                        <p className="text-sm text-amber-700 mt-1">
                          This scenario simulates external market shocks to test portfolio resilience.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="mb-2 block">Affected Segment</Label>
                        <Select value={shockSegment} onValueChange={setShockSegment}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bev">BEV (Electric)</SelectItem>
                            <SelectItem value="phev">PHEV (Plug-in Hybrid)</SelectItem>
                            <SelectItem value="diesel">Diesel</SelectItem>
                            <SelectItem value="all">All Segments</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="mb-3 block">Price Shock Magnitude</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={shockMagnitude}
                            onValueChange={setShockMagnitude}
                            min={-25}
                            max={0}
                            step={1}
                            className="flex-1"
                          />
                          <span className="w-16 text-right font-mono font-bold text-red-600">{shockMagnitude[0]}%</span>
                        </div>
                      </div>

                      <div>
                        <Label className="mb-3 block">Duration (days)</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={shockDuration}
                            onValueChange={setShockDuration}
                            min={7}
                            max={60}
                            step={7}
                            className="flex-1"
                          />
                          <span className="w-16 text-right font-mono font-bold">{shockDuration[0]}d</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                      <h4 className="font-medium mb-3 text-red-900">Stress Test Scenario</h4>
                      <p className="text-sm text-red-800">
                        Simulate a <span className="font-semibold">{shockMagnitude[0]}%</span> price drop in the{" "}
                        <span className="font-semibold">{shockSegment.toUpperCase()}</span> segment lasting{" "}
                        <span className="font-semibold">{shockDuration[0]} days</span>.
                      </p>
                      <div className="mt-4 pt-4 border-t border-red-200">
                        <div className="text-sm text-red-700 mb-2">Exposed vehicles:</div>
                        <div className="text-2xl font-bold text-red-900">~89 vehicles</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Pacing Tab */}
                <TabsContent value="pacing" className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="mb-3 block">Age Threshold (days)</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={pacingAgeThreshold}
                            onValueChange={setPacingAgeThreshold}
                            min={30}
                            max={120}
                            step={10}
                            className="flex-1"
                          />
                          <span className="w-16 text-right font-mono font-bold">{pacingAgeThreshold[0]}d+</span>
                        </div>
                      </div>

                      <div>
                        <Label className="mb-3 block">Discount to Apply</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={pacingDiscount}
                            onValueChange={setPacingDiscount}
                            min={1}
                            max={10}
                            step={0.5}
                            className="flex-1"
                          />
                          <span className="w-16 text-right font-mono font-bold text-red-600">
                            -{pacingDiscount[0]}%
                          </span>
                        </div>
                      </div>

                      <div>
                        <Label className="mb-3 block">Target Volume</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={pacingTargetVolume}
                            onValueChange={setPacingTargetVolume}
                            min={50}
                            max={300}
                            step={10}
                            className="flex-1"
                          />
                          <span className="w-16 text-right font-mono font-bold">{pacingTargetVolume[0]}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-3">Month-End Push</h4>
                      <p className="text-sm text-muted-foreground">
                        Apply <span className="font-semibold text-foreground">-{pacingDiscount[0]}%</span> discount to
                        vehicles aged{" "}
                        <span className="font-semibold text-foreground">{pacingAgeThreshold[0]}+ days</span> to hit
                        volume target of{" "}
                        <span className="font-semibold text-foreground">{pacingTargetVolume[0]} units</span>.
                      </p>
                      <div className="mt-4 pt-4 border-t">
                        <div className="text-sm text-muted-foreground mb-2">Affected vehicles:</div>
                        <div className="text-2xl font-bold">~{pacingAgeThreshold[0] <= 60 ? "62" : "34"} vehicles</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <Button variant="outline" onClick={resetSimulation} disabled={isRunning}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="outline">
                    <Save className="h-4 w-4 mr-2" />
                    Save Scenario
                  </Button>
                  <Button onClick={runSimulation} disabled={isRunning}>
                    {isRunning ? (
                      <>
                        <div className="h-4 w-4 mr-2 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Run Simulation
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Simulation Results
                  </CardTitle>
                  <ConfidenceBadge level={result.confidence} showLabel />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Volume Impact</div>
                    <div
                      className={cn(
                        "text-2xl font-bold",
                        result.volumeChange >= 0 ? "text-emerald-600" : "text-red-600",
                      )}
                    >
                      {result.volumeChange >= 0 ? "+" : ""}
                      {result.volumeChange}
                    </div>
                    <div className="text-xs text-muted-foreground">vehicles</div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <div className="text-sm text-muted-foreground mb-1">RPI Change</div>
                    <div
                      className={cn("text-2xl font-bold", result.rpiChange >= 0 ? "text-emerald-600" : "text-red-600")}
                    >
                      {result.rpiChange >= 0 ? "+" : ""}
                      {result.rpiChange.toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Days Impact</div>
                    <div
                      className={cn(
                        "text-2xl font-bold",
                        result.daysChange <= 0 ? "text-emerald-600" : "text-amber-600",
                      )}
                    >
                      {result.daysChange > 0 ? "+" : ""}
                      {result.daysChange}d
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Revenue Impact</div>
                    <div
                      className={cn(
                        "text-2xl font-bold",
                        result.revenueImpact >= 0 ? "text-emerald-600" : "text-red-600",
                      )}
                    >
                      {result.revenueImpact >= 0 ? "+" : ""}
                      {(result.revenueImpact / 1000).toFixed(0)}k
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Affected</div>
                    <div className="text-2xl font-bold">{result.affectedVehicles}</div>
                    <div className="text-xs text-muted-foreground">vehicles</div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t">
                  <Button variant="outline">
                    <XCircle className="h-4 w-4 mr-2" />
                    Discard
                  </Button>
                  <Button>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Apply Scenario
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Saved Scenarios */}
        <div className="space-y-4">
          <h3 className="font-semibold">Saved Scenarios</h3>
          {savedScenarios.map((scenario) => (
            <Card key={scenario.id} className="cursor-pointer hover:border-primary transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{scenario.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {scenario.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{scenario.description}</p>
                {scenario.lastResult && (
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      {scenario.lastResult.rpiChange >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      <span className={scenario.lastResult.rpiChange >= 0 ? "text-emerald-600" : "text-red-600"}>
                        {scenario.lastResult.rpiChange >= 0 ? "+" : ""}
                        {scenario.lastResult.rpiChange}% RPI
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">
                        {scenario.lastResult.volumeChange >= 0 ? "+" : ""}
                        {scenario.lastResult.volumeChange} vol
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                  <Clock className="h-3 w-3" />
                  {scenario.createdAt.toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
