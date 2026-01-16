"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { IntegrationCard } from "@/components/dashboard/integration-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, Shield, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type ConnectionStatus = "CONNECTED" | "DISCONNECTED" | "ERROR" | "PENDING"

interface Integration {
  name: string
  icon: string
  description: string
  status: ConnectionStatus
  isMock: boolean
  source: string
  lastSync?: string
}

// Base integration data
const baseIntegrations: Omit<Integration, "status" | "lastSync">[] = [
  {
    name: "Garmin Connect",
    icon: "⌚",
    description: "Sync activity, heart rate, and sleep data from Garmin devices.",
    isMock: false,
    source: "garmin",
  },
  {
    name: "Strava",
    icon: "🏃",
    description: "Sync running, cycling, and workout data from Strava.",
    isMock: false,
    source: "strava",
  },
  {
    name: "Apple Health",
    icon: "🍎",
    description: "Import health data from your iPhone and Apple Watch.",
    isMock: true,
    source: "apple",
  },
  {
    name: "Renpho",
    icon: "⚖️",
    description: "Track weight and body composition from Renpho smart scales.",
    isMock: true,
    source: "renpho",
  },
  {
    name: "Function Health",
    icon: "🧬",
    description: "Connect lab results and biomarkers from Function Health tests.",
    isMock: true,
    source: "function",
  },
]

const metricsBySource = [
  {
    source: "Garmin Connect",
    metrics: [
      "Daily Steps",
      "Distance",
      "Active Minutes",
      "Resting Heart Rate",
      "Heart Rate Variability",
      "Sleep Duration",
      "Sleep Stages",
    ],
  },
  {
    source: "Strava",
    metrics: [
      "Distance",
      "Active Minutes",
      "Calories Burned",
      "Average Heart Rate",
      "Max Heart Rate",
      "Elevation Gain",
    ],
  },
  {
    source: "Apple Health",
    metrics: [
      "Steps",
      "Active Energy",
      "Exercise Minutes",
      "Heart Rate",
      "Sleep Analysis",
      "Mindful Minutes",
    ],
  },
  {
    source: "Renpho",
    metrics: ["Weight", "BMI", "Body Fat %", "Muscle Mass", "Water %"],
  },
  {
    source: "Function Health",
    metrics: [
      "Blood Glucose",
      "HbA1c",
      "Cholesterol Panel",
      "Vitamin Levels",
      "Hormone Markers",
    ],
  },
]

