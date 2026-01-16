"use client"

import { Bell, Search } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useDemoMode } from "@/providers/demo-mode-provider"

interface DashboardHeaderProps {
  title: string
  description?: string
}

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  const { isDemoMode, toggleDemoMode } = useDemoMode()

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-6">
      {/* Page Title */}
      <div className="flex-1">
        <h1 className="text-lg font-semibold">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Search */}
      <div className="hidden md:flex relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-64 pl-9"
        />
      </div>

      {/* Demo Mode Toggle */}
      {isDemoMode && (
        <Button
          variant="outline"
          size="sm"
          onClick={toggleDemoMode}
          className="gap-2"
        >
          <Badge variant="warning" className="text-xs">Demo Mode</Badge>
          Exit
        </Button>
      )}

      {/* Notifications */}
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
          3
        </span>
      </Button>
    </header>
  )
}
