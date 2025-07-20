export interface User {
  id: string
  name: string
  email: string
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
  startTime?: string
  endTime?: string
  duration?: number // in minutes
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

export interface ExecutionResult {
  success: boolean
  output: string
  error: string
  executionTime: number
  testResults: TestResult[]
}

export interface TestResult {
  passed: boolean
  expected: string
  actual: string
  input: string
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
