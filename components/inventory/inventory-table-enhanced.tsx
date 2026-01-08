"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { type Vehicle, type VehicleStatus, type Channel, countries } from "@/lib/mock-data"
import {
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Zap,
  Clock,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Eye,
  DollarSign,
  Truck,
  Tag,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface InventoryTableEnhancedProps {
  vehicles: Vehicle[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
}

const statusConfig: Record<VehicleStatus, { label: string; color: string; bg: string }> = {
  intake: { label: "Intake", color: "text-slate-700", bg: "bg-slate-100" },
  recon: { label: "Recon", color: "text-orange-700", bg: "bg-orange-100" },
  ready: { label: "Ready", color: "text-blue-700", bg: "bg-blue-100" },
  listed: { label: "Listed", color: "text-emerald-700", bg: "bg-emerald-100" },
  offer: { label: "Offer", color: "text-violet-700", bg: "bg-violet-100" },
  sold: { label: "Sold", color: "text-gray-700", bg: "bg-gray-100" },
}

const channelLabels: Record<Channel, string> = {
  "dealer-rofr": "ROFR",
  "fixed-price": "Fixed",
  auction: "Auction",
  export: "Export",
  "make-offer": "Offer",
}

type SortField = "daysInStock" | "recommendedPrice" | "scorecard" | "model"
type SortDirection = "asc" | "desc"

export function InventoryTableEnhanced({ vehicles, selectedIds, onSelectionChange }: InventoryTableEnhancedProps) {
  const [sortField, setSortField] = useState<SortField>("daysInStock")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const sortedVehicles = [...vehicles].sort((a, b) => {
    const modifier = sortDirection === "asc" ? 1 : -1
    switch (sortField) {
      case "daysInStock":
        return (a.daysInStock - b.daysInStock) * modifier
      case "recommendedPrice":
        return (a.recommendedPrice - b.recommendedPrice) * modifier
      case "scorecard":
        return (a.scorecard - b.scorecard) * modifier
      case "model":
        return `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`) * modifier
      default:
        return 0
    }
  })

  const toggleAll = () => {
    if (selectedIds.length === vehicles.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(vehicles.map((v) => v.id))
    }
  }

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id))
    } else {
      onSelectionChange([...selectedIds, id])
    }
  }

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button variant="ghost" size="sm" className="-ml-3 h-8 gap-1 font-medium" onClick={() => toggleSort(field)}>
      {children}
      {sortField === field ? (
        sortDirection === "asc" ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="h-4 w-4 opacity-40" />
      )}
    </Button>
  )

  const getPricePosition = (vehicle: Vehicle) => {
    const diff = ((vehicle.recommendedPrice - vehicle.marketValue) / vehicle.marketValue) * 100
    if (diff > 2) return { icon: TrendingUp, label: `+${diff.toFixed(0)}%`, color: "text-amber-600" }
    if (diff < -2) return { icon: TrendingDown, label: `${diff.toFixed(0)}%`, color: "text-emerald-600" }
    return { icon: Minus, label: "At market", color: "text-muted-foreground" }
  }

  const getAgeIndicator = (days: number, expected: number) => {
    const ratio = days / expected
    if (ratio > 1.5) return { color: "bg-red-500", status: "critical" }
    if (ratio > 1.2) return { color: "bg-amber-500", status: "slow" }
    if (ratio > 0.8) return { color: "bg-yellow-500", status: "watch" }
    return { color: "bg-emerald-500", status: "good" }
  }

  return (
    <TooltipProvider>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedIds.length === vehicles.length && vehicles.length > 0}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead className="w-[90px]">VIN</TableHead>
              <TableHead className="min-w-[200px]">
                <SortHeader field="model">Vehicle</SortHeader>
              </TableHead>
              <TableHead className="w-[80px]">Location</TableHead>
              <TableHead className="w-[80px]">Status</TableHead>
              <TableHead className="w-[80px]">Channel</TableHead>
              <TableHead className="w-[120px] text-right">
                <SortHeader field="recommendedPrice">Price</SortHeader>
              </TableHead>
              <TableHead className="w-[100px] text-center">
                <SortHeader field="daysInStock">Days</SortHeader>
              </TableHead>
              <TableHead className="w-[60px] text-center">
                <SortHeader field="scorecard">Score</SortHeader>
              </TableHead>
              <TableHead className="w-[100px]">Signals</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedVehicles.map((vehicle) => {
              const pricePos = getPricePosition(vehicle)
              const ageInd = getAgeIndicator(vehicle.daysInStock, vehicle.predictedDaysToSell)
              const PriceIcon = pricePos.icon
              const isSelected = selectedIds.includes(vehicle.id)

              return (
                <TableRow key={vehicle.id} className={cn("group transition-colors", isSelected && "bg-primary/5")}>
                  <TableCell>
                    <Checkbox checked={isSelected} onCheckedChange={() => toggleOne(vehicle.id)} />
                  </TableCell>
                  <TableCell>
                    <Link href={`/vehicle/${vehicle.id}`} className="font-mono text-xs text-primary hover:underline">
                      {vehicle.id.replace("VEH-", "")}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <div className="font-medium leading-none">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{vehicle.variant}</span>
                        <span>·</span>
                        <span>{vehicle.mileage.toLocaleString()} km</span>
                        <span>·</span>
                        <span className="capitalize">{vehicle.fuelType}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{countries[vehicle.country].flag}</span>
                          <span className="text-sm">{vehicle.country}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{countries[vehicle.country].name}</p>
                        <p className="text-xs text-muted-foreground">{vehicle.location}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn("font-normal", statusConfig[vehicle.status].bg, statusConfig[vehicle.status].color)}
                    >
                      {statusConfig[vehicle.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {vehicle.currentChannel ? (
                      <span className="text-sm">{channelLabels[vehicle.currentChannel]}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="space-y-0.5">
                      <div className="font-semibold tabular-nums">€{vehicle.recommendedPrice.toLocaleString()}</div>
                      <div className={cn("flex items-center justify-end gap-1 text-xs", pricePos.color)}>
                        <PriceIcon className="h-3 w-3" />
                        <span>{pricePos.label}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={cn(
                              "font-semibold tabular-nums",
                              vehicle.daysInStock > 60 && "text-amber-600",
                              vehicle.daysInStock > 90 && "text-red-600",
                            )}
                          >
                            {vehicle.daysInStock}
                          </span>
                          <div className="flex items-center gap-0.5">
                            <div className={cn("h-1.5 w-1.5 rounded-full", ageInd.color)} />
                            <span className="text-[10px] text-muted-foreground">/ {vehicle.predictedDaysToSell}d</span>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {vehicle.daysInStock} days in stock
                          <br />
                          Expected: {vehicle.predictedDaysToSell} days
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                            vehicle.scorecard >= 70
                              ? "bg-emerald-100 text-emerald-700"
                              : vehicle.scorecard >= 50
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700",
                          )}
                        >
                          {vehicle.scorecard}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Desirability Score: {vehicle.scorecard}/100</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {vehicle.exportUplift && vehicle.exportUplift > 500 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex h-6 w-6 items-center justify-center rounded bg-cyan-100">
                              <Zap className="h-3.5 w-3.5 text-cyan-600" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Export opportunity: +€{vehicle.exportUplift.toLocaleString()}</TooltipContent>
                        </Tooltip>
                      )}
                      {vehicle.hasDataConflict && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex h-6 w-6 items-center justify-center rounded bg-amber-100">
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Data conflict detected</TooltipContent>
                        </Tooltip>
                      )}
                      {vehicle.daysInStock > vehicle.predictedDaysToSell + 10 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex h-6 w-6 items-center justify-center rounded bg-red-100">
                              <Clock className="h-3.5 w-3.5 text-red-600" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Slow mover: exceeds expected days</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link href={`/vehicle/${vehicle.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <DollarSign className="mr-2 h-4 w-4" />
                          Adjust Price
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Truck className="mr-2 h-4 w-4" />
                          Change Channel
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Tag className="mr-2 h-4 w-4" />
                          Add Tag
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        {vehicles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p className="text-sm">No vehicles match your filters</p>
            <p className="text-xs">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
