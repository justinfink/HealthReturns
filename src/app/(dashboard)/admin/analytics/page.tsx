import { DashboardHeader } from "@/components/layout/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, TrendingUp, TrendingDown, Minus } from "lucide-react"

// Demo aggregate data
const participationTrend = [
  { month: "Jul", rate: 62 },
  { month: "Aug", rate: 65 },
  { month: "Sep", rate: 68 },
  { month: "Oct", rate: 71 },
  { month: "Nov", rate: 73 },
  { month: "Dec", rate: 75 },
]

const levelTrends = [
  { quarter: "Q1 2025", level0: 45, level1: 30, level2: 20, level3: 5 },
  { quarter: "Q2 2025", level0: 38, level1: 28, level2: 26, level3: 8 },
  { quarter: "Q3 2025", level0: 30, level1: 22, level2: 35, level3: 13 },
  { quarter: "Q4 2025", level0: 25, level1: 18, level2: 40, level3: 17 },
]

const keyMetrics: Array<{
  name: string
  current: number
  previous: number
  unit: string
  trend: "up" | "down" | "stable"
}> = [
  {
    name: "Participation Rate",
    current: 75,
    previous: 71,
    unit: "%",
    trend: "up",
  },
  {
    name: "Average Rebate Rate",
    current: 12.4,
    previous: 10.8,
    unit: "%",
    trend: "up",
  },
  {
    name: "Level 3 Achievers",
    current: 17,
    previous: 13,
    unit: "%",
    trend: "up",
  },
  {
    name: "Active Data Sync",
    current: 85,
    previous: 82,
    unit: "%",
    trend: "up",
  },
]

const engagementMetrics = [
  { metric: "Daily Active Users (Avg)", value: "142", change: "+8%" },
  { metric: "Weekly Check-ins", value: "312", change: "+12%" },
  { metric: "Connected Devices", value: "2.1 avg", change: "+0.3" },
  { metric: "Data Points/User/Day", value: "24", change: "+5" },
]

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Program Analytics"
        description="Aggregate wellness program metrics and trends"
      />

      <div className="p-6">
        <div className="space-y-6">
          {/* Export Button */}
          <div className="flex justify-end">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {keyMetrics.map((metric) => (
              <Card key={metric.name}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{metric.name}</p>
                    <div
                      className={`flex items-center gap-1 text-xs ${
                        metric.trend === "up"
                          ? "text-green-600"
                          : metric.trend === "down"
                          ? "text-red-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {metric.trend === "up" && <TrendingUp className="h-3 w-3" />}
                      {metric.trend === "down" && (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {metric.trend === "stable" && <Minus className="h-3 w-3" />}
                      {metric.current > metric.previous ? "+" : ""}
                      {(metric.current - metric.previous).toFixed(1)}
                    </div>
                  </div>
                  <p className="mt-2 text-2xl font-bold">
                    {metric.current}
                    {metric.unit}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    vs {metric.previous}
                    {metric.unit} last quarter
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs for different views */}
          <Tabs defaultValue="participation" className="w-full">
            <TabsList>
              <TabsTrigger value="participation">Participation</TabsTrigger>
              <TabsTrigger value="levels">Level Distribution</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="rebates">Rebates</TabsTrigger>
            </TabsList>

            <TabsContent value="participation" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Participation Rate Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Chart placeholder */}
                  <div className="h-64 rounded-lg bg-muted flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-muted-foreground">
                        Participation trend chart
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        62% → 75% over 6 months
                      </p>
                    </div>
                  </div>

                  {/* Data table */}
                  <div className="mt-6 grid grid-cols-6 gap-4">
                    {participationTrend.map((item) => (
                      <div key={item.month} className="text-center">
                        <p className="text-sm text-muted-foreground">
                          {item.month}
                        </p>
                        <p className="text-lg font-semibold">{item.rate}%</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="levels" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Level Distribution by Quarter</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Chart placeholder */}
                  <div className="h-64 rounded-lg bg-muted flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-muted-foreground">
                        Stacked bar chart showing level progression
                      </p>
                    </div>
                  </div>

                  {/* Data table */}
                  <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Quarter</th>
                          <th className="text-right py-2">Level 0</th>
                          <th className="text-right py-2">Level 1</th>
                          <th className="text-right py-2">Level 2</th>
                          <th className="text-right py-2">Level 3</th>
                        </tr>
                      </thead>
                      <tbody>
                        {levelTrends.map((row) => (
                          <tr key={row.quarter} className="border-b">
                            <td className="py-2 font-medium">{row.quarter}</td>
                            <td className="text-right py-2">{row.level0}%</td>
                            <td className="text-right py-2">{row.level1}%</td>
                            <td className="text-right py-2">{row.level2}%</td>
                            <td className="text-right py-2">{row.level3}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="engagement" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {engagementMetrics.map((item) => (
                      <div
                        key={item.metric}
                        className="rounded-lg border p-4 text-center"
                      >
                        <p className="text-sm text-muted-foreground">
                          {item.metric}
                        </p>
                        <p className="mt-2 text-2xl font-bold">{item.value}</p>
                        <Badge variant="success" className="mt-2">
                          {item.change}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-lg bg-muted p-4">
                    <p className="text-sm font-medium">Engagement Insight</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Users are averaging 2.1 connected devices per person,
                      indicating strong multi-source data collection. Weekly
                      check-ins have increased 12% compared to last quarter.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rebates" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rebate Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 sm:grid-cols-3">
                    <div className="rounded-lg border p-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        Total Rebates (YTD)
                      </p>
                      <p className="mt-2 text-3xl font-bold text-primary">
                        $167,400
                      </p>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        Avg Rebate per Employee
                      </p>
                      <p className="mt-2 text-3xl font-bold">$900</p>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        Projected Annual
                      </p>
                      <p className="mt-2 text-3xl font-bold">$334,800</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Rebates by Level</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Level 1 (5%)</span>
                        <span className="font-medium">$12,150</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Level 2 (15%)</span>
                        <span className="font-medium">$88,200</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Level 3 (30%)</span>
                        <span className="font-medium">$67,050</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Privacy Notice */}
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Badge variant="info" className="mt-0.5">
                  Privacy
                </Badge>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  All analytics are aggregate and anonymized. Individual employee
                  data is never displayed. Small groups (n &lt; 5) are suppressed
                  to prevent identification.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
