import { prisma } from "@/lib/db/prisma"
import { IntegrationSource, ConnectionStatus, MetricCategory, MetricType } from "@prisma/client"
import { refreshAccessToken } from "./oauth"

// Fitbit API base URL
const FITBIT_API_BASE = "https://api.fitbit.com"

// Fitbit client wrapper
export class FitbitClient {
  private accessToken: string | null = null
  private userId: string | null = null

  // Initialize with OAuth tokens for a specific member
  async initializeWithTokens(memberId: string): Promise<boolean> {
    const connection = await prisma.integrationConnection.findFirst({
      where: {
        memberId,
        source: IntegrationSource.FITBIT,
        status: ConnectionStatus.ACTIVE,
      },
    })

    if (!connection || !connection.accessToken) {
      return false
    }

    // Check if token needs refresh
    if (connection.tokenExpiresAt && connection.tokenExpiresAt < new Date()) {
      const refreshed = await this.refreshAccessToken(connection.id, connection.refreshToken!)
      if (!refreshed) {
        return false
      }
    } else {
      this.accessToken = connection.accessToken
    }

    return true
  }

  // Refresh the access token
  async refreshAccessToken(connectionId: string, refreshToken: string): Promise<boolean> {
    try {
      const tokenResponse = await refreshAccessToken(refreshToken)

      // Update stored tokens
      const tokenExpiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000)
      await prisma.integrationConnection.update({
        where: { id: connectionId },
        data: {
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          tokenExpiresAt,
        },
      })

      this.accessToken = tokenResponse.access_token
      this.userId = tokenResponse.user_id
      return true
    } catch (error) {
      console.error("Error refreshing Fitbit token:", error)
      return false
    }
  }

  // Fetch activity summary for a date range
  async fetchActivitySummary(memberId: string, date: string): Promise<FitbitActivitySummary | null> {
    try {
      const isInitialized = await this.initializeWithTokens(memberId)
      if (!isInitialized) {
        console.log("Fitbit not initialized for member:", memberId)
        return null
      }

      // Fitbit uses "-" for the current user
      const response = await fetch(
        `${FITBIT_API_BASE}/1/user/-/activities/date/${date}.json`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      )

      if (!response.ok) {
        console.error("Failed to fetch Fitbit activity data:", await response.text())
        return null
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching Fitbit activity data:", error)
      return null
    }
  }

  // Fetch sleep data for a date
  async fetchSleepData(memberId: string, date: string): Promise<FitbitSleepResponse | null> {
    try {
      const isInitialized = await this.initializeWithTokens(memberId)
      if (!isInitialized) {
        return null
      }

      const response = await fetch(
        `${FITBIT_API_BASE}/1.2/user/-/sleep/date/${date}.json`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      )

      if (!response.ok) {
        console.error("Failed to fetch Fitbit sleep data:", await response.text())
        return null
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching Fitbit sleep data:", error)
      return null
    }
  }

  // Fetch heart rate data for a date
  async fetchHeartRateData(memberId: string, date: string): Promise<FitbitHeartRateResponse | null> {
    try {
      const isInitialized = await this.initializeWithTokens(memberId)
      if (!isInitialized) {
        return null
      }

      const response = await fetch(
        `${FITBIT_API_BASE}/1/user/-/activities/heart/date/${date}/1d.json`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      )

      if (!response.ok) {
        console.error("Failed to fetch Fitbit heart rate data:", await response.text())
        return null
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching Fitbit heart rate data:", error)
      return null
    }
  }

  // Fetch body weight data
  async fetchWeightData(memberId: string, startDate: string, endDate: string): Promise<FitbitWeightResponse | null> {
    try {
      const isInitialized = await this.initializeWithTokens(memberId)
      if (!isInitialized) {
        return null
      }

      const response = await fetch(
        `${FITBIT_API_BASE}/1/user/-/body/log/weight/date/${startDate}/${endDate}.json`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      )

      if (!response.ok) {
        console.error("Failed to fetch Fitbit weight data:", await response.text())
        return null
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching Fitbit weight data:", error)
      return null
    }
  }

  // Sync all health data for a member
  async syncHealthData(memberId: string, daysBack: number = 7): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      metricsUpdated: 0,
      errors: [],
    }

    try {
      const connection = await prisma.integrationConnection.findFirst({
        where: {
          memberId,
          source: IntegrationSource.FITBIT,
          status: ConnectionStatus.ACTIVE,
        },
      })

      if (!connection) {
        result.errors.push("No active Fitbit connection found")
        return result
      }

      // Update last sync timestamp
      await prisma.integrationConnection.update({
        where: { id: connection.id },
        data: {
          lastSyncAt: new Date(),
          lastSyncStatus: "IN_PROGRESS",
        },
      })

      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysBack)

      const startDateStr = startDate.toISOString().split("T")[0]
      const endDateStr = endDate.toISOString().split("T")[0]

      // Fetch data for each day in the range
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0]

        // Fetch all data types for this day in parallel
        const [activityData, sleepData, heartRateData] = await Promise.all([
          this.fetchActivitySummary(memberId, dateStr),
          this.fetchSleepData(memberId, dateStr),
          this.fetchHeartRateData(memberId, dateStr),
        ])

        const recordedAt = new Date(dateStr)

        // Transform and store activity metrics
        if (activityData) {
          const metrics = transformFitbitActivityToMetrics(memberId, activityData, recordedAt)
          for (const metric of metrics) {
            await prisma.biometricMetric.upsert({
              where: {
                id: `${memberId}-${metric.metricType}-${metric.recordedAt.toISOString()}`,
              },
              create: {
                ...metric,
                id: `${memberId}-${metric.metricType}-${metric.recordedAt.toISOString()}`,
              },
              update: {
                value: metric.value,
              },
            })
            result.metricsUpdated++
          }
        }

        // Transform and store sleep metrics
        if (sleepData && sleepData.sleep && sleepData.sleep.length > 0) {
          const metrics = transformFitbitSleepToMetrics(memberId, sleepData, recordedAt)
          for (const metric of metrics) {
            await prisma.biometricMetric.upsert({
              where: {
                id: `${memberId}-${metric.metricType}-${metric.recordedAt.toISOString()}`,
              },
              create: {
                ...metric,
                id: `${memberId}-${metric.metricType}-${metric.recordedAt.toISOString()}`,
              },
              update: {
                value: metric.value,
              },
            })
            result.metricsUpdated++
          }
        }

        // Transform and store heart rate metrics
        if (heartRateData) {
          const metrics = transformFitbitHeartRateToMetrics(memberId, heartRateData, recordedAt)
          for (const metric of metrics) {
            await prisma.biometricMetric.upsert({
              where: {
                id: `${memberId}-${metric.metricType}-${metric.recordedAt.toISOString()}`,
              },
              create: {
                ...metric,
                id: `${memberId}-${metric.metricType}-${metric.recordedAt.toISOString()}`,
              },
              update: {
                value: metric.value,
              },
            })
            result.metricsUpdated++
          }
        }
      }

      // Fetch weight data for the entire period
      const weightData = await this.fetchWeightData(memberId, startDateStr, endDateStr)
      if (weightData && weightData.weight && weightData.weight.length > 0) {
        for (const weight of weightData.weight) {
          const metrics = transformFitbitWeightToMetrics(memberId, weight)
          for (const metric of metrics) {
            await prisma.biometricMetric.upsert({
              where: {
                id: `${memberId}-${metric.metricType}-${metric.recordedAt.toISOString()}`,
              },
              create: {
                ...metric,
                id: `${memberId}-${metric.metricType}-${metric.recordedAt.toISOString()}`,
              },
              update: {
                value: metric.value,
              },
            })
            result.metricsUpdated++
          }
        }
      }

      await prisma.integrationConnection.update({
        where: { id: connection.id },
        data: { lastSyncStatus: "SUCCESS" },
      })

      result.success = true
      return result
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : "Unknown error")
      return result
    }
  }
}

