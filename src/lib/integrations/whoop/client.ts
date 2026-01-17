import { prisma } from "@/lib/db/prisma"
import { IntegrationSource, ConnectionStatus, MetricCategory, MetricType } from "@prisma/client"
import { refreshAccessToken } from "./oauth"

// WHOOP API v2 base URL
const WHOOP_API_BASE = "https://api.prod.whoop.com/developer/v1"

// WHOOP client wrapper
export class WhoopClient {
  private accessToken: string | null = null

  // Initialize with OAuth tokens for a specific member
  async initializeWithTokens(memberId: string): Promise<boolean> {
    const connection = await prisma.integrationConnection.findFirst({
      where: {
        memberId,
        source: IntegrationSource.WHOOP,
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
      console.error("Error refreshing WHOOP token:", error)
      return false
    }
  }

  // Fetch recovery data
  async fetchRecoveryData(memberId: string, startDate: string, endDate: string): Promise<WhoopRecovery[] | null> {
    try {
      const isInitialized = await this.initializeWithTokens(memberId)
      if (!isInitialized) {
        console.log("WHOOP not initialized for member:", memberId)
        return null
      }

      const params = new URLSearchParams({
        start: `${startDate}T00:00:00.000Z`,
        end: `${endDate}T23:59:59.999Z`,
      })

      const response = await fetch(`${WHOOP_API_BASE}/recovery?${params}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      })

      if (!response.ok) {
        console.error("Failed to fetch WHOOP recovery data:", await response.text())
        return null
      }

      const data = await response.json()
      return data.records || []
    } catch (error) {
      console.error("Error fetching WHOOP recovery data:", error)
      return null
    }
  }

  // Fetch sleep data
  async fetchSleepData(memberId: string, startDate: string, endDate: string): Promise<WhoopSleep[] | null> {
    try {
      const isInitialized = await this.initializeWithTokens(memberId)
      if (!isInitialized) {
        return null
      }

      const params = new URLSearchParams({
        start: `${startDate}T00:00:00.000Z`,
        end: `${endDate}T23:59:59.999Z`,
      })

      const response = await fetch(`${WHOOP_API_BASE}/activity/sleep?${params}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      })

      if (!response.ok) {
        console.error("Failed to fetch WHOOP sleep data:", await response.text())
        return null
      }

      const data = await response.json()
      return data.records || []
    } catch (error) {
      console.error("Error fetching WHOOP sleep data:", error)
      return null
    }
  }

  // Fetch workout data
  async fetchWorkoutData(memberId: string, startDate: string, endDate: string): Promise<WhoopWorkout[] | null> {
    try {
      const isInitialized = await this.initializeWithTokens(memberId)
      if (!isInitialized) {
        return null
      }

      const params = new URLSearchParams({
        start: `${startDate}T00:00:00.000Z`,
        end: `${endDate}T23:59:59.999Z`,
      })

      const response = await fetch(`${WHOOP_API_BASE}/activity/workout?${params}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      })

      if (!response.ok) {
        console.error("Failed to fetch WHOOP workout data:", await response.text())
        return null
      }

      const data = await response.json()
      return data.records || []
    } catch (error) {
      console.error("Error fetching WHOOP workout data:", error)
      return null
    }
  }

  // Fetch cycle data (daily physiological cycles)
  async fetchCycleData(memberId: string, startDate: string, endDate: string): Promise<WhoopCycle[] | null> {
    try {
      const isInitialized = await this.initializeWithTokens(memberId)
      if (!isInitialized) {
        return null
      }

      const params = new URLSearchParams({
        start: `${startDate}T00:00:00.000Z`,
        end: `${endDate}T23:59:59.999Z`,
      })

      const response = await fetch(`${WHOOP_API_BASE}/cycle?${params}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      })

      if (!response.ok) {
        console.error("Failed to fetch WHOOP cycle data:", await response.text())
        return null
      }

      const data = await response.json()
      return data.records || []
    } catch (error) {
      console.error("Error fetching WHOOP cycle data:", error)
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
          source: IntegrationSource.WHOOP,
          status: ConnectionStatus.ACTIVE,
        },
      })

      if (!connection) {
        result.errors.push("No active WHOOP connection found")
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
      const [recoveryData, sleepData, workoutData] = await Promise.all([
        this.fetchRecoveryData(memberId, startDateStr, endDateStr),
        this.fetchSleepData(memberId, startDateStr, endDateStr),
        this.fetchWorkoutData(memberId, startDateStr, endDateStr),
      ])

      // Transform and store recovery metrics
      if (recoveryData) {
        for (const recovery of recoveryData) {
          const metrics = transformWhoopRecoveryToMetrics(memberId, recovery)
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

      // Transform and store sleep metrics
      if (sleepData) {
        for (const sleep of sleepData) {
          const metrics = transformWhoopSleepToMetrics(memberId, sleep)
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

      // Transform and store workout metrics
      if (workoutData) {
        for (const workout of workoutData) {
          const metrics = transformWhoopWorkoutToMetrics(memberId, workout)
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

// Types for WHOOP API v2 data
export interface WhoopRecovery {
  cycle_id: number
  sleep_id: number
  user_id: number
  created_at: string
  updated_at: string
  score_state: string
  score: {
    user_calibrating: boolean
    recovery_score: number // 0-100
    resting_heart_rate: number // bpm
    hrv_rmssd_milli: number // milliseconds
    spo2_percentage: number | null
    skin_temp_celsius: number | null
  }
}

export interface WhoopSleep {
  id: number
  user_id: number
  created_at: string
  updated_at: string
  start: string
  end: string
  timezone_offset: string
  nap: boolean
  score_state: string
  score: {
    stage_summary: {
      total_in_bed_time_milli: number
      total_awake_time_milli: number
      total_no_data_time_milli: number
      total_light_sleep_time_milli: number
      total_slow_wave_sleep_time_milli: number
      total_rem_sleep_time_milli: number
      sleep_cycle_count: number
      disturbance_count: number
    }
    sleep_needed: {
      baseline_milli: number
      need_from_sleep_debt_milli: number
      need_from_recent_strain_milli: number
      need_from_recent_nap_milli: number
    }
    respiratory_rate: number | null
    sleep_performance_percentage: number | null
    sleep_consistency_percentage: number | null
    sleep_efficiency_percentage: number | null
  }
}

export interface WhoopWorkout {
  id: number
  user_id: number
  created_at: string
  updated_at: string
  start: string
  end: string
  timezone_offset: string
  sport_id: number
  score_state: string
  score: {
    strain: number // 0-21 scale
    average_heart_rate: number
    max_heart_rate: number
    kilojoule: number
    percent_recorded: number
    distance_meter: number | null
    altitude_gain_meter: number | null
    altitude_change_meter: number | null
    zone_duration: {
      zone_zero_milli: number
      zone_one_milli: number
      zone_two_milli: number
      zone_three_milli: number
      zone_four_milli: number
      zone_five_milli: number
    }
  }
}

export interface WhoopCycle {
  id: number
  user_id: number
  created_at: string
  updated_at: string
  start: string
  end: string | null
  timezone_offset: string
  score_state: string
  score: {
    strain: number
    kilojoule: number
    average_heart_rate: number
    max_heart_rate: number
  }
}

export interface SyncResult {
  success: boolean
  metricsUpdated: number
  errors: string[]
}

// Transform WHOOP recovery data to our metric format
export function transformWhoopRecoveryToMetrics(memberId: string, recovery: WhoopRecovery) {
  const metrics = []
  const recordedAt = new Date(recovery.created_at)

  // Resting Heart Rate
  if (recovery.score.resting_heart_rate > 0) {
    metrics.push({
      memberId,
      category: MetricCategory.HEART,
      metricType: MetricType.RESTING_HEART_RATE,
      value: recovery.score.resting_heart_rate,
      unit: "bpm",
      source: IntegrationSource.WHOOP,
      sourceRecordId: recovery.cycle_id.toString(),
      recordedAt,
      isVerified: true,
    })
  }

  // HRV (RMSSD in milliseconds)
  if (recovery.score.hrv_rmssd_milli > 0) {
    metrics.push({
      memberId,
      category: MetricCategory.HEART,
      metricType: MetricType.HEART_RATE_VARIABILITY,
      value: recovery.score.hrv_rmssd_milli,
      unit: "ms",
      source: IntegrationSource.WHOOP,
      sourceRecordId: recovery.cycle_id.toString(),
      recordedAt,
      isVerified: true,
    })
  }

  return metrics
}

// Transform WHOOP sleep data to our metric format
export function transformWhoopSleepToMetrics(memberId: string, sleep: WhoopSleep) {
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
  const recordedAt = new Date(sleep.start)

  // Skip naps for main sleep metrics
  if (sleep.nap) {
    return metrics
  }

  const stageSummary = sleep.score.stage_summary

  // Total sleep duration (in hours)
  const totalSleepMilli =
    stageSummary.total_light_sleep_time_milli +
    stageSummary.total_slow_wave_sleep_time_milli +
    stageSummary.total_rem_sleep_time_milli

  if (totalSleepMilli > 0) {
    metrics.push({
      memberId,
      category: MetricCategory.SLEEP,
      metricType: MetricType.SLEEP_DURATION,
      value: totalSleepMilli / 3600000, // Convert to hours
      unit: "hours",
      source: IntegrationSource.WHOOP,
      sourceRecordId: sleep.id.toString(),
      recordedAt,
      isVerified: true,
    })
  }

  // Deep sleep (slow wave sleep) in minutes
  if (stageSummary.total_slow_wave_sleep_time_milli > 0) {
    metrics.push({
      memberId,
      category: MetricCategory.SLEEP,
      metricType: MetricType.DEEP_SLEEP_MINUTES,
      value: Math.round(stageSummary.total_slow_wave_sleep_time_milli / 60000),
      unit: "minutes",
      source: IntegrationSource.WHOOP,
      sourceRecordId: sleep.id.toString(),
      recordedAt,
      isVerified: true,
    })
  }

  // REM sleep in minutes
  if (stageSummary.total_rem_sleep_time_milli > 0) {
    metrics.push({
      memberId,
      category: MetricCategory.SLEEP,
      metricType: MetricType.REM_SLEEP_MINUTES,
      value: Math.round(stageSummary.total_rem_sleep_time_milli / 60000),
      unit: "minutes",
      source: IntegrationSource.WHOOP,
      sourceRecordId: sleep.id.toString(),
      recordedAt,
      isVerified: true,
    })
  }

  // Light sleep in minutes
  if (stageSummary.total_light_sleep_time_milli > 0) {
    metrics.push({
      memberId,
      category: MetricCategory.SLEEP,
      metricType: MetricType.LIGHT_SLEEP_MINUTES,
      value: Math.round(stageSummary.total_light_sleep_time_milli / 60000),
      unit: "minutes",
      source: IntegrationSource.WHOOP,
      sourceRecordId: sleep.id.toString(),
      recordedAt,
      isVerified: true,
    })
  }

  // Awake time in minutes
  if (stageSummary.total_awake_time_milli > 0) {
    metrics.push({
      memberId,
      category: MetricCategory.SLEEP,
      metricType: MetricType.AWAKE_MINUTES,
      value: Math.round(stageSummary.total_awake_time_milli / 60000),
      unit: "minutes",
      source: IntegrationSource.WHOOP,
      sourceRecordId: sleep.id.toString(),
      recordedAt,
      isVerified: true,
    })
  }

  // Sleep score (performance percentage)
  if (sleep.score.sleep_performance_percentage !== null) {
    metrics.push({
      memberId,
      category: MetricCategory.SLEEP,
      metricType: MetricType.SLEEP_SCORE,
      value: sleep.score.sleep_performance_percentage,
      unit: "percent",
      source: IntegrationSource.WHOOP,
      sourceRecordId: sleep.id.toString(),
      recordedAt,
      isVerified: true,
    })
  }

  return metrics
}

// Transform WHOOP workout data to our metric format
export function transformWhoopWorkoutToMetrics(memberId: string, workout: WhoopWorkout) {
  const metrics = []
  const recordedAt = new Date(workout.start)

  // Calories (kilojoules to kcal: 1 kJ = 0.239 kcal)
  if (workout.score.kilojoule > 0) {
    metrics.push({
      memberId,
      category: MetricCategory.ACTIVITY,
      metricType: MetricType.CALORIES_BURNED,
      value: Math.round(workout.score.kilojoule * 0.239),
      unit: "kcal",
      source: IntegrationSource.WHOOP,
      sourceRecordId: workout.id.toString(),
      recordedAt,
      isVerified: true,
    })
  }

  // Active minutes (total time in zones 1-5)
  const zoneDuration = workout.score.zone_duration
  const activeTimeMilli =
    zoneDuration.zone_one_milli +
    zoneDuration.zone_two_milli +
    zoneDuration.zone_three_milli +
    zoneDuration.zone_four_milli +
    zoneDuration.zone_five_milli

  if (activeTimeMilli > 0) {
    metrics.push({
      memberId,
      category: MetricCategory.ACTIVITY,
      metricType: MetricType.ACTIVE_MINUTES,
      value: Math.round(activeTimeMilli / 60000),
      unit: "minutes",
      source: IntegrationSource.WHOOP,
      sourceRecordId: workout.id.toString(),
      recordedAt,
      isVerified: true,
    })
  }

  // Average Heart Rate
  if (workout.score.average_heart_rate > 0) {
    metrics.push({
      memberId,
      category: MetricCategory.HEART,
      metricType: MetricType.RESTING_HEART_RATE, // Using as activity HR
      value: workout.score.average_heart_rate,
      unit: "bpm",
      source: IntegrationSource.WHOOP,
      sourceRecordId: workout.id.toString(),
      recordedAt,
      isVerified: true,
    })
  }

  // Max Heart Rate
  if (workout.score.max_heart_rate > 0) {
    metrics.push({
      memberId,
      category: MetricCategory.HEART,
      metricType: MetricType.MAX_HEART_RATE,
      value: workout.score.max_heart_rate,
      unit: "bpm",
      source: IntegrationSource.WHOOP,
      sourceRecordId: workout.id.toString(),
      recordedAt,
      isVerified: true,
    })
  }

  // Distance (if available)
  if (workout.score.distance_meter && workout.score.distance_meter > 0) {
    metrics.push({
      memberId,
      category: MetricCategory.ACTIVITY,
      metricType: MetricType.DISTANCE,
      value: workout.score.distance_meter / 1609.344, // meters to miles
      unit: "mi",
      source: IntegrationSource.WHOOP,
      sourceRecordId: workout.id.toString(),
      recordedAt,
      isVerified: true,
    })
  }

  return metrics
}

// Singleton instance
let whoopClient: WhoopClient | null = null

export function getWhoopClient(): WhoopClient {
  if (!whoopClient) {
    whoopClient = new WhoopClient()
  }
  return whoopClient
}
