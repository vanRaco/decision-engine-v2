"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { StatCard } from "@/components/ui/stat-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Search,
  Calendar,
  AlertTriangle,
  TrendingDown,
  Zap,
  Download,
  Eye,
  ArrowUpDown,
  Clock,
  Car,
  Battery,
  Fuel,
  Globe,
} from "lucide-react"
import { generatePipelineVehicles, countries, type PipelineVehicle } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export default function PipelinePage() {
  const router = useRouter()
  const [pipelineVehicles] = useState(() => generatePipelineVehicles(150))
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [timeframeFilter, setTimeframeFilter] = useState<string>("all")
  const [powertrainFilter, setPowertrainFilter] = useState<string>("all")
  const [riskFilter, setRiskFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<keyof PipelineVehicle>("daysUntilDefleet")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // Filter vehicles
  const filteredVehicles = useMemo(() => {
    let result = pipelineVehicles

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (v) =>
          v.make.toLowerCase().includes(query) ||
          v.model.toLowerCase().includes(query) ||
          v.vin.toLowerCase().includes(query),
      )
    }

    if (timeframeFilter !== "all") {
      const days = Number.parseInt(timeframeFilter)
      result = result.filter((v) => v.daysUntilDefleet <= days)
    }

    if (powertrainFilter !== "all") {
      result = result.filter((v) => v.powertrain === powertrainFilter)
    }

    if (riskFilter !== "all") {
      if (riskFilter === "high") result = result.filter((v) => v.riskScore >= 70)
      else if (riskFilter === "medium") result = result.filter((v) => v.riskScore >= 40 && v.riskScore < 70)
      else result = result.filter((v) => v.riskScore < 40)
    }

    // Sort
    result = [...result].sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal
      }
      return 0
    })

    return result
  }, [pipelineVehicles, searchQuery, timeframeFilter, powertrainFilter, riskFilter, sortField, sortOrder])

  // Stats
  const stats = useMemo(() => {
    const next7Days = pipelineVehicles.filter((v) => v.daysUntilDefleet <= 7).length
    const next30Days = pipelineVehicles.filter((v) => v.daysUntilDefleet <= 30).length
    const totalRvExposure = pipelineVehicles.filter((v) => v.rvGap > 0).reduce((sum, v) => sum + v.rvGap, 0)
    const highRisk = pipelineVehicles.filter((v) => v.riskScore >= 70).length
    const bevCount = pipelineVehicles.filter((v) => v.powertrain === "bev").length
    const phevCount = pipelineVehicles.filter((v) => v.powertrain === "hybrid-phev").length

    return { next7Days, next30Days, totalRvExposure, highRisk, bevCount, phevCount }
  }, [pipelineVehicles])

  const toggleSort = (field: keyof PipelineVehicle) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredVehicles.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredVehicles.map((v) => v.id)))
    }
  }

  const handleViewVehicle = (vehicleId: string) => {
    router.push(`/vehicle/${vehicleId}`)
  }

  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-red-600 bg-red-50"
    if (score >= 40) return "text-amber-600 bg-amber-50"
    return "text-emerald-600 bg-emerald-50"
  }

  const getTimeframeColor = (days: number) => {
    if (days <= 7) return "text-red-600"
    if (days <= 14) return "text-amber-600"
    if (days <= 30) return "text-blue-600"
    return "text-slate-600"
  }

  return (
    <AppLayout title="Pipeline" subtitle="Upcoming defleet - 30 to 90 day visibility">
      {/* Stats Row */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        <StatCard
          title="Next 7 Days"
          value={stats.next7Days}
          subtitle="Vehicles arriving"
          icon={Calendar}
          status={stats.next7Days > 20 ? "warning" : "neutral"}
        />
        <StatCard title="Next 30 Days" value={stats.next30Days} subtitle="Total incoming" icon={Car} status="neutral" />
        <StatCard
          title="RV Exposure"
          value={`€${(stats.totalRvExposure / 1000).toFixed(0)}k`}
          subtitle="Contractual vs market"
          icon={TrendingDown}
          status={stats.totalRvExposure > 100000 ? "danger" : "warning"}
        />
        <StatCard
          title="High Risk"
          value={stats.highRisk}
          subtitle="Vehicles flagged"
          icon={AlertTriangle}
          status={stats.highRisk > 15 ? "danger" : stats.highRisk > 5 ? "warning" : "success"}
        />
        <StatCard
          title="BEVs Incoming"
          value={stats.bevCount}
          subtitle="Electric vehicles"
          icon={Battery}
          status="neutral"
        />
        <StatCard
          title="PHEVs Incoming"
          value={stats.phevCount}
          subtitle="Plug-in hybrids"
          icon={Fuel}
          status="neutral"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search VIN, make, model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-9"
            />
          </div>

          <Select value={timeframeFilter} onValueChange={setTimeframeFilter}>
            <SelectTrigger className="w-40">
              <Clock className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Timeframes</SelectItem>
              <SelectItem value="7">Next 7 days</SelectItem>
              <SelectItem value="14">Next 14 days</SelectItem>
              <SelectItem value="30">Next 30 days</SelectItem>
              <SelectItem value="60">Next 60 days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={powertrainFilter} onValueChange={setPowertrainFilter}>
            <SelectTrigger className="w-40">
              <Zap className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Powertrain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Powertrains</SelectItem>
              <SelectItem value="bev">BEV</SelectItem>
              <SelectItem value="hybrid-phev">PHEV</SelectItem>
              <SelectItem value="hybrid-hev">HEV</SelectItem>
              <SelectItem value="ice-petrol">Petrol</SelectItem>
              <SelectItem value="ice-diesel">Diesel</SelectItem>
            </SelectContent>
          </Select>

          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-36">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="low">Low Risk</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{filteredVehicles.length} vehicles</span>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Selected Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-4 p-3 mb-4 rounded-lg bg-blue-50 border border-blue-100">
          <span className="text-sm font-medium text-blue-700">{selectedIds.size} vehicles selected</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="bg-white">
              Pre-assign Channel
            </Button>
            <Button size="sm" variant="outline" className="bg-white">
              Flag for Export Review
            </Button>
            <Button size="sm" variant="outline" className="bg-white">
              Schedule Early Inspection
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.size === filteredVehicles.length && filteredVehicles.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center gap-1 hover:text-foreground"
                  onClick={() => toggleSort("daysUntilDefleet")}
                >
                  Arrival
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">
                <button
                  className="flex items-center gap-1 ml-auto hover:text-foreground"
                  onClick={() => toggleSort("estimatedMarketValue")}
                >
                  Est. Value
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button
                  className="flex items-center gap-1 ml-auto hover:text-foreground"
                  onClick={() => toggleSort("rvGap")}
                >
                  RV Gap
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="text-center">
                <button
                  className="flex items-center gap-1 mx-auto hover:text-foreground"
                  onClick={() => toggleSort("riskScore")}
                >
                  Risk
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Recommended</TableHead>
              <TableHead>Flags</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVehicles.slice(0, 50).map((vehicle) => (
              <TableRow key={vehicle.id} className="hover:bg-muted/30">
                <TableCell>
                  <Checkbox checked={selectedIds.has(vehicle.id)} onCheckedChange={() => toggleSelect(vehicle.id)} />
                </TableCell>
                <TableCell>
                  <div className={cn("font-medium", getTimeframeColor(vehicle.daysUntilDefleet))}>
                    {vehicle.daysUntilDefleet}d
                  </div>
                  <div className="text-xs text-muted-foreground">{vehicle.contractEndDate.toLocaleDateString()}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        vehicle.powertrain === "bev" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                        vehicle.powertrain === "hybrid-phev" && "bg-blue-50 text-blue-700 border-blue-200",
                      )}
                    >
                      {vehicle.powertrain.toUpperCase()}
                    </Badge>
                    <div>
                      <div className="font-medium">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {vehicle.variant} · {vehicle.estimatedMileage.toLocaleString()} km
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-1.5">
                    {countries[vehicle.country].flag}
                    {vehicle.country}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {vehicle.fleetSource.replace("-", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  €{vehicle.estimatedMarketValue.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={cn(
                      "font-medium",
                      vehicle.rvGap > 2000 ? "text-red-600" : vehicle.rvGap > 0 ? "text-amber-600" : "text-emerald-600",
                    )}
                  >
                    {vehicle.rvGap > 0 ? "-" : "+"}€{Math.abs(vehicle.rvGap).toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-center">
                          <div className={cn("px-2 py-1 rounded text-xs font-medium", getRiskColor(vehicle.riskScore))}>
                            {vehicle.riskScore}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Risk score based on RV gap, market volatility, and demand signals</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-xs">
                      {vehicle.recommendedChannel.replace("-", " ")}
                    </Badge>
                    {vehicle.exportPotential && <Globe className="h-3.5 w-3.5 text-blue-500" />}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-48">
                    {vehicle.flags.slice(0, 2).map((flag, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className={cn(
                          "text-xs",
                          flag.includes("risk") || flag.includes("volatility")
                            ? "bg-red-50 text-red-600 border-red-200"
                            : flag.includes("Imminent")
                              ? "bg-amber-50 text-amber-600 border-amber-200"
                              : "bg-slate-50 text-slate-600",
                        )}
                      >
                        {flag}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewVehicle(vehicle.id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredVehicles.length > 50 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          Showing 50 of {filteredVehicles.length} vehicles
        </div>
      )}
    </AppLayout>
  )
}
