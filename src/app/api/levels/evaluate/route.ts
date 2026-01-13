import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db/prisma"
import {
  evaluateMemberLevel,
  updateMemberLevel,
  getLevelProgress,
  createBaselineSnapshot,
} from "@/lib/levels/evaluator"
import { getRebatePercentage, getLevelDisplayName } from "@/lib/levels/rules"

// GET /api/levels/evaluate - Get current level status and progress
export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const member = await prisma.member.findFirst({
      where: { clerkUserId: userId },
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Get progress toward next level
    const progress = await getLevelProgress(member.id)

    return NextResponse.json({
      currentLevel: progress.currentLevel,
      currentLevelName: getLevelDisplayName(progress.currentLevel),
      currentRebate: getRebatePercentage(progress.currentLevel),
      nextLevel: progress.nextLevel,
      nextLevelName: progress.nextLevel ? getLevelDisplayName(progress.nextLevel) : null,
      nextLevelRebate: progress.nextLevel ? getRebatePercentage(progress.nextLevel) : null,
      progressPercentage: progress.progress,
      metricProgress: progress.metricProgress,
    })
  } catch (error) {
    console.error("Error getting level progress:", error)
    return NextResponse.json(
      { error: "Failed to get level progress" },
      { status: 500 }
    )
  }
}

// POST /api/levels/evaluate - Trigger level evaluation
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const member = await prisma.member.findFirst({
      where: { clerkUserId: userId },
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Check if baseline needs to be created first
    const hasBaseline = await prisma.baselineSnapshot.findFirst({
      where: { memberId: member.id, status: "COMPLETE" },
    })

    if (!hasBaseline) {
      // Try to create baseline from existing data
      await createBaselineSnapshot(member.id)
    }

    // Run evaluation
    const evaluation = await evaluateMemberLevel(member.id)

    // Update level if eligible for a higher level
    if (
      evaluation.eligible &&
      evaluation.evaluatedLevel !== evaluation.currentLevel
    ) {
      // Check if the evaluated level is higher than current
      const levelOrder = ["LEVEL_0", "LEVEL_1", "LEVEL_2", "LEVEL_3"]
      const currentIndex = levelOrder.indexOf(evaluation.currentLevel)
      const evaluatedIndex = levelOrder.indexOf(evaluation.evaluatedLevel)

      if (evaluatedIndex > currentIndex) {
        await updateMemberLevel(
          member.id,
          evaluation.evaluatedLevel,
          evaluation.reason,
          evaluation
        )
      }
    }

    return NextResponse.json({
      success: true,
      previousLevel: evaluation.currentLevel,
      newLevel: evaluation.evaluatedLevel,
      eligible: evaluation.eligible,
      reason: evaluation.reason,
      metricResults: evaluation.metricResults,
    })
  } catch (error) {
    console.error("Error evaluating level:", error)
    return NextResponse.json(
      { error: "Failed to evaluate level" },
      { status: 500 }
    )
  }
}
