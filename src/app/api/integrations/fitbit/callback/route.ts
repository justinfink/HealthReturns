import { NextRequest, NextResponse } from "next/server"
import { exchangeCodeForToken, storeFitbitConnection } from "@/lib/integrations/fitbit/oauth"
import { getFitbitClient } from "@/lib/integrations/fitbit/client"
import { prisma } from "@/lib/db/prisma"

// GET /api/integrations/fitbit/callback - Handle Fitbit OAuth callback
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const state = searchParams.get("state") // This contains the member ID
    const error = searchParams.get("error")

    console.log("Fitbit callback received:", {
      hasCode: !!code,
      state,
      error,
      url: request.url,
    })

    // Check for OAuth error
    if (error) {
      console.error("Fitbit OAuth error:", error)
      return NextResponse.redirect(
        new URL("/employee/connect?error=fitbit_denied", request.url)
      )
    }

    if (!code) {
      console.error("No authorization code received")
      return NextResponse.redirect(
        new URL("/employee/connect?error=missing_code", request.url)
      )
    }

    // Get member ID from state parameter
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
      where: { id: memberId },
    })

    if (!member) {
      console.error("Member not found in database:", memberId)
      return NextResponse.redirect(
        new URL("/employee/connect?error=session_expired", request.url)
      )
    }
    console.log("Member found:", member.email)

    // Build the redirect URI (must match exactly what was sent to Fitbit)
    const origin = request.headers.get("origin") || request.headers.get("host")
    const protocol = request.headers.get("x-forwarded-proto") || "https"
    const appUrl = origin?.startsWith("http") ? origin : `${protocol}://${origin}`
    const redirectUri = `${appUrl}/api/integrations/fitbit/callback`

    console.log("Exchanging code for token...")
    // Exchange code for access token
    const tokenResponse = await exchangeCodeForToken(code, redirectUri)
    console.log("Token exchange successful, user ID:", tokenResponse.user_id)

    // Store the connection in database
    console.log("Storing connection for member:", memberId)
    await storeFitbitConnection(memberId, tokenResponse)
    console.log("Fitbit connection stored successfully")

    // Trigger initial sync (limited to avoid rate limits - just last 7 days)
    console.log("Triggering initial Fitbit sync...")
    try {
      const client = getFitbitClient()
      const syncResult = await client.syncHealthData(memberId, 7)
      console.log("Initial sync completed:", syncResult)
    } catch (syncError) {
      // Don't fail the connection if sync fails - user can retry
      console.error("Initial sync failed (non-fatal):", syncError)
    }

    // Redirect to connect page with success
    return NextResponse.redirect(
      new URL("/employee/connect?connected=fitbit", request.url)
    )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error("Error in Fitbit OAuth callback:", {
      message: errorMessage,
      stack: errorStack,
    })
    return NextResponse.redirect(
      new URL("/employee/connect?error=callback_failed", request.url)
    )
  }
}
