"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle2, XCircle, Clock } from "lucide-react"
import { countries, type ArbitrageOpportunity } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface ArbitrageFlowProps {
  data: ArbitrageOpportunity[]
}

export function ArbitrageFlow({ data }: ArbitrageFlowProps) {
  const captured = data.filter((d) => d.status === "captured")
  const missed = data.filter((d) => d.status === "missed")
  const pending = data.filter((d) => d.status === "pending")

  const totalCaptured = captured.reduce((sum, d) => sum + d.totalUplift, 0)
  const totalMissed = missed.reduce((sum, d) => sum + d.totalUplift, 0)
  const totalPending = pending.reduce((sum, d) => sum + d.totalUplift, 0)

  const StatusIcon = ({ status }: { status: ArbitrageOpportunity["status"] }) => {
    if (status === "captured") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
    if (status === "missed") return <XCircle className="h-4 w-4 text-red-500" />
    return <Clock className="h-4 w-4 text-amber-500" />
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Cross-Border Arbitrage</CardTitle>
            <CardDescription>Export opportunities across European markets</CardDescription>
          </div>
          <div className="flex gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">Captured</span>
              <span className="font-semibold text-emerald-600">€{(totalCaptured / 1000).toFixed(0)}k</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-muted-foreground">Missed</span>
              <span className="font-semibold text-red-600">€{(totalMissed / 1000).toFixed(0)}k</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-muted-foreground">Pending</span>
              <span className="font-semibold text-amber-600">€{(totalPending / 1000).toFixed(0)}k</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.slice(0, 6).map((opp) => (
            <div
              key={opp.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border transition-colors",
                opp.status === "captured" && "bg-emerald-50/50 border-emerald-100",
                opp.status === "missed" && "bg-red-50/50 border-red-100",
                opp.status === "pending" && "bg-amber-50/50 border-amber-100 hover:bg-amber-50",
              )}
            >
              <div className="flex items-center gap-3">
                <StatusIcon status={opp.status} />
                <div className="flex items-center gap-2">
                  <span className="text-lg">{countries[opp.sourceCountry].flag}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-lg">{countries[opp.targetCountry].flag}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{opp.segment}</p>
                  <p className="text-xs text-muted-foreground">{opp.vehicleCount} vehicles</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Avg uplift/unit</p>
                  <p className="font-semibold">€{opp.avgUpliftPerUnit.toLocaleString()}</p>
                </div>
                <div className="text-right min-w-[80px]">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p
                    className={cn(
                      "font-bold",
                      opp.status === "captured" && "text-emerald-600",
                      opp.status === "missed" && "text-red-600",
                      opp.status === "pending" && "text-amber-600",
                    )}
                  >
                    €{(opp.totalUplift / 1000).toFixed(0)}k
                  </p>
                </div>
                {opp.status === "pending" && (
                  <Badge variant="outline" className="text-xs">
                    Action needed
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
