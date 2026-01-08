"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"
import { type VehicleStatus, type Channel, type Country, countries } from "@/lib/mock-data"

export interface InventoryFilters {
  search: string
  status: VehicleStatus | "all"
  channel: Channel | "all"
  country: Country | "all"
  fuelType: "petrol" | "diesel" | "hybrid" | "electric" | "all"
  ageBucket: "0-30" | "31-60" | "61-90" | "90+" | "all"
  priceRange: "0-20k" | "20-35k" | "35k+" | "all"
}

interface InventoryFiltersProps {
  filters: InventoryFilters
  onFiltersChange: (filters: InventoryFilters) => void
  activeFilterCount: number
}

const statusOptions: { value: VehicleStatus | "all"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "intake", label: "Intake" },
  { value: "recon", label: "Recon" },
  { value: "ready", label: "Ready to List" },
  { value: "listed", label: "Listed" },
  { value: "offer", label: "In Offer" },
]

const channelOptions: { value: Channel | "all"; label: string }[] = [
  { value: "all", label: "All Channels" },
  { value: "dealer-rofr", label: "Dealer ROFR" },
  { value: "fixed-price", label: "Fixed Price" },
  { value: "auction", label: "Auction" },
  { value: "export", label: "Export" },
  { value: "make-offer", label: "Make Offer" },
]

const fuelOptions: { value: "petrol" | "diesel" | "hybrid" | "electric" | "all"; label: string }[] = [
  { value: "all", label: "All Fuel Types" },
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "hybrid", label: "Hybrid" },
  { value: "electric", label: "Electric" },
]

const ageOptions: { value: "0-30" | "31-60" | "61-90" | "90+" | "all"; label: string }[] = [
  { value: "all", label: "All Ages" },
  { value: "0-30", label: "0-30 days" },
  { value: "31-60", label: "31-60 days" },
  { value: "61-90", label: "61-90 days" },
  { value: "90+", label: "90+ days" },
]

export function InventoryFiltersBar({ filters, onFiltersChange, activeFilterCount }: InventoryFiltersProps) {
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

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search VIN, model, location..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status */}
        <Select value={filters.status} onValueChange={(v) => updateFilter("status", v as VehicleStatus | "all")}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Channel */}
        <Select value={filters.channel} onValueChange={(v) => updateFilter("channel", v as Channel | "all")}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Channel" />
          </SelectTrigger>
          <SelectContent>
            {channelOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Country */}
        <Select value={filters.country} onValueChange={(v) => updateFilter("country", v as Country | "all")}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {(Object.keys(countries) as Country[]).map((code) => (
              <SelectItem key={code} value={code}>
                {countries[code].flag} {countries[code].name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Fuel Type */}
        <Select value={filters.fuelType} onValueChange={(v) => updateFilter("fuelType", v as typeof filters.fuelType)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Fuel" />
          </SelectTrigger>
          <SelectContent>
            {fuelOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Age Bucket */}
        <Select
          value={filters.ageBucket}
          onValueChange={(v) => updateFilter("ageBucket", v as typeof filters.ageBucket)}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Age" />
          </SelectTrigger>
          <SelectContent>
            {ageOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear filters */}
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="h-4 w-4" />
            Clear ({activeFilterCount})
          </Button>
        )}
      </div>
    </div>
  )
}
