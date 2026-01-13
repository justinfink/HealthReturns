import Anthropic from "@anthropic-ai/sdk"
import { MemberLevel, MetricType } from "@prisma/client"
import { getLevelDisplayName, getRebatePercentage, getNextLevel } from "@/lib/levels/rules"

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Types for AI insights
export interface HealthMetricSummary {
  metricType: MetricType
  displayName: string
  current: number
  baseline: number | null
  trend: "improving" | "stable" | "declining"
  unit: string
  percentChange: number | null
}

export interface MemberHealthContext {
  currentLevel: MemberLevel
  nextLevel: MemberLevel | null
  metrics: HealthMetricSummary[]
  daysInProgram: number
  recentActivity: string[]
}

export interface HealthInsight {
  type: "celebration" | "encouragement" | "tip" | "warning"
  title: string
  message: string
  actionable?: string
  relatedMetric?: MetricType
}

export interface InsightResponse {
  summary: string
  insights: HealthInsight[]
  recommendedFocus: MetricType[]
  motivationalMessage: string
}

// Generate personalized health insights using Claude
export async function generateHealthInsights(
  context: MemberHealthContext
): Promise<InsightResponse> {
  const levelName = getLevelDisplayName(context.currentLevel)
  const nextLevelName = context.nextLevel ? getLevelDisplayName(context.nextLevel) : null
  const currentRebate = getRebatePercentage(context.currentLevel)
  const nextRebate = context.nextLevel ? getRebatePercentage(context.nextLevel) : null

  // Format metrics for the prompt
  const metricsDescription = context.metrics
    .map((m) => {
      const changeStr = m.percentChange !== null
        ? `${m.percentChange > 0 ? "+" : ""}${m.percentChange.toFixed(1)}%`
        : "no baseline"
      return `- ${m.displayName}: ${m.current} ${m.unit} (${m.trend}, ${changeStr} from baseline)`
    })
    .join("\n")

  const prompt = `You are a supportive health coach for the HealthReturns wellness program. Generate personalized insights for a member based on their health data.

MEMBER CONTEXT:
- Current Level: ${levelName} (earning ${currentRebate}% rebate)
- Next Level: ${nextLevelName || "Maximum level achieved"} ${nextRebate ? `(would earn ${nextRebate}% rebate)` : ""}
- Days in Program: ${context.daysInProgram}
- Recent Activity: ${context.recentActivity.join(", ") || "None recorded"}

CURRENT METRICS:
${metricsDescription || "No metrics available yet"}

INSTRUCTIONS:
1. Analyze the member's health data and progress
2. Generate 3-4 personalized insights that are:
   - Encouraging and positive in tone
   - Specific to their actual metrics
   - Actionable when appropriate
   - Focused on celebrating wins and identifying opportunities
3. Do NOT mention specific medical conditions or diagnose anything
4. Focus on wellness, lifestyle improvements, and program progress
5. If metrics are improving, celebrate the progress
6. If metrics need attention, provide gentle encouragement

Respond in JSON format with this structure:
{
  "summary": "A 1-2 sentence overview of the member's health journey",
  "insights": [
    {
      "type": "celebration|encouragement|tip|warning",
      "title": "Short insight title",
      "message": "Detailed insight message (2-3 sentences)",
      "actionable": "Optional specific action to take",
      "relatedMetric": "STEPS|RESTING_HEART_RATE|SLEEP_DURATION|etc or null"
    }
  ],
  "recommendedFocus": ["METRIC_TYPE_1", "METRIC_TYPE_2"],
  "motivationalMessage": "An inspiring closing message about their health journey"
}

Keep the tone warm, supportive, and encouraging. Never be judgmental or discouraging.`

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307", // Use Haiku for fast, cost-effective insights
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    })

    // Extract the text content
    const textContent = response.content.find((c) => c.type === "text")
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text content in response")
    }

    // Parse JSON response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from response")
    }

    const parsed = JSON.parse(jsonMatch[0]) as InsightResponse
    return parsed
  } catch (error) {
    console.error("Error generating health insights:", error)

    // Return fallback insights if AI fails
    return getFallbackInsights(context)
  }
}

