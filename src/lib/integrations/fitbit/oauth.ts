import { prisma } from "@/lib/db/prisma"
import { IntegrationSource, ConnectionStatus } from "@prisma/client"

// Fitbit OAuth2 configuration
const FITBIT_AUTH_URL = "https://www.fitbit.com/oauth2/authorize"
const FITBIT_TOKEN_URL = "https://api.fitbit.com/oauth2/token"

// Scopes for Fitbit Web API
// activity - Activity data (steps, distance, floors, etc.)
// heartrate - Heart rate data and time series
// sleep - Sleep logs and time series
// weight - Body weight and fat percentage
// profile - User profile information
// settings - User account settings
const FITBIT_SCOPES = "activity heartrate sleep weight profile"

// Generate the authorization URL for Fitbit OAuth
export function getAuthorizationUrl(redirectUri: string, state?: string): string {
  const clientId = process.env.FITBIT_CLIENT_ID

  if (!clientId) {
    throw new Error("FITBIT_CLIENT_ID environment variable is not set")
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: FITBIT_SCOPES,
    // Fitbit recommends code_challenge for PKCE, but for server apps, basic flow works
  })

  if (state) {
    params.append("state", state)
  }

  return `${FITBIT_AUTH_URL}?${params.toString()}`
}

// Exchange authorization code for access token
export async function exchangeCodeForToken(
  code: string,
  redirectUri: string
): Promise<FitbitTokenResponse> {
  const clientId = process.env.FITBIT_CLIENT_ID
  const clientSecret = process.env.FITBIT_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("Fitbit credentials are not configured")
  }

  // Fitbit uses Basic Auth for token exchange
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

  const response = await fetch(FITBIT_TOKEN_URL, {
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
    console.error("Fitbit token exchange failed:", errorText)
    throw new Error(`Failed to exchange code for token: ${response.status}`)
  }

  return response.json()
}

// Refresh an expired access token
export async function refreshAccessToken(refreshToken: string): Promise<FitbitTokenResponse> {
  const clientId = process.env.FITBIT_CLIENT_ID
  const clientSecret = process.env.FITBIT_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("Fitbit credentials are not configured")
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

  const response = await fetch(FITBIT_TOKEN_URL, {
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
    console.error("Fitbit token refresh failed:", errorText)
    throw new Error(`Failed to refresh token: ${response.status}`)
  }

  return response.json()
}

// Store Fitbit connection in database
export async function storeFitbitConnection(
  memberId: string,
  tokenResponse: FitbitTokenResponse
): Promise<void> {
  const existingConnection = await prisma.integrationConnection.findFirst({
    where: {
      memberId,
      source: IntegrationSource.FITBIT,
    },
  })

  // Fitbit tokens expire in expires_in seconds (typically 28800 = 8 hours)
  const tokenExpiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000)

  const connectionData = {
    memberId,
    source: IntegrationSource.FITBIT,
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

// Revoke Fitbit access (deauthorize)
export async function revokeAccess(accessToken: string): Promise<boolean> {
  const clientId = process.env.FITBIT_CLIENT_ID
  const clientSecret = process.env.FITBIT_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return false
  }

  try {
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

    const response = await fetch("https://api.fitbit.com/oauth2/revoke", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        token: accessToken,
      }),
    })

    return response.ok
  } catch (error) {
    console.error("Error revoking Fitbit access:", error)
    return false
  }
}

// Types
export interface FitbitTokenResponse {
  access_token: string
  token_type: string
  expires_in: number // seconds until expiration
  refresh_token: string
  scope: string
  user_id: string
}
