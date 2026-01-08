"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { ConfidenceBadge } from "@/components/ui/confidence-badge"
import { AlertTriangle, CheckCircle2, Database, Satellite, FileText, Info } from "lucide-react"
import type { Vehicle } from "@/lib/mock-data"

interface ConflictData {
  field: string
  fieldLabel: string
  sources: {
    name: string
    value: string | number
    icon: typeof Database
    timestamp: string
  }[]
  suggestedValue: string | number
  confidence: "high" | "medium" | "low"
  reason: string
}

interface ConflictResolverDrawerProps {
  vehicle: Vehicle | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onResolve: (vehicleId: string, resolutions: Record<string, string | number>) => void
}

// Mock conflict data generator
function getConflictData(vehicle: Vehicle): ConflictData[] {
  const conflicts: ConflictData[] = []

  if (vehicle.conflictFields?.includes("mileage")) {
    conflicts.push({
      field: "mileage",
      fieldLabel: "Mileage",
      sources: [
        {
          name: "ERP (SAP)",
          value: vehicle.mileage,
          icon: Database,
          timestamp: "2025-11-20 14:32",
        },
        {
          name: "Telematics",
          value: vehicle.mileage + 4823,
          icon: Satellite,
          timestamp: "2025-11-25 09:15",
        },
      ],
      suggestedValue: vehicle.mileage + 4823,
      confidence: "high",
      reason: "Telematics data is more recent and directly measured from vehicle",
    })
  }

  if (vehicle.conflictFields?.includes("trim")) {
    conflicts.push({
      field: "trim",
      fieldLabel: "Trim/Variant",
      sources: [
        {
          name: "ERP (SAP)",
          value: "Sport Line",
          icon: Database,
          timestamp: "2025-10-15 10:00",
        },
        {
          name: "Inspection Report",
          value: "M Sport",
          icon: FileText,
          timestamp: "2025-11-22 16:45",
        },
      ],
      suggestedValue: "M Sport",
      confidence: "medium",
      reason: "Inspection report verified on-site, but manual entry may have errors",
    })
  }

  return conflicts
}

export function ConflictResolverDrawer({ vehicle, open, onOpenChange, onResolve }: ConflictResolverDrawerProps) {
  const [resolutions, setResolutions] = useState<Record<string, string | number>>({})
  const [customValues, setCustomValues] = useState<Record<string, string>>({})
  const [useCustom, setUseCustom] = useState<Record<string, boolean>>({})

  if (!vehicle) return null

  const conflicts = getConflictData(vehicle)

  const handleResolutionChange = (field: string, value: string | number) => {
    setResolutions((prev) => ({ ...prev, [field]: value }))
    setUseCustom((prev) => ({ ...prev, [field]: false }))
  }

  const handleCustomChange = (field: string, value: string) => {
    setCustomValues((prev) => ({ ...prev, [field]: value }))
    setResolutions((prev) => ({ ...prev, [field]: value }))
    setUseCustom((prev) => ({ ...prev, [field]: true }))
  }

  const handleConfirm = () => {
    onResolve(vehicle.id, resolutions)
    onOpenChange(false)
  }

  const allResolved = conflicts.every((c) => resolutions[c.field] !== undefined)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Resolve Data Conflicts
          </SheetTitle>
          <SheetDescription>
            {vehicle.year} {vehicle.make} {vehicle.model} - {conflicts.length} conflict
            {conflicts.length !== 1 ? "s" : ""} detected
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {conflicts.map((conflict, index) => (
            <div key={conflict.field} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">{conflict.fieldLabel}</h4>
                <ConfidenceBadge level={conflict.confidence} size="sm" />
              </div>

              {/* Source values */}
              <div className="space-y-2 mb-4">
                <RadioGroup
                  value={useCustom[conflict.field] ? "custom" : String(resolutions[conflict.field])}
                  onValueChange={(val) => {
                    if (val !== "custom") {
                      handleResolutionChange(conflict.field, val)
                    }
                  }}
                >
                  {conflict.sources.map((source, i) => {
                    const Icon = source.icon
                    const isSuggested = source.value === conflict.suggestedValue
                    return (
                      <div
                        key={source.name}
                        className={`flex items-center space-x-3 rounded-lg border p-3 ${
                          isSuggested ? "border-blue-200 bg-blue-50/50" : ""
                        }`}
                      >
                        <RadioGroupItem value={String(source.value)} id={`${conflict.field}-${i}`} />
                        <Label
                          htmlFor={`${conflict.field}-${i}`}
                          className="flex-1 flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{source.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-medium">
                              {typeof source.value === "number" ? source.value.toLocaleString() + " km" : source.value}
                            </span>
                            {isSuggested && (
                              <Badge variant="secondary" className="text-xs">
                                Suggested
                              </Badge>
                            )}
                          </div>
                        </Label>
                      </div>
                    )
                  })}

                  {/* Custom value option */}
                  <div className="flex items-center space-x-3 rounded-lg border p-3">
                    <RadioGroupItem
                      value="custom"
                      id={`${conflict.field}-custom`}
                      checked={useCustom[conflict.field]}
                      onClick={() => setUseCustom((prev) => ({ ...prev, [conflict.field]: true }))}
                    />
                    <Label htmlFor={`${conflict.field}-custom`} className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">Enter custom value</span>
                      </div>
                      {useCustom[conflict.field] && (
                        <Input
                          value={customValues[conflict.field] || ""}
                          onChange={(e) => handleCustomChange(conflict.field, e.target.value)}
                          placeholder={`Enter ${conflict.fieldLabel.toLowerCase()}...`}
                          className="mt-2"
                        />
                      )}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Suggestion reasoning */}
              <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg text-sm">
                <Info className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                <p className="text-muted-foreground">{conflict.reason}</p>
              </div>

              {/* Resolution status */}
              {resolutions[conflict.field] && (
                <div className="flex items-center gap-2 mt-3 text-sm text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    Resolved:{" "}
                    {typeof resolutions[conflict.field] === "number"
                      ? Number(resolutions[conflict.field]).toLocaleString() + " km"
                      : resolutions[conflict.field]}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!allResolved}>
            Confirm {conflicts.length} Resolution{conflicts.length !== 1 ? "s" : ""}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
