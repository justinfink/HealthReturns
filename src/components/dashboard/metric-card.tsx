"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string | number
  unit: string
  icon: React.ReactNode
  trend?: "up" | "down" | "stable"
  trendValue?: string
  source?: string
  lastUpdated?: string
  good?: "up" | "down" | "stable" // Which direction is healthy
}

export function MetricCard({
  title,
  value,
  unit,
  icon,
  trend,
  trendValue,
  source,
  lastUpdated,
  good = "up",
}: MetricCardProps) {
  const isPositiveTrend =
    (good === "up" && trend === "up") ||
    (good === "down" && trend === "down") ||
    trend === "stable"

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 text-sm",
                isPositiveTrend ? "text-green-600" : "text-red-600"
              )}
            >
              {trend === "up" && <TrendingUp className="h-4 w-4" />}
              {trend === "down" && <TrendingDown className="h-4 w-4" />}
              {trend === "stable" && <Minus className="h-4 w-4" />}
              {trendValue && <span>{trendValue}</span>}
            </div>
          )}
        </div>

        <div className="mt-4">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold">{value}</span>
            <span className="text-sm text-muted-foreground">{unit}</span>
          </div>
        </div>

        {(source || lastUpdated) && (
          <div className="mt-3 flex items-center justify-between">
            {source && (
              <Badge variant="secondary" className="text-xs">
                {source}
              </Badge>
            )}
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">{lastUpdated}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
