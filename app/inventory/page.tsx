"use client"

import { useState, useMemo } from "react"
import { generateVehicles } from "@/lib/mock-data"
import { AppLayout } from "@/components/layout/app-layout"
import { InventorySidebar, type InventoryFilters } from "@/components/inventory/inventory-sidebar"
import { InventoryHeader } from "@/components/inventory/inventory-header"
import { InventoryStatsBar } from "@/components/inventory/inventory-stats-bar"
import { InventoryTableEnhanced } from "@/components/inventory/inventory-table-enhanced"
import { InventoryBulkBar } from "@/components/inventory/inventory-bulk-bar"

// Generate a larger dataset for realistic inventory view
const allVehicles = generateVehicles(500)

export default function InventoryPage() {
  const [filters, setFilters] = useState<InventoryFilters>({
    search: "",
    status: "all",
    channel: "all",
    country: "all",
    fuelType: "all",
    ageBucket: "all",
    priceRange: "all",
  })
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const filteredVehicles = useMemo(() => {
    return allVehicles.filter((vehicle) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch =
          vehicle.id.toLowerCase().includes(searchLower) ||
          vehicle.vin.toLowerCase().includes(searchLower) ||
          vehicle.make.toLowerCase().includes(searchLower) ||
          vehicle.model.toLowerCase().includes(searchLower) ||
          vehicle.location.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Status filter
      if (filters.status !== "all" && vehicle.status !== filters.status) return false

      // Channel filter
      if (filters.channel !== "all" && vehicle.currentChannel !== filters.channel) return false

      // Country filter
      if (filters.country !== "all" && vehicle.country !== filters.country) return false

      // Fuel type filter
      if (filters.fuelType !== "all" && vehicle.fuelType !== filters.fuelType) return false

      // Age bucket filter
      if (filters.ageBucket !== "all") {
        const days = vehicle.daysInStock
        switch (filters.ageBucket) {
          case "0-30":
            if (days > 30) return false
            break
          case "31-60":
            if (days < 31 || days > 60) return false
            break
          case "61-90":
            if (days < 61 || days > 90) return false
            break
          case "90+":
            if (days < 91) return false
            break
        }
      }

      // Price range filter
      if (filters.priceRange !== "all") {
        const price = vehicle.recommendedPrice
        switch (filters.priceRange) {
          case "0-20k":
            if (price >= 20000) return false
            break
          case "20-35k":
            if (price < 20000 || price >= 35000) return false
            break
          case "35-50k":
            if (price < 35000 || price >= 50000) return false
            break
          case "50k+":
            if (price < 50000) return false
            break
        }
      }

      return true
    })
  }, [filters])

  const handleBulkAction = (action: string) => {
    console.log("Bulk action:", action, "on", selectedIds.length, "vehicles")
    setSelectedIds([])
  }

  return (
    <AppLayout title="Inventory" subtitle="Manage your remarketing portfolio">
      <div className="flex h-[calc(100vh-8rem)] -m-6">
        {/* Main content area */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* Header */}
          <InventoryHeader totalCount={allVehicles.length} lastSync="2 min ago" />

          {/* Stats bar */}
          <InventoryStatsBar vehicles={filteredVehicles} />

          {/* Table */}
          <div className="flex-1 overflow-auto p-6">
            <InventoryTableEnhanced
              vehicles={filteredVehicles}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />
          </div>
        </div>

        {/* Filter sidebar on the right */}
        <InventorySidebar
          vehicles={allVehicles}
          filters={filters}
          onFiltersChange={setFilters}
          filteredCount={filteredVehicles.length}
        />

        {/* Floating bulk action bar */}
        <InventoryBulkBar
          selectedCount={selectedIds.length}
          onClear={() => setSelectedIds([])}
          onAction={handleBulkAction}
        />
      </div>
    </AppLayout>
  )
}
