import { DashboardHeader } from "@/components/layout/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Download,
  UserPlus,
  Mail,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react"

// Demo data - enrollment status only, no health data
const employees = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "s.johnson@company.com",
    department: "Engineering",
    enrollmentStatus: "ENROLLED" as const,
    enrolledDate: "Jan 15, 2025",
    dataSourcesConnected: 2,
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "m.chen@company.com",
    department: "Marketing",
    enrollmentStatus: "ENROLLED" as const,
    enrolledDate: "Feb 3, 2025",
    dataSourcesConnected: 1,
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    email: "e.rodriguez@company.com",
    department: "Sales",
    enrollmentStatus: "PENDING" as const,
    enrolledDate: null,
    dataSourcesConnected: 0,
  },
  {
    id: "4",
    name: "David Kim",
    email: "d.kim@company.com",
    department: "Engineering",
    enrollmentStatus: "ENROLLED" as const,
    enrolledDate: "Jan 20, 2025",
    dataSourcesConnected: 3,
  },
  {
    id: "5",
    name: "Lisa Thompson",
    email: "l.thompson@company.com",
    department: "HR",
    enrollmentStatus: "NOT_ENROLLED" as const,
    enrolledDate: null,
    dataSourcesConnected: 0,
  },
  {
    id: "6",
    name: "James Wilson",
    email: "j.wilson@company.com",
    department: "Finance",
    enrollmentStatus: "ENROLLED" as const,
    enrolledDate: "Mar 1, 2025",
    dataSourcesConnected: 2,
  },
]

const enrollmentStats = {
  total: 248,
  enrolled: 186,
  pending: 24,
  notEnrolled: 38,
}

function getStatusBadge(status: string) {
  switch (status) {
    case "ENROLLED":
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Enrolled
        </Badge>
      )
    case "PENDING":
      return (
        <Badge variant="warning" className="gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      )
    case "NOT_ENROLLED":
      return (
        <Badge variant="secondary" className="gap-1">
          <XCircle className="h-3 w-3" />
          Not Enrolled
        </Badge>
      )
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function EmployeesPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Employee Management"
        description="Manage enrollment status - individual health data is not accessible"
      />

      <div className="p-6">
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{enrollmentStats.total}</p>
                <p className="text-sm text-muted-foreground">Total Employees</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {enrollmentStats.enrolled}
                </p>
                <p className="text-sm text-muted-foreground">Enrolled</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">
                  {enrollmentStats.pending}
                </p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-muted-foreground">
                  {enrollmentStats.notEnrolled}
                </p>
                <p className="text-sm text-muted-foreground">Not Enrolled</p>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search employees..." className="pl-9" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="enrolled">Enrolled</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="not_enrolled">Not Enrolled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Send Invites
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            </div>
          </div>

          {/* Employee Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-medium">Employee</th>
                      <th className="text-left p-4 font-medium">Department</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Enrolled Date</th>
                      <th className="text-left p-4 font-medium">Data Sources</th>
                      <th className="text-right p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee) => (
                      <tr key={employee.id} className="border-b last:border-0">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{employee.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {employee.email}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="secondary">{employee.department}</Badge>
                        </td>
                        <td className="p-4">
                          {getStatusBadge(employee.enrollmentStatus)}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {employee.enrolledDate || "-"}
                        </td>
                        <td className="p-4">
                          {employee.dataSourcesConnected > 0 ? (
                            <span className="text-sm">
                              {employee.dataSourcesConnected} connected
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              None
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          {employee.enrollmentStatus === "NOT_ENROLLED" && (
                            <Button variant="ghost" size="sm">
                              <Mail className="h-4 w-4" />
                            </Button>
                          )}
                          {employee.enrollmentStatus === "PENDING" && (
                            <Button variant="ghost" size="sm">
                              Remind
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Notice */}
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Badge variant="warning" className="mt-0.5">
                  Important
                </Badge>
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-medium">Privacy Protected View</p>
                  <p className="mt-1">
                    This view shows enrollment status only. Individual employee
                    health metrics, level status, and rebate details are not
                    accessible to administrators. Employees control their own
                    health data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
