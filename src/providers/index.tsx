"use client"

import { ClerkProvider } from "./clerk-provider"
import { QueryProvider } from "./query-provider"
import { DemoModeProvider } from "./demo-mode-provider"
import { TooltipProvider } from "@/components/ui/tooltip"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ClerkProvider>
      <QueryProvider>
        <DemoModeProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </DemoModeProvider>
      </QueryProvider>
    </ClerkProvider>
  )
}
