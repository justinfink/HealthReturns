import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db/prisma"
import { getOuraClient } from "@/lib/integrations/oura/client"

// GET /api/integrations/oura/data - Fetch recent Oura data
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
          where: { source: "OURA" },
        },
      },
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    const ouraConnection = member.integrations[0]

    if (!ouraConnection || ouraConnection.status !== "ACTIVE") {
      return NextResponse.json({
        connected: false,
        data: null,
      })
    }

    const client = getOuraClient()

    // Fetch last 7 days of data
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7)

    const startDateStr = startDate.toISOString().split("T")[0]
    const endDateStr = endDate.toISOString().split("T")[0]

    const [sleepData, activityData, readinessData] = await Promise.all([
      client.fetchSleepData(member.id, startDateStr, endDateStr),
      client.fetchActivityData(member.id, startDateStr, endDateStr),
      client.fetchReadinessData(member.id, startDateStr, endDateStr),
    ])

    // Calculate summaries
    const summary = {
      avgSleepScore: sleepData && sleepData.length > 0
        ? Math.round(sleepData.reduce((sum, d) => sum + (d.score || 0), 0) / sleepData.length)
        : null,
      totalSteps: activityData
        ? activityData.reduce((sum, d) => sum + d.steps, 0)
        : 0,
      avgSteps: activityData && activityData.length > 0
        ? Math.round(activityData.reduce((sum, d) => sum + d.steps, 0) / activityData.length)
        : 0,
      totalActiveCalories: activityData
        ? activityData.reduce((sum, d) => sum + d.active_calories, 0)
        : 0,
      avgReadinessScore: readinessData && readinessData.length > 0
        ? Math.round(readinessData.reduce((sum, d) => sum + (d.score || 0), 0) / readinessData.length)
        : null,
    }

    return NextResponse.json({
      connected: true,
      sleep: sleepData,
      activity: activityData,
      readiness: readinessData,
      summary,
      lastSyncAt: ouraConnection.lastSyncAt,
    })
  } catch (error) {
    console.error("Error fetching Oura data:", error)
    return NextResponse.json(
      { error: "Failed to fetch Oura data" },
      { status: 500 }
    )
  }
}
