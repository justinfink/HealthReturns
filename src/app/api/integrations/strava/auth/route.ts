import { NextRequest, NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { getAuthorizationUrl } from "@/lib/integrations/strava/oauth"
import { prisma } from "@/lib/db/prisma"
import { ConsentType } from "@prisma/client"

// POST /api/integrations/strava/auth - Initiate Strava OAuth flow
export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get member from database, or auto-enroll if they don't exist
    let member = await prisma.member.findFirst({
      where: { clerkUserId: userId },
    })

    if (!member) {
      // Auto-enroll the member
      const user = await currentUser()
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      // Get or create organization
      let organization = await prisma.organization.findFirst({
        where: orgId ? { clerkOrganizationId: orgId } : { isDemo: true },
      })

      if (!organization) {
        organization = await prisma.organization.create({
          data: {
            clerkOrganizationId: orgId || `default_${userId}`,
            name: "My Company",
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

      // Create default consents
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
    }

    // Build callback URL using the request origin (works for both local and production)
    const origin = request.headers.get("origin") || request.headers.get("host")
    const protocol = request.headers.get("x-forwarded-proto") || "https"
    const appUrl = origin?.startsWith("http") ? origin : `${protocol}://${origin}`
    const callbackUrl = `${appUrl}/api/integrations/strava/callback`

    console.log("Strava auth - member ID:", member.id)
    console.log("Strava auth - callback URL:", callbackUrl)

    // Generate authorization URL with member ID as state parameter
    // Using state parameter is more reliable than cookies for cross-domain OAuth
    const authorizationUrl = getAuthorizationUrl(callbackUrl, member.id)
    console.log("Strava auth - authorization URL generated")

    return NextResponse.json({
      authorizationUrl,
      message: "Redirect user to authorization URL",
    })
  } catch (error) {
    console.error("Error initiating Strava OAuth:", error)
    return NextResponse.json(
      { error: "Failed to initiate Strava authentication" },
      { status: 500 }
    )
  }
}

// GET /api/integrations/strava/auth - Get current Strava connection status
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
          where: { source: "STRAVA" },
        },
      },
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    const stravaConnection = member.integrations[0]

    if (!stravaConnection) {
      return NextResponse.json({
        connected: false,
        status: null,
        lastSyncAt: null,
      })
    }

    return NextResponse.json({
      connected: stravaConnection.status === "ACTIVE",
      status: stravaConnection.status,
      lastSyncAt: stravaConnection.lastSyncAt,
      lastSyncStatus: stravaConnection.lastSyncStatus,
    })
  } catch (error) {
    console.error("Error getting Strava connection status:", error)
    return NextResponse.json(
      { error: "Failed to get connection status" },
      { status: 500 }
    )
  }
}

// DELETE /api/integrations/strava/auth - Disconnect Strava
export async function DELETE() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const member = await prisma.member.findFirst({
      where: { clerkUserId: userId },
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Update connection status to disconnected
    await prisma.integrationConnection.updateMany({
      where: {
        memberId: member.id,
        source: "STRAVA",
      },
      data: {
        status: "DISCONNECTED",
        accessToken: null,
        refreshToken: null,
        disconnectedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error disconnecting Strava:", error)
    return NextResponse.json(
      { error: "Failed to disconnect Strava" },
      { status: 500 }
    )
  }
}
