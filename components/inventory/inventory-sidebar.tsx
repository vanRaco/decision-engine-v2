"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { Vehicle, VehicleStatus, Channel, Country } from "@/lib/mock-data"
import { countries } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { Search, ChevronDown, ChevronRight, X, Clock, AlertTriangle, Zap, Filter, RotateCcw } from "lucide-react"

export interface InventoryFilters {
  search: string
  status: VehicleStatus | "all"
  channel: Channel | "all"
  country: Country | "all"
  fuelType: "petrol" | "diesel" | "hybrid" | "electric" | "all"
  ageBucket: "0-30" | "31-60" | "61-90" | "90+" | "all"
  priceRange: "0-20k" | "20-35k" | "35-50k" | "50k+" | "all"
}

interface InventorySidebarProps {
  vehicles: Vehicle[]
  filters: InventoryFilters
  onFiltersChange: (filters: InventoryFilters) => void
  filteredCount: number
}

const statusConfig: Record<VehicleStatus, { label: string; color: string }> = {
  intake: { label: "Intake", color: "bg-slate-500" },
  recon: { label: "Recon", color: "bg-orange-500" },
  ready: { label: "Ready to List", color: "bg-blue-500" },
  listed: { label: "Listed", color: "bg-emerald-500" },
  offer: { label: "In Offer", color: "bg-violet-500" },
  sold: { label: "Sold", color: "bg-gray-400" },
}

const channelConfig: Record<Channel, string> = {
  "dealer-rofr": "Dealer ROFR",
  "fixed-price": "Fixed Price",
  auction: "Auction",
  export: "Export",
  "make-offer": "Make Offer",
}

const fuelConfig = {
  petrol: "Petrol",
  diesel: "Diesel",
  hybrid: "Hybrid",
  electric: "Electric",
}

const ageBuckets = [
  { key: "0-30", label: "Fresh (0-30d)", color: "text-emerald-600" },
  { key: "31-60", label: "Active (31-60d)", color: "text-yellow-600" },
  { key: "61-90", label: "Aging (61-90d)", color: "text-amber-600" },
  { key: "90+", label: "Critical (90d+)", color: "text-red-600" },
]

const priceRanges = [
  { key: "0-20k", label: "Under €20k" },
  { key: "20-35k", label: "€20k - €35k" },
  { key: "35-50k", label: "€35k - €50k" },
  { key: "50k+", label: "Over €50k" },
]

// Saved views for quick access
const savedViews = [
  { id: "aging-stock", label: "Aging Stock", icon: Clock, filters: { ageBucket: "90+" as const } },
  { id: "export-opps", label: "Export Opportunities", icon: Zap, filters: {} },
  { id: "needs-action", label: "Needs Action", icon: AlertTriangle, filters: { status: "ready" as const } },
]

