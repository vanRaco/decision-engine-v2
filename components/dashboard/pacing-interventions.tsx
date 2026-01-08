"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConfidenceBadge } from "@/components/ui/confidence-badge"
import { ArrowRight, Zap, TrendingUp, Clock, Target } from "lucide-react"
import { cn } from "@/lib/utils"

interface Intervention {
  id: string
  title: string
  description: string
  impact: {
    volumeRecovery: number
    rpiImpact: number
    daysImpact: number
  }
  confidence: "high" | "medium" | "low"
  urgency: "critical" | "high" | "medium"
  affectedVehicles: number
  targetSegment: string
}

const mockInterventions: Intervention[] = [
  {
    id: "INT-001",
    title: "Accelerate EV rotation via NL export",
    description: "51 Electric SUVs in FR showing low domestic demand. NL market has 23% higher buyer activity.",
    impact: { volumeRecovery: 51, rpiImpact: 2.8, daysImpact: -12 },
    confidence: "high",
    urgency: "critical",
    affectedVehicles: 51,
    targetSegment: "Electric SUV",
  },
  {
    id: "INT-002",
    title: "Reserve adjustment for aging diesels",
    description: "67 mid-size diesels >45 days. Recommend 4% reserve reduction to hit 7-day sale probability.",
    impact: { volumeRecovery: 67, rpiImpact: -0.8, daysImpact: -8 },
    confidence: "high",
    urgency: "high",
    affectedVehicles: 67,
    targetSegment: "Mid-size Diesel",
  },
  {
    id: "INT-003",
    title: "Channel switch: IT executive sedans to DE",
    description: "DE showing 18% price premium for executive sedans. Net +€1,450/unit after transport.",
    impact: { volumeRecovery: 34, rpiImpact: 3.2, daysImpact: 2 },
    confidence: "medium",
    urgency: "medium",
    affectedVehicles: 34,
    targetSegment: "Executive Sedan",
  },
]

export function PacingInterventions() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Recommended Interventions</CardTitle>
            <CardDescription>Actions to recover pacing without end-of-month fire sales</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            <Target className="h-3 w-3 mr-1" />
            152 units recoverable
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockInterventions.map((intervention) => (
          <div
            key={intervention.id}
            className={cn(
              "p-4 rounded-lg border",
              intervention.urgency === "critical" && "bg-red-50/50 border-red-200",
              intervention.urgency === "high" && "bg-amber-50/50 border-amber-200",
              intervention.urgency === "medium" && "bg-slate-50/50 border-slate-200",
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Zap
                    className={cn(
                      "h-4 w-4",
                      intervention.urgency === "critical" && "text-red-500",
                      intervention.urgency === "high" && "text-amber-500",
                      intervention.urgency === "medium" && "text-slate-500",
                    )}
                  />
                  <h4 className="font-medium text-sm">{intervention.title}</h4>
                  <ConfidenceBadge level={intervention.confidence} size="sm" />
                </div>
                <p className="text-xs text-muted-foreground">{intervention.description}</p>
                <div className="flex items-center gap-4 pt-1">
                  <div className="flex items-center gap-1 text-xs">
                    <Target className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">{intervention.affectedVehicles}</span>
                    <span className="text-muted-foreground">vehicles</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                    <span
                      className={cn(
                        "font-medium",
                        intervention.impact.rpiImpact > 0 ? "text-emerald-600" : "text-red-600",
                      )}
                    >
                      {intervention.impact.rpiImpact > 0 ? "+" : ""}
                      {intervention.impact.rpiImpact.toFixed(1)}% RPI
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Clock className="h-3 w-3 text-blue-500" />
                    <span className="font-medium text-blue-600">{intervention.impact.daysImpact}d DTS</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button size="sm" className="text-xs">
                  Apply
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
                <Button size="sm" variant="ghost" className="text-xs">
                  Details
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
