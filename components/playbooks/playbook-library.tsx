"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { countries } from "@/lib/mock-data"
import type { Playbook } from "@/lib/playbooks"
import { ArrowUpRight, ArrowDownRight, Minus, Shield, SlidersHorizontal } from "lucide-react"

const statusStyles: Record<Playbook["status"], string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  draft: "bg-amber-100 text-amber-700 border-amber-200",
  paused: "bg-slate-100 text-slate-600 border-slate-200",
  retired: "bg-slate-100 text-slate-500 border-slate-200",
}

const formatStatus = (status: Playbook["status"]) => status.charAt(0).toUpperCase() + status.slice(1)

const trendIcon = {
  up: <ArrowUpRight className="h-3 w-3" />,
  down: <ArrowDownRight className="h-3 w-3" />,
  flat: <Minus className="h-3 w-3" />,
}

const getHealth = (playbook: Playbook) => {
  if (playbook.status === "draft") return { label: "Draft", className: "bg-slate-50 text-slate-600" }
  if (playbook.status === "paused") return { label: "Paused", className: "bg-slate-50 text-slate-600" }
  if (playbook.status === "retired") return { label: "Retired", className: "bg-slate-50 text-slate-600" }
  if (playbook.adherence.followRate >= 85) return { label: "Healthy", className: "bg-emerald-50 text-emerald-700" }
  if (playbook.adherence.followRate >= 70) return { label: "Watch", className: "bg-amber-50 text-amber-700" }
  return { label: "At Risk", className: "bg-red-50 text-red-700" }
}

const getScopeChips = (playbook: Playbook) => {
  const age = `${playbook.scope.ageBandDays.min}-${playbook.scope.ageBandDays.max}d`
  const chips = [
    ...playbook.scope.segments,
    ...playbook.scope.fuelTypes,
    age,
    ...playbook.scope.countries,
  ]
  return chips.slice(0, 6)
}

const getCountryOptions = (playbooks: Playbook[]) => {
  const all = new Set(playbooks.flatMap((playbook) => playbook.scope.countries))
  return Array.from(all)
}

export function PlaybookLibrary({ playbooks }: { playbooks: Playbook[] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | Playbook["status"]>("all")
  const [countryFilter, setCountryFilter] = useState("all")

  const countryOptions = useMemo(() => getCountryOptions(playbooks), [playbooks])

  const filteredPlaybooks = useMemo(() => {
    return playbooks.filter((playbook) => {
      if (statusFilter !== "all" && playbook.status !== statusFilter) return false
      if (countryFilter !== "all" && !playbook.scope.countries.includes(countryFilter)) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          playbook.name.toLowerCase().includes(query) ||
          playbook.summary.toLowerCase().includes(query) ||
          playbook.scope.segments.join(" ").toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [playbooks, statusFilter, countryFilter, searchQuery])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <SlidersHorizontal className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search playbooks, segments..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-72 pl-9 h-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>

          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="w-44 h-9">
              <SelectValue placeholder="Market" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All markets</SelectItem>
              {countryOptions.map((code) => (
                <SelectItem key={code} value={code}>
                  {countries[code as keyof typeof countries]?.flag} {code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground">{filteredPlaybooks.length} playbooks</div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filteredPlaybooks.map((playbook) => {
          const health = getHealth(playbook)
          const scopeChips = getScopeChips(playbook)
          return (
            <Card key={playbook.id} className="flex flex-col">
              <CardHeader className="space-y-2 pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={statusStyles[playbook.status]}>
                    {formatStatus(playbook.status)}
                  </Badge>
                  <Badge variant="outline" className={cn("text-xs border", health.className)}>
                    <Shield className="h-3 w-3 mr-1" />
                    {health.label}
                  </Badge>
                </div>
                <CardTitle className="text-base">{playbook.name}</CardTitle>
                <CardDescription>{playbook.summary}</CardDescription>
              </CardHeader>

              <CardContent className="flex flex-col gap-4 mt-auto">
                <div className="flex flex-wrap gap-2">
                  {scopeChips.map((chip, index) => (
                    <Badge key={`${playbook.id}-${chip}-${index}`} variant="secondary" className="text-xs">
                      {chip}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-3 rounded-md border bg-muted/30 p-3">
                  {playbook.kpis.slice(0, 3).map((kpi) => (
                    <div key={kpi.id} className="text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        {trendIcon[kpi.trend]}
                        {kpi.label}
                      </div>
                      <div className="font-semibold text-sm">{kpi.current}</div>
                      <div className="text-[11px] text-muted-foreground">Target {kpi.target}</div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{playbook.adherence.firedCount} fires</span>
                  <span>{playbook.adherence.followRate}% followed</span>
                </div>

                <Button variant="outline" size="sm" className="bg-transparent" asChild>
                  <Link href={`/playbooks/${playbook.id}`}>View playbook</Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredPlaybooks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-sm text-muted-foreground">No playbooks match the current filters.</div>
        </div>
      )}
    </div>
  )
}
