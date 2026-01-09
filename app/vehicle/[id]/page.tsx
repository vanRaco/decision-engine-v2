"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { GoldenRecordHeader } from "@/components/ui/golden-record-header"
import { RecommendationCard } from "@/components/ui/recommendation-card"
import { ReconScenarioCard } from "@/components/vehicle/recon-scenario-card"
import { ChannelComparisonChart } from "@/components/vehicle/channel-comparison"
import { ElasticityCurve } from "@/components/vehicle/elasticity-curve"
import { DamageMap } from "@/components/vehicle/damage-map"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Send, History, FileText, Camera, Wrench, TrendingUp, Globe } from "lucide-react"
import { generateVehicles, generateChannelComparison, type Vehicle } from "@/lib/mock-data"

// Mock damages for the vehicle
const mockDamages = [
  {
    id: "d1",
    location: "Front Bumper",
    type: "Scratch",
    severity: "minor" as const,
    cost: 150,
    position: { x: 25, y: 65 },
  },
  {
    id: "d2",
    location: "Rear Left Door",
    type: "Dent",
    severity: "moderate" as const,
    cost: 350,
    position: { x: 35, y: 50 },
  },
  { id: "d3", location: "Windscreen", type: "Chip", severity: "minor" as const, cost: 120, position: { x: 50, y: 35 } },
  {
    id: "d4",
    location: "Alloy Wheel (FL)",
    type: "Curb damage",
    severity: "minor" as const,
    cost: 180,
    position: { x: 25, y: 75 },
  },
]

// Mock recon scenarios
const generateReconScenarios = (vehicle: Vehicle) => {
  const basePrice = vehicle.marketValue * 0.92
  return [
    {
      id: "as-is",
      name: "Sell As-Is",
      description: "No repairs, list immediately at adjusted price",
      repairItems: [],
      totalCost: 0,
      timeDelay: 0,
      estimatedPrice: basePrice,
      netProfit: basePrice,
      roi: 0,
      confidence: "high" as const,
      isRecommended: false,
    },
    {
      id: "smart-repair",
      name: "Smart Repair Package",
      description: "Address high-ROI cosmetic issues only",
      repairItems: [
        { item: "Front bumper respray", cost: 150, timeAdd: 1 },
        { item: "PDR rear door", cost: 200, timeAdd: 1 },
      ],
      totalCost: 350,
      timeDelay: 2,
      estimatedPrice: basePrice + 650,
      netProfit: basePrice + 300,
      roi: 1.86,
      confidence: "high" as const,
      isRecommended: true,
    },
    {
      id: "full-prep",
      name: "Full Preparation",
      description: "Complete cosmetic restoration for premium channels",
      repairItems: [
        { item: "Front bumper respray", cost: 150, timeAdd: 1 },
        { item: "PDR rear door", cost: 200, timeAdd: 1 },
        { item: "Windscreen replacement", cost: 280, timeAdd: 1 },
        { item: "Alloy wheel refurb", cost: 180, timeAdd: 1 },
      ],
      totalCost: 810,
      timeDelay: 4,
      estimatedPrice: basePrice + 950,
      netProfit: basePrice + 140,
      roi: 1.17,
      confidence: "medium" as const,
      isRecommended: false,
    },
  ]
}

