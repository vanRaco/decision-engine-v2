"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConfidenceBadge, type ConfidenceLevel } from "@/components/ui/confidence-badge"
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
import { Check, X, Settings2, ChevronRight, TrendingUp, Clock, Info } from "lucide-react"
import { overrideReasons } from "@/lib/mock-data"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getPlaybookHref } from "@/lib/playbooks"

interface RecommendationCardProps {
  headline: string
  description?: string
  impacts: {
    label: string
    value: string
    type?: "positive" | "negative" | "neutral"
  }[]
  confidence: ConfidenceLevel
  reasoning?: string[]
  onApprove?: () => void
  onReject?: (reason: string, notes?: string) => void
  onCustomize?: () => void
  variant?: "default" | "compact" | "inline"
  className?: string
  playbook?: string
}

export function RecommendationCard({
  headline,
  description,
  impacts,
  confidence,
  reasoning,
  onApprove,
  onReject,
  onCustomize,
  variant = "default",
  className,
  playbook,
}: RecommendationCardProps) {
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [rejectNotes, setRejectNotes] = useState("")
  const playbookHref = playbook ? getPlaybookHref(playbook) : null

  const handleReject = () => {
    if (rejectReason) {
      onReject?.(rejectReason, rejectNotes)
      setShowRejectModal(false)
      setRejectReason("")
      setRejectNotes("")
    }
  }

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-3 py-1.5", className)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{headline}</span>
            <ConfidenceBadge level={confidence} size="sm" showLabel={false} />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={onApprove}>
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setShowRejectModal(true)}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    )
  }

  if (variant === "compact") {
    return (
      <>
        <div className={cn("rounded-lg border bg-card p-3", className)}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm">{headline}</h4>
                <ConfidenceBadge level={confidence} size="sm" />
              </div>
              {impacts.length > 0 && (
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {impacts.slice(0, 2).map((impact, i) => (
                    <span
                      key={i}
                      className={cn(
                        impact.type === "positive" && "text-emerald-600",
                        impact.type === "negative" && "text-red-600",
                      )}
                    >
                      {impact.label}: {impact.value}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" className="h-7 px-2 bg-transparent" onClick={onApprove}>
                <Check className="h-3.5 w-3.5 mr-1" />
                Approve
              </Button>
              <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setShowRejectModal(true)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
        <RejectModal
          open={showRejectModal}
          onOpenChange={setShowRejectModal}
          reason={rejectReason}
          onReasonChange={setRejectReason}
          notes={rejectNotes}
          onNotesChange={setRejectNotes}
          onConfirm={handleReject}
        />
      </>
    )
  }

  return (
    <>
      <div
        className={cn("rounded-lg border bg-gradient-to-br from-blue-50/50 to-white p-4", "border-blue-100", className)}
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-base">{headline}</h4>
              <ConfidenceBadge level={confidence} />
            </div>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            {playbook && playbookHref && (
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                  Playbook
                </Badge>
                <Link href={playbookHref} className="hover:text-foreground">
                  {playbook}
                </Link>
              </div>
            )}
          </div>
        </div>

        {impacts.length > 0 && (
          <div className="flex flex-wrap gap-4 mb-4 py-3 px-3 bg-white/60 rounded-md border border-blue-100/50">
            {impacts.map((impact, i) => (
              <div key={i} className="flex items-center gap-2">
                {impact.type === "positive" ? (
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                ) : impact.type === "negative" ? (
                  <Clock className="h-4 w-4 text-amber-600" />
                ) : null}
                <span className="text-sm">
                  <span className="text-muted-foreground">{impact.label}:</span>{" "}
                  <span
                    className={cn(
                      "font-medium",
                      impact.type === "positive" && "text-emerald-600",
                      impact.type === "negative" && "text-red-600",
                    )}
                  >
                    {impact.value}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}

        {reasoning && reasoning.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4">
                  <Info className="h-3.5 w-3.5" />
                  <span>Why this recommendation?</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start" className="max-w-sm">
                <ul className="text-sm space-y-1">
                  {reasoning.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-muted-foreground">•</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <div className="flex items-center gap-2">
          <Button onClick={onApprove} className="gap-1.5">
            <Check className="h-4 w-4" />
            Approve
          </Button>
          <Button variant="outline" onClick={() => setShowRejectModal(true)} className="gap-1.5">
            <X className="h-4 w-4" />
            Reject
          </Button>
          {onCustomize && (
            <Button variant="ghost" onClick={onCustomize} className="gap-1.5">
              <Settings2 className="h-4 w-4" />
              Customize
            </Button>
          )}
        </div>
      </div>

      <RejectModal
        open={showRejectModal}
        onOpenChange={setShowRejectModal}
        reason={rejectReason}
        onReasonChange={setRejectReason}
        notes={rejectNotes}
        onNotesChange={setRejectNotes}
        onConfirm={handleReject}
      />
    </>
  )
}

function RejectModal({
  open,
  onOpenChange,
  reason,
  onReasonChange,
  notes,
  onNotesChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  reason: string
  onReasonChange: (reason: string) => void
  notes: string
  onNotesChange: (notes: string) => void
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Override Recommendation</DialogTitle>
          <DialogDescription>
            Help us improve by explaining why you&apos;re changing this decision. This feedback trains our models.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for override</Label>
            <Select value={reason} onValueChange={onReasonChange}>
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
          {reason === "OTHER" && (
            <div className="space-y-2">
              <Label htmlFor="notes">Additional notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Please explain..."
                rows={3}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={!reason}>
            Confirm Override
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
