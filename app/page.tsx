"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Clock, BookOpen, Trophy, Calendar, User } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import type { Contest } from "@/lib/types"
import { apiClient } from "@/lib/api-client"

export default function HomePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const contestsData = await apiClient.getContests()
        setContests(contestsData)
      } catch (error) {
        console.error("Failed to fetch contests:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchContests()
  }, [])

  if (!user) {
    router.push("/login")
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getContestStatus = (contest: Contest) => {
    const now = new Date()
    const startTime = contest.startTime ? new Date(contest.startTime) : new Date(contest.createdAt)
    const endTime = contest.endTime
      ? new Date(contest.endTime)
      : new Date(startTime.getTime() + contest.duration * 60 * 1000)

    if (now < startTime) {
      return { status: "upcoming", color: "bg-blue-100 text-blue-800" }
    } else if (now >= startTime && now <= endTime) {
      return { status: "live", color: "bg-green-100 text-green-800" }
    } else {
      return { status: "ended", color: "bg-gray-100 text-gray-800" }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <BookOpen className="w-8 h-8 text-indigo-600" />
              <h1 className="text-xl font-bold text-gray-900">MCQ Contest Platform</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">{user.name}</span>
              </div>
              <Button variant="outline" onClick={() => router.push("/profile")}>
                Profile
              </Button>
              <Button variant="ghost" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Available Contests</h2>
              <p className="text-gray-600 mt-1">Take MCQ-based examinations and tests</p>
            </div>
            <Button onClick={() => router.push("/create-contest")} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create Contest</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : contests.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contests available</h3>
            <p className="text-gray-600 mb-6">Create your first MCQ contest to get started</p>
            <Button onClick={() => router.push("/create-contest")}>
              <Plus className="w-4 h-4 mr-2" />
              Create Contest
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contests.map((contest) => {
              const contestStatus = getContestStatus(contest)
              return (
                <Card key={contest.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{contest.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{contest.description}</CardDescription>
                      </div>
                      <Badge className={contestStatus.color}>{contestStatus.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-gray-500" />
                        <span>{contest.mcqProblems.length} Questions</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{contest.duration} min</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-4 h-4 text-gray-500" />
                        <span>{contest.totalMarks} Marks</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>{contest.createdBy}</span>
                      </div>
                    </div>

                    {contest.startTime && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Starts: {formatDate(contest.startTime)}</span>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button
                        onClick={() => router.push(`/contest/${contest.id}`)}
                        className="flex-1"
                        disabled={contestStatus.status === "ended"}
                      >
                        {contestStatus.status === "upcoming"
                          ? "View Details"
                          : contestStatus.status === "live"
                            ? "Take Exam"
                            : "View Results"}
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
