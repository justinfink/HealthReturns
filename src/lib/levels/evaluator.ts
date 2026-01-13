import { prisma } from "@/lib/db/prisma"
import { MemberLevel, MetricType, ComparisonType, BaselineStatus } from "@prisma/client"
import { defaultLevelRules, LevelRuleDefinition, getNextLevel } from "./rules"
import { Decimal } from "@prisma/client/runtime/library"

// Types for evaluation results
export interface MetricEvaluationResult {
  metricType: MetricType
  passed: boolean
  reason: string
  baseline: number | null
  current: number | null
  threshold?: number
  improvementPercentage?: number
}

export interface LevelEvaluationResult {
  memberId: string
  currentLevel: MemberLevel
  evaluatedLevel: MemberLevel
  eligible: boolean
  reason: string
  metricResults: MetricEvaluationResult[]
  timestamp: Date
}

// Main evaluation function
export async function evaluateMemberLevel(memberId: string): Promise<LevelEvaluationResult> {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: {
      organization: {
        include: { programConfig: true },
      },
    },
  })

  if (!member) {
    throw new Error(`Member not found: ${memberId}`)
  }

  const currentLevel = member.currentLevel

  // Get baseline snapshot
  const baseline = await prisma.baselineSnapshot.findFirst({
    where: {
      memberId,
      status: BaselineStatus.COMPLETE,
    },
    orderBy: { createdAt: "desc" },
  })

  // If no baseline, can only be Level 0
  if (!baseline) {
    return {
      memberId,
      currentLevel,
      evaluatedLevel: MemberLevel.LEVEL_0,
      eligible: currentLevel === MemberLevel.LEVEL_0,
      reason: "No baseline data captured yet",
      metricResults: [],
      timestamp: new Date(),
    }
  }

  // Check what's the highest level the member qualifies for
  const levelsToCheck: MemberLevel[] = [
    MemberLevel.LEVEL_3,
    MemberLevel.LEVEL_2,
    MemberLevel.LEVEL_1,
  ]

  for (const targetLevel of levelsToCheck) {
    const result = await evaluateForLevel(memberId, targetLevel, baseline)
    if (result.eligible) {
      return result
    }
  }

  // Default to Level 0 if no levels qualify
  return {
    memberId,
    currentLevel,
    evaluatedLevel: MemberLevel.LEVEL_0,
    eligible: false,
    reason: "Does not meet requirements for any level",
    metricResults: [],
    timestamp: new Date(),
  }
}

// Evaluate member against specific level requirements
async function evaluateForLevel(
  memberId: string,
  targetLevel: MemberLevel,
  baseline: { metrics: any }
): Promise<LevelEvaluationResult> {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
  })

  if (!member) {
    throw new Error(`Member not found: ${memberId}`)
  }

  const levelRequirements = defaultLevelRules[targetLevel]
  const metricResults: MetricEvaluationResult[] = []
  let passedCount = 0

  // Get current metrics (last 30 days average)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  for (const rule of levelRequirements.rules) {
    const result = await evaluateMetric(memberId, rule, baseline.metrics, thirtyDaysAgo)
    metricResults.push(result)
    if (result.passed) {
      passedCount++
    }
  }

  const eligible = passedCount >= levelRequirements.minMetricsRequired

  return {
    memberId,
    currentLevel: member.currentLevel,
    evaluatedLevel: targetLevel,
    eligible,
    reason: eligible
      ? `Passed ${passedCount}/${levelRequirements.minMetricsRequired} required metrics`
      : `Only passed ${passedCount}/${levelRequirements.minMetricsRequired} required metrics`,
    metricResults,
    timestamp: new Date(),
  }
}

