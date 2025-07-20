"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Trophy, Calendar, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import type { Contest, Submission } from "@/lib/types"
import { apiClient } from "@/lib/api-client"

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        const [submissionsData, contestsData] = await Promise.all([
          apiClient.getSubmissions(user.id),
          apiClient.getContests(),
        ])

        setSubmissions(submissionsData)
        setContests(contestsData)
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

  const userContests = contests.filter((contest) => contest.createdBy === user.name)

  const handleLogout = () => {
    logout()
    router.push("/")
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" onClick={() => router.push("/")} className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{user.name}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{submissions.length}</div>
                  <div className="text-sm text-gray-600">Contests Participated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{userContests.length}</div>
                  <div className="text-sm text-gray-600">Contests Created</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {submissions.length > 0
                      ? (submissions.reduce((sum, sub) => sum + sub.score, 0) / submissions.length).toFixed(1)
                      : "0"}
                    %
                  </div>
                  <div className="text-sm text-gray-600">Average MCQ Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contest Submissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span>Contest Submissions</span>
              </CardTitle>
              <CardDescription>Your participation history and scores</CardDescription>
            </CardHeader>
            <CardContent>
              {submissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No contest submissions yet</p>
                  <Button onClick={() => router.push("/")} className="mt-4" variant="outline">
                    Participate in a Contest
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => {
                    const contest = contests.find((c) => c.id === submission.contestId)
                    return (
                      <div key={submission.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{contest?.title || "Unknown Contest"}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(submission.submittedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={submission.score >= 70 ? "default" : "secondary"}>
                              {submission.score.toFixed(1)}% MCQ Score
                            </Badge>
                            <div className="text-xs text-gray-500 mt-1">
                              {Object.keys(submission.mcqAnswers).length} MCQs •{" "}
                              {Object.keys(submission.codingAnswers).length} Coding
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Created Contests */}
          <Card>
            <CardHeader>
              <CardTitle>Created Contests</CardTitle>
              <CardDescription>Contests you've created for the community</CardDescription>
            </CardHeader>
            <CardContent>
              {userContests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No contests created yet</p>
                  <Button onClick={() => router.push("/create-contest")} className="mt-4" variant="outline">
                    Create Your First Contest
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userContests.map((contest) => (
                    <div key={contest.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{contest.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{contest.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                            <span>{contest.codingProblems.length} Coding Problems</span>
                            <span>{contest.mcqProblems.length} MCQ Problems</span>
                            <span>Created {new Date(contest.createdAt).toLocaleDateString()}</span>
                            {contest.duration && <span>{contest.duration} minutes</span>}
                          </div>
                        </div>
                        <Button onClick={() => router.push(`/contest/${contest.id}`)} variant="outline" size="sm">
                          View Contest
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