// Types for Fitbit API data
export interface FitbitActivitySummary {
  activities: FitbitActivity[]
  goals: {
    activeMinutes: number
    caloriesOut: number
    distance: number
    floors: number
    steps: number
  }
  summary: {
    activeScore: number
    activityCalories: number
    caloriesBMR: number
    caloriesOut: number
    distances: { activity: string; distance: number }[]
    elevation: number
    fairlyActiveMinutes: number
    floors: number
    lightlyActiveMinutes: number
    marginalCalories: number
    sedentaryMinutes: number
    steps: number
    veryActiveMinutes: number
  }
}

export interface FitbitActivity {
  activityId: number
  activityParentId: number
  activityParentName: string
  calories: number
  description: string
  distance: number
  duration: number
  hasActiveZoneMinutes: boolean
  hasStartTime: boolean
  isFavorite: boolean
  lastModified: string
  logId: number
  name: string
  startDate: string
  startTime: string
  steps: number
}

export interface FitbitSleepResponse {
  sleep: FitbitSleepLog[]
  summary: {
    stages?: {
      deep: number
      light: number
      rem: number
      wake: number
    }
    totalMinutesAsleep: number
    totalSleepRecords: number
    totalTimeInBed: number
  }
}

export interface FitbitSleepLog {
  dateOfSleep: string
  duration: number // milliseconds
  efficiency: number // percentage
  endTime: string
  infoCode: number
  isMainSleep: boolean
  levels: {
    data: { dateTime: string; level: string; seconds: number }[]
    summary: {
      deep?: { count: number; minutes: number; thirtyDayAvgMinutes: number }
      light?: { count: number; minutes: number; thirtyDayAvgMinutes: number }
      rem?: { count: number; minutes: number; thirtyDayAvgMinutes: number }
      wake?: { count: number; minutes: number; thirtyDayAvgMinutes: number }
      asleep?: { count: number; minutes: number }
      awake?: { count: number; minutes: number }
      restless?: { count: number; minutes: number }
    }
  }
  logId: number
  minutesAfterWakeup: number
  minutesAsleep: number
  minutesAwake: number
  minutesToFallAsleep: number
  startTime: string
  timeInBed: number
  type: string
}

