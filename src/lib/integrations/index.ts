// Integration clients index
// Exports all integration clients for easy access

export { GarminClient, getGarminClient, transformGarminToMetrics } from "./garmin/client"
export {
  getRequestToken,
  getAccessToken,
  storeGarminConnection,
  disconnectGarmin,
  encryptToken,
  decryptToken,
} from "./garmin/oauth"

export { StravaClient, getStravaClient, transformStravaActivityToMetrics } from "./strava/client"
export {
  getAuthorizationUrl as getStravaAuthorizationUrl,
  exchangeCodeForToken as exchangeStravaCodeForToken,
  storeStravaConnection,
} from "./strava/oauth"

export { AppleHealthMockClient } from "./apple-health/mock-client"
export { RenphoMockClient } from "./renpho/mock-client"
export { FunctionHealthMockClient } from "./function-health/mock-client"

import { IntegrationSource } from "@prisma/client"

// Integration metadata
export const integrationMetadata: Record<
  IntegrationSource,
  {
    name: string
    description: string
    icon: string
    isReal: boolean
    requiresOAuth: boolean
  }
> = {
  [IntegrationSource.GARMIN]: {
    name: "Garmin Connect",
    description: "Sync steps, heart rate, sleep, and activity data from Garmin devices",
    icon: "garmin",
    isReal: true,
    requiresOAuth: true,
  },
  [IntegrationSource.STRAVA]: {
    name: "Strava",
    description: "Sync running, cycling, and workout data from Strava",
    icon: "strava",
    isReal: true,
    requiresOAuth: true,
  },
  [IntegrationSource.APPLE_HEALTH]: {
    name: "Apple Health",
    description: "Import health data from your iPhone and Apple Watch",
    icon: "apple",
    isReal: false, // Mock in web app, would be real in native app
    requiresOAuth: false,
  },
  [IntegrationSource.RENPHO]: {
    name: "Renpho Smart Scale",
    description: "Sync weight, body fat, muscle mass, and more",
    icon: "scale",
    isReal: false, // Mock
    requiresOAuth: false,
  },
  [IntegrationSource.FUNCTION_HEALTH]: {
    name: "Function Health",
    description: "Import comprehensive lab results and biomarkers",
    icon: "lab",
    isReal: false, // Mock
    requiresOAuth: false,
  },
  [IntegrationSource.MANUAL_ENTRY]: {
    name: "Manual Entry",
    description: "Manually enter health metrics",
    icon: "edit",
    isReal: true,
    requiresOAuth: false,
  },
}

// Get supported metrics for each integration
export const integrationMetrics: Record<IntegrationSource, string[]> = {
  [IntegrationSource.GARMIN]: [
    "steps",
    "active_minutes",
    "resting_heart_rate",
    "heart_rate_variability",
    "sleep_duration",
    "sleep_score",
    "calories",
  ],
  [IntegrationSource.STRAVA]: [
    "distance",
    "active_minutes",
    "calories_burned",
    "average_heart_rate",
    "max_heart_rate",
    "elevation_gain",
  ],
  [IntegrationSource.APPLE_HEALTH]: [
    "steps",
    "active_energy",
    "resting_heart_rate",
    "heart_rate_variability",
    "sleep_duration",
    "weight",
    "body_fat_percentage",
    "blood_pressure",
    "vo2_max",
  ],
  [IntegrationSource.RENPHO]: [
    "weight",
    "body_fat_percentage",
    "bmi",
    "muscle_mass",
    "bone_mass",
    "water_percentage",
    "visceral_fat",
    "metabolic_age",
  ],
  [IntegrationSource.FUNCTION_HEALTH]: [
    "total_cholesterol",
    "ldl_cholesterol",
    "hdl_cholesterol",
    "triglycerides",
    "fasting_glucose",
    "hba1c",
    "hs_crp",
    "vitamin_d",
    "testosterone",
    "thyroid_markers",
  ],
  [IntegrationSource.MANUAL_ENTRY]: [
    "weight",
    "blood_pressure",
    "steps",
    "sleep_duration",
  ],
}
