import { prisma } from "@/lib/db/prisma"
import { IntegrationSource, ConnectionStatus } from "@prisma/client"
import crypto from "crypto"

// Garmin OAuth 1.0a configuration
// Note: Garmin uses OAuth 1.0a which is more complex than OAuth 2.0
const GARMIN_CONSUMER_KEY = process.env.GARMIN_CONSUMER_KEY || ""
const GARMIN_CONSUMER_SECRET = process.env.GARMIN_CONSUMER_SECRET || ""
const GARMIN_REQUEST_TOKEN_URL = "https://connectapi.garmin.com/oauth-service/oauth/request_token"
const GARMIN_AUTHORIZE_URL = "https://connect.garmin.com/oauthConfirm"
const GARMIN_ACCESS_TOKEN_URL = "https://connectapi.garmin.com/oauth-service/oauth/access_token"

interface OAuthToken {
  token: string
  tokenSecret: string
}

interface RequestTokenResult {
  requestToken: string
  requestTokenSecret: string
  authorizationUrl: string
}

// Generate OAuth signature for requests
function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string = ""
): string {
  // Sort parameters alphabetically
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join("&")

  // Create signature base string
  const signatureBaseString = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(sortedParams),
  ].join("&")

  // Create signing key
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`

  // Generate HMAC-SHA1 signature
  const signature = crypto
    .createHmac("sha1", signingKey)
    .update(signatureBaseString)
    .digest("base64")

  return signature
}

// Generate OAuth nonce
function generateNonce(): string {
  return crypto.randomBytes(16).toString("hex")
}

// Get OAuth timestamp
function getTimestamp(): string {
  return Math.floor(Date.now() / 1000).toString()
}

// Step 1: Get request token
export async function getRequestToken(callbackUrl: string): Promise<RequestTokenResult> {
  const timestamp = getTimestamp()
  const nonce = generateNonce()

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: GARMIN_CONSUMER_KEY,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: timestamp,
    oauth_nonce: nonce,
    oauth_version: "1.0",
    oauth_callback: callbackUrl,
  }

  const signature = generateOAuthSignature(
    "POST",
    GARMIN_REQUEST_TOKEN_URL,
    oauthParams,
    GARMIN_CONSUMER_SECRET
  )

  oauthParams.oauth_signature = signature

  // Build Authorization header
  const authHeader =
    "OAuth " +
    Object.keys(oauthParams)
      .map((key) => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
      .join(", ")

  const response = await fetch(GARMIN_REQUEST_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: authHeader,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to get request token: ${errorText}`)
  }

  const responseText = await response.text()
  const params = new URLSearchParams(responseText)

  const requestToken = params.get("oauth_token") || ""
  const requestTokenSecret = params.get("oauth_token_secret") || ""

  const authorizationUrl = `${GARMIN_AUTHORIZE_URL}?oauth_token=${encodeURIComponent(requestToken)}`

  return {
    requestToken,
    requestTokenSecret,
    authorizationUrl,
  }
}

// Step 2: Exchange verifier for access token
export async function getAccessToken(
  requestToken: string,
  requestTokenSecret: string,
  oauthVerifier: string
): Promise<OAuthToken> {
  const timestamp = getTimestamp()
  const nonce = generateNonce()

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: GARMIN_CONSUMER_KEY,
    oauth_token: requestToken,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: timestamp,
    oauth_nonce: nonce,
    oauth_version: "1.0",
    oauth_verifier: oauthVerifier,
  }

  const signature = generateOAuthSignature(
    "POST",
    GARMIN_ACCESS_TOKEN_URL,
    oauthParams,
    GARMIN_CONSUMER_SECRET,
    requestTokenSecret
  )

  oauthParams.oauth_signature = signature

  const authHeader =
    "OAuth " +
    Object.keys(oauthParams)
      .map((key) => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
      .join(", ")

  const response = await fetch(GARMIN_ACCESS_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: authHeader,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to get access token: ${errorText}`)
  }

  const responseText = await response.text()
  const params = new URLSearchParams(responseText)

  return {
    token: params.get("oauth_token") || "",
    tokenSecret: params.get("oauth_token_secret") || "",
  }
}

// Store OAuth tokens in database
export async function storeGarminConnection(
  memberId: string,
  accessToken: string,
  accessTokenSecret: string
): Promise<void> {
  // Check if connection already exists
  const existingConnection = await prisma.integrationConnection.findFirst({
    where: {
      memberId,
      source: IntegrationSource.GARMIN,
    },
  })

  if (existingConnection) {
    // Update existing connection
    await prisma.integrationConnection.update({
      where: { id: existingConnection.id },
      data: {
        accessToken: encryptToken(accessToken),
        refreshToken: encryptToken(accessTokenSecret), // Store secret as "refresh token"
        status: ConnectionStatus.ACTIVE,
        lastSyncAt: null,
        lastSyncStatus: null,
      },
    })
  } else {
    // Create new connection
    await prisma.integrationConnection.create({
      data: {
        memberId,
        source: IntegrationSource.GARMIN,
        accessToken: encryptToken(accessToken),
        refreshToken: encryptToken(accessTokenSecret),
        status: ConnectionStatus.ACTIVE,
      },
    })
  }
}

// Simple encryption for storing tokens
// In production, use a proper encryption service
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-key-32-bytes-long!!!!!"

export function encryptToken(token: string): string {
  const iv = crypto.randomBytes(16)
  const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32)
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv)
  let encrypted = cipher.update(token, "utf8", "hex")
  encrypted += cipher.final("hex")
  return iv.toString("hex") + ":" + encrypted
}

export function decryptToken(encryptedToken: string): string {
  const [ivHex, encrypted] = encryptedToken.split(":")
  const iv = Buffer.from(ivHex, "hex")
  const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32)
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv)
  let decrypted = decipher.update(encrypted, "hex", "utf8")
  decrypted += decipher.final("utf8")
  return decrypted
}

// Disconnect Garmin
export async function disconnectGarmin(memberId: string): Promise<void> {
  await prisma.integrationConnection.updateMany({
    where: {
      memberId,
      source: IntegrationSource.GARMIN,
    },
    data: {
      status: ConnectionStatus.DISCONNECTED,
      accessToken: null,
      refreshToken: null,
    },
  })
}
