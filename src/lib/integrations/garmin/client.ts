import { GarminConnect } from "garmin-connect"
import { prisma } from "@/lib/db/prisma"
import { IntegrationSource, ConnectionStatus, MetricCategory, MetricType } from "@prisma/client"

// Garmin Connect client wrapper
export class GarminClient {
  private client: GarminConnect

  constructor() {
    this.client = new GarminConnect({
      username: "",
      password: "",
    })
  }

  // Initialize with OAuth tokens for a specific member
  async initializeWithTokens(memberId: string): Promise<boolean> {
    const connection = await prisma.integrationConnection.findFirst({
      where: {
        memberId,
        source: IntegrationSource.GARMIN,
        status: ConnectionStatus.ACTIVE,
      },
    })

    if (!connection || !connection.accessToken) {
      return false
    }

    // In a real implementation, we would use the stored OAuth tokens
    // For now, this is a placeholder that would be expanded with real OAuth flow
    return true
  }

  // Fetch daily summary data from Garmin
  async fetchDailySummary(
    memberId: string,
    date: Date
  ): Promise<GarminDailySummary | null> {
    try {
      const isInitialized = await this.initializeWithTokens(memberId)
      if (!isInitialized) {
        console.log("Garmin not initialized for member:", memberId)
        return null
      }

      // This would call the actual Garmin API
      // For demo purposes, returning mock data structure
      return null
    } catch (error) {
      console.error("Error fetching Garmin daily summary:", error)
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
          source: IntegrationSource.GARMIN,
          status: ConnectionStatus.ACTIVE,
        },
      })

      if (!connection) {
        result.errors.push("No active Garmin connection found")
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

      // In production, this would fetch real data from Garmin API
      // For now, we'll update the connection status
      await prisma.integrationConnection.update({
        where: { id: connection.id },
        data: {
          lastSyncStatus: "SUCCESS",
        },
      })

      result.success = true
      return result
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : "Unknown error")
      return result
    }
  }
}

// Types for Garmin data
export interface GarminDailySummary {
  totalSteps: number
  totalDistance: number // in meters
  activeMinutes: number
  restingHeartRate: number | null
  averageHeartRate: number | null
  sleepDuration: number | null // in seconds
  sleepScore: number | null
  hrvValue: number | null // Heart Rate Variability
  calories: number
  floorsClimbed: number
}

export interface SyncResult {
  success: boolean
  metricsUpdated: number
  errors: string[]
}

// Transform Garmin data to our metric format
export function transformGarminToMetrics(
  memberId: string,
  summary: GarminDailySummary,
  recordedAt: Date
) {
  const metrics = []

  // Steps
  if (summary.totalSteps > 0) {
    metrics.push({
      memberId,
      category: MetricCategory.ACTIVITY,
      metricType: MetricType.STEPS,
      value: summary.totalSteps,
      unit: "steps",
      source: IntegrationSource.GARMIN,
      recordedAt,
      isVerified: true,
    })
  }

  // Active Minutes
  if (summary.activeMinutes > 0) {
    metrics.push({
      memberId,
      category: MetricCategory.ACTIVITY,
      metricType: MetricType.ACTIVE_MINUTES,
      value: summary.activeMinutes,
      unit: "minutes",
      source: IntegrationSource.GARMIN,
      recordedAt,
      isVerified: true,
    })
  }

  // Resting Heart Rate
  if (summary.restingHeartRate) {
    metrics.push({
      memberId,
      category: MetricCategory.HEART,
      metricType: MetricType.RESTING_HEART_RATE,
      value: summary.restingHeartRate,
      unit: "bpm",
      source: IntegrationSource.GARMIN,
      recordedAt,
      isVerified: true,
    })
  }

  // Heart Rate Variability
  if (summary.hrvValue) {
    metrics.push({
      memberId,
      category: MetricCategory.HEART,
      metricType: MetricType.HEART_RATE_VARIABILITY,
      value: summary.hrvValue,
      unit: "ms",
      source: IntegrationSource.GARMIN,
      recordedAt,
      isVerified: true,
    })
  }

  // Sleep Duration
  if (summary.sleepDuration) {
    metrics.push({
      memberId,
      category: MetricCategory.SLEEP,
      metricType: MetricType.SLEEP_DURATION,
      value: summary.sleepDuration / 3600, // Convert seconds to hours
      unit: "hours",
      source: IntegrationSource.GARMIN,
      recordedAt,
      isVerified: true,
    })
  }

  // Sleep Score (if available)
  if (summary.sleepScore) {
    metrics.push({
      memberId,
      category: MetricCategory.SLEEP,
      metricType: MetricType.SLEEP_SCORE,
      value: summary.sleepScore,
      unit: "score",
      source: IntegrationSource.GARMIN,
      recordedAt,
      isVerified: true,
    })
  }

  return metrics
}

// Singleton instance
let garminClient: GarminClient | null = null

export function getGarminClient(): GarminClient {
  if (!garminClient) {
    garminClient = new GarminClient()
  }
  return garminClient
}
