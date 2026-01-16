"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Activity,
  Bike,
  Waves,
  Mountain,
  Dumbbell,
  Timer,
  Flame,
  Heart,
  ArrowRight,
  RefreshCw,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface StravaActivity {
  id: string
  name: string
  type: string // Run, Ride, Swim, Walk, Hike, Workout, etc.
  sportType: string
  date: Date
  distance?: number
  activeMinutes?: number
  calories?: number
  avgHeartRate?: number
  maxHeartRate?: number
  elevationGain?: number
}

interface WeeklySummary {
  totalActivities: number
  totalActiveMinutes: number
  totalDistance: number
  totalCalories: number
  avgHeartRate: number | null
}

interface StravaData {
  connected: boolean
  activities: StravaActivity[]
  summary: WeeklySummary | null
  lastSyncAt: string | null
}

// Get activity icon based on Strava activity type
function getActivityIcon(activity: StravaActivity) {
  const type = activity.type?.toLowerCase() || ""

  // Map Strava activity types to icons
  if (type.includes("ride") || type.includes("cycling") || type.includes("bike")) {
    return <Bike className="h-4 w-4" />
  }

  if (type.includes("swim")) {
    return <Waves className="h-4 w-4" />
  }

  if (type.includes("hike") || type.includes("alpine")) {
    return <Mountain className="h-4 w-4" />
  }

  if (type.includes("weight") || type.includes("workout") || type.includes("crossfit") || type.includes("yoga")) {
    return <Dumbbell className="h-4 w-4" />
  }

  // Run, Walk, and other cardio activities
  return <Activity className="h-4 w-4" />
}

// Format duration nicely
function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

// Format distance (in miles)
function formatDistance(miles: number): string {
  if (miles < 0.1) {
    return `${Math.round(miles * 5280)}ft`
  }
  return `${miles.toFixed(1)}mi`
}

export function WeeklyActivity() {
  const [data, setData] = useState<StravaData | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/integrations/strava/activities")
      if (response.ok) {
        const result = await response.json()
        // Parse dates
        if (result.activities) {
          result.activities = result.activities.map((a: StravaActivity & { date: string }) => ({
            ...a,
            date: new Date(a.date),
          }))
        }
        setData(result)
      }
    } catch (error) {
      console.error("Error fetching activities:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      await fetch("/api/integrations/sync", { method: "POST" })
      await fetchActivities()
    } catch (error) {
      console.error("Error syncing:", error)
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [])

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weekly Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Not connected state
  if (!data?.connected) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Weekly Activity</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center rounded-lg bg-muted">
            <div className="text-center">
              <Activity className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Connect Strava to see your workouts
              </p>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link href="/employee/connect">
                  <Zap className="mr-2 h-4 w-4" />
                  Connect Strava
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // No activities state
  if (!data.activities || data.activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Weekly Activity</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSync}
              disabled={syncing}
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center rounded-lg bg-muted">
            <div className="text-center">
              <Activity className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                No activities this week
              </p>
              <p className="text-xs text-muted-foreground">
                Log a workout on Strava to see it here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { activities, summary } = data

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Weekly Activity</CardTitle>
            <Badge variant="secondary" className="text-xs">
              Strava
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSync}
              disabled={syncing}
              title="Sync now"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/employee/progress">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Weekly Summary */}
        {summary && (
          <div className="grid grid-cols-4 gap-3 rounded-lg bg-muted/50 p-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {summary.totalActivities}
              </p>
              <p className="text-xs text-muted-foreground">Workouts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {formatDuration(summary.totalActiveMinutes)}
              </p>
              <p className="text-xs text-muted-foreground">Active Time</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {formatDistance(summary.totalDistance)}
              </p>
              <p className="text-xs text-muted-foreground">Distance</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {summary.totalCalories > 0
                  ? `${Math.round(summary.totalCalories / 1000)}k`
                  : "-"}
              </p>
              <p className="text-xs text-muted-foreground">Calories</p>
            </div>
          </div>
        )}

        {/* Activity List */}
        <div className="space-y-2">
          {activities.slice(0, 5).map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {getActivityIcon(activity)}
                </div>
                <div>
                  <p className="text-sm font-medium">{activity.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {activity.activeMinutes && (
                      <span className="flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        {formatDuration(activity.activeMinutes)}
                      </span>
                    )}
                    {activity.distance && activity.distance > 0 && (
                      <span>• {formatDistance(activity.distance)}</span>
                    )}
                    <span>• {formatDistanceToNow(activity.date, { addSuffix: true })}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {activity.calories && activity.calories > 0 && (
                  <span className="flex items-center gap-1">
                    <Flame className="h-3 w-3 text-orange-500" />
                    {activity.calories}
                  </span>
                )}
                {activity.avgHeartRate && (
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3 text-red-500" />
                    {activity.avgHeartRate}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Show more link if more activities */}
        {activities.length > 5 && (
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link href="/employee/progress">
              View {activities.length - 5} more activities
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
