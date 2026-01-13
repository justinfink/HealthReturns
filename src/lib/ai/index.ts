// AI module exports
export {
  generateHealthInsights,
  generateQuickInsight,
  generateLevelAdvice,
  getMetricDisplayName,
} from "./claude-client"

export type {
  HealthMetricSummary,
  MemberHealthContext,
  HealthInsight,
  InsightResponse,
} from "./claude-client"
