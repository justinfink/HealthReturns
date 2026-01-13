"use client"

import { DashboardHeader } from "@/components/layout/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle2,
  Circle,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Demo data
const levelProgress = {
  currentLevel: "LEVEL_2",
  levelName: "Improvement",
  rebatePercentage: 15,
  nextLevel: "Excellence",
  nextLevelRebate: 30,
  overallProgress: 68,
}

const metricProgress: Array<{
  name: string
  category: string
  baseline: number
  current: number
  target: number
  unit: string
  trend: "up" | "down" | "stable"
  progress: number
  status: "improving" | "achieved" | "declining"
}> = [
  {
    name: "Daily Steps",
    category: "Activity",
    baseline: 6500,
    current: 8742,
    target: 10000,
    unit: "steps",
    trend: "up",
    progress: 74,
    status: "improving",
  },
  {
    name: "Resting Heart Rate",
    category: "Heart Health",
    baseline: 68,
    current: 62,
    target: 60,
    unit: "bpm",
    trend: "down",
    progress: 75,
    status: "improving",
  },
  {
    name: "Sleep Duration",
    category: "Sleep",
    baseline: 6.5,
    current: 7.2,
    target: 7.5,
    unit: "hours",
    trend: "up",
    progress: 70,
    status: "improving",
  },
  {
    name: "Weight",
    category: "Body Composition",
    baseline: 162,
    current: 154,
    target: 150,
    unit: "lbs",
    trend: "down",
    progress: 67,
    status: "improving",
  },
  {
    name: "Active Minutes",
    category: "Activity",
    baseline: 22,
    current: 35,
    target: 30,
    unit: "min/day",
    trend: "up",
    progress: 100,
    status: "achieved",
  },
  {
    name: "Heart Rate Variability",
    category: "Heart Health",
    baseline: 42,
    current: 48,
    target: 50,
    unit: "ms",
    trend: "up",
    progress: 75,
    status: "improving",
  },
]

const levelRequirements = [
  { name: "Complete enrollment", completed: true },
  { name: "Capture baseline metrics", completed: true },
  { name: "Connect at least one health source", completed: true },
  { name: "Show improvement in 3+ metrics", completed: true },
  { name: "Maintain improvement for 90 days", completed: false },
  { name: "Complete quarterly health check", completed: false },
]

export default function ProgressPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Your Progress"
        description="Track your health improvements and level progression"
      />

      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Level Overview */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="level2">Level 2</Badge>
                      <span className="font-semibold">
                        {levelProgress.levelName}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      You're earning {levelProgress.rebatePercentage}% rebate
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Next: {levelProgress.nextLevel}
                    </p>
                    <p className="font-semibold text-primary">
                      {levelProgress.nextLevelRebate}% rebate
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Progress to Level 3</span>
                    <span className="font-medium">
                      {levelProgress.overallProgress}%
                    </span>
                  </div>
                  <Progress value={levelProgress.overallProgress} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Metrics Progress */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all">All Metrics</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="heart">Heart Health</TabsTrigger>
                <TabsTrigger value="sleep">Sleep</TabsTrigger>
                <TabsTrigger value="body">Body</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <div className="space-y-4">
                  {metricProgress.map((metric) => (
                    <Card key={metric.name}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{metric.name}</h4>
                              <Badge variant="secondary" className="text-xs">
                                {metric.category}
                              </Badge>
                              {metric.status === "achieved" && (
                                <Badge variant="success" className="text-xs">
                                  Target Achieved
                                </Badge>
                              )}
                            </div>
                            <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Baseline</p>
                                <p className="font-medium">
                                  {metric.baseline} {metric.unit}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Current</p>
                                <p className="font-medium">
                                  {metric.current} {metric.unit}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Target</p>
                                <p className="font-medium">
                                  {metric.target} {metric.unit}
                                </p>
                              </div>
                            </div>
                            <div className="mt-3">
                              <Progress
                                value={metric.progress}
                                className="h-2"
                                indicatorClassName={cn(
                                  metric.status === "achieved"
                                    ? "bg-green-500"
                                    : ""
                                )}
                              />
                            </div>
                          </div>
                          <div
                            className={cn(
                              "flex items-center gap-1 text-sm ml-4",
                              metric.status === "improving" ||
                                metric.status === "achieved"
                                ? "text-green-600"
                                : "text-red-600"
                            )}
                          >
                            {metric.trend === "up" && (
                              <TrendingUp className="h-4 w-4" />
                            )}
                            {metric.trend === "down" && (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            {metric.trend === "stable" && (
                              <Minus className="h-4 w-4" />
                            )}
                            <span className="capitalize">{metric.status}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="activity">
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  Activity metrics filtered view
                </div>
              </TabsContent>
              <TabsContent value="heart">
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  Heart health metrics filtered view
                </div>
              </TabsContent>
              <TabsContent value="sleep">
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  Sleep metrics filtered view
                </div>
              </TabsContent>
              <TabsContent value="body">
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  Body composition metrics filtered view
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Requirements Checklist */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Level 3 Requirements</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {levelRequirements.map((req) => (
                    <li key={req.name} className="flex items-start gap-2">
                      {req.completed ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      ) : (
                        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <span
                        className={cn(
                          "text-sm",
                          req.completed
                            ? "text-muted-foreground line-through"
                            : ""
                        )}
                      >
                        {req.name}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 text-sm text-muted-foreground">
                  <span className="font-medium">
                    {levelRequirements.filter((r) => r.completed).length} of{" "}
                    {levelRequirements.length}
                  </span>{" "}
                  requirements met
                </div>
              </CardContent>
            </Card>

            {/* Alternative Standards */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alternative Pathways</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  If you can't meet certain requirements due to medical conditions,
                  alternative standards are available:
                </p>
                <ul className="mt-3 space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Physician attestation
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Health coaching completion
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Preventive care visits
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Evaluation Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Current Period</span>
                    <span className="font-medium">Q1 2026</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Next Evaluation</span>
                    <span className="font-medium">Mar 31, 2026</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Days Remaining</span>
                    <span className="font-medium">78 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
