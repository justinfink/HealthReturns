import { MetricCategory, MetricType, IntegrationSource } from "@prisma/client"

// Mock Renpho client for demo/development
// Renpho is a smart scale that provides body composition metrics

export interface RenphoMeasurement {
  weight: number // lbs
  bodyFatPercentage: number
  muscleMass: number // lbs
  boneMass: number // lbs
  waterPercentage: number
  bmi: number
  visceralFat: number // rating 1-59
  basalMetabolicRate: number // calories
  metabolicAge: number // years
  proteinPercentage: number
  subcutaneousFat: number // percentage
  skeletalMuscle: number // percentage
}

type BodyProfile = "underweight" | "normal" | "overweight" | "obese"

function getMeasurementForProfile(
  profile: BodyProfile,
  height: number = 68 // inches, ~5'8"
): RenphoMeasurement {
  // Calculate weight range based on BMI categories
  const heightMeters = height * 0.0254

  switch (profile) {
    case "underweight": {
      const bmi = 17 + Math.random() * 1.5
      const weight = (bmi * heightMeters * heightMeters) * 2.205 // convert kg to lbs
      return {
        weight: Math.round(weight * 10) / 10,
        bodyFatPercentage: 12 + Math.random() * 6,
        muscleMass: weight * 0.42 + Math.random() * 5,
        boneMass: 5 + Math.random() * 2,
        waterPercentage: 55 + Math.random() * 8,
        bmi,
        visceralFat: 3 + Math.floor(Math.random() * 3),
        basalMetabolicRate: 1400 + Math.floor(Math.random() * 200),
        metabolicAge: 25 + Math.floor(Math.random() * 10),
        proteinPercentage: 18 + Math.random() * 4,
        subcutaneousFat: 10 + Math.random() * 5,
        skeletalMuscle: 35 + Math.random() * 8,
      }
    }
    case "normal": {
      const bmi = 20 + Math.random() * 4
      const weight = (bmi * heightMeters * heightMeters) * 2.205
      return {
        weight: Math.round(weight * 10) / 10,
        bodyFatPercentage: 18 + Math.random() * 8,
        muscleMass: weight * 0.40 + Math.random() * 8,
        boneMass: 6 + Math.random() * 2,
        waterPercentage: 50 + Math.random() * 10,
        bmi,
        visceralFat: 5 + Math.floor(Math.random() * 5),
        basalMetabolicRate: 1500 + Math.floor(Math.random() * 300),
        metabolicAge: 30 + Math.floor(Math.random() * 15),
        proteinPercentage: 16 + Math.random() * 4,
        subcutaneousFat: 15 + Math.random() * 8,
        skeletalMuscle: 32 + Math.random() * 8,
      }
    }
    case "overweight": {
      const bmi = 26 + Math.random() * 3
      const weight = (bmi * heightMeters * heightMeters) * 2.205
      return {
        weight: Math.round(weight * 10) / 10,
        bodyFatPercentage: 28 + Math.random() * 8,
        muscleMass: weight * 0.35 + Math.random() * 8,
        boneMass: 6.5 + Math.random() * 2,
        waterPercentage: 45 + Math.random() * 8,
        bmi,
        visceralFat: 10 + Math.floor(Math.random() * 5),
        basalMetabolicRate: 1600 + Math.floor(Math.random() * 300),
        metabolicAge: 40 + Math.floor(Math.random() * 15),
        proteinPercentage: 14 + Math.random() * 4,
        subcutaneousFat: 22 + Math.random() * 8,
        skeletalMuscle: 28 + Math.random() * 6,
      }
    }
    case "obese": {
      const bmi = 32 + Math.random() * 8
      const weight = (bmi * heightMeters * heightMeters) * 2.205
      return {
        weight: Math.round(weight * 10) / 10,
        bodyFatPercentage: 35 + Math.random() * 10,
        muscleMass: weight * 0.30 + Math.random() * 10,
        boneMass: 7 + Math.random() * 2,
        waterPercentage: 40 + Math.random() * 8,
        bmi,
        visceralFat: 15 + Math.floor(Math.random() * 10),
        basalMetabolicRate: 1800 + Math.floor(Math.random() * 400),
        metabolicAge: 50 + Math.floor(Math.random() * 15),
        proteinPercentage: 12 + Math.random() * 3,
        subcutaneousFat: 28 + Math.random() * 10,
        skeletalMuscle: 24 + Math.random() * 5,
      }
    }
  }
}

