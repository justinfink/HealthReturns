import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db/prisma"
import { getStravaClient } from "@/lib/integrations/strava/client"
import { IntegrationSource, ConnectionStatus } from "@prisma/client"

// GET /api/integrations/strava/activities - Fetch recent Strava activities
export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const member = await prisma.member.findFirst({
      where: { clerkUserId: userId },
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Check if Strava is connected
    const connection = await prisma.integrationConnection.findFirst({
      where: {
        memberId: member.id,
        source: IntegrationSource.STRAVA,
        status: ConnectionStatus.ACTIVE,
      },
    })

    if (!connection) {
      return NextResponse.json({
        connected: false,
        activities: [],
        summary: null,
      })
    }

    // Check if we need to sync (last sync > 1 hour ago or never)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const needsSync = !connection.lastSyncAt || connection.lastSyncAt < oneHourAgo

    if (needsSync) {
      console.log("Syncing Strava data for member:", member.id)
      const client = getStravaClient()
      await client.syncHealthData(member.id, 7) // Last 7 days
    }

    // Fetch activities from database (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Get all activity metrics grouped by sourceRecordId (activity)
    const metrics = await prisma.biometricMetric.findMany({
      where: {
        memberId: member.id,
        source: IntegrationSource.STRAVA,
        recordedAt: { gte: sevenDaysAgo },
      },
      orderBy: { recordedAt: "desc" },
    })

    // Group metrics by activity (sourceRecordId)
    const activitiesMap = new Map<string, {
      id: string
      date: Date
      distance?: number
      activeMinutes?: number
      calories?: number
      avgHeartRate?: number
      maxHeartRate?: number
    }>()

    for (const metric of metrics) {
      const activityId = metric.sourceRecordId || metric.id

      if (!activitiesMap.has(activityId)) {
        activitiesMap.set(activityId, {
          id: activityId,
          date: metric.recordedAt,
        })
      }

      const activity = activitiesMap.get(activityId)!

      switch (metric.metricType) {
        case "DISTANCE":
          activity.distance = Number(metric.value)
          break
        case "ACTIVE_MINUTES":
          activity.activeMinutes = Number(metric.value)
          break
        case "CALORIES_BURNED":
          activity.calories = Number(metric.value)
          break
        case "RESTING_HEART_RATE": // Actually avg HR for activities
          activity.avgHeartRate = Number(metric.value)
          break
        case "MAX_HEART_RATE":
          activity.maxHeartRate = Number(metric.value)
          break
      }
    }

    const activities = Array.from(activitiesMap.values())
      .filter(a => a.activeMinutes && a.activeMinutes > 0) // Only include activities with duration
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10) // Limit to 10 most recent

    // Calculate weekly summary
    const summary = {
      totalActivities: activities.length,
      totalActiveMinutes: activities.reduce((sum, a) => sum + (a.activeMinutes || 0), 0),
      totalDistance: activities.reduce((sum, a) => sum + (a.distance || 0), 0),
      totalCalories: activities.reduce((sum, a) => sum + (a.calories || 0), 0),
      avgHeartRate: activities.filter(a => a.avgHeartRate).length > 0
        ? Math.round(
            activities.reduce((sum, a) => sum + (a.avgHeartRate || 0), 0) /
            activities.filter(a => a.avgHeartRate).length
          )
        : null,
    }

    return NextResponse.json({
      connected: true,
      activities,
      summary,
      lastSyncAt: connection.lastSyncAt,
    })
  } catch (error) {
    console.error("Error fetching Strava activities:", error)
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    )
  }
}
