"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { X, DollarSign, Truck, Tag, ChevronDown, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface InventoryBulkBarProps {
  selectedCount: number
  onClear: () => void
  onAction: (action: string) => void
}

export function InventoryBulkBar({ selectedCount, onClear, onAction }: InventoryBulkBarProps) {
  if (selectedCount === 0) return null

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
        "flex items-center gap-3 rounded-full border bg-card px-4 py-2 shadow-lg",
        "animate-in slide-in-from-bottom-4 fade-in duration-200",
      )}
    >
      <div className="flex items-center gap-2 pr-2 border-r">
        <Badge variant="secondary" className="rounded-full font-semibold">
          {selectedCount}
        </Badge>
        <span className="text-sm font-medium">selected</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClear}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => onAction("adjust-price")} className="gap-2">
          <DollarSign className="h-4 w-4" />
          Adjust Price
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Truck className="h-4 w-4" />
              Change Channel
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuItem onClick={() => onAction("channel-auction")}>Move to Auction</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction("channel-fixed")}>Move to Fixed Price</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction("channel-export")}>Move to Export</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="sm" onClick={() => onAction("evaluate-export")} className="gap-2">
          <Zap className="h-4 w-4" />
          Evaluate Export
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Tag className="h-4 w-4" />
              Tag
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuItem onClick={() => onAction("tag-priority")}>Mark as Priority</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction("tag-hold")}>Mark as Hold</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction("tag-review")}>Needs Review</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
