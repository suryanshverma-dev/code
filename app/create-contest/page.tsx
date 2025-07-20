"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Plus, Trash2, Clock, HelpCircle, ImageIcon } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import type { MCQProblem } from "@/lib/types"
import { generateId } from "@/lib/utils"
import { apiClient } from "@/lib/api-client"
import Image from "next/image"

export default function CreateContestPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [uploadingImage, setUploadingImage] = useState<string | null>(null)

  const [contestData, setContestData] = useState({
    title: "",
    description: "",
    duration: 120, // Default 2 hours
    instructions: [""],
    allowReview: true,
    showResults: true,
    passingMarks: 0,
  })

  const [mcqProblems, setMcqProblems] = useState<MCQProblem[]>([])

  if (!user) {
    router.push("/login")
    return null
  }

  const addMCQProblem = () => {
    setMcqProblems([
      ...mcqProblems,
      {
        id: generateId(),
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        marks: 1,
        negativeMarks: 0,
        difficulty: "medium",
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

  const addInstruction = () => {
    setContestData({
      ...contestData,
      instructions: [...contestData.instructions, ""],
    })
  }

  const updateInstruction = (index: number, value: string) => {
    const updated = [...contestData.instructions]
    updated[index] = value
    setContestData({ ...contestData, instructions: updated })
  }

  const removeInstruction = (index: number) => {
    setContestData({
      ...contestData,
      instructions: contestData.instructions.filter((_, i) => i !== index),
    })
  }

  const handleImageUpload = async (
    file: File,
    problemIndex: number,
    type: "question" | "option",
    optionIndex?: number,
  ) => {
    const uploadKey = `${problemIndex}-${type}-${optionIndex || 0}`
    setUploadingImage(uploadKey)

    try {
      const imageUrl = await apiClient.uploadImage(file)

      if (type === "question") {
        updateMCQProblem(problemIndex, "questionImage", imageUrl)
      } else if (type === "option" && optionIndex !== undefined) {
        const updated = [...mcqProblems]
        if (!updated[problemIndex].optionImages) {
          updated[problemIndex].optionImages = []
        }
        updated[problemIndex].optionImages![optionIndex] = imageUrl
        setMcqProblems(updated)
      }
    } catch (error) {
      console.error("Image upload failed:", error)
      setError("Failed to upload image: " + (error as Error).message)
    } finally {
      setUploadingImage(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!contestData.title.trim()) {
      setError("Contest title is required")
      return
    }

    if (mcqProblems.length === 0) {
      setError("At least one MCQ problem is required")
      return
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
      if (problem.marks <= 0) {
        setError("All questions must have positive marks")
        return
      }
    }

    setLoading(true)

    try {
      await apiClient.createContest({
        title: contestData.title,
        description: contestData.description,
        duration: contestData.duration,
        mcqProblems,
        instructions: contestData.instructions.filter((inst) => inst.trim()),
        allowReview: contestData.allowReview,
        showResults: contestData.showResults,
        passingMarks: contestData.passingMarks,
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
            <CardTitle className="text-2xl">Create New MCQ Contest</CardTitle>
            <CardDescription>Design an MCQ-based examination with image support</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Contest Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Contest Title</Label>
                  <Input
                    id="title"
                    value={contestData.title}
                    onChange={(e) => setContestData({ ...contestData, title: e.target.value })}
                    placeholder="e.g., JEE Main Mock Test #1"
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  </div>

                  <div>
                    <Label htmlFor="passingMarks">Passing Marks (optional)</Label>
                    <Input
                      id="passingMarks"
                      type="number"
                      min="0"
                      value={contestData.passingMarks}
                      onChange={(e) => setContestData({ ...contestData, passingMarks: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Options</Label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={contestData.allowReview}
                          onChange={(e) => setContestData({ ...contestData, allowReview: e.target.checked })}
                        />
                        <span className="text-sm">Allow review</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={contestData.showResults}
                          onChange={(e) => setContestData({ ...contestData, showResults: e.target.checked })}
                        />
                        <span className="text-sm">Show results</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Contest Instructions</Label>
                  <Button type="button" onClick={addInstruction} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Instruction
                  </Button>
                </div>
                {contestData.instructions.map((instruction, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      placeholder={`Instruction ${index + 1}`}
                    />
                    <Button type="button" onClick={() => removeInstruction(index)} variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* MCQ Problems */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <HelpCircle className="w-5 h-5" />
                    <span>MCQ Questions ({mcqProblems.length})</span>
                  </h3>
                  <Button onClick={addMCQProblem} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>

                {mcqProblems.map((problem, index) => (
                  <Card key={problem.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base">Question {index + 1}</CardTitle>
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
                          rows={3}
                        />
                      </div>

                      {/* Question Image Upload */}
                      <div>
                        <Label className="flex items-center space-x-2">
                          <ImageIcon className="w-4 h-4" />
                          <span>Question Image (optional)</span>
                        </Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleImageUpload(file, index, "question")
                            }}
                            disabled={uploadingImage === `${index}-question-0`}
                          />
                          {uploadingImage === `${index}-question-0` && (
                            <div className="text-sm text-blue-600">Uploading...</div>
                          )}
                        </div>
                        {problem.questionImage && (
                          <div className="mt-2">
                            <Image
                              src={problem.questionImage || "/placeholder.svg"}
                              alt="Question image"
                              width={300}
                              height={200}
                              className="rounded border border-gray-200"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => updateMCQProblem(index, "questionImage", undefined)}
                              className="mt-1"
                            >
                              Remove Image
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Marks</Label>
                          <Input
                            type="number"
                            min="1"
                            value={problem.marks}
                            onChange={(e) => updateMCQProblem(index, "marks", Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label>Negative Marks</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.25"
                            value={problem.negativeMarks || 0}
                            onChange={(e) => updateMCQProblem(index, "negativeMarks", Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label>Difficulty</Label>
                          <Select
                            value={problem.difficulty}
                            onValueChange={(value) => updateMCQProblem(index, "difficulty", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label>Subject (optional)</Label>
                        <Input
                          value={problem.subject || ""}
                          onChange={(e) => updateMCQProblem(index, "subject", e.target.value)}
                          placeholder="e.g., Physics, Mathematics"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label>Options</Label>
                        {problem.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="space-y-2">
                            <div className="flex items-center space-x-2">
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
                                placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                              />
                            </div>

                            {/* Option Image Upload */}
                            <div className="ml-6">
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleImageUpload(file, index, "option", optionIndex)
                                  }}
                                  disabled={uploadingImage === `${index}-option-${optionIndex}`}
                                  className="text-xs"
                                />
                                {uploadingImage === `${index}-option-${optionIndex}` && (
                                  <div className="text-xs text-blue-600">Uploading...</div>
                                )}
                              </div>
                              {problem.optionImages?.[optionIndex] && (
                                <div className="mt-1">
                                  <Image
                                    src={problem.optionImages[optionIndex] || "/placeholder.svg"}
                                    alt={`Option ${String.fromCharCode(65 + optionIndex)} image`}
                                    width={150}
                                    height={100}
                                    className="rounded border border-gray-200"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const updated = [...mcqProblems]
                                      if (updated[index].optionImages) {
                                        updated[index].optionImages![optionIndex] = ""
                                      }
                                      setMcqProblems(updated)
                                    }}
                                    className="mt-1 text-xs"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        <p className="text-xs text-gray-500">Select the radio button next to the correct answer</p>
                      </div>

                      <div>
                        <Label>Explanation (optional)</Label>
                        <Textarea
                          value={problem.explanation || ""}
                          onChange={(e) => updateMCQProblem(index, "explanation", e.target.value)}
                          placeholder="Explain the correct answer (optional)"
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {mcqProblems.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No questions added yet. Click "Add Question" to get started.
                  </div>
                )}
              </div>

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