export default function ConnectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [connecting, setConnecting] = useState<string | null>(null)
  const [integrations, setIntegrations] = useState<Integration[]>(
    baseIntegrations.map((i) => ({ ...i, status: "DISCONNECTED" as ConnectionStatus }))
  )
  const [loading, setLoading] = useState(true)

  // Fetch real integration statuses on mount
  useEffect(() => {
    async function fetchIntegrationStatuses() {
      try {
        // Fetch status for each real integration
        const statuses = await Promise.all([
          fetch("/api/integrations/strava/auth").then((r) => r.ok ? r.json() : null).catch(() => null),
          fetch("/api/integrations/garmin/auth").then((r) => r.ok ? r.json() : null).catch(() => null),
        ])

        const [stravaStatus, garminStatus] = statuses

        setIntegrations((prev) =>
          prev.map((integration) => {
            if (integration.source === "strava" && stravaStatus) {
              return {
                ...integration,
                status: stravaStatus.connected ? "CONNECTED" : "DISCONNECTED",
                lastSync: stravaStatus.lastSyncAt
                  ? new Date(stravaStatus.lastSyncAt).toLocaleDateString()
                  : undefined,
              }
            }
            if (integration.source === "garmin" && garminStatus) {
              return {
                ...integration,
                status: garminStatus.connected ? "CONNECTED" : "DISCONNECTED",
                lastSync: garminStatus.lastSyncAt
                  ? new Date(garminStatus.lastSyncAt).toLocaleDateString()
                  : undefined,
              }
            }
            return integration
          })
        )
      } catch (error) {
        console.error("Error fetching integration statuses:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchIntegrationStatuses()
  }, [])

  // Check for success/error query params from OAuth callbacks
  const connected = searchParams.get("connected")
  const error = searchParams.get("error")

  // Show toast and refresh statuses based on URL params
  useEffect(() => {
    if (connected) {
      toast({
        title: "Connected successfully!",
        description: `Your ${connected} account has been connected.`,
      })
      // Refresh the integration statuses
      setLoading(true)
      fetch(`/api/integrations/${connected}/auth`)
        .then((r) => r.json())
        .then((status) => {
          setIntegrations((prev) =>
            prev.map((integration) => {
              if (integration.source === connected) {
                return {
                  ...integration,
                  status: status.connected ? "CONNECTED" : "DISCONNECTED",
                  lastSync: status.lastSyncAt
                    ? new Date(status.lastSyncAt).toLocaleDateString()
                    : undefined,
                }
              }
              return integration
            })
          )
        })
        .finally(() => setLoading(false))
      // Clear the query param
      router.replace("/employee/connect")
    }

    if (error) {
      const errorMessages: Record<string, string> = {
        denied: "You denied access to the integration.",
        strava_denied: "You denied access to Strava.",
        session_expired: "Your session expired. Please try again.",
        callback_failed: "Failed to complete connection. Please try again.",
        missing_code: "Missing authorization code.",
        missing_params: "Missing required parameters.",
        token_mismatch: "Token mismatch. Please try again.",
      }
      toast({
        title: "Connection failed",
        description: errorMessages[error] || "An error occurred. Please try again.",
        variant: "destructive",
      })
      router.replace("/employee/connect")
    }
  }, [connected, error, router, toast])

  const handleConnect = async (source: string) => {
    if (source === "strava") {
      setConnecting("strava")
      try {
        const response = await fetch("/api/integrations/strava/auth", {
          method: "POST",
        })
        const data = await response.json()

        if (data.authorizationUrl) {
          window.location.href = data.authorizationUrl
        } else {
          toast({
            title: "Connection failed",
            description: data.error || "Failed to initiate Strava connection",
            variant: "destructive",
          })
        }
      } catch (err) {
        toast({
          title: "Connection failed",
          description: "Failed to connect to Strava. Please try again.",
          variant: "destructive",
        })
      } finally {
        setConnecting(null)
      }
    } else if (source === "garmin") {
      setConnecting("garmin")
      try {
        const response = await fetch("/api/integrations/garmin/auth", {
          method: "POST",
        })
        const data = await response.json()

        if (data.authorizationUrl) {
          window.location.href = data.authorizationUrl
        } else {
          toast({
            title: "Connection failed",
            description: data.error || "Failed to initiate Garmin connection",
            variant: "destructive",
          })
        }
      } catch (err) {
        toast({
          title: "Connection failed",
          description: "Failed to connect to Garmin. Please try again.",
          variant: "destructive",
        })
      } finally {
        setConnecting(null)
      }
    } else {
      // Mock integrations
      toast({
        title: "Coming soon",
        description: `${source} integration is coming soon!`,
      })
    }
  }

  const handleDisconnect = async (source: string) => {
    if (source === "strava" || source === "garmin") {
      try {
        await fetch(`/api/integrations/${source}/auth`, { method: "DELETE" })
        toast({
          title: "Disconnected",
          description: `Your ${source.charAt(0).toUpperCase() + source.slice(1)} account has been disconnected.`,
        })
        // Update the local state immediately
        setIntegrations((prev) =>
          prev.map((integration) =>
            integration.source === source
              ? { ...integration, status: "DISCONNECTED" as ConnectionStatus, lastSync: undefined }
              : integration
          )
        )
      } catch (err) {
        toast({
          title: "Error",
          description: `Failed to disconnect ${source.charAt(0).toUpperCase() + source.slice(1)}.`,
          variant: "destructive",
        })
      }
    }
  }

  const handleSync = async (source: string) => {
    toast({
      title: "Syncing",
      description: `Syncing data from ${source}...`,
    })
  }

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Connect Health Sources"
        description="Link your devices and apps to track your health metrics"
      />

      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading integrations...</span>
              </div>
            )}

            {/* Integration Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              {integrations.map((integration) => (
                <IntegrationCard
                  key={integration.name}
                  {...integration}
                  onConnect={() => handleConnect(integration.source)}
                  onDisconnect={() => handleDisconnect(integration.source)}
                  onSync={() => handleSync(integration.source)}
                />
              ))}
            </div>

            {/* What Gets Synced */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What Gets Synced</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-2">
                  {metricsBySource.map((source) => (
                    <div key={source.source}>
                      <h4 className="font-medium">{source.source}</h4>
                      <ul className="mt-2 space-y-1">
                        {source.metrics.map((metric) => (
                          <li
                            key={metric}
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {metric}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Privacy Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Privacy First</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                  Your health data is encrypted and stored securely. Your employer
                  never has access to your individual metrics.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="success" className="h-5 w-5 rounded-full p-0">
                      <Shield className="h-3 w-3" />
                    </Badge>
                    <span>Encrypted in transit and at rest</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success" className="h-5 w-5 rounded-full p-0">
                      <Shield className="h-3 w-3" />
                    </Badge>
                    <span>You control what gets shared</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success" className="h-5 w-5 rounded-full p-0">
                      <Shield className="h-3 w-3" />
                    </Badge>
                    <span>Disconnect anytime</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Manual Entry */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Manual Entry</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  Don't use any of these devices? You can manually enter your
                  health metrics or get them verified through a healthcare
                  provider.
                </p>
                <Badge variant="secondary" className="mt-3">
                  Coming Soon
                </Badge>
              </CardContent>
            </Card>

            {/* Need Help */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  Having trouble connecting? Check out our integration guides or
                  contact support.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
