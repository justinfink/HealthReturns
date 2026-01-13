import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { seedDemoData, clearDemoData } from "@/lib/demo/seed-data"

// POST /api/demo/seed - Seed demo data
export async function POST(request: NextRequest) {
  try {
    // Only allow in development or with admin auth
    if (process.env.NODE_ENV !== "development") {
      const { userId } = await auth()
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      // In production, add additional admin check here
    }

    const body = await request.json().catch(() => ({}))
    const clerkOrganizationId = body.clerkOrganizationId || "demo_org_123"

    const org = await seedDemoData(clerkOrganizationId)

    return NextResponse.json({
      success: true,
      message: "Demo data seeded successfully",
      organization: {
        id: org.id,
        name: org.name,
        slug: org.slug,
      },
    })
  } catch (error) {
    console.error("Error seeding demo data:", error)
    return NextResponse.json(
      { error: "Failed to seed demo data" },
      { status: 500 }
    )
  }
}

// DELETE /api/demo/seed - Clear demo data
export async function DELETE() {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== "development") {
      const { userId } = await auth()
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    await clearDemoData()

    return NextResponse.json({
      success: true,
      message: "Demo data cleared successfully",
    })
  } catch (error) {
    console.error("Error clearing demo data:", error)
    return NextResponse.json(
      { error: "Failed to clear demo data" },
      { status: 500 }
    )
  }
}
