import { type NextRequest, NextResponse } from "next/server"
import { saveCodeSubmission, getContest } from "@/lib/server-storage"
import { authenticateToken } from "@/lib/auth-middleware"
import { executeCode } from "@/lib/code-executor"

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { problemId, contestId, code, language } = await request.json()

    // Find the contest and problem
    const contest = await getContest(contestId)
    if (!contest) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 })
    }

    const problem = contest.codingProblems.find((p) => p.id === problemId)
    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 })
    }

    // Execute code
    const result = await executeCode(code, language, problem)

    const submission = await saveCodeSubmission({
      problemId,
      contestId,
      userId: user.id,
      code,
      language,
      result,
    })

    return NextResponse.json(submission)
  } catch (error) {
    console.error("Save code submission error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