// Evaluate a single metric against a rule
async function evaluateMetric(
  memberId: string,
  rule: LevelRuleDefinition,
  baselineMetrics: Record<string, { avg: number; min: number; max: number; count: number }>,
  since: Date
): Promise<MetricEvaluationResult> {
  // Get current metric average
  const currentMetrics = await prisma.biometricMetric.findMany({
    where: {
      memberId,
      metricType: rule.metricType,
      recordedAt: { gte: since },
    },
    orderBy: { recordedAt: "desc" },
  })

  if (currentMetrics.length === 0) {
    return {
      metricType: rule.metricType,
      passed: false,
      reason: "No recent data available",
      baseline: null,
      current: null,
    }
  }

  // Calculate current average
  const currentAvg =
    currentMetrics.reduce((sum, m) => sum + Number(m.value), 0) / currentMetrics.length

  // Get baseline value
  const baselineData = baselineMetrics[rule.metricType]
  const baselineAvg = baselineData?.avg ?? null

  // Check absolute threshold first (if exists)
  if (rule.absoluteThreshold !== undefined) {
    const meetsAbsolute = compareValue(
      currentAvg,
      rule.absoluteThreshold,
      rule.comparisonType
    )
    if (meetsAbsolute) {
      return {
        metricType: rule.metricType,
        passed: true,
        reason: `Achieved absolute target of ${rule.absoluteThreshold}`,
        baseline: baselineAvg,
        current: currentAvg,
        threshold: rule.absoluteThreshold,
      }
    }
  }

  // Check improvement threshold
  if (baselineAvg !== null && rule.improvementThreshold !== undefined) {
    const improvementPercentage = calculateImprovement(
      baselineAvg,
      currentAvg,
      rule.comparisonType
    )

    if (improvementPercentage >= rule.improvementThreshold) {
      return {
        metricType: rule.metricType,
        passed: true,
        reason: `Improved by ${improvementPercentage.toFixed(1)}% from baseline`,
        baseline: baselineAvg,
        current: currentAvg,
        improvementPercentage,
      }
    }
  }

  // Check maintenance (if allowed and already in optimal range)
  if (rule.maintenanceAllowed && rule.optimalRange && baselineAvg !== null) {
    const wasInRange = baselineAvg >= rule.optimalRange.min && baselineAvg <= rule.optimalRange.max
    const isInRange = currentAvg >= rule.optimalRange.min && currentAvg <= rule.optimalRange.max

    if (wasInRange && isInRange) {
      return {
        metricType: rule.metricType,
        passed: true,
        reason: "Maintaining healthy range",
        baseline: baselineAvg,
        current: currentAvg,
      }
    }
  }

  // Did not pass
  return {
    metricType: rule.metricType,
    passed: false,
    reason: baselineAvg
      ? `Improvement of ${calculateImprovement(baselineAvg, currentAvg, rule.comparisonType).toFixed(1)}% below threshold`
      : "Insufficient baseline data",
    baseline: baselineAvg,
    current: currentAvg,
    improvementPercentage: baselineAvg
      ? calculateImprovement(baselineAvg, currentAvg, rule.comparisonType)
      : undefined,
  }
}

// Compare a value against a threshold based on comparison type
function compareValue(
  value: number,
  threshold: number,
  comparisonType: ComparisonType
): boolean {
  switch (comparisonType) {
    case ComparisonType.GREATER_THAN:
      return value > threshold
    case ComparisonType.LESS_THAN:
      return value < threshold
    case ComparisonType.GREATER_THAN_OR_EQUAL:
      return value >= threshold
    case ComparisonType.LESS_THAN_OR_EQUAL:
      return value <= threshold
    case ComparisonType.WITHIN_RANGE:
      return true // Would need min/max for this
    default:
      return false
  }
}

// Calculate improvement percentage
function calculateImprovement(
  baseline: number,
  current: number,
  comparisonType: ComparisonType
): number {
  if (baseline === 0) return 0

  // For metrics where lower is better (heart rate, weight)
  if (
    comparisonType === ComparisonType.LESS_THAN ||
    comparisonType === ComparisonType.LESS_THAN_OR_EQUAL
  ) {
    return ((baseline - current) / baseline) * 100
  }

  // For metrics where higher is better (steps, HRV)
  return ((current - baseline) / baseline) * 100
}

// Update member's level after evaluation
export async function updateMemberLevel(
  memberId: string,
  newLevel: MemberLevel,
  reason: string,
  evaluationData?: any
): Promise<void> {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
  })

  if (!member) {
    throw new Error(`Member not found: ${memberId}`)
  }

  const previousLevel = member.currentLevel

  // Don't update if level hasn't changed
  if (previousLevel === newLevel) {
    return
  }

  // Update member's current level
  await prisma.member.update({
    where: { id: memberId },
    data: {
      currentLevel: newLevel,
      levelUpdatedAt: new Date(),
    },
  })

  // Record level change in history
  await prisma.levelHistory.create({
    data: {
      memberId,
      previousLevel,
      newLevel,
      reason,
      evaluationData: evaluationData ? JSON.stringify(evaluationData) : undefined,
    },
  })
}

