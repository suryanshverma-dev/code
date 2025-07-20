import { generateId } from "./utils"

export interface User {
  id: string
  name: string
  email: string
  password: string
  createdAt: string
}

export interface MCQProblem {
  id: string
  question: string
  questionImage?: string
  options: string[]
  optionImages?: string[]
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
  duration: number
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
  answers: Record<string, number>
  score: number
  totalMarks: number
  percentage: number
  submittedAt: string
  timeTaken: number
  reviewData?: {
    correct: number
    incorrect: number
    unattempted: number
    marksObtained: number
    negativeMarks: number
  }
}

// User management
export function getUsers(): User[] {
  if (typeof window === "undefined") return []
  const users = localStorage.getItem("users")
  return users ? JSON.parse(users) : []
}

export function createUser(name: string, email: string, password: string): User {
  const users = getUsers()
  const newUser: User = {
    id: generateId(),
    name,
    email,
    password,
    createdAt: new Date().toISOString(),
  }
  users.push(newUser)
  localStorage.setItem("users", JSON.stringify(users))
  return newUser
}

// Contest management
export function getContests(): Contest[] {
  if (typeof window === "undefined") return []
  const contests = localStorage.getItem("contests")
  return contests ? JSON.parse(contests) : []
}

export function getContest(id: string): Contest | null {
  const contests = getContests()
  return contests.find((contest) => contest.id === id) || null
}

export function createContest(contestData: Omit<Contest, "id" | "createdAt">): Contest {
  const contests = getContests()
  const newContest: Contest = {
    ...contestData,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }
  contests.push(newContest)
  localStorage.setItem("contests", JSON.stringify(contests))
  return newContest
}

// Submission management
export function getSubmissions(): Submission[] {
  if (typeof window === "undefined") return []
  const submissions = localStorage.getItem("submissions")
  return submissions ? JSON.parse(submissions) : []
}

export function saveSubmission(submission: Submission): void {
  const submissions = getSubmissions()
  submissions.push(submission)
  localStorage.setItem("submissions", JSON.stringify(submissions))
}

export function getUserSubmissions(userId: string): Submission[] {
  const submissions = getSubmissions()
  return submissions.filter((sub) => sub.userId === userId)
}

export function getContestSubmissions(contestId: string): Submission[] {
  const submissions = getSubmissions()
  return submissions.filter((sub) => sub.contestId === contestId)
}
