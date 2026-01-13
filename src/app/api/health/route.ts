import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

// GET /api/health - Health check endpoint
export async function GET() {
  const checks = {
    status: "healthy" as "healthy" | "degraded" | "unhealthy",
    timestamp: new Date().toISOString(),
    services: {
      database: false,
      api: true,
    },
  }

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    checks.services.database = true
  } catch (error) {
    console.error("Database health check failed:", error)
    checks.status = "degraded"
  }

  // Determine overall status
  if (!checks.services.database) {
    checks.status = "unhealthy"
  }

  const statusCode = checks.status === "healthy" ? 200 : checks.status === "degraded" ? 200 : 503

  return NextResponse.json(checks, { status: statusCode })
}
