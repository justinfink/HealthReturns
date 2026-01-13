import { MetricCategory, MetricType, IntegrationSource } from "@prisma/client"

// Mock Apple Health client for demo/development
// In production, this would integrate with Apple HealthKit via a mobile app

export interface AppleHealthData {
  steps: number
  activeEnergy: number // kcal
  restingHeartRate: number | null
  heartRateVariability: number | null
  sleepDuration: number // hours
  weight: number | null // lbs
  bodyFatPercentage: number | null
  bloodPressureSystolic: number | null
  bloodPressureDiastolic: number | null
  vo2Max: number | null
}

// Generate realistic mock data based on a "profile"
type HealthProfile = "sedentary" | "moderate" | "active" | "athlete"

function getBaselineForProfile(profile: HealthProfile): AppleHealthData {
  switch (profile) {
    case "sedentary":
      return {
        steps: 3000 + Math.random() * 2000,
        activeEnergy: 150 + Math.random() * 100,
        restingHeartRate: 75 + Math.random() * 10,
        heartRateVariability: 25 + Math.random() * 10,
        sleepDuration: 5.5 + Math.random() * 1,
        weight: 180 + Math.random() * 30,
        bodyFatPercentage: 30 + Math.random() * 10,
        bloodPressureSystolic: 130 + Math.random() * 15,
        bloodPressureDiastolic: 85 + Math.random() * 10,
        vo2Max: 28 + Math.random() * 5,
      }
    case "moderate":
      return {
        steps: 6000 + Math.random() * 3000,
        activeEnergy: 300 + Math.random() * 150,
        restingHeartRate: 65 + Math.random() * 10,
        heartRateVariability: 40 + Math.random() * 15,
        sleepDuration: 6.5 + Math.random() * 1,
        weight: 160 + Math.random() * 20,
        bodyFatPercentage: 22 + Math.random() * 8,
        bloodPressureSystolic: 120 + Math.random() * 10,
        bloodPressureDiastolic: 78 + Math.random() * 8,
        vo2Max: 38 + Math.random() * 7,
      }
    case "active":
      return {
        steps: 9000 + Math.random() * 4000,
        activeEnergy: 450 + Math.random() * 200,
        restingHeartRate: 58 + Math.random() * 8,
        heartRateVariability: 55 + Math.random() * 20,
        sleepDuration: 7 + Math.random() * 1,
        weight: 155 + Math.random() * 15,
        bodyFatPercentage: 18 + Math.random() * 6,
        bloodPressureSystolic: 115 + Math.random() * 8,
        bloodPressureDiastolic: 72 + Math.random() * 6,
        vo2Max: 45 + Math.random() * 8,
      }
    case "athlete":
      return {
        steps: 12000 + Math.random() * 5000,
        activeEnergy: 600 + Math.random() * 300,
        restingHeartRate: 50 + Math.random() * 6,
        heartRateVariability: 70 + Math.random() * 25,
        sleepDuration: 7.5 + Math.random() * 0.5,
        weight: 145 + Math.random() * 10,
        bodyFatPercentage: 12 + Math.random() * 5,
        bloodPressureSystolic: 110 + Math.random() * 6,
        bloodPressureDiastolic: 68 + Math.random() * 5,
        vo2Max: 55 + Math.random() * 10,
      }
  }
}

// Add daily variation to data
function addDailyVariation(data: AppleHealthData, dayOfWeek: number): AppleHealthData {
  // Weekend tends to be different
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
  const variation = isWeekend ? 0.85 : 1.0

  return {
    ...data,
    steps: Math.round(data.steps * variation * (0.9 + Math.random() * 0.2)),
    activeEnergy: Math.round(data.activeEnergy * variation * (0.85 + Math.random() * 0.3)),
    restingHeartRate: data.restingHeartRate
      ? Math.round(data.restingHeartRate * (0.98 + Math.random() * 0.04))
      : null,
    heartRateVariability: data.heartRateVariability
      ? Math.round(data.heartRateVariability * (0.9 + Math.random() * 0.2))
      : null,
    sleepDuration: Number((data.sleepDuration * (0.85 + Math.random() * 0.3)).toFixed(1)),
  }
}

