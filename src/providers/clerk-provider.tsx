"use client"

import { ClerkProvider as BaseClerkProvider } from "@clerk/nextjs"

interface ClerkProviderProps {
  children: React.ReactNode
}

export function ClerkProvider({ children }: ClerkProviderProps) {
  return (
    <BaseClerkProvider
      appearance={{
        variables: {
          colorPrimary: "hsl(160, 84%, 39%)",
          colorBackground: "hsl(0, 0%, 100%)",
          colorInputBackground: "hsl(0, 0%, 100%)",
          colorInputText: "hsl(0, 0%, 3.9%)",
          borderRadius: "0.625rem",
        },
        elements: {
          formButtonPrimary:
            "bg-primary hover:bg-primary/90 text-primary-foreground",
          card: "shadow-lg",
          headerTitle: "text-foreground",
          headerSubtitle: "text-muted-foreground",
          socialButtonsBlockButton:
            "border-border hover:bg-accent hover:text-accent-foreground",
          formFieldLabel: "text-foreground",
          formFieldInput: "border-input",
          footerActionLink: "text-primary hover:text-primary/90",
        },
      }}
    >
      {children}
    </BaseClerkProvider>
  )
}
