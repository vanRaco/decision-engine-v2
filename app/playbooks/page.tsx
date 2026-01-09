"use client"

import { useMemo } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { PlaybookLibrary } from "@/components/playbooks/playbook-library"
import { StatCard } from "@/components/ui/stat-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { playbooks } from "@/lib/playbooks"
import { BookOpen, ShieldCheck, TrendingUp, Globe } from "lucide-react"

export default function PlaybooksPage() {
  const stats = useMemo(() => {
    const activeCount = playbooks.filter((playbook) => playbook.status === "active").length
    const avgAdherence = Math.round(
      playbooks.reduce((sum, playbook) => sum + playbook.adherence.followRate, 0) / playbooks.length,
    )
    const avgRpiImpact =
      playbooks.reduce((sum, playbook) => sum + playbook.adherence.outcomeRpiImpact, 0) / playbooks.length
    const markets = new Set(playbooks.flatMap((playbook) => playbook.scope.countries))

    return {
      activeCount,
      avgAdherence,
      avgRpiImpact,
      marketsCovered: markets.size,
    }
  }, [playbooks])

  return (
    <AppLayout title="Playbooks" subtitle="Strategy library, rollout, and adherence">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Playbook Library</h2>
            <p className="text-sm text-muted-foreground">Read-only access to strategy and rollout status</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Read-only
            </Badge>
            <Button variant="outline" size="sm" disabled className="bg-transparent">
              New playbook
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <StatCard title="Active Playbooks" value={stats.activeCount} subtitle="Across all markets" icon={BookOpen} />
          <StatCard
            title="Avg Adherence"
            value={`${stats.avgAdherence}%`}
            subtitle="Last 30 days"
            icon={ShieldCheck}
            status={stats.avgAdherence >= 85 ? "success" : stats.avgAdherence >= 70 ? "warning" : "danger"}
          />
          <StatCard
            title="Avg RPI Impact"
            value={`${stats.avgRpiImpact >= 0 ? "+" : ""}${stats.avgRpiImpact.toFixed(1)}%`}
            subtitle="Outcome when followed"
            icon={TrendingUp}
            status={stats.avgRpiImpact >= 0 ? "success" : "danger"}
          />
          <StatCard
            title="Markets Covered"
            value={stats.marketsCovered}
            subtitle="Active scope"
            icon={Globe}
            status="neutral"
          />
        </div>

        <PlaybookLibrary playbooks={playbooks} />
      </div>
    </AppLayout>
  )
}
