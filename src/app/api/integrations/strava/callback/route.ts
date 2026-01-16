import { NextRequest, NextResponse } from "next/server"
import { exchangeCodeForToken, storeStravaConnection } from "@/lib/integrations/strava/oauth"

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
      scope
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

    console.log("Exchanging code for token...")
    // Exchange code for access token
    const tokenResponse = await exchangeCodeForToken(code)
    console.log("Token exchange successful, storing connection...")

    // Store the connection in database
    await storeStravaConnection(memberId, tokenResponse)
    console.log("Strava connection stored successfully")

    // Redirect to connect page with success
    return NextResponse.redirect(
      new URL("/employee/connect?connected=strava", request.url)
    )
  } catch (error) {
    console.error("Error in Strava OAuth callback:", error)
    return NextResponse.redirect(
      new URL("/employee/connect?error=callback_failed", request.url)
    )
  }
}