export interface FitbitHeartRateResponse {
  "activities-heart": {
    dateTime: string
    value: {
      customHeartRateZones: { caloriesOut: number; max: number; min: number; minutes: number; name: string }[]
      heartRateZones: { caloriesOut: number; max: number; min: number; minutes: number; name: string }[]
      restingHeartRate?: number
    }
  }[]
}

export interface FitbitWeightResponse {
  weight: FitbitWeightLog[]
}

export interface FitbitWeightLog {
  bmi: number
  date: string
  fat?: number
  logId: number
  source: string
  time: string
  weight: number // kg or lbs depending on user settings
}

export interface SyncResult {
  success: boolean
  metricsUpdated: number
  errors: string[]
}

// Transform Fitbit activity data to our metric format
export function transformFitbitActivityToMetrics(
  memberId: string,
  activityData: FitbitActivitySummary,
  recordedAt: Date
) {
  const metrics = []
  const summary = activityData.summary

  // Steps
  if (summary.steps > 0) {
    metrics.push({
      memberId,
      category: MetricCategory.ACTIVITY,
      metricType: MetricType.STEPS,
      value: summary.steps,
      unit: "steps",
      source: IntegrationSource.FITBIT,
      sourceRecordId: `activity-${recordedAt.toISOString().split("T")[0]}`,
      recordedAt,
      isVerified: true,
    })
  }

  // Calories
  if (summary.activityCalories > 0) {
    metrics.push({
      memberId,
      category: MetricCategory.ACTIVITY,
      metricType: MetricType.CALORIES_BURNED,
      value: summary.activityCalories,
      unit: "kcal",
      source: IntegrationSource.FITBIT,
      sourceRecordId: `activity-${recordedAt.toISOString().split("T")[0]}`,
      recordedAt,
      isVerified: true,
    })
  }

  // Active Minutes (fairly + very active)
  const activeMinutes = summary.fairlyActiveMinutes + summary.veryActiveMinutes
  if (activeMinutes > 0) {
    metrics.push({
      memberId,
      category: MetricCategory.ACTIVITY,
      metricType: MetricType.ACTIVE_MINUTES,
      value: activeMinutes,
      unit: "minutes",
      source: IntegrationSource.FITBIT,
      sourceRecordId: `activity-${recordedAt.toISOString().split("T")[0]}`,
      recordedAt,
      isVerified: true,
    })
  }

  // Floors
  if (summary.floors > 0) {
    metrics.push({
      memberId,
      category: MetricCategory.ACTIVITY,
      metricType: MetricType.FLOORS_CLIMBED,
      value: summary.floors,
      unit: "floors",
      source: IntegrationSource.FITBIT,
      sourceRecordId: `activity-${recordedAt.toISOString().split("T")[0]}`,
      recordedAt,
      isVerified: true,
    })
  }

  // Distance (from total distance)
  const totalDistance = summary.distances.find((d) => d.activity === "total")
  if (totalDistance && totalDistance.distance > 0) {
    metrics.push({
      memberId,
      category: MetricCategory.ACTIVITY,
      metricType: MetricType.DISTANCE,
      value: totalDistance.distance, // Already in miles (user preference)
      unit: "mi",
      source: IntegrationSource.FITBIT,
      sourceRecordId: `activity-${recordedAt.toISOString().split("T")[0]}`,
      recordedAt,
      isVerified: true,
    })
  }

  return metrics
}

