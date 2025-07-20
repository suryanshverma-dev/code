import { type NextRequest, NextResponse } from "next/server"
import { authenticateToken } from "@/lib/auth-middleware"
import { executeCode } from "@/lib/code-executor"

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { code, language, problem } = await request.json()
    const result = await executeCode(code, language, problem)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Code execution error:", error)
    return NextResponse.json({ error: "Execution failed" }, { status: 500 })
  }
}
