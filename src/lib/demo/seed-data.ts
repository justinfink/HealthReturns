import { prisma } from "@/lib/db/prisma"
import {
  MemberLevel,
  MetricCategory,
  MetricType,
  IntegrationSource,
  BaselineStatus,
  ConsentType,
  ConnectionStatus,
  RebateStatus,
  CompanySize,
} from "@prisma/client"

// Demo organization configuration
export const demoOrganization = {
  name: "Acme Health Co",
  slug: "acme-health-demo",
  industry: "Technology",
  size: CompanySize.MEDIUM,
  programConfig: {
    programName: "Wellness Rewards",
    programStartDate: new Date("2025-01-01"),
    baselinePeriodDays: 30,
    evaluationPeriodDays: 90,
    level0Rebate: 0,
    level1Rebate: 5,
    level2Rebate: 15,
    level3Rebate: 30,
    alternativeStandardsEnabled: true,
    alternativeStandardsDescription:
      "Physician attestation, health coaching, or preventive care visits",
  },
}

// Demo employees with different profiles and levels
export const demoMembers = [
  {
    email: "sarah.wellness@demo.com",
    firstName: "Sarah",
    lastName: "Wellness",
    employeeId: "EMP001",
    currentLevel: MemberLevel.LEVEL_3,
    enrolledDaysAgo: 180,
    profile: "athlete",
    integrations: [IntegrationSource.GARMIN, IntegrationSource.FUNCTION_HEALTH],
  },
  {
    email: "mike.active@demo.com",
    firstName: "Mike",
    lastName: "Active",
    employeeId: "EMP002",
    currentLevel: MemberLevel.LEVEL_2,
    enrolledDaysAgo: 120,
    profile: "active",
    integrations: [IntegrationSource.APPLE_HEALTH, IntegrationSource.RENPHO],
  },
  {
    email: "emma.starting@demo.com",
    firstName: "Emma",
    lastName: "Starting",
    employeeId: "EMP003",
    currentLevel: MemberLevel.LEVEL_1,
    enrolledDaysAgo: 45,
    profile: "moderate",
    integrations: [IntegrationSource.GARMIN],
  },
  {
    email: "james.new@demo.com",
    firstName: "James",
    lastName: "New",
    employeeId: "EMP004",
    currentLevel: MemberLevel.LEVEL_0,
    enrolledDaysAgo: 7,
    profile: "sedentary",
    integrations: [],
  },
  {
    email: "lisa.improving@demo.com",
    firstName: "Lisa",
    lastName: "Improving",
    employeeId: "EMP005",
    currentLevel: MemberLevel.LEVEL_2,
    enrolledDaysAgo: 90,
    profile: "improving",
    integrations: [IntegrationSource.APPLE_HEALTH],
  },
]