// Transform Fitbit sleep data to our metric format
export function transformFitbitSleepToMetrics(
  memberId: string,
  sleepData: FitbitSleepResponse,
  recordedAt: Date
) {
  const metrics: Array<{
    memberId: string
    category: MetricCategory
    metricType: MetricType
    value: number
    unit: string
    source: IntegrationSource
    sourceRecordId: string
    recordedAt: Date
    isVerified: boolean
  }> = []

  // Get main sleep log
  const mainSleep = sleepData.sleep.find((s) => s.isMainSleep)
  if (!mainSleep) {
    return metrics
  }

  // Sleep duration (in hours)
  if (mainSleep.minutesAsleep > 0) {
    metrics.push({
      memberId,
      category: MetricCategory.SLEEP,
      metricType: MetricType.SLEEP_DURATION,
      value: mainSleep.minutesAsleep / 60,
      unit: "hours",
      source: IntegrationSource.FITBIT,
      sourceRecordId: mainSleep.logId.toString(),
      recordedAt,
      isVerified: true,
    })
  }

  // Sleep efficiency as score
  if (mainSleep.efficiency > 0) {
    metrics.push({
      memberId,
      category: MetricCategory.SLEEP,
      metricType: MetricType.SLEEP_SCORE,
      value: mainSleep.efficiency,
      unit: "percent",
      source: IntegrationSource.FITBIT,
      sourceRecordId: mainSleep.logId.toString(),
      recordedAt,
      isVerified: true,
    })
  }

  // Sleep stages (if available - newer Fitbit devices)
  const stages = mainSleep.levels.summary
  if (stages.deep) {
    metrics.push({
      memberId,
      category: MetricCategory.SLEEP,
      metricType: MetricType.DEEP_SLEEP_MINUTES,
      value: stages.deep.minutes,
      unit: "minutes",
      source: IntegrationSource.FITBIT,
      sourceRecordId: mainSleep.logId.toString(),
      recordedAt,
      isVerified: true,
    })
  }

  if (stages.rem) {
    metrics.push({
      memberId,
      category: MetricCategory.SLEEP,
      metricType: MetricType.REM_SLEEP_MINUTES,
      value: stages.rem.minutes,
      unit: "minutes",
      source: IntegrationSource.FITBIT,
      sourceRecordId: mainSleep.logId.toString(),
      recordedAt,
      isVerified: true,
    })
  }

  if (stages.light) {
    metrics.push({
      memberId,
      category: MetricCategory.SLEEP,
      metricType: MetricType.LIGHT_SLEEP_MINUTES,
      value: stages.light.minutes,
      unit: "minutes",
      source: IntegrationSource.FITBIT,
      sourceRecordId: mainSleep.logId.toString(),
      recordedAt,
      isVerified: true,
    })
  }

  if (stages.wake) {
    metrics.push({
      memberId,
      category: MetricCategory.SLEEP,
      metricType: MetricType.AWAKE_MINUTES,
      value: stages.wake.minutes,
      unit: "minutes",
      source: IntegrationSource.FITBIT,
      sourceRecordId: mainSleep.logId.toString(),
      recordedAt,
      isVerified: true,
    })
  }

  return metrics
}

