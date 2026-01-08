// Mock data for the Remarketing Decision Engine
// Scale: European markets with realistic volumes

export type Country = "ES" | "PT" | "FR" | "DE" | "IT" | "AT" | "BE" | "NL"

export const countries: Record<Country, { name: string; flag: string }> = {
  ES: { name: "Spain", flag: "🇪🇸" },
  PT: { name: "Portugal", flag: "🇵🇹" },
  FR: { name: "France", flag: "🇫🇷" },
  DE: { name: "Germany", flag: "🇩🇪" },
  IT: { name: "Italy", flag: "🇮🇹" },
  AT: { name: "Austria", flag: "🇦🇹" },
  BE: { name: "Belgium", flag: "🇧🇪" },
  NL: { name: "Netherlands", flag: "🇳🇱" },
}

export const operationalTags = [
  { id: "priority", label: "Priority", color: "amber" },
  { id: "export-candidate", label: "Export Candidate", color: "emerald" },
  { id: "needs-review", label: "Needs Review", color: "blue" },
  { id: "high-value", label: "High Value", color: "purple" },
  { id: "fast-mover", label: "Fast Mover", color: "cyan" },
  { id: "watch-list", label: "Watch List", color: "orange" },
] as const

export type OperationalTag = (typeof operationalTags)[number]["id"]

export type ConfidenceLevel = "high" | "medium" | "low"
export type VehicleStatus = "pipeline" | "intake" | "recon" | "ready" | "listed" | "offer" | "sold"
export type Channel = "dealer-rofr" | "fixed-price" | "auction" | "export" | "make-offer"
export type ActionType =
  | "price-drop"
  | "channel-switch"
  | "accept-offer"
  | "rofr-expiring"
  | "data-conflict"
  | "aging-risk"
  | "export-opportunity"
  | "market-shift"

export type FleetSource = "lease-return" | "rental" | "demo" | "buyback" | "corporate"
export type Powertrain = "ice-petrol" | "ice-diesel" | "hybrid-hev" | "hybrid-phev" | "bev"

export interface Vehicle {
  id: string
  vin: string
  make: string
  model: string
  variant: string
  year: number
  mileage: number
  color: string
  fuelType: "petrol" | "diesel" | "hybrid" | "electric"
  powertrain: Powertrain
  transmission: "manual" | "automatic"
  conditionGrade: "A" | "B" | "C" | "D"
  country: Country
  location: string
  daysInStock: number
  status: VehicleStatus
  marketValue: number
  recommendedPrice: number
  reservePrice: number
  dataHealth: number // 0-100
  scorecard: number // 0-100 desirability
  demandSignal: "hot" | "warm" | "cool" | "cold"
  liquidityBand: "fast" | "normal" | "slow"
  hasDataConflict: boolean
  conflictFields?: string[]
  currentChannel?: Channel
  recommendedChannel?: Channel
  exportUplift?: number
  reconCost?: number
  reconRoi?: number
  confidence: ConfidenceLevel
  predictedDaysToSell: number
  fleetSource: FleetSource
  contractEndDate?: Date
  contractualRV?: number
  batteryHealth?: number // For EVs/PHEVs
  riskFlags: string[]
  decisionHistory: DecisionEvent[]
  marketTrend: "rising" | "stable" | "falling"
  pricePosition: number // % vs market avg (-10 = 10% below, +5 = 5% above)
  viewsLast7Days?: number
  watchlistCount?: number
  offerCount?: number
  estimatedValue?: number // Added for defleet valuation
}

export interface DecisionEvent {
  id: string
  timestamp: Date
  type: "intake" | "valuation" | "recon" | "listing" | "price-change" | "channel-change" | "offer" | "sale"
  actor: string
  description: string
  deRecommendation?: string
  actualDecision: string
  wasOverride: boolean
  overrideReason?: string
  outcome?: {
    rpiImpact?: number
    daysImpact?: number
    netUplift?: number
  }
}

export interface Action {
  id: string
  vehicleId: string
  type: ActionType
  priority: "critical" | "high" | "medium" | "low"
  title: string
  description: string
  impact: {
    rpiChange?: number
    daysChange?: number
    netUplift?: number
  }
  confidence: ConfidenceLevel
  expiresAt?: Date
  createdAt: Date
  reasoning: ReasoningDetail
  marketContext: MarketContext
  similarDecisions: SimilarDecision[]
  alternativeActions: AlternativeAction[]
}

export interface ReasoningDetail {
  summary: string
  factors: ReasoningFactor[]
  dataPoints: DataPoint[]
  playbook?: string
  confidenceBreakdown: {
    dataQuality: number
    marketStability: number
    modelAccuracy: number
    historicalSuccess: number
  }
}

export interface ReasoningFactor {
  name: string
  impact: "positive" | "negative" | "neutral"
  weight: number
  description: string
}

export interface DataPoint {
  label: string
  value: string
  source: string
  timestamp?: Date
}

export interface MarketContext {
  similarVehiclesCount: number
  avgDaysOnMarket: number
  avgPrice: number
  priceRange: { min: number; max: number }
  demandTrend: "increasing" | "stable" | "decreasing"
  recentSales: { price: number; daysToSell: number; channel: Channel }[]
  competitorPricing?: { low: number; mid: number; high: number }
}

export interface SimilarDecision {
  vehicleDescription: string
  decision: string
  wasDeRecommendation: boolean
  outcome: {
    soldPrice: number
    daysToSell: number
    rpi: number
  }
  date: Date
}

export interface AlternativeAction {
  action: string
  expectedImpact: { rpi?: number; days?: number; netValue?: number }
  confidence: ConfidenceLevel
  whyNotRecommended: string
}

export interface Recommendation {
  id: string
  vehicleId: string
  type: "price" | "channel" | "recon" | "export"
  headline: string
  description: string
  impact: {
    label: string
    value: string
  }[]
  confidence: ConfidenceLevel
  reasoning: string[]
}

export interface PacingData {
  day: number
  target: number
  actual: number | null
  forecast: number | null
}

export interface ChannelComparison {
  channel: Channel
  channelLabel: string
  netProceeds: number
  daysToSell: number
  fees: number
  transport: number
  isRecommended: boolean
  confidence: ConfidenceLevel
  reasoning: string
}

export interface PipelineVehicle {
  id: string
  vin: string
  make: string
  model: string
  variant: string
  year: number
  estimatedMileage: number
  fuelType: "petrol" | "diesel" | "hybrid" | "electric"
  powertrain: Powertrain
  country: Country
  fleetSource: FleetSource
  contractEndDate: Date
  daysUntilDefleet: number
  contractualRV: number
  estimatedMarketValue: number
  rvGap: number // contractualRV - estimatedMarketValue
  riskScore: number // 0-100, higher = more risk
  predictedDesirability: number // 0-100
  recommendedChannel: Channel
  exportPotential: boolean
  flags: string[]
}

export interface SimulationScenario {
  id: string
  name: string
  description: string
  type: "price" | "channel" | "market-shock" | "pacing"
  parameters: Record<string, number | string>
  projectedOutcome: {
    volumeChange: number
    rpiChange: number
    daysChange: number
    revenueImpact: number
  }
  confidence: ConfidenceLevel
  affectedVehicles: number
}

// Renamed to avoid conflict with ModelPerformance further down
export interface ModelPerformanceMetrics {
  metric: string
  predicted: number
  actual: number
  error: number
  trend: "improving" | "stable" | "declining"
}

export interface OverrideStats {
  totalDecisions: number
  overrideRate: number
  overrideOutcomeVsDE: { better: number; same: number; worse: number }
  topOverrideReasons: Array<{ reason: string; count: number; avgOutcome: number }>
}

export interface OverrideAnalysis {
  // This interface is now deprecated due to the change in generateOverrideAnalysis
  // It's kept for backward compatibility if needed, but the new generateOverrideAnalysis
  // should be used going forward.
  totalDecisions: number
  overrideRate: number
  overrideOutcomeVsDE: {
    better: number
    same: number
    worse: number
  }
  topOverrideReasons: { reason: string; count: number; avgOutcome: number }[]
}

export interface OverridePattern {
  reasonCode: string
  reason: string
  count: number
  recommendation: "reduce-automation" | "increase-automation" | "keep-manual" | "investigate"
  avgRpiImpact: number
  avgDaysImpact: number
  successRate: number
  affectedVehicles: number
  segments: string[] // Vehicle segments affected by this override pattern
}

// Define CounterfactualMetrics interface
export interface CounterfactualMetrics {
  actualRpi: number
  projectedRpiIfFollowed: number
  actualDaysToSell: number
  projectedDaysIfFollowed: number
  vehiclesAffected: number
  marginLeakage: number
}

export const generateCounterfactualMetrics = (): CounterfactualMetrics => {
  return {
    actualRpi: 94.5,
    projectedRpiIfFollowed: 96.8,
    actualDaysToSell: 42,
    projectedDaysIfFollowed: 35,
    vehiclesAffected: 847,
    marginLeakage: 425000,
  }
}