// Metric profiles for generating realistic data
const metricProfiles: Record<string, Record<MetricType, { baseline: number; current: number; unit: string }>> = {
  athlete: {
    [MetricType.STEPS]: { baseline: 10000, current: 12500, unit: "steps" },
    [MetricType.ACTIVE_MINUTES]: { baseline: 45, current: 60, unit: "min" },
    [MetricType.RESTING_HEART_RATE]: { baseline: 55, current: 52, unit: "bpm" },
    [MetricType.HEART_RATE_VARIABILITY]: { baseline: 60, current: 72, unit: "ms" },
    [MetricType.SLEEP_DURATION]: { baseline: 7.5, current: 8, unit: "hours" },
    [MetricType.WEIGHT]: { baseline: 165, current: 162, unit: "lbs" },
    [MetricType.BODY_FAT_PERCENTAGE]: { baseline: 18, current: 15, unit: "%" },
  } as any,
  active: {
    [MetricType.STEPS]: { baseline: 8000, current: 9500, unit: "steps" },
    [MetricType.ACTIVE_MINUTES]: { baseline: 30, current: 42, unit: "min" },
    [MetricType.RESTING_HEART_RATE]: { baseline: 62, current: 58, unit: "bpm" },
    [MetricType.HEART_RATE_VARIABILITY]: { baseline: 48, current: 55, unit: "ms" },
    [MetricType.SLEEP_DURATION]: { baseline: 7, current: 7.5, unit: "hours" },
    [MetricType.WEIGHT]: { baseline: 175, current: 170, unit: "lbs" },
    [MetricType.BODY_FAT_PERCENTAGE]: { baseline: 22, current: 20, unit: "%" },
  } as any,
  moderate: {
    [MetricType.STEPS]: { baseline: 6000, current: 7200, unit: "steps" },
    [MetricType.ACTIVE_MINUTES]: { baseline: 20, current: 28, unit: "min" },
    [MetricType.RESTING_HEART_RATE]: { baseline: 68, current: 65, unit: "bpm" },
    [MetricType.HEART_RATE_VARIABILITY]: { baseline: 38, current: 42, unit: "ms" },
    [MetricType.SLEEP_DURATION]: { baseline: 6.5, current: 7, unit: "hours" },
    [MetricType.WEIGHT]: { baseline: 185, current: 180, unit: "lbs" },
    [MetricType.BODY_FAT_PERCENTAGE]: { baseline: 26, current: 24, unit: "%" },
  } as any,
  sedentary: {
    [MetricType.STEPS]: { baseline: 3500, current: 4000, unit: "steps" },
    [MetricType.ACTIVE_MINUTES]: { baseline: 10, current: 12, unit: "min" },
    [MetricType.RESTING_HEART_RATE]: { baseline: 75, current: 73, unit: "bpm" },
    [MetricType.HEART_RATE_VARIABILITY]: { baseline: 28, current: 30, unit: "ms" },
    [MetricType.SLEEP_DURATION]: { baseline: 5.5, current: 6, unit: "hours" },
    [MetricType.WEIGHT]: { baseline: 210, current: 208, unit: "lbs" },
    [MetricType.BODY_FAT_PERCENTAGE]: { baseline: 32, current: 31, unit: "%" },
  } as any,
  improving: {
    [MetricType.STEPS]: { baseline: 5000, current: 8000, unit: "steps" },
    [MetricType.ACTIVE_MINUTES]: { baseline: 15, current: 35, unit: "min" },
    [MetricType.RESTING_HEART_RATE]: { baseline: 72, current: 64, unit: "bpm" },
    [MetricType.HEART_RATE_VARIABILITY]: { baseline: 32, current: 45, unit: "ms" },
    [MetricType.SLEEP_DURATION]: { baseline: 6, current: 7.2, unit: "hours" },
    [MetricType.WEIGHT]: { baseline: 195, current: 178, unit: "lbs" },
    [MetricType.BODY_FAT_PERCENTAGE]: { baseline: 28, current: 22, unit: "%" },
  } as any,
}

// Generate historical metrics for a member
function generateMetricHistory(
  memberId: string,
  profile: string,
  daysBack: number,
  source: IntegrationSource
) {
  const metrics: any[] = []
  const profileData = metricProfiles[profile] || metricProfiles.moderate

  for (const [metricTypeStr, data] of Object.entries(profileData)) {
    const metricType = metricTypeStr as MetricType
    const { baseline, current, unit } = data

    // Generate daily data points
    for (let day = daysBack; day >= 0; day--) {
      const date = new Date()
      date.setDate(date.getDate() - day)

      // Linear interpolation from baseline to current with some randomness
      const progress = 1 - day / daysBack
      const interpolated = baseline + (current - baseline) * progress
      const noise = (Math.random() - 0.5) * Math.abs(current - baseline) * 0.3
      const value = Math.max(0, interpolated + noise)

      // Determine category based on metric type
      let category: MetricCategory
      const activityTypes: MetricType[] = [MetricType.STEPS, MetricType.ACTIVE_MINUTES, MetricType.DISTANCE]
      const heartTypes: MetricType[] = [MetricType.RESTING_HEART_RATE, MetricType.HEART_RATE_VARIABILITY]
      const sleepTypes: MetricType[] = [MetricType.SLEEP_DURATION]
      const bodyTypes: MetricType[] = [MetricType.WEIGHT, MetricType.BODY_FAT_PERCENTAGE, MetricType.BMI]

      if (activityTypes.includes(metricType)) {
        category = MetricCategory.ACTIVITY
      } else if (heartTypes.includes(metricType)) {
        category = MetricCategory.HEART
      } else if (sleepTypes.includes(metricType)) {
        category = MetricCategory.SLEEP
      } else if (bodyTypes.includes(metricType)) {
        category = MetricCategory.BODY
      } else {
        category = MetricCategory.LABS
      }

      metrics.push({
        memberId,
        category,
        metricType,
        value: Math.round(value * 100) / 100,
        unit,
        source,
        recordedAt: date,
        isVerified: true,
      })
    }
  }

  return metrics
}

