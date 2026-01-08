"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Globe } from "lucide-react"
import { countries, type Country } from "@/lib/mock-data"

interface CountrySelectorProps {
  selected: Country[]
  onChange: (countries: Country[]) => void
  className?: string
}

export function CountrySelector({ selected, onChange, className }: CountrySelectorProps) {
  const allCountries = Object.keys(countries) as Country[]
  const allSelected = selected.length === allCountries.length
  const noneSelected = selected.length === 0

  const toggleCountry = (country: Country) => {
    if (selected.includes(country)) {
      onChange(selected.filter((c) => c !== country))
    } else {
      onChange([...selected, country])
    }
  }

  const selectAll = () => onChange(allCountries)
  const clearAll = () => onChange([])

  const displayText = allSelected
    ? "All Markets"
    : noneSelected
      ? "Select Markets"
      : selected.length === 1
        ? countries[selected[0]].name
        : `${selected.length} Markets`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn("gap-2", className)}>
          <Globe className="h-4 w-4" />
          {displayText}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <div className="flex items-center justify-between px-2 py-1.5">
          <button className="text-xs text-primary hover:underline" onClick={selectAll}>
            Select All
          </button>
          <button className="text-xs text-muted-foreground hover:underline" onClick={clearAll}>
            Clear
          </button>
        </div>
        <DropdownMenuSeparator />
        {allCountries.map((country) => (
          <DropdownMenuCheckboxItem
            key={country}
            checked={selected.includes(country)}
            onCheckedChange={() => toggleCountry(country)}
          >
            <span className="mr-2">{countries[country].flag}</span>
            {countries[country].name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
