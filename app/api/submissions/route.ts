import { type NextRequest, NextResponse } from "next/server"
import { serverStorage } from "@/lib/server-storage"

export async function POST(request: NextRequest) {
  try {
    const { contestId, userId, answers, timeTaken } = await request.json()

    // Check if user already submitted
    const existingSubmission = await serverStorage.getUserSubmissionForContest(userId, contestId)
    if (existingSubmission) {
      return NextResponse.json({ error: "Already submitted" }, { status: 400 })
    }

    // Calculate score
    const scoreData = await serverStorage.calculateScore(contestId, answers)

    // Get user name
    const user = await serverStorage.getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create submission
    const submission = await serverStorage.createSubmission({
      contestId,
      userId,
      userName: user.name,
      answers,
      timeTaken,
      submittedAt: new Date().toISOString(),
      ...scoreData,
    })

    return NextResponse.json(submission)
  } catch (error) {
    console.error("Error creating submission:", error)
    return NextResponse.json({ error: "Failed to submit answers" }, { status: 500 })
  }
}