// Generate mock vehicles with diverse data
export const generateVehicles = (count: number, country?: Country): Vehicle[] => {
  const makes = ["BMW", "Mercedes", "Audi", "Volkswagen", "Peugeot", "Renault", "Ford", "Opel", "Tesla", "Volvo"]
  const models: Record<string, { name: string; powertrains: Powertrain[] }[]> = {
    BMW: [
      { name: "3 Series", powertrains: ["ice-petrol", "ice-diesel", "hybrid-phev"] },
      { name: "5 Series", powertrains: ["ice-petrol", "ice-diesel", "hybrid-phev"] },
      { name: "X3", powertrains: ["ice-petrol", "ice-diesel", "hybrid-phev"] },
      { name: "X5", powertrains: ["ice-petrol", "hybrid-phev"] },
      { name: "i4", powertrains: ["bev"] },
      { name: "iX3", powertrains: ["bev"] },
    ],
    Mercedes: [
      { name: "C-Class", powertrains: ["ice-petrol", "ice-diesel", "hybrid-phev"] },
      { name: "E-Class", powertrains: ["ice-petrol", "ice-diesel", "hybrid-phev"] },
      { name: "GLC", powertrains: ["ice-petrol", "ice-diesel", "hybrid-phev"] },
      { name: "EQC", powertrains: ["bev"] },
      { name: "EQA", powertrains: ["bev"] },
    ],
    Audi: [
      { name: "A4", powertrains: ["ice-petrol", "ice-diesel"] },
      { name: "A6", powertrains: ["ice-petrol", "ice-diesel", "hybrid-phev"] },
      { name: "Q5", powertrains: ["ice-petrol", "ice-diesel", "hybrid-phev"] },
      { name: "e-tron", powertrains: ["bev"] },
      { name: "Q4 e-tron", powertrains: ["bev"] },
    ],
    Volkswagen: [
      { name: "Golf", powertrains: ["ice-petrol", "ice-diesel", "hybrid-hev"] },
      { name: "Passat", powertrains: ["ice-petrol", "ice-diesel", "hybrid-phev"] },
      { name: "Tiguan", powertrains: ["ice-petrol", "ice-diesel", "hybrid-phev"] },
      { name: "ID.4", powertrains: ["bev"] },
      { name: "ID.3", powertrains: ["bev"] },
    ],
    Peugeot: [
      { name: "308", powertrains: ["ice-petrol", "ice-diesel", "hybrid-phev"] },
      { name: "508", powertrains: ["ice-petrol", "ice-diesel", "hybrid-phev"] },
      { name: "3008", powertrains: ["ice-petrol", "ice-diesel", "hybrid-phev"] },
      { name: "e-208", powertrains: ["bev"] },
      { name: "e-2008", powertrains: ["bev"] },
    ],
    Renault: [
      { name: "Megane", powertrains: ["ice-petrol", "ice-diesel"] },
      { name: "Kadjar", powertrains: ["ice-petrol", "ice-diesel"] },
      { name: "Captur", powertrains: ["ice-petrol", "hybrid-hev", "hybrid-phev"] },
      { name: "Zoe", powertrains: ["bev"] },
      { name: "Megane E-Tech", powertrains: ["bev"] },
    ],
    Ford: [
      { name: "Focus", powertrains: ["ice-petrol", "ice-diesel", "hybrid-hev"] },
      { name: "Mondeo", powertrains: ["ice-petrol", "ice-diesel", "hybrid-hev"] },
      { name: "Kuga", powertrains: ["ice-petrol", "ice-diesel", "hybrid-phev"] },
      { name: "Mustang Mach-E", powertrains: ["bev"] },
      { name: "Puma", powertrains: ["ice-petrol", "hybrid-hev"] },
    ],
    Opel: [
      { name: "Astra", powertrains: ["ice-petrol", "ice-diesel", "hybrid-phev"] },
      { name: "Insignia", powertrains: ["ice-petrol", "ice-diesel"] },
      { name: "Grandland", powertrains: ["ice-petrol", "ice-diesel", "hybrid-phev"] },
      { name: "Mokka-e", powertrains: ["bev"] },
      { name: "Corsa-e", powertrains: ["bev"] },
    ],
    Tesla: [
      { name: "Model 3", powertrains: ["bev"] },
      { name: "Model Y", powertrains: ["bev"] },
      { name: "Model S", powertrains: ["bev"] },
    ],
    Volvo: [
      { name: "XC40", powertrains: ["ice-petrol", "hybrid-phev", "bev"] },
      { name: "XC60", powertrains: ["ice-petrol", "ice-diesel", "hybrid-phev"] },
      { name: "XC90", powertrains: ["ice-petrol", "hybrid-phev"] },
      { name: "C40", powertrains: ["bev"] },
    ],
  }

  const fleetSources: FleetSource[] = ["lease-return", "rental", "demo", "buyback", "corporate"]
  const countryKeys = Object.keys(countries) as Country[]
  const statuses: VehicleStatus[] = ["intake", "recon", "ready", "listed", "offer"]
  const grades: Vehicle["conditionGrade"][] = ["A", "B", "C", "D"]
  const confidenceLevels: ConfidenceLevel[] = ["high", "medium", "low"]
  const channels: Channel[] = ["dealer-rofr", "fixed-price", "auction", "export", "make-offer"]
  const demandSignals: Vehicle["demandSignal"][] = ["hot", "warm", "cool", "cold"]
  const liquidityBands: Vehicle["liquidityBand"][] = ["fast", "normal", "slow"]
  const marketTrends: Vehicle["marketTrend"][] = ["rising", "stable", "falling"]

  const riskFlagOptions = [
    "High mileage",
    "EV battery degradation",
    "Market volatility",
    "Odd specification",
    "Missing service history",
    "Previous accident",
    "Recall pending",
    "End of model lifecycle",
    "Regulatory risk (diesel)",
    "Price collapse risk",
  ]

  return Array.from({ length: count }, (_, i) => {
    const make = makes[Math.floor(Math.random() * makes.length)]
    const modelList = models[make]
    const modelData = modelList[Math.floor(Math.random() * modelList.length)]
    const powertrain = modelData.powertrains[Math.floor(Math.random() * modelData.powertrains.length)]
    const vehicleCountry = country || countryKeys[Math.floor(Math.random() * countryKeys.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const daysInStock = Math.floor(Math.random() * 120)
    const marketValue = 15000 + Math.floor(Math.random() * 45000)
    const hasDataConflict = Math.random() < 0.15
    const fleetSource = fleetSources[Math.floor(Math.random() * fleetSources.length)]
    const isEV = powertrain === "bev" || powertrain === "hybrid-phev"

    // Determine fuel type from powertrain
    const fuelType: Vehicle["fuelType"] =
      powertrain === "bev"
        ? "electric"
        : powertrain === "hybrid-hev" || powertrain === "hybrid-phev"
          ? "hybrid"
          : powertrain === "ice-diesel"
            ? "diesel"
            : "petrol"

    // Generate risk flags based on vehicle characteristics
    const riskFlags: string[] = []
    if (isEV && Math.random() < 0.3) riskFlags.push("EV battery degradation")
    if (fuelType === "diesel" && Math.random() < 0.4) riskFlags.push("Regulatory risk (diesel)")
    if (Math.random() < 0.1) riskFlags.push(riskFlagOptions[Math.floor(Math.random() * riskFlagOptions.length)])
    if (daysInStock > 90) riskFlags.push("Aging stock")

    // Generate decision history
    const decisionHistory: DecisionEvent[] = []
    const historyCount = Math.floor(Math.random() * 5)
    for (let j = 0; j < historyCount; j++) {
      const wasOverride = Math.random() < 0.25
      decisionHistory.push({
        id: `DEC-${i}-${j}`,
        timestamp: new Date(Date.now() - (historyCount - j) * 24 * 60 * 60 * 1000 * Math.random() * 30),
        type: ["intake", "valuation", "recon", "listing", "price-change"][
          Math.floor(Math.random() * 5)
        ] as DecisionEvent["type"],
        actor: ["System", "Jan de Vries", "Marie Dupont", "Hans Mueller"][Math.floor(Math.random() * 4)],
        description: "Decision made based on market analysis",
        deRecommendation: "Follow standard playbook",
        actualDecision: wasOverride ? "Manual override applied" : "Followed DE recommendation",
        wasOverride,
        overrideReason: wasOverride ? "Local market knowledge" : undefined,
        outcome:
          Math.random() > 0.5
            ? {
                rpiImpact: (Math.random() - 0.5) * 4,
                daysImpact: Math.floor((Math.random() - 0.5) * 10),
                netUplift: Math.floor((Math.random() - 0.3) * 2000),
              }
            : undefined,
      })
    }

    const demandSignal = demandSignals[Math.floor(Math.random() * demandSignals.length)]
    const scorecard =
      demandSignal === "hot"
        ? 70 + Math.floor(Math.random() * 30)
        : demandSignal === "warm"
          ? 50 + Math.floor(Math.random() * 25)
          : demandSignal === "cool"
            ? 30 + Math.floor(Math.random() * 25)
            : 10 + Math.floor(Math.random() * 25)

    return {
      id: `VEH-${String(i + 1).padStart(5, "0")}`,
      vin: `WBA${String(Math.floor(Math.random() * 10000000000)).padStart(14, "0")}`,
      make,
      model: modelData.name,
      variant: ["Base", "Sport", "Luxury", "M Sport", "AMG Line", "S Line", "R-Line"][Math.floor(Math.random() * 7)],
      year: 2020 + Math.floor(Math.random() * 4),
      mileage: 20000 + Math.floor(Math.random() * 80000),
      color: ["Black", "White", "Silver", "Blue", "Grey", "Red"][Math.floor(Math.random() * 6)],
      fuelType,
      powertrain,
      transmission: Math.random() > 0.3 ? "automatic" : "manual",
      conditionGrade: grades[Math.floor(Math.random() * grades.length)],
      country: vehicleCountry,
      location: `${countries[vehicleCountry].name} - Lot ${Math.floor(Math.random() * 10) + 1}`,
      daysInStock,
      status,
      marketValue,
      recommendedPrice: marketValue * (0.92 + Math.random() * 0.08),
      reservePrice: marketValue * (0.88 + Math.random() * 0.06),
      dataHealth: hasDataConflict ? 60 + Math.floor(Math.random() * 25) : 85 + Math.floor(Math.random() * 15),
      scorecard,
      demandSignal,
      liquidityBand: liquidityBands[Math.floor(Math.random() * liquidityBands.length)],
      hasDataConflict,
      conflictFields: hasDataConflict
        ? ["mileage", "trim", "registration date"][Math.floor(Math.random() * 3)].split(",")
        : undefined,
      currentChannel:
        status === "listed" || status === "offer" ? channels[Math.floor(Math.random() * channels.length)] : undefined,
      recommendedChannel: channels[Math.floor(Math.random() * channels.length)],
      exportUplift: Math.random() > 0.4 ? 500 + Math.floor(Math.random() * 2500) : undefined,
      reconCost: Math.random() > 0.5 ? 200 + Math.floor(Math.random() * 1200) : undefined,
      reconRoi: Math.random() > 0.5 ? 1.2 + Math.random() * 1.8 : undefined,
      confidence: confidenceLevels[Math.floor(Math.random() * confidenceLevels.length)],
      predictedDaysToSell: 5 + Math.floor(Math.random() * 30),
      fleetSource,
      contractEndDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
      contractualRV: marketValue * (0.85 + Math.random() * 0.2),
      batteryHealth: isEV ? 80 + Math.floor(Math.random() * 20) : undefined,
      riskFlags,
      decisionHistory,
      marketTrend: marketTrends[Math.floor(Math.random() * marketTrends.length)],
      pricePosition: Math.floor((Math.random() - 0.5) * 20),
      viewsLast7Days: status === "listed" ? Math.floor(Math.random() * 500) : undefined,
      watchlistCount: status === "listed" ? Math.floor(Math.random() * 50) : undefined,
      offerCount: status === "offer" ? 1 + Math.floor(Math.random() * 5) : undefined,
    }
  })
}

export const generatePipelineVehicles = (count: number): PipelineVehicle[] => {
  const makes = ["BMW", "Mercedes", "Audi", "Volkswagen", "Peugeot", "Renault", "Ford", "Volvo", "Tesla"]
  const models: Record<string, { name: string; powertrain: Powertrain }[]> = {
    BMW: [
      { name: "3 Series", powertrain: "hybrid-phev" },
      { name: "iX3", powertrain: "bev" },
    ],
    Mercedes: [
      { name: "C-Class", powertrain: "hybrid-phev" },
      { name: "EQA", powertrain: "bev" },
    ],
    Audi: [
      { name: "Q5", powertrain: "hybrid-phev" },
      { name: "e-tron", powertrain: "bev" },
    ],
    Volkswagen: [
      { name: "Passat", powertrain: "hybrid-phev" },
      { name: "ID.4", powertrain: "bev" },
    ],
    Peugeot: [
      { name: "3008", powertrain: "hybrid-phev" },
      { name: "e-2008", powertrain: "bev" },
    ],
    Renault: [
      { name: "Captur", powertrain: "hybrid-phev" },
      { name: "Megane E-Tech", powertrain: "bev" },
    ],
    Ford: [
      { name: "Kuga", powertrain: "hybrid-phev" },
      { name: "Mustang Mach-E", powertrain: "bev" },
    ],
    Volvo: [
      { name: "XC60", powertrain: "hybrid-phev" },
      { name: "C40", powertrain: "bev" },
    ],
    Tesla: [
      { name: "Model 3", powertrain: "bev" },
      { name: "Model Y", powertrain: "bev" },
    ],
  }
  const fleetSources: FleetSource[] = ["lease-return", "rental", "corporate"]
  const countryKeys = Object.keys(countries) as Country[]
  const channels: Channel[] = ["dealer-rofr", "fixed-price", "auction", "export"]

  return Array.from({ length: count }, (_, i) => {
    const make = makes[Math.floor(Math.random() * makes.length)]
    const modelList = models[make]
    const modelData = modelList[Math.floor(Math.random() * modelList.length)]
    const daysUntilDefleet = 5 + Math.floor(Math.random() * 85)
    const estimatedMarketValue = 18000 + Math.floor(Math.random() * 40000)
    const contractualRV = estimatedMarketValue * (0.9 + Math.random() * 0.25)
    const rvGap = contractualRV - estimatedMarketValue

    const flags: string[] = []
    if (rvGap > 3000) flags.push("RV exposure risk")
    if (modelData.powertrain === "bev" && Math.random() < 0.4) flags.push("EV market volatility")
    if (modelData.powertrain === "hybrid-phev" && Math.random() < 0.3) flags.push("PHEV demand softening")
    if (daysUntilDefleet < 14) flags.push("Imminent arrival")

    return {
      id: `PIPE-${String(i + 1).padStart(5, "0")}`,
      vin: `WBA${String(Math.floor(Math.random() * 10000000000)).padStart(14, "0")}`,
      make,
      model: modelData.name,
      variant: ["Base", "Sport", "Luxury"][Math.floor(Math.random() * 3)],
      year: 2021 + Math.floor(Math.random() * 3),
      estimatedMileage: 25000 + Math.floor(Math.random() * 60000),
      fuelType: modelData.powertrain === "bev" ? "electric" : "hybrid",
      powertrain: modelData.powertrain,
      country: countryKeys[Math.floor(Math.random() * countryKeys.length)],
      fleetSource: fleetSources[Math.floor(Math.random() * fleetSources.length)],
      contractEndDate: new Date(Date.now() + daysUntilDefleet * 24 * 60 * 60 * 1000),
      daysUntilDefleet,
      contractualRV,
      estimatedMarketValue,
      rvGap,
      riskScore: Math.min(100, Math.max(0, 30 + Math.floor(Math.random() * 50) + (rvGap > 2000 ? 20 : 0))),
      predictedDesirability: 30 + Math.floor(Math.random() * 60),
      recommendedChannel: channels[Math.floor(Math.random() * channels.length)],
      exportPotential: Math.random() > 0.6,
      flags,
    }
  })
}

export const generateActions = (vehicles: Vehicle[]): Action[] => {
  const actions: Action[] = []
  const actionTypes: ActionType[] = [
    "price-drop",
    "channel-switch",
    "accept-offer",
    "rofr-expiring",
    "data-conflict",
    "aging-risk",
    "export-opportunity",
    "market-shift",
  ]

  const reasoningTemplates: Record<ActionType, () => ReasoningDetail> = {
    "price-drop": () => ({
      summary: "Price reduction recommended to align with market movement and accelerate sale",
      factors: [
        {
          name: "Market Position",
          impact: "negative",
          weight: 0.35,
          description: "Currently priced 8% above market average for similar vehicles",
        },
        {
          name: "Days in Stock",
          impact: "negative",
          weight: 0.25,
          description: "Vehicle approaching 60-day threshold with decreasing interest",
        },
        {
          name: "Competitor Pricing",
          impact: "negative",
          weight: 0.2,
          description: "3 similar vehicles listed 5-10% lower in same market",
        },
        {
          name: "Demand Trend",
          impact: "neutral",
          weight: 0.2,
          description: "Segment demand stable but not increasing",
        },
      ],
      dataPoints: [
        { label: "Current Price", value: "€28,500", source: "Listing" },
        { label: "Market Average", value: "€26,400", source: "Market Intelligence" },
        { label: "Similar Sales (30d)", value: "12 vehicles", source: "Historical Data" },
        { label: "Avg Sale Price", value: "€25,800", source: "Historical Data" },
      ],
      playbook: "Standard Pricing Playbook v2.3",
      confidenceBreakdown: { dataQuality: 0.92, marketStability: 0.78, modelAccuracy: 0.85, historicalSuccess: 0.81 },
    }),
    "channel-switch": () => ({
      summary: "Channel change recommended based on performance data and market opportunity",
      factors: [
        {
          name: "Current Channel Performance",
          impact: "negative",
          weight: 0.4,
          description: "Low engagement in current channel after 14 days",
        },
        {
          name: "Alternative Channel Demand",
          impact: "positive",
          weight: 0.3,
          description: "Export market shows strong demand for this specification",
        },
        {
          name: "Net Proceeds Analysis",
          impact: "positive",
          weight: 0.2,
          description: "Expected net uplift of €1,200 despite higher transport costs",
        },
        {
          name: "Time Value",
          impact: "neutral",
          weight: 0.1,
          description: "Faster sale expected, reducing holding costs",
        },
      ],
      dataPoints: [
        { label: "Current Views", value: "23", source: "Marketplace" },
        { label: "Export Demand Score", value: "High", source: "Cross-border Analytics" },
        { label: "Expected Uplift", value: "+€1,200", source: "Pricing Model" },
        { label: "Transport Cost", value: "€380", source: "Logistics" },
      ],
      playbook: "Export Routing Playbook",
      confidenceBreakdown: { dataQuality: 0.88, marketStability: 0.72, modelAccuracy: 0.79, historicalSuccess: 0.84 },
    }),
    "accept-offer": () => ({
      summary: "Offer recommended for acceptance based on market analysis and buyer profile",
      factors: [
        {
          name: "Offer vs Market",
          impact: "positive",
          weight: 0.35,
          description: "Offer represents 97% of current market value",
        },
        {
          name: "Buyer Quality",
          impact: "positive",
          weight: 0.25,
          description: "Buyer has 94% completion rate and premium rating",
        },
        {
          name: "Time in Market",
          impact: "neutral",
          weight: 0.2,
          description: "Vehicle listed for 18 days, within normal range",
        },
        {
          name: "Counter Potential",
          impact: "neutral",
          weight: 0.2,
          description: "Limited upside from counter-offer based on buyer behavior",
        },
      ],
      dataPoints: [
        { label: "Offer Amount", value: "€31,200", source: "Buyer" },
        { label: "Ask Price", value: "€32,500", source: "Listing" },
        { label: "Market Value", value: "€32,100", source: "Valuation" },
        { label: "Buyer Score", value: "94/100", source: "Buyer Analytics" },
      ],
      playbook: "Offer Evaluation Playbook",
      confidenceBreakdown: { dataQuality: 0.95, marketStability: 0.82, modelAccuracy: 0.88, historicalSuccess: 0.86 },
    }),
    "rofr-expiring": () => ({
      summary: "ROFR window closing - decision required to maintain sales momentum",
      factors: [
        {
          name: "ROFR Timeline",
          impact: "negative",
          weight: 0.5,
          description: "Window expires in 4 hours, no dealer response yet",
        },
        {
          name: "Alternative Channels",
          impact: "positive",
          weight: 0.3,
          description: "Strong auction demand available as fallback",
        },
        {
          name: "Price Position",
          impact: "neutral",
          weight: 0.2,
          description: "Vehicle competitively priced for quick remarketing",
        },
      ],
      dataPoints: [
        { label: "ROFR Expires", value: "4 hours", source: "Dealer Network" },
        { label: "Dealer Views", value: "3", source: "ROFR Portal" },
        { label: "Next Auction", value: "Tomorrow 10:00", source: "Auction Calendar" },
      ],
      playbook: "ROFR Escalation Playbook",
      confidenceBreakdown: { dataQuality: 0.98, marketStability: 0.85, modelAccuracy: 0.91, historicalSuccess: 0.79 },
    }),
    "data-conflict": () => ({
      summary: "Data inconsistency detected requiring resolution before listing",
      factors: [
        {
          name: "Data Quality Impact",
          impact: "negative",
          weight: 0.6,
          description: "Mileage discrepancy of 12,000km between sources",
        },
        {
          name: "Valuation Impact",
          impact: "negative",
          weight: 0.3,
          description: "Potential €2,100 valuation difference",
        },
        {
          name: "Compliance Risk",
          impact: "negative",
          weight: 0.1,
          description: "Listing with incorrect data creates legal exposure",
        },
      ],
      dataPoints: [
        { label: "DMS Mileage", value: "45,230 km", source: "DMS" },
        { label: "Inspection Mileage", value: "57,450 km", source: "Inspection Report" },
        { label: "Telematics", value: "56,890 km", source: "Fleet Telematics" },
      ],
      playbook: "Data Quality Playbook",
      confidenceBreakdown: { dataQuality: 0.45, marketStability: 0.9, modelAccuracy: 0.7, historicalSuccess: 0.82 },
    }),
    "aging-risk": () => ({
      summary: "Vehicle approaching aging threshold - intervention recommended",
      factors: [
        {
          name: "Age vs Target",
          impact: "negative",
          weight: 0.4,
          description: "At 75 days, approaching 90-day critical threshold",
        },
        {
          name: "Depreciation Rate",
          impact: "negative",
          weight: 0.3,
          description: "Losing approximately €45/day in market value",
        },
        {
          name: "Channel Fit",
          impact: "neutral",
          weight: 0.2,
          description: "Current channel may not be optimal for quick sale",
        },
        {
          name: "Month-end Impact",
          impact: "negative",
          weight: 0.1,
          description: "Risks adding to month-end compression",
        },
      ],
      dataPoints: [
        { label: "Days in Stock", value: "75 days", source: "Inventory" },
        { label: "Daily Depreciation", value: "€45", source: "Market Model" },
        { label: "Value Loss to Date", value: "€3,375", source: "Calculated" },
      ],
      playbook: "Aging Stock Playbook",
      confidenceBreakdown: { dataQuality: 0.9, marketStability: 0.75, modelAccuracy: 0.83, historicalSuccess: 0.77 },
    }),
    "export-opportunity": () => ({
      summary: "Cross-border opportunity identified with significant uplift potential",
      factors: [
        {
          name: "Market Arbitrage",
          impact: "positive",
          weight: 0.4,
          description: "Netherlands market trading 12% higher for this specification",
        },
        {
          name: "Transport Feasibility",
          impact: "positive",
          weight: 0.25,
          description: "Direct route available, 2-day transit",
        },
        {
          name: "Demand Signals",
          impact: "positive",
          weight: 0.25,
          description: "5 active buyers searching for similar vehicles",
        },
        { name: "Net Benefit", impact: "positive", weight: 0.1, description: "€1,850 net uplift after all costs" },
      ],
      dataPoints: [
        { label: "Local Value", value: "€24,500", source: "Local Market" },
        { label: "Export Value", value: "€27,400", source: "NL Market" },
        { label: "Total Costs", value: "€1,050", source: "Logistics + Fees" },
        { label: "Net Uplift", value: "+€1,850", source: "Calculated" },
      ],
      playbook: "Cross-border Routing Playbook",
      confidenceBreakdown: { dataQuality: 0.87, marketStability: 0.68, modelAccuracy: 0.81, historicalSuccess: 0.79 },
    }),
    "market-shift": () => ({
      summary: "Market conditions changed - pricing strategy adjustment needed",
      factors: [
        {
          name: "Segment Price Movement",
          impact: "negative",
          weight: 0.45,
          description: "PHEV segment dropped 6% in past 2 weeks",
        },
        {
          name: "Inventory Exposure",
          impact: "negative",
          weight: 0.3,
          description: "23 similar vehicles in stock affected",
        },
        {
          name: "Competitor Response",
          impact: "negative",
          weight: 0.15,
          description: "Major competitors already adjusted pricing",
        },
        { name: "Demand Outlook", impact: "neutral", weight: 0.1, description: "Stabilization expected in 3-4 weeks" },
      ],
      dataPoints: [
        { label: "Segment Change", value: "-6.2%", source: "Market Intelligence" },
        { label: "Affected Stock", value: "23 vehicles", source: "Inventory" },
        { label: "Exposure", value: "€412,000", source: "Risk Model" },
      ],
      playbook: "Market Volatility Response Playbook",
      confidenceBreakdown: { dataQuality: 0.91, marketStability: 0.52, modelAccuracy: 0.76, historicalSuccess: 0.71 },
    }),
  }

  vehicles.forEach((vehicle) => {
    if (Math.random() > 0.7) return

    const type = actionTypes[Math.floor(Math.random() * actionTypes.length)]
    const priorities: Action["priority"][] = ["critical", "high", "medium", "low"]
    const priority = priorities[Math.floor(Math.random() * priorities.length)]

    const titles: Record<ActionType, string> = {
      "price-drop": `Reduce price by ${Math.floor(Math.random() * 5) + 2}%`,
      "channel-switch": `Switch to ${["Export", "Auction", "Fixed Price"][Math.floor(Math.random() * 3)]}`,
      "accept-offer": `Review offer at €${(vehicle.marketValue * (0.92 + Math.random() * 0.06)).toFixed(0)}`,
      "rofr-expiring": `ROFR expires in ${Math.floor(Math.random() * 12) + 1}h`,
      "data-conflict": `Resolve ${vehicle.conflictFields?.[0] || "mileage"} conflict`,
      "aging-risk": `${vehicle.daysInStock}d aging - action needed`,
      "export-opportunity": `Export opportunity: +€${Math.floor(Math.random() * 2000) + 500}`,
      "market-shift": `Market shift: adjust pricing strategy`,
    }

    const marketContext: MarketContext = {
      similarVehiclesCount: 15 + Math.floor(Math.random() * 50),
      avgDaysOnMarket: 12 + Math.floor(Math.random() * 20),
      avgPrice: vehicle.marketValue * (0.95 + Math.random() * 0.1),
      priceRange: {
        min: vehicle.marketValue * 0.85,
        max: vehicle.marketValue * 1.15,
      },
      demandTrend: ["increasing", "stable", "decreasing"][
        Math.floor(Math.random() * 3)
      ] as MarketContext["demandTrend"],
      recentSales: Array.from({ length: 5 }, () => ({
        price: vehicle.marketValue * (0.9 + Math.random() * 0.15),
        daysToSell: 5 + Math.floor(Math.random() * 25),
        channel: ["dealer-rofr", "auction", "fixed-price"][Math.floor(Math.random() * 3)] as Channel,
      })),
      competitorPricing: {
        low: vehicle.marketValue * 0.88,
        mid: vehicle.marketValue * 0.96,
        high: vehicle.marketValue * 1.08,
      },
    }

    const similarDecisions: SimilarDecision[] = Array.from({ length: 3 }, (_, j) => ({
      vehicleDescription: `${2020 + Math.floor(Math.random() * 3)} ${vehicle.make} ${vehicle.model}`,
      decision:
        type === "price-drop"
          ? "Price reduced 4%"
          : type === "channel-switch"
            ? "Moved to export"
            : "Followed recommendation",
      wasDeRecommendation: Math.random() > 0.3,
      outcome: {
        soldPrice: vehicle.marketValue * (0.9 + Math.random() * 0.12),
        daysToSell: 5 + Math.floor(Math.random() * 20),
        rpi: 92 + Math.random() * 8,
      },
      date: new Date(Date.now() - (j + 1) * 7 * 24 * 60 * 60 * 1000),
    }))

    const alternativeActions: AlternativeAction[] = [
      {
        action: "Wait 7 more days",
        expectedImpact: { rpi: -1.2, days: 7, netValue: -350 },
        confidence: "medium",
        whyNotRecommended: "Market trend suggests further depreciation; delay increases risk",
      },
      {
        action: "Aggressive price cut (8%)",
        expectedImpact: { rpi: -3.5, days: -5, netValue: -1200 },
        confidence: "high",
        whyNotRecommended: "Unnecessary margin sacrifice; moderate action achieves similar result",
      },
    ]

    actions.push({
      id: `ACT-${String(actions.length + 1).padStart(5, "0")}`,
      vehicleId: vehicle.id,
      type,
      priority,
      title: titles[type],
      description: `DE recommends action for ${vehicle.year} ${vehicle.make} ${vehicle.model} based on current market conditions and vehicle performance.`,
      impact: {
        netUplift:
          type === "export-opportunity" ? 500 + Math.floor(Math.random() * 2000) : Math.floor(Math.random() * 1500),
        daysChange: type === "aging-risk" ? -(3 + Math.floor(Math.random() * 7)) : Math.floor(Math.random() * 10) - 5,
        rpiChange: (Math.random() - 0.3) * 4,
      },
      confidence: ["high", "medium", "low"][Math.floor(Math.random() * 3)] as ConfidenceLevel,
      expiresAt:
        type === "rofr-expiring" || type === "accept-offer"
          ? new Date(Date.now() + Math.floor(Math.random() * 24) * 60 * 60 * 1000)
          : undefined,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 48) * 60 * 60 * 1000),
      reasoning: reasoningTemplates[type](),
      marketContext,
      similarDecisions,
      alternativeActions,
    })
  })

  return actions.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
}