// Transform Fitbit heart rate data to our metric format
export function transformFitbitHeartRateToMetrics(
  memberId: string,
  heartRateData: FitbitHeartRateResponse,
  recordedAt: Date
) {
  const metrics = []

  if (heartRateData["activities-heart"] && heartRateData["activities-heart"].length > 0) {
    const hrData = heartRateData["activities-heart"][0]

    // Resting Heart Rate
    if (hrData.value.restingHeartRate) {
      metrics.push({
        memberId,
        category: MetricCategory.HEART,
        metricType: MetricType.RESTING_HEART_RATE,
        value: hrData.value.restingHeartRate,
        unit: "bpm",
        source: IntegrationSource.FITBIT,
        sourceRecordId: `hr-${recordedAt.toISOString().split("T")[0]}`,
        recordedAt,
        isVerified: true,
      })
    }
  }

  return metrics
}

// Transform Fitbit weight data to our metric format
export function transformFitbitWeightToMetrics(memberId: string, weight: FitbitWeightLog) {
  const metrics = []
  const recordedAt = new Date(`${weight.date}T${weight.time}`)

  // Weight (assuming kg, convert to lbs if needed)
  if (weight.weight > 0) {
    metrics.push({
      memberId,
      category: MetricCategory.BODY,
      metricType: MetricType.WEIGHT,
      value: weight.weight * 2.20462, // kg to lbs
      unit: "lbs",
      source: IntegrationSource.FITBIT,
      sourceRecordId: weight.logId.toString(),
      recordedAt,
      isVerified: true,
    })
  }

  // BMI
  if (weight.bmi > 0) {
    metrics.push({
      memberId,
      category: MetricCategory.BODY,
      metricType: MetricType.BMI,
      value: weight.bmi,
      unit: "kg/m2",
      source: IntegrationSource.FITBIT,
      sourceRecordId: weight.logId.toString(),
      recordedAt,
      isVerified: true,
    })
  }

  // Body Fat Percentage
  if (weight.fat && weight.fat > 0) {
    metrics.push({
      memberId,
      category: MetricCategory.BODY,
      metricType: MetricType.BODY_FAT_PERCENTAGE,
      value: weight.fat,
      unit: "percent",
      source: IntegrationSource.FITBIT,
      sourceRecordId: weight.logId.toString(),
      recordedAt,
      isVerified: true,
    })
  }

  return metrics
}

// Singleton instance
let fitbitClient: FitbitClient | null = null

export function getFitbitClient(): FitbitClient {
  if (!fitbitClient) {
    fitbitClient = new FitbitClient()
  }
  return fitbitClient
}
