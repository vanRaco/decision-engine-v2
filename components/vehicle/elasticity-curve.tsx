"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { ConfidenceBadge } from "@/components/ui/confidence-badge"
import { Info } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from "recharts"

interface ElasticityCurveProps {
  marketValue: number
  recommendedPrice: number
  reservePrice: number
  confidence: "high" | "medium" | "low"
  selectedPrice: number
  onPriceChange: (price: number) => void
}

export function ElasticityCurve({
  marketValue,
  recommendedPrice,
  reservePrice,
  confidence,
  selectedPrice,
  onPriceChange,
}: ElasticityCurveProps) {
  // Generate elasticity curve data
  const curveData = useMemo(() => {
    const points = []
    const minPrice = marketValue * 0.85
    const maxPrice = marketValue * 1.05
    const step = (maxPrice - minPrice) / 40

    for (let price = minPrice; price <= maxPrice; price += step) {
      // Sigmoid-like probability curve
      const priceRatio = price / marketValue
      const probability = 100 / (1 + Math.exp(10 * (priceRatio - 0.98)))
      points.push({
        price: Math.round(price),
        probability: Math.round(probability),
        days: Math.round(5 + (1 - probability / 100) * 25),
      })
    }
    return points
  }, [marketValue])

  // Find probability at selected price
  const selectedProbability = useMemo(() => {
    const closest = curveData.reduce((prev, curr) =>
      Math.abs(curr.price - selectedPrice) < Math.abs(prev.price - selectedPrice) ? curr : prev,
    )
    return closest.probability
  }, [curveData, selectedPrice])

  const selectedDays = useMemo(() => {
    const closest = curveData.reduce((prev, curr) =>
      Math.abs(curr.price - selectedPrice) < Math.abs(prev.price - selectedPrice) ? curr : prev,
    )
    return closest.days
  }, [curveData, selectedPrice])

  const handleSliderChange = (value: number[]) => {
    onPriceChange(value[0])
  }

  const minPrice = Math.round(marketValue * 0.85)
  const maxPrice = Math.round(marketValue * 1.05)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Price Elasticity</CardTitle>
            <CardDescription>Probability of sale within 7 days by price point</CardDescription>
          </div>
          <ConfidenceBadge level={confidence} />
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart */}
        <div className="h-48 mb-4" style={{ minWidth: 0, minHeight: 192 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={curveData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="price"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
                tickFormatter={(value) => `€${(value / 1000).toFixed(1)}k`}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === "probability" ? `${value}%` : `${value}d`,
                  name === "probability" ? "Sale Probability" : "Est. Days",
                ]}
                labelFormatter={(label) => `Price: €${label.toLocaleString()}`}
              />
              <ReferenceLine
                x={recommendedPrice}
                stroke="#10b981"
                strokeDasharray="5 5"
                label={{ value: "Rec.", fill: "#10b981", fontSize: 10 }}
              />
              <ReferenceLine
                x={reservePrice}
                stroke="#f59e0b"
                strokeDasharray="5 5"
                label={{ value: "Reserve", fill: "#f59e0b", fontSize: 10 }}
              />
              <Line type="monotone" dataKey="probability" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <ReferenceDot
                x={selectedPrice}
                y={selectedProbability}
                r={6}
                fill="#3b82f6"
                stroke="#fff"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Price slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">€{minPrice.toLocaleString()}</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg">€{selectedPrice.toLocaleString()}</span>
              <Badge
                variant={selectedProbability > 70 ? "default" : selectedProbability > 40 ? "secondary" : "destructive"}
              >
                {selectedProbability}% prob.
              </Badge>
            </div>
            <span className="text-muted-foreground">€{maxPrice.toLocaleString()}</span>
          </div>

          <Slider
            value={[selectedPrice]}
            min={minPrice}
            max={maxPrice}
            step={100}
            onValueChange={handleSliderChange}
            className="w-full"
          />

          {/* Predicted outcome */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <span className="text-muted-foreground">At </span>
              <span className="font-medium">€{selectedPrice.toLocaleString()}</span>
              <span className="text-muted-foreground">, there&apos;s a </span>
              <span className="font-medium text-blue-600">{selectedProbability}%</span>
              <span className="text-muted-foreground"> probability of sale within </span>
              <span className="font-medium">{selectedDays} days</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