export const generateSimulationScenarios = (): SimulationScenario[] => [
  {
    id: "SIM-001",
    name: "PHEV Price Correction",
    description: "Simulate impact of 5% price reduction across all PHEVs to match market decline",
    type: "price",
    parameters: { segment: "PHEV", adjustment: -5, scope: "all" },
    projectedOutcome: { volumeChange: 15, rpiChange: -2.1, daysChange: -8, revenueImpact: -45000 },
    confidence: "high",
    affectedVehicles: 47,
  },
  {
    id: "SIM-002",
    name: "Export Push to Netherlands",
    description: "Route 30 high-demand vehicles to NL market for better pricing",
    type: "channel",
    parameters: { targetMarket: "NL", vehicleCount: 30, minUplift: 1000 },
    projectedOutcome: { volumeChange: 30, rpiChange: 1.8, daysChange: 4, revenueImpact: 42000 },
    confidence: "medium",
    affectedVehicles: 30,
  },
  {
    id: "SIM-003",
    name: "EV Market Shock (-10%)",
    description: "Stress test: What if EV segment drops 10% in next 2 weeks?",
    type: "market-shock",
    parameters: { segment: "BEV", priceChange: -10, duration: 14 },
    projectedOutcome: { volumeChange: -25, rpiChange: -4.5, daysChange: 12, revenueImpact: -180000 },
    confidence: "low",
    affectedVehicles: 89,
  },
  {
    id: "SIM-004",
    name: "Aggressive Month-End Push",
    description: "Apply 3% discount to 60+ day stock to hit volume target",
    type: "pacing",
    parameters: { ageThreshold: 60, discount: 3, targetVolume: 150 },
    projectedOutcome: { volumeChange: 45, rpiChange: -1.5, daysChange: -15, revenueImpact: -28000 },
    confidence: "high",
    affectedVehicles: 62,
  },
]

