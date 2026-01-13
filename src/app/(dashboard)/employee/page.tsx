import { DashboardHeader } from "@/components/layout/dashboard-header"
import { LevelProgressCard } from "@/components/dashboard/level-progress-card"
import { RebateStatusCard } from "@/components/dashboard/rebate-status-card"
import { MetricCard } from "@/components/dashboard/metric-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Footprints,
  Heart,
  Moon,
  Scale,
  Activity,
  Zap,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"

// Demo data - in production this would come from the API
const demoData = {
  member: {
    firstName: "Sarah",
    currentLevel: "LEVEL_2" as const,
  },
  rebate: {
    percentage: 15,
    estimatedSavings: 1800,
    periodStart: "Jan 1, 2026",
    periodEnd: "Mar 31, 2026",
  },
  metrics: {
    steps: { value: 8742, trend: "up" as const, change: "+12%" },
    heartRate: { value: 62, trend: "down" as const, change: "-3 bpm" },
    sleep: { value: 7.2, trend: "up" as const, change: "+0.4h" },
    weight: { value: 154, trend: "down" as const, change: "-2 lbs" },
  },
  levelProgress: {
    nextLevelProgress: 68,
    requirements: [
      { name: "Complete baseline measurement", completed: true },
      { name: "Connect health source", completed: true },
      { name: "Show 5% activity improvement", completed: true },
      { name: "Maintain for 90 days", completed: false },
    ],
  },
  integrations: {
    connected: 2,
    total: 4,
  },
}

export default function EmployeeDashboardPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title={`Welcome back, ${demoData.member.firstName}`}
        description="Track your health progress and earn rewards"
      />

      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - Left/Center */}
          <div className="space-y-6 lg:col-span-2">
            {/* Quick Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Daily Steps"
                value={demoData.metrics.steps.value.toLocaleString()}
                unit="steps"
                icon={<Footprints className="h-5 w-5" />}
                trend={demoData.metrics.steps.trend}
                trendValue={demoData.metrics.steps.change}
                source="Garmin"
                good="up"
              />
              <MetricCard
                title="Resting Heart Rate"
                value={demoData.metrics.heartRate.value}
                unit="bpm"
                icon={<Heart className="h-5 w-5" />}
                trend={demoData.metrics.heartRate.trend}
                trendValue={demoData.metrics.heartRate.change}
                source="Garmin"
                good="down"
              />
              <MetricCard
                title="Avg Sleep"
                value={demoData.metrics.sleep.value}
                unit="hours"
                icon={<Moon className="h-5 w-5" />}
                trend={demoData.metrics.sleep.trend}
                trendValue={demoData.metrics.sleep.change}
                source="Apple Health"
                good="up"
              />
              <MetricCard
                title="Weight"
                value={demoData.metrics.weight.value}
                unit="lbs"
                icon={<Scale className="h-5 w-5" />}
                trend={demoData.metrics.weight.trend}
                trendValue={demoData.metrics.weight.change}
                source="Renpho"
                good="down"
              />
            </div>

            {/* Activity Chart Placeholder */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Weekly Activity</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/employee/progress">
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Chart placeholder - would use Recharts in production */}
                <div className="flex h-48 items-center justify-center rounded-lg bg-muted">
                  <div className="text-center">
                    <Activity className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Activity chart will display here
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Connect a data source to see your trends
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Integration Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Connected Sources</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/employee/connect">Manage</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-muted text-lg">
                        ⌚
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-muted text-lg">
                        🍎
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">
                        {demoData.integrations.connected} of{" "}
                        {demoData.integrations.total} connected
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Garmin, Apple Health
                      </p>
                    </div>
                  </div>
                  <Badge variant="success">Syncing</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right */}
          <div className="space-y-6">
            {/* Level Progress */}
            <LevelProgressCard
              currentLevel={demoData.member.currentLevel}
              rebatePercentage={demoData.rebate.percentage}
              nextLevelProgress={demoData.levelProgress.nextLevelProgress}
              nextLevelRequirements={demoData.levelProgress.requirements}
            />

            {/* Rebate Status */}
            <RebateStatusCard
              currentRebate={demoData.rebate.percentage}
              estimatedSavings={demoData.rebate.estimatedSavings}
              periodStart={demoData.rebate.periodStart}
              periodEnd={demoData.rebate.periodEnd}
              status="active"
            />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/employee/connect">
                    <Zap className="mr-2 h-4 w-4 text-primary" />
                    Connect More Sources
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/employee/progress">
                    <Activity className="mr-2 h-4 w-4 text-primary" />
                    View All Metrics
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/employee/settings">
                    <Heart className="mr-2 h-4 w-4 text-primary" />
                    Manage Consent
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
