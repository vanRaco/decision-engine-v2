"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ConfidenceBadge } from "@/components/ui/confidence-badge"
import { Check, Clock, Truck, Percent } from "lucide-react"
import type { ChannelComparison } from "@/lib/mock-data"

interface ChannelComparisonChartProps {
  channels: ChannelComparison[]
  selectedChannel?: string
  onSelectChannel: (channel: string) => void
}

export function ChannelComparisonChart({ channels, selectedChannel, onSelectChannel }: ChannelComparisonChartProps) {
  // Find max for scaling
  const maxProceeds = Math.max(...channels.map((c) => c.netProceeds))
  const recommended = channels.find((c) => c.isRecommended)

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Recommended</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Net Proceeds</span>
          </div>
        </div>
        {recommended && (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
            Best: {recommended.channelLabel} (+€
            {(recommended.netProceeds - Math.min(...channels.map((c) => c.netProceeds))).toLocaleString()})
          </Badge>
        )}
      </div>

      {/* Channel bars */}
      <div className="space-y-3">
        {channels.map((channel) => {
          const widthPercent = (channel.netProceeds / maxProceeds) * 100
          const isSelected = selectedChannel === channel.channel

          return (
            <div
              key={channel.channel}
              className={cn(
                "rounded-lg border p-4 cursor-pointer transition-all",
                isSelected
                  ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                  : channel.isRecommended
                    ? "border-emerald-200 bg-emerald-50/50 hover:border-emerald-300"
                    : "hover:border-muted-foreground/30",
              )}
              onClick={() => onSelectChannel(channel.channel)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{channel.channelLabel}</h4>
                  {channel.isRecommended && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">Recommended</Badge>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <ConfidenceBadge level="high" size="sm" showLabel={false} />
                  {isSelected && (
                    <div className="flex items-center gap-1 text-primary text-sm font-medium">
                      <Check className="h-4 w-4" />
                      Selected
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-8 bg-muted rounded-md overflow-hidden mb-3">
                <div
                  className={cn(
                    "h-full rounded-md transition-all flex items-center justify-end pr-3",
                    channel.isRecommended ? "bg-emerald-500" : "bg-blue-500",
                  )}
                  style={{ width: `${widthPercent}%` }}
                >
                  <span className="text-white font-semibold text-sm">€{channel.netProceeds.toLocaleString()}</span>
                </div>
              </div>

              {/* Details */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{channel.daysToSell}d to sell</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Percent className="h-4 w-4" />
                  <span>€{channel.fees.toLocaleString()} fees</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Truck className="h-4 w-4" />
                  <span>€{channel.transport.toLocaleString()} transport</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
