"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"

interface RebateStatusCardProps {
  currentRebate: number
  estimatedSavings: number
  periodStart: string
  periodEnd: string
  status: "active" | "pending" | "processing"
}

export function RebateStatusCard({
  currentRebate,
  estimatedSavings,
  periodStart,
  periodEnd,
  status,
}: RebateStatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Rebate Status</CardTitle>
          <Badge
            variant={
              status === "active"
                ? "success"
                : status === "pending"
                ? "warning"
                : "secondary"
            }
          >
            {status === "active"
              ? "Active"
              : status === "pending"
              ? "Pending"
              : "Processing"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Rebate */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Rebate Rate</p>
            <p className="text-2xl font-bold">{currentRebate}%</p>
          </div>
        </div>

        {/* Estimated Savings */}
        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm text-muted-foreground">Estimated Annual Savings</p>
          <p className="mt-1 text-2xl font-bold text-primary">
            ${estimatedSavings.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Based on current rebate rate and plan costs
          </p>
        </div>

        {/* Current Period */}
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <div className="text-sm">
            <p className="font-medium">Current Evaluation Period</p>
            <p className="text-muted-foreground">
              {periodStart} - {periodEnd}
            </p>
          </div>
        </div>

        {/* Action */}
        <Button variant="outline" asChild className="w-full">
          <Link href="/employee/rebates">
            View Rebate History
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
