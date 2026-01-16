"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Link2,
  TrendingUp,
  DollarSign,
  Settings,
  Users,
  BarChart3,
  Sliders,
  Shield,
} from "lucide-react"
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs"
import { Badge } from "@/components/ui/badge"
import { useDemoMode } from "@/providers/demo-mode-provider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const employeeNavigation: NavItem[] = [
  { name: "Dashboard", href: "/employee", icon: LayoutDashboard },
  { name: "Connect Sources", href: "/employee/connect", icon: Link2 },
  { name: "Progress", href: "/employee/progress", icon: TrendingUp },
  { name: "Rebates", href: "/employee/rebates", icon: DollarSign },
  { name: "Settings", href: "/employee/settings", icon: Settings },
]

const adminNavigation: NavItem[] = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Employees", href: "/admin/employees", icon: Users },
  { name: "Program", href: "/admin/program", icon: Sliders },
  { name: "Compliance", href: "/admin/compliance", icon: Shield },
]

interface DashboardSidebarProps {
  type: "employee" | "admin"
}

export function DashboardSidebar({ type }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { isDemoMode } = useDemoMode()
  const navigation = type === "admin" ? adminNavigation : employeeNavigation

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Image
          src="/logo.svg"
          alt="HealthReturns"
          width={32}
          height={35}
          className="h-8 w-auto"
        />
        <span className="text-lg font-bold">HealthReturns</span>
        {isDemoMode && (
          <Badge variant="warning" className="ml-auto text-xs">
            Demo
          </Badge>
        )}
      </div>

      {/* Organization Switcher (for admin) */}
      {type === "admin" && (
        <div className="border-b px-4 py-3">
          <OrganizationSwitcher
            hidePersonal
            appearance={{
              elements: {
                rootBox: "w-full",
                organizationSwitcherTrigger:
                  "w-full justify-between border rounded-lg px-3 py-2 text-sm",
              },
            }}
          />
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Switch between Employee/Admin views */}
        <Separator className="my-4" />
        <div className="space-y-1">
          {type === "employee" ? (
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Shield className="h-4 w-4" />
              Admin Portal
            </Link>
          ) : (
            <Link
              href="/employee"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <LayoutDashboard className="h-4 w-4" />
              Employee View
            </Link>
          )}
        </div>
      </ScrollArea>

      {/* User Button */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-9 w-9",
              },
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Your Account</p>
            <p className="text-xs text-muted-foreground truncate">
              Manage profile
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
