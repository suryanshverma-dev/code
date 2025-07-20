import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import { getUsers } from "./server-storage"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function authenticateToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string }
    const users = await getUsers()
    const user = users.find((u) => u.id === decoded.id)

    return user || null
  } catch (error) {
    console.error("Token authentication error:", error)
    return null
  }
}
