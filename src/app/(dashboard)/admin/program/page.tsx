import { DashboardHeader } from "@/components/layout/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Settings, Save, Shield, Calendar, Percent } from "lucide-react"

// Demo program configuration
const programConfig = {
  programName: "HealthReturns Wellness Program",
  programStartDate: "2025-01-01",
  programEndDate: null,
  baselinePeriodDays: 30,
  evaluationPeriodDays: 90,
  level0Rebate: 0,
  level1Rebate: 5,
  level2Rebate: 15,
  level3Rebate: 30,
  alternativeStandardsEnabled: true,
}

export default function ProgramPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Program Configuration"
        description="Configure your wellness program settings and rebate rules"
      />

      <div className="p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Program Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Program Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="programName">Program Name</Label>
                  <Input
                    id="programName"
                    defaultValue={programConfig.programName}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Program Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    defaultValue={programConfig.programStartDate}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evaluation Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Evaluation Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="baselinePeriod">Baseline Period (Days)</Label>
                  <Select defaultValue={String(programConfig.baselinePeriodDays)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Time to establish baseline metrics
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="evaluationPeriod">
                    Evaluation Period (Days)
                  </Label>
                  <Select
                    defaultValue={String(programConfig.evaluationPeriodDays)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days (Monthly)</SelectItem>
                      <SelectItem value="90">90 days (Quarterly)</SelectItem>
                      <SelectItem value="180">180 days (Semi-Annual)</SelectItem>
                      <SelectItem value="365">365 days (Annual)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    How often levels are evaluated
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rebate Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Rebate Configuration</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Configure rebate percentages for each level. Under ACA regulations,
                total incentives cannot exceed 30% of plan cost (50% with tobacco
                cessation).
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Level 0 - Enrolled</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      defaultValue={programConfig.level0Rebate}
                      min="0"
                      max="30"
                      className="w-24"
                      disabled
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Base level, no rebate
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Level 1 - Participation</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      defaultValue={programConfig.level1Rebate}
                      min="0"
                      max="30"
                      className="w-24"
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Baseline captured, consent granted
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Level 2 - Improvement</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      defaultValue={programConfig.level2Rebate}
                      min="0"
                      max="30"
                      className="w-24"
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Demonstrated improvement or maintenance
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Level 3 - Excellence</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      defaultValue={programConfig.level3Rebate}
                      min="0"
                      max="30"
                      className="w-24"
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Sustained improvement or sustained excellence
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 dark:bg-amber-950/20 dark:border-amber-900/50">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>ACA Compliance:</strong> Level 3 rebate set at 30%
                  (maximum allowed for health-contingent programs). Ensure your
                  total incentive structure remains compliant.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Alternative Standards */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">
                  Alternative Standards (ACA Required)
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Alternative Standards</p>
                  <p className="text-sm text-muted-foreground">
                    Required for ACA compliance. Allows participants with medical
                    conditions to qualify through alternative pathways.
                  </p>
                </div>
                <Badge variant="success">Enabled</Badge>
              </div>

              <Separator />

              <div className="space-y-3">
                <p className="text-sm font-medium">Available Alternatives:</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Physician attestation of health efforts
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Completion of health coaching sessions
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Preventive care visit completion
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Educational program participation
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button variant="outline">Cancel</Button>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Configuration
            </Button>
          </div>

          {/* Info Notice */}
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/20">
            <CardContent className="p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Changes to program configuration will take effect at the start of
                the next evaluation period. Current period calculations will not
                be affected.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
