"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ConfidenceBadge } from "@/components/ui/confidence-badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Check,
  X,
  Clock,
  TrendingDown,
  ArrowRightLeft,
  FileCheck,
  AlertTriangle,
  Timer,
  ChevronRight,
  Euro,
  TrendingUp,
  User,
  Percent,
  MessageSquare,
  Info,
} from "lucide-react"
import { overrideReasons, generateOfferDetail, type Action, type Vehicle, countries } from "@/lib/mock-data"
import { getPlaybookHref } from "@/lib/playbooks"

interface ActionCardProps {
  action: Action
  vehicle: Vehicle
  selected?: boolean
  onSelect?: (selected: boolean) => void
  onApprove: () => void
  onReject: (reason: string, notes?: string) => void
  onViewVehicle: () => void
  onOpenDetail?: () => void
}

const actionTypeConfig: Record<
  Action["type"],
  {
    icon: typeof Clock
    color: string
    bgColor: string
  }
> = {
  "price-drop": {
    icon: TrendingDown,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-100",
  },
  "channel-switch": {
    icon: ArrowRightLeft,
    color: "text-purple-600",
    bgColor: "bg-purple-50 border-purple-100",
  },
  "accept-offer": {
    icon: FileCheck,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 border-emerald-100",
  },
  "rofr-expiring": {
    icon: Timer,
    color: "text-red-600",
    bgColor: "bg-red-50 border-red-100",
  },
  "data-conflict": {
    icon: AlertTriangle,
    color: "text-amber-600",
    bgColor: "bg-amber-50 border-amber-100",
  },
  "aging-risk": {
    icon: Clock,
    color: "text-orange-600",
    bgColor: "bg-orange-50 border-orange-100",
  },
  "export-opportunity": {
    icon: ArrowRightLeft,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-100",
  },
  "market-shift": {
    icon: TrendingDown,
    color: "text-purple-600",
    bgColor: "bg-purple-50 border-purple-100",
  },
}

const priorityConfig: Record<
  Action["priority"],
  {
    label: string
    className: string
  }
> = {
  critical: { label: "Critical", className: "bg-red-100 text-red-700 border-red-200" },
  high: { label: "High", className: "bg-orange-100 text-orange-700 border-orange-200" },
  medium: { label: "Medium", className: "bg-blue-100 text-blue-700 border-blue-200" },
  low: { label: "Low", className: "bg-slate-100 text-slate-600 border-slate-200" },
}

