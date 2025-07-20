import { generateId } from "./utils"
import type { ExecutionResult } from "./code-executor"

export interface User {
  id: string
  name: string
  email: string
  password: string
  createdAt: string
}

export interface TestCase {
  input: string
  expectedOutput: string
}

export interface CodingProblem {
  id: string
  title: string
  description: string
  sampleInput: string
  sampleOutput: string
  testCases?: TestCase[]
}

export interface MCQProblem {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}

export interface Contest {
  id: string
  title: string
  description: string
  codingProblems: CodingProblem[]
  mcqProblems: MCQProblem[]
  createdBy: string
  createdAt: string
}

export interface Submission {
  id: string
  contestId: string
  userId: string
  mcqAnswers: Record<string, number>
  codingAnswers: Record<string, string>
  score: number
  submittedAt: string
}

export interface CodeSubmission {
  id: string
  problemId: string
  contestId: string
  userId: string
  code: string
  language: string
  result: ExecutionResult
  submittedAt: string
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

// Code submission management
export function getCodeSubmissions(): CodeSubmission[] {
  if (typeof window === "undefined") return []
  const submissions = localStorage.getItem("codeSubmissions")
  return submissions ? JSON.parse(submissions) : []
}

export async function saveCodeSubmission(submissionData: {
  problemId: string
  contestId: string
  userId: string
  code: string
  language: string
}): Promise<CodeSubmission> {
  const { executeCode } = await import("./code-executor")
  const contests = getContests()
  const contest = contests.find((c) => c.id === submissionData.contestId)
  const problem = contest?.codingProblems.find((p) => p.id === submissionData.problemId)

  if (!problem) {
    throw new Error("Problem not found")
  }

  const result = await executeCode(submissionData.code, submissionData.language, problem)

  const submission: CodeSubmission = {
    id: generateId(),
    ...submissionData,
    result,
    submittedAt: new Date().toISOString(),
  }

  const submissions = getCodeSubmissions()
  submissions.push(submission)
  localStorage.setItem("codeSubmissions", JSON.stringify(submissions))

  return submission
}
