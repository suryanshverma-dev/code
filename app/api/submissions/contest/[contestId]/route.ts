import { type NextRequest, NextResponse } from "next/server"
import { serverStorage } from "@/lib/server-storage"

export async function GET(request: NextRequest, { params }: { params: { contestId: string } }) {
  try {
    const submissions = await serverStorage.getSubmissionsByContestId(params.contestId)
    return NextResponse.json(submissions)
  } catch (error) {
    console.error("Error fetching contest submissions:", error)
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 })
  }
}
