import { type NextRequest, NextResponse } from "next/server"
import { getContests, createContest } from "@/lib/server-storage"
import { authenticateToken } from "@/lib/auth-middleware"

export async function GET() {
  try {
    const contests = await getContests()
    return NextResponse.json(contests)
  } catch (error) {
    console.error("Get contests error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const contestData = await request.json()

    const contest = await createContest({
      ...contestData,
      createdBy: user.name,
      startTime: contestData.startTime || new Date().toISOString(),
      endTime: contestData.endTime || new Date(Date.now() + (contestData.duration || 120) * 60 * 1000).toISOString(),
    })

    return NextResponse.json(contest)
  } catch (error) {
    console.error("Create contest error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
