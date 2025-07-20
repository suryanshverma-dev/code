import { type NextRequest, NextResponse } from "next/server"
import { saveSubmission } from "@/lib/server-storage"
import { authenticateToken } from "@/lib/auth-middleware"

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const submissionData = await request.json()

    const submission = await saveSubmission({
      ...submissionData,
      userId: user.id,
    })

    return NextResponse.json(submission)
  } catch (error) {
    console.error("Save submission error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