// Create baseline snapshot from current metrics
export async function createBaselineSnapshot(memberId: string): Promise<void> {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: {
      organization: {
        include: { programConfig: true },
      },
    },
  })

  if (!member) {
    throw new Error(`Member not found: ${memberId}`)
  }

  const baselinePeriodDays = member.organization?.programConfig?.baselinePeriodDays ?? 30
  const periodEnd = new Date()
  const periodStart = new Date()
  periodStart.setDate(periodStart.getDate() - baselinePeriodDays)

  // Get all metrics from baseline period
  const metrics = await prisma.biometricMetric.findMany({
    where: {
      memberId,
      recordedAt: {
        gte: periodStart,
        lte: periodEnd,
      },
    },
  })

  // Aggregate metrics by type
  const aggregated: Record<
    string,
    { values: number[]; avg: number; min: number; max: number; count: number }
  > = {}

  for (const metric of metrics) {
    const key = metric.metricType
    if (!aggregated[key]) {
      aggregated[key] = { values: [], avg: 0, min: Infinity, max: -Infinity, count: 0 }
    }
    const value = Number(metric.value)
    aggregated[key].values.push(value)
    aggregated[key].min = Math.min(aggregated[key].min, value)
    aggregated[key].max = Math.max(aggregated[key].max, value)
    aggregated[key].count++
  }

  // Calculate averages
  for (const key of Object.keys(aggregated)) {
    const data = aggregated[key]
    data.avg = data.values.reduce((a, b) => a + b, 0) / data.values.length
    delete (data as any).values // Remove raw values from stored data
  }

  // Determine status based on data sufficiency
  const metricTypeCount = Object.keys(aggregated).length
  const status =
    metricTypeCount >= 3 ? BaselineStatus.COMPLETE : BaselineStatus.INSUFFICIENT

  // Create or update baseline snapshot
  await prisma.baselineSnapshot.create({
    data: {
      memberId,
      periodStart,
      periodEnd,
      status,
      metrics: aggregated,
      finalizedAt: status === BaselineStatus.COMPLETE ? new Date() : null,
    },
  })

  // If baseline is complete and member is at Level 0, advance to Level 1
  if (status === BaselineStatus.COMPLETE) {
    const currentMember = await prisma.member.findUnique({
      where: { id: memberId },
    })
    if (currentMember?.currentLevel === MemberLevel.LEVEL_0) {
      await updateMemberLevel(
        memberId,
        MemberLevel.LEVEL_1,
        "Baseline captured and participation confirmed"
      )
    }
  }
}

// Get member's progress toward next level
export async function getLevelProgress(
  memberId: string
): Promise<{ currentLevel: MemberLevel; nextLevel: MemberLevel | null; progress: number; metricProgress: MetricEvaluationResult[] }> {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
  })

  if (!member) {
    throw new Error(`Member not found: ${memberId}`)
  }

  const currentLevel = member.currentLevel
  const nextLevel = getNextLevel(currentLevel)

  if (!nextLevel) {
    return {
      currentLevel,
      nextLevel: null,
      progress: 100,
      metricProgress: [],
    }
  }

  // Get baseline
  const baseline = await prisma.baselineSnapshot.findFirst({
    where: {
      memberId,
      status: BaselineStatus.COMPLETE,
    },
    orderBy: { createdAt: "desc" },
  })

  if (!baseline) {
    return {
      currentLevel,
      nextLevel,
      progress: 0,
      metricProgress: [],
    }
  }

  // Evaluate against next level
  const evaluation = await evaluateForLevel(memberId, nextLevel, baseline)

  // Calculate progress percentage
  const requirements = defaultLevelRules[nextLevel]
  const passedCount = evaluation.metricResults.filter((r) => r.passed).length
  const progress = Math.min(
    100,
    Math.round((passedCount / requirements.minMetricsRequired) * 100)
  )

  return {
    currentLevel,
    nextLevel,
    progress,
    metricProgress: evaluation.metricResults,
  }
}
