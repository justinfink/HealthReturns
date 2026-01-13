import { DashboardHeader } from "@/components/layout/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Shield,
  CheckCircle2,
  Download,
  FileText,
  Calendar,
  AlertTriangle,
} from "lucide-react"

// Demo compliance data
const complianceChecks = [
  {
    name: "Incentive Limits",
    status: "compliant",
    description: "Maximum rebate (30%) within ACA limits",
    lastChecked: "Jan 12, 2026",
  },
  {
    name: "Voluntary Participation",
    status: "compliant",
    description: "No penalties for non-participation",
    lastChecked: "Jan 12, 2026",
  },
  {
    name: "Alternative Standards",
    status: "compliant",
    description: "Reasonable alternatives available for all levels",
    lastChecked: "Jan 12, 2026",
  },
  {
    name: "Annual Opportunity",
    status: "compliant",
    description: "Employees can qualify at any level each year",
    lastChecked: "Jan 12, 2026",
  },
  {
    name: "Transparent Disclosure",
    status: "compliant",
    description: "Program rules clearly communicated",
    lastChecked: "Jan 12, 2026",
  },
  {
    name: "Privacy Protections",
    status: "compliant",
    description: "Individual data not accessible to employer",
    lastChecked: "Jan 12, 2026",
  },
]

const recentReports = [
  {
    name: "Q4 2025 Rebate Summary",
    date: "Jan 10, 2026",
    type: "Rebate Report",
  },
  {
    name: "Annual Compliance Audit",
    date: "Dec 15, 2025",
    type: "Audit Report",
  },
  {
    name: "Q3 2025 Participation Report",
    date: "Oct 5, 2025",
    type: "Participation",
  },
  {
    name: "Program Configuration Export",
    date: "Sep 20, 2025",
    type: "Configuration",
  },
]

const upcomingDeadlines = [
  {
    name: "Q1 2026 Evaluation",
    date: "Mar 31, 2026",
    daysRemaining: 78,
  },
  {
    name: "Annual Disclosure Update",
    date: "Apr 1, 2026",
    daysRemaining: 79,
  },
  {
    name: "Mid-Year Compliance Review",
    date: "Jul 1, 2026",
    daysRemaining: 170,
  },
]

export default function CompliancePage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Compliance & Reports"
        description="ACA compliance status, rebate reports, and audit documentation"
      />

      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Compliance Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Compliance Status</CardTitle>
                  </div>
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    All Compliant
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceChecks.map((check) => (
                    <div
                      key={check.name}
                      className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">{check.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {check.description}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {check.lastChecked}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Reports */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Recent Reports</CardTitle>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentReports.map((report) => (
                    <div
                      key={report.name}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{report.name}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {report.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {report.date}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Generate Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Generate Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Button variant="outline" className="h-auto py-4 justify-start">
                    <div className="text-left">
                      <p className="font-medium">Rebate Summary</p>
                      <p className="text-xs text-muted-foreground">
                        Aggregate rebate data by level
                      </p>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 justify-start">
                    <div className="text-left">
                      <p className="font-medium">Participation Report</p>
                      <p className="text-xs text-muted-foreground">
                        Enrollment and engagement metrics
                      </p>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 justify-start">
                    <div className="text-left">
                      <p className="font-medium">Compliance Audit</p>
                      <p className="text-xs text-muted-foreground">
                        Full compliance documentation
                      </p>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 justify-start">
                    <div className="text-left">
                      <p className="font-medium">Program Configuration</p>
                      <p className="text-xs text-muted-foreground">
                        Export current settings
                      </p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingDeadlines.map((deadline) => (
                    <div
                      key={deadline.name}
                      className="flex items-start justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium">{deadline.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {deadline.date}
                        </p>
                      </div>
                      <Badge
                        variant={
                          deadline.daysRemaining < 30 ? "warning" : "secondary"
                        }
                      >
                        {deadline.daysRemaining}d
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ACA Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ACA Requirements</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <div>
                  <p className="font-medium text-foreground">Incentive Caps</p>
                  <p>30% of plan cost (50% with tobacco cessation)</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Reasonable Design</p>
                  <p>
                    Program must be reasonably designed to improve health or
                    prevent disease
                  </p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Alternatives</p>
                  <p>Must provide reasonable alternatives for all participants</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Disclosure</p>
                  <p>Clear communication of program terms and availability</p>
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  Questions about compliance or reporting? Contact our compliance
                  team for assistance.
                </p>
                <Button variant="outline" className="w-full mt-4">
                  Contact Compliance
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
