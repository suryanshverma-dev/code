"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Sparkles, Save, RefreshCw } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import type { MCQProblem } from "@/lib/storage"
import { generateId } from "@/lib/utils"

export default function GenerateMCQsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [inputText, setInputText] = useState("")
  const [generatedMCQs, setGeneratedMCQs] = useState<MCQProblem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (!user) {
    router.push("/login")
    return null
  }

  // Mock AI MCQ generation function
  const generateMCQsFromText = (text: string): MCQProblem[] => {
    // This is a mock implementation. In a real app, you'd call OpenAI API
    const topics = [
      "programming concepts",
      "data structures",
      "algorithms",
      "software engineering",
      "computer science fundamentals",
    ]

    const questions = [
      {
        question: `Based on the provided text, which of the following best describes the main concept discussed?`,
        options: [
          "A fundamental programming principle",
          "An advanced algorithm technique",
          "A software design pattern",
          "A database optimization method",
        ],
        correctAnswer: 0,
      },
      {
        question: `According to the text, what is the primary benefit of the approach mentioned?`,
        options: [
          "Improved performance and efficiency",
          "Better code readability",
          "Enhanced security features",
          "Reduced memory usage",
        ],
        correctAnswer: 0,
      },
      {
        question: `Which of the following would be the most appropriate use case for the concept described?`,
        options: [
          "Large-scale distributed systems",
          "Simple web applications",
          "Mobile app development",
          "Database management",
        ],
        correctAnswer: 0,
      },
      {
        question: `What potential challenge might developers face when implementing this approach?`,
        options: [
          "Complexity in initial setup",
          "Limited browser support",
          "High licensing costs",
          "Lack of documentation",
        ],
        correctAnswer: 0,
      },
      {
        question: `Based on the context provided, which programming paradigm does this concept align with most closely?`,
        options: [
          "Object-oriented programming",
          "Functional programming",
          "Procedural programming",
          "Logic programming",
        ],
        correctAnswer: 0,
      },
    ]

    return questions.slice(0, 3 + Math.floor(Math.random() * 3)).map((q) => ({
      id: generateId(),
      ...q,
    }))
  }

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to generate MCQs from")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mcqs = generateMCQsFromText(inputText)
      setGeneratedMCQs(mcqs)
    } catch (err) {
      setError("Failed to generate MCQs. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveToContest = () => {
    // In a real app, you might want to show a modal to select which contest to add to
    // For now, we'll just save to localStorage for later use
    const savedMCQs = JSON.parse(localStorage.getItem("savedMCQs") || "[]")
    const updatedMCQs = [...savedMCQs, ...generatedMCQs]
    localStorage.setItem("savedMCQs", JSON.stringify(updatedMCQs))

    alert("MCQs saved! You can use them when creating a new contest.")
    router.push("/create-contest")
  }

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
            <div className="flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <CardTitle className="text-2xl">AI-Powered MCQ Generator</CardTitle>
            </div>
            <CardDescription>
              Paste any text content and generate multiple choice questions automatically
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="input-text">Input Text</Label>
              <Textarea
                id="input-text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your text content here... (e.g., article, documentation, tutorial content)"
                rows={8}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                The AI will analyze this text and generate relevant multiple choice questions
              </p>
            </div>

            <Button onClick={handleGenerate} disabled={loading || !inputText.trim()} className="w-full">
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating MCQs...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate MCQs
                </>
              )}
            </Button>

            {generatedMCQs.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Generated MCQs ({generatedMCQs.length})</h3>
                  <Button onClick={handleSaveToContest} variant="outline" size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Save to Contest
                  </Button>
                </div>

                {generatedMCQs.map((mcq, index) => (
                  <Card key={mcq.id} className="border-l-4 border-l-purple-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Question {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="font-medium">{mcq.question}</p>
                      <div className="space-y-2">
                        {mcq.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`p-2 rounded border ${
                              optionIndex === mcq.correctAnswer
                                ? "bg-green-50 border-green-200"
                                : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            <span className="font-medium">{String.fromCharCode(65 + optionIndex)}.</span> {option}
                            {optionIndex === mcq.correctAnswer && (
                              <span className="ml-2 text-green-600 text-sm font-medium">(Correct Answer)</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Alert>
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription>
                    These MCQs were generated using AI. Please review and edit them as needed before using in a contest.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
