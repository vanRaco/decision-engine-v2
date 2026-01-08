"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { ActionQueue } from "@/components/actions/action-queue"
import { StatCard } from "@/components/ui/stat-card"
import { generateVehicles, generateActions, type Action } from "@/lib/mock-data"
import { ListTodo, AlertTriangle, Clock, TrendingUp } from "lucide-react"

export default function ActionsPage() {
  const router = useRouter()
  const [vehicles] = useState(() => generateVehicles(500))
  const [actions, setActions] = useState<Action[]>(() => generateActions(vehicles))

  // Stats
  const criticalCount = actions.filter((a) => a.priority === "critical").length
  const rofrExpiringCount = actions.filter((a) => a.type === "rofr-expiring").length
  const totalUplift = actions.reduce((sum, a) => sum + (a.impact.netUplift || 0), 0)
  const avgDaysImpact = actions.reduce((sum, a) => sum + (a.impact.daysChange || 0), 0) / actions.length

  const handleApprove = useCallback((actionId: string) => {
    setActions((prev) => prev.filter((a) => a.id !== actionId))
  }, [])

  const handleReject = useCallback((actionId: string, reason: string, notes?: string) => {
    // In real app, would log the rejection reason for ML training
    console.log("Rejected:", actionId, reason, notes)
    setActions((prev) => prev.filter((a) => a.id !== actionId))
  }, [])

  const handleBulkApprove = useCallback((actionIds: string[]) => {
    setActions((prev) => prev.filter((a) => !actionIds.includes(a.id)))
  }, [])

  const handleViewVehicle = useCallback(
    (vehicleId: string) => {
      router.push(`/vehicle/${vehicleId}`)
    },
    [router],
  )

  return (
    <AppLayout title="Action Queue" subtitle="Daily next best actions - prioritized for impact">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Pending Actions"
          value={actions.length}
          subtitle="Requiring your decision"
          icon={ListTodo}
          status="neutral"
        />
        <StatCard
          title="Critical"
          value={criticalCount}
          subtitle={`${rofrExpiringCount} ROFR expiring`}
          icon={AlertTriangle}
          status={criticalCount > 10 ? "danger" : criticalCount > 5 ? "warning" : "success"}
        />
        <StatCard
          title="Potential Uplift"
          value={`€${(totalUplift / 1000).toFixed(0)}k`}
          subtitle="If all approved"
          icon={TrendingUp}
          status="success"
        />
        <StatCard
          title="Avg Days Impact"
          value={`${avgDaysImpact > 0 ? "+" : ""}${avgDaysImpact.toFixed(1)}d`}
          subtitle="Days to sell change"
          icon={Clock}
          status={avgDaysImpact < 0 ? "success" : "warning"}
        />
      </div>

      {/* Action Queue */}
      <ActionQueue
        actions={actions}
        vehicles={vehicles}
        onApprove={handleApprove}
        onReject={handleReject}
        onBulkApprove={handleBulkApprove}
        onViewVehicle={handleViewVehicle}
      />
    </AppLayout>
  )
}
