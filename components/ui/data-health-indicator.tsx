import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface DataHealthIndicatorProps {
  score: number // 0-100
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

const getHealthColor = (score: number): string => {
  if (score >= 90) return "bg-emerald-500"
  if (score >= 75) return "bg-emerald-400"
  if (score >= 60) return "bg-amber-400"
  return "bg-red-400"
}

const getHealthLabel = (score: number): string => {
  if (score >= 90) return "Excellent"
  if (score >= 75) return "Good"
  if (score >= 60) return "Fair"
  return "Poor"
}

const sizes = {
  sm: { bar: "h-1.5 w-12", text: "text-xs" },
  md: { bar: "h-2 w-16", text: "text-sm" },
  lg: { bar: "h-2.5 w-20", text: "text-sm" },
}

export function DataHealthIndicator({ score, showLabel = false, size = "md", className }: DataHealthIndicatorProps) {
  const sizeConfig = sizes[size]
  const healthLabel = getHealthLabel(score)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-2", className)}>
            <div className={cn("rounded-full bg-slate-200 overflow-hidden", sizeConfig.bar)}>
              <div
                className={cn("h-full rounded-full transition-all", getHealthColor(score))}
                style={{ width: `${score}%` }}
              />
            </div>
            {showLabel && <span className={cn("text-muted-foreground", sizeConfig.text)}>{score}%</span>}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">
            Data Health: <span className="font-medium">{healthLabel}</span> ({score}%)
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
