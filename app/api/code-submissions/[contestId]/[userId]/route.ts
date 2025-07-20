import { type NextRequest, NextResponse } from "next/server"
import { getCodeSubmissions } from "@/lib/server-storage"
import { authenticateToken } from "@/lib/auth-middleware"

export async function GET(request: NextRequest, { params }: { params: { contestId: string; userId: string } }) {
  try {
    const user = await authenticateToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const submissions = await getCodeSubmissions()
    const userSubmissions = submissions.filter((s) => s.contestId === params.contestId && s.userId === params.userId)

    return NextResponse.json(userSubmissions)
  } catch (error) {
    console.error("Get code submissions error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
