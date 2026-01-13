import { NextRequest, NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { getRequestToken } from "@/lib/integrations/garmin/oauth"
import { prisma } from "@/lib/db/prisma"
import { cookies } from "next/headers"

// POST /api/integrations/garmin/auth - Initiate Garmin OAuth flow
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
    const callbackUrl = `${appUrl}/api/integrations/garmin/callback`

    // Get request token from Garmin
    const { requestToken, requestTokenSecret, authorizationUrl } =
      await getRequestToken(callbackUrl)

    // Store request token secret in a secure HTTP-only cookie
    // This is needed for the callback step
    const cookieStore = await cookies()
    cookieStore.set("garmin_request_token", requestToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    })
    cookieStore.set("garmin_request_token_secret", requestTokenSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    })
    cookieStore.set("garmin_member_id", member.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    })

    return NextResponse.json({
      authorizationUrl,
      message: "Redirect user to authorization URL",
    })
  } catch (error) {
    console.error("Error initiating Garmin OAuth:", error)
    return NextResponse.json(
      { error: "Failed to initiate Garmin authentication" },
      { status: 500 }
    )
  }
}

// GET /api/integrations/garmin/auth - Get current Garmin connection status
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
          where: { source: "GARMIN" },
        },
      },
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    const garminConnection = member.integrations[0]

    if (!garminConnection) {
      return NextResponse.json({
        connected: false,
        status: null,
        lastSyncAt: null,
      })
    }

    return NextResponse.json({
      connected: garminConnection.status === "ACTIVE",
      status: garminConnection.status,
      lastSyncAt: garminConnection.lastSyncAt,
      lastSyncStatus: garminConnection.lastSyncStatus,
    })
  } catch (error) {
    console.error("Error getting Garmin connection status:", error)
    return NextResponse.json(
      { error: "Failed to get connection status" },
      { status: 500 }
    )
  }
}

// DELETE /api/integrations/garmin/auth - Disconnect Garmin
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
        source: "GARMIN",
      },
      data: {
        status: "DISCONNECTED",
        accessToken: null,
        refreshToken: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error disconnecting Garmin:", error)
    return NextResponse.json(
      { error: "Failed to disconnect Garmin" },
      { status: 500 }
    )
  }
}