// Generate a single quick insight
export async function generateQuickInsight(
  metricType: MetricType,
  current: number,
  baseline: number | null,
  trend: "improving" | "stable" | "declining"
): Promise<string> {
  const metricName = getMetricDisplayName(metricType)

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 150,
      messages: [
        {
          role: "user",
          content: `Generate a brief, encouraging 1-sentence insight about someone's ${metricName} being ${current}${baseline ? ` (was ${baseline}, now ${trend})` : ""}. Be supportive and specific. No medical advice.`,
        },
      ],
    })

    const textContent = response.content.find((c) => c.type === "text")
    return textContent?.type === "text" ? textContent.text : getDefaultInsight(metricType, trend)
  } catch {
    return getDefaultInsight(metricType, trend)
  }
}

// Generate level advancement recommendations
export async function generateLevelAdvice(
  currentLevel: MemberLevel,
  metricProgress: { metricType: MetricType; passed: boolean; reason: string }[]
): Promise<string> {
  const nextLevel = getNextLevel(currentLevel)
  if (!nextLevel) {
    return "Congratulations! You've reached the highest level. Keep up the excellent work maintaining your healthy lifestyle!"
  }

  const passedMetrics = metricProgress.filter((m) => m.passed)
  const failedMetrics = metricProgress.filter((m) => !m.passed)

  const prompt = `A wellness program member is at "${getLevelDisplayName(currentLevel)}" level and working toward "${getLevelDisplayName(nextLevel)}".

Metrics they've achieved:
${passedMetrics.map((m) => `- ${getMetricDisplayName(m.metricType)}: ${m.reason}`).join("\n") || "None yet"}

Metrics still needed:
${failedMetrics.map((m) => `- ${getMetricDisplayName(m.metricType)}: ${m.reason}`).join("\n")}

Generate 2-3 sentences of personalized advice on what to focus on to reach the next level. Be encouraging, specific, and actionable. No medical advice.`

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    })

    const textContent = response.content.find((c) => c.type === "text")
    return textContent?.type === "text" ? textContent.text : getDefaultLevelAdvice(failedMetrics)
  } catch {
    return getDefaultLevelAdvice(failedMetrics)
  }
}

// Fallback insights when AI is unavailable
function getFallbackInsights(context: MemberHealthContext): InsightResponse {
  const insights: HealthInsight[] = []

  // Check for improving metrics
  const improvingMetrics = context.metrics.filter((m) => m.trend === "improving")
  if (improvingMetrics.length > 0) {
    insights.push({
      type: "celebration",
      title: "Great Progress!",
      message: `You're showing improvement in ${improvingMetrics.length} metric${improvingMetrics.length > 1 ? "s" : ""}. Keep up the fantastic work!`,
      relatedMetric: improvingMetrics[0].metricType,
    })
  }

  // Check activity levels
  const stepsMetric = context.metrics.find((m) => m.metricType === MetricType.STEPS)
  if (stepsMetric && stepsMetric.current < 8000) {
    insights.push({
      type: "tip",
      title: "Boost Your Steps",
      message: "Try adding a short walk during your lunch break or taking the stairs when possible.",
      actionable: "Aim for 500 more steps today",
      relatedMetric: MetricType.STEPS,
    })
  }

  // Sleep check
  const sleepMetric = context.metrics.find((m) => m.metricType === MetricType.SLEEP_DURATION)
  if (sleepMetric && sleepMetric.current < 7) {
    insights.push({
      type: "encouragement",
      title: "Prioritize Rest",
      message: "Quality sleep is foundational to your health journey. Consider setting a consistent bedtime.",
      actionable: "Try going to bed 15 minutes earlier tonight",
      relatedMetric: MetricType.SLEEP_DURATION,
    })
  }

  // Default insight if none generated
  if (insights.length === 0) {
    insights.push({
      type: "encouragement",
      title: "Keep Going!",
      message: "Every step toward better health matters. You're on the right path!",
    })
  }

  return {
    summary: `You've been in the program for ${context.daysInProgram} days and are making progress toward your wellness goals.`,
    insights,
    recommendedFocus: context.metrics
      .filter((m) => m.trend !== "improving")
      .slice(0, 2)
      .map((m) => m.metricType),
    motivationalMessage: "Your health journey is unique, and every small improvement adds up to big changes over time!",
  }
}

