export interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

export interface MCQOption {
  id: string
  text: string
  imageUrl?: string
  isCorrect: boolean
}

export interface MCQProblem {
  id: string
  question: string
  questionImage?: string
  options: MCQOption[]
  explanation?: string
  subject?: string
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
  instructions?: string
  startTime?: string
  endTime?: string
  createdBy: string
  createdAt: string
  isActive: boolean
}

export interface MCQSubmission {
  id: string
  contestId: string
  userId: string
  userName: string
  answers: Record<string, string> // questionId -> selectedOptionId
  score: number
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  unattempted: number
  submittedAt: string
  timeTaken: number // in seconds
}

export interface ContestResult {
  submission: MCQSubmission
  questionResults: Array<{
    questionId: string
    question: string
    selectedOptionId?: string
    correctOptionId: string
    isCorrect: boolean
    marks: number
    explanation?: string
  }>
}

export interface ExamSession {
  contestId: string
  userId: string
  startTime: number
  answers: Record<string, string>
  currentQuestion: number
  timeRemaining: number
  isSubmitted: boolean
}