// Seed the database with demo data
export async function seedDemoData(clerkOrganizationId: string) {
  console.log("Starting demo data seed...")

  // Check if demo org already exists
  const existingOrg = await prisma.organization.findFirst({
    where: { slug: demoOrganization.slug },
  })

  if (existingOrg) {
    console.log("Demo organization already exists, skipping seed")
    return existingOrg
  }

  // Create organization
  const org = await prisma.organization.create({
    data: {
      clerkOrganizationId,
      name: demoOrganization.name,
      slug: demoOrganization.slug,
      industry: demoOrganization.industry,
      size: demoOrganization.size,
      isDemo: true,
      programConfig: {
        create: {
          programName: demoOrganization.programConfig.programName,
          programStartDate: demoOrganization.programConfig.programStartDate,
          baselinePeriodDays: demoOrganization.programConfig.baselinePeriodDays,
          evaluationPeriodDays: demoOrganization.programConfig.evaluationPeriodDays,
          level0Rebate: demoOrganization.programConfig.level0Rebate,
          level1Rebate: demoOrganization.programConfig.level1Rebate,
          level2Rebate: demoOrganization.programConfig.level2Rebate,
          level3Rebate: demoOrganization.programConfig.level3Rebate,
          alternativeStandardsEnabled: demoOrganization.programConfig.alternativeStandardsEnabled,
          alternativeStandardsDescription: demoOrganization.programConfig.alternativeStandardsDescription,
        },
      },
    },
  })

  console.log(`Created demo organization: ${org.name}`)

  // Create members
  for (const memberData of demoMembers) {
    const enrolledAt = new Date()
    enrolledAt.setDate(enrolledAt.getDate() - memberData.enrolledDaysAgo)

    const member = await prisma.member.create({
      data: {
        clerkUserId: `demo_${memberData.employeeId}`,
        organizationId: org.id,
        email: memberData.email,
        firstName: memberData.firstName,
        lastName: memberData.lastName,
        employeeId: memberData.employeeId,
        currentLevel: memberData.currentLevel,
        enrolledAt,
        levelUpdatedAt: new Date(),
        isDemo: true,
      },
    })

    console.log(`Created member: ${member.firstName} ${member.lastName}`)

    // Create consents
    const consentTypes = [
      ConsentType.PROGRAM_PARTICIPATION,
      ConsentType.DATA_COLLECTION,
      ConsentType.DATA_SHARING_AGGREGATE,
    ]

    for (const consentType of consentTypes) {
      await prisma.consentRecord.create({
        data: {
          memberId: member.id,
          consentType,
          granted: true,
          grantedAt: enrolledAt,
        },
      })
    }

    // Create integration connections
    for (const source of memberData.integrations) {
      await prisma.integrationConnection.create({
        data: {
          memberId: member.id,
          source,
          status: ConnectionStatus.ACTIVE,
          connectedAt: enrolledAt,
          lastSyncAt: new Date(),
          lastSyncStatus: "SUCCESS",
        },
      })
    }

    // Generate metrics history
    const primarySource = memberData.integrations[0] || IntegrationSource.MANUAL_ENTRY
    const metrics = generateMetricHistory(
      member.id,
      memberData.profile,
      memberData.enrolledDaysAgo,
      primarySource
    )

    // Batch insert metrics
    await prisma.biometricMetric.createMany({
      data: metrics,
    })

    console.log(`Created ${metrics.length} metrics for ${member.firstName}`)

    // Create baseline snapshot
    if (memberData.currentLevel !== MemberLevel.LEVEL_0) {
      const baselineStart = new Date(enrolledAt)
      const baselineEnd = new Date(enrolledAt)
      baselineEnd.setDate(baselineEnd.getDate() + 30)

      const profileData = metricProfiles[memberData.profile] || metricProfiles.moderate
      const baselineMetrics: Record<string, any> = {}

      for (const [metricType, data] of Object.entries(profileData)) {
        baselineMetrics[metricType] = {
          avg: data.baseline,
          min: data.baseline * 0.9,
          max: data.baseline * 1.1,
          count: 30,
        }
      }

      await prisma.baselineSnapshot.create({
        data: {
          memberId: member.id,
          periodStart: baselineStart,
          periodEnd: baselineEnd,
          status: BaselineStatus.COMPLETE,
          metrics: baselineMetrics,
          finalizedAt: baselineEnd,
        },
      })
    }

    // Create rebate history for higher levels
    if (memberData.currentLevel !== MemberLevel.LEVEL_0) {
      const rebatePercentage =
        memberData.currentLevel === MemberLevel.LEVEL_3
          ? 30
          : memberData.currentLevel === MemberLevel.LEVEL_2
            ? 15
            : 5

      // Last quarter rebate
      await prisma.rebateRecord.create({
        data: {
          memberId: member.id,
          level: memberData.currentLevel,
          rebatePercentage,
          periodStart: new Date("2025-10-01"),
          periodEnd: new Date("2025-12-31"),
          status: RebateStatus.DISBURSED,
          processedAt: new Date("2026-01-15"),
        },
      })
    }

    // Create level history
    if (memberData.currentLevel !== MemberLevel.LEVEL_0) {
      const levels = [MemberLevel.LEVEL_0, MemberLevel.LEVEL_1, MemberLevel.LEVEL_2, MemberLevel.LEVEL_3]
      const currentIndex = levels.indexOf(memberData.currentLevel)

      for (let i = 0; i < currentIndex; i++) {
        const changeDate = new Date(enrolledAt)
        changeDate.setDate(changeDate.getDate() + (i + 1) * 30)

        await prisma.levelHistory.create({
          data: {
            memberId: member.id,
            previousLevel: levels[i],
            newLevel: levels[i + 1],
            reason: i === 0 ? "Baseline captured" : "Met improvement thresholds",
            changedAt: changeDate,
          },
        })
      }
    }
  }

  console.log("Demo data seed completed!")
  return org
}

