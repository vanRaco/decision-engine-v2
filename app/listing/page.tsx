"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { ReadyToListTable } from "@/components/listing/ready-to-list-table"
import { generateVehicles, type Vehicle, type ListingDecision } from "@/lib/mock-data"

export default function ListingPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState(() => generateVehicles(500))

  const handleLaunch = useCallback((vehicleIds: string[], decisions: Record<string, Partial<ListingDecision>>) => {
    // In real app, would push to marketplace
    console.log("Launching vehicles:", vehicleIds, decisions)
    setVehicles((prev) =>
      prev.map((v) => {
        if (vehicleIds.includes(v.id)) {
          return { ...v, status: "listed" as const }
        }
        return v
      }),
    )
  }, [])

  const handleViewDetails = useCallback(
    (vehicle: Vehicle) => {
      router.push(`/vehicle/${vehicle.id}`)
    },
    [router],
  )

  return (
    <AppLayout title="Ready to List" subtitle="Launch vehicles with price, channel, and tactic">
      <ReadyToListTable vehicles={vehicles} onLaunch={handleLaunch} onViewDetails={handleViewDetails} />
    </AppLayout>
  )
}
