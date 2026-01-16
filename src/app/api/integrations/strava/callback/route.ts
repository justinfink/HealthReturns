import { NextRequest, NextResponse } from "next/server"
import { exchangeCodeForToken, storeStravaConnection } from "@/lib/integrations/strava/oauth"
import { getStravaClient } from "@/lib/integrations/strava/client"
import { prisma } from "@/lib/db/prisma"

// GET /api/integrations/strava/callback - Handle Strava OAuth callback
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const state = searchParams.get("state") // This contains the member ID
    const error = searchParams.get("error")
    const scope = searchParams.get("scope")

    console.log("Strava callback received:", {
      hasCode: !!code,
      state,
      error,
      scope,
      url: request.url
    })

    // Check for OAuth error
    if (error) {
      console.error("Strava OAuth error:", error)
      return NextResponse.redirect(
        new URL("/employee/connect?error=strava_denied", request.url)
      )
    }

    if (!code) {
      console.error("No authorization code received")
      return NextResponse.redirect(
        new URL("/employee/connect?error=missing_code", request.url)
      )
    }

    // Get member ID from state parameter (more reliable than cookies for cross-domain OAuth)
    const memberId = state

    if (!memberId) {
      console.error("No member ID in state parameter")
      return NextResponse.redirect(
        new URL("/employee/connect?error=session_expired", request.url)
      )
    }

    // Verify member exists in database
    console.log("Verifying member exists:", memberId)
    const member = await prisma.member.findUnique({
      where: { id: memberId }
    })

    if (!member) {
      console.error("Member not found in database:", memberId)
      return NextResponse.redirect(
        new URL("/employee/connect?error=session_expired", request.url)
      )
    }
    console.log("Member found:", member.email)

    console.log("Exchanging code for token...")
    // Exchange code for access token
    const tokenResponse = await exchangeCodeForToken(code)
    console.log("Token exchange successful, athlete:", tokenResponse.athlete?.firstname)

    // Store the connection in database
    console.log("Storing connection for member:", memberId)
    await storeStravaConnection(memberId, tokenResponse)
    console.log("Strava connection stored successfully")

    // Trigger initial sync (limited to avoid rate limits - just last 7 days)
    console.log("Triggering initial Strava sync...")
    try {
      const client = getStravaClient()
      const syncResult = await client.syncHealthData(memberId, 7)
      console.log("Initial sync completed:", syncResult)
    } catch (syncError) {
      // Don't fail the connection if sync fails - user can retry
      console.error("Initial sync failed (non-fatal):", syncError)
    }

    // Redirect to connect page with success
    return NextResponse.redirect(
      new URL("/employee/connect?connected=strava", request.url)
    )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error("Error in Strava OAuth callback:", {
      message: errorMessage,
      stack: errorStack
    })
    return NextResponse.redirect(
      new URL("/employee/connect?error=callback_failed", request.url)
    )
  }
}
