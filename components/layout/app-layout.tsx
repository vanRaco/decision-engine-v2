"use client"

import type React from "react"

import { useState } from "react"
import { AppSidebar } from "./app-sidebar"
import { AppHeader } from "./app-header"
import type { Country } from "@/lib/mock-data"

interface AppLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const [selectedCountries, setSelectedCountries] = useState<Country[]>(["NL", "DE", "FR", "BE"])

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="pl-64">
        <AppHeader
          title={title}
          subtitle={subtitle}
          selectedCountries={selectedCountries}
          onCountriesChange={setSelectedCountries}
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
