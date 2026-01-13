import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db/prisma"
import { getGarminClient } from "@/lib/integrations/garmin/client"
import { AppleHealthMockClient } from "@/lib/integrations/apple-health/mock-client"
import { RenphoMockClient } from "@/lib/integrations/renpho/mock-client"
import { FunctionHealthMockClient } from "@/lib/integrations/function-health/mock-client"
import { IntegrationSource, ConnectionStatus } from "@prisma/client"

// POST /api/integrations/sync - Trigger sync for all connected integrations
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const member = await prisma.member.findFirst({
      where: { clerkUserId: userId },
      include: {
        integrations: {
          where: { status: ConnectionStatus.ACTIVE },
        },
      },
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    const results: Record<string, { success: boolean; metricsUpdated: number; error?: string }> = {}

    for (const connection of member.integrations) {
      try {
        switch (connection.source) {
          case IntegrationSource.GARMIN: {
            const garminClient = getGarminClient()
            const syncResult = await garminClient.syncHealthData(member.id)
            results[connection.source] = {
              success: syncResult.success,
              metricsUpdated: syncResult.metricsUpdated,
              error: syncResult.errors[0],
            }
            break
          }

          case IntegrationSource.APPLE_HEALTH: {
            // Mock sync - in production would come from mobile app
            const appleClient = new AppleHealthMockClient("moderate")
            const data = await appleClient.getDataForDate(new Date())
            const metrics = appleClient.transformToMetrics(member.id, data, new Date())

            // Store metrics in database
            for (const metric of metrics) {
              await prisma.biometricMetric.create({
                data: metric,
              })
            }

            await prisma.integrationConnection.update({
              where: { id: connection.id },
              data: {
                lastSyncAt: new Date(),
                lastSyncStatus: "SUCCESS",
              },
            })

            results[connection.source] = {
              success: true,
              metricsUpdated: metrics.length,
            }
            break
          }

          case IntegrationSource.RENPHO: {
            const renphoClient = new RenphoMockClient("normal", true)
            const measurement = await renphoClient.getLatestMeasurement()
            const metrics = renphoClient.transformToMetrics(member.id, measurement, new Date())

            for (const metric of metrics) {
              await prisma.biometricMetric.create({
                data: metric,
              })
            }

            await prisma.integrationConnection.update({
              where: { id: connection.id },
              data: {
                lastSyncAt: new Date(),
                lastSyncStatus: "SUCCESS",
              },
            })

            results[connection.source] = {
              success: true,
              metricsUpdated: metrics.length,
            }
            break
          }

          case IntegrationSource.FUNCTION_HEALTH: {
            const functionClient = new FunctionHealthMockClient("normal", true, true)
            const panel = await functionClient.getLatestPanel()
            const metrics = functionClient.transformToMetrics(member.id, panel, new Date())

            for (const metric of metrics) {
              await prisma.biometricMetric.create({
                data: metric,
              })
            }

            await prisma.integrationConnection.update({
              where: { id: connection.id },
              data: {
                lastSyncAt: new Date(),
                lastSyncStatus: "SUCCESS",
              },
            })

            results[connection.source] = {
              success: true,
              metricsUpdated: metrics.length,
            }
            break
          }

          default:
            results[connection.source] = {
              success: false,
              metricsUpdated: 0,
              error: "Unsupported integration source",
            }
        }
      } catch (error) {
        console.error(`Error syncing ${connection.source}:`, error)
        results[connection.source] = {
          success: false,
          metricsUpdated: 0,
          error: error instanceof Error ? error.message : "Unknown error",
        }

        await prisma.integrationConnection.update({
          where: { id: connection.id },
          data: {
            lastSyncAt: new Date(),
            lastSyncStatus: "FAILED",
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error("Error in sync endpoint:", error)
    return NextResponse.json(
      { error: "Failed to sync integrations" },
      { status: 500 }
    )
  }
}
