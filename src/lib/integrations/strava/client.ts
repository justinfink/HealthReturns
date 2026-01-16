import { prisma } from "@/lib/db/prisma"
import { IntegrationSource, ConnectionStatus, MetricCategory, MetricType } from "@prisma/client"

// Strava API base URL
const STRAVA_API_BASE = "https://www.strava.com/api/v3"

// Strava client wrapper
export class StravaClient {
  private accessToken: string | null = null

  // Initialize with OAuth tokens for a specific member
  async initializeWithTokens(memberId: string): Promise<boolean> {
    const connection = await prisma.integrationConnection.findFirst({
      where: {
        memberId,
        source: IntegrationSource.STRAVA,
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
      const response = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: process.env.STRAVA_CLIENT_ID,
          client_secret: process.env.STRAVA_CLIENT_SECRET,
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      })

      if (!response.ok) {
        console.error("Failed to refresh Strava token:", await response.text())
        return false
      }

      const data = await response.json()

      // Update stored tokens
      await prisma.integrationConnection.update({
        where: { id: connectionId },
        data: {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          tokenExpiresAt: new Date(data.expires_at * 1000),
        },
      })

      this.accessToken = data.access_token
      return true
    } catch (error) {
      console.error("Error refreshing Strava token:", error)
      return false
    }
  }

  // Fetch athlete activities
  async fetchActivities(
    memberId: string,
    after?: Date,
    page: number = 1,
    perPage: number = 30
  ): Promise<StravaActivity[] | null> {
    try {
      const isInitialized = await this.initializeWithTokens(memberId)
      if (!isInitialized) {
        console.log("Strava not initialized for member:", memberId)
        return null
      }

      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
      })

      if (after) {
        params.append("after", Math.floor(after.getTime() / 1000).toString())
      }

      const response = await fetch(`${STRAVA_API_BASE}/athlete/activities?${params}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      })

      if (!response.ok) {
        console.error("Failed to fetch Strava activities:", await response.text())
        return null
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching Strava activities:", error)
      return null
    }
  }

  // Fetch athlete stats
  async fetchAthleteStats(memberId: string): Promise<StravaAthleteStats | null> {
    try {
      const isInitialized = await this.initializeWithTokens(memberId)
      if (!isInitialized) {
        return null
      }

      // First get athlete ID
      const athleteResponse = await fetch(`${STRAVA_API_BASE}/athlete`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      })

      if (!athleteResponse.ok) {
        return null
      }

      const athlete = await athleteResponse.json()

      // Then get stats
      const statsResponse = await fetch(`${STRAVA_API_BASE}/athletes/${athlete.id}/stats`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      })

      if (!statsResponse.ok) {
        return null
      }

      return await statsResponse.json()
    } catch (error) {
      console.error("Error fetching Strava stats:", error)
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
          source: IntegrationSource.STRAVA,
          status: ConnectionStatus.ACTIVE,
        },
      })

      if (!connection) {
        result.errors.push("No active Strava connection found")
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

      // Fetch activities from the last N days
      const afterDate = new Date()
      afterDate.setDate(afterDate.getDate() - daysBack)

      const activities = await this.fetchActivities(memberId, afterDate)

      if (!activities) {
        result.errors.push("Failed to fetch activities")
        await prisma.integrationConnection.update({
          where: { id: connection.id },
          data: { lastSyncStatus: "FAILED" },
        })
        return result
      }

      // Transform and store metrics
      for (const activity of activities) {
        const metrics = transformStravaActivityToMetrics(memberId, activity)

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

// Types for Strava data
export interface StravaActivity {
  id: number
  name: string
  type: string
  sport_type: string
  start_date: string
  start_date_local: string
  distance: number // meters
  moving_time: number // seconds
  elapsed_time: number // seconds
  total_elevation_gain: number // meters
  average_speed: number // m/s
  max_speed: number // m/s
  average_heartrate?: number // bpm
  max_heartrate?: number // bpm
  kilojoules?: number // for rides
  calories?: number
  suffer_score?: number
}

export interface StravaAthleteStats {
  recent_run_totals: StravaTotals
  recent_ride_totals: StravaTotals
  recent_swim_totals: StravaTotals
  all_run_totals: StravaTotals
  all_ride_totals: StravaTotals
  all_swim_totals: StravaTotals
}

export interface StravaTotals {
  count: number
  distance: number
  moving_time: number
  elapsed_time: number
  elevation_gain: number
}

export interface SyncResult {
  success: boolean
  metricsUpdated: number
  errors: string[]
}

// Transform Strava activity to our metric format
export function transformStravaActivityToMetrics(
  memberId: string,
  activity: StravaActivity
) {
  const metrics = []
  const recordedAt = new Date(activity.start_date)

  // Distance (convert meters to miles)
  if (activity.distance > 0) {
    metrics.push({
      memberId,
      category: MetricCategory.ACTIVITY,
      metricType: MetricType.DISTANCE,
      value: activity.distance / 1609.344, // meters to miles
      unit: "mi",
      source: IntegrationSource.STRAVA,
      sourceRecordId: activity.id.toString(),
      recordedAt,
      isVerified: true,
    })
  }

  // Active Minutes (moving time in minutes)
  if (activity.moving_time > 0) {
    metrics.push({
      memberId,
      category: MetricCategory.ACTIVITY,
      metricType: MetricType.ACTIVE_MINUTES,
      value: Math.round(activity.moving_time / 60),
      unit: "minutes",
      source: IntegrationSource.STRAVA,
      sourceRecordId: activity.id.toString(),
      recordedAt,
      isVerified: true,
    })
  }

  // Calories
  if (activity.calories && activity.calories > 0) {
    metrics.push({
      memberId,
      category: MetricCategory.ACTIVITY,
      metricType: MetricType.CALORIES_BURNED,
      value: activity.calories,
      unit: "kcal",
      source: IntegrationSource.STRAVA,
      sourceRecordId: activity.id.toString(),
      recordedAt,
      isVerified: true,
    })
  }

  // Average Heart Rate
  if (activity.average_heartrate) {
    metrics.push({
      memberId,
      category: MetricCategory.HEART,
      metricType: MetricType.RESTING_HEART_RATE, // Using as avg for now
      value: activity.average_heartrate,
      unit: "bpm",
      source: IntegrationSource.STRAVA,
      sourceRecordId: activity.id.toString(),
      recordedAt,
      isVerified: true,
    })
  }

  // Max Heart Rate
  if (activity.max_heartrate) {
    metrics.push({
      memberId,
      category: MetricCategory.HEART,
      metricType: MetricType.MAX_HEART_RATE,
      value: activity.max_heartrate,
      unit: "bpm",
      source: IntegrationSource.STRAVA,
      sourceRecordId: activity.id.toString(),
      recordedAt,
      isVerified: true,
    })
  }

  return metrics
}

// Singleton instance
let stravaClient: StravaClient | null = null

export function getStravaClient(): StravaClient {
  if (!stravaClient) {
    stravaClient = new StravaClient()
  }
  return stravaClient
}
