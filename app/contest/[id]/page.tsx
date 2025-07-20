"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Trophy, CheckCircle, AlertTriangle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import type { Contest, CodeSubmission } from "@/lib/types"
import { generateId } from "@/lib/utils"
import { CodeEditor } from "@/components/code-editor"
import { ContestTimer } from "@/components/contest-timer"
import { apiClient } from "@/lib/api-client"

interface ContestPageProps {
  params: {
    id: string
  }
}

export default function ContestPage({ params }: ContestPageProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [contest, setContest] = useState<Contest | null>(null)
  const [currentTab, setCurrentTab] = useState("overview")
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>({})
  const [codingAnswers, setCodingAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [codingSubmissions, setCodingSubmissions] = useState<Record<string, CodeSubmission[]>>({})
  const [loading, setLoading] = useState(true)
  const [timeExpired, setTimeExpired] = useState(false)

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const contestData = await apiClient.getContest(params.id)
        if (!contestData) {
          router.push("/")
          return
        }
        setContest(contestData)

        // Check if contest has already ended
        if (contestData.endTime && new Date() > new Date(contestData.endTime)) {
          setTimeExpired(true)
        }
      } catch (error) {
        console.error("Failed to fetch contest:", error)
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    fetchContest()
  }, [params.id, router])

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (contest && user) {
        try {
          const submissions = await apiClient.getCodeSubmissions(contest.id, user.id)
          const submissionsByProblem: Record<string, CodeSubmission[]> = {}

          submissions.forEach((sub) => {
            if (!submissionsByProblem[sub.problemId]) {
              submissionsByProblem[sub.problemId] = []
            }
            submissionsByProblem[sub.problemId].push(sub)
          })

          setCodingSubmissions(submissionsByProblem)
        } catch (error) {
          console.error("Failed to fetch submissions:", error)
        }
      }
    }

    fetchSubmissions()
  }, [contest, user])

  if (!user) {
    router.push("/login")
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contest...</p>
        </div>
      </div>
    )
  }

  if (!contest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Contest not found</h2>
          <Button onClick={() => router.push("/")}>Back to Home</Button>
        </div>
      </div>
    )
  }

  const handleMCQAnswer = (questionId: string, answerIndex: number) => {
    if (timeExpired) return
    setMcqAnswers({ ...mcqAnswers, [questionId]: answerIndex })
  }

  const handleCodingAnswer = (problemId: string, code: string) => {
    if (timeExpired) return
    setCodingAnswers({ ...codingAnswers, [problemId]: code })
  }

  const calculateScore = () => {
    let correct = 0
    contest.mcqProblems.forEach((problem) => {
      if (mcqAnswers[problem.id] === problem.correctAnswer) {
        correct++
      }
    })
    return contest.mcqProblems.length > 0 ? (correct / contest.mcqProblems.length) * 100 : 0
  }

  const handleSubmit = async () => {
    if (timeExpired) return

    const finalScore = calculateScore()
    setScore(finalScore)
    setSubmitted(true)

    try {
      await apiClient.saveSubmission({
        id: generateId(),
        contestId: contest.id,
        userId: user.id,
        mcqAnswers,
        codingAnswers,
        score: finalScore,
        submittedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Failed to save submission:", error)
    }
  }

  const handleCodingSubmit = async (problemId: string, code: string, language: string) => {
    if (!contest || !user || timeExpired) return

    try {
      const submission = await apiClient.saveCodeSubmission({
        problemId,
        contestId: contest.id,
        userId: user.id,
        code,
        language,
      })

      setCodingSubmissions((prev) => ({
        ...prev,
        [problemId]: [...(prev[problemId] || []), submission],
      }))
    } catch (error) {
      console.error("Failed to save code submission:", error)
    }
  }

  const handleTimeExpired = () => {
    setTimeExpired(true)
    if (!submitted) {
      handleSubmit()
    }
  }

  if (submitted || timeExpired) {
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

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center">
            <CardHeader>
              {timeExpired ? (
                <>
                  <AlertTriangle className="w-16 h-16 mx-auto text-orange-500 mb-4" />
                  <CardTitle className="text-2xl">Time's Up!</CardTitle>
                  <CardDescription>
                    The contest has ended. Your submission has been automatically saved.
                  </CardDescription>
                </>
              ) : (
                <>
                  <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
                  <CardTitle className="text-2xl">Contest Completed!</CardTitle>
                  <CardDescription>Thank you for participating in {contest.title}</CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Your Results</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">{score?.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">MCQ Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{Object.keys(mcqAnswers).length}</div>
                    <div className="text-sm text-gray-600">MCQs Attempted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{Object.keys(codingAnswers).length}</div>
                    <div className="text-sm text-gray-600">Coding Problems Attempted</div>
                  </div>
                </div>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Your submission has been saved. Coding problems are being evaluated automatically.
                </AlertDescription>
              </Alert>

              <Button onClick={() => router.push("/")} className="w-full">
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </main>
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
            <div className="flex items-center space-x-4">
              {contest.endTime && <ContestTimer endTime={contest.endTime} onTimeExpired={handleTimeExpired} />}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{contest.title}</h1>
          <p className="text-gray-600 mb-4">{contest.description}</p>
          <div className="flex space-x-2">
            <Badge variant="outline">{contest.codingProblems.length} Coding Problems</Badge>
            <Badge variant="outline">{contest.mcqProblems.length} MCQ Problems</Badge>
            {contest.duration && <Badge variant="outline">{contest.duration} minutes</Badge>}
          </div>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="coding">Coding Problems ({contest.codingProblems.length})</TabsTrigger>
            <TabsTrigger value="mcq">MCQ Problems ({contest.mcqProblems.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contest Overview</CardTitle>
                <CardDescription>Review the contest structure before you begin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Instructions</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    <li>You can switch between coding and MCQ problems at any time</li>
                    <li>MCQ problems are auto-evaluated when you submit</li>
                    <li>Coding problems are automatically tested against test cases</li>
                    <li>Your submission will be automatically saved when time expires</li>
                    <li>Make sure to submit your contest before time runs out</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Coding Problems</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">{contest.codingProblems.length}</div>
                      <p className="text-sm text-gray-600">Algorithm and programming challenges</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">MCQ Problems</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{contest.mcqProblems.length}</div>
                      <p className="text-sm text-gray-600">Multiple choice questions</p>
                    </CardContent>
                  </Card>
                </div>

                <Button
                  onClick={() => setCurrentTab(contest.codingProblems.length > 0 ? "coding" : "mcq")}
                  className="w-full"
                  disabled={timeExpired}
                >
                  Start Contest
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coding" className="space-y-6">
            {contest.codingProblems.map((problem, index) => (
              <CodeEditor
                key={problem.id}
                problem={problem}
                index={index}
                onSubmit={(code, language) => handleCodingSubmit(problem.id, code, language)}
                submissions={codingSubmissions[problem.id] || []}
                disabled={timeExpired}
              />
            ))}

            {contest.codingProblems.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No coding problems in this contest</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="mcq" className="space-y-6">
            {contest.mcqProblems.map((problem, index) => (
              <Card key={problem.id}>
                <CardHeader>
                  <CardTitle>Question {index + 1}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-700">{problem.question}</p>

                    <RadioGroup
                      value={mcqAnswers[problem.id]?.toString() || ""}
                      onValueChange={(value) => handleMCQAnswer(problem.id, Number.parseInt(value))}
                      disabled={timeExpired}
                    >
                      {problem.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={optionIndex.toString()}
                            id={`${problem.id}-${optionIndex}`}
                            disabled={timeExpired}
                          />
                          <Label
                            htmlFor={`${problem.id}-${optionIndex}`}
                            className={`cursor-pointer ${timeExpired ? "opacity-50" : ""}`}
                          >
                            {String.fromCharCode(65 + optionIndex)}. {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            ))}

            {contest.mcqProblems.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No MCQ problems in this contest</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex justify-center">
          <Button onClick={handleSubmit} size="lg" className="px-8" disabled={timeExpired}>
            Submit Contest
          </Button>
        </div>
      </main>
    </div>
  )
}
