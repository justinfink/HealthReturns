import { MemberLevel, MetricType, ComparisonType } from "@prisma/client"

// Default level evaluation rules
// These are preset rules that determine how members advance through levels

export interface LevelRuleDefinition {
  metricType: MetricType
  improvementThreshold?: number // Percentage improvement from baseline
  absoluteThreshold?: number // Absolute value to achieve
  maintenanceAllowed: boolean // Can maintain instead of improve
  comparisonType: ComparisonType
  weight: number // How important this metric is (0-1)
  optimalRange?: { min: number; max: number } // Healthy range
}

export interface LevelRequirements {
  level: MemberLevel
  description: string
  rebatePercentage: number
  minMetricsRequired: number // How many metrics must pass
  rules: LevelRuleDefinition[]
  alternativeStandard?: string // ACA-compliant alternative
}

// Level 0: Just enrolled - no requirements
// Level 1: Baseline captured + participation
// Level 2: Improvement OR maintenance of healthy metrics
// Level 3: Sustained improvement OR excellence

export const defaultLevelRules: Record<MemberLevel, LevelRequirements> = {
  [MemberLevel.LEVEL_0]: {
    level: MemberLevel.LEVEL_0,
    description: "Enrolled in the wellness program",
    rebatePercentage: 0,
    minMetricsRequired: 0,
    rules: [],
    alternativeStandard: "Complete enrollment form",
  },

  [MemberLevel.LEVEL_1]: {
    level: MemberLevel.LEVEL_1,
    description: "Active participation with baseline metrics captured",
    rebatePercentage: 5,
    minMetricsRequired: 3, // Need at least 3 metric types with data
    rules: [
      {
        metricType: MetricType.STEPS,
        maintenanceAllowed: true,
        comparisonType: ComparisonType.GREATER_THAN,
        weight: 0.2,
      },
      {
        metricType: MetricType.RESTING_HEART_RATE,
        maintenanceAllowed: true,
        comparisonType: ComparisonType.LESS_THAN,
        weight: 0.2,
      },
      {
        metricType: MetricType.SLEEP_DURATION,
        maintenanceAllowed: true,
        comparisonType: ComparisonType.GREATER_THAN,
        weight: 0.2,
      },
      {
        metricType: MetricType.WEIGHT,
        maintenanceAllowed: true,
        comparisonType: ComparisonType.LESS_THAN_OR_EQUAL,
        weight: 0.2,
      },
      {
        metricType: MetricType.ACTIVE_MINUTES,
        maintenanceAllowed: true,
        comparisonType: ComparisonType.GREATER_THAN,
        weight: 0.2,
      },
    ],
    alternativeStandard: "Complete health coaching session OR submit physician attestation",
  },

  [MemberLevel.LEVEL_2]: {
    level: MemberLevel.LEVEL_2,
    description: "Showing improvement or maintaining healthy metrics",
    rebatePercentage: 15,
    minMetricsRequired: 3, // Need to pass at least 3 metrics
    rules: [
      {
        metricType: MetricType.STEPS,
        improvementThreshold: 10, // 10% improvement
        absoluteThreshold: 8000, // OR achieve 8000 steps
        maintenanceAllowed: true,
        comparisonType: ComparisonType.GREATER_THAN,
        weight: 0.25,
        optimalRange: { min: 8000, max: 15000 },
      },
      {
        metricType: MetricType.RESTING_HEART_RATE,
        improvementThreshold: 5, // 5% improvement (lower is better)
        absoluteThreshold: 65, // OR achieve RHR of 65 or below
        maintenanceAllowed: true,
        comparisonType: ComparisonType.LESS_THAN_OR_EQUAL,
        weight: 0.25,
        optimalRange: { min: 50, max: 65 },
      },
      {
        metricType: MetricType.SLEEP_DURATION,
        improvementThreshold: 10, // 10% improvement
        absoluteThreshold: 7, // OR achieve 7 hours
        maintenanceAllowed: true,
        comparisonType: ComparisonType.GREATER_THAN_OR_EQUAL,
        weight: 0.25,
        optimalRange: { min: 7, max: 9 },
      },
      {
        metricType: MetricType.WEIGHT,
        improvementThreshold: 3, // 3% reduction
        maintenanceAllowed: true, // Maintenance counts if already healthy
        comparisonType: ComparisonType.LESS_THAN_OR_EQUAL,
        weight: 0.2,
      },
      {
        metricType: MetricType.ACTIVE_MINUTES,
        improvementThreshold: 15, // 15% improvement
        absoluteThreshold: 30, // OR achieve 30 min/day average
        maintenanceAllowed: true,
        comparisonType: ComparisonType.GREATER_THAN_OR_EQUAL,
        weight: 0.25,
        optimalRange: { min: 30, max: 60 },
      },
      {
        metricType: MetricType.HEART_RATE_VARIABILITY,
        improvementThreshold: 10, // 10% improvement
        absoluteThreshold: 45, // OR achieve HRV of 45ms
        maintenanceAllowed: true,
        comparisonType: ComparisonType.GREATER_THAN_OR_EQUAL,
        weight: 0.2,
        optimalRange: { min: 45, max: 100 },
      },
    ],
    alternativeStandard: "Complete wellness coaching program OR preventive care visit",
  },

  [MemberLevel.LEVEL_3]: {
    level: MemberLevel.LEVEL_3,
    description: "Sustained improvement or excellence across multiple metrics",
    rebatePercentage: 30,
    minMetricsRequired: 4, // Need to pass at least 4 metrics
    rules: [
      {
        metricType: MetricType.STEPS,
        improvementThreshold: 20, // 20% improvement
        absoluteThreshold: 10000, // OR achieve 10000 steps
        maintenanceAllowed: true,
        comparisonType: ComparisonType.GREATER_THAN,
        weight: 0.2,
        optimalRange: { min: 10000, max: 15000 },
      },
      {
        metricType: MetricType.RESTING_HEART_RATE,
        improvementThreshold: 10, // 10% improvement
        absoluteThreshold: 60, // OR achieve RHR of 60
        maintenanceAllowed: true,
        comparisonType: ComparisonType.LESS_THAN_OR_EQUAL,
        weight: 0.2,
        optimalRange: { min: 50, max: 60 },
      },
      {
        metricType: MetricType.SLEEP_DURATION,
        improvementThreshold: 15, // 15% improvement
        absoluteThreshold: 7.5, // OR achieve 7.5 hours
        maintenanceAllowed: true,
        comparisonType: ComparisonType.GREATER_THAN_OR_EQUAL,
        weight: 0.2,
        optimalRange: { min: 7.5, max: 9 },
      },
      {
        metricType: MetricType.WEIGHT,
        improvementThreshold: 5, // 5% reduction
        maintenanceAllowed: true,
        comparisonType: ComparisonType.LESS_THAN_OR_EQUAL,
        weight: 0.15,
      },
      {
        metricType: MetricType.ACTIVE_MINUTES,
        improvementThreshold: 25, // 25% improvement
        absoluteThreshold: 45, // OR achieve 45 min/day
        maintenanceAllowed: true,
        comparisonType: ComparisonType.GREATER_THAN_OR_EQUAL,
        weight: 0.2,
        optimalRange: { min: 45, max: 90 },
      },
      {
        metricType: MetricType.HEART_RATE_VARIABILITY,
        improvementThreshold: 15, // 15% improvement
        absoluteThreshold: 55, // OR achieve HRV of 55ms
        maintenanceAllowed: true,
        comparisonType: ComparisonType.GREATER_THAN_OR_EQUAL,
        weight: 0.2,
        optimalRange: { min: 55, max: 100 },
      },
    ],
    alternativeStandard:
      "Complete comprehensive health coaching program AND preventive care visit",
  },
}

// Helper to get rebate percentage for a level
export function getRebatePercentage(level: MemberLevel): number {
  return defaultLevelRules[level].rebatePercentage
}

// Helper to get next level
export function getNextLevel(currentLevel: MemberLevel): MemberLevel | null {
  switch (currentLevel) {
    case MemberLevel.LEVEL_0:
      return MemberLevel.LEVEL_1
    case MemberLevel.LEVEL_1:
      return MemberLevel.LEVEL_2
    case MemberLevel.LEVEL_2:
      return MemberLevel.LEVEL_3
    case MemberLevel.LEVEL_3:
      return null // Already at max
  }
}

// Helper to get level display name
export function getLevelDisplayName(level: MemberLevel): string {
  switch (level) {
    case MemberLevel.LEVEL_0:
      return "Enrolled"
    case MemberLevel.LEVEL_1:
      return "Participation"
    case MemberLevel.LEVEL_2:
      return "Improvement"
    case MemberLevel.LEVEL_3:
      return "Excellence"
  }
}
