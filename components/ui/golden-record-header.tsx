import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ConfidenceBadge } from "@/components/ui/confidence-badge"
import { Car, MapPin, Gauge, AlertTriangle, CheckCircle2, Clock, Tag, Fuel } from "lucide-react"
import type { Vehicle } from "@/lib/mock-data"

interface GoldenRecordHeaderProps {
  vehicle: Vehicle
  className?: string
}

const statusConfig: Record<Vehicle["status"], { label: string; className: string }> = {
  intake: { label: "Intake", className: "bg-slate-100 text-slate-700" },
  recon: { label: "Recon", className: "bg-amber-100 text-amber-700" },
  ready: { label: "Ready", className: "bg-blue-100 text-blue-700" },
  listed: { label: "Listed", className: "bg-emerald-100 text-emerald-700" },
  offer: { label: "Offer Received", className: "bg-purple-100 text-purple-700" },
  sold: { label: "Sold", className: "bg-green-100 text-green-700" },
}

const getDaysInStockColor = (days: number): string => {
  if (days <= 30) return "text-emerald-600"
  if (days <= 60) return "text-amber-600"
  return "text-red-600"
}

const getGradeColor = (grade: Vehicle["conditionGrade"]): string => {
  switch (grade) {
    case "A":
      return "bg-emerald-100 text-emerald-700 border-emerald-200"
    case "B":
      return "bg-blue-100 text-blue-700 border-blue-200"
    case "C":
      return "bg-amber-100 text-amber-700 border-amber-200"
    case "D":
      return "bg-red-100 text-red-700 border-red-200"
  }
}

export function GoldenRecordHeader({ vehicle, className }: GoldenRecordHeaderProps) {
  const status = statusConfig[vehicle.status]

  return (
    <div className={cn("sticky top-0 z-10 bg-white border-b px-4 py-3", className)}>
      <div className="flex items-start justify-between gap-4">
        {/* Left: Vehicle identity */}
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-slate-100">
            <Car className="h-6 w-6 text-slate-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
              <Badge variant="outline" className={getGradeColor(vehicle.conditionGrade)}>
                Grade {vehicle.conditionGrade}
              </Badge>
              <Badge className={status.className}>{status.label}</Badge>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span className="font-mono text-xs">{vehicle.vin}</span>
              <span className="flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" />
                {vehicle.variant}
              </span>
              <span className="flex items-center gap-1">
                <Fuel className="h-3.5 w-3.5" />
                {vehicle.fuelType.charAt(0).toUpperCase() + vehicle.fuelType.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Key metrics */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Location</div>
            <div className="flex items-center gap-1 text-sm font-medium">
              <MapPin className="h-3.5 w-3.5" />
              {vehicle.location}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Mileage</div>
            <div className="flex items-center gap-1 text-sm font-medium">
              <Gauge className="h-3.5 w-3.5" />
              {vehicle.mileage.toLocaleString()} km
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Days in Stock</div>
            <div
              className={cn("flex items-center gap-1 text-sm font-semibold", getDaysInStockColor(vehicle.daysInStock))}
            >
              <Clock className="h-3.5 w-3.5" />
              {vehicle.daysInStock} days
            </div>
          </div>
          <div className="flex items-center gap-2 pl-4 border-l">
            {vehicle.hasDataConflict ? (
              <div className="flex items-center gap-1.5 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs font-medium">Data Conflict</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs font-medium">Data Clean</span>
              </div>
            )}
            <ConfidenceBadge level={vehicle.confidence} size="sm" />
          </div>
        </div>
      </div>
    </div>
  )
}
