import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db/prisma"
import {
  generateHealthInsights,
  generateLevelAdvice,
  type MemberHealthContext,
  type HealthMetricSummary,
} from "@/lib/ai/claude-client"
import { MetricType, BaselineStatus } from "@prisma/client"
import { getLevelProgress } from "@/lib/levels/evaluator"

// Rate limiting - simple in-memory store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 10 // requests per window
const RATE_WINDOW = 60 * 60 * 1000 // 1 hour

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitStore.get(userId)

  if (!userLimit || now > userLimit.resetAt) {
    rateLimitStore.set(userId, { count: 1, resetAt: now + RATE_WINDOW })
    return true
  }

  if (userLimit.count >= RATE_LIMIT) {
    return false
  }

  userLimit.count++
  return true
}

// GET /api/ai/insights - Generate personalized health insights
export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check rate limit
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429 }
      )
    }

    const member = await prisma.member.findFirst({
      where: { clerkUserId: userId },
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Get baseline data
    const baseline = await prisma.baselineSnapshot.findFirst({
      where: {
        memberId: member.id,
        status: BaselineStatus.COMPLETE,
      },
      orderBy: { createdAt: "desc" },
    })

    // Get recent metrics (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentMetrics = await prisma.biometricMetric.findMany({
      where: {
        memberId: member.id,
        recordedAt: { gte: thirtyDaysAgo },
      },
      orderBy: { recordedAt: "desc" },
    })

    // Aggregate current metrics by type
    const metricsByType = new Map<MetricType, number[]>()
    for (const metric of recentMetrics) {
      if (!metricsByType.has(metric.metricType)) {
        metricsByType.set(metric.metricType, [])
      }
      metricsByType.get(metric.metricType)!.push(Number(metric.value))
    }

    // Build health metric summaries
    const baselineMetrics = (baseline?.metrics as Record<string, any>) || {}
    const metricSummaries: HealthMetricSummary[] = []

    for (const [metricType, values] of metricsByType) {
      const current = values.reduce((a, b) => a + b, 0) / values.length
      const baselineData = baselineMetrics[metricType]
      const baselineValue = baselineData?.avg ?? null

      let trend: "improving" | "stable" | "declining" = "stable"
      let percentChange: number | null = null

      if (baselineValue !== null) {
        percentChange = ((current - baselineValue) / baselineValue) * 100

        // Determine trend based on metric type
        const lowerIsBetterTypes: MetricType[] = [
          MetricType.RESTING_HEART_RATE,
          MetricType.WEIGHT,
          MetricType.BMI,
          MetricType.BODY_FAT_PERCENTAGE,
          MetricType.FASTING_GLUCOSE,
          MetricType.HBA1C,
          MetricType.LDL_CHOLESTEROL,
          MetricType.TRIGLYCERIDES,
          MetricType.HS_CRP,
        ]
        const lowerIsBetter = lowerIsBetterTypes.includes(metricType)

        if (lowerIsBetter) {
          trend = percentChange < -3 ? "improving" : percentChange > 3 ? "declining" : "stable"
        } else {
          trend = percentChange > 3 ? "improving" : percentChange < -3 ? "declining" : "stable"
        }
      }

      metricSummaries.push({
        metricType,
        displayName: getMetricDisplayName(metricType),
        current: Math.round(current * 100) / 100,
        baseline: baselineValue ? Math.round(baselineValue * 100) / 100 : null,
        trend,
        unit: getMetricUnit(metricType),
        percentChange: percentChange ? Math.round(percentChange * 10) / 10 : null,
      })
    }

    // Calculate days in program
    const daysInProgram = member.enrolledAt
      ? Math.floor(
          (Date.now() - member.enrolledAt.getTime()) / (24 * 60 * 60 * 1000)
        )
      : 0

    // Get recent activity
    const recentActivity: string[] = []
    const levelHistory = await prisma.levelHistory.findMany({
      where: { memberId: member.id },
      orderBy: { changedAt: "desc" },
      take: 3,
    })
    for (const history of levelHistory) {
      recentActivity.push(`Advanced from ${history.previousLevel} to ${history.newLevel}`)
    }

    // Build context
    const context: MemberHealthContext = {
      currentLevel: member.currentLevel,
      nextLevel: null, // Will be determined by AI
      metrics: metricSummaries,
      daysInProgram,
      recentActivity,
    }

    // Generate insights
    const insights = await generateHealthInsights(context)

    // Get level progress for additional context
    const levelProgress = await getLevelProgress(member.id)

    // Generate level-specific advice
    const levelAdvice = await generateLevelAdvice(
      member.currentLevel,
      levelProgress.metricProgress.map((m) => ({
        metricType: m.metricType,
        passed: m.passed,
        reason: m.reason,
      }))
    )

    return NextResponse.json({
      ...insights,
      levelAdvice,
      levelProgress: {
        current: member.currentLevel,
        next: levelProgress.nextLevel,
        progress: levelProgress.progress,
      },
    })
  } catch (error) {
    console.error("Error generating insights:", error)
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    )
  }
}

// Helper functions
function getMetricDisplayName(metricType: MetricType): string {
  const names: Partial<Record<MetricType, string>> = {
    [MetricType.STEPS]: "Daily Steps",
    [MetricType.ACTIVE_MINUTES]: "Active Minutes",
    [MetricType.RESTING_HEART_RATE]: "Resting Heart Rate",
    [MetricType.HEART_RATE_VARIABILITY]: "Heart Rate Variability",
    [MetricType.SLEEP_DURATION]: "Sleep Duration",
    [MetricType.WEIGHT]: "Weight",
    [MetricType.BODY_FAT_PERCENTAGE]: "Body Fat",
    [MetricType.FASTING_GLUCOSE]: "Fasting Glucose",
    [MetricType.HBA1C]: "HbA1c",
    [MetricType.TOTAL_CHOLESTEROL]: "Total Cholesterol",
    [MetricType.LDL_CHOLESTEROL]: "LDL Cholesterol",
    [MetricType.HDL_CHOLESTEROL]: "HDL Cholesterol",
    [MetricType.TRIGLYCERIDES]: "Triglycerides",
    [MetricType.VITAMIN_D]: "Vitamin D",
  }
  return names[metricType] || metricType.replace(/_/g, " ").toLowerCase()
}

function getMetricUnit(metricType: MetricType): string {
  const units: Partial<Record<MetricType, string>> = {
    [MetricType.STEPS]: "steps",
    [MetricType.ACTIVE_MINUTES]: "min",
    [MetricType.RESTING_HEART_RATE]: "bpm",
    [MetricType.HEART_RATE_VARIABILITY]: "ms",
    [MetricType.SLEEP_DURATION]: "hours",
    [MetricType.WEIGHT]: "lbs",
    [MetricType.BODY_FAT_PERCENTAGE]: "%",
    [MetricType.FASTING_GLUCOSE]: "mg/dL",
    [MetricType.HBA1C]: "%",
    [MetricType.TOTAL_CHOLESTEROL]: "mg/dL",
    [MetricType.LDL_CHOLESTEROL]: "mg/dL",
    [MetricType.HDL_CHOLESTEROL]: "mg/dL",
    [MetricType.TRIGLYCERIDES]: "mg/dL",
    [MetricType.VITAMIN_D]: "ng/mL",
  }
  return units[metricType] || ""
}
