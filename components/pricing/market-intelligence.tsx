"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ConfidenceBadge } from "@/components/ui/confidence-badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowRight, TrendingUp, Globe, BarChart3 } from "lucide-react"
import { type MarketComparison, countries } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from "recharts"

interface MarketIntelligenceProps {
  comparisons: MarketComparison[]
}

export function MarketIntelligence({ comparisons }: MarketIntelligenceProps) {
  const [selectedModel, setSelectedModel] = useState<string>(comparisons[0]?.model || "")

  const selectedComparison = comparisons.find((c) => c.model === selectedModel)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value)
  }

  const chartData =
    selectedComparison?.countries.map((c) => ({
      country: c.country,
      name: countries[c.country].name,
      avgPrice: c.avgPrice,
      avgDaysToSell: c.avgDaysToSell,
      demandScore: c.demandScore,
    })) || []

  // Find best and worst markets
  const sortedByPrice = [...(selectedComparison?.countries || [])].sort((a, b) => b.avgPrice - a.avgPrice)
  const bestMarket = sortedByPrice[0]
  const worstMarket = sortedByPrice[sortedByPrice.length - 1]
  const priceSpread = bestMarket && worstMarket ? bestMarket.avgPrice - worstMarket.avgPrice : 0

  // Calculate total arbitrage opportunity
  const totalArbitrageOpportunity = comparisons.reduce((sum, c) => {
    return sum + (c.bestExportRoute?.netUplift || 0)
  }, 0)

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Models Tracked</p>
                <p className="text-2xl font-semibold">{comparisons.length}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Markets Compared</p>
                <p className="text-2xl font-semibold">8</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Arbitrage Routes</p>
                <p className="text-2xl font-semibold">{comparisons.filter((c) => c.bestExportRoute).length}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <ArrowRight className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Opportunity</p>
                <p className="text-2xl font-semibold text-emerald-600">{formatCurrency(totalArbitrageOpportunity)}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Model selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Cross-Market Price Comparison</CardTitle>
              <CardDescription>Compare pricing, demand, and days-to-sell across European markets</CardDescription>
            </div>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {comparisons.map((c) => (
                  <SelectItem key={c.model} value={c.model}>
                    {c.model} ({c.fuelType})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {selectedComparison && (
            <div className="space-y-6">
              {/* Price spread summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-200">
                  <p className="text-sm text-muted-foreground mb-1">Best Market</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{countries[bestMarket.country].flag}</span>
                    <span className="font-semibold">{countries[bestMarket.country].name}</span>
                  </div>
                  <p className="text-xl font-semibold text-emerald-600 mt-1">{formatCurrency(bestMarket.avgPrice)}</p>
                </div>
                <div className="p-4 rounded-lg bg-red-500/5 border border-red-200">
                  <p className="text-sm text-muted-foreground mb-1">Weakest Market</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{countries[worstMarket.country].flag}</span>
                    <span className="font-semibold">{countries[worstMarket.country].name}</span>
                  </div>
                  <p className="text-xl font-semibold text-red-600 mt-1">{formatCurrency(worstMarket.avgPrice)}</p>
                </div>
                <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-200">
                  <p className="text-sm text-muted-foreground mb-1">Price Spread</p>
                  <p className="text-xl font-semibold text-blue-600">{formatCurrency(priceSpread)}</p>
                  <p className="text-sm text-muted-foreground">
                    {((priceSpread / worstMarket.avgPrice) * 100).toFixed(1)}% differential
                  </p>
                </div>
              </div>

              {/* Chart */}
              <div style={{ width: "100%", height: 300, minWidth: 0, minHeight: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="country" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="price" orientation="left" tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`} />
                    <YAxis yAxisId="days" orientation="right" />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const data = payload[0].payload
                        return (
                          <div className="bg-popover border rounded-lg shadow-lg p-3">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-sm">Price: {formatCurrency(data.avgPrice)}</p>
                            <p className="text-sm">Days to Sell: {data.avgDaysToSell}</p>
                            <p className="text-sm">Demand Score: {data.demandScore}</p>
                          </div>
                        )
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="price" dataKey="avgPrice" name="Avg Price (€)" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.country === bestMarket.country
                              ? "#10b981"
                              : entry.country === worstMarket.country
                                ? "#ef4444"
                                : "#6366f1"
                          }
                        />
                      ))}
                    </Bar>
                    <Bar
                      yAxisId="days"
                      dataKey="avgDaysToSell"
                      name="Days to Sell"
                      fill="#94a3b8"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Country table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Country</TableHead>
                      <TableHead className="text-right">Avg Price</TableHead>
                      <TableHead className="text-right">vs Guide</TableHead>
                      <TableHead className="text-right">Days to Sell</TableHead>
                      <TableHead className="text-right">Volume</TableHead>
                      <TableHead className="text-center">Demand</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedComparison.countries.map((c) => (
                      <TableRow key={c.country}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{countries[c.country].flag}</span>
                            <span className="font-medium">{countries[c.country].name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(c.avgPrice)}</TableCell>
                        <TableCell
                          className={cn("text-right", c.priceVsGuide >= 100 ? "text-emerald-600" : "text-red-600")}
                        >
                          {c.priceVsGuide >= 100 ? "+" : ""}
                          {c.priceVsGuide - 100}%
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right",
                            c.avgDaysToSell <= 21 && "text-emerald-600",
                            c.avgDaysToSell > 35 && "text-red-600",
                          )}
                        >
                          {c.avgDaysToSell} days
                        </TableCell>
                        <TableCell className="text-right">{c.volume}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  c.demandScore >= 70 && "bg-emerald-500",
                                  c.demandScore >= 50 && c.demandScore < 70 && "bg-amber-500",
                                  c.demandScore < 50 && "bg-red-500",
                                )}
                                style={{ width: `${c.demandScore}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground w-8">{c.demandScore}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Export route recommendation */}
              {selectedComparison.bestExportRoute && (
                <div className="p-4 rounded-lg border bg-primary/5 border-primary/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{countries[selectedComparison.bestExportRoute.from].flag}</span>
                        <span className="font-medium">{selectedComparison.bestExportRoute.from}</span>
                      </div>
                      <ArrowRight className="h-5 w-5 text-primary" />
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{countries[selectedComparison.bestExportRoute.to].flag}</span>
                        <span className="font-medium">{selectedComparison.bestExportRoute.to}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Net Uplift (after costs)</p>
                        <p className="text-xl font-semibold text-emerald-600">
                          +{formatCurrency(selectedComparison.bestExportRoute.netUplift)}
                        </p>
                      </div>
                      <ConfidenceBadge level={selectedComparison.bestExportRoute.confidence} />
                      <Button>Create Export Rule</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All arbitrage routes */}
      <Card>
        <CardHeader>
          <CardTitle>Identified Export Routes</CardTitle>
          <CardDescription>
            Cross-border arbitrage opportunities with net uplift after transport and taxes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {comparisons
              .filter((c) => c.bestExportRoute)
              .map((c) => (
                <div
                  key={c.model}
                  className="p-4 rounded-lg border flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="font-medium">{c.model}</p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <span>
                        {countries[c.bestExportRoute!.from].flag} {c.bestExportRoute!.from}
                      </span>
                      <ArrowRight className="h-3 w-3" />
                      <span>
                        {countries[c.bestExportRoute!.to].flag} {c.bestExportRoute!.to}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600">+{formatCurrency(c.bestExportRoute!.netUplift)}</p>
                      <p className="text-xs text-muted-foreground">per unit</p>
                    </div>
                    <ConfidenceBadge level={c.bestExportRoute!.confidence} showLabel={false} />
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
