"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ConfidenceBadge } from "@/components/ui/confidence-badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
} from "lucide-react"
import { type DefleetValuation, countries } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface ValuationQueueProps {
  valuations: DefleetValuation[]
}

const statusConfig = {
  "auto-approved": { label: "Auto-Approved", color: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
  "pending-review": { label: "Pending Review", color: "bg-amber-500/10 text-amber-600 border-amber-200" },
  approved: { label: "Approved", color: "bg-blue-500/10 text-blue-600 border-blue-200" },
  adjusted: { label: "Adjusted", color: "bg-purple-500/10 text-purple-600 border-purple-200" },
}

export function ValuationQueue({ valuations }: ValuationQueueProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [confidenceFilter, setConfidenceFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedValuation, setSelectedValuation] = useState<DefleetValuation | null>(null)

  const filteredValuations = valuations.filter((v) => {
    if (statusFilter !== "all" && v.status !== statusFilter) return false
    if (confidenceFilter !== "all" && v.deConfidence !== confidenceFilter) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        v.vehicle.vin.toLowerCase().includes(query) ||
        v.vehicle.make.toLowerCase().includes(query) ||
        v.vehicle.model.toLowerCase().includes(query)
      )
    }
    return true
  })

  const pendingCount = valuations.filter((v) => v.status === "pending-review").length
  const autoApprovedCount = valuations.filter((v) => v.status === "auto-approved").length

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredValuations.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredValuations.map((v) => v.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <>
      <div className="space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Queue</p>
                  <p className="text-2xl font-semibold">{valuations.length}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-semibold text-amber-600">{pendingCount}</p>
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
                  <p className="text-sm text-muted-foreground">Auto-Approved</p>
                  <p className="text-2xl font-semibold text-emerald-600">{autoApprovedCount}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Provider Failures</p>
                  <p className="text-2xl font-semibold text-red-600">3</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and actions */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Defleet Valuation Queue</CardTitle>
                <CardDescription>Review and approve vehicle valuations from external providers</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {selectedIds.size > 0 && (
                  <>
                    <Button variant="outline" size="sm">
                      Bulk Approve ({selectedIds.size})
                    </Button>
                    <Button variant="default" size="sm">
                      Publish to Remarketing
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search VIN, make, model..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending-review">Pending Review</SelectItem>
                  <SelectItem value="auto-approved">Auto-Approved</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="adjusted">Adjusted</SelectItem>
                </SelectContent>
              </Select>
              <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Confidence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Confidence</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={selectedIds.size === filteredValuations.length && filteredValuations.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead className="text-right">External Range</TableHead>
                    <TableHead className="text-right">DE Value</TableHead>
                    <TableHead className="text-right">DE Reserve</TableHead>
                    <TableHead className="text-center">Confidence</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[40px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredValuations.map((valuation) => {
                    const successfulVals = valuation.externalValuations.filter((v) => v.status === "success")
                    const minVal = successfulVals.length > 0 ? Math.min(...successfulVals.map((v) => v.value)) : 0
                    const maxVal = successfulVals.length > 0 ? Math.max(...successfulVals.map((v) => v.value)) : 0

                    return (
                      <TableRow
                        key={valuation.id}
                        className={cn(
                          "cursor-pointer hover:bg-muted/50",
                          selectedIds.has(valuation.id) && "bg-muted/30",
                        )}
                        onClick={() => setSelectedValuation(valuation)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedIds.has(valuation.id)}
                            onCheckedChange={() => toggleSelect(valuation.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {valuation.vehicle.year} {valuation.vehicle.make} {valuation.vehicle.model}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {valuation.vehicle.vin.substring(0, 11)}...
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-lg mr-1">{countries[valuation.vehicle.country].flag}</span>
                          {valuation.vehicle.country}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="text-sm">
                            <span className="text-muted-foreground">{formatCurrency(minVal)}</span>
                            <span className="mx-1">-</span>
                            <span>{formatCurrency(maxVal)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Spread: {formatCurrency(valuation.valuationSpread)}
                          </p>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(valuation.deRecommendedValue)}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(valuation.deRecommendedReserve)}</TableCell>
                        <TableCell className="text-center">
                          <ConfidenceBadge level={valuation.deConfidence} showLabel={false} />
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusConfig[valuation.status].color}>
                            {statusConfig[valuation.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selectedValuation} onOpenChange={() => setSelectedValuation(null)}>
        <SheetContent className="w-[700px] sm:max-w-[700px] overflow-y-auto" hideClose>
          {selectedValuation && (
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between pb-4 border-b shrink-0">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-0.5">
                    {selectedValuation.vehicle.year} {selectedValuation.vehicle.make} {selectedValuation.vehicle.model}
                  </h2>
                  <p className="text-xs text-muted-foreground font-mono tracking-tight">
                    {selectedValuation.vehicle.vin}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedValuation(null)}>
                  Close
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mileage</p>
                    <p className="text-base font-semibold">{selectedValuation.vehicle.mileage.toLocaleString()} km</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Condition</p>
                    <p className="text-base font-semibold">Grade {selectedValuation.vehicle.conditionGrade}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Fuel Type</p>
                    <p className="text-base font-semibold capitalize">{selectedValuation.vehicle.fuelType}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Location</p>
                    <p className="text-base font-semibold">{selectedValuation.vehicle.location}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    External Valuations
                  </h3>
                  <div className="space-y-2">
                    {selectedValuation.externalValuations.map((provider) => (
                      <div
                        key={provider.name}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border transition-all",
                          provider.status === "success"
                            ? "bg-background border-border hover:border-primary/20"
                            : "bg-red-50 border-red-200",
                        )}
                      >
                        {/* Provider badge - smaller */}
                        <div className="h-8 w-8 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
                          {provider.name.substring(0, 2).toUpperCase()}
                        </div>

                        {provider.status === "success" ? (
                          <>
                            {/* Provider name and confidence */}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm">{provider.name}</p>
                              <p className="text-xs text-muted-foreground">Confidence: {provider.confidence}%</p>
                            </div>

                            {/* Valuation amount */}
                            <div className="text-right">
                              <p className="text-lg font-bold">{formatCurrency(provider.value)}</p>
                            </div>

                            {/* Comparison badge */}
                            <div
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium shrink-0",
                                provider.value > selectedValuation.deRecommendedValue
                                  ? "bg-emerald-50 text-emerald-700"
                                  : provider.value < selectedValuation.deRecommendedValue
                                    ? "bg-red-50 text-red-700"
                                    : "bg-gray-50 text-gray-700",
                              )}
                            >
                              {provider.value > selectedValuation.deRecommendedValue ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : provider.value < selectedValuation.deRecommendedValue ? (
                                <TrendingDown className="h-3 w-3" />
                              ) : (
                                <Minus className="h-3 w-3" />
                              )}
                              <span>
                                {((provider.value / selectedValuation.deRecommendedValue - 1) * 100).toFixed(1)}% vs DE
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-red-700">{provider.errorMessage}</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-300 text-red-700 bg-transparent shrink-0"
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Retry
                            </Button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 p-5 text-white shadow-xl">
                  <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />

                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-bold">DE Recommendation</h3>
                      <div
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm",
                          selectedValuation.deConfidence === "high"
                            ? "bg-emerald-500/20 text-emerald-100 border border-emerald-400/30"
                            : selectedValuation.deConfidence === "medium"
                              ? "bg-amber-500/20 text-amber-100 border border-amber-400/30"
                              : "bg-red-500/20 text-red-100 border border-red-400/30",
                        )}
                      >
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {selectedValuation.deConfidence === "high"
                          ? "High"
                          : selectedValuation.deConfidence === "medium"
                            ? "Medium"
                            : "Low"}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-blue-100 mb-1">Recommended Value</p>
                        <p className="text-2xl font-bold">{formatCurrency(selectedValuation.deRecommendedValue)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-100 mb-1">Recommended Reserve</p>
                        <p className="text-2xl font-bold">{formatCurrency(selectedValuation.deRecommendedReserve)}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/20">
                      <p className="text-sm font-semibold text-blue-100 mb-2">Why this value:</p>
                      <ul className="space-y-1.5 text-sm text-blue-50">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-blue-200 shrink-0 mt-0.5" />
                          <span>Weighted average of 3 successful provider valuations</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-blue-200 shrink-0 mt-0.5" />
                          <span>Adjusted -2% for Grade {selectedValuation.vehicle.conditionGrade} condition</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-blue-200 shrink-0 mt-0.5" />
                          <span>Market trend: Stable for this segment</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t shrink-0">
                <Button variant="outline" size="lg" className="flex-1 bg-transparent">
                  Adjust Values
                </Button>
                <Button size="lg" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Approve & Publish
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
