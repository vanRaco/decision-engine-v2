"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConfidenceBadge } from "@/components/ui/confidence-badge"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Send,
  Eye,
  Check,
  X,
  Edit2,
  TrendingUp,
  Clock,
  Globe,
} from "lucide-react"
import { type Vehicle, type ListingDecision, type Channel, countries, generateListingDecisions } from "@/lib/mock-data"

interface ReadyToListTableProps {
  vehicles: Vehicle[]
  onLaunch: (vehicleIds: string[], decisions: Record<string, Partial<ListingDecision>>) => void
  onViewDetails: (vehicle: Vehicle) => void
}

const channelLabels: Record<Channel, string> = {
  "dealer-rofr": "Dealer ROFR",
  "fixed-price": "Fixed Price",
  auction: "Auction",
  export: "Export",
  "make-offer": "Make an Offer",
}

const tacticLabels: Record<string, string> = {
  "rofr-first": "ROFR First",
  "click-buy": "Click & Buy",
  "dutch-price": "Dutch Pricing",
  "make-offer": "Make an Offer",
  "auction-only": "Auction Only",
}

export function ReadyToListTable({ vehicles, onLaunch, onViewDetails }: ReadyToListTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<"expectedDaysToSell" | "expectedRpi" | "recommendedPrice">("expectedRpi")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [channelFilter, setChannelFilter] = useState<string>("all")
  const [detailVehicle, setDetailVehicle] = useState<Vehicle | null>(null)
  const [overrides, setOverrides] = useState<Record<string, Partial<ListingDecision>>>({})
  const [page, setPage] = useState(1)
  const pageSize = 15

  // Filter ready vehicles
  const readyVehicles = useMemo(() => {
    return vehicles.filter((v) => v.status === "ready" || v.status === "recon")
  }, [vehicles])

  // Generate listing decisions
  const listingDecisions = useMemo(() => {
    const decisions = generateListingDecisions(readyVehicles)
    const map: Record<string, ListingDecision> = {}
    decisions.forEach((d) => {
      map[d.vehicleId] = d
    })
    return map
  }, [readyVehicles])

  // Apply filters
  const filteredVehicles = useMemo(() => {
    let result = readyVehicles

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (v) =>
          v.vin.toLowerCase().includes(query) ||
          v.make.toLowerCase().includes(query) ||
          v.model.toLowerCase().includes(query),
      )
    }

    if (channelFilter !== "all") {
      result = result.filter((v) => {
        const decision = listingDecisions[v.id]
        return decision?.recommendedChannel === channelFilter
      })
    }

    // Sort
    result = [...result].sort((a, b) => {
      const decA = listingDecisions[a.id]
      const decB = listingDecisions[b.id]
      if (!decA || !decB) return 0

      const aVal = decA[sortField]
      const bVal = decB[sortField]
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal
      }
      return 0
    })

    return result
  }, [readyVehicles, searchQuery, channelFilter, sortField, sortDirection, listingDecisions])

  // Pagination
  const totalPages = Math.ceil(filteredVehicles.length / pageSize)
  const paginatedVehicles = filteredVehicles.slice((page - 1) * pageSize, page * pageSize)

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedVehicles.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(paginatedVehicles.map((v) => v.id)))
    }
  }

  const handleLaunch = () => {
    onLaunch(Array.from(selectedIds), overrides)
    setSelectedIds(new Set())
    setOverrides({})
  }

  const getEffectiveDecision = (vehicleId: string): ListingDecision | undefined => {
    const base = listingDecisions[vehicleId]
    const override = overrides[vehicleId]
    if (!base) return undefined
    return { ...base, ...override }
  }

  // Stats
  const totalValue = paginatedVehicles.reduce((sum, v) => sum + (getEffectiveDecision(v.id)?.recommendedPrice || 0), 0)
  const avgRpi =
    paginatedVehicles.reduce((sum, v) => sum + (getEffectiveDecision(v.id)?.expectedRpi || 0), 0) /
    paginatedVehicles.length
  const avgDays =
    paginatedVehicles.reduce((sum, v) => sum + (getEffectiveDecision(v.id)?.expectedDaysToSell || 0), 0) /
    paginatedVehicles.length

  const detailDecision = detailVehicle ? getEffectiveDecision(detailVehicle.id) : null

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Ready to List</div>
            <div className="text-2xl font-bold">{readyVehicles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Total Value</div>
            <div className="text-2xl font-bold">€{Math.round(totalValue / 1000)}k</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Avg Expected RPI</div>
            <div className="text-2xl font-bold text-emerald-600">{avgRpi.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Avg Days to Sell</div>
            <div className="text-2xl font-bold">{Math.round(avgDays)}d</div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search VIN, model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-9 h-9"
            />
          </div>

          <Select value={channelFilter} onValueChange={setChannelFilter}>
            <SelectTrigger className="w-40 h-9">
              <Globe className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="dealer-rofr">Dealer ROFR</SelectItem>
              <SelectItem value="fixed-price">Fixed Price</SelectItem>
              <SelectItem value="auction">Auction</SelectItem>
              <SelectItem value="export">Export</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk actions */}
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 ? (
            <>
              <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
              <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
              <Button size="sm" onClick={handleLaunch} className="gap-1">
                <Send className="h-4 w-4" />
                Launch {selectedIds.size} Vehicles
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => setSelectedIds(new Set(paginatedVehicles.map((v) => v.id)))}
              className="gap-1"
            >
              <Check className="h-4 w-4" />
              Select All & Launch
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.size === paginatedVehicles.length && paginatedVehicles.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Market</TableHead>
              <TableHead>
                <button
                  className="flex items-center gap-1 hover:text-foreground"
                  onClick={() => {
                    setSortField("recommendedPrice")
                    setSortDirection((d) => (d === "asc" ? "desc" : "asc"))
                  }}
                >
                  Rec. Price
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Tactic</TableHead>
              <TableHead>
                <button
                  className="flex items-center gap-1 hover:text-foreground"
                  onClick={() => {
                    setSortField("expectedDaysToSell")
                    setSortDirection((d) => (d === "asc" ? "desc" : "asc"))
                  }}
                >
                  Days
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center gap-1 hover:text-foreground"
                  onClick={() => {
                    setSortField("expectedRpi")
                    setSortDirection((d) => (d === "asc" ? "desc" : "asc"))
                  }}
                >
                  RPI
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedVehicles.map((vehicle) => {
              const decision = getEffectiveDecision(vehicle.id)
              const hasOverride = !!overrides[vehicle.id]
              if (!decision) return null

              return (
                <TableRow key={vehicle.id} className={hasOverride ? "bg-blue-50/50" : ""}>
                  <TableCell>
                    <Checkbox checked={selectedIds.has(vehicle.id)} onCheckedChange={() => toggleSelect(vehicle.id)} />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {vehicle.variant} / {vehicle.mileage.toLocaleString()} km
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {countries[vehicle.country].flag} {vehicle.country}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">€{Math.round(decision.recommendedPrice).toLocaleString()}</span>
                      {hasOverride && (
                        <Badge variant="outline" className="text-xs">
                          edited
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{channelLabels[decision.recommendedChannel]}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{tacticLabels[decision.recommendedTactic]}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />~{decision.expectedDaysToSell}d
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-medium ${decision.expectedRpi > 95 ? "text-emerald-600" : decision.expectedRpi > 93 ? "text-amber-600" : "text-red-600"}`}
                    >
                      {decision.expectedRpi.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <ConfidenceBadge level={decision.confidence} size="sm" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailVehicle(vehicle)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onViewDetails(vehicle)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredVehicles.length)} of{" "}
          {filteredVehicles.length}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!detailVehicle} onOpenChange={(open) => !open && setDetailVehicle(null)}>
        <SheetContent className="w-[500px] sm:max-w-[500px]">
          {detailVehicle && detailDecision && (
            <>
              <SheetHeader>
                <SheetTitle>
                  {detailVehicle.year} {detailVehicle.make} {detailVehicle.model}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Recommendation summary */}
                <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Recommended Price</span>
                    <span className="text-lg font-bold">
                      €{Math.round(detailDecision.recommendedPrice).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Reserve Floor</span>
                    <span className="font-medium">
                      €{Math.round(detailDecision.recommendedReserve).toLocaleString()}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Channel</span>
                    <Badge>{channelLabels[detailDecision.recommendedChannel]}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tactic</span>
                    <span className="font-medium">{tacticLabels[detailDecision.recommendedTactic]}</span>
                  </div>
                </div>

                {/* Reasoning */}
                <div>
                  <h4 className="font-medium mb-2">Why this recommendation?</h4>
                  <ul className="space-y-1">
                    {detailDecision.reasoning.map((reason, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Market comps */}
                <div>
                  <h4 className="font-medium mb-2">Similar Recent Sales</h4>
                  <div className="space-y-2">
                    {detailDecision.marketComps.map((comp) => (
                      <div key={comp.id} className="p-3 rounded border bg-background">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{comp.description}</span>
                          <Badge variant="outline" className="text-xs">
                            {comp.similarity}% match
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>€{comp.soldPrice.toLocaleString()}</span>
                          <span>{comp.daysToSell}d to sell</span>
                          <span>{comp.channel}</span>
                          <span>{comp.daysAgo}d ago</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expected outcomes */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Clock className="h-4 w-4" />
                        Expected Days
                      </div>
                      <div className="text-xl font-bold">{detailDecision.expectedDaysToSell}d</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <TrendingUp className="h-4 w-4" />
                        Expected RPI
                      </div>
                      <div className="text-xl font-bold text-emerald-600">{detailDecision.expectedRpi.toFixed(1)}%</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      toggleSelect(detailVehicle.id)
                      setDetailVehicle(null)
                    }}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Accept & Select
                  </Button>
                  <Button variant="outline" onClick={() => setDetailVehicle(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
