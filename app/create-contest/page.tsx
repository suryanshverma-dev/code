"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Plus, Trash2, Code, HelpCircle, Clock } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import type { CodingProblem, MCQProblem, TestCase } from "@/lib/types"
import { generateId } from "@/lib/utils"
import { apiClient } from "@/lib/api-client"

export default function CreateContestPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [contestData, setContestData] = useState({
    title: "",
    description: "",
    duration: 120, // Default 2 hours
  })

  const [codingProblems, setCodingProblems] = useState<CodingProblem[]>([])
  const [mcqProblems, setMcqProblems] = useState<MCQProblem[]>([])

  if (!user) {
    router.push("/login")
    return null
  }

  const addCodingProblem = () => {
    setCodingProblems([
      ...codingProblems,
      {
        id: generateId(),
        title: "",
        description: "",
        sampleInput: "",
        sampleOutput: "",
      },
    ])
  }

  const updateCodingProblem = (index: number, field: keyof CodingProblem, value: string | TestCase[]) => {
    const updated = [...codingProblems]
    updated[index] = { ...updated[index], [field]: value }
    setCodingProblems(updated)
  }

  const removeCodingProblem = (index: number) => {
    setCodingProblems(codingProblems.filter((_, i) => i !== index))
  }

  const addMCQProblem = () => {
    setMcqProblems([
      ...mcqProblems,
      {
        id: generateId(),
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      },
    ])
  }

  const updateMCQProblem = (index: number, field: keyof MCQProblem, value: any) => {
    const updated = [...mcqProblems]
    updated[index] = { ...updated[index], [field]: value }
    setMcqProblems(updated)
  }

  const updateMCQOption = (problemIndex: number, optionIndex: number, value: string) => {
    const updated = [...mcqProblems]
    updated[problemIndex].options[optionIndex] = value
    setMcqProblems(updated)
  }

  const removeMCQProblem = (index: number) => {
    setMcqProblems(mcqProblems.filter((_, i) => i !== index))
  }

  const addTestCase = (problemIndex: number) => {
    const updated = [...codingProblems]
    if (!updated[problemIndex].testCases) {
      updated[problemIndex].testCases = []
    }
    updated[problemIndex].testCases!.push({
      input: "",
      expectedOutput: "",
    })
    setCodingProblems(updated)
  }

  const updateTestCase = (
    problemIndex: number,
    testIndex: number,
    field: "input" | "expectedOutput",
    value: string,
  ) => {
    const updated = [...codingProblems]
    if (updated[problemIndex].testCases) {
      updated[problemIndex].testCases[testIndex] = {
        ...updated[problemIndex].testCases[testIndex],
        [field]: value,
      }
      setCodingProblems(updated)
    }
  }

  const removeTestCase = (problemIndex: number, testIndex: number) => {
    const updated = [...codingProblems]
    if (updated[problemIndex].testCases) {
      updated[problemIndex].testCases.splice(testIndex, 1)
      setCodingProblems(updated)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!contestData.title.trim()) {
      setError("Contest title is required")
      return
    }

    if (codingProblems.length === 0 && mcqProblems.length === 0) {
      setError("At least one problem is required")
      return
    }

    // Validate coding problems
    for (const problem of codingProblems) {
      if (!problem.title.trim() || !problem.description.trim()) {
        setError("All coding problems must have a title and description")
        return
      }
    }

    // Validate MCQ problems
    for (const problem of mcqProblems) {
      if (!problem.question.trim()) {
        setError("All MCQ problems must have a question")
        return
      }
      if (problem.options.some((opt) => !opt.trim())) {
        setError("All MCQ options must be filled")
        return
      }
    }

    setLoading(true)

    try {
      await apiClient.createContest({
        title: contestData.title,
        description: contestData.description,
        duration: contestData.duration,
        codingProblems,
        mcqProblems,
      })

      router.push("/")
    } catch (err) {
      setError("Failed to create contest: " + (err as Error).message)
    } finally {
      setLoading(false)
    }
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
            <CardTitle className="text-2xl">Create New Contest</CardTitle>
            <CardDescription>Design a coding contest with programming problems and MCQs</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Contest Title</Label>
                  <Input
                    id="title"
                    value={contestData.title}
                    onChange={(e) => setContestData({ ...contestData, title: e.target.value })}
                    placeholder="e.g., Weekly Programming Challenge #1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={contestData.description}
                    onChange={(e) => setContestData({ ...contestData, description: e.target.value })}
                    placeholder="Describe your contest..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="duration" className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Duration (minutes)</span>
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    min="30"
                    max="480"
                    value={contestData.duration}
                    onChange={(e) => setContestData({ ...contestData, duration: Number(e.target.value) })}
                    placeholder="120"
                  />
                  <p className="text-xs text-gray-500 mt-1">Contest duration in minutes (30 min - 8 hours)</p>
                </div>
              </div>

              <Tabs defaultValue="coding" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="coding" className="flex items-center space-x-2">
                    <Code className="w-4 h-4" />
                    <span>Coding Problems ({codingProblems.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="mcq" className="flex items-center space-x-2">
                    <HelpCircle className="w-4 h-4" />
                    <span>MCQ Problems ({mcqProblems.length})</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="coding" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Coding Problems</h3>
                    <Button onClick={addCodingProblem} variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Problem
                    </Button>
                  </div>

                  {codingProblems.map((problem, index) => (
                    <Card key={problem.id}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base">Problem {index + 1}</CardTitle>
                        <Button onClick={() => removeCodingProblem(index)} variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={problem.title}
                            onChange={(e) => updateCodingProblem(index, "title", e.target.value)}
                            placeholder="Problem title"
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={problem.description}
                            onChange={(e) => updateCodingProblem(index, "description", e.target.value)}
                            placeholder="Problem description"
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Sample Input</Label>
                            <Textarea
                              value={problem.sampleInput}
                              onChange={(e) => updateCodingProblem(index, "sampleInput", e.target.value)}
                              placeholder="Sample input"
                              rows={2}
                            />
                          </div>
                          <div>
                            <Label>Sample Output</Label>
                            <Textarea
                              value={problem.sampleOutput}
                              onChange={(e) => updateCodingProblem(index, "sampleOutput", e.target.value)}
                              placeholder="Expected output"
                              rows={2}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label>Test Cases</Label>
                            <Button onClick={() => addTestCase(index)} variant="outline" size="sm" type="button">
                              <Plus className="w-4 h-4 mr-1" />
                              Add Test Case
                            </Button>
                          </div>
                          {problem.testCases?.map((testCase, testIndex) => (
                            <div key={testIndex} className="border rounded p-3 space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Test Case {testIndex + 1}</span>
                                <Button
                                  onClick={() => removeTestCase(index, testIndex)}
                                  variant="ghost"
                                  size="sm"
                                  type="button"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-xs">Input</Label>
                                  <Textarea
                                    value={testCase.input}
                                    onChange={(e) => updateTestCase(index, testIndex, "input", e.target.value)}
                                    placeholder="Test input"
                                    rows={2}
                                    className="text-sm"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Expected Output</Label>
                                  <Textarea
                                    value={testCase.expectedOutput}
                                    onChange={(e) => updateTestCase(index, testIndex, "expectedOutput", e.target.value)}
                                    placeholder="Expected output"
                                    rows={2}
                                    className="text-sm"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {codingProblems.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No coding problems added yet. Click "Add Problem" to get started.
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="mcq" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">MCQ Problems</h3>
                    <Button onClick={addMCQProblem} variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add MCQ
                    </Button>
                  </div>

                  {mcqProblems.map((problem, index) => (
                    <Card key={problem.id}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base">MCQ {index + 1}</CardTitle>
                        <Button onClick={() => removeMCQProblem(index)} variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Question</Label>
                          <Textarea
                            value={problem.question}
                            onChange={(e) => updateMCQProblem(index, "question", e.target.value)}
                            placeholder="Enter your question"
                            rows={2}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Options</Label>
                          {problem.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name={`correct-${index}`}
                                checked={problem.correctAnswer === optionIndex}
                                onChange={() => updateMCQProblem(index, "correctAnswer", optionIndex)}
                                className="text-indigo-600"
                              />
                              <Input
                                value={option}
                                onChange={(e) => updateMCQOption(index, optionIndex, e.target.value)}
                                placeholder={`Option ${optionIndex + 1}`}
                              />
                            </div>
                          ))}
                          <p className="text-xs text-gray-500">Select the radio button next to the correct answer</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {mcqProblems.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No MCQ problems added yet. Click "Add MCQ" to get started.
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.push("/")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Contest"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
