import { DashboardHeader } from "@/components/layout/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  ArrowRight,
  BarChart3,
} from "lucide-react"
import Link from "next/link"

// Demo data - aggregate only, no individual health data
const programStats = {
  totalEmployees: 248,
  enrolledEmployees: 186,
  participationRate: 75,
  avgRebateRate: 12.4,
  projectedSavings: 334800,
}

const levelDistribution = [
  { level: "Level 0", count: 62, percentage: 25, color: "bg-gray-400" },
  { level: "Level 1", count: 45, percentage: 18, color: "bg-blue-500" },
  { level: "Level 2", count: 98, percentage: 40, color: "bg-teal-500" },
  { level: "Level 3", count: 43, percentage: 17, color: "bg-green-500" },
]

const recentActivity = [
  {
    event: "15 employees advanced to Level 2",
    time: "2 days ago",
    type: "positive",
  },
  {
    event: "Q4 2025 rebates processed",
    time: "1 week ago",
    type: "neutral",
  },
  {
    event: "Program configuration updated",
    time: "2 weeks ago",
    type: "neutral",
  },
  {
    event: "12 new enrollments this month",
    time: "3 weeks ago",
    type: "positive",
  },
]

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Program Overview"
        description="Aggregate wellness program analytics - no individual health data"
      />

      <div className="p-6">
        <div className="grid gap-6">
          {/* Key Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Participation</p>
                    <p className="text-2xl font-bold">
                      {programStats.participationRate}%
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {programStats.enrolledEmployees} of {programStats.totalEmployees}{" "}
                  employees enrolled
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30">
                    <TrendingUp className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Rebate</p>
                    <p className="text-2xl font-bold">
                      {programStats.avgRebateRate}%
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Across all enrolled employees
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Proj. Savings</p>
                    <p className="text-2xl font-bold">
                      ${(programStats.projectedSavings / 1000).toFixed(0)}k
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Estimated annual healthcare cost reduction
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold">
                      {Math.round(programStats.enrolledEmployees * 0.85)}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Synced data in last 7 days
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Level Distribution */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Level Distribution</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin/analytics">
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {levelDistribution.map((level) => (
                    <div key={level.level}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium">{level.level}</span>
                        <span className="text-muted-foreground">
                          {level.count} employees ({level.percentage}%)
                        </span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full ${level.color} transition-all`}
                          style={{ width: `${level.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-lg bg-muted p-4">
                  <p className="text-sm font-medium">Trend Insight</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    40% of participants are at Level 2 (Improvement), showing
                    strong program engagement. 17% have reached Level 3
                    (Excellence).
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 pb-4 last:pb-0 border-b last:border-0"
                    >
                      <div
                        className={`mt-1 h-2 w-2 rounded-full ${
                          activity.type === "positive"
                            ? "bg-green-500"
                            : "bg-muted-foreground"
                        }`}
                      />
                      <div>
                        <p className="text-sm">{activity.event}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto py-4 justify-start" asChild>
              <Link href="/admin/analytics">
                <BarChart3 className="mr-3 h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">View Analytics</p>
                  <p className="text-xs text-muted-foreground">
                    Detailed program metrics
                  </p>
                </div>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto py-4 justify-start" asChild>
              <Link href="/admin/employees">
                <Users className="mr-3 h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Manage Employees</p>
                  <p className="text-xs text-muted-foreground">
                    View enrollment status
                  </p>
                </div>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto py-4 justify-start" asChild>
              <Link href="/admin/program">
                <Activity className="mr-3 h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Program Settings</p>
                  <p className="text-xs text-muted-foreground">
                    Configure rebate rules
                  </p>
                </div>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto py-4 justify-start" asChild>
              <Link href="/admin/compliance">
                <DollarSign className="mr-3 h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Rebate Reports</p>
                  <p className="text-xs text-muted-foreground">
                    Export and review
                  </p>
                </div>
              </Link>
            </Button>
          </div>

          {/* Privacy Notice */}
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Badge variant="info" className="mt-0.5">
                  Privacy
                </Badge>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  All data shown is aggregate and anonymized. Individual employee
                  health metrics are never accessible to administrators. Groups
                  smaller than 5 employees are suppressed to prevent
                  identification.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
