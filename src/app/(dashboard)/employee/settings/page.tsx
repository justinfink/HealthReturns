"use client"

import { DashboardHeader } from "@/components/layout/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Shield,
  Bell,
  Download,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react"

// Demo data
const consents = [
  {
    type: "PROGRAM_PARTICIPATION",
    name: "Program Participation",
    description:
      "I consent to participate in the HealthReturns wellness program.",
    granted: true,
    grantedAt: "Jan 15, 2025",
    required: true,
  },
  {
    type: "DATA_COLLECTION",
    name: "Health Data Collection",
    description:
      "I consent to the collection of health metrics from connected devices.",
    granted: true,
    grantedAt: "Jan 15, 2025",
    required: true,
  },
  {
    type: "DATA_SHARING_AGGREGATE",
    name: "Aggregate Data Sharing",
    description:
      "I consent to sharing anonymized, aggregate data with my employer.",
    granted: true,
    grantedAt: "Jan 15, 2025",
    required: false,
  },
  {
    type: "MARKETING_COMMUNICATIONS",
    name: "Marketing Communications",
    description:
      "I consent to receive promotional emails and wellness tips.",
    granted: false,
    grantedAt: null,
    required: false,
  },
]

const notifications = [
  {
    type: "level_changes",
    name: "Level Changes",
    description: "Get notified when your level changes.",
    enabled: true,
  },
  {
    type: "rebate_updates",
    name: "Rebate Updates",
    description: "Notifications about rebate calculations and disbursements.",
    enabled: true,
  },
  {
    type: "sync_alerts",
    name: "Sync Alerts",
    description: "Alerts when data sync fails or needs attention.",
    enabled: true,
  },
  {
    type: "weekly_summary",
    name: "Weekly Summary",
    description: "Weekly email summary of your health metrics.",
    enabled: false,
  },
]

export default function SettingsPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Settings"
        description="Manage your consent, privacy, and notification preferences"
      />

      <div className="p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Consent Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Consent Management</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {consents.map((consent) => (
                <div
                  key={consent.type}
                  className="flex items-start justify-between gap-4 pb-4 last:pb-0 border-b last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{consent.name}</h4>
                      {consent.required && (
                        <Badge variant="secondary" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {consent.description}
                    </p>
                    {consent.granted && consent.grantedAt && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Granted on {consent.grantedAt}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {consent.granted ? (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Granted
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <XCircle className="h-3 w-3" />
                        Not Granted
                      </Badge>
                    )}
                    {!consent.required && (
                      <Button variant="ghost" size="sm">
                        {consent.granted ? "Revoke" : "Grant"}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Notifications</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.type}
                  className="flex items-center justify-between pb-4 last:pb-0 border-b last:border-0"
                >
                  <div>
                    <h4 className="font-medium">{notification.name}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {notification.description}
                    </p>
                  </div>
                  <Button
                    variant={notification.enabled ? "secondary" : "outline"}
                    size="sm"
                  >
                    {notification.enabled ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Data Management</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Export Your Data</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Download a copy of all your health data and program history.
                  </p>
                </div>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-destructive">Delete Account</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Permanently delete your account and all associated data.
                  </p>
                </div>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Notice */}
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <h4 className="font-medium text-amber-900 dark:text-amber-100">
                    Privacy Reminder
                  </h4>
                  <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                    Your employer never has access to your individual health
                    metrics. Only aggregate, anonymized data is shared with your
                    employer for program reporting purposes. You can revoke consent
                    for aggregate sharing at any time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