export const generateModelPerformanceMetrics = (): ModelPerformanceMetrics[] => [
  // Renamed to avoid conflict with ModelPerformance further down
  { metric: "Price Accuracy (MAE)", predicted: 850, actual: 920, error: 8.2, trend: "improving" },
  { metric: "Days-to-Sell Accuracy", predicted: 14.2, actual: 15.8, error: 11.3, trend: "stable" },
  { metric: "Channel Recommendation", predicted: 78, actual: 74, error: 5.1, trend: "improving" },
  { metric: "Export Uplift Prediction", predicted: 1450, actual: 1320, error: 9.8, trend: "declining" },
  { metric: "Offer Accept Rate", predicted: 65, actual: 68, error: 4.6, trend: "stable" },
]

export const generateOverrideAnalysis = (): OverridePattern[] => {
  return [
    {
      reasonCode: "MARKET_CHANGE",
      reason: "Market conditions changed since prediction",
      count: 127,
      recommendation: "reduce-automation",
      avgRpiImpact: -2.3,
      avgDaysImpact: 5,
      successRate: 0.42,
      affectedVehicles: 127,
      segments: ["Premium Sedan", "Luxury SUV"],
    },
    {
      reasonCode: "VEHICLE_CONDITION",
      reason: "Physical condition better/worse than data suggested",
      count: 89,
      recommendation: "keep-manual",
      avgRpiImpact: 1.8,
      avgDaysImpact: -3,
      successRate: 0.73,
      affectedVehicles: 89,
      segments: ["Mid-Size SUV", "Compact"],
    },
    {
      reasonCode: "DEMAND_SPIKE",
      reason: "Unexpected demand surge for specific model",
      count: 76,
      recommendation: "increase-automation",
      avgRpiImpact: 3.2,
      avgDaysImpact: -7,
      successRate: 0.88,
      affectedVehicles: 76,
      segments: ["EV", "Hybrid"],
    },
    {
      reasonCode: "PRICING_ERROR",
      reason: "Model prediction appeared unrealistic",
      count: 54,
      recommendation: "investigate",
      avgRpiImpact: -1.5,
      avgDaysImpact: 8,
      successRate: 0.35,
      affectedVehicles: 54,
      segments: ["Luxury Sedan", "Sports Car"],
    },
    {
      reasonCode: "COMPETITIVE_PRESSURE",
      reason: "Similar vehicles priced more aggressively by competitors",
      count: 43,
      recommendation: "reduce-automation",
      avgRpiImpact: -0.9,
      avgDaysImpact: 4,
      successRate: 0.51,
      affectedVehicles: 43,
      segments: ["Compact", "Mid-Size Sedan"],
    },
  ]
}

