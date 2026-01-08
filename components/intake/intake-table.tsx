"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataHealthIndicator } from "@/components/ui/data-health-indicator"
import { ConfidenceBadge } from "@/components/ui/confidence-badge"
import {
  AlertTriangle,
  CheckCircle2,
  MoreHorizontal,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Zap,
  Send,
  Eye,
} from "lucide-react"
import type { Vehicle } from "@/lib/mock-data"
import { countries } from "@/lib/mock-data"

interface IntakeTableProps {
  vehicles: Vehicle[]
  onResolveConflict: (vehicle: Vehicle) => void
  onMarkReady: (vehicleIds: string[]) => void
  onViewDetails: (vehicle: Vehicle) => void
}

export function IntakeTable({ vehicles, onResolveConflict, onMarkReady, onViewDetails }: IntakeTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<keyof Vehicle>("daysInStock")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const pageSize = 25

  // Filter vehicles - only intake status
  const intakeVehicles = useMemo(() => {
    return vehicles.filter((v) => v.status === "intake")
  }, [vehicles])

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

    // Sort
    result = [...result].sort((a, b) => {
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
  }, [intakeVehicles, searchQuery, statusFilter, sortField, sortDirection])

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

  const conflictCount = intakeVehicles.filter((v) => v.hasDataConflict).length
  const cleanCount = intakeVehicles.length - conflictCount

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
            <SelectTrigger className="w-40 h-9">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({intakeVehicles.length})</SelectItem>
              <SelectItem value="conflict">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  Conflicts ({conflictCount})
                </span>
              </SelectItem>
              <SelectItem value="clean">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Clean ({cleanCount})
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk actions */}
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <>
              <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
              <Button size="sm" onClick={() => onMarkReady(Array.from(selectedIds))} className="gap-1">
                <Send className="h-4 w-4" />
                Send to Pricing ({selectedIds.size})
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" className="gap-1 bg-transparent">
            <Zap className="h-4 w-4" />
            Auto-resolve All
          </Button>
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="gap-1">
          <span className="text-muted-foreground">Total:</span>
          {intakeVehicles.length} vehicles
        </Badge>
        {conflictCount > 0 && (
          <Badge variant="outline" className="gap-1 border-amber-200 bg-amber-50 text-amber-700">
            <AlertTriangle className="h-3 w-3" />
            {conflictCount} with conflicts
          </Badge>
        )}
        <Badge variant="outline" className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700">
          <CheckCircle2 className="h-3 w-3" />
          {cleanCount} ready for pricing
        </Badge>
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
              <TableHead className="w-24">
                <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort("id")}>
                  ID
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>VIN</TableHead>
              <TableHead>Market</TableHead>
              <TableHead className="text-right">
                <button
                  className="flex items-center gap-1 hover:text-foreground ml-auto"
                  onClick={() => toggleSort("mileage")}
                >
                  Mileage
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center gap-1 hover:text-foreground"
                  onClick={() => toggleSort("dataHealth")}
                >
                  Data Health
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center gap-1 hover:text-foreground"
                  onClick={() => toggleSort("scorecard")}
                >
                  Scorecard
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
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
            {paginatedVehicles.map((vehicle) => (
              <TableRow key={vehicle.id} className={vehicle.hasDataConflict ? "bg-amber-50/50" : ""}>
                <TableCell>
                  <Checkbox checked={selectedIds.has(vehicle.id)} onCheckedChange={() => toggleSelect(vehicle.id)} />
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{vehicle.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium text-sm">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {vehicle.variant} / {vehicle.fuelType} / {vehicle.transmission}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs">{vehicle.vin.slice(0, 11)}...</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {countries[vehicle.country].flag} {vehicle.country}
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono text-sm">{vehicle.mileage.toLocaleString()} km</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <DataHealthIndicator score={vehicle.dataHealth} showLabel size="sm" />
                    {vehicle.hasDataConflict && (
                      <Badge
                        variant="outline"
                        className="border-amber-200 bg-amber-50 text-amber-700 text-xs cursor-pointer hover:bg-amber-100"
                        onClick={() => onResolveConflict(vehicle)}
                      >
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Conflict
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{vehicle.scorecard}</span>
                    <ConfidenceBadge level={vehicle.confidence} size="sm" showLabel={false} />
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`font-medium text-sm ${
                      vehicle.daysInStock > 7 ? "text-amber-600" : "text-muted-foreground"
                    }`}
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
                      <DropdownMenuItem onClick={() => onMarkReady([vehicle.id])}>
                        <Send className="h-4 w-4 mr-2" />
                        Send to Pricing
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
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
