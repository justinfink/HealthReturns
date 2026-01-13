import { DashboardHeader } from "@/components/layout/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from "lucide-react"

// Demo data
const rebateSummary = {
  currentRate: 15,
  estimatedAnnualSavings: 1800,
  ytdSavings: 450,
  lifetimeSavings: 3240,
}

const rebateHistory = [
  {
    period: "Q4 2025",
    level: "LEVEL_2",
    rate: 15,
    amount: 450,
    status: "DISBURSED" as const,
    date: "Jan 15, 2026",
  },
  {
    period: "Q3 2025",
    level: "LEVEL_2",
    rate: 15,
    amount: 450,
    status: "DISBURSED" as const,
    date: "Oct 15, 2025",
  },
  {
    period: "Q2 2025",
    level: "LEVEL_1",
    rate: 5,
    amount: 150,
    status: "DISBURSED" as const,
    date: "Jul 15, 2025",
  },
  {
    period: "Q1 2025",
    level: "LEVEL_1",
    rate: 5,
    amount: 150,
    status: "DISBURSED" as const,
    date: "Apr 15, 2025",
  },
]

const upcomingRebate = {
  period: "Q1 2026",
  projectedLevel: "LEVEL_2",
  projectedRate: 15,
  projectedAmount: 450,
  evaluationDate: "Mar 31, 2026",
  disbursementDate: "Apr 15, 2026",
}

function getLevelBadge(level: string) {
  switch (level) {
    case "LEVEL_0":
      return <Badge variant="level0">Level 0</Badge>
    case "LEVEL_1":
      return <Badge variant="level1">Level 1</Badge>
    case "LEVEL_2":
      return <Badge variant="level2">Level 2</Badge>
    case "LEVEL_3":
      return <Badge variant="level3">Level 3</Badge>
    default:
      return <Badge variant="secondary">{level}</Badge>
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "DISBURSED":
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Disbursed
        </Badge>
      )
    case "APPROVED":
      return (
        <Badge variant="info" className="gap-1">
          <Clock className="h-3 w-3" />
          Approved
        </Badge>
      )
    case "PENDING":
      return (
        <Badge variant="warning" className="gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      )
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function RebatesPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Rebates"
        description="Track your health rebate earnings and history"
      />

      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Current Rate
                      </p>
                      <p className="text-2xl font-bold">
                        {rebateSummary.currentRate}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Est. Annual
                      </p>
                      <p className="text-2xl font-bold">
                        ${rebateSummary.estimatedAnnualSavings.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <ArrowUpRight className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Lifetime Savings
                      </p>
                      <p className="text-2xl font-bold">
                        ${rebateSummary.lifetimeSavings.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Rebate */}
            <Card className="border-primary/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Upcoming Rebate</CardTitle>
                  <Badge variant="secondary">Projected</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Period</p>
                    <p className="font-medium">{upcomingRebate.period}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Projected Level
                    </p>
                    <div className="mt-1">
                      {getLevelBadge(upcomingRebate.projectedLevel)}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Projected Amount
                    </p>
                    <p className="text-lg font-bold text-primary">
                      ${upcomingRebate.projectedAmount}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Disbursement</p>
                    <p className="font-medium">
                      {upcomingRebate.disbursementDate}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Based on your current progress. Final amount determined at
                  evaluation on {upcomingRebate.evaluationDate}.
                </p>
              </CardContent>
            </Card>

            {/* Rebate History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rebate History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rebateHistory.map((rebate) => (
                    <div
                      key={rebate.period}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{rebate.period}</p>
                          <div className="mt-1 flex items-center gap-2">
                            {getLevelBadge(rebate.level)}
                            <span className="text-sm text-muted-foreground">
                              {rebate.rate}% rate
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">${rebate.amount}</p>
                        <div className="mt-1">{getStatusBadge(rebate.status)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* How Rebates Work */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How Rebates Work</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="font-medium">Evaluation Schedule</p>
                  <p className="text-muted-foreground">
                    Your level is evaluated at the end of each quarter based on
                    your health metrics.
                  </p>
                </div>
                <div>
                  <p className="font-medium">Disbursement</p>
                  <p className="text-muted-foreground">
                    Rebates are applied to your next premium payment or deposited
                    to your health account.
                  </p>
                </div>
                <div>
                  <p className="font-medium">Calculations</p>
                  <p className="text-muted-foreground">
                    Rebate amounts are based on your plan's employee-only coverage
                    cost and your current level.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Rebate Rates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rebate Rates by Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="level0">Level 0</Badge>
                    <span className="text-muted-foreground">0%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="level1">Level 1</Badge>
                    <span className="text-muted-foreground">~5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="level2">Level 2</Badge>
                    <span className="font-medium text-primary">~15%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="level3">Level 3</Badge>
                    <span className="text-muted-foreground">~30%</span>
                  </div>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  Actual rates may vary by employer plan configuration.
                </p>
              </CardContent>
            </Card>

            {/* Questions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Questions?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  Contact your HR benefits team for questions about rebate
                  disbursement or plan-specific details.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