export function ActionCard({
  action,
  vehicle,
  selected,
  onSelect,
  onApprove,
  onReject,
  onViewVehicle,
  onOpenDetail,
}: ActionCardProps) {
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [rejectNotes, setRejectNotes] = useState("")

  const typeConfig = actionTypeConfig[action.type]
  const priority = priorityConfig[action.priority]
  const Icon = typeConfig.icon
  const playbookName = action.reasoning.playbook
  const playbookHref = playbookName ? getPlaybookHref(playbookName) : null

  const offerDetail = useMemo(() => {
    if (action.type === "accept-offer") {
      return generateOfferDetail(vehicle)
    }
    return null
  }, [action.type, vehicle])

  const handleReject = () => {
    if (rejectReason) {
      onReject(rejectReason, rejectNotes)
      setShowRejectModal(false)
      setRejectReason("")
      setRejectNotes("")
    }
  }

  // Format time until expiry
  const getExpiryText = () => {
    if (!action.expiresAt) return null
    const diff = action.expiresAt.getTime() - Date.now()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    if (hours < 0) return "Expired"
    if (hours < 1) return `${minutes}m remaining`
    return `${hours}h ${minutes}m remaining`
  }

  return (
    <>
      <div
        className={cn(
          "rounded-lg border p-4 transition-all",
          typeConfig.bgColor,
          selected && "ring-2 ring-primary ring-offset-2",
        )}
      >
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          {onSelect && <Checkbox checked={selected} onCheckedChange={onSelect} className="mt-1" />}

          {/* Icon */}
          <div
            className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white", typeConfig.color)}
          >
            <Icon className="h-5 w-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <h4 className="font-semibold text-sm">{action.title}</h4>
                <button
                  className="text-xs text-muted-foreground hover:text-foreground hover:underline flex items-center gap-1"
                  onClick={onViewVehicle}
                >
                  {vehicle.year} {vehicle.make} {vehicle.model}
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={priority.className}>
                  {priority.label}
                </Badge>
                <ConfidenceBadge level={action.confidence} size="sm" />
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{action.description}</p>

            {playbookName && playbookHref && (
              <Link
                href={playbookHref}
                className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mb-3"
              >
                <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                  Playbook
                </Badge>
                <span>{playbookName}</span>
              </Link>
            )}

            {offerDetail && (
              <div className="mb-3 p-3 bg-white rounded-lg border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{offerDetail.amount.toLocaleString()}</span>
                    <Badge
                      variant="outline"
                      className={
                        offerDetail.percentile <= 20 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }
                    >
                      Top {offerDetail.percentile}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{offerDetail.percentOfAsk}%</span>
                    <span className="text-muted-foreground">of ask</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Buyer rating:</span>
                    <span className="font-medium">{offerDetail.buyerRating}/100</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Check className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Completion:</span>
                    <span className="font-medium">{offerDetail.buyerCompletionRate}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Timer className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-amber-600 font-medium">Expires in {offerDetail.expiresIn}</span>
                  </div>
                </div>

                {offerDetail.counterSuggestion && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      <span className="text-muted-foreground">Suggested counter:</span>
                      <span className="font-bold text-blue-600">{offerDetail.counterSuggestion.toLocaleString()}</span>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 text-xs bg-transparent">
                      Send Counter
                    </Button>
                  </div>
                )}

                {offerDetail.isRecommendedAccept && (
                  <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 rounded px-2 py-1">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-medium">Recommended to accept - strong offer for this vehicle</span>
                  </div>
                )}
              </div>
            )}

            {/* Impact metrics - hide for offer type since we show detailed context above */}
            {!offerDetail && (
              <div className="flex flex-wrap items-center gap-3 mb-3">
                {action.impact.netUplift !== undefined && (
                  <div className="flex items-center gap-1 text-sm">
                    <Euro className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-medium">+{action.impact.netUplift.toLocaleString()}</span>
                    <span className="text-muted-foreground">uplift</span>
                  </div>
                )}
                {action.impact.daysChange !== undefined && (
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-3.5 w-3.5 text-blue-600" />
                    <span
                      className={cn(
                        "font-medium",
                        action.impact.daysChange < 0 ? "text-emerald-600" : "text-amber-600",
                      )}
                    >
                      {action.impact.daysChange > 0 ? "+" : ""}
                      {action.impact.daysChange}d
                    </span>
                    <span className="text-muted-foreground">to sell</span>
                  </div>
                )}
                {action.impact.rpiChange !== undefined && (
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingDown className="h-3.5 w-3.5" />
                    <span
                      className={cn("font-medium", action.impact.rpiChange > 0 ? "text-emerald-600" : "text-amber-600")}
                    >
                      {action.impact.rpiChange > 0 ? "+" : ""}
                      {action.impact.rpiChange}%
                    </span>
                    <span className="text-muted-foreground">RPI</span>
                  </div>
                )}
                {action.expiresAt && (
                  <div className="flex items-center gap-1 text-sm">
                    <Timer className="h-3.5 w-3.5 text-red-500" />
                    <span className="text-red-600 font-medium">{getExpiryText()}</span>
                  </div>
                )}
              </div>
            )}

            {/* Vehicle context */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3 py-2 px-3 bg-white/50 rounded">
              <span>
                {countries[vehicle.country].flag} {vehicle.country}
              </span>
              <span>{vehicle.mileage.toLocaleString()} km</span>
              <span>Grade {vehicle.conditionGrade}</span>
              <span>{vehicle.daysInStock}d in stock</span>
              <span className="font-medium text-foreground">{vehicle.marketValue.toLocaleString()}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={onApprove} className="gap-1">
                <Check className="h-3.5 w-3.5" />
                {offerDetail ? "Accept Offer" : "Approve"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowRejectModal(true)} className="gap-1">
                <X className="h-3.5 w-3.5" />
                {offerDetail ? "Decline" : "Reject"}
              </Button>
              {offerDetail && offerDetail.counterSuggestion && (
                <Button size="sm" variant="secondary" className="gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Counter
                </Button>
              )}
              {onOpenDetail && (
                <Button size="sm" variant="ghost" onClick={onOpenDetail} className="gap-1 ml-auto">
                  <Info className="h-3.5 w-3.5" />
                  Details
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Override Recommendation</DialogTitle>
            <DialogDescription>Help us improve by explaining why you&apos;re rejecting this action.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason for override</Label>
              <Select value={rejectReason} onValueChange={setRejectReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason..." />
                </SelectTrigger>
                <SelectContent>
                  {overrideReasons.map((r) => (
                    <SelectItem key={r.code} value={r.code}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {rejectReason === "OTHER" && (
              <div className="space-y-2">
                <Label>Additional notes</Label>
                <Textarea
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  placeholder="Please explain..."
                  rows={3}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleReject} disabled={!rejectReason}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
