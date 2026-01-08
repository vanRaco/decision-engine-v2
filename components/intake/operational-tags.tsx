"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plus, X } from "lucide-react"
import { operationalTags } from "@/lib/mock-data"

interface OperationalTagsProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  compact?: boolean
}

const tagColorClasses: Record<string, string> = {
  amber: "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200",
  emerald: "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200",
  cyan: "bg-cyan-100 text-cyan-700 border-cyan-200 hover:bg-cyan-200",
  orange: "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200",
}

export function OperationalTags({ selectedTags, onTagsChange, compact = false }: OperationalTagsProps) {
  const [open, setOpen] = useState(false)

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter((t) => t !== tagId))
    } else {
      onTagsChange([...selectedTags, tagId])
    }
  }

  const removeTag = (tagId: string) => {
    onTagsChange(selectedTags.filter((t) => t !== tagId))
  }

  const selectedTagObjects = operationalTags.filter((t) => selectedTags.includes(t.id))
  const availableTags = operationalTags.filter((t) => !selectedTags.includes(t.id))

  if (compact && selectedTags.length === 0) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground">
            <Plus className="h-3 w-3 mr-1" />
            Tag
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2" align="start">
          <div className="space-y-1">
            {operationalTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => {
                  toggleTag(tag.id)
                  setOpen(false)
                }}
                className={`w-full text-left px-2 py-1.5 rounded text-xs ${tagColorClasses[tag.color]}`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {selectedTagObjects.map((tag) => (
        <Badge key={tag.id} variant="outline" className={`gap-1 pr-1 ${tagColorClasses[tag.color]}`}>
          {tag.label}
          <button onClick={() => removeTag(tag.id)} className="ml-1 hover:bg-black/10 rounded-full p-0.5">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {availableTags.length > 0 && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground">
              <Plus className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="start">
            <div className="space-y-1">
              {availableTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => {
                    toggleTag(tag.id)
                    setOpen(false)
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded text-xs ${tagColorClasses[tag.color]}`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
