export interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

export interface MCQOption {
  id: string
  text: string
  isCorrect: boolean
  imageUrl?: string
}

export interface MCQProblem {
  id: string
  question: string
  questionImageUrl?: string
  options: MCQOption[]
  explanation: string
  subject: string
  difficulty: "easy" | "medium" | "hard"
  marks: number
  negativeMarks: number
}

export interface Contest {
  id: string
  title: string
  description: string
  mcqProblems: MCQProblem[]
  duration: number // in minutes
  totalMarks: number
  instructions: string
  createdBy: string
  createdAt: string
  isActive: boolean
}

export interface MCQSubmission {
  id: string
  userId: string
  contestId: string
  answers: Record<string, string> // questionId -> selectedOptionId
  score: number
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  unattempted: number
  submittedAt: string
  timeTaken: number // in seconds
}

export interface ExamSession {
  contestId: string
  userId: string
  startTime: string
  answers: Record<string, string>
  currentQuestionIndex: number
  timeRemaining: number // in seconds
  isSubmitted: boolean
}

export interface UploadedImage {
  data: string
  name: string
  type: string
  size: number
  uploadedAt: string
}
