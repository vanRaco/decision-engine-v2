"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataHealthIndicator } from "@/components/ui/data-health-indicator"
import { VehicleScorecardBadge } from "./vehicle-scorecard-badge"
import { OperationalTags } from "./operational-tags"
import {
  AlertTriangle,
  MoreHorizontal,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Zap,
  Send,
  Eye,
  Wrench,
  Truck,
  Flag,
  Filter,
} from "lucide-react"
import { type Vehicle, countries, generateVehicleScorecard } from "@/lib/mock-data"

interface EnhancedIntakeTableProps {
  vehicles: Vehicle[]
  onResolveConflict: (vehicle: Vehicle) => void
  onMarkReady: (vehicleIds: string[]) => void
  onViewDetails: (vehicle: Vehicle) => void
  onSendToRecon: (vehicleIds: string[]) => void
  onSendToInspection: (vehicleIds: string[]) => void
}

export function EnhancedIntakeTable({
  vehicles,
  onResolveConflict,
  onMarkReady,
  onViewDetails,
  onSendToRecon,
  onSendToInspection,
}: EnhancedIntakeTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<keyof Vehicle>("daysInStock")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [vehicleTags, setVehicleTags] = useState<Record<string, string[]>>({})
  const [page, setPage] = useState(1)
  const pageSize = 20

  // Filter vehicles - only intake status
  const intakeVehicles = useMemo(() => {
    return vehicles.filter((v) => v.status === "intake")
  }, [vehicles])

  // Generate scorecards for all vehicles
  const vehicleScorecards = useMemo(() => {
    const scorecards: Record<string, ReturnType<typeof generateVehicleScorecard>> = {}
    intakeVehicles.forEach((v) => {
      scorecards[v.id] = generateVehicleScorecard(v)
    })
    return scorecards
  }, [intakeVehicles])

  // Apply filters and search
  const filteredVehicles = useMemo(() => {
    let result = intakeVehicles

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (v) =>
          v.vin.toLowerCase().includes(query) ||
          v.make.toLowerCase().includes(query) ||
          v.model.toLowerCase().includes(query) ||
          v.id.toLowerCase().includes(query),
      )
    }

    // Status filter (data health)
    if (statusFilter === "conflict") {
      result = result.filter((v) => v.hasDataConflict)
    } else if (statusFilter === "clean") {
      result = result.filter((v) => !v.hasDataConflict)
    }

    // Priority filter
    if (priorityFilter === "urgent") {
      result = result.filter((v) => vehicleScorecards[v.id]?.recommendedPriority === "urgent")
    } else if (priorityFilter === "hot") {
      result = result.filter((v) => vehicleScorecards[v.id]?.demandSignal === "hot")
    }

    // Sort
    result = [...result].sort((a, b) => {
      // First sort by priority
      const aPriority = vehicleScorecards[a.id]?.recommendedPriority === "urgent" ? 0 : 1
      const bPriority = vehicleScorecards[b.id]?.recommendedPriority === "urgent" ? 0 : 1
      if (aPriority !== bPriority) return aPriority - bPriority

      const aVal = a[sortField]
      const bVal = b[sortField]
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal
      }
      return sortDirection === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal))
    })

    return result
  }, [intakeVehicles, searchQuery, statusFilter, priorityFilter, sortField, sortDirection, vehicleScorecards])

  // Pagination
  const totalPages = Math.ceil(filteredVehicles.length / pageSize)
  const paginatedVehicles = filteredVehicles.slice((page - 1) * pageSize, page * pageSize)

  const toggleSort = (field: keyof Vehicle) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection("desc")
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
    if (selectedIds.size === paginatedVehicles.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(paginatedVehicles.map((v) => v.id)))
    }
  }

  const handleTagsChange = useCallback((vehicleId: string, tags: string[]) => {
    setVehicleTags((prev) => ({ ...prev, [vehicleId]: tags }))
  }, [])

  const conflictCount = intakeVehicles.filter((v) => v.hasDataConflict).length
  const urgentCount = intakeVehicles.filter((v) => vehicleScorecards[v.id]?.recommendedPriority === "urgent").length
  const hotCount = intakeVehicles.filter((v) => vehicleScorecards[v.id]?.demandSignal === "hot").length

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search VIN, model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-9 h-9"
            />
          </div>

          {/* Status filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="Data status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Data</SelectItem>
              <SelectItem value="conflict">Has Conflicts</SelectItem>
              <SelectItem value="clean">Clean Data</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority filter */}
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-36 h-9">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="urgent">Urgent Only</SelectItem>
              <SelectItem value="hot">Hot Demand</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk actions */}
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <>
              <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSendToInspection(Array.from(selectedIds))}
                className="gap-1"
              >
                <Truck className="h-4 w-4" />
                To Inspection
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSendToRecon(Array.from(selectedIds))}
                className="gap-1"
              >
                <Wrench className="h-4 w-4" />
                To Recon
              </Button>
              <Button size="sm" onClick={() => onMarkReady(Array.from(selectedIds))} className="gap-1">
                <Send className="h-4 w-4" />
                Ready to List
              </Button>
            </>
          )}
          {selectedIds.size === 0 && (
            <Button variant="outline" size="sm" className="gap-1 bg-transparent">
              <Zap className="h-4 w-4" />
              Auto-triage All
            </Button>
          )}
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="gap-1">
          <span className="text-muted-foreground">Total:</span>
          {intakeVehicles.length} vehicles
        </Badge>
        {urgentCount > 0 && (
          <Badge variant="destructive" className="gap-1">
            <Flag className="h-3 w-3" />
            {urgentCount} urgent
          </Badge>
        )}
        {hotCount > 0 && (
          <Badge variant="outline" className="gap-1 border-rose-200 bg-rose-50 text-rose-700">
            🔥 {hotCount} hot demand
          </Badge>
        )}
        {conflictCount > 0 && (
          <Badge variant="outline" className="gap-1 border-amber-200 bg-amber-50 text-amber-700">
            <AlertTriangle className="h-3 w-3" />
            {conflictCount} conflicts
          </Badge>
        )}
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
              <TableHead className="w-24">ID</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Scorecard</TableHead>
              <TableHead>Market</TableHead>
              <TableHead className="text-right">
                <button
                  className="flex items-center gap-1 hover:text-foreground ml-auto"
                  onClick={() => toggleSort("marketValue")}
                >
                  Value
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>
                <button
                  className="flex items-center gap-1 hover:text-foreground"
                  onClick={() => toggleSort("daysInStock")}
                >
                  Days
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedVehicles.map((vehicle) => {
              const scorecard = vehicleScorecards[vehicle.id]
              const isUrgent = scorecard?.recommendedPriority === "urgent"
              return (
                <TableRow
                  key={vehicle.id}
                  className={`${vehicle.hasDataConflict ? "bg-amber-50/50" : ""} ${isUrgent ? "border-l-2 border-l-red-500" : ""}`}
                >
                  <TableCell>
                    <Checkbox checked={selectedIds.has(vehicle.id)} onCheckedChange={() => toggleSelect(vehicle.id)} />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{vehicle.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {vehicle.variant} / {vehicle.fuelType} / {vehicle.mileage.toLocaleString()} km
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <VehicleScorecardBadge scorecard={scorecard} showDetails />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {countries[vehicle.country].flag} {vehicle.country}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium text-sm">
                    €{vehicle.marketValue.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DataHealthIndicator score={vehicle.dataHealth} size="sm" />
                      {vehicle.hasDataConflict && (
                        <Badge
                          variant="outline"
                          className="border-amber-200 bg-amber-50 text-amber-700 text-xs cursor-pointer hover:bg-amber-100"
                          onClick={() => onResolveConflict(vehicle)}
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Fix
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <OperationalTags
                      selectedTags={vehicleTags[vehicle.id] || []}
                      onTagsChange={(tags) => handleTagsChange(vehicle.id, tags)}
                      compact
                    />
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-medium text-sm ${vehicle.daysInStock > 7 ? "text-amber-600" : "text-muted-foreground"}`}
                    >
                      {vehicle.daysInStock}d
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDetails(vehicle)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {vehicle.hasDataConflict && (
                          <DropdownMenuItem onClick={() => onResolveConflict(vehicle)}>
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Resolve Conflicts
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onSendToInspection([vehicle.id])}>
                          <Truck className="h-4 w-4 mr-2" />
                          Send to Inspection
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSendToRecon([vehicle.id])}>
                          <Wrench className="h-4 w-4 mr-2" />
                          Send to Recon
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onMarkReady([vehicle.id])}>
                          <Send className="h-4 w-4 mr-2" />
                          Mark Ready to List
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
          {filteredVehicles.length} vehicles
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
    </div>
  )
}
