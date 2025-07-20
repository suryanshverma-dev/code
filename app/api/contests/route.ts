import { type NextRequest, NextResponse } from "next/server"
import { serverStorage } from "@/lib/server-storage"

export async function GET() {
  try {
    const contests = await serverStorage.getContests()
    return NextResponse.json(contests)
  } catch (error) {
    console.error("Error fetching contests:", error)
    return NextResponse.json({ error: "Failed to fetch contests" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const contestData = await request.json()
    const contest = await serverStorage.createContest(contestData)
    return NextResponse.json(contest)
  } catch (error) {
    console.error("Error creating contest:", error)
    return NextResponse.json({ error: "Failed to create contest" }, { status: 500 })
  }
}
