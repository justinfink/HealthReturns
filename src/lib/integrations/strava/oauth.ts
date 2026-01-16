import { prisma } from "@/lib/db/prisma"
import { IntegrationSource, ConnectionStatus } from "@prisma/client"

// Strava OAuth2 configuration
const STRAVA_AUTH_URL = "https://www.strava.com/oauth/authorize"
const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token"

// Scopes we need for reading activity and fitness data
// activity:read - Read activity data (distance, time, etc.)
// activity:read_all - Read all activities including private ones
// profile:read_all - Read all profile information
const STRAVA_SCOPES = "activity:read_all,profile:read_all"

// Generate the authorization URL for Strava OAuth
export function getAuthorizationUrl(redirectUri: string, state?: string): string {
  const clientId = process.env.STRAVA_CLIENT_ID

  if (!clientId) {
    throw new Error("STRAVA_CLIENT_ID environment variable is not set")
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: STRAVA_SCOPES,
    approval_prompt: "auto", // "force" to always show auth screen
  })

  if (state) {
    params.append("state", state)
  }

  return `${STRAVA_AUTH_URL}?${params.toString()}`
}

// Exchange authorization code for access token
export async function exchangeCodeForToken(code: string): Promise<StravaTokenResponse> {
  const clientId = process.env.STRAVA_CLIENT_ID
  const clientSecret = process.env.STRAVA_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("Strava credentials are not configured")
  }

  const response = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      grant_type: "authorization_code",
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Strava token exchange failed:", errorText)
    throw new Error(`Failed to exchange code for token: ${response.status}`)
  }

  return response.json()
}

// Refresh an expired access token
export async function refreshAccessToken(refreshToken: string): Promise<StravaTokenResponse> {
  const clientId = process.env.STRAVA_CLIENT_ID
  const clientSecret = process.env.STRAVA_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("Strava credentials are not configured")
  }

  const response = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Strava token refresh failed:", errorText)
    throw new Error(`Failed to refresh token: ${response.status}`)
  }

  return response.json()
}

// Store Strava connection in database
export async function storeStravaConnection(
  memberId: string,
  tokenResponse: StravaTokenResponse
): Promise<void> {
  const existingConnection = await prisma.integrationConnection.findFirst({
    where: {
      memberId,
      source: IntegrationSource.STRAVA,
    },
  })

  const connectionData = {
    memberId,
    source: IntegrationSource.STRAVA,
    status: ConnectionStatus.ACTIVE,
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token,
    tokenExpiresAt: new Date(tokenResponse.expires_at * 1000),
    connectedAt: new Date(),
    lastSyncAt: null,
    lastSyncStatus: null,
  }

  if (existingConnection) {
    await prisma.integrationConnection.update({
      where: { id: existingConnection.id },
      data: connectionData,
    })
  } else {
    await prisma.integrationConnection.create({
      data: connectionData,
    })
  }
}

// Revoke Strava access (deauthorize)
export async function revokeAccess(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch("https://www.strava.com/oauth/deauthorize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    })

    return response.ok
  } catch (error) {
    console.error("Error revoking Strava access:", error)
    return false
  }
}

// Types
export interface StravaTokenResponse {
  token_type: string
  expires_at: number // Unix timestamp
  expires_in: number // Seconds
  refresh_token: string
  access_token: string
  athlete: StravaAthlete
}

export interface StravaAthlete {
  id: number
  username: string | null
  resource_state: number
  firstname: string
  lastname: string
  bio: string | null
  city: string | null
  state: string | null
  country: string | null
  sex: string | null
  premium: boolean
  summit: boolean
  created_at: string
  updated_at: string
  profile: string
  profile_medium: string
}
