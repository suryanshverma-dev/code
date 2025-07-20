import { type NextRequest, NextResponse } from "next/server"
import { getContest } from "@/lib/server-storage"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const contest = await getContest(params.id)
    if (!contest) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 })
    }
    return NextResponse.json(contest)
  } catch (error) {
    console.error("Get contest error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
