import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <DashboardSidebar type="admin" />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