// Simulate gradual progress over time
function applyProgressTrend(
  baseline: RenphoMeasurement,
  daysFromBaseline: number,
  isImproving: boolean
): RenphoMeasurement {
  if (!isImproving || daysFromBaseline <= 0) {
    // Add slight daily variation
    return {
      ...baseline,
      weight: baseline.weight + (Math.random() - 0.5) * 2,
      bodyFatPercentage: baseline.bodyFatPercentage + (Math.random() - 0.5) * 1,
      waterPercentage: baseline.waterPercentage + (Math.random() - 0.5) * 3,
    }
  }

  // Calculate improvement factor (diminishing returns over time)
  const maxImprovement = 0.15 // 15% max improvement
  const improvementRate = Math.min(maxImprovement, (daysFromBaseline / 180) * maxImprovement)

  return {
    weight: baseline.weight * (1 - improvementRate * 0.8) + (Math.random() - 0.5) * 1,
    bodyFatPercentage: baseline.bodyFatPercentage * (1 - improvementRate) + (Math.random() - 0.5) * 0.5,
    muscleMass: baseline.muscleMass * (1 + improvementRate * 0.3) + (Math.random() - 0.5) * 0.5,
    boneMass: baseline.boneMass + (Math.random() - 0.5) * 0.1,
    waterPercentage: baseline.waterPercentage * (1 + improvementRate * 0.1) + (Math.random() - 0.5) * 1,
    bmi: baseline.bmi * (1 - improvementRate * 0.6),
    visceralFat: Math.max(1, baseline.visceralFat - Math.floor(improvementRate * 5)),
    basalMetabolicRate: baseline.basalMetabolicRate * (1 + improvementRate * 0.05),
    metabolicAge: Math.max(20, baseline.metabolicAge - Math.floor(improvementRate * 10)),
    proteinPercentage: baseline.proteinPercentage * (1 + improvementRate * 0.1),
    subcutaneousFat: baseline.subcutaneousFat * (1 - improvementRate * 0.8),
    skeletalMuscle: baseline.skeletalMuscle * (1 + improvementRate * 0.2),
  }
}

export class RenphoMockClient {
  private profile: BodyProfile
  private baselineDate: Date
  private baselineMeasurement: RenphoMeasurement
  private isImproving: boolean

  constructor(
    profile: BodyProfile = "normal",
    isImproving: boolean = true,
    baselineDate?: Date
  ) {
    this.profile = profile
    this.isImproving = isImproving
    this.baselineDate = baselineDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days ago
    this.baselineMeasurement = getMeasurementForProfile(profile)
  }

  async connect(): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 400))
    return {
      success: true,
      message: "Connected to Renpho scale (mock)",
    }
  }

  async getLatestMeasurement(): Promise<RenphoMeasurement> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const daysFromBaseline = Math.floor(
      (Date.now() - this.baselineDate.getTime()) / (24 * 60 * 60 * 1000)
    )
    return applyProgressTrend(this.baselineMeasurement, daysFromBaseline, this.isImproving)
  }

  async getMeasurementForDate(date: Date): Promise<RenphoMeasurement> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    const daysFromBaseline = Math.floor(
      (date.getTime() - this.baselineDate.getTime()) / (24 * 60 * 60 * 1000)
    )
    return applyProgressTrend(this.baselineMeasurement, daysFromBaseline, this.isImproving)
  }

  transformToMetrics(memberId: string, data: RenphoMeasurement, recordedAt: Date) {
    return [
      {
        memberId,
        category: MetricCategory.BODY,
        metricType: MetricType.WEIGHT,
        value: Math.round(data.weight * 10) / 10,
        unit: "lbs",
        source: IntegrationSource.RENPHO,
        recordedAt,
        isVerified: true,
      },
      {
        memberId,
        category: MetricCategory.BODY,
        metricType: MetricType.BODY_FAT_PERCENTAGE,
        value: Math.round(data.bodyFatPercentage * 10) / 10,
        unit: "%",
        source: IntegrationSource.RENPHO,
        recordedAt,
        isVerified: true,
      },
      {
        memberId,
        category: MetricCategory.BODY,
        metricType: MetricType.BMI,
        value: Math.round(data.bmi * 10) / 10,
        unit: "kg/m2",
        source: IntegrationSource.RENPHO,
        recordedAt,
        isVerified: true,
      },
      {
        memberId,
        category: MetricCategory.BODY,
        metricType: MetricType.MUSCLE_MASS,
        value: Math.round(data.muscleMass * 10) / 10,
        unit: "lbs",
        source: IntegrationSource.RENPHO,
        recordedAt,
        isVerified: true,
      },
    ]
  }
}
