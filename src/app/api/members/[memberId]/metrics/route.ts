import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db/prisma"
import { MetricCategory, MetricType, IntegrationSource } from "@prisma/client"

// GET /api/members/[memberId]/metrics - Get member's metrics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { memberId } = await params

    // Verify member belongs to current user or user is admin
    const member = await prisma.member.findFirst({
      where: {
        OR: [
          { id: memberId, clerkUserId: userId },
          // TODO: Add admin check here
        ],
      },
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found or unauthorized" }, { status: 404 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category") as MetricCategory | null
    const metricType = searchParams.get("metricType") as MetricType | null
    const days = parseInt(searchParams.get("days") || "30")
    const limit = parseInt(searchParams.get("limit") || "100")

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const whereClause: any = {
      memberId,
      recordedAt: { gte: startDate },
    }

    if (category) {
      whereClause.category = category
    }
    if (metricType) {
      whereClause.metricType = metricType
    }

    const metrics = await prisma.biometricMetric.findMany({
      where: whereClause,
      orderBy: { recordedAt: "desc" },
      take: limit,
    })

    // Group metrics by type and calculate aggregates
    const grouped: Record<string, { values: number[]; latest: any }> = {}

    for (const metric of metrics) {
      const key = metric.metricType
      if (!grouped[key]) {
        grouped[key] = { values: [], latest: metric }
      }
      grouped[key].values.push(Number(metric.value))
    }

    const aggregates = Object.entries(grouped).map(([metricType, data]) => ({
      metricType,
      category: data.latest.category,
      unit: data.latest.unit,
      latest: Number(data.latest.value),
      latestAt: data.latest.recordedAt,
      count: data.values.length,
      avg: data.values.reduce((a, b) => a + b, 0) / data.values.length,
      min: Math.min(...data.values),
      max: Math.max(...data.values),
    }))

    return NextResponse.json({
      memberId,
      period: { start: startDate, end: new Date(), days },
      metrics: metrics.map((m) => ({
        id: m.id,
        category: m.category,
        metricType: m.metricType,
        value: Number(m.value),
        unit: m.unit,
        source: m.source,
        recordedAt: m.recordedAt,
        isVerified: m.isVerified,
      })),
      aggregates,
    })
  } catch (error) {
    console.error("Error getting metrics:", error)
    return NextResponse.json(
      { error: "Failed to get metrics" },
      { status: 500 }
    )
  }
}

// POST /api/members/[memberId]/metrics - Add manual metric entry
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { memberId } = await params

    // Verify member belongs to current user
    const member = await prisma.member.findFirst({
      where: { id: memberId, clerkUserId: userId },
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found or unauthorized" }, { status: 404 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.metricType || body.value === undefined) {
      return NextResponse.json(
        { error: "metricType and value are required" },
        { status: 400 }
      )
    }

    // Determine category based on metric type
    let category: MetricCategory
    const activityMetrics = [MetricType.STEPS, MetricType.ACTIVE_MINUTES, MetricType.DISTANCE]
    const heartMetrics = [MetricType.RESTING_HEART_RATE, MetricType.HEART_RATE_VARIABILITY]
    const sleepMetrics = [MetricType.SLEEP_DURATION, MetricType.SLEEP_SCORE]
    const bodyMetrics = [MetricType.WEIGHT, MetricType.BMI, MetricType.BODY_FAT_PERCENTAGE]

    if (activityMetrics.includes(body.metricType)) {
      category = MetricCategory.ACTIVITY
    } else if (heartMetrics.includes(body.metricType)) {
      category = MetricCategory.HEART
    } else if (sleepMetrics.includes(body.metricType)) {
      category = MetricCategory.SLEEP
    } else if (bodyMetrics.includes(body.metricType)) {
      category = MetricCategory.BODY
    } else {
      category = MetricCategory.LABS
    }

    // Create metric
    const metric = await prisma.biometricMetric.create({
      data: {
        memberId,
        category,
        metricType: body.metricType,
        value: body.value,
        unit: body.unit || getDefaultUnit(body.metricType),
        source: IntegrationSource.MANUAL_ENTRY,
        recordedAt: body.recordedAt ? new Date(body.recordedAt) : new Date(),
        isVerified: false,
      },
    })

    return NextResponse.json({
      success: true,
      metric: {
        id: metric.id,
        metricType: metric.metricType,
        value: Number(metric.value),
        unit: metric.unit,
        recordedAt: metric.recordedAt,
      },
    })
  } catch (error) {
    console.error("Error adding metric:", error)
    return NextResponse.json(
      { error: "Failed to add metric" },
      { status: 500 }
    )
  }
}

// Helper to get default unit for metric type
function getDefaultUnit(metricType: MetricType): string {
  const units: Partial<Record<MetricType, string>> = {
    [MetricType.STEPS]: "steps",
    [MetricType.ACTIVE_MINUTES]: "min",
    [MetricType.RESTING_HEART_RATE]: "bpm",
    [MetricType.HEART_RATE_VARIABILITY]: "ms",
    [MetricType.SLEEP_DURATION]: "hours",
    [MetricType.WEIGHT]: "lbs",
    [MetricType.BMI]: "kg/m2",
    [MetricType.BODY_FAT_PERCENTAGE]: "%",
    [MetricType.FASTING_GLUCOSE]: "mg/dL",
    [MetricType.HBA1C]: "%",
  }
  return units[metricType] || ""
}
