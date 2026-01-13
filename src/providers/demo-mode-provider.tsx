"use client"

import { createContext, useContext, useState, useEffect } from "react"

interface DemoModeContextType {
  isDemoMode: boolean
  setDemoMode: (enabled: boolean) => void
  toggleDemoMode: () => void
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(
  undefined
)

interface DemoModeProviderProps {
  children: React.ReactNode
}

export function DemoModeProvider({ children }: DemoModeProviderProps) {
  const [isDemoMode, setIsDemoMode] = useState(false)

  useEffect(() => {
    // Check if demo mode is enabled from environment or localStorage
    const envDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"
    const storedDemoMode = localStorage.getItem("healthreturns_demo_mode")

    if (storedDemoMode !== null) {
      setIsDemoMode(storedDemoMode === "true")
    } else if (envDemoMode) {
      setIsDemoMode(true)
    }
  }, [])

  const setDemoMode = (enabled: boolean) => {
    setIsDemoMode(enabled)
    localStorage.setItem("healthreturns_demo_mode", String(enabled))
  }

  const toggleDemoMode = () => {
    setDemoMode(!isDemoMode)
  }

  return (
    <DemoModeContext.Provider
      value={{ isDemoMode, setDemoMode, toggleDemoMode }}
    >
      {children}
    </DemoModeContext.Provider>
  )
}

export function useDemoMode() {
  const context = useContext(DemoModeContext)
  if (context === undefined) {
    throw new Error("useDemoMode must be used within a DemoModeProvider")
  }
  return context
}
