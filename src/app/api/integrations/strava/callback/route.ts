import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { exchangeCodeForToken, storeStravaConnection } from "@/lib/integrations/strava/oauth"

// GET /api/integrations/strava/callback - Handle Strava OAuth callback
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")
    const scope = searchParams.get("scope")

    // Check for OAuth error
    if (error) {
      console.error("Strava OAuth error:", error)
      return NextResponse.redirect(
        new URL("/employee/connect?error=strava_denied", request.url)
      )
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/employee/connect?error=missing_code", request.url)
      )
    }

    // Get stored member ID from cookie
    const cookieStore = await cookies()
    const memberId = cookieStore.get("strava_member_id")?.value

    if (!memberId) {
      return NextResponse.redirect(
        new URL("/employee/connect?error=session_expired", request.url)
      )
    }

    // Verify state matches member ID (if we used state)
    if (state && state !== memberId) {
      console.warn("State mismatch in Strava callback")
    }

    // Exchange code for access token
    const tokenResponse = await exchangeCodeForToken(code)

    // Store the connection in database
    await storeStravaConnection(memberId, tokenResponse)

    // Clear the temporary cookie
    cookieStore.delete("strava_member_id")

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
