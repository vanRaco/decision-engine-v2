"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ActionCard } from "./action-card"
import { ActionDetailPanel } from "./action-detail-panel"
import { Search, Check, Filter, TrendingDown, ArrowRightLeft, FileCheck, Timer, AlertTriangle, Zap } from "lucide-react"
import type { Action, Vehicle } from "@/lib/mock-data"

interface ActionQueueProps {
  actions: Action[]
  vehicles: Vehicle[]
  onApprove: (actionId: string) => void
  onReject: (actionId: string, reason: string, notes?: string) => void
  onBulkApprove: (actionIds: string[]) => void
  onViewVehicle: (vehicleId: string) => void
}

type ActionFilter = "all" | Action["type"]
type PriorityFilter = "all" | Action["priority"]

export function ActionQueue({
  actions,
  vehicles,
  onApprove,
  onReject,
  onBulkApprove,
  onViewVehicle,
}: ActionQueueProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<ActionFilter>("all")
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all")
  const [detailAction, setDetailAction] = useState<Action | null>(null)
  const [detailPanelOpen, setDetailPanelOpen] = useState(false)

  // Create vehicle lookup
  const vehicleMap = useMemo(() => {
    const map = new Map<string, Vehicle>()
    vehicles.forEach((v) => map.set(v.id, v))
    return map
  }, [vehicles])

  const detailVehicle = detailAction ? vehicleMap.get(detailAction.vehicleId) || null : null

  // Filter actions
  const filteredActions = useMemo(() => {
    let result = actions

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((a) => {
        const vehicle = vehicleMap.get(a.vehicleId)
        return (
          a.title.toLowerCase().includes(query) ||
          a.description.toLowerCase().includes(query) ||
          vehicle?.make.toLowerCase().includes(query) ||
          vehicle?.model.toLowerCase().includes(query) ||
          vehicle?.vin.toLowerCase().includes(query)
        )
      })
    }

    if (typeFilter !== "all") {
      result = result.filter((a) => a.type === typeFilter)
    }

    if (priorityFilter !== "all") {
      result = result.filter((a) => a.priority === priorityFilter)
    }

    return result
  }, [actions, searchQuery, typeFilter, priorityFilter, vehicleMap])

  // Group by priority
  const groupedActions = useMemo(() => {
    const groups: Record<Action["priority"], Action[]> = {
      critical: [],
      high: [],
      medium: [],
      low: [],
    }
    filteredActions.forEach((a) => groups[a.priority].push(a))
    return groups
  }, [filteredActions])

  // Counts by type
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      "price-drop": 0,
      "channel-switch": 0,
      "accept-offer": 0,
      "rofr-expiring": 0,
      "data-conflict": 0,
      "aging-risk": 0,
      "export-opportunity": 0,
      "market-shift": 0,
    }
    actions.forEach((a) => {
      if (counts[a.type] !== undefined) counts[a.type]++
    })
    return counts
  }, [actions])

  const toggleSelect = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (selected) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const handleBulkApprove = () => {
    onBulkApprove(Array.from(selectedIds))
    setSelectedIds(new Set())
  }

  const handleOpenDetail = (action: Action) => {
    setDetailAction(action)
    setDetailPanelOpen(true)
  }

  const handleCloseDetail = () => {
    setDetailPanelOpen(false)
    setDetailAction(null)
  }

  const handleDetailApprove = () => {
    if (detailAction) {
      onApprove(detailAction.id)
      handleCloseDetail()
    }
  }

  const handleDetailReject = () => {
    if (detailAction) {
      onReject(detailAction.id, "MANUAL_OVERRIDE", "Override from detail panel")
      handleCloseDetail()
    }
  }

  const handleDetailViewVehicle = () => {
    if (detailAction) {
      onViewVehicle(detailAction.vehicleId)
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search actions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-9 h-9"
            />
          </div>

          {/* Type filter tabs */}
          <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as ActionFilter)}>
            <TabsList className="h-9">
              <TabsTrigger value="all" className="text-xs">
                All ({actions.length})
              </TabsTrigger>
              <TabsTrigger value="rofr-expiring" className="text-xs gap-1">
                <Timer className="h-3.5 w-3.5" />
                ROFR ({typeCounts["rofr-expiring"]})
              </TabsTrigger>
              <TabsTrigger value="price-drop" className="text-xs gap-1">
                <TrendingDown className="h-3.5 w-3.5" />
                Price ({typeCounts["price-drop"]})
              </TabsTrigger>
              <TabsTrigger value="channel-switch" className="text-xs gap-1">
                <ArrowRightLeft className="h-3.5 w-3.5" />
                Channel ({typeCounts["channel-switch"]})
              </TabsTrigger>
              <TabsTrigger value="accept-offer" className="text-xs gap-1">
                <FileCheck className="h-3.5 w-3.5" />
                Offers ({typeCounts["accept-offer"]})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Priority filter */}
          <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as PriorityFilter)}>
            <SelectTrigger className="w-32 h-9">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk actions */}
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <>
              <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
              <Button size="sm" onClick={handleBulkApprove} className="gap-1">
                <Check className="h-4 w-4" />
                Approve Selected
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" className="gap-1 bg-transparent">
            <Zap className="h-4 w-4" />
            Auto-approve Safe
          </Button>
        </div>
      </div>

      {/* Action groups */}
      <div className="space-y-6">
        {/* Critical */}
        {groupedActions.critical.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Critical
              </Badge>
              <span className="text-sm text-muted-foreground">
                {groupedActions.critical.length} actions requiring immediate attention
              </span>
            </div>
            <div className="space-y-3">
              {groupedActions.critical.map((action) => {
                const vehicle = vehicleMap.get(action.vehicleId)
                if (!vehicle) return null
                return (
                  <ActionCard
                    key={action.id}
                    action={action}
                    vehicle={vehicle}
                    selected={selectedIds.has(action.id)}
                    onSelect={(selected) => toggleSelect(action.id, selected)}
                    onApprove={() => onApprove(action.id)}
                    onReject={(reason, notes) => onReject(action.id, reason, notes)}
                    onViewVehicle={() => onViewVehicle(action.vehicleId)}
                    onOpenDetail={() => handleOpenDetail(action)}
                  />
                )
              })}
            </div>
          </div>
        )}

        {/* High */}
        {groupedActions.high.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-orange-100 text-orange-700 border-orange-200 gap-1">High Priority</Badge>
              <span className="text-sm text-muted-foreground">{groupedActions.high.length} actions</span>
            </div>
            <div className="space-y-3">
              {groupedActions.high.map((action) => {
                const vehicle = vehicleMap.get(action.vehicleId)
                if (!vehicle) return null
                return (
                  <ActionCard
                    key={action.id}
                    action={action}
                    vehicle={vehicle}
                    selected={selectedIds.has(action.id)}
                    onSelect={(selected) => toggleSelect(action.id, selected)}
                    onApprove={() => onApprove(action.id)}
                    onReject={(reason, notes) => onReject(action.id, reason, notes)}
                    onViewVehicle={() => onViewVehicle(action.vehicleId)}
                    onOpenDetail={() => handleOpenDetail(action)}
                  />
                )
              })}
            </div>
          </div>
        )}

        {/* Medium */}
        {groupedActions.medium.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 gap-1">Medium Priority</Badge>
              <span className="text-sm text-muted-foreground">{groupedActions.medium.length} actions</span>
            </div>
            <div className="space-y-3">
              {groupedActions.medium.map((action) => {
                const vehicle = vehicleMap.get(action.vehicleId)
                if (!vehicle) return null
                return (
                  <ActionCard
                    key={action.id}
                    action={action}
                    vehicle={vehicle}
                    selected={selectedIds.has(action.id)}
                    onSelect={(selected) => toggleSelect(action.id, selected)}
                    onApprove={() => onApprove(action.id)}
                    onReject={(reason, notes) => onReject(action.id, reason, notes)}
                    onViewVehicle={() => onViewVehicle(action.vehicleId)}
                    onOpenDetail={() => handleOpenDetail(action)}
                  />
                )
              })}
            </div>
          </div>
        )}

        {/* Low */}
        {groupedActions.low.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="gap-1">
                Low Priority
              </Badge>
              <span className="text-sm text-muted-foreground">{groupedActions.low.length} actions</span>
            </div>
            <div className="space-y-3">
              {groupedActions.low.map((action) => {
                const vehicle = vehicleMap.get(action.vehicleId)
                if (!vehicle) return null
                return (
                  <ActionCard
                    key={action.id}
                    action={action}
                    vehicle={vehicle}
                    selected={selectedIds.has(action.id)}
                    onSelect={(selected) => toggleSelect(action.id, selected)}
                    onApprove={() => onApprove(action.id)}
                    onReject={(reason, notes) => onReject(action.id, reason, notes)}
                    onViewVehicle={() => onViewVehicle(action.vehicleId)}
                    onOpenDetail={() => handleOpenDetail(action)}
                  />
                )
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {filteredActions.length === 0 && (
          <div className="text-center py-12">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-muted mx-auto mb-4">
              <Check className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">All caught up!</h3>
            <p className="text-sm text-muted-foreground">No pending actions matching your filters.</p>
          </div>
        )}
      </div>

      <ActionDetailPanel
        action={detailAction}
        vehicle={detailVehicle}
        open={detailPanelOpen}
        onClose={handleCloseDetail}
        onApprove={handleDetailApprove}
        onReject={handleDetailReject}
        onViewVehicle={handleDetailViewVehicle}
      />
    </div>
  )
}