export function InventorySidebar({ vehicles, filters, onFiltersChange, filteredCount }: InventorySidebarProps) {
  const [statusOpen, setStatusOpen] = useState(true)
  const [channelOpen, setChannelOpen] = useState(true)
  const [countryOpen, setCountryOpen] = useState(false)
  const [fuelOpen, setFuelOpen] = useState(false)
  const [ageOpen, setAgeOpen] = useState(true)
  const [priceOpen, setPriceOpen] = useState(false)

  const activeVehicles = vehicles.filter((v) => v.status !== "sold")

  // Count vehicles by status
  const statusCounts = (Object.keys(statusConfig) as VehicleStatus[]).reduce(
    (acc, status) => {
      acc[status] = vehicles.filter((v) => v.status === status).length
      return acc
    },
    {} as Record<VehicleStatus, number>,
  )

  // Count vehicles by channel
  const channelCounts = (Object.keys(channelConfig) as Channel[]).reduce(
    (acc, channel) => {
      acc[channel] = vehicles.filter((v) => v.currentChannel === channel).length
      return acc
    },
    {} as Record<Channel, number>,
  )

  // Count vehicles by country
  const countryCounts = (Object.keys(countries) as Country[]).reduce(
    (acc, country) => {
      acc[country] = vehicles.filter((v) => v.country === country).length
      return acc
    },
    {} as Record<Country, number>,
  )

  // Count vehicles by fuel type
  const fuelCounts = (Object.keys(fuelConfig) as (keyof typeof fuelConfig)[]).reduce(
    (acc, fuel) => {
      acc[fuel] = vehicles.filter((v) => v.fuelType === fuel).length
      return acc
    },
    {} as Record<keyof typeof fuelConfig, number>,
  )

  // Count vehicles by age bucket
  const ageCounts = {
    "0-30": activeVehicles.filter((v) => v.daysInStock <= 30).length,
    "31-60": activeVehicles.filter((v) => v.daysInStock > 30 && v.daysInStock <= 60).length,
    "61-90": activeVehicles.filter((v) => v.daysInStock > 60 && v.daysInStock <= 90).length,
    "90+": activeVehicles.filter((v) => v.daysInStock > 90).length,
  }

  const updateFilter = <K extends keyof InventoryFilters>(key: K, value: InventoryFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      status: "all",
      channel: "all",
      country: "all",
      fuelType: "all",
      ageBucket: "all",
      priceRange: "all",
    })
  }

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => key !== "search" && value !== "all").length

  const FilterItem = ({
    label,
    count,
    isActive,
    onClick,
    color,
    textColor,
  }: {
    label: string
    count: number
    isActive: boolean
    onClick: () => void
    color?: string
    textColor?: string
  }) => (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
        isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground",
      )}
    >
      <span className="flex items-center gap-2">
        {color && <span className={cn("h-2 w-2 rounded-full", color)} />}
        <span className={textColor}>{label}</span>
      </span>
      <span className={cn("text-xs tabular-nums", isActive ? "text-primary" : "text-muted-foreground")}>{count}</span>
    </button>
  )

  return (
    <div className="flex h-full w-72 flex-col border-l bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 px-2 text-xs">
            <RotateCcw className="mr-1 h-3 w-3" />
            Reset
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search VIN, model..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-8 h-9 bg-background"
            />
            {filters.search && (
              <button
                onClick={() => updateFilter("search", "")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Saved Views */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Quick Views</span>
            <div className="space-y-1">
              {savedViews.map((view) => (
                <button
                  key={view.id}
                  onClick={() => {
                    // Apply saved view filters
                    clearFilters()
                    if (view.id === "aging-stock") {
                      updateFilter("ageBucket", "90+")
                    } else if (view.id === "needs-action") {
                      updateFilter("status", "ready")
                    }
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors"
                >
                  <view.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{view.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Status Filter */}
          <Collapsible open={statusOpen} onOpenChange={setStatusOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between py-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</span>
              {statusOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-0.5">
              <FilterItem
                label="All Statuses"
                count={vehicles.length}
                isActive={filters.status === "all"}
                onClick={() => updateFilter("status", "all")}
              />
              {(Object.keys(statusConfig) as VehicleStatus[])
                .filter((s) => s !== "sold")
                .map((status) => (
                  <FilterItem
                    key={status}
                    label={statusConfig[status].label}
                    count={statusCounts[status]}
                    isActive={filters.status === status}
                    onClick={() => updateFilter("status", status)}
                    color={statusConfig[status].color}
                  />
                ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Age Bucket Filter */}
          <Collapsible open={ageOpen} onOpenChange={setAgeOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between py-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Stock Age</span>
              {ageOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-0.5">
              <FilterItem
                label="All Ages"
                count={activeVehicles.length}
                isActive={filters.ageBucket === "all"}
                onClick={() => updateFilter("ageBucket", "all")}
              />
              {ageBuckets.map((bucket) => (
                <FilterItem
                  key={bucket.key}
                  label={bucket.label}
                  count={ageCounts[bucket.key as keyof typeof ageCounts]}
                  isActive={filters.ageBucket === bucket.key}
                  onClick={() => updateFilter("ageBucket", bucket.key as InventoryFilters["ageBucket"])}
                  textColor={bucket.color}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Channel Filter */}
          <Collapsible open={channelOpen} onOpenChange={setChannelOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between py-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Channel</span>
              {channelOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-0.5">
              <FilterItem
                label="All Channels"
                count={vehicles.filter((v) => v.currentChannel).length}
                isActive={filters.channel === "all"}
                onClick={() => updateFilter("channel", "all")}
              />
              {(Object.keys(channelConfig) as Channel[]).map((channel) => (
                <FilterItem
                  key={channel}
                  label={channelConfig[channel]}
                  count={channelCounts[channel]}
                  isActive={filters.channel === channel}
                  onClick={() => updateFilter("channel", channel)}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Country Filter */}
          <Collapsible open={countryOpen} onOpenChange={setCountryOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between py-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Country</span>
              {countryOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-0.5">
              <FilterItem
                label="All Countries"
                count={vehicles.length}
                isActive={filters.country === "all"}
                onClick={() => updateFilter("country", "all")}
              />
              {(Object.keys(countries) as Country[]).map((country) => (
                <FilterItem
                  key={country}
                  label={`${countries[country].flag} ${countries[country].name}`}
                  count={countryCounts[country]}
                  isActive={filters.country === country}
                  onClick={() => updateFilter("country", country)}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Fuel Type Filter */}
          <Collapsible open={fuelOpen} onOpenChange={setFuelOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between py-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Fuel Type</span>
              {fuelOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-0.5">
              <FilterItem
                label="All Fuel Types"
                count={vehicles.length}
                isActive={filters.fuelType === "all"}
                onClick={() => updateFilter("fuelType", "all")}
              />
              {(Object.keys(fuelConfig) as (keyof typeof fuelConfig)[]).map((fuel) => (
                <FilterItem
                  key={fuel}
                  label={fuelConfig[fuel]}
                  count={fuelCounts[fuel]}
                  isActive={filters.fuelType === fuel}
                  onClick={() => updateFilter("fuelType", fuel)}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Price Range Filter */}
          <Collapsible open={priceOpen} onOpenChange={setPriceOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between py-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Price Range</span>
              {priceOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-0.5">
              <FilterItem
                label="All Prices"
                count={vehicles.length}
                isActive={filters.priceRange === "all"}
                onClick={() => updateFilter("priceRange", "all")}
              />
              {priceRanges.map((range) => (
                <FilterItem
                  key={range.key}
                  label={range.label}
                  count={
                    vehicles.filter((v) => {
                      const price = v.recommendedPrice
                      switch (range.key) {
                        case "0-20k":
                          return price < 20000
                        case "20-35k":
                          return price >= 20000 && price < 35000
                        case "35-50k":
                          return price >= 35000 && price < 50000
                        case "50k+":
                          return price >= 50000
                        default:
                          return true
                      }
                    }).length
                  }
                  isActive={filters.priceRange === range.key}
                  onClick={() => updateFilter("priceRange", range.key as InventoryFilters["priceRange"])}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>

      {/* Footer with result count */}
      <div className="border-t bg-muted/30 px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Showing</span>
          <span className="font-medium">{filteredCount.toLocaleString()} vehicles</span>
        </div>
      </div>
    </div>
  )
}
