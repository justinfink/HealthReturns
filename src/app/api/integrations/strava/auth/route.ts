import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getAuthorizationUrl } from "@/lib/integrations/strava/oauth"
import { prisma } from "@/lib/db/prisma"
import { cookies } from "next/headers"

// POST /api/integrations/strava/auth - Initiate Strava OAuth flow
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get member from database
    const member = await prisma.member.findFirst({
      where: { clerkUserId: userId },
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Build callback URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const callbackUrl = `${appUrl}/api/integrations/strava/callback`

    // Store member ID in cookie for the callback
    const cookieStore = await cookies()
    cookieStore.set("strava_member_id", member.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    })

    // Generate authorization URL
    const authorizationUrl = getAuthorizationUrl(callbackUrl, member.id)

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