// Pacing data for the month
export const generatePacingData = (targetVolume: number): PacingData[] => {
  const today = 26 // Current day of month (from forecast)
  const daysInMonth = 30
  const dailyTarget = targetVolume / daysInMonth
  let cumulativeTarget = 0
  let cumulativeActual = 0

  // Generate actual performance with some variance
  const dailyActuals: number[] = []
  for (let i = 0; i < today; i++) {
    // Start slow, ramp up mid-month, then slow down
    const progressFactor = i < 10 ? 0.75 : i < 20 ? 1.1 : 0.85
    const variance = 0.9 + Math.random() * 0.2
    dailyActuals.push(dailyTarget * progressFactor * variance)
  }

  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    cumulativeTarget += dailyTarget

    // Actual sales (days 1 to today)
    if (day <= today) {
      cumulativeActual += dailyActuals[i]
      return {
        day,
        target: Math.round(cumulativeTarget),
        actual: Math.round(cumulativeActual),
        forecast: null, // No forecast for past days
      }
    } else {
      // Forecast future days - project based on current run rate
      const remainingDays = day - today
      const currentRunRate = cumulativeActual / today
      const projectedTotal = cumulativeActual + remainingDays * currentRunRate * 0.95

      return {
        day,
        target: Math.round(cumulativeTarget),
        actual: null, // No actual for future days
        forecast: Math.round(projectedTotal),
      }
    }
  })
}

// Channel comparison for a vehicle
export const generateChannelComparison = (vehicle: Vehicle): ChannelComparison[] => {
  const basePrice = vehicle.marketValue
  return [
    {
      channel: "dealer-rofr",
      channelLabel: "Dealer ROFR",
      netProceeds: basePrice * 0.94,
      daysToSell: 3,
      fees: basePrice * 0.02,
      transport: 150,
      isRecommended: false,
      confidence: "high",
      reasoning: "Quick sale but lower net proceeds due to dealer margin expectations",
    },
    {
      channel: "fixed-price",
      channelLabel: "Fixed Price",
      netProceeds: basePrice * 0.96,
      daysToSell: 12,
      fees: basePrice * 0.025,
      transport: 200,
      isRecommended: false,
      confidence: "medium",
      reasoning: "Good balance of price and time, suitable for mainstream vehicles",
    },
    {
      channel: "auction",
      channelLabel: "Domestic Auction",
      netProceeds: basePrice * 0.93,
      daysToSell: 7,
      fees: basePrice * 0.035,
      transport: 180,
      isRecommended: false,
      confidence: "high",
      reasoning: "Fast liquidation but competitive bidding may reduce final price",
    },
    {
      channel: "export",
      channelLabel: "Export (Netherlands)",
      netProceeds: basePrice * 1.02,
      daysToSell: 14,
      fees: basePrice * 0.04,
      transport: 450,
      isRecommended: true,
      confidence: "medium",
      reasoning: "Strong demand in NL market offsets higher logistics costs",
    },
    {
      channel: "make-offer",
      channelLabel: "Make an Offer",
      netProceeds: basePrice * 0.95,
      daysToSell: 10,
      fees: basePrice * 0.03,
      transport: 200,
      isRecommended: false,
      confidence: "low",
      reasoning: "Unpredictable timing; works best for unique specifications",
    },
  ]
}

// Portfolio summary stats
export interface PortfolioStats {
  totalVehicles: number
  totalValue: number
  avgDaysInStock: number
  rpiActual: number
  rpiTarget: number
  agingOver60: number
  agingOver90: number
  pendingActions: number
  dataConflicts: number
  exportOpportunities: number
  monthActual: number
  monthTarget: number
  monthForecast: number
  compressionIndex: number
}

export const calculatePortfolioStats = (vehicles: Vehicle[]): PortfolioStats => {
  const totalVehicles = vehicles.length
  const totalValue = vehicles.reduce((sum, v) => sum + v.marketValue, 0)
  const avgDaysInStock = vehicles.reduce((sum, v) => sum + v.daysInStock, 0) / totalVehicles
  const agingOver60 = vehicles.filter((v) => v.daysInStock > 60).length
  const agingOver90 = vehicles.filter((v) => v.daysInStock > 90).length
  const dataConflicts = vehicles.filter((v) => v.hasDataConflict).length
  const exportOpportunities = vehicles.filter((v) => v.exportUplift && v.exportUplift > 500).length

  const monthTarget = Math.floor(totalVehicles * 1.2)
  const monthActual = Math.floor(monthTarget * (0.4 + Math.random() * 0.3))
  const monthForecast = Math.floor(monthTarget * (0.85 + Math.random() * 0.2))
  const compressionIndex = 25 + Math.floor(Math.random() * 50)

  return {
    totalVehicles,
    totalValue,
    avgDaysInStock,
    rpiActual: 94.5 + Math.random() * 3,
    rpiTarget: 95,
    agingOver60,
    agingOver90,
    pendingActions: Math.floor(totalVehicles * 0.08),
    dataConflicts,
    exportOpportunities,
    monthActual,
    monthTarget,
    monthForecast,
    compressionIndex,
  }
}

// Override reasons for reject modal
export const overrideReasons = [
  { code: "LOCAL_MARKET", label: "Local market knowledge" },
  { code: "DEALER_RELATIONSHIP", label: "Dealer relationship / commitment" },
  { code: "STRATEGIC_HOLD", label: "Strategic hold for specific buyer" },
  { code: "BRAND_PROTECTION", label: "Brand protection concern" },
  { code: "DATA_QUALITY", label: "Data quality concern" },
  { code: "TIMING", label: "Timing not right" },
  { code: "OTHER", label: "Other (please specify)" },
]

// Generate offer detail for accept-offer actions
export const generateOfferDetail = (vehicle: Vehicle) => {
  const askPrice = vehicle.recommendedPrice
  const offerPercent = 0.92 + Math.random() * 0.08
  const amount = Math.floor(askPrice * offerPercent)
  return {
    amount,
    percentOfAsk: Math.floor(offerPercent * 100),
    percentile: Math.floor(Math.random() * 30) + 5,
    buyerRating: 70 + Math.floor(Math.random() * 30),
    buyerCompletionRate: 85 + Math.floor(Math.random() * 15),
    expiresIn: `${Math.floor(Math.random() * 24) + 1}h`,
    counterSuggestion: Math.random() > 0.5 ? Math.floor(amount * 1.03) : undefined,
    isRecommendedAccept: offerPercent > 0.96,
  }
}

export interface ArbitrageOpportunity {
  id: string
  sourceCountry: string
  targetCountry: string
  segment: string
  vehicleCount: number
  avgUpliftPerUnit: number
  totalUplift: number
  confidence: number
  route: string
  transitDays: number
  demandSignal: "strong" | "moderate" | "weak"
  status: "captured" | "missed" | "pending"
}

export const generateArbitrageData = (): ArbitrageOpportunity[] => {
  return [
    {
      id: "arb-1",
      sourceCountry: "ES",
      targetCountry: "NL",
      segment: "Premium SUVs",
      vehicleCount: 23,
      avgUpliftPerUnit: 1850,
      totalUplift: 42550,
      confidence: 0.82,
      route: "Madrid → Rotterdam",
      transitDays: 3,
      demandSignal: "strong",
      status: "pending",
    },
    {
      id: "arb-2",
      sourceCountry: "IT",
      targetCountry: "DE",
      segment: "Executive Sedans",
      vehicleCount: 18,
      avgUpliftPerUnit: 1420,
      totalUplift: 25560,
      confidence: 0.76,
      route: "Milan → Munich",
      transitDays: 2,
      demandSignal: "strong",
      status: "captured",
    },
    {
      id: "arb-3",
      sourceCountry: "FR",
      targetCountry: "BE",
      segment: "Compact Hatchbacks",
      vehicleCount: 12,
      avgUpliftPerUnit: 980,
      totalUplift: 11760,
      confidence: 0.71,
      route: "Paris → Brussels",
      transitDays: 1,
      demandSignal: "moderate",
      status: "pending",
    },
    {
      id: "arb-4",
      sourceCountry: "PT",
      targetCountry: "ES",
      segment: "Family MPVs",
      vehicleCount: 8,
      avgUpliftPerUnit: 720,
      totalUplift: 5760,
      confidence: 0.68,
      route: "Lisbon → Madrid",
      transitDays: 1,
      demandSignal: "moderate",
      status: "missed",
    },
    {
      id: "arb-5",
      sourceCountry: "AT",
      targetCountry: "IT",
      segment: "Luxury Coupes",
      vehicleCount: 6,
      avgUpliftPerUnit: 2340,
      totalUplift: 14040,
      confidence: 0.79,
      route: "Vienna → Milan",
      transitDays: 2,
      demandSignal: "strong",
      status: "captured",
    },
    {
      id: "arb-6",
      sourceCountry: "BE",
      targetCountry: "FR",
      segment: "Electric Vehicles",
      vehicleCount: 15,
      avgUpliftPerUnit: 1650,
      totalUplift: 24750,
      confidence: 0.74,
      route: "Brussels → Paris",
      transitDays: 1,
      demandSignal: "strong",
      status: "pending",
    },
  ]
}

// Define Counterfactual interface
export interface Counterfactual {
  id: string
  metric: "RPI" | "Days to Sell" | "Export Revenue" | "Month-End Compression" | "Override Loss"
  actual: number
  projected: number
  delta: number
  deltaPercent: number
  confidence: number
  description: string
  category: "pricing" | "channel" | "timing" | "compliance"
}

export const generateCounterfactuals = (): Counterfactual[] => {
  return [
    {
      id: "cf-1",
      metric: "RPI",
      actual: 94.5,
      projected: 96.2,
      delta: 1.7,
      deltaPercent: 1.8,
      confidence: 0.82,
      description: "If all DE pricing recommendations had been followed",
      category: "pricing",
    },
    {
      id: "cf-2",
      metric: "Days to Sell",
      actual: 42,
      projected: 36,
      delta: -6,
      deltaPercent: -14.3,
      confidence: 0.78,
      description: "If channel recommendations had been accepted",
      category: "channel",
    },
    {
      id: "cf-3",
      metric: "Export Revenue",
      actual: 285000,
      projected: 342000,
      delta: 57000,
      deltaPercent: 20,
      confidence: 0.71,
      description: "If cross-border opportunities had been actioned",
      category: "channel",
    },
    {
      id: "cf-4",
      metric: "Month-End Compression",
      actual: 38,
      projected: 24,
      delta: -14,
      deltaPercent: -36.8,
      confidence: 0.75,
      description: "If pacing alerts had been addressed mid-month",
      category: "timing",
    },
    {
      id: "cf-5",
      metric: "Override Loss",
      actual: 127500,
      projected: 0,
      delta: -127500,
      deltaPercent: -100,
      confidence: 0.85,
      description: "Value lost from overrides that underperformed DE",
      category: "compliance",
    },
  ]
}

export interface NSCPerformance {
  country: Country
  nscName: string
  rpiActual: number
  rpiTarget: number
  daysToSellActual: number
  daysToSellTarget: number
  volumeActual: number
  volumeTarget: number
  playbookAdherence: number
  overrideRate: number
  arbitrageCaptured: number
  arbitrageMissed: number
  compressionIndex: number
  trend: "up" | "down" | "stable"
}

