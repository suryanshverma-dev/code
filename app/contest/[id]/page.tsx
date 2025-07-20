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
import { ArrowLeft, Trophy, CheckCircle, AlertTriangle, Clock, BookOpen, Target } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import type { Contest } from "@/lib/types"
import { ContestTimer } from "@/components/contest-timer"
import { apiClient } from "@/lib/api-client"
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
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [timeExpired, setTimeExpired] = useState(false)
  const [startTime] = useState(Date.now())
  const [showInstructions, setShowInstructions] = useState(true)

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

  const handleAnswer = (questionId: string, answerIndex: number) => {
    if (timeExpired || submitted) return
    setAnswers({ ...answers, [questionId]: answerIndex })
  }

  const handleSubmit = async () => {
    if (timeExpired || submitted) return

    const timeTaken = Math.floor((Date.now() - startTime) / 1000)
    setSubmitted(true)

    try {
      await apiClient.saveSubmission({
        contestId: contest.id,
        answers,
        timeTaken,
      })
    } catch (error) {
      console.error("Failed to save submission:", error)
    }
  }

  const handleTimeExpired = () => {
    setTimeExpired(true)
    if (!submitted) {
      handleSubmit()
    }
  }

  const getQuestionStatus = (questionId: string) => {
    return answers[questionId] !== undefined ? "answered" : "unanswered"
  }

  const answeredCount = Object.keys(answers).length
  const progressPercentage = (answeredCount / contest.mcqProblems.length) * 100

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

              {contest.instructions && contest.instructions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Instructions</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      {contest.instructions.map((instruction, index) => (
                        <li key={index} className="text-yellow-800">
                          {instruction}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-3">General Instructions</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                    <li>Read each question carefully before selecting your answer</li>
                    <li>You can navigate between questions using the question palette</li>
                    <li>Your progress is automatically saved</li>
                    <li>Submit your exam before time expires</li>
                    <li>Once submitted, you cannot change your answers</li>
                    {contest.mcqProblems.some((q) => q.negativeMarks) && (
                      <li className="text-red-600 font-medium">
                        <strong>Note:</strong> Some questions have negative marking for incorrect answers
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="flex justify-center">
                <Button onClick={() => setShowInstructions(false)} size="lg" className="px-8" disabled={timeExpired}>
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
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Your Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">{answeredCount}</div>
                    <div className="text-sm text-gray-600">Questions Attempted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {contest.mcqProblems.length - answeredCount}
                    </div>
                    <div className="text-sm text-gray-600">Questions Skipped</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.floor((Date.now() - startTime) / 60000)} min
                    </div>
                    <div className="text-sm text-gray-600">Time Taken</div>
                  </div>
                </div>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Your submission has been saved successfully.
                  {contest.showResults ? " Results will be available shortly." : " Results will be announced later."}
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
              {contest.endTime && <ContestTimer endTime={contest.endTime} onTimeExpired={handleTimeExpired} />}
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
                          ? "bg-green-100 border-green-300 text-green-800"
                          : ""
                      }`}
                      onClick={() => setCurrentQuestion(index)}
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
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">+{currentProblem.marks} marks</Badge>
                    {currentProblem.negativeMarks && (
                      <Badge variant="destructive">-{currentProblem.negativeMarks} marks</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-gray-900 mb-4 leading-relaxed">{currentProblem.question}</div>

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
                  value={answers[currentProblem.id]?.toString() || ""}
                  onValueChange={(value) => handleAnswer(currentProblem.id, Number.parseInt(value))}
                  disabled={timeExpired || submitted}
                >
                  {currentProblem.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      <RadioGroupItem
                        value={optionIndex.toString()}
                        id={`${currentProblem.id}-${optionIndex}`}
                        disabled={timeExpired || submitted}
                        className="mt-1"
                      />
                      <Label
                        htmlFor={`${currentProblem.id}-${optionIndex}`}
                        className={`cursor-pointer flex-1 ${timeExpired || submitted ? "opacity-50" : ""}`}
                      >
                        <div className="flex items-start space-x-2">
                          <span className="font-medium text-gray-700">{String.fromCharCode(65 + optionIndex)}.</span>
                          <div className="flex-1">
                            <div>{option}</div>
                            {currentProblem.optionImages?.[optionIndex] && (
                              <div className="mt-2">
                                <Image
                                  src={currentProblem.optionImages[optionIndex] || "/placeholder.svg"}
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
                      onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                      disabled={currentQuestion === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentQuestion(Math.min(contest.mcqProblems.length - 1, currentQuestion + 1))}
                      disabled={currentQuestion === contest.mcqProblems.length - 1}
                    >
                      Next
                    </Button>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={timeExpired || submitted}
                    className="bg-green-600 hover:bg-green-700"
                  >
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
