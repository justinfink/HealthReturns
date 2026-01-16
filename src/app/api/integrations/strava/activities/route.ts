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

    // Fetch activities directly from Strava API (last 7 days)
    // This gives us the full activity data including name and type
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const client = getStravaClient()
    const stravaActivities = await client.fetchActivities(member.id, sevenDaysAgo, 1, 20)

    if (!stravaActivities) {
      // If fetch fails, return empty but connected state
      return NextResponse.json({
        connected: true,
        activities: [],
        summary: null,
        lastSyncAt: connection.lastSyncAt,
        error: "Could not fetch activities from Strava",
      })
    }

    // Transform Strava activities to our format
    const activities = stravaActivities.map(activity => ({
      id: activity.id.toString(),
      name: activity.name,
      type: activity.type, // Run, Ride, Swim, Walk, Hike, Workout, etc.
      sportType: activity.sport_type,
      date: new Date(activity.start_date),
      distance: activity.distance / 1609.344, // meters to miles
      activeMinutes: Math.round(activity.moving_time / 60),
      calories: activity.calories || null,
      avgHeartRate: activity.average_heartrate || null,
      maxHeartRate: activity.max_heartrate || null,
      elevationGain: activity.total_elevation_gain ? activity.total_elevation_gain * 3.28084 : null, // meters to feet
    }))

    // Calculate weekly summary
    const summary = {
      totalActivities: activities.length,
      totalActiveMinutes: activities.reduce((sum, a) => sum + a.activeMinutes, 0),
      totalDistance: activities.reduce((sum, a) => sum + a.distance, 0),
      totalCalories: activities.reduce((sum, a) => sum + (a.calories || 0), 0),
      avgHeartRate: activities.filter(a => a.avgHeartRate).length > 0
        ? Math.round(
            activities.reduce((sum, a) => sum + (a.avgHeartRate || 0), 0) /
            activities.filter(a => a.avgHeartRate).length
          )
        : null,
    }

    // Update last sync time
    await prisma.integrationConnection.update({
      where: { id: connection.id },
      data: { lastSyncAt: new Date() },
    })

    return NextResponse.json({
      connected: true,
      activities,
      summary,
      lastSyncAt: new Date(),
    })
  } catch (error) {
    console.error("Error fetching Strava activities:", error)
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    )
  }
}
