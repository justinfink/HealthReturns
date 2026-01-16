import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <SignUp
      forceRedirectUrl="/employee"
      appearance={{
        elements: {
          rootBox: "w-full",
          card: "shadow-none w-full",
          headerTitle: "text-2xl font-bold",
          headerSubtitle: "text-muted-foreground",
          formButtonPrimary:
            "bg-primary hover:bg-primary/90 text-primary-foreground",
          footerActionLink: "text-primary hover:text-primary/90",
        },
      }}
    />
  )
}
