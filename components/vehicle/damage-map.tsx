"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface Damage {
  id: string
  location: string
  type: string
  severity: "minor" | "moderate" | "major"
  cost: number
  position: { x: number; y: number }
}

interface DamageMapProps {
  damages: Damage[]
  selectedDamageId?: string
  onSelectDamage?: (damageId: string) => void
}

const severityConfig = {
  minor: { color: "bg-amber-400", label: "Minor", ring: "ring-amber-400" },
  moderate: { color: "bg-orange-500", label: "Moderate", ring: "ring-orange-500" },
  major: { color: "bg-red-500", label: "Major", ring: "ring-red-500" },
}

export function DamageMap({ damages, selectedDamageId, onSelectDamage }: DamageMapProps) {
  const totalCost = damages.reduce((sum, d) => sum + d.cost, 0)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Damage Assessment</CardTitle>
            <CardDescription>{damages.length} items identified</CardDescription>
          </div>
          <Badge variant="outline" className="text-sm">
            Est. €{totalCost.toLocaleString()} total
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Car diagram */}
        <div className="relative aspect-[2/1] bg-slate-100 rounded-lg mb-4 overflow-hidden">
          {/* Simple car outline SVG */}
          <svg viewBox="0 0 200 100" className="w-full h-full">
            {/* Car body */}
            <path
              d="M20 60 L30 40 L70 35 L130 35 L170 40 L180 60 L180 70 L20 70 Z"
              fill="#e2e8f0"
              stroke="#94a3b8"
              strokeWidth="1"
            />
            {/* Windows */}
            <path d="M35 42 L65 38 L65 55 L35 55 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.5" />
            <path d="M70 38 L100 38 L100 55 L70 55 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.5" />
            <path d="M105 38 L130 38 L130 55 L105 55 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.5" />
            <path d="M135 40 L165 45 L165 55 L135 55 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.5" />
            {/* Wheels */}
            <circle cx="50" cy="70" r="12" fill="#475569" />
            <circle cx="150" cy="70" r="12" fill="#475569" />
            <circle cx="50" cy="70" r="6" fill="#94a3b8" />
            <circle cx="150" cy="70" r="6" fill="#94a3b8" />
          </svg>

          {/* Damage markers */}
          {damages.map((damage) => {
            const config = severityConfig[damage.severity]
            const isSelected = selectedDamageId === damage.id
            return (
              <button
                key={damage.id}
                className={cn(
                  "absolute h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white transition-all",
                  config.color,
                  isSelected && `ring-4 ${config.ring} ring-opacity-50 scale-125`,
                )}
                style={{
                  left: `${damage.position.x}%`,
                  top: `${damage.position.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                onClick={() => onSelectDamage?.(damage.id)}
              >
                {damages.indexOf(damage) + 1}
              </button>
            )
          })}
        </div>

        {/* Damage list */}
        <div className="space-y-2">
          {damages.map((damage, i) => {
            const config = severityConfig[damage.severity]
            const isSelected = selectedDamageId === damage.id
            return (
              <div
                key={damage.id}
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors",
                  isSelected ? "bg-slate-100 border-slate-300" : "hover:bg-slate-50",
                )}
                onClick={() => onSelectDamage?.(damage.id)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white",
                      config.color,
                    )}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{damage.location}</div>
                    <div className="text-xs text-muted-foreground">{damage.type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {config.label}
                  </Badge>
                  <span className="text-sm font-medium">€{damage.cost}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t">
          {Object.entries(severityConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs">
              <div className={cn("h-3 w-3 rounded-full", config.color)} />
              <span className="text-muted-foreground">{config.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