export const generateNSCPerformance = (): NSCPerformance[] => {
  const countryKeys = Object.keys(countries) as Country[]

  return countryKeys.map((country) => {
    const rpiTarget = 94.5
    const rpiActual = rpiTarget + (Math.random() - 0.4) * 6
    const daysTarget = 28
    const daysActual = daysTarget + Math.floor((Math.random() - 0.3) * 20)
    const volumeTarget = 800 + Math.floor(Math.random() * 600)
    const volumeActual = Math.floor(volumeTarget * (0.7 + Math.random() * 0.4))
    const adherence = 65 + Math.floor(Math.random() * 30)

    return {
      country,
      nscName: `NSC ${countries[country].name}`,
      rpiActual: Number(rpiActual.toFixed(1)),
      rpiTarget,
      daysToSellActual: Math.max(15, daysActual),
      daysToSellTarget: daysTarget,
      volumeActual,
      volumeTarget,
      playbookAdherence: adherence,
      overrideRate: 100 - adherence + Math.floor(Math.random() * 10),
      arbitrageCaptured: 15000 + Math.floor(Math.random() * 50000),
      arbitrageMissed: 5000 + Math.floor(Math.random() * 25000),
      compressionIndex: 25 + Math.floor(Math.random() * 50),
      trend: (["up", "down", "stable"] as const)[Math.floor(Math.random() * 3)],
    }
  })
}

// Segment performance data

export interface SegmentPerformance {
  segment: string
  fuelType: "electric" | "hybrid" | "petrol" | "diesel"
  volumeActual: number
  volumeTarget: number
  rpi: number
  daysToSell: number
  trend: "up" | "down" | "stable"
  riskLevel: "low" | "medium" | "high"
}

export const generateSegmentPerformance = (): SegmentPerformance[] => {
  return [
    {
      segment: "Compact SUV",
      fuelType: "electric",
      volumeActual: 145,
      volumeTarget: 180,
      rpi: 91.2,
      daysToSell: 48,
      trend: "down",
      riskLevel: "high",
    },
    {
      segment: "Executive",
      fuelType: "hybrid",
      volumeActual: 98,
      volumeTarget: 105,
      rpi: 93.8,
      daysToSell: 35,
      trend: "stable",
      riskLevel: "medium",
    },
    {
      segment: "Compact",
      fuelType: "petrol",
      volumeActual: 215,
      volumeTarget: 200,
      rpi: 96.1,
      daysToSell: 24,
      trend: "up",
      riskLevel: "low",
    },
    {
      segment: "Large SUV",
      fuelType: "hybrid",
      volumeActual: 87,
      volumeTarget: 110,
      rpi: 92.4,
      daysToSell: 42,
      trend: "down",
      riskLevel: "medium",
    },
    {
      segment: "Compact EV",
      fuelType: "electric",
      volumeActual: 92,
      volumeTarget: 140,
      rpi: 89.5,
      daysToSell: 52,
      trend: "down",
      riskLevel: "high",
    },
    {
      segment: "Mid-size",
      fuelType: "diesel",
      volumeActual: 78,
      volumeTarget: 85,
      rpi: 95.2,
      daysToSell: 28,
      trend: "stable",
      riskLevel: "medium",
    },
    {
      segment: "Premium SUV",
      fuelType: "electric",
      volumeActual: 54,
      volumeTarget: 95,
      rpi: 88.3,
      daysToSell: 58,
      trend: "down",
      riskLevel: "high",
    },
  ]
}

// PRICE-RELATED TYPES AND GENERATORS

export interface DefleetValuation {
  id: string
  vehicleId: string
  vehicle: Vehicle
  defleetDate: string
  bookValue: number
  externalValuations: {
    name: string
    value: number
    confidence: number
    status: "success" | "failed"
    errorMessage?: string
  }[]
  deRecommendedValue: number
  deRecommendedReserve: number
  deConfidence: "high" | "medium" | "low"
  confidenceScore: number
  valuationSpread: number
  confidenceFactors: {
    factor: string
    impact: "positive" | "neutral" | "negative"
    weight: number
  }[]
  status: "pending-review" | "auto-approved" | "approved" | "adjusted"
  assignedTo: string
  notes: string[]
  marketDataPoints: number
  similarSalesCount: number
  daysSinceDefleet: number
}

export const generateDefleetValuations = (vehicles: Vehicle[]): DefleetValuation[] => {
  const analysts = ["Maria Santos", "Thomas Weber", "Anne Dupont", "Lars Eriksen"]
  const providers = ["DAT", "Eurotax", "CAP HPI", "Autovista"]

  return vehicles.slice(0, 50).map((vehicle, i) => {
    // Estimate vehicle.estimatedValue if it doesn't exist
    const estimatedValue = vehicle.estimatedValue ?? vehicle.marketValue * (0.9 + Math.random() * 0.2)

    const bookValue = estimatedValue * (0.95 + Math.random() * 0.1)

    // Generate external valuations with some potentially failing
    const externalValuations = providers.map((provider, idx) => {
      const failed = Math.random() < 0.15 // 15% chance of failure
      if (failed) {
        return {
          name: provider,
          value: 0,
          confidence: 0,
          status: "failed" as const,
          errorMessage: "API timeout - retry available",
        }
      }

      return {
        name: provider,
        value: Math.round(estimatedValue * (0.9 + Math.random() * 0.2)),
        confidence: Math.round(75 + Math.random() * 20),
        status: "success" as const,
      }
    })

    // Calculate DE recommended value from successful valuations
    const successfulVals = externalValuations.filter((v) => v.status === "success")
    const avgExternal =
      successfulVals.length > 0
        ? successfulVals.reduce((sum, v) => sum + v.value, 0) / successfulVals.length
        : estimatedValue

    const deValue = Math.round(avgExternal * (0.96 + Math.random() * 0.08))
    const valuationSpread =
      successfulVals.length > 0
        ? Math.max(...successfulVals.map((v) => v.value)) - Math.min(...successfulVals.map((v) => v.value))
        : 0

    const confidenceScore = 0.65 + Math.random() * 0.3
    const deConfidence: "high" | "medium" | "low" =
      confidenceScore > 0.85 ? "high" : confidenceScore > 0.7 ? "medium" : "low"

    // Auto-approve high confidence valuations
    const status =
      deConfidence === "high" && successfulVals.length >= 3
        ? "auto-approved"
        : deConfidence === "low" || successfulVals.length < 2
          ? "pending-review"
          : (["auto-approved", "approved", "pending-review"][Math.floor(Math.random() * 3)] as any)

    return {
      id: `val-${i + 1}`,
      vehicleId: vehicle.id,
      vehicle,
      defleetDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      bookValue: Math.round(bookValue),
      externalValuations,
      deRecommendedValue: deValue,
      deRecommendedReserve: Math.round(deValue * 0.92),
      deConfidence,
      confidenceScore,
      valuationSpread,
      confidenceFactors: [
        { factor: "Market data density", impact: confidenceScore > 0.8 ? "positive" : "neutral", weight: 0.3 },
        { factor: "Recent comparable sales", impact: Math.random() > 0.5 ? "positive" : "neutral", weight: 0.25 },
        { factor: "Model volatility", impact: vehicle.powertrain === "bev" ? "negative" : "neutral", weight: 0.2 },
        {
          factor: "Regional demand",
          impact: (["positive", "neutral", "negative"] as const)[Math.floor(Math.random() * 3)],
          weight: 0.25,
        },
      ],
      status,
      assignedTo: analysts[Math.floor(Math.random() * analysts.length)],
      notes: Math.random() > 0.7 ? ["Requires manual review - high value unit"] : [],
      marketDataPoints: 50 + Math.floor(Math.random() * 200),
      similarSalesCount: 5 + Math.floor(Math.random() * 30),
      daysSinceDefleet: Math.floor(Math.random() * 7),
    }
  })
}

export interface PricingCohort {
  id: string
  name: string
  description: string
  vehicleCount: number
  avgCurrentPrice: number
  avgMarketPrice: number
  pricePosition: number
  avgDaysInStock: number
  suggestedAction: "price-drop" | "price-increase" | "hold" | "channel-switch"
  suggestedChange: number
  expectedDaysImpact: number
  expectedRpiImpact: number
  riskLevel: "low" | "medium" | "high"
  confidence: "high" | "medium" | "low"
  status: "pending" | "approved" | "executed"
  guardrailsApplied: string[]
  vehicles: string[]
  criteria: { field: string; operator: string; value: string }[]
}

export const generatePricingCohorts = (): PricingCohort[] => {
  return [
    {
      id: "cohort-1",
      name: "Aging BEVs - France",
      description: "Electric vehicles in France with 60+ days in stock, priced above market",
      vehicleCount: 34,
      avgCurrentPrice: 38500,
      avgMarketPrice: 36200,
      pricePosition: 106.4,
      avgDaysInStock: 72,
      suggestedAction: "price-drop",
      suggestedChange: -4.5,
      expectedDaysImpact: -18,
      expectedRpiImpact: -2.1,
      riskLevel: "medium",
      confidence: "high",
      status: "pending",
      guardrailsApplied: ["Max -5% per action", "Reserve floor: €35,000"],
      vehicles: [],
      criteria: [
        { field: "powertrain", operator: "equals", value: "bev" },
        { field: "country", operator: "equals", value: "FR" },
        { field: "daysInStock", operator: "greaterThan", value: "60" },
      ],
    },
    {
      id: "cohort-2",
      name: "Underpriced PHEVs - Germany",
      description: "PHEVs priced below market with quick turnover potential",
      vehicleCount: 28,
      avgCurrentPrice: 42100,
      avgMarketPrice: 44800,
      pricePosition: 94.0,
      avgDaysInStock: 21,
      suggestedAction: "price-increase",
      suggestedChange: 2.5,
      expectedDaysImpact: 5,
      expectedRpiImpact: 1.8,
      riskLevel: "low",
      confidence: "high",
      status: "pending",
      guardrailsApplied: ["Max +3% per action", "Monitor conversion rate"],
      vehicles: [],
      criteria: [
        { field: "powertrain", operator: "equals", value: "hybrid-phev" },
        { field: "country", operator: "equals", value: "DE" },
        { field: "pricePosition", operator: "lessThan", value: "95" },
      ],
    },
    {
      id: "cohort-3",
      name: "Premium SUVs - Benelux",
      description: "High-value SUVs in Belgium and Netherlands showing slow movement",
      vehicleCount: 19,
      avgCurrentPrice: 58200,
      avgMarketPrice: 56800,
      pricePosition: 102.5,
      avgDaysInStock: 45,
      suggestedAction: "price-drop",
      suggestedChange: -2.0,
      expectedDaysImpact: -10,
      expectedRpiImpact: -1.2,
      riskLevel: "low",
      confidence: "medium",
      status: "approved",
      guardrailsApplied: ["Max -3% per action", "Premium segment protection"],
      vehicles: [],
      criteria: [
        { field: "segment", operator: "in", value: "Large SUV,Premium SUV" },
        { field: "country", operator: "in", value: "BE,NL" },
      ],
    },
    {
      id: "cohort-4",
      name: "Fresh Compact ICE",
      description: "Recently listed compact petrol/diesel vehicles performing well",
      vehicleCount: 52,
      avgCurrentPrice: 24800,
      avgMarketPrice: 24200,
      pricePosition: 102.5,
      avgDaysInStock: 8,
      suggestedAction: "hold",
      suggestedChange: 0,
      expectedDaysImpact: 0,
      expectedRpiImpact: 0,
      riskLevel: "low",
      confidence: "high",
      status: "pending",
      guardrailsApplied: [],
      vehicles: [],
      criteria: [
        { field: "segment", operator: "equals", value: "Compact" },
        { field: "powertrain", operator: "in", value: "ice-petrol,ice-diesel" },
        { field: "daysInStock", operator: "lessThan", value: "14" },
      ],
    },
    {
      id: "cohort-5",
      name: "Export-Ready Spain Stock",
      description: "Spanish inventory with export arbitrage opportunity to Italy/Portugal",
      vehicleCount: 23,
      avgCurrentPrice: 31200,
      avgMarketPrice: 32800,
      pricePosition: 95.1,
      avgDaysInStock: 38,
      suggestedAction: "channel-switch",
      suggestedChange: 0,
      expectedDaysImpact: -12,
      expectedRpiImpact: 2.4,
      riskLevel: "medium",
      confidence: "medium",
      status: "pending",
      guardrailsApplied: ["Export compliance check", "Logistics cost validation"],
      vehicles: [],
      criteria: [
        { field: "country", operator: "equals", value: "ES" },
        { field: "exportReadiness", operator: "equals", value: "true" },
      ],
    },
  ]
}

