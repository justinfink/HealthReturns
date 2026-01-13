import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <DashboardSidebar type="employee" />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