export default function VehicleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const vehicleId = params.id as string

  // Get vehicle from mock data
  const vehicles = useMemo(() => generateVehicles(500), [])
  const vehicle = useMemo(() => vehicles.find((v) => v.id === vehicleId) || vehicles[0], [vehicles, vehicleId])

  const [selectedTab, setSelectedTab] = useState("strategy")
  const [selectedReconScenario, setSelectedReconScenario] = useState<string>("smart-repair")
  const [selectedChannel, setSelectedChannel] = useState<string>("export")
  const [selectedDamage, setSelectedDamage] = useState<string | undefined>()
  const [selectedPrice, setSelectedPrice] = useState(() => vehicle.recommendedPrice)
  const playbookName = selectedChannel === "export" ? "Export Routing Playbook" : "Standard Pricing Playbook v2.3"

  const reconScenarios = useMemo(() => generateReconScenarios(vehicle), [vehicle])
  const channelComparisons = useMemo(() => generateChannelComparison(vehicle), [vehicle])

  const handlePushToMarketplace = () => {
    // Would trigger API call to marketplace
    console.log("Pushing to marketplace:", {
      vehicleId: vehicle.id,
      scenario: selectedReconScenario,
      channel: selectedChannel,
      price: selectedPrice,
    })
    router.push("/actions")
  }

  return (
    <AppLayout title="Vehicle Detail" subtitle={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}>
      {/* Added pb-24 to ensure content isn't hidden behind fixed action bar */}
      <div className="pb-24">
        {/* Back button */}
        <Button variant="ghost" size="sm" className="mb-4 gap-1" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Golden Record Header */}
        <GoldenRecordHeader vehicle={vehicle} className="mb-6 -mx-6 px-6" />

        {/* Main content tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="strategy" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Pricing & Strategy
            </TabsTrigger>
            <TabsTrigger value="recon" className="gap-2">
              <Wrench className="h-4 w-4" />
              Recon Decision
            </TabsTrigger>
            <TabsTrigger value="channel" className="gap-2">
              <Globe className="h-4 w-4" />
              Channel Selection
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="docs" className="gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="photos" className="gap-2">
              <Camera className="h-4 w-4" />
              Photos
            </TabsTrigger>
          </TabsList>

          {/* Strategy Tab */}
          <TabsContent value="strategy" className="space-y-6">
            {/* Main recommendation */}
            <RecommendationCard
              headline={`List at €${Math.round(selectedPrice).toLocaleString()} via ${channelComparisons.find((c) => c.channel === selectedChannel)?.channelLabel || "Export"}`}
              description={`Based on market analysis, this vehicle has strong demand in ${selectedChannel === "export" ? "Netherlands" : "domestic"} markets. Recommended smart repair for +€300 net uplift.`}
              playbook={playbookName}
              impacts={[
                {
                  label: "Net Proceeds",
                  value: `€${Math.round(selectedPrice * 0.96).toLocaleString()}`,
                  type: "positive",
                },
                { label: "Days to Sell", value: "~12 days", type: "neutral" },
                { label: "RPI Impact", value: "+2.3%", type: "positive" },
              ]}
              confidence="high"
              reasoning={[
                "Similar vehicles sold 8% higher in NL vs domestic in last 30 days",
                "Low supply of this spec in target market",
                "Buyer interest signals are strong (12 watchlists)",
                "Smart repair ROI of 186% justified by condition data",
              ]}
              onApprove={handlePushToMarketplace}
              onReject={(reason, notes) => console.log("Rejected:", reason, notes)}
              onCustomize={() => setSelectedTab("channel")}
            />

            {/* Elasticity curve */}
            <ElasticityCurve
              marketValue={vehicle.marketValue}
              recommendedPrice={vehicle.recommendedPrice}
              reservePrice={vehicle.reservePrice}
              confidence={vehicle.confidence}
              selectedPrice={selectedPrice}
              onPriceChange={setSelectedPrice}
            />

            {/* Quick stats */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">Market Value</div>
                  <div className="text-2xl font-bold">€{vehicle.marketValue.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">Recommended Price</div>
                  <div className="text-2xl font-bold text-emerald-600">
                    €{Math.round(vehicle.recommendedPrice).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">Reserve Floor</div>
                  <div className="text-2xl font-bold text-amber-600">
                    €{Math.round(vehicle.reservePrice).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">Scorecard</div>
                  <div className="text-2xl font-bold">{vehicle.scorecard}/100</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recon Tab */}
          <TabsContent value="recon" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Damage map */}
              <DamageMap damages={mockDamages} selectedDamageId={selectedDamage} onSelectDamage={setSelectedDamage} />

              {/* Scenario selection */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Repair Scenarios</CardTitle>
                  <CardDescription>Compare as-is vs repair options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {reconScenarios.map((scenario) => (
                    <ReconScenarioCard
                      key={scenario.id}
                      scenario={scenario}
                      basePrice={vehicle.marketValue * 0.92}
                      selected={selectedReconScenario === scenario.id}
                      onSelect={() => setSelectedReconScenario(scenario.id)}
                    />
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Channel Tab */}
          <TabsContent value="channel" className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Channel Comparison</CardTitle>
                <CardDescription>Net proceeds after fees, transport, and taxes by channel</CardDescription>
              </CardHeader>
              <CardContent>
                <ChannelComparisonChart
                  channels={channelComparisons}
                  selectedChannel={selectedChannel}
                  onSelectChannel={setSelectedChannel}
                />
              </CardContent>
            </Card>

            {/* Export details if selected */}
            {selectedChannel === "export" && (
              <Card className="border-emerald-200 bg-emerald-50/30">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">Export to Netherlands</CardTitle>
                    <Badge className="bg-emerald-100 text-emerald-700">
                      +€
                      {(
                        (channelComparisons.find((c) => c.channel === "export")?.netProceeds || 0) -
                        (channelComparisons.find((c) => c.channel === "auction")?.netProceeds || 0)
                      ).toLocaleString()}{" "}
                      vs domestic
                    </Badge>
                  </div>
                  <CardDescription>Cross-border arbitrage opportunity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Transport Cost</div>
                      <div className="font-semibold">€450</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">BPM Tax</div>
                      <div className="font-semibold">€0 (EV exempt)</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Est. Transit Time</div>
                      <div className="font-semibold">3-4 days</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {[
                    { date: "Nov 25, 2025", event: "Inspection completed", details: "Grade B - 4 damages identified" },
                    { date: "Nov 24, 2025", event: "Vehicle received", details: "Arrived at Netherlands Lot 3" },
                    { date: "Nov 22, 2025", event: "Defleet triggered", details: "End of lease - 36 months" },
                    { date: "Nov 20, 2025", event: "Pre-defleet valuation", details: "Initial estimate €23,400" },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="text-sm text-muted-foreground w-32 shrink-0">{item.date}</div>
                      <div>
                        <div className="font-medium text-sm">{item.event}</div>
                        <div className="text-sm text-muted-foreground">{item.details}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="docs">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: "Condition Report", type: "PDF", date: "Nov 25" },
                    { name: "Service History", type: "PDF", date: "Nov 24" },
                    { name: "Registration Document", type: "PDF", date: "Nov 22" },
                    { name: "Lease Agreement", type: "PDF", date: "Aug 2022" },
                  ].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-sm">{doc.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {doc.type} - {doc.date}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <Camera className="h-8 w-8 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Sticky action bar */}
      <div className="fixed bottom-0 left-64 right-0 border-t bg-background p-4 z-10">
        <div className="flex items-center justify-between max-w-screen-xl mx-auto">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Selected Strategy</div>
              <div className="font-medium">
                {reconScenarios.find((s) => s.id === selectedReconScenario)?.name} →{" "}
                {channelComparisons.find((c) => c.channel === selectedChannel)?.channelLabel}
              </div>
            </div>
            <Separator orientation="vertical" className="h-8" />
            <div>
              <div className="text-sm text-muted-foreground">Target Price</div>
              <div className="text-2xl font-medium">€{Math.round(selectedPrice).toLocaleString()}</div>
            </div>
          </div>
          <Button onClick={handlePushToMarketplace} className="gap-2">
            <Send className="h-4 w-4" />
            Push to Marketplace
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
