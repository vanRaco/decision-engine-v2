"use client"

import { useState, useMemo } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ValuationQueue } from "@/components/pricing/valuation-queue"
import { BulkPricingView } from "@/components/pricing/bulk-pricing-view"
import { MarketIntelligence } from "@/components/pricing/market-intelligence"
import {
  generateVehicles,
  generateDefleetValuations,
  generatePricingCohorts,
  generateMarketComparisons,
} from "@/lib/mock-data"

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState("valuations")

  // Generate mock data
  const vehicles = useMemo(() => generateVehicles(200), [])
  const valuations = useMemo(() => generateDefleetValuations(vehicles), [vehicles])
  const cohorts = useMemo(() => generatePricingCohorts(), [])
  const marketComparisons = useMemo(() => generateMarketComparisons(), [])

  return (
    <AppLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Pricing Analyst Workbench</h1>
          <p className="text-muted-foreground">Valuations, bulk pricing, and market intelligence</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="valuations">Defleet Valuations</TabsTrigger>
            <TabsTrigger value="bulk-pricing">Bulk Pricing</TabsTrigger>
            <TabsTrigger value="market-intel">Market Intelligence</TabsTrigger>
          </TabsList>

          <TabsContent value="valuations">
            <ValuationQueue valuations={valuations} />
          </TabsContent>

          <TabsContent value="bulk-pricing">
            <BulkPricingView cohorts={cohorts} />
          </TabsContent>

          <TabsContent value="market-intel">
            <MarketIntelligence comparisons={marketComparisons} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
