"use client"

import { DashboardHeader } from "@/components/layout/dashboard-header"
import { IntegrationCard } from "@/components/dashboard/integration-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, Shield } from "lucide-react"

// Demo integration data
const integrations = [
  {
    name: "Garmin Connect",
    icon: "⌚",
    description: "Sync activity, heart rate, and sleep data from Garmin devices.",
    status: "CONNECTED" as const,
    lastSync: "5 min ago",
    isMock: false,
  },
  {
    name: "Apple Health",
    icon: "🍎",
    description: "Import health data from your iPhone and Apple Watch.",
    status: "CONNECTED" as const,
    lastSync: "1 hour ago",
    isMock: true,
  },
  {
    name: "Renpho",
    icon: "⚖️",
    description: "Track weight and body composition from Renpho smart scales.",
    status: "DISCONNECTED" as const,
    isMock: true,
  },
  {
    name: "Function Health",
    icon: "🧬",
    description: "Connect lab results and biomarkers from Function Health tests.",
    status: "DISCONNECTED" as const,
    isMock: true,
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
            {/* Integration Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              {integrations.map((integration) => (
                <IntegrationCard
                  key={integration.name}
                  {...integration}
                  onConnect={() => console.log(`Connect ${integration.name}`)}
                  onDisconnect={() =>
                    console.log(`Disconnect ${integration.name}`)
                  }
                  onSync={() => console.log(`Sync ${integration.name}`)}
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
