import { type NextRequest, NextResponse } from "next/server"
import { serverStorage } from "@/lib/server-storage"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const submissions = await serverStorage.getSubmissionsByUserId(params.userId)
    return NextResponse.json(submissions)
  } catch (error) {
    console.error("Error fetching user submissions:", error)
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 })
  }
}
