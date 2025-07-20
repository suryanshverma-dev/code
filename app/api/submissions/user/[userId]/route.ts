import { type NextRequest, NextResponse } from "next/server"
import { getUserSubmissions } from "@/lib/server-storage"
import { authenticateToken } from "@/lib/auth-middleware"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const user = await authenticateToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Users can only access their own submissions
    if (user.id !== params.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const submissions = await getUserSubmissions(params.userId)
    return NextResponse.json(submissions)
  } catch (error) {
    console.error("Get user submissions error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
