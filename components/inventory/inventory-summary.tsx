"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { Vehicle, VehicleStatus } from "@/lib/mock-data"
import { Package, Clock, TrendingUp, AlertTriangle, DollarSign, Truck } from "lucide-react"

interface InventorySummaryProps {
  vehicles: Vehicle[]
}

const statusLabels: Record<VehicleStatus, string> = {
  intake: "Intake",
  recon: "Recon",
  ready: "Ready",
  listed: "Listed",
  offer: "In Offer",
  sold: "Sold",
}

export function InventorySummary({ vehicles }: InventorySummaryProps) {
  const totalStock = vehicles.filter((v) => v.status !== "sold").length
  const totalValue = vehicles.filter((v) => v.status !== "sold").reduce((sum, v) => sum + v.recommendedPrice, 0)
  const avgDaysInStock = Math.round(
    vehicles.filter((v) => v.status !== "sold").reduce((sum, v) => sum + v.daysInStock, 0) / totalStock,
  )
  const agingStock = vehicles.filter((v) => v.daysInStock > 60 && v.status !== "sold").length
  const withOffers = vehicles.filter((v) => v.status === "offer").length
  const exportCandidates = vehicles.filter((v) => v.exportUplift && v.exportUplift > 500).length

  // Status breakdown
  const statusBreakdown = (Object.keys(statusLabels) as VehicleStatus[])
    .map((status) => ({
      status,
      label: statusLabels[status],
      count: vehicles.filter((v) => v.status === status).length,
    }))
    .filter((s) => s.status !== "sold")

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalStock.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Stock</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">€{(totalValue / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-muted-foreground">Stock Value</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{avgDaysInStock}</p>
              <p className="text-xs text-muted-foreground">Avg Days</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{agingStock}</p>
              <p className="text-xs text-muted-foreground">Aging (60d+)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{withOffers}</p>
              <p className="text-xs text-muted-foreground">With Offers</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
              <Truck className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{exportCandidates}</p>
              <p className="text-xs text-muted-foreground">Export Opps</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
