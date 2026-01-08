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
import { type Vehicle, type VehicleStatus, type Channel, countries } from "@/lib/mock-data"
import {
  MoreHorizontal,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Zap,
  Clock,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface InventoryTableProps {
  vehicles: Vehicle[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
}

const statusConfig: Record<
  VehicleStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  intake: { label: "Intake", variant: "outline" },
  recon: { label: "Recon", variant: "secondary" },
  ready: { label: "Ready", variant: "default" },
  listed: { label: "Listed", variant: "default" },
  offer: { label: "In Offer", variant: "default" },
  sold: { label: "Sold", variant: "secondary" },
}

const channelLabels: Record<Channel, string> = {
  "dealer-rofr": "Dealer ROFR",
  "fixed-price": "Fixed Price",
  auction: "Auction",
  export: "Export",
  "make-offer": "Make Offer",
}

type SortField = "daysInStock" | "recommendedPrice" | "scorecard" | "model"
type SortDirection = "asc" | "desc"

export function InventoryTable({ vehicles, selectedIds, onSelectionChange }: InventoryTableProps) {
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
    <Button variant="ghost" size="sm" className="-ml-3 h-8 gap-1" onClick={() => toggleSort(field)}>
      {children}
      {sortField === field ? (
        sortDirection === "asc" ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="h-4 w-4 opacity-50" />
      )}
    </Button>
  )

  const getPricePosition = (vehicle: Vehicle) => {
    const diff = ((vehicle.recommendedPrice - vehicle.marketValue) / vehicle.marketValue) * 100
    if (diff > 2) return { icon: TrendingUp, label: "Above", color: "text-amber-600" }
    if (diff < -2) return { icon: TrendingDown, label: "Below", color: "text-emerald-600" }
    return { icon: Minus, label: "At market", color: "text-muted-foreground" }
  }

  const getAgeIndicator = (days: number) => {
    if (days > 90) return { color: "bg-red-500", label: "Critical" }
    if (days > 60) return { color: "bg-amber-500", label: "Aging" }
    if (days > 30) return { color: "bg-yellow-500", label: "Watch" }
    return { color: "bg-emerald-500", label: "Fresh" }
  }

  return (
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
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>
              <SortHeader field="model">Vehicle</SortHeader>
            </TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead className="text-right">
              <SortHeader field="recommendedPrice">Price</SortHeader>
            </TableHead>
            <TableHead className="text-center">
              <SortHeader field="daysInStock">Days</SortHeader>
            </TableHead>
            <TableHead className="text-center">
              <SortHeader field="scorecard">Score</SortHeader>
            </TableHead>
            <TableHead>Signals</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedVehicles.map((vehicle) => {
            const pricePos = getPricePosition(vehicle)
            const ageInd = getAgeIndicator(vehicle.daysInStock)
            const PriceIcon = pricePos.icon

            return (
              <TableRow key={vehicle.id} className={cn("group", selectedIds.includes(vehicle.id) && "bg-muted/50")}>
                <TableCell>
                  <Checkbox checked={selectedIds.includes(vehicle.id)} onCheckedChange={() => toggleOne(vehicle.id)} />
                </TableCell>
                <TableCell>
                  <Link href={`/vehicle/${vehicle.id}`} className="font-mono text-xs text-primary hover:underline">
                    {vehicle.id}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="min-w-[180px]">
                    <div className="font-medium">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {vehicle.variant} · {vehicle.mileage.toLocaleString()} km · {vehicle.fuelType}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <span>{countries[vehicle.country].flag}</span>
                    <span className="text-sm">{vehicle.country}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={statusConfig[vehicle.status].variant}>{statusConfig[vehicle.status].label}</Badge>
                </TableCell>
                <TableCell>
                  {vehicle.currentChannel ? (
                    <span className="text-sm">{channelLabels[vehicle.currentChannel]}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-medium">€{vehicle.recommendedPrice.toLocaleString()}</span>
                    <div className={cn("flex items-center gap-1 text-xs", pricePos.color)}>
                      <PriceIcon className="h-3 w-3" />
                      <span>{pricePos.label}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className={cn(
                        "font-medium",
                        vehicle.daysInStock > 60 && "text-amber-600",
                        vehicle.daysInStock > 90 && "text-red-600",
                      )}
                    >
                      {vehicle.daysInStock}
                    </span>
                    <div className={cn("h-1.5 w-1.5 rounded-full", ageInd.color)} title={ageInd.label} />
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div
                    className={cn(
                      "inline-flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium",
                      vehicle.scorecard >= 70
                        ? "bg-emerald-100 text-emerald-700"
                        : vehicle.scorecard >= 50
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700",
                    )}
                  >
                    {vehicle.scorecard}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {vehicle.exportUplift && vehicle.exportUplift > 500 && (
                      <Badge variant="outline" className="gap-1 text-violet-600 border-violet-200 bg-violet-50">
                        <Zap className="h-3 w-3" />
                        Export
                      </Badge>
                    )}
                    {vehicle.hasDataConflict && (
                      <Badge variant="outline" className="gap-1 text-amber-600 border-amber-200 bg-amber-50">
                        <AlertTriangle className="h-3 w-3" />
                        Data
                      </Badge>
                    )}
                    {vehicle.daysInStock > vehicle.predictedDaysToSell + 10 && (
                      <Badge variant="outline" className="gap-1 text-red-600 border-red-200 bg-red-50">
                        <Clock className="h-3 w-3" />
                        Slow
                      </Badge>
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
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/vehicle/${vehicle.id}`}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Adjust Price</DropdownMenuItem>
                      <DropdownMenuItem>Change Channel</DropdownMenuItem>
                      <DropdownMenuItem>Create Action</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      {vehicles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <p>No vehicles match your filters</p>
        </div>
      )}
    </div>
  )
}
