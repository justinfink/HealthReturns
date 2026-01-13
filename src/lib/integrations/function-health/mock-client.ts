import { MetricCategory, MetricType, IntegrationSource } from "@prisma/client"

// Mock Function Health client for demo/development
// Function Health provides comprehensive lab testing with 100+ biomarkers

export interface FunctionHealthPanel {
  // Lipid Panel
  totalCholesterol: number // mg/dL
  ldlCholesterol: number
  hdlCholesterol: number
  triglycerides: number
  apoB: number // mg/dL

  // Blood Sugar
  fastingGlucose: number // mg/dL
  hba1c: number // %
  fastingInsulin: number // uIU/mL
  homaIr: number // HOMA-IR score

  // Inflammation
  hscrp: number // mg/L
  homocysteine: number // umol/L

  // Thyroid
  tsh: number // mIU/L
  freeT3: number // pg/mL
  freeT4: number // ng/dL

  // Hormones
  testosterone: number | null // ng/dL (gender-dependent)
  estradiol: number | null // pg/mL
  dheas: number // ug/dL
  cortisol: number // ug/dL

  // Vitamins & Minerals
  vitaminD: number // ng/mL
  vitaminB12: number // pg/mL
  ferritin: number // ng/mL
  magnesium: number // mg/dL

  // Kidney & Liver
  creatinine: number // mg/dL
  egfr: number // mL/min/1.73m2
  alt: number // U/L
  ast: number // U/L

  // Complete Blood Count
  hemoglobin: number // g/dL
  whiteBloodCells: number // K/uL
  platelets: number // K/uL
}

type HealthStatus = "optimal" | "normal" | "suboptimal" | "concerning"

function generatePanelForStatus(
  status: HealthStatus,
  isMale: boolean = true
): FunctionHealthPanel {
  // Optimal ranges with slight variations based on status
  const statusMultipliers: Record<HealthStatus, { low: number; high: number }> = {
    optimal: { low: 0.9, high: 1.0 },
    normal: { low: 0.85, high: 1.1 },
    suboptimal: { low: 0.75, high: 1.25 },
    concerning: { low: 0.6, high: 1.5 },
  }

  const m = statusMultipliers[status]
  const rand = (base: number, variance: number) =>
    base + (Math.random() - 0.5) * variance * 2

  // Generate realistic lab values
  return {
    // Lipid Panel - optimal: TC<200, LDL<100, HDL>60, TG<100
    totalCholesterol: rand(180, 30 * (status === "concerning" ? 2 : 1)),
    ldlCholesterol: rand(90, 25 * (status === "concerning" ? 2 : 1)),
    hdlCholesterol: rand(65 * m.low, 15),
    triglycerides: rand(85, 30 * (status === "concerning" ? 2 : 1)),
    apoB: rand(85, 20 * (status === "concerning" ? 1.5 : 1)),

    // Blood Sugar - optimal: FG<90, HbA1c<5.4
    fastingGlucose: rand(85, 10 * (status === "concerning" ? 2 : 1)),
    hba1c: rand(5.2, 0.3 * (status === "concerning" ? 2 : 1)),
    fastingInsulin: rand(5, 3 * (status === "concerning" ? 2 : 1)),
    homaIr: rand(1.0, 0.5 * (status === "concerning" ? 2 : 1)),

    // Inflammation - optimal: hsCRP<1, Homocysteine<10
    hscrp: rand(0.8, 0.5 * (status === "concerning" ? 3 : 1)),
    homocysteine: rand(8, 3 * (status === "concerning" ? 1.5 : 1)),

    // Thyroid - optimal: TSH 1-2.5, FT3 3-4, FT4 1.2-1.8
    tsh: rand(1.8, 0.8),
    freeT3: rand(3.2, 0.5),
    freeT4: rand(1.4, 0.3),

    // Hormones
    testosterone: isMale ? rand(650, 150 * (status === "concerning" ? 1.5 : 1)) : rand(40, 15),
    estradiol: isMale ? rand(25, 10) : rand(150, 75),
    dheas: rand(350, 100),
    cortisol: rand(12, 5),

    // Vitamins & Minerals - optimal: VitD 50-80, B12>500
    vitaminD: rand(55, 20 * (status === "concerning" ? 1.5 : 1)),
    vitaminB12: rand(600, 150),
    ferritin: isMale ? rand(120, 50) : rand(70, 35),
    magnesium: rand(2.1, 0.3),

    // Kidney & Liver
    creatinine: isMale ? rand(1.0, 0.2) : rand(0.85, 0.15),
    egfr: rand(95, 15),
    alt: rand(25, 10 * (status === "concerning" ? 2 : 1)),
    ast: rand(24, 8 * (status === "concerning" ? 2 : 1)),

    // CBC
    hemoglobin: isMale ? rand(15.0, 1.0) : rand(13.5, 1.0),
    whiteBloodCells: rand(6.5, 1.5),
    platelets: rand(250, 50),
  }
}