// Get display name for metric type
function getMetricDisplayName(metricType: MetricType): string {
  const names: Record<MetricType, string> = {
    [MetricType.STEPS]: "Daily Steps",
    [MetricType.DISTANCE]: "Distance",
    [MetricType.ACTIVE_MINUTES]: "Active Minutes",
    [MetricType.CALORIES_BURNED]: "Calories Burned",
    [MetricType.FLOORS_CLIMBED]: "Floors Climbed",
    [MetricType.RESTING_HEART_RATE]: "Resting Heart Rate",
    [MetricType.HEART_RATE_VARIABILITY]: "Heart Rate Variability",
    [MetricType.MAX_HEART_RATE]: "Max Heart Rate",
    [MetricType.VO2_MAX]: "VO2 Max",
    [MetricType.BLOOD_PRESSURE_SYSTOLIC]: "Blood Pressure (Systolic)",
    [MetricType.BLOOD_PRESSURE_DIASTOLIC]: "Blood Pressure (Diastolic)",
    [MetricType.SLEEP_DURATION]: "Sleep Duration",
    [MetricType.SLEEP_SCORE]: "Sleep Score",
    [MetricType.DEEP_SLEEP_MINUTES]: "Deep Sleep",
    [MetricType.REM_SLEEP_MINUTES]: "REM Sleep",
    [MetricType.LIGHT_SLEEP_MINUTES]: "Light Sleep",
    [MetricType.AWAKE_MINUTES]: "Time Awake",
    [MetricType.WEIGHT]: "Weight",
    [MetricType.BMI]: "BMI",
    [MetricType.BODY_FAT_PERCENTAGE]: "Body Fat",
    [MetricType.MUSCLE_MASS]: "Muscle Mass",
    [MetricType.BONE_MASS]: "Bone Mass",
    [MetricType.WATER_PERCENTAGE]: "Body Water",
    [MetricType.VISCERAL_FAT]: "Visceral Fat",
    [MetricType.METABOLIC_AGE]: "Metabolic Age",
    [MetricType.SYSTOLIC_BP]: "Systolic BP",
    [MetricType.DIASTOLIC_BP]: "Diastolic BP",
    [MetricType.FASTING_GLUCOSE]: "Fasting Glucose",
    [MetricType.HBA1C]: "HbA1c",
    [MetricType.TOTAL_CHOLESTEROL]: "Total Cholesterol",
    [MetricType.LDL_CHOLESTEROL]: "LDL Cholesterol",
    [MetricType.HDL_CHOLESTEROL]: "HDL Cholesterol",
    [MetricType.TRIGLYCERIDES]: "Triglycerides",
    [MetricType.HS_CRP]: "hs-CRP",
    [MetricType.VITAMIN_D]: "Vitamin D",
    [MetricType.APO_B]: "ApoB",
    [MetricType.FASTING_INSULIN]: "Fasting Insulin",
    [MetricType.HOMA_IR]: "HOMA-IR",
  }
  return names[metricType] || metricType.replace(/_/g, " ").toLowerCase()
}

// Default insight for a metric trend
function getDefaultInsight(metricType: MetricType, trend: string): string {
  const name = getMetricDisplayName(metricType)
  if (trend === "improving") {
    return `Great job! Your ${name} is trending in the right direction. Keep it up!`
  } else if (trend === "stable") {
    return `Your ${name} is holding steady. Consistency is key to long-term health!`
  } else {
    return `Your ${name} could use some attention. Small changes can make a big difference!`
  }
}

// Default level advice
function getDefaultLevelAdvice(
  failedMetrics: { metricType: MetricType; reason: string }[]
): string {
  if (failedMetrics.length === 0) {
    return "You're doing great! Keep maintaining your healthy habits to stay on track."
  }

  const focusMetric = getMetricDisplayName(failedMetrics[0].metricType)
  return `Focus on improving your ${focusMetric} to get closer to your goal. Small, consistent changes in your daily routine can help you reach the next level.`
}

export { getMetricDisplayName }