// Clear demo data
export async function clearDemoData() {
  const demoOrg = await prisma.organization.findFirst({
    where: { slug: demoOrganization.slug },
  })

  if (!demoOrg) {
    console.log("No demo organization found")
    return
  }

  // Delete in correct order due to foreign keys
  await prisma.biometricMetric.deleteMany({
    where: { member: { organizationId: demoOrg.id } },
  })
  await prisma.baselineSnapshot.deleteMany({
    where: { member: { organizationId: demoOrg.id } },
  })
  await prisma.levelHistory.deleteMany({
    where: { member: { organizationId: demoOrg.id } },
  })
  await prisma.rebateRecord.deleteMany({
    where: { member: { organizationId: demoOrg.id } },
  })
  await prisma.consentRecord.deleteMany({
    where: { member: { organizationId: demoOrg.id } },
  })
  await prisma.integrationConnection.deleteMany({
    where: { member: { organizationId: demoOrg.id } },
  })
  await prisma.member.deleteMany({
    where: { organizationId: demoOrg.id },
  })
  await prisma.levelRule.deleteMany({
    where: { organizationId: demoOrg.id },
  })
  await prisma.programConfig.deleteMany({
    where: { organizationId: demoOrg.id },
  })
  await prisma.organization.delete({
    where: { id: demoOrg.id },
  })

  console.log("Demo data cleared!")
}

// Get demo data for UI (without database)
export function getDemoDataForUI() {
  return {
    organization: demoOrganization,
    members: demoMembers.map((m) => ({
      ...m,
      metrics: metricProfiles[m.profile] || metricProfiles.moderate,
    })),
  }
}
