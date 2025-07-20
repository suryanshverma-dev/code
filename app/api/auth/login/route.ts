import { type NextRequest, NextResponse } from "next/server"
import { serverStorage } from "@/lib/server-storage"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Simple authentication - in production, use proper password hashing
    const user = await serverStorage.getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // In production, verify password hash
    return NextResponse.json(user)
  } catch (error) {
    console.error("Error during login:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
