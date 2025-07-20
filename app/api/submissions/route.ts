import { type NextRequest, NextResponse } from "next/server"
import { saveSubmission, getContest, calculateScore } from "@/lib/server-storage"
import { authenticateToken } from "@/lib/auth-middleware"

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { contestId, answers, timeTaken } = await request.json()

    // Get contest to calculate score
    const contest = await getContest(contestId)
    if (!contest) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 })
    }

    // Calculate score and review data
    const scoreData = calculateScore(answers, contest.mcqProblems)

    const submission = await saveSubmission({
      contestId,
      userId: user.id,
      answers,
      timeTaken,
      submittedAt: new Date().toISOString(),
      ...scoreData,
    })

    return NextResponse.json(submission)
  } catch (error) {
    console.error("Save submission error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
