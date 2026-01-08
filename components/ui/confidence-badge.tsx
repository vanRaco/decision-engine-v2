import { cn } from "@/lib/utils"
import { ShieldCheck, AlertTriangle, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export type ConfidenceLevel = "high" | "medium" | "low"

interface ConfidenceBadgeProps {
  level: ConfidenceLevel
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

const config: Record<
  ConfidenceLevel,
  {
    icon: typeof ShieldCheck
    label: string
    description: string
    className: string
  }
> = {
  high: {
    icon: ShieldCheck,
    label: "High",
    description: "Safe to auto-execute. Model confidence >85%",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  medium: {
    icon: AlertTriangle,
    label: "Medium",
    description: "Human review recommended. Model confidence 60-85%",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  low: {
    icon: HelpCircle,
    label: "Low",
    description: "Data insufficient or high uncertainty. Human decision required.",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
}

const sizes = {
  sm: "h-5 px-1.5 text-xs gap-1",
  md: "h-6 px-2 text-xs gap-1.5",
  lg: "h-7 px-2.5 text-sm gap-2",
}

const iconSizes = {
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
  lg: "h-4 w-4",
}

export function ConfidenceBadge({ level, showLabel = true, size = "md", className }: ConfidenceBadgeProps) {
  const { icon: Icon, label, description, className: levelClassName } = config[level]

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "inline-flex items-center rounded border font-medium",
              sizes[size],
              levelClassName,
              className,
            )}
          >
            <Icon className={iconSizes[size]} />
            {showLabel && <span>{label}</span>}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-sm">{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
