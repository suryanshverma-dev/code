import { type NextRequest, NextResponse } from "next/server"
import { serverStorage } from "@/lib/server-storage"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Check if user already exists
    const existingUser = await serverStorage.getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Create user
    const user = await serverStorage.createUser({ name, email, password })
    return NextResponse.json(user)
  } catch (error) {
    console.error("Error during signup:", error)
    return NextResponse.json({ error: "Signup failed" }, { status: 500 })
  }
}
