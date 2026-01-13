import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getAccessToken, storeGarminConnection } from "@/lib/integrations/garmin/oauth"

// GET /api/integrations/garmin/callback - Handle Garmin OAuth callback
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const oauthToken = searchParams.get("oauth_token")
    const oauthVerifier = searchParams.get("oauth_verifier")

    // Check for OAuth error
    if (!oauthToken || !oauthVerifier) {
      const denied = searchParams.get("denied")
      if (denied) {
        // User denied access
        return NextResponse.redirect(
          new URL("/employee/connect?error=denied", request.url)
        )
      }
      return NextResponse.redirect(
        new URL("/employee/connect?error=missing_params", request.url)
      )
    }

    // Get stored request token secret from cookie
    const cookieStore = await cookies()
    const storedRequestToken = cookieStore.get("garmin_request_token")?.value
    const requestTokenSecret = cookieStore.get("garmin_request_token_secret")?.value
    const memberId = cookieStore.get("garmin_member_id")?.value

    if (!storedRequestToken || !requestTokenSecret || !memberId) {
      return NextResponse.redirect(
        new URL("/employee/connect?error=session_expired", request.url)
      )
    }

    // Verify request token matches
    if (storedRequestToken !== oauthToken) {
      return NextResponse.redirect(
        new URL("/employee/connect?error=token_mismatch", request.url)
      )
    }

    // Exchange verifier for access token
    const { token: accessToken, tokenSecret: accessTokenSecret } =
      await getAccessToken(oauthToken, requestTokenSecret, oauthVerifier)

    // Store the connection in database
    await storeGarminConnection(memberId, accessToken, accessTokenSecret)

    // Clear the temporary cookies
    cookieStore.delete("garmin_request_token")
    cookieStore.delete("garmin_request_token_secret")
    cookieStore.delete("garmin_member_id")

    // Redirect to connect page with success
    return NextResponse.redirect(
      new URL("/employee/connect?connected=garmin", request.url)
    )
  } catch (error) {
    console.error("Error in Garmin OAuth callback:", error)
    return NextResponse.redirect(
      new URL("/employee/connect?error=callback_failed", request.url)
    )
  }
}
