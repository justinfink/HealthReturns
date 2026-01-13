import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

// Force dynamic rendering for all dashboard pages
export const dynamic = "force-dynamic"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return <>{children}</>
}
