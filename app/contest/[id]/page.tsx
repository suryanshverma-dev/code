"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Trophy,
  CheckCircle,
  AlertTriangle,
  Clock,
  BookOpen,
  Target,
  ChevronLeft,
  ChevronRight,
  Flag,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { storage } from "@/lib/storage"
import type { Contest, ExamSession } from "@/lib/types"
import Image from "next/image"

interface ContestPageProps {
  params: {
    id: string
  }
}

export default function ContestPage({ params }: ContestPageProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [contest, setContest] = useState<Contest | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [timeExpired, setTimeExpired] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)
  const [examSession, setExamSession] = useState<ExamSession | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(0)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const contestData = storage.getContestById(params.id)
    if (!contestData) {
      router.push("/")
      return
    }

    setContest(contestData)

    // Check if user already submitted
    const existingSubmission = storage.getUserSubmissionForContest(user.id, params.id)
    if (existingSubmission) {
      setSubmitted(true)
      setLoading(false)
      return
    }

    // Load or create exam session
    let session = storage.getExamSession(params.id, user.id)
    if (!session) {
      session = {
        contestId: params.id,
        userId: user.id,
        startTime: Date.now(),
        answers: {},
        currentQuestion: 0,
        timeRemaining: contestData.duration * 60, // Convert to seconds
        isSubmitted: false,
      }
      storage.setExamSession(session)
    }

    setExamSession(session)
    setAnswers(session.answers)
    setCurrentQuestion(session.currentQuestion)
    setTimeRemaining(session.timeRemaining)
    setLoading(false)
  }, [params.id, user, router])

  // Timer effect
  useEffect(() => {
    if (!examSession || submitted || timeExpired || showInstructions) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1

        // Update session
        if (examSession) {
          const updatedSession = {
            ...examSession,
            timeRemaining: newTime,
            answers,
            currentQuestion,
          }
          storage.setExamSession(updatedSession)
          setExamSession(updatedSession)
        }

        if (newTime <= 0) {
          setTimeExpired(true)
          handleSubmit(true)
          return 0
        }

        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [examSession, submitted, timeExpired, showInstructions, answers, currentQuestion])

  if (!user) {
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

  const handleAnswer = (questionId: string, answerOptionId: string) => {
    if (timeExpired || submitted) return

    const newAnswers = { ...answers, [questionId]: answerOptionId }
    setAnswers(newAnswers)

    // Update session
    if (examSession) {
      const updatedSession = {
        ...examSession,
        answers: newAnswers,
        currentQuestion,
      }
      storage.setExamSession(updatedSession)
      setExamSession(updatedSession)
    }
  }

  const handleSubmit = async (autoSubmit = false) => {
    if (submitted) return

    const timeTaken = examSession ? examSession.timeRemaining - timeRemaining : 0
    setSubmitted(true)

    try {
      const scoreData = storage.calculateScore(contest.id, answers)

      storage.createSubmission({
        contestId: contest.id,
        userId: user.id,
        userName: user.name,
        answers,
        timeTaken,
        submittedAt: new Date().toISOString(),
        ...scoreData,
      })

      // Clear exam session
      storage.clearExamSession(contest.id, user.id)
    } catch (error) {
      console.error("Failed to save submission:", error)
    }
  }

  const getQuestionStatus = (questionId: string) => {
    return answers[questionId] ? "answered" : "unanswered"
  }

  const answeredCount = Object.keys(answers).length
  const progressPercentage = (answeredCount / contest.mcqProblems.length) * 100

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Instructions screen
  if (showInstructions && !submitted && !timeExpired) {
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
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center space-x-2">
                <BookOpen className="w-6 h-6" />
                <span>{contest.title}</span>
              </CardTitle>
              <CardDescription>{contest.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-semibold text-blue-900">{contest.duration} minutes</div>
                    <div className="text-sm text-blue-600">Duration</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                  <Target className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-semibold text-green-900">{contest.mcqProblems.length} Questions</div>
                    <div className="text-sm text-green-600">Total Questions</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg">
                  <Trophy className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-semibold text-purple-900">{contest.totalMarks} Marks</div>
                    <div className="text-sm text-purple-600">Total Marks</div>
                  </div>
                </div>
              </div>

              {contest.instructions && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Instructions</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <pre className="text-sm text-yellow-800 whitespace-pre-wrap font-sans">{contest.instructions}</pre>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-3">General Guidelines</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                    <li>Read each question carefully before selecting your answer</li>
                    <li>You can navigate between questions using the question palette</li>
                    <li>Your progress is automatically saved</li>
                    <li>Submit your exam before time expires</li>
                    <li>Once submitted, you cannot change your answers</li>
                    <li className="text-red-600 font-medium">
                      <strong>Note:</strong> Questions may have negative marking for incorrect answers
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-center">
                <Button onClick={() => setShowInstructions(false)} size="lg" className="px-8">
                  Start Exam
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  // Results screen
  if (submitted || timeExpired) {
    const submission = storage.getUserSubmissionForContest(user.id, contest.id)

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
                  <CardDescription>The exam has ended. Your submission has been automatically saved.</CardDescription>
                </>
              ) : (
                <>
                  <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
                  <CardTitle className="text-2xl">Exam Completed!</CardTitle>
                  <CardDescription>Thank you for taking {contest.title}</CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {submission && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Your Results</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{submission.score}</div>
                      <div className="text-sm text-gray-600">Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{submission.correctAnswers}</div>
                      <div className="text-sm text-gray-600">Correct</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{submission.wrongAnswers}</div>
                      <div className="text-sm text-gray-600">Wrong</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">{submission.unattempted}</div>
                      <div className="text-sm text-gray-600">Unattempted</div>
                    </div>
                  </div>
                </div>
              )}

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Your submission has been saved successfully. You can view detailed results in your profile.
                </AlertDescription>
              </Alert>

              <div className="flex space-x-4 justify-center">
                <Button onClick={() => router.push("/")} variant="outline">
                  Back to Home
                </Button>
                <Button onClick={() => router.push("/profile")}>View Profile</Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const currentProblem = contest.mcqProblems[currentQuestion]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold">{contest.title}</h1>
              <Badge variant="outline">
                {currentQuestion + 1} of {contest.mcqProblems.length}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
                  timeRemaining <= 300
                    ? "bg-red-100 text-red-800"
                    : timeRemaining <= 600
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Palette */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Question Palette</CardTitle>
                <div className="space-y-2">
                  <Progress value={progressPercentage} className="w-full" />
                  <div className="text-sm text-gray-600">
                    {answeredCount} of {contest.mcqProblems.length} answered
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {contest.mcqProblems.map((_, index) => (
                    <Button
                      key={index}
                      variant={currentQuestion === index ? "default" : "outline"}
                      size="sm"
                      className={`w-10 h-10 p-0 ${
                        getQuestionStatus(contest.mcqProblems[index].id) === "answered"
                          ? "bg-green-100 border-green-300 text-green-800 hover:bg-green-200"
                          : ""
                      }`}
                      onClick={() => {
                        setCurrentQuestion(index)
                        if (examSession) {
                          const updatedSession = { ...examSession, currentQuestion: index }
                          storage.setExamSession(updatedSession)
                          setExamSession(updatedSession)
                        }
                      }}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
                    <span>Not Answered</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span>Current</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Button
                    onClick={() => handleSubmit()}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    disabled={timeExpired || submitted}
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    Submit Exam
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Question {currentQuestion + 1}
                    {currentProblem.subject && (
                      <Badge variant="secondary" className="ml-2">
                        {currentProblem.subject}
                      </Badge>
                    )}
                    <Badge variant="outline" className="ml-2">
                      {currentProblem.difficulty}
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">+{currentProblem.marks} marks</Badge>
                    {currentProblem.negativeMarks > 0 && (
                      <Badge variant="destructive">-{currentProblem.negativeMarks} marks</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-gray-900 mb-4 leading-relaxed text-lg">{currentProblem.question}</div>

                  {currentProblem.questionImage && (
                    <div className="mb-4">
                      <Image
                        src={currentProblem.questionImage || "/placeholder.svg"}
                        alt="Question image"
                        width={600}
                        height={400}
                        className="rounded-lg border border-gray-200 max-w-full h-auto"
                      />
                    </div>
                  )}
                </div>

                <RadioGroup
                  value={answers[currentProblem.id] || ""}
                  onValueChange={(value) => handleAnswer(currentProblem.id, value)}
                  disabled={timeExpired || submitted}
                >
                  {currentProblem.options.map((option, optionIndex) => (
                    <div
                      key={option.id}
                      className="flex items-start space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <RadioGroupItem
                        value={option.id}
                        id={`${currentProblem.id}-${option.id}`}
                        disabled={timeExpired || submitted}
                        className="mt-1"
                      />
                      <Label
                        htmlFor={`${currentProblem.id}-${option.id}`}
                        className={`cursor-pointer flex-1 ${timeExpired || submitted ? "opacity-50" : ""}`}
                      >
                        <div className="flex items-start space-x-3">
                          <span className="font-medium text-gray-700 text-lg">
                            {String.fromCharCode(65 + optionIndex)}.
                          </span>
                          <div className="flex-1">
                            <div className="text-base">{option.text}</div>
                            {option.imageUrl && (
                              <div className="mt-2">
                                <Image
                                  src={option.imageUrl || "/placeholder.svg"}
                                  alt={`Option ${String.fromCharCode(65 + optionIndex)} image`}
                                  width={300}
                                  height={200}
                                  className="rounded border border-gray-200 max-w-full h-auto"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const newIndex = Math.max(0, currentQuestion - 1)
                        setCurrentQuestion(newIndex)
                        if (examSession) {
                          const updatedSession = { ...examSession, currentQuestion: newIndex }
                          storage.setExamSession(updatedSession)
                          setExamSession(updatedSession)
                        }
                      }}
                      disabled={currentQuestion === 0}
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const newIndex = Math.min(contest.mcqProblems.length - 1, currentQuestion + 1)
                        setCurrentQuestion(newIndex)
                        if (examSession) {
                          const updatedSession = { ...examSession, currentQuestion: newIndex }
                          storage.setExamSession(updatedSession)
                          setExamSession(updatedSession)
                        }
                      }}
                      disabled={currentQuestion === contest.mcqProblems.length - 1}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>

                  <Button
                    onClick={() => handleSubmit()}
                    disabled={timeExpired || submitted}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    Submit Exam
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
