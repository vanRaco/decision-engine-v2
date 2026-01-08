"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, DollarSign, RefreshCw, Truck, Tag, FileOutput } from "lucide-react"

interface InventoryBulkActionsProps {
  selectedCount: number
  onAction: (action: string) => void
}

export function InventoryBulkActions({ selectedCount, onAction }: InventoryBulkActionsProps) {
  if (selectedCount === 0) return null

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-2">
      <span className="text-sm font-medium">
        {selectedCount} vehicle{selectedCount > 1 ? "s" : ""} selected
      </span>
      <div className="h-4 w-px bg-border" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1 bg-transparent">
            <DollarSign className="h-4 w-4" />
            Pricing
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onAction("price-drop-2")}>Apply -2% Price Adjustment</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAction("price-drop-5")}>Apply -5% Price Adjustment</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onAction("reprice")}>Re-run Pricing Model</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1 bg-transparent">
            <RefreshCw className="h-4 w-4" />
            Channel
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onAction("channel-auction")}>Move to Auction</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAction("channel-fixed")}>Move to Fixed Price</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAction("channel-export")}>Move to Export</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="outline" size="sm" className="gap-1 bg-transparent" onClick={() => onAction("export-evaluate")}>
        <Truck className="h-4 w-4" />
        Evaluate Export
      </Button>

      <Button variant="outline" size="sm" className="gap-1 bg-transparent" onClick={() => onAction("tag")}>
        <Tag className="h-4 w-4" />
        Add Tag
      </Button>

      <div className="flex-1" />

      <Button variant="ghost" size="sm" className="gap-1" onClick={() => onAction("export-csv")}>
        <FileOutput className="h-4 w-4" />
        Export CSV
      </Button>
    </div>
  )
}
