import { prisma } from "@/lib/db/prisma"
import { IntegrationSource, ConnectionStatus } from "@prisma/client"

// Oura OAuth2 configuration
const OURA_AUTH_URL = "https://cloud.ouraring.com/oauth/authorize"
const OURA_TOKEN_URL = "https://api.ouraring.com/oauth/token"

// Scopes for Oura API v2
// daily - Daily activity, readiness, and sleep summaries
// heartrate - Heart rate data
// personal - Personal info (name, email, age)
// session - Session data (meditation, breathing, etc.)
// workout - Workout data
const OURA_SCOPES = "daily heartrate personal session workout"

// Generate the authorization URL for Oura OAuth
export function getAuthorizationUrl(redirectUri: string, state?: string): string {
  const clientId = process.env.OURA_CLIENT_ID

  if (!clientId) {
    throw new Error("OURA_CLIENT_ID environment variable is not set")
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: OURA_SCOPES,
  })

  if (state) {
    params.append("state", state)
  }

  return `${OURA_AUTH_URL}?${params.toString()}`
}

// Exchange authorization code for access token
export async function exchangeCodeForToken(
  code: string,
  redirectUri: string
): Promise<OuraTokenResponse> {
  const clientId = process.env.OURA_CLIENT_ID
  const clientSecret = process.env.OURA_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("Oura credentials are not configured")
  }

  const response = await fetch(OURA_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Oura token exchange failed:", errorText)
    throw new Error(`Failed to exchange code for token: ${response.status}`)
  }

  return response.json()
}

// Refresh an expired access token
export async function refreshAccessToken(refreshToken: string): Promise<OuraTokenResponse> {
  const clientId = process.env.OURA_CLIENT_ID
  const clientSecret = process.env.OURA_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("Oura credentials are not configured")
  }

  const response = await fetch(OURA_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Oura token refresh failed:", errorText)
    throw new Error(`Failed to refresh token: ${response.status}`)
  }

  return response.json()
}

// Store Oura connection in database
export async function storeOuraConnection(
  memberId: string,
  tokenResponse: OuraTokenResponse
): Promise<void> {
  const existingConnection = await prisma.integrationConnection.findFirst({
    where: {
      memberId,
      source: IntegrationSource.OURA,
    },
  })

  // Oura tokens expire in expires_in seconds (typically 86400 = 24 hours)
  const tokenExpiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000)

  const connectionData = {
    memberId,
    source: IntegrationSource.OURA,
    status: ConnectionStatus.ACTIVE,
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token,
    tokenExpiresAt,
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

// Revoke Oura access (deauthorize)
export async function revokeAccess(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch("https://api.ouraring.com/oauth/revoke", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        token: accessToken,
      }),
    })

    return response.ok
  } catch (error) {
    console.error("Error revoking Oura access:", error)
    return false
  }
}

// Types
export interface OuraTokenResponse {
  access_token: string
  token_type: string
  expires_in: number // seconds until expiration
  refresh_token: string
  scope: string
}
