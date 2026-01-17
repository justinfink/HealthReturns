import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db/prisma"
import { getWhoopClient } from "@/lib/integrations/whoop/client"

// GET /api/integrations/whoop/data - Fetch recent WHOOP data
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
          where: { source: "WHOOP" },
        },
      },
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    const whoopConnection = member.integrations[0]

    if (!whoopConnection || whoopConnection.status !== "ACTIVE") {
      return NextResponse.json({
        connected: false,
        data: null,
      })
    }

    const client = getWhoopClient()

    // Fetch last 7 days of data
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7)

    const startDateStr = startDate.toISOString().split("T")[0]
    const endDateStr = endDate.toISOString().split("T")[0]

    const [recoveryData, sleepData, workoutData] = await Promise.all([
      client.fetchRecoveryData(member.id, startDateStr, endDateStr),
      client.fetchSleepData(member.id, startDateStr, endDateStr),
      client.fetchWorkoutData(member.id, startDateStr, endDateStr),
    ])

    // Calculate summaries
    const summary = {
      avgRecoveryScore: recoveryData && recoveryData.length > 0
        ? Math.round(
            recoveryData.reduce((sum, d) => sum + d.score.recovery_score, 0) /
              recoveryData.length
          )
        : null,
      avgRestingHR: recoveryData && recoveryData.length > 0
        ? Math.round(
            recoveryData.reduce((sum, d) => sum + d.score.resting_heart_rate, 0) /
              recoveryData.length
          )
        : null,
      avgHRV: recoveryData && recoveryData.length > 0
        ? Math.round(
            recoveryData.reduce((sum, d) => sum + d.score.hrv_rmssd_milli, 0) /
              recoveryData.length
          )
        : null,
      totalWorkouts: workoutData ? workoutData.length : 0,
      avgSleepPerformance: sleepData && sleepData.length > 0
        ? Math.round(
            sleepData
              .filter((s) => !s.nap && s.score.sleep_performance_percentage !== null)
              .reduce((sum, s) => sum + (s.score.sleep_performance_percentage || 0), 0) /
              sleepData.filter((s) => !s.nap).length
          )
        : null,
    }

    return NextResponse.json({
      connected: true,
      recovery: recoveryData,
      sleep: sleepData,
      workouts: workoutData,
      summary,
      lastSyncAt: whoopConnection.lastSyncAt,
    })
  } catch (error) {
    console.error("Error fetching WHOOP data:", error)
    return NextResponse.json(
      { error: "Failed to fetch WHOOP data" },
      { status: 500 }
    )
  }
}
