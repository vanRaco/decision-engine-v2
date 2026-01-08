"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { PacingDashboard } from "@/components/pacing/pacing-dashboard"

export default function PacingPage() {
  const router = useRouter()

  const handleApproveIntervention = useCallback((interventionId: string) => {
    // In real app, would execute the intervention
    console.log("Approved intervention:", interventionId)
  }, [])

  const handleViewCohort = useCallback(
    (cohortId: string) => {
      // Navigate to inventory with cohort filter
      router.push(`/actions?cohort=${cohortId}`)
    },
    [router],
  )

  return (
    <AppLayout title="Pacing & Risk" subtitle="Monitor month-end compression and take action early">
      <PacingDashboard onApproveIntervention={handleApproveIntervention} onViewCohort={handleViewCohort} />
    </AppLayout>
  )
}