export interface MarketComparison {
  model: string
  make: string
  fuelType: string
  countries: {
    country: string
    avgPrice: number
    priceVsGuide: number
    avgDaysToSell: number
    volume: number
    demandScore: number
  }[]
  bestExportRoute?: {
    from: string
    to: string
    netUplift: number
    confidence: "high" | "medium" | "low"
  }
}

export const generateMarketComparisons = (): MarketComparison[] => {
  const models = [
    { make: "Ford", model: "Mustang Mach-E", fuelType: "Electric" },
    { make: "BMW", model: "i4", fuelType: "Electric" },
    { make: "Audi", model: "Q7", fuelType: "Hybrid" },
    { make: "Renault", model: "Megane E-Tech", fuelType: "Electric" },
    { make: "Peugeot", model: "3008", fuelType: "Hybrid" },
    { make: "VW", model: "ID.4", fuelType: "Electric" },
    { make: "Mercedes", model: "EQC", fuelType: "Electric" },
    { make: "Volvo", model: "XC40 Recharge", fuelType: "Electric" },
  ]

  const countryList = ["ES", "PT", "FR", "DE", "IT", "AT", "BE", "NL"]

  return models.map((m) => {
    const basePrice = 30000 + Math.random() * 40000

    const countryData = countryList.map((country) => {
      const priceFactor = 0.9 + Math.random() * 0.25
      return {
        country,
        avgPrice: Math.round(basePrice * priceFactor),
        priceVsGuide: Math.round((95 + Math.random() * 15) * 10) / 10,
        avgDaysToSell: Math.round(15 + Math.random() * 30),
        volume: Math.round(50 + Math.random() * 200),
        demandScore: Math.round(40 + Math.random() * 50),
      }
    })

    // Sort by price to find arbitrage
    const sortedByPrice = [...countryData].sort((a, b) => b.avgPrice - a.avgPrice)
    const hasArbitrage = Math.random() > 0.3

    return {
      ...m,
      countries: countryData,
      bestExportRoute: hasArbitrage
        ? {
            from: sortedByPrice[sortedByPrice.length - 1].country,
            to: sortedByPrice[0].country,
            netUplift: Math.round(500 + Math.random() * 2000),
            confidence: Math.random() > 0.5 ? "high" : Math.random() > 0.5 ? "medium" : ("low" as const),
          }
        : undefined,
    }
  })
}

export interface ModelPerformance {
  model: string
  make: string
  segment: string // added segment field for filtering
  powertrain: Powertrain
  totalPredictions: number // renamed from totalVehicles
  meanAbsoluteError: number // renamed and adjusted to currency values
  meanPercentageError: number // percentage error for accuracy metrics
  bias: number // model bias percentage
  overrideOutcome: number // average RPI outcome of overrides
  avgDaysError: number
  rpiAchieved: number
  overrideRate: number
  overrideImpact: number
  confidenceCalibration: number
  recommendations: string[]
}

export const generateModelPerformance = (): ModelPerformance[] => {
  const models = [
    { make: "Ford", model: "Mustang Mach-E", powertrain: "bev" as Powertrain, segment: "SUV BEV" },
    { make: "BMW", model: "i4", powertrain: "bev" as Powertrain, segment: "Premium Sedan BEV" },
    { make: "Audi", model: "Q7", powertrain: "hybrid-phev" as Powertrain, segment: "Premium SUV PHEV" },
    { make: "Renault", model: "Kadjar", powertrain: "ice-diesel" as Powertrain, segment: "Compact SUV Diesel" },
    { make: "Peugeot", model: "5008", powertrain: "hybrid-phev" as Powertrain, segment: "Family SUV PHEV" },
  ]

  return models.map((m) => ({
    ...m,
    totalPredictions: 50 + Math.floor(Math.random() * 150), // renamed from totalVehicles
    meanAbsoluteError: Math.round((200 + Math.random() * 600) * 10) / 10, // renamed and adjusted to currency values
    meanPercentageError: Math.round((2 + Math.random() * 5) * 10) / 10, // 2-7% error
    bias: Math.round((Math.random() * 6 - 3) * 10) / 10, // -3% to +3% bias
    overrideOutcome: Math.round((92 + Math.random() * 6) * 10) / 10, // 92-98 RPI from overrides
    avgDaysError: Math.round((3 + Math.random() * 8) * 10) / 10,
    rpiAchieved: Math.round((88 + Math.random() * 10) * 10) / 10,
    overrideRate: Math.round((10 + Math.random() * 30) * 10) / 10,
    overrideImpact: Math.round((Math.random() * 4 - 2) * 10) / 10,
    confidenceCalibration: Math.round((80 + Math.random() * 18) * 10) / 10,
    recommendations:
      Math.random() > 0.5
        ? ["Consider adjusting elasticity curve", "More market data needed"]
        : ["Model performing well"],
  }))
}

export interface OverrideAnalysisData {
  // Renamed to avoid conflict with previous OverrideAnalysis
  period: string
  totalDecisions: number
  overrideCount: number
  overrideRate: number
  overrideOutcomes: {
    better: number
    same: number
    worse: number
  }
  avgRpiImpact: number
  avgDaysImpact: number
  topOverrideReasons: { reason: string; count: number }[]
  byAnalyst: { name: string; overrides: number; successRate: number }[]
}

export const generateOverrideAnalysisData = (): OverrideAnalysisData => {
  return {
    period: "Last 30 days",
    totalDecisions: 1250,
    overrideCount: 312,
    overrideRate: 24.96,
    overrideOutcomes: {
      better: 98,
      same: 124,
      worse: 90,
    },
    avgRpiImpact: -0.8,
    avgDaysImpact: 2.3,
    topOverrideReasons: [
      { reason: "Local market knowledge", count: 89 },
      { reason: "Recent price movement", count: 72 },
      { reason: "Vehicle condition", count: 58 },
      { reason: "Buyer relationship", count: 45 },
      { reason: "Strategic hold", count: 28 },
    ],
    byAnalyst: [
      { name: "Maria Santos", overrides: 45, successRate: 62 },
      { name: "Thomas Weber", overrides: 78, successRate: 48 },
      { name: "Anne Dupont", overrides: 52, successRate: 71 },
      { name: "Lars Eriksen", overrides: 67, successRate: 55 },
    ],
  }
}

export interface ElasticityDataPoint {
  pricePosition: number
  expectedDays: number
  confidence: number
}

export interface ElasticityData {
  segment: string
  powertrain: Powertrain
  dataPoints: ElasticityDataPoint[]
  optimalPosition: number
  currentAvgPosition: number
  recommendation: string
}

export const generateElasticityData = (): ElasticityData[] => {
  const segments = [
    { segment: "Compact SUV", powertrain: "bev" as Powertrain },
    { segment: "Executive", powertrain: "hybrid-phev" as Powertrain },
    { segment: "Compact", powertrain: "ice-petrol" as Powertrain },
  ]

  return segments.map((s) => {
    const dataPoints: ElasticityDataPoint[] = []
    for (let pos = 85; pos <= 115; pos += 2) {
      dataPoints.push({
        pricePosition: pos,
        expectedDays: Math.round(15 + Math.pow((pos - 95) / 5, 2) * 8 + Math.random() * 5),
        confidence: Math.max(0.5, 0.95 - Math.abs(pos - 100) * 0.015),
      })
    }

    return {
      ...s,
      dataPoints,
      optimalPosition: 96 + Math.floor(Math.random() * 6),
      currentAvgPosition: 98 + Math.floor(Math.random() * 8),
      recommendation: "Consider reducing average price position by 2-3% for faster rotation",
    }
  })
}

export interface PriceElasticityResult {
  segment: string
  channel: string
  priceChange: number
  demandChange: number
  daysToSellChange: number
  sampleSize: number
  confidence: "high" | "medium" | "low"
}

export const generatePriceElasticityResults = (): PriceElasticityResult[] => {
  const segments = ["Compact SUV", "Premium Sedan", "Executive", "Compact", "Luxury SUV"]
  const channels = ["online-auction", "wholesale", "retail-direct", "export"]

  const results: PriceElasticityResult[] = []

  segments.forEach((segment) => {
    const numChannels = Math.floor(Math.random() * 2) + 2 // 2-3 channels per segment
    const selectedChannels = channels.sort(() => 0.5 - Math.random()).slice(0, numChannels)

    selectedChannels.forEach((channel) => {
      const priceChange = -(Math.floor(Math.random() * 8) + 3) // -3% to -10%
      const demandChange = Math.abs(priceChange) * (1.2 + Math.random() * 0.6) // Elasticity multiplier
      const daysToSellChange = -(Math.floor(Math.random() * 6) + 2) // -2 to -7 days

      results.push({
        segment,
        channel,
        priceChange,
        demandChange: Math.round(demandChange * 10) / 10,
        daysToSellChange,
        sampleSize: Math.floor(Math.random() * 100) + 50, // 50-150 vehicles
        confidence: demandChange > 10 ? "high" : demandChange > 6 ? "medium" : "low",
      })
    })
  })

  return results
}

