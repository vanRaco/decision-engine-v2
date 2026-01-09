"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { countries } from "@/lib/mock-data"
import type { Playbook } from "@/lib/playbooks"
import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  Shield,
  BookOpen,
  ClipboardList,
  Flag,
  Activity,
  Layers,
  UserRound,
} from "lucide-react"

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

export function PlaybookDetail({ playbook }: { playbook: Playbook }) {
  const health = getHealth(playbook)

  const scopeRows = [
    { label: "Brands", values: playbook.scope.brands },
    { label: "Segments", values: playbook.scope.segments },
    { label: "Fuel Types", values: playbook.scope.fuelTypes },
    {
      label: "Age Band",
      values: [`${playbook.scope.ageBandDays.min}-${playbook.scope.ageBandDays.max} days`],
    },
    { label: "Lifecycle", values: playbook.scope.lifecyclePhases },
    { label: "Channels", values: playbook.scope.channels },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className={statusStyles[playbook.status]}>
              {formatStatus(playbook.status)}
            </Badge>
            <Badge variant="outline" className={cn("text-xs border", health.className)}>
              <Shield className="h-3 w-3 mr-1" />
              {health.label}
            </Badge>
            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
              {playbook.owner}
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Read-only
            </Badge>
          </div>
          <h1 className="text-2xl font-semibold">{playbook.name}</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{playbook.summary}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled className="bg-transparent">
            Edit playbook
          </Button>
          <Button size="sm" disabled>
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Narrative
            </CardTitle>
            <CardDescription>Why this playbook exists</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{playbook.narrative}</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              KPI Targets
            </CardTitle>
            <CardDescription>Performance vs targets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {playbook.kpis.map((kpi) => (
              <div key={kpi.id} className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  {trendIcon[kpi.trend]}
                  {kpi.label}
                </div>
                <div className="text-right">
                  <div className="font-semibold">{kpi.current}</div>
                  <div className="text-xs text-muted-foreground">Target {kpi.target}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Adherence
            </CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Playbook fires</span>
              <span className="font-semibold">{playbook.adherence.firedCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Follow rate</span>
              <span className="font-semibold">{playbook.adherence.followRate}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Override rate</span>
              <span className="font-semibold">{playbook.adherence.overrideRate}%</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">RPI impact</span>
              <span className={playbook.adherence.outcomeRpiImpact >= 0 ? "text-emerald-600 font-semibold" : "text-red-600 font-semibold"}>
                {playbook.adherence.outcomeRpiImpact >= 0 ? "+" : ""}
                {playbook.adherence.outcomeRpiImpact.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Days impact</span>
              <span className={playbook.adherence.outcomeDaysImpact <= 0 ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold"}>
                {playbook.adherence.outcomeDaysImpact > 0 ? "+" : ""}
                {playbook.adherence.outcomeDaysImpact.toFixed(1)}d
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Scope
          </CardTitle>
          <CardDescription>Markets and inventory covered by this playbook</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          {scopeRows.map((row) => (
            <div key={row.label} className="space-y-2">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">{row.label}</div>
              <div className="flex flex-wrap gap-2">
                {row.values.map((value) => (
                  <Badge key={`${row.label}-${value}`} variant="secondary" className="text-xs">
                    {value}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Markets</div>
            <div className="flex flex-wrap gap-2">
              {playbook.scope.countries.map((code) => (
                <Badge key={code} variant="secondary" className="text-xs">
                  {countries[code as keyof typeof countries]?.flag} {code}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Triggers and Conditions
            </CardTitle>
            <CardDescription>When this playbook fires</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Triggers</div>
              <div className="space-y-2">
                {playbook.triggers.map((trigger) => (
                  <div key={trigger.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                    <span>{trigger.label}</span>
                    <Badge variant="outline" className="text-xs">
                      {trigger.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Conditions</div>
              <div className="space-y-2">
                {playbook.conditions.map((condition) => (
                  <div key={condition.id} className="rounded-md border p-2 text-sm">
                    <div className="font-medium">
                      {condition.field} {condition.operator} {condition.value}
                    </div>
                    {condition.description && (
                      <div className="text-xs text-muted-foreground mt-1">{condition.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Flag className="h-4 w-4" />
              Actions and Guardrails
            </CardTitle>
            <CardDescription>What Decision Engine recommends</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Actions</div>
              <div className="space-y-2">
                {playbook.actions.map((action) => (
                  <div key={action.id} className="rounded-md border p-2 text-sm">
                    <div className="font-medium">{action.description}</div>
                    <div className="text-xs text-muted-foreground mt-1">{action.type}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Guardrails</div>
              <div className="space-y-2">
                {playbook.guardrails.map((guardrail) => (
                  <div key={guardrail.id} className="rounded-md border border-dashed p-2 text-sm text-muted-foreground">
                    {guardrail.description}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Assignment Matrix
          </CardTitle>
          <CardDescription>Market rollout, overrides, and opt-outs</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Market</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Variant</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {playbook.assignments.map((assignment) => (
                <TableRow key={`${playbook.id}-${assignment.country}`}>
                  <TableCell className="font-medium">
                    {countries[assignment.country as keyof typeof countries]?.flag} {assignment.country}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        assignment.status === "assigned" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                        assignment.status === "override" && "bg-amber-50 text-amber-700 border-amber-200",
                        assignment.status === "opt-out" && "bg-slate-50 text-slate-600 border-slate-200",
                      )}
                    >
                      {assignment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{assignment.variant || "Standard"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{assignment.note || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <UserRound className="h-4 w-4" />
            Persona Views
          </CardTitle>
          <CardDescription>How each role uses this playbook</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="director">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="director">Director</TabsTrigger>
              <TabsTrigger value="aom">AOM</TabsTrigger>
              <TabsTrigger value="analyst">Pricing Analyst</TabsTrigger>
              <TabsTrigger value="rm">RM</TabsTrigger>
            </TabsList>
            <TabsContent value="director" className="mt-4 text-sm text-muted-foreground">
              {playbook.persona.director}
            </TabsContent>
            <TabsContent value="aom" className="mt-4 text-sm text-muted-foreground">
              {playbook.persona.aom}
            </TabsContent>
            <TabsContent value="analyst" className="mt-4 text-sm text-muted-foreground">
              {playbook.persona.analyst}
            </TabsContent>
            <TabsContent value="rm" className="mt-4 text-sm text-muted-foreground">
              {playbook.persona.rm}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Override Reasons</CardTitle>
            <CardDescription>Most common overrides and outcomes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {playbook.overrideReasons.map((override) => (
              <div key={override.reason} className="flex items-center justify-between rounded-md border p-2 text-sm">
                <span>{override.reason}</span>
                <span className="text-muted-foreground">{override.count}x</span>
                <Badge
                  variant="outline"
                  className={cn(
                    override.outcome === "better" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                    override.outcome === "neutral" && "bg-slate-50 text-slate-600 border-slate-200",
                    override.outcome === "worse" && "bg-red-50 text-red-700 border-red-200",
                  )}
                >
                  {override.outcome}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Version History</CardTitle>
            <CardDescription>Track changes and approvals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {playbook.versions.map((version) => (
              <div key={version.version} className="rounded-md border p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{version.version}</span>
                  <Badge variant="outline" className="text-xs">
                    {version.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mb-2">{version.date}</div>
                <div className="text-sm text-muted-foreground">{version.summary}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <Link href="/playbooks" className="hover:text-foreground">
          Back to Playbooks Library
        </Link>
        <span>Read-only mode enabled</span>
      </div>
    </div>
  )
}
