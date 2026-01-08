"use client"

import { useState } from "react"
import { CountrySelector } from "@/components/ui/country-selector"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Bell, Search, RefreshCw, Calendar } from "lucide-react"
import type { Country } from "@/lib/mock-data"

interface AppHeaderProps {
  title: string
  subtitle?: string
  selectedCountries: Country[]
  onCountriesChange: (countries: Country[]) => void
}

export function AppHeader({ title, subtitle, selectedCountries, onCountriesChange }: AppHeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-semibold">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search VIN, model..." className="w-64 pl-9 h-9" />
          </div>

          {/* Country selector */}
          <CountrySelector selected={selectedCountries} onChange={onCountriesChange} />

          {/* Date context */}
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Calendar className="h-4 w-4" />
            Nov 2025
          </Button>

          {/* Refresh */}
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleRefresh}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="h-9 w-9 relative">
            <Bell className="h-4 w-4" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              3
            </Badge>
          </Button>
        </div>
      </div>
    </header>
  )
}
