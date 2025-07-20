export interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

export interface MCQProblem {
  id: string
  question: string
  questionImage?: string // URL or path to question image
  options: string[]
  optionImages?: string[] // Array of image URLs for options (optional)
  correctAnswer: number
  explanation?: string
  marks: number
  negativeMarks?: number
  subject?: string
  difficulty?: "easy" | "medium" | "hard"
}

export interface Contest {
  id: string
  title: string
  description: string
  mcqProblems: MCQProblem[]
  createdBy: string
  createdAt: string
  startTime?: string
  endTime?: string
  duration: number // in minutes
  totalMarks: number
  passingMarks?: number
  instructions?: string[]
  allowReview?: boolean
  showResults?: boolean
}

export interface Submission {
  id: string
  contestId: string
  userId: string
  answers: Record<string, number> // questionId -> selectedOption
  score: number
  totalMarks: number
  percentage: number
  submittedAt: string
  timeTaken: number // in seconds
  reviewData?: {
    correct: number
    incorrect: number
    unattempted: number
    marksObtained: number
    negativeMarks: number
  }
}

export interface ContestAnalytics {
  contestId: string
  totalParticipants: number
  averageScore: number
  highestScore: number
  lowestScore: number
  passPercentage: number
  questionWiseAnalysis: {
    questionId: string
    correctAttempts: number
    incorrectAttempts: number
    unattempted: number
    accuracy: number
  }[]
}
