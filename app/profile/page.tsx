"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Trophy, Clock, Target, TrendingUp, Calendar, BookOpen } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import type { Submission, Contest } from "@/lib/types"
import { apiClient } from "@/lib/api-client"

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        const [userSubmissions, allContests] = await Promise.all([
          apiClient.getUserSubmissions(user.id),
          apiClient.getContests(),
        ])

        setSubmissions(userSubmissions)
        setContests(allContests)
      } catch (error) {
        console.error("Failed to fetch profile data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  if (!user) {
    router.push("/login")
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  const getContestTitle = (contestId: string) => {
    const contest = contests.find((c) => c.id === contestId)
    return contest?.title || "Unknown Contest"
  }

  const calculateStats = () => {
    if (submissions.length === 0) {
      return {
        totalExams: 0,
        averageScore: 0,
        bestScore: 0,
        totalMarks: 0,
        passedExams: 0,
      }
    }

    const totalExams = submissions.length
    const totalScore = submissions.reduce((sum, sub) => sum + sub.score, 0)
    const averageScore = totalScore / totalExams
    const bestScore = Math.max(...submissions.map((sub) => sub.score))
    const totalMarks = submissions.reduce((sum, sub) => sum + sub.totalMarks, 0)
    const passedExams = submissions.filter((sub) => {
      const contest = contests.find((c) => c.id === sub.contestId)
      return contest?.passingMarks ? sub.score >= contest.passingMarks : sub.percentage >= 50
    }).length

    return {
      totalExams,
      averageScore: Math.round(averageScore * 100) / 100,
      bestScore,
      totalMarks,
      passedExams,
    }
  }

  const stats = calculateStats()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" onClick={() => router.push("/")} className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Your exam performance and statistics</p>
        </div>

        {/* User Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600">Name</div>
                <div className="font-semibold">{user.name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Email</div>
                <div className="font-semibold">{user.email}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Member Since</div>
                <div className="font-semibold">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.totalExams}</div>
                  <div className="text-sm text-gray-600">Total Exams</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.averageScore}</div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Trophy className="w-8 h-8 text-yellow-600" />
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{stats.bestScore}</div>
                  <div className="text-sm text-gray-600">Best Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Target className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-purple-600">{stats.passedExams}</div>
                  <div className="text-sm text-gray-600">Passed Exams</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Submissions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Exam Results</CardTitle>
            <CardDescription>Your latest exam performances</CardDescription>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No exams taken yet</h3>
                <p className="text-gray-600 mb-6">Start taking exams to see your results here</p>
                <Button onClick={() => router.push("/")}>Browse Contests</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions
                  .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                  .slice(0, 10)
                  .map((submission) => (
                    <div
                      key={submission.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{getContestTitle(submission.contestId)}</h4>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {new Date(submission.submittedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{Math.floor(submission.timeTaken / 60)} min</span>
                          </div>
                          {submission.reviewData && (
                            <div className="flex items-center space-x-2">
                              <span className="text-green-600">✓ {submission.reviewData.correct}</span>
                              <span className="text-red-600">✗ {submission.reviewData.incorrect}</span>
                              <span className="text-gray-500">— {submission.reviewData.unattempted}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            {submission.score}/{submission.totalMarks}
                          </div>
                          <div className="text-sm text-gray-600">{submission.percentage.toFixed(1)}%</div>
                        </div>
                        <Badge
                          variant={submission.percentage >= 50 ? "default" : "destructive"}
                          className={
                            submission.percentage >= 80
                              ? "bg-green-100 text-green-800"
                              : submission.percentage >= 50
                                ? "bg-yellow-100 text-yellow-800"
                                : ""
                          }
                        >
                          {submission.percentage >= 80
                            ? "Excellent"
                            : submission.percentage >= 50
                              ? "Good"
                              : "Needs Improvement"}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
