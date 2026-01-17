import { prisma } from "@/lib/db/prisma"
import { IntegrationSource, ConnectionStatus } from "@prisma/client"

// WHOOP OAuth2 configuration
const WHOOP_AUTH_URL = "https://api.prod.whoop.com/oauth/oauth2/auth"
const WHOOP_TOKEN_URL = "https://api.prod.whoop.com/oauth/oauth2/token"

// Scopes for WHOOP API v2
// read:recovery - Recovery data (HRV, resting HR, etc.)
// read:cycles - Daily physiological cycles
// read:sleep - Sleep data
// read:workout - Workout/strain data
// read:profile - User profile information
// read:body_measurement - Body measurements
const WHOOP_SCOPES = "read:recovery read:cycles read:sleep read:workout read:profile read:body_measurement"

// Generate the authorization URL for WHOOP OAuth
export function getAuthorizationUrl(redirectUri: string, state?: string): string {
  const clientId = process.env.WHOOP_CLIENT_ID

  if (!clientId) {
    throw new Error("WHOOP_CLIENT_ID environment variable is not set")
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: WHOOP_SCOPES,
  })

  if (state) {
    params.append("state", state)
  }

  return `${WHOOP_AUTH_URL}?${params.toString()}`
}

// Exchange authorization code for access token
export async function exchangeCodeForToken(
  code: string,
  redirectUri: string
): Promise<WhoopTokenResponse> {
  const clientId = process.env.WHOOP_CLIENT_ID
  const clientSecret = process.env.WHOOP_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("WHOOP credentials are not configured")
  }

  // WHOOP uses Basic Auth for token exchange
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

  const response = await fetch(WHOOP_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("WHOOP token exchange failed:", errorText)
    throw new Error(`Failed to exchange code for token: ${response.status}`)
  }

  return response.json()
}

// Refresh an expired access token
export async function refreshAccessToken(refreshToken: string): Promise<WhoopTokenResponse> {
  const clientId = process.env.WHOOP_CLIENT_ID
  const clientSecret = process.env.WHOOP_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("WHOOP credentials are not configured")
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

  const response = await fetch(WHOOP_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("WHOOP token refresh failed:", errorText)
    throw new Error(`Failed to refresh token: ${response.status}`)
  }

  return response.json()
}

// Store WHOOP connection in database
export async function storeWhoopConnection(
  memberId: string,
  tokenResponse: WhoopTokenResponse
): Promise<void> {
  const existingConnection = await prisma.integrationConnection.findFirst({
    where: {
      memberId,
      source: IntegrationSource.WHOOP,
    },
  })

  // WHOOP tokens expire in expires_in seconds
  const tokenExpiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000)

  const connectionData = {
    memberId,
    source: IntegrationSource.WHOOP,
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

// Revoke WHOOP access (deauthorize)
export async function revokeAccess(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch("https://api.prod.whoop.com/oauth/oauth2/revoke", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${accessToken}`,
      },
      body: new URLSearchParams({
        token: accessToken,
      }),
    })

    return response.ok
  } catch (error) {
    console.error("Error revoking WHOOP access:", error)
    return false
  }
}

// Types
export interface WhoopTokenResponse {
  access_token: string
  token_type: string
  expires_in: number // seconds until expiration
  refresh_token: string
  scope: string
}
