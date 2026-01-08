"use client"

import { useMemo, useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { StatCard } from "@/components/ui/stat-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NSCLeagueTable } from "@/components/dashboard/nsc-league-table"
import { CounterfactualCard } from "@/components/dashboard/counterfactual-card"
import { ArbitrageFlow } from "@/components/dashboard/arbitrage-flow"
import { SegmentRiskMatrix } from "@/components/dashboard/segment-risk-matrix"
import { PacingInterventions } from "@/components/dashboard/pacing-interventions"
import {
  TrendingUp,
  Clock,
  AlertTriangle,
  Target,
  ArrowRight,
  Activity,
  Gauge,
  Globe,
  Shield,
  BarChart3,
  Users,
} from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine } from "recharts"
import {
  generateVehicles,
  calculatePortfolioStats,
  generatePacingData,
  generateNSCPerformance,
  generateArbitrageData,
  generateCounterfactualMetrics,
  generateSegmentPerformance,
  type NSCPerformance,
} from "@/lib/mock-data"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

  const vehicles = useMemo(() => generateVehicles(500), [])
  const stats = useMemo(() => calculatePortfolioStats(vehicles), [vehicles])
  const pacingData = useMemo(() => generatePacingData(stats.monthTarget), [stats.monthTarget])
  const nscData = useMemo(() => generateNSCPerformance(), [])
  const arbitrageData = useMemo(() => generateArbitrageData(), [])
  const counterfactualMetrics = useMemo(() => generateCounterfactualMetrics(), [])
  const segmentData = useMemo(() => generateSegmentPerformance(), [])

  // Aggregate NSC stats
  const portfolioTotals = useMemo(() => {
    const totals = nscData.reduce(
      (acc, nsc) => ({
        volumeActual: acc.volumeActual + nsc.volumeActual,
        volumeTarget: acc.volumeTarget + nsc.volumeTarget,
        arbitrageCaptured: acc.arbitrageCaptured + nsc.arbitrageCaptured,
        arbitrageMissed: acc.arbitrageMissed + nsc.arbitrageMissed,
      }),
      { volumeActual: 0, volumeTarget: 0, arbitrageCaptured: 0, arbitrageMissed: 0 },
    )

    const avgAdherence = Math.round(nscData.reduce((sum, n) => sum + n.playbookAdherence, 0) / nscData.length)
    const avgRpi = (nscData.reduce((sum, n) => sum + n.rpiActual, 0) / nscData.length).toFixed(1)

    return { ...totals, avgAdherence, avgRpi }
  }, [nscData])

  // Inventory aging distribution
  const agingData = useMemo(() => {
    const buckets = [
      { range: "0-30", count: 0, color: "#10b981" },
      { range: "31-60", count: 0, color: "#f59e0b" },
      { range: "61-90", count: 0, color: "#f97316" },
      { range: "90+", count: 0, color: "#ef4444" },
    ]
    vehicles.forEach((v) => {
      if (v.daysInStock <= 30) buckets[0].count++
      else if (v.daysInStock <= 60) buckets[1].count++
      else if (v.daysInStock <= 90) buckets[2].count++
      else buckets[3].count++
    })
    return buckets
  }, [vehicles])

  const currentDay = 18

  const handleNSCDrillDown = (nsc: NSCPerformance) => {
    // Would navigate to filtered inventory view
    console.log("Drill down to", nsc.country)
  }

  return (
    <AppLayout title="HQ Portfolio View" subtitle="10,000ft overview across all European markets">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Portfolio Overview
          </TabsTrigger>
          <TabsTrigger value="markets" className="gap-2">
            <Globe className="h-4 w-4" />
            Markets & Arbitrage
          </TabsTrigger>
          <TabsTrigger value="governance" className="gap-2">
            <Shield className="h-4 w-4" />
            Governance
          </TabsTrigger>
          <TabsTrigger value="pacing" className="gap-2">
            <Target className="h-4 w-4" />
            Pacing & Risk
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* KPI Cards Row - Director focused metrics */}
          <div className="grid grid-cols-5 gap-4">
            <StatCard
              title="Portfolio RPI"
              value={`${portfolioTotals.avgRpi}%`}
              subtitle="vs 94.5% target"
              icon={TrendingUp}
              trend={{ value: 1.8, label: "vs last month" }}
              status="success"
            />
            <StatCard
              title="Avg Days to Sell"
              value={stats.avgDaysInStock}
              subtitle="Target: 28 days"
              icon={Clock}
              trend={{ value: -3, label: "improvement" }}
              status={stats.avgDaysInStock > 35 ? "warning" : "success"}
            />
            <StatCard
              title="Volume Attainment"
              value={`${Math.round((portfolioTotals.volumeActual / portfolioTotals.volumeTarget) * 100)}%`}
              subtitle={`${portfolioTotals.volumeActual.toLocaleString()} / ${portfolioTotals.volumeTarget.toLocaleString()}`}
              icon={Target}
              status={portfolioTotals.volumeActual / portfolioTotals.volumeTarget < 0.85 ? "warning" : "success"}
            />
            <StatCard
              title="Playbook Adherence"
              value={`${portfolioTotals.avgAdherence}%`}
              subtitle="Across all NSCs"
              icon={Shield}
              status={portfolioTotals.avgAdherence < 80 ? "warning" : "success"}
            />
            <StatCard
              title="Net Arbitrage"
              value={`€${((portfolioTotals.arbitrageCaptured - portfolioTotals.arbitrageMissed) / 1000).toFixed(0)}k`}
              subtitle={`€${(portfolioTotals.arbitrageMissed / 1000).toFixed(0)}k missed`}
              icon={Globe}
              status={portfolioTotals.arbitrageMissed > portfolioTotals.arbitrageCaptured * 0.3 ? "warning" : "success"}
            />
          </div>

          {/* NSC League Table + Counterfactual */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <NSCLeagueTable data={nscData} onDrillDown={handleNSCDrillDown} />
            </div>
            <div className="space-y-4">
              <CounterfactualCard data={counterfactualMetrics} />
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                    <AlertTriangle className="h-4 w-4 text-red-500" />3 NSCs below RPI target
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                    <Users className="h-4 w-4 text-amber-500" />2 NSCs with low adherence
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                    <Globe className="h-4 w-4 text-blue-500" />
                    €110k pending arbitrage
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* MARKETS & ARBITRAGE TAB */}
        <TabsContent value="markets" className="mt-6 space-y-6">
          <div className="grid grid-cols-5 gap-4">
            <StatCard
              title="Arbitrage Captured"
              value={`€${(portfolioTotals.arbitrageCaptured / 1000).toFixed(0)}k`}
              subtitle="This month"
              icon={TrendingUp}
              trend={{ value: 12, label: "vs last month" }}
              status="success"
            />
            <StatCard
              title="Arbitrage Missed"
              value={`€${(portfolioTotals.arbitrageMissed / 1000).toFixed(0)}k`}
              subtitle="Opportunity cost"
              icon={AlertTriangle}
              status="danger"
            />
            <StatCard
              title="Pending Opportunities"
              value="€110k"
              subtitle="85 vehicles"
              icon={Clock}
              status="warning"
            />
            <StatCard
              title="Top Export Route"
              value="DE → NL"
              subtitle="+€1,250 avg/unit"
              icon={Globe}
              status="success"
            />
            <StatCard
              title="Cross-border Volume"
              value="18%"
              subtitle="of total sales"
              icon={Activity}
              status="success"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ArbitrageFlow data={arbitrageData} />
            <SegmentRiskMatrix data={segmentData} />
          </div>
        </TabsContent>

        {/* GOVERNANCE TAB */}
        <TabsContent value="governance" className="mt-6 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              title="Avg Adherence"
              value={`${portfolioTotals.avgAdherence}%`}
              subtitle="Target: 85%"
              icon={Shield}
              status={portfolioTotals.avgAdherence >= 85 ? "success" : "warning"}
            />
            <StatCard
              title="Override Rate"
              value="17%"
              subtitle="Avg across NSCs"
              icon={AlertTriangle}
              status="warning"
            />
            <StatCard
              title="Top Override Reason"
              value="Volume pressure"
              subtitle="34% of overrides"
              icon={Target}
              status="danger"
            />
            <StatCard
              title="Override Outcome"
              value="-1.2% RPI"
              subtitle="Avg impact when overridden"
              icon={TrendingUp}
              status="danger"
            />
          </div>

          <NSCLeagueTable data={nscData} onDrillDown={handleNSCDrillDown} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Override Pattern Analysis</CardTitle>
              <CardDescription>Top reasons for deviating from DE recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { reason: "Volume target pressure", count: 156, avgOutcome: -2.1, worstNsc: "Italy" },
                  { reason: "Local market knowledge", count: 89, avgOutcome: 0.4, worstNsc: "Spain" },
                  { reason: "Strategic buyer", count: 67, avgOutcome: 1.2, worstNsc: "Germany" },
                  { reason: "Brand policy", count: 45, avgOutcome: 0.1, worstNsc: "France" },
                  { reason: "Damage assessment", count: 38, avgOutcome: -0.8, worstNsc: "Portugal" },
                  { reason: "Cross-border complexity", count: 23, avgOutcome: -1.4, worstNsc: "Belgium" },
                ].map((item) => (
                  <div key={item.reason} className="p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{item.reason}</span>
                      <Badge variant={item.avgOutcome < 0 ? "destructive" : "secondary"} className="text-xs">
                        {item.avgOutcome > 0 ? "+" : ""}
                        {item.avgOutcome}% RPI
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{item.count} occurrences</span>
                      <span>Most: {item.worstNsc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PACING & RISK TAB */}
        <TabsContent value="pacing" className="mt-6 space-y-6">
          <div className="grid grid-cols-5 gap-4">
            <StatCard
              title="MTD Volume"
              value={stats.monthActual.toLocaleString()}
              subtitle={`of ${stats.monthTarget.toLocaleString()} target`}
              icon={Target}
              status={stats.monthActual / stats.monthTarget < 0.5 ? "warning" : "success"}
            />
            <StatCard
              title="Forecasted Close"
              value={stats.monthForecast.toLocaleString()}
              subtitle={`${((stats.monthForecast / stats.monthTarget) * 100).toFixed(0)}% of target`}
              icon={TrendingUp}
              status={stats.monthForecast < stats.monthTarget * 0.95 ? "danger" : "success"}
            />
            <StatCard
              title="Compression Index"
              value={`${stats.compressionIndex}%`}
              subtitle="Month-end risk"
              icon={Gauge}
              status={stats.compressionIndex > 65 ? "danger" : stats.compressionIndex > 45 ? "warning" : "success"}
            />
            <StatCard
              title="At Risk Segments"
              value="2"
              subtitle="EV SUV, Compact EV"
              icon={AlertTriangle}
              status="danger"
            />
            <StatCard title="Days Remaining" value="12" subtitle="Working days" icon={Clock} status="warning" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Pacing Chart */}
            <Card className="col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Monthly Pacing vs Target</CardTitle>
                    <CardDescription>
                      {stats.monthActual.toLocaleString()} sold / {stats.monthTarget.toLocaleString()} target
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500" />
                      <span className="text-sm text-muted-foreground">Actual</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-slate-300" />
                      <span className="text-sm text-muted-foreground">Target</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-200" />
                      <span className="text-sm text-muted-foreground">Forecast</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full" style={{ minWidth: 0, minHeight: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={pacingData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#e5e7eb" }} />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
                      />
                      <Tooltip
                        formatter={(value: number) => value.toLocaleString()}
                        labelFormatter={(label) => `Day ${label}`}
                      />
                      <ReferenceLine x={currentDay} stroke="#94a3b8" strokeDasharray="3 3" />
                      <Area type="monotone" dataKey="target" stroke="#cbd5e1" fill="#f1f5f9" strokeWidth={2} />
                      <Area
                        type="monotone"
                        dataKey="forecast"
                        stroke="#93c5fd"
                        fill="#dbeafe"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                      <Area type="monotone" dataKey="actual" stroke="#3b82f6" fill="#bfdbfe" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Badge variant={stats.monthForecast < stats.monthTarget * 0.95 ? "destructive" : "secondary"}>
                      {stats.monthForecast < stats.monthTarget * 0.95 ? "At Risk" : "On Track"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Gap: {(stats.monthTarget - stats.monthForecast).toLocaleString()} units
                    </span>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                    Simulate Interventions
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Compression Gauge */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Month-End Compression</CardTitle>
                <CardDescription>Risk of fire-sale in final days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-48">
                  <div className="relative">
                    <svg className="h-36 w-36 -rotate-90">
                      <circle cx="72" cy="72" r="60" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        fill="none"
                        stroke={
                          stats.compressionIndex > 70 ? "#ef4444" : stats.compressionIndex > 50 ? "#f59e0b" : "#10b981"
                        }
                        strokeWidth="12"
                        strokeDasharray={`${(stats.compressionIndex / 100) * 377} 377`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold">{stats.compressionIndex}%</span>
                      <span className="text-sm text-muted-foreground">Index</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <Badge
                    variant={
                      stats.compressionIndex > 70
                        ? "destructive"
                        : stats.compressionIndex > 50
                          ? "outline"
                          : "secondary"
                    }
                  >
                    {stats.compressionIndex > 70 ? "High Risk" : stats.compressionIndex > 50 ? "Moderate" : "Healthy"}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-2">
                    {stats.compressionIndex > 50
                      ? "Early interventions needed to flatten sales curve"
                      : "Sales well distributed across the month"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interventions */}
          <PacingInterventions />
        </TabsContent>
      </Tabs>
    </AppLayout>
  )
}
