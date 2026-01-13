"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, Circle } from "lucide-react"
import Link from "next/link"

type Level = "LEVEL_0" | "LEVEL_1" | "LEVEL_2" | "LEVEL_3"

interface LevelProgressCardProps {
  currentLevel: Level
  rebatePercentage: number
  nextLevelProgress: number
  nextLevelRequirements?: {
    name: string
    completed: boolean
  }[]
}

const levelInfo: Record<
  Level,
  { name: string; description: string; badge: "level0" | "level1" | "level2" | "level3" }
> = {
  LEVEL_0: {
    name: "Enrolled",
    description: "Complete enrollment to reach Level 1",
    badge: "level0",
  },
  LEVEL_1: {
    name: "Participation",
    description: "Baseline captured. Show improvement to reach Level 2",
    badge: "level1",
  },
  LEVEL_2: {
    name: "Improvement",
    description: "Great progress! Sustain to reach Level 3",
    badge: "level2",
  },
  LEVEL_3: {
    name: "Excellence",
    description: "Maximum rewards achieved!",
    badge: "level3",
  },
}

const nextLevel: Record<Level, Level | null> = {
  LEVEL_0: "LEVEL_1",
  LEVEL_1: "LEVEL_2",
  LEVEL_2: "LEVEL_3",
  LEVEL_3: null,
}

export function LevelProgressCard({
  currentLevel,
  rebatePercentage,
  nextLevelProgress,
  nextLevelRequirements,
}: LevelProgressCardProps) {
  const level = levelInfo[currentLevel]
  const next = nextLevel[currentLevel]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Your Level</CardTitle>
          <Badge variant={level.badge}>{level.name}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Rebate */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-primary">
              {rebatePercentage}%
            </span>
            <span className="text-muted-foreground">rebate</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {level.description}
          </p>
        </div>

        {/* Progress to Next Level */}
        {next && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress to {levelInfo[next].name}</span>
              <span className="font-medium">{nextLevelProgress}%</span>
            </div>
            <Progress value={nextLevelProgress} className="h-2" />
          </div>
        )}

        {/* Requirements */}
        {nextLevelRequirements && nextLevelRequirements.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Next Steps</p>
            <ul className="space-y-2">
              {nextLevelRequirements.map((req) => (
                <li key={req.name} className="flex items-center gap-2 text-sm">
                  {req.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span
                    className={
                      req.completed ? "text-muted-foreground line-through" : ""
                    }
                  >
                    {req.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action */}
        <Button asChild className="w-full">
          <Link href="/employee/progress">
            View Full Progress
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