export class AppleHealthMockClient {
  private profile: HealthProfile

  constructor(profile: HealthProfile = "moderate") {
    this.profile = profile
  }

  // Simulate connecting (always succeeds in mock)
  async connect(): Promise<{ success: boolean; message: string }> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    return {
      success: true,
      message: "Connected to Apple Health (mock)",
    }
  }

  // Get data for a specific date
  async getDataForDate(date: Date): Promise<AppleHealthData> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const baseline = getBaselineForProfile(this.profile)
    return addDailyVariation(baseline, date.getDay())
  }

  // Get data for a date range
  async getDataForRange(startDate: Date, endDate: Date): Promise<Map<string, AppleHealthData>> {
    const data = new Map<string, AppleHealthData>()
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split("T")[0]
      data.set(dateKey, await this.getDataForDate(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return data
  }

  // Transform to our metric format
  transformToMetrics(memberId: string, data: AppleHealthData, recordedAt: Date) {
    const metrics = []

    metrics.push({
      memberId,
      category: MetricCategory.ACTIVITY,
      metricType: MetricType.STEPS,
      value: Math.round(data.steps),
      unit: "steps",
      source: IntegrationSource.APPLE_HEALTH,
      recordedAt,
      isVerified: true,
    })

    if (data.restingHeartRate) {
      metrics.push({
        memberId,
        category: MetricCategory.HEART,
        metricType: MetricType.RESTING_HEART_RATE,
        value: Math.round(data.restingHeartRate),
        unit: "bpm",
        source: IntegrationSource.APPLE_HEALTH,
        recordedAt,
        isVerified: true,
      })
    }

    if (data.heartRateVariability) {
      metrics.push({
        memberId,
        category: MetricCategory.HEART,
        metricType: MetricType.HEART_RATE_VARIABILITY,
        value: Math.round(data.heartRateVariability),
        unit: "ms",
        source: IntegrationSource.APPLE_HEALTH,
        recordedAt,
        isVerified: true,
      })
    }

    metrics.push({
      memberId,
      category: MetricCategory.SLEEP,
      metricType: MetricType.SLEEP_DURATION,
      value: data.sleepDuration,
      unit: "hours",
      source: IntegrationSource.APPLE_HEALTH,
      recordedAt,
      isVerified: true,
    })

    if (data.weight) {
      metrics.push({
        memberId,
        category: MetricCategory.BODY,
        metricType: MetricType.WEIGHT,
        value: data.weight,
        unit: "lbs",
        source: IntegrationSource.APPLE_HEALTH,
        recordedAt,
        isVerified: true,
      })
    }

    if (data.bodyFatPercentage) {
      metrics.push({
        memberId,
        category: MetricCategory.BODY,
        metricType: MetricType.BODY_FAT_PERCENTAGE,
        value: data.bodyFatPercentage,
        unit: "%",
        source: IntegrationSource.APPLE_HEALTH,
        recordedAt,
        isVerified: true,
      })
    }

    if (data.bloodPressureSystolic && data.bloodPressureDiastolic) {
      metrics.push({
        memberId,
        category: MetricCategory.HEART,
        metricType: MetricType.BLOOD_PRESSURE_SYSTOLIC,
        value: Math.round(data.bloodPressureSystolic),
        unit: "mmHg",
        source: IntegrationSource.APPLE_HEALTH,
        recordedAt,
        isVerified: true,
      })
      metrics.push({
        memberId,
        category: MetricCategory.HEART,
        metricType: MetricType.BLOOD_PRESSURE_DIASTOLIC,
        value: Math.round(data.bloodPressureDiastolic),
        unit: "mmHg",
        source: IntegrationSource.APPLE_HEALTH,
        recordedAt,
        isVerified: true,
      })
    }

    if (data.vo2Max) {
      metrics.push({
        memberId,
        category: MetricCategory.HEART,
        metricType: MetricType.VO2_MAX,
        value: data.vo2Max,
        unit: "mL/kg/min",
        source: IntegrationSource.APPLE_HEALTH,
        recordedAt,
        isVerified: true,
      })
    }

    return metrics
  }
}
