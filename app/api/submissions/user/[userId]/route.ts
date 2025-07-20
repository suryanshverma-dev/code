import { type NextRequest, NextResponse } from "next/server"
import { getSubmissions } from "@/lib/server-storage"
import { authenticateToken } from "@/lib/auth-middleware"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const user = await authenticateToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const submissions = await getSubmissions()
    const userSubmissions = submissions.filter((s) => s.userId === params.userId)

    return NextResponse.json(userSubmissions)
  } catch (error) {
    console.error("Get user submissions error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