export interface VehicleScorecard {
  overallScore: number
  demandScore: number
  conditionScore: number
  pricingScore: number
  marketFit: number
  riskFactors: { factor: string; severity: "low" | "medium" | "high"; description: string }[]
  opportunities: { type: string; potential: number; confidence: number }[]
  recommendedActions: string[]
  confidence: number
  desirability: number
  demandSignal: "hot" | "warm" | "cool" | "cold"
  liquidityBand: "fast" | "normal" | "slow" | "stale"
  riskFlags: RiskFlag[]
  recommendedPriority: "urgent" | "normal" | "low"
}

export interface RiskFlag {
  type: "ev-volatility" | "odd-spec" | "high-mileage" | "missing-history" | "brand-sensitive" | "aging" | "recall"
  severity: "low" | "medium" | "high"
  description: string
}

export const generateVehicleScorecard = (vehicle: Vehicle): VehicleScorecard => {
  const demandScore =
    vehicle.demandSignal === "hot"
      ? 85 + Math.random() * 15
      : vehicle.demandSignal === "warm"
        ? 60 + Math.random() * 20
        : vehicle.demandSignal === "cool"
          ? 40 + Math.random() * 20
          : 20 + Math.random() * 20

  const conditionScore =
    vehicle.conditionGrade === "A"
      ? 85 + Math.random() * 15
      : vehicle.conditionGrade === "B"
        ? 65 + Math.random() * 20
        : vehicle.conditionGrade === "C"
          ? 45 + Math.random() * 20
          : 25 + Math.random() * 20

  const pricingScore = 100 - Math.abs(vehicle.pricePosition) * 2 + Math.random() * 10
  const marketFit = (demandScore + conditionScore + pricingScore) / 3
  const overallScore = Math.round(demandScore * 0.35 + conditionScore * 0.25 + pricingScore * 0.25 + marketFit * 0.15)

  const riskFactors: VehicleScorecard["riskFactors"] = []
  const riskFlags: RiskFlag[] = []

  if (vehicle.hasDataConflict) {
    riskFactors.push({
      factor: "Data Conflict",
      severity: "high",
      description: `Conflicting ${vehicle.conflictFields?.[0] || "data"} values`,
    })
    riskFlags.push({
      type: "missing-history",
      severity: "high",
      description: `Conflicting ${vehicle.conflictFields?.[0] || "data"} values`,
    })
  }
  if (vehicle.daysInStock > 60) {
    const severity = vehicle.daysInStock > 90 ? "high" : "medium"
    riskFactors.push({
      factor: "Aging Stock",
      severity,
      description: `${vehicle.daysInStock} days in stock`,
    })
    riskFlags.push({
      type: "aging",
      severity,
      description: `${vehicle.daysInStock} days in stock`,
    })
  }
  if (vehicle.powertrain === "bev" && vehicle.batteryHealth && vehicle.batteryHealth < 85) {
    riskFactors.push({
      factor: "Battery Health",
      severity: "medium",
      description: `Battery at ${vehicle.batteryHealth}%`,
    })
    riskFlags.push({
      type: "ev-volatility",
      severity: "medium",
      description: `Battery health at ${vehicle.batteryHealth}%`,
    })
  }
  if (vehicle.mileage > 100000) {
    riskFlags.push({
      type: "high-mileage",
      severity: "medium",
      description: `High mileage: ${vehicle.mileage.toLocaleString()} km`,
    })
  }

  const opportunities: VehicleScorecard["opportunities"] = []
  if (vehicle.exportUplift && vehicle.exportUplift > 500) {
    opportunities.push({ type: "Export", potential: vehicle.exportUplift, confidence: 0.75 + Math.random() * 0.2 })
  }
  if (vehicle.reconRoi && vehicle.reconRoi > 1.5) {
    opportunities.push({
      type: "Reconditioning",
      potential: (vehicle.reconCost || 500) * (vehicle.reconRoi - 1),
      confidence: 0.8,
    })
  }

  const liquidityBand: VehicleScorecard["liquidityBand"] =
    vehicle.daysInStock > 90
      ? "stale"
      : vehicle.daysInStock > 60
        ? "slow"
        : vehicle.demandSignal === "hot"
          ? "fast"
          : "normal"

  const recommendedPriority: VehicleScorecard["recommendedPriority"] = riskFlags.some((f) => f.severity === "high")
    ? "urgent"
    : riskFlags.length > 2
      ? "normal"
      : "low"

  return {
    overallScore,
    demandScore: Math.round(demandScore),
    conditionScore: Math.round(conditionScore),
    pricingScore: Math.round(Math.min(100, pricingScore)),
    marketFit: Math.round(marketFit),
    riskFactors,
    opportunities,
    recommendedActions:
      riskFactors.length > 0
        ? ["Resolve data conflicts", "Review pricing strategy"]
        : ["Proceed to listing", "Consider export channels"],
    confidence: 0.7 + Math.random() * 0.25,
    desirability: overallScore,
    demandSignal: vehicle.demandSignal,
    liquidityBand,
    riskFlags,
    recommendedPriority,
  }
}

export interface ListingDecision {
  vehicleId: string
  recommendedChannel: Channel
  recommendedTactic: string
  recommendedPrice: number
  reservePrice: number
  expectedDaysToSell: number
  expectedRpi: number
  confidence: "high" | "medium" | "low"
  confidenceScore: number
  channelReasoning: string
  priceReasoning: string
  alternativeChannels: { channel: Channel; expectedRpi: number; expectedDays: number }[]
}

export const generateListingDecisions = (vehicles: Vehicle[]): ListingDecision[] => {
  const tactics = ["rofr-first", "click-buy", "dutch-price", "make-offer", "auction-only"]

  return vehicles.map((vehicle) => {
    const channel = vehicle.recommendedChannel || "fixed-price"
    const tactic = tactics[Math.floor(Math.random() * tactics.length)]
    const expectedDays = vehicle.predictedDaysToSell || 15 + Math.floor(Math.random() * 20)
    const expectedRpi = 92 + Math.random() * 8
    const confidenceScore = 0.7 + Math.random() * 0.25
    const confidence: "high" | "medium" | "low" =
      confidenceScore > 0.85 ? "high" : confidenceScore > 0.7 ? "medium" : "low"

    return {
      vehicleId: vehicle.id,
      recommendedChannel: channel,
      recommendedTactic: tactic,
      recommendedPrice: vehicle.recommendedPrice,
      reservePrice: vehicle.reservePrice,
      expectedDaysToSell: expectedDays,
      expectedRpi: Math.round(expectedRpi * 10) / 10,
      confidence,
      confidenceScore: Math.round(confidenceScore * 100) / 100,
      channelReasoning: `${channel === "export" ? "Strong cross-border demand" : "Best fit based on vehicle profile and market conditions"}`,
      priceReasoning: "Price position optimized for target days-to-sell while protecting RPI",
      alternativeChannels: [
        { channel: "dealer-rofr" as Channel, expectedRpi: expectedRpi - 1.5, expectedDays: expectedDays - 5 },
        { channel: "auction" as Channel, expectedRpi: expectedRpi - 2, expectedDays: expectedDays - 8 },
      ],
    }
  })
}

export interface PacingForecast {
  currentDay: number
  daysRemaining: number
  volumeTarget: number
  volumeActual: number | null
  volumeForecast: number | null
  rpiTarget: number
  rpiActual: number | null
  rpiForecast: number | null
  compressionRisk: "low" | "medium" | "high"
  interventions: PacingIntervention[]
  cohortRisks: CohortRisk[]
}

export interface PacingIntervention {
  id: string
  name: string
  description: string
  vehicleCount: number
  expectedVolumeImpact: number
  expectedRpiImpact: number
  confidence: number
  urgency: "low" | "medium" | "high"
  type: "pricing" | "channel" | "promotion"
}

export interface CohortRisk {
  id: string
  name: string
  vehicleCount: number
  avgDaysInStock: number
  riskLevel: "low" | "medium" | "high"
  suggestedAction: string
}

export const generatePacingForecast = (): PacingForecast => {
  const today = new Date()
  const currentDay = today.getDate()
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const daysRemaining = daysInMonth - currentDay

  const volumeTarget = 850 + Math.floor(Math.random() * 200)
  const volumeActual = Math.floor(volumeTarget * (currentDay / daysInMonth) * (0.85 + Math.random() * 0.2))
  const volumeForecast = volumeActual + Math.floor((volumeTarget - volumeActual) * (0.8 + Math.random() * 0.3))

  const compressionRisk: PacingForecast["compressionRisk"] =
    volumeForecast < volumeTarget * 0.9 ? "high" : volumeForecast < volumeTarget * 0.95 ? "medium" : "low"

  return {
    currentDay,
    daysRemaining,
    volumeTarget,
    volumeActual,
    volumeForecast,
    rpiTarget: 94.5,
    rpiActual: 93.2 + Math.random() * 3,
    rpiForecast: 93.8 + Math.random() * 2,
    compressionRisk,
    interventions: [
      {
        id: "int-1",
        name: "Aging BEV Push",
        description: "Apply 3% discount to BEVs with 60+ days in stock",
        vehicleCount: 34,
        expectedVolumeImpact: 18,
        expectedRpiImpact: -1.2,
        confidence: 0.78,
        urgency: "high",
        type: "pricing",
      },
      {
        id: "int-2",
        name: "Export Acceleration",
        description: "Route eligible vehicles to high-demand export markets",
        vehicleCount: 22,
        expectedVolumeImpact: 12,
        expectedRpiImpact: 0.8,
        confidence: 0.72,
        urgency: "medium",
        type: "channel",
      },
      {
        id: "int-3",
        name: "Dealer Promotion",
        description: "Launch targeted promotion for PHEV inventory",
        vehicleCount: 45,
        expectedVolumeImpact: 15,
        expectedRpiImpact: -0.5,
        confidence: 0.65,
        urgency: "medium",
        type: "promotion",
      },
    ],
    cohortRisks: [
      {
        id: "risk-1",
        name: "60+ Day EVs",
        vehicleCount: 28,
        avgDaysInStock: 72,
        riskLevel: "high",
        suggestedAction: "Aggressive repricing or channel switch",
      },
      {
        id: "risk-2",
        name: "Premium SUVs France",
        vehicleCount: 15,
        avgDaysInStock: 54,
        riskLevel: "medium",
        suggestedAction: "Consider export to Germany/Benelux",
      },
      {
        id: "risk-3",
        name: "Unlisted Ready Stock",
        vehicleCount: 42,
        avgDaysInStock: 8,
        riskLevel: "low",
        suggestedAction: "Accelerate listing process",
      },
    ],
  }
}

export type MockDataExports = {
  operationalTags: typeof operationalTags
  generateNSCPerformance: typeof generateNSCPerformance
  generateArbitrageData: typeof generateArbitrageData
  generateCounterfactuals: typeof generateCounterfactuals
  generateSegmentPerformance: typeof generateSegmentPerformance
  generateVehicleScorecard: typeof generateVehicleScorecard
  generateListingDecisions: typeof generateListingDecisions
  generatePacingForecast: typeof generatePacingForecast
  generateDefleetValuations: typeof generateDefleetValuations
  generatePricingCohorts: typeof generatePricingCohorts
  generateMarketComparisons: typeof generateMarketComparisons
  generateElasticityData: typeof generateElasticityData
}
