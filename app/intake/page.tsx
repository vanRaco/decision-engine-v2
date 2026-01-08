"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { EnhancedIntakeTable } from "@/components/intake/enhanced-intake-table"
import { ConflictResolverDrawer } from "@/components/intake/conflict-resolver-drawer"
import { StatCard } from "@/components/ui/stat-card"
import { generateVehicles, generateVehicleScorecard, type Vehicle } from "@/lib/mock-data"
import { Inbox, AlertTriangle, Flame, Clock } from "lucide-react"

export default function IntakePage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState(() => generateVehicles(500))
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Stats for intake vehicles only
  const intakeVehicles = useMemo(() => vehicles.filter((v) => v.status === "intake"), [vehicles])

  const scorecards = useMemo(() => {
    return intakeVehicles.map((v) => ({ vehicle: v, scorecard: generateVehicleScorecard(v) }))
  }, [intakeVehicles])

  const urgentCount = scorecards.filter((s) => s.scorecard.recommendedPriority === "urgent").length
  const hotDemandCount = scorecards.filter((s) => s.scorecard.demandSignal === "hot").length
  const conflictCount = intakeVehicles.filter((v) => v.hasDataConflict).length
  const avgDaysInIntake = Math.round(intakeVehicles.reduce((sum, v) => sum + v.daysInStock, 0) / intakeVehicles.length)

  const handleResolveConflict = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setDrawerOpen(true)
  }, [])

  const handleConflictResolved = useCallback((vehicleId: string, resolutions: Record<string, string | number>) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          return {
            ...v,
            hasDataConflict: false,
            conflictFields: undefined,
            dataHealth: Math.min(100, v.dataHealth + 15),
            mileage: typeof resolutions.mileage === "number" ? resolutions.mileage : v.mileage,
          }
        }
        return v
      }),
    )
    setDrawerOpen(false)
    setSelectedVehicle(null)
  }, [])

  const handleMarkReady = useCallback((vehicleIds: string[]) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (vehicleIds.includes(v.id)) {
          return { ...v, status: "ready" as const }
        }
        return v
      }),
    )
  }, [])

  const handleSendToRecon = useCallback((vehicleIds: string[]) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (vehicleIds.includes(v.id)) {
          return { ...v, status: "recon" as const }
        }
        return v
      }),
    )
  }, [])

  const handleSendToInspection = useCallback((vehicleIds: string[]) => {
    // In real app, would trigger inspection workflow
    console.log("Sending to inspection:", vehicleIds)
  }, [])

  const handleViewDetails = useCallback(
    (vehicle: Vehicle) => {
      router.push(`/vehicle/${vehicle.id}`)
    },
    [router],
  )

  return (
    <AppLayout title="Intake & Triage" subtitle="New defleet vehicles - prioritized by scorecard">
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Pending Intake"
          value={intakeVehicles.length}
          subtitle="New vehicles to triage"
          icon={Inbox}
          status="neutral"
        />
        <StatCard
          title="Urgent Priority"
          value={urgentCount}
          subtitle="Aging or high-risk"
          icon={AlertTriangle}
          status={urgentCount > 30 ? "danger" : urgentCount > 15 ? "warning" : "success"}
        />
        <StatCard
          title="Hot Demand"
          value={hotDemandCount}
          subtitle="Fast-track candidates"
          icon={Flame}
          status="success"
        />
        <StatCard
          title="Avg Days in Intake"
          value={`${avgDaysInIntake}d`}
          subtitle="Target: <3 days"
          icon={Clock}
          status={avgDaysInIntake > 5 ? "danger" : avgDaysInIntake > 3 ? "warning" : "success"}
        />
      </div>

      <EnhancedIntakeTable
        vehicles={vehicles}
        onResolveConflict={handleResolveConflict}
        onMarkReady={handleMarkReady}
        onViewDetails={handleViewDetails}
        onSendToRecon={handleSendToRecon}
        onSendToInspection={handleSendToInspection}
      />

      {/* Conflict Resolver Drawer */}
      <ConflictResolverDrawer
        vehicle={selectedVehicle}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onResolve={handleConflictResolved}
      />
    </AppLayout>
  )
}
