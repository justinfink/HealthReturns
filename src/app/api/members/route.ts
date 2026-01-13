import { NextRequest, NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db/prisma"
import { ConsentType } from "@prisma/client"

// GET /api/members - Get current user's member profile
export async function GET() {
  try {
    const { userId, orgId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const member = await prisma.member.findFirst({
      where: { clerkUserId: userId },
      include: {
        organization: {
          include: { programConfig: true },
        },
        integrations: true,
        consents: true,
        _count: {
          select: {
            metrics: true,
            rebates: true,
          },
        },
      },
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Calculate some stats
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentMetrics = await prisma.biometricMetric.count({
      where: {
        memberId: member.id,
        recordedAt: { gte: thirtyDaysAgo },
      },
    })

    return NextResponse.json({
      id: member.id,
      email: member.email,
      firstName: member.firstName,
      lastName: member.lastName,
      currentLevel: member.currentLevel,
      enrolledAt: member.enrolledAt,
      levelUpdatedAt: member.levelUpdatedAt,
      organization: {
        id: member.organization.id,
        name: member.organization.name,
        programConfig: member.organization.programConfig,
      },
      integrations: member.integrations.map((i) => ({
        source: i.source,
        status: i.status,
        lastSyncAt: i.lastSyncAt,
      })),
      consents: member.consents.map((c) => ({
        type: c.consentType,
        granted: c.granted,
        grantedAt: c.grantedAt,
      })),
      stats: {
        totalMetrics: member._count.metrics,
        recentMetrics,
        totalRebates: member._count.rebates,
      },
    })
  } catch (error) {
    console.error("Error getting member:", error)
    return NextResponse.json(
      { error: "Failed to get member profile" },
      { status: 500 }
    )
  }
}

// POST /api/members - Create or update member profile (enrollment)
export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await request.json()

    // Check if member already exists
    let member = await prisma.member.findFirst({
      where: { clerkUserId: userId },
    })

    if (member) {
      // Update existing member
      member = await prisma.member.update({
        where: { id: member.id },
        data: {
          email: user.emailAddresses[0]?.emailAddress || member.email,
          firstName: user.firstName || member.firstName,
          lastName: user.lastName || member.lastName,
        },
      })

      return NextResponse.json({
        success: true,
        message: "Member profile updated",
        member: {
          id: member.id,
          email: member.email,
          currentLevel: member.currentLevel,
        },
      })
    }

    // Get or create organization
    let organization = await prisma.organization.findFirst({
      where: orgId ? { clerkOrganizationId: orgId } : { isDemo: true },
    })

    if (!organization) {
      // Create a default organization for demo purposes
      organization = await prisma.organization.create({
        data: {
          clerkOrganizationId: orgId || `default_${userId}`,
          name: body.organizationName || "My Company",
          slug: `company-${Date.now()}`,
          isDemo: !orgId,
          programConfig: {
            create: {
              programName: "Wellness Rewards",
              programStartDate: new Date(),
              level0Rebate: 0,
              level1Rebate: 5,
              level2Rebate: 15,
              level3Rebate: 30,
            },
          },
        },
      })
    }

    // Create new member
    member = await prisma.member.create({
      data: {
        clerkUserId: userId,
        organizationId: organization.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        enrolledAt: new Date(),
      },
    })

    // Create default consents (all required ones)
    const requiredConsents = [
      ConsentType.PROGRAM_PARTICIPATION,
      ConsentType.DATA_COLLECTION,
    ]

    for (const consentType of requiredConsents) {
      await prisma.consentRecord.create({
        data: {
          memberId: member.id,
          consentType,
          granted: true,
          grantedAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Member enrolled successfully",
      member: {
        id: member.id,
        email: member.email,
        currentLevel: member.currentLevel,
        enrolledAt: member.enrolledAt,
      },
    })
  } catch (error) {
    console.error("Error creating/updating member:", error)
    return NextResponse.json(
      { error: "Failed to process member enrollment" },
      { status: 500 }
    )
  }
}
