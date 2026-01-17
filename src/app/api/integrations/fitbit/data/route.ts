import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db/prisma"
import { getFitbitClient } from "@/lib/integrations/fitbit/client"

// GET /api/integrations/fitbit/data - Fetch recent Fitbit data
export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const member = await prisma.member.findFirst({
      where: { clerkUserId: userId },
      include: {
        integrations: {
          where: { source: "FITBIT" },
        },
      },
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    const fitbitConnection = member.integrations[0]

    if (!fitbitConnection || fitbitConnection.status !== "ACTIVE") {
      return NextResponse.json({
        connected: false,
        data: null,
      })
    }

    const client = getFitbitClient()

    // Fetch today's and recent data
    const today = new Date().toISOString().split("T")[0]
    const [activityData, sleepData, heartRateData] = await Promise.all([
      client.fetchActivitySummary(member.id, today),
      client.fetchSleepData(member.id, today),
      client.fetchHeartRateData(member.id, today),
    ])

    // Build summary from activity data
    const summary = {
      todaySteps: activityData?.summary?.steps || 0,
      todayCalories: activityData?.summary?.activityCalories || 0,
      todayActiveMinutes: activityData
        ? (activityData.summary?.fairlyActiveMinutes || 0) +
          (activityData.summary?.veryActiveMinutes || 0)
        : 0,
      todayFloors: activityData?.summary?.floors || 0,
      restingHeartRate:
        heartRateData?.["activities-heart"]?.[0]?.value?.restingHeartRate || null,
      lastNightSleep: sleepData?.summary?.totalMinutesAsleep
        ? Math.round((sleepData.summary.totalMinutesAsleep / 60) * 10) / 10
        : null,
      sleepEfficiency: sleepData?.sleep?.find((s) => s.isMainSleep)?.efficiency || null,
      goals: activityData?.goals || null,
    }

    return NextResponse.json({
      connected: true,
      activity: activityData,
      sleep: sleepData,
      heartRate: heartRateData,
      summary,
      lastSyncAt: fitbitConnection.lastSyncAt,
    })
  } catch (error) {
    console.error("Error fetching Fitbit data:", error)
    return NextResponse.json(
      { error: "Failed to fetch Fitbit data" },
      { status: 500 }
    )
  }
}
