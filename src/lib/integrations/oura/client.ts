import { prisma } from "@/lib/db/prisma"
import { IntegrationSource, ConnectionStatus, MetricCategory, MetricType } from "@prisma/client"
import { refreshAccessToken } from "./oauth"

// Oura API v2 base URL
const OURA_API_BASE = "https://api.ouraring.com/v2/usercollection"

// Oura client wrapper
export class OuraClient {
  private accessToken: string | null = null

  // Initialize with OAuth tokens for a specific member
  async initializeWithTokens(memberId: string): Promise<boolean> {
    const connection = await prisma.integrationConnection.findFirst({
      where: {
        memberId,
        source: IntegrationSource.OURA,
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
      return true
    } catch (error) {
      console.error("Error refreshing Oura token:", error)
      return false
    }
  }

  // Fetch daily sleep data
  async fetchSleepData(memberId: string, startDate: string, endDate: string): Promise<OuraSleepData[] | null> {
    try {
      const isInitialized = await this.initializeWithTokens(memberId)
      if (!isInitialized) {
        console.log("Oura not initialized for member:", memberId)
        return null
      }

      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
      })

      const response = await fetch(`${OURA_API_BASE}/daily_sleep?${params}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      })

      if (!response.ok) {
        console.error("Failed to fetch Oura sleep data:", await response.text())
        return null
      }

      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error("Error fetching Oura sleep data:", error)
      return null
    }
  }

  // Fetch daily activity data
  async fetchActivityData(memberId: string, startDate: string, endDate: string): Promise<OuraActivityData[] | null> {
    try {
      const isInitialized = await this.initializeWithTokens(memberId)
      if (!isInitialized) {
        return null
      }

      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
      })

      const response = await fetch(`${OURA_API_BASE}/daily_activity?${params}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      })

      if (!response.ok) {
        console.error("Failed to fetch Oura activity data:", await response.text())
        return null
      }

      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error("Error fetching Oura activity data:", error)
      return null
    }
  }

  // Fetch daily readiness data
  async fetchReadinessData(memberId: string, startDate: string, endDate: string): Promise<OuraReadinessData[] | null> {
    try {
      const isInitialized = await this.initializeWithTokens(memberId)
      if (!isInitialized) {
        return null
      }

      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
      })

      const response = await fetch(`${OURA_API_BASE}/daily_readiness?${params}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      })

      if (!response.ok) {
        console.error("Failed to fetch Oura readiness data:", await response.text())
        return null
      }

      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error("Error fetching Oura readiness data:", error)
      return null
    }
  }

  // Fetch heart rate data
  async fetchHeartRateData(memberId: string, startDate: string, endDate: string): Promise<OuraHeartRateData[] | null> {
    try {
      const isInitialized = await this.initializeWithTokens(memberId)
      if (!isInitialized) {
        return null
      }

      const params = new URLSearchParams({
        start_datetime: `${startDate}T00:00:00+00:00`,
        end_datetime: `${endDate}T23:59:59+00:00`,
      })

      const response = await fetch(`${OURA_API_BASE}/heartrate?${params}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      })

      if (!response.ok) {
        console.error("Failed to fetch Oura heart rate data:", await response.text())
        return null
      }

      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error("Error fetching Oura heart rate data:", error)
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
          source: IntegrationSource.OURA,
          status: ConnectionStatus.ACTIVE,
        },
      })

      if (!connection) {
        result.errors.push("No active Oura connection found")
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

      // Fetch all data types in parallel
      const [sleepData, activityData, readinessData] = await Promise.all([
        this.fetchSleepData(memberId, startDateStr, endDateStr),
        this.fetchActivityData(memberId, startDateStr, endDateStr),
        this.fetchReadinessData(memberId, startDateStr, endDateStr),
      ])

      // Transform and store sleep metrics
      if (sleepData) {
        for (const sleep of sleepData) {
          const metrics = transformOuraSleepToMetrics(memberId, sleep)
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

      // Transform and store activity metrics
      if (activityData) {
        for (const activity of activityData) {
          const metrics = transformOuraActivityToMetrics(memberId, activity)
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

      // Transform and store readiness metrics (contains HRV data)
      if (readinessData) {
        for (const readiness of readinessData) {
          const metrics = transformOuraReadinessToMetrics(memberId, readiness)
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

// Types for Oura API v2 data
export interface OuraSleepData {
  id: string
  day: string // YYYY-MM-DD
  score: number | null
  contributors: {
    deep_sleep: number | null
    efficiency: number | null
    latency: number | null
    rem_sleep: number | null
    restfulness: number | null
    timing: number | null
    total_sleep: number | null
  }
  timestamp: string
}

export interface OuraActivityData {
  id: string
  day: string // YYYY-MM-DD
  score: number | null
  active_calories: number
  steps: number
  equivalent_walking_distance: number // meters
  high_activity_time: number // seconds
  medium_activity_time: number // seconds
  low_activity_time: number // seconds
  sedentary_time: number // seconds
  timestamp: string
}

export interface OuraReadinessData {
  id: string
  day: string // YYYY-MM-DD
  score: number | null
  contributors: {
    activity_balance: number | null
    body_temperature: number | null
    hrv_balance: number | null
    previous_day_activity: number | null
    previous_night: number | null
    recovery_index: number | null
    resting_heart_rate: number | null
    sleep_balance: number | null
  }
  timestamp: string
}

export interface OuraHeartRateData {
  bpm: number
  source: string
  timestamp: string
}

export interface SyncResult {
  success: boolean
  metricsUpdated: number
  errors: string[]
}

// Transform Oura sleep data to our metric format
export function transformOuraSleepToMetrics(memberId: string, sleep: OuraSleepData) {
  const metrics = []
  const recordedAt = new Date(sleep.day)

  // Sleep Score
  if (sleep.score !== null) {
    metrics.push({
      memberId,
      category: MetricCategory.SLEEP,
      metricType: MetricType.SLEEP_SCORE,
      value: sleep.score,
      unit: "score",
      source: IntegrationSource.OURA,
      sourceRecordId: sleep.id,
      recordedAt,
      isVerified: true,
    })
  }

  return metrics
}

// Transform Oura activity data to our metric format
export function transformOuraActivityToMetrics(memberId: string, activity: OuraActivityData) {
  const metrics = []
  const recordedAt = new Date(activity.day)

  // Steps
  if (activity.steps > 0) {
    metrics.push({
      memberId,
      category: MetricCategory.ACTIVITY,
      metricType: MetricType.STEPS,
      value: activity.steps,
      unit: "steps",
      source: IntegrationSource.OURA,
      sourceRecordId: activity.id,
      recordedAt,
      isVerified: true,
    })
  }

  // Active Calories
  if (activity.active_calories > 0) {
    metrics.push({
      memberId,
      category: MetricCategory.ACTIVITY,
      metricType: MetricType.CALORIES_BURNED,
      value: activity.active_calories,
      unit: "kcal",
      source: IntegrationSource.OURA,
      sourceRecordId: activity.id,
      recordedAt,
      isVerified: true,
    })
  }

  // Distance (convert meters to miles)
  if (activity.equivalent_walking_distance > 0) {
    metrics.push({
      memberId,
      category: MetricCategory.ACTIVITY,
      metricType: MetricType.DISTANCE,
      value: activity.equivalent_walking_distance / 1609.344,
      unit: "mi",
      source: IntegrationSource.OURA,
      sourceRecordId: activity.id,
      recordedAt,
      isVerified: true,
    })
  }

  // Active Minutes (high + medium activity time in minutes)
  const activeMinutes = Math.round((activity.high_activity_time + activity.medium_activity_time) / 60)
  if (activeMinutes > 0) {
    metrics.push({
      memberId,
      category: MetricCategory.ACTIVITY,
      metricType: MetricType.ACTIVE_MINUTES,
      value: activeMinutes,
      unit: "minutes",
      source: IntegrationSource.OURA,
      sourceRecordId: activity.id,
      recordedAt,
      isVerified: true,
    })
  }

  return metrics
}

// Transform Oura readiness data to our metric format
export function transformOuraReadinessToMetrics(memberId: string, readiness: OuraReadinessData) {
  const metrics = []
  const recordedAt = new Date(readiness.day)

  // Resting Heart Rate (from contributors)
  if (readiness.contributors.resting_heart_rate !== null) {
    // Note: Oura readiness contributors are scores, not actual values
    // For actual resting HR, we'd need to fetch sleep periods data
    // For now, we'll skip this as it's a score, not actual BPM
  }

  // HRV Balance (score-based, useful for trend tracking)
  if (readiness.contributors.hrv_balance !== null) {
    metrics.push({
      memberId,
      category: MetricCategory.HEART,
      metricType: MetricType.HEART_RATE_VARIABILITY,
      value: readiness.contributors.hrv_balance,
      unit: "score",
      source: IntegrationSource.OURA,
      sourceRecordId: readiness.id,
      recordedAt,
      isVerified: true,
    })
  }

  return metrics
}

// Singleton instance
let ouraClient: OuraClient | null = null

export function getOuraClient(): OuraClient {
  if (!ouraClient) {
    ouraClient = new OuraClient()
  }
  return ouraClient
}
