import playbooksData from "@/data/playbooks.json"

export type PlaybookStatus = "active" | "draft" | "paused" | "retired"
export type PlaybookTrend = "up" | "down" | "flat"
export type PlaybookTriggerType = "lifecycle" | "threshold" | "schedule"
export type PlaybookAssignmentStatus = "assigned" | "override" | "opt-out"
export type PlaybookOutcome = "better" | "neutral" | "worse"

export interface PlaybookScope {
  brands: string[]
  segments: string[]
  fuelTypes: string[]
  ageBandDays: { min: number; max: number }
  countries: string[]
  lifecyclePhases: string[]
  channels: string[]
}

export interface PlaybookTrigger {
  id: string
  type: PlaybookTriggerType
  label: string
}

export interface PlaybookCondition {
  id: string
  field: string
  operator: string
  value: string
  description?: string
}

export interface PlaybookAction {
  id: string
  type: string
  description: string
}

export interface PlaybookGuardrail {
  id: string
  description: string
}

export interface PlaybookKpi {
  id: string
  label: string
  target: string
  current: string
  trend: PlaybookTrend
}

export interface PlaybookAdherence {
  last30Days: number
  firedCount: number
  followRate: number
  overrideRate: number
  outcomeRpiImpact: number
  outcomeDaysImpact: number
}

export interface PlaybookAssignment {
  country: string
  status: PlaybookAssignmentStatus
  variant?: string
  note?: string
}

export interface PlaybookOverrideReason {
  reason: string
  count: number
  outcome: PlaybookOutcome
}

export interface PlaybookVersion {
  version: string
  status: "current" | "previous" | "draft"
  date: string
  summary: string
}

export interface PlaybookPersonaNotes {
  director: string
  aom: string
  analyst: string
  rm: string
}

export interface Playbook {
  id: string
  name: string
  status: PlaybookStatus
  owner: string
  summary: string
  narrative: string
  scope: PlaybookScope
  triggers: PlaybookTrigger[]
  conditions: PlaybookCondition[]
  actions: PlaybookAction[]
  guardrails: PlaybookGuardrail[]
  kpis: PlaybookKpi[]
  adherence: PlaybookAdherence
  assignments: PlaybookAssignment[]
  overrideReasons: PlaybookOverrideReason[]
  versions: PlaybookVersion[]
  persona: PlaybookPersonaNotes
}

const payload = playbooksData as { schemaVersion: number; playbooks: Playbook[] }

export const playbooks = payload.playbooks

export const getPlaybookById = (id: string) => playbooks.find((playbook) => playbook.id === id)

export const getPlaybookByName = (name: string) => playbooks.find((playbook) => playbook.name === name)

export const getPlaybookHref = (idOrName: string) => {
  const byId = getPlaybookById(idOrName)
  if (byId) return `/playbooks/${byId.id}`
  const byName = getPlaybookByName(idOrName)
  if (byName) return `/playbooks/${byName.id}`
  return "/playbooks"
}
