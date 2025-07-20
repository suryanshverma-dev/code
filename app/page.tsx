"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Trophy, Plus, Clock } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import type { Contest } from "@/lib/types"
import { apiClient } from "@/lib/api-client"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [contests, setContests] = useState<Contest[]>([])
  const [loadingContests, setLoadingContests] = useState(true)

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const contestsData = await apiClient.getContests()
        setContests(contestsData)
      } catch (error) {
        console.error("Failed to fetch contests:", error)
      } finally {
        setLoadingContests(false)
      }
    }

    fetchContests()
  }, [])

  const getContestStatus = (contest: Contest) => {
    const now = new Date()
    const startTime = contest.startTime ? new Date(contest.startTime) : null
    const endTime = contest.endTime ? new Date(contest.endTime) : null

    if (endTime && now > endTime) {
      return { status: "ended", color: "text-gray-500" }
    }
    if (startTime && now < startTime) {
      return { status: "upcoming", color: "text-blue-600" }
    }
    return { status: "active", color: "text-green-600" }
  }

  const formatTimeRemaining = (endTime: string) => {
    const now = new Date()
    const end = new Date(endTime)
    const diff = end.getTime() - now.getTime()

    if (diff <= 0) return "Ended"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`
    }
    return `${minutes}m remaining`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Trophy className="w-12 h-12 mx-auto text-indigo-600 mb-4" />
            <CardTitle className="text-2xl">CodeContest Platform</CardTitle>
            <CardDescription>Join coding contests and test your programming skills</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => router.push("/login")} className="w-full">
              Login
            </Button>
            <Button onClick={() => router.push("/signup")} variant="outline" className="w-full">
              Sign Up
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Trophy className="w-8 h-8 text-indigo-600" />
              <h1 className="text-xl font-bold text-gray-900">CodeContest</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Button onClick={() => router.push("/create-contest")} className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Create Contest</span>
              </Button>
              <Button onClick={() => router.push("/generate-mcqs")} variant="outline">
                Generate MCQs
              </Button>
              <Button onClick={() => router.push("/profile")} variant="ghost">
                Profile
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name}!</h2>
          <p className="text-gray-600">Choose a contest to participate in or create your own</p>
        </div>

        {loadingContests ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading contests...</p>
          </div>
        ) : contests.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Trophy className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No contests available</h3>
              <p className="text-gray-600 mb-6">Be the first to create a contest for the community</p>
              <Button onClick={() => router.push("/create-contest")}>Create First Contest</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contests.map((contest) => {
              const contestStatus = getContestStatus(contest)
              return (
                <Card key={contest.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{contest.title}</CardTitle>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge variant="secondary">
                          {contest.codingProblems.length + contest.mcqProblems.length} problems
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${contestStatus.color}`}>
                          {contestStatus.status}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">{contest.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Created {new Date(contest.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>By {contest.createdBy}</span>
                        </div>
                      </div>

                      {contest.endTime && contestStatus.status === "active" && (
                        <div className="flex items-center space-x-1 text-sm text-orange-600">
                          <Clock className="w-4 h-4" />
                          <span>{formatTimeRemaining(contest.endTime)}</span>
                        </div>
                      )}

                      <div className="flex space-x-2 text-xs">
                        {contest.codingProblems.length > 0 && (
                          <Badge variant="outline">{contest.codingProblems.length} Coding</Badge>
                        )}
                        {contest.mcqProblems.length > 0 && (
                          <Badge variant="outline">{contest.mcqProblems.length} MCQ</Badge>
                        )}
                        {contest.duration && <Badge variant="outline">{contest.duration}min</Badge>}
                      </div>

                      <Button
                        onClick={() => router.push(`/contest/${contest.id}`)}
                        className="w-full mt-4"
                        disabled={contestStatus.status === "ended"}
                      >
                        {contestStatus.status === "ended"
                          ? "Contest Ended"
                          : contestStatus.status === "upcoming"
                            ? "View Contest"
                            : "Participate"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
