import { type NextRequest, NextResponse } from "next/server"
import { getContestSubmissions } from "@/lib/server-storage"
import { authenticateToken } from "@/lib/auth-middleware"

export async function GET(request: NextRequest, { params }: { params: { contestId: string } }) {
  try {
    const user = await authenticateToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const submissions = await getContestSubmissions(params.contestId)
    return NextResponse.json(submissions)
  } catch (error) {
    console.error("Get contest submissions error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