// Simulate improvement in biomarkers over time
function applyImprovementTrend(
  baseline: FunctionHealthPanel,
  monthsFromBaseline: number,
  isImproving: boolean
): FunctionHealthPanel {
  if (!isImproving || monthsFromBaseline <= 0) {
    return baseline
  }

  // Improvement rate - biomarkers improve gradually
  const rate = Math.min(0.15, monthsFromBaseline * 0.03)

  return {
    ...baseline,
    // Lipids improve
    totalCholesterol: baseline.totalCholesterol * (1 - rate * 0.1),
    ldlCholesterol: baseline.ldlCholesterol * (1 - rate * 0.15),
    hdlCholesterol: baseline.hdlCholesterol * (1 + rate * 0.1),
    triglycerides: baseline.triglycerides * (1 - rate * 0.2),

    // Blood sugar improves
    fastingGlucose: baseline.fastingGlucose * (1 - rate * 0.1),
    hba1c: baseline.hba1c * (1 - rate * 0.05),
    homaIr: baseline.homaIr * (1 - rate * 0.15),

    // Inflammation improves
    hscrp: baseline.hscrp * (1 - rate * 0.3),
    homocysteine: baseline.homocysteine * (1 - rate * 0.1),

    // Vitamin D often improves with supplementation
    vitaminD: baseline.vitaminD * (1 + rate * 0.3),
  }
}

export class FunctionHealthMockClient {
  private status: HealthStatus
  private isMale: boolean
  private baselineDate: Date
  private baselinePanel: FunctionHealthPanel
  private isImproving: boolean

  constructor(
    status: HealthStatus = "normal",
    isMale: boolean = true,
    isImproving: boolean = true,
    baselineDate?: Date
  ) {
    this.status = status
    this.isMale = isMale
    this.isImproving = isImproving
    this.baselineDate = baselineDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    this.baselinePanel = generatePanelForStatus(status, isMale)
  }

  async connect(): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 600))
    return {
      success: true,
      message: "Connected to Function Health (mock)",
    }
  }

  async getLatestPanel(): Promise<FunctionHealthPanel> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const monthsFromBaseline =
      (Date.now() - this.baselineDate.getTime()) / (30 * 24 * 60 * 60 * 1000)
    return applyImprovementTrend(this.baselinePanel, monthsFromBaseline, this.isImproving)
  }

  async getPanelHistory(): Promise<{ date: Date; panel: FunctionHealthPanel }[]> {
    // Function Health typically does quarterly testing
    const history = []
    const now = new Date()
    let currentDate = new Date(this.baselineDate)

    while (currentDate <= now) {
      const monthsFromBaseline =
        (currentDate.getTime() - this.baselineDate.getTime()) / (30 * 24 * 60 * 60 * 1000)
      history.push({
        date: new Date(currentDate),
        panel: applyImprovementTrend(this.baselinePanel, monthsFromBaseline, this.isImproving),
      })
      // Quarterly tests
      currentDate.setMonth(currentDate.getMonth() + 3)
    }

    return history
  }

  transformToMetrics(memberId: string, panel: FunctionHealthPanel, recordedAt: Date) {
    const metrics = []

    // Lipid metrics
    metrics.push(
      {
        memberId,
        category: MetricCategory.LABS,
        metricType: MetricType.TOTAL_CHOLESTEROL,
        value: Math.round(panel.totalCholesterol),
        unit: "mg/dL",
        source: IntegrationSource.FUNCTION_HEALTH,
        recordedAt,
        isVerified: true,
      },
      {
        memberId,
        category: MetricCategory.LABS,
        metricType: MetricType.LDL_CHOLESTEROL,
        value: Math.round(panel.ldlCholesterol),
        unit: "mg/dL",
        source: IntegrationSource.FUNCTION_HEALTH,
        recordedAt,
        isVerified: true,
      },
      {
        memberId,
        category: MetricCategory.LABS,
        metricType: MetricType.HDL_CHOLESTEROL,
        value: Math.round(panel.hdlCholesterol),
        unit: "mg/dL",
        source: IntegrationSource.FUNCTION_HEALTH,
        recordedAt,
        isVerified: true,
      },
      {
        memberId,
        category: MetricCategory.LABS,
        metricType: MetricType.TRIGLYCERIDES,
        value: Math.round(panel.triglycerides),
        unit: "mg/dL",
        source: IntegrationSource.FUNCTION_HEALTH,
        recordedAt,
        isVerified: true,
      }
    )

    // Blood sugar metrics
    metrics.push(
      {
        memberId,
        category: MetricCategory.LABS,
        metricType: MetricType.FASTING_GLUCOSE,
        value: Math.round(panel.fastingGlucose),
        unit: "mg/dL",
        source: IntegrationSource.FUNCTION_HEALTH,
        recordedAt,
        isVerified: true,
      },
      {
        memberId,
        category: MetricCategory.LABS,
        metricType: MetricType.HBA1C,
        value: Math.round(panel.hba1c * 10) / 10,
        unit: "%",
        source: IntegrationSource.FUNCTION_HEALTH,
        recordedAt,
        isVerified: true,
      }
    )

    // Inflammation
    metrics.push({
      memberId,
      category: MetricCategory.LABS,
      metricType: MetricType.HS_CRP,
      value: Math.round(panel.hscrp * 100) / 100,
      unit: "mg/L",
      source: IntegrationSource.FUNCTION_HEALTH,
      recordedAt,
      isVerified: true,
    })

    // Vitamins
    metrics.push({
      memberId,
      category: MetricCategory.LABS,
      metricType: MetricType.VITAMIN_D,
      value: Math.round(panel.vitaminD),
      unit: "ng/mL",
      source: IntegrationSource.FUNCTION_HEALTH,
      recordedAt,
      isVerified: true,
    })

    return metrics
  }
}
