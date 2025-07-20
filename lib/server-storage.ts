import { promises as fs } from "fs"
import path from "path"
import { generateId } from "./utils"
import type { User, Contest, Submission, MCQProblem } from "./types"

const DATA_DIR = path.join(process.cwd(), "data")
const USERS_FILE = path.join(DATA_DIR, "users.json")
const CONTESTS_FILE = path.join(DATA_DIR, "contests.json")
const SUBMISSIONS_FILE = path.join(DATA_DIR, "submissions.json")

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

// Generic file operations
async function readJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    await ensureDataDir()
    const data = await fs.readFile(filePath, "utf-8")
    return JSON.parse(data)
  } catch {
    return defaultValue
  }
}

async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await ensureDataDir()
  await fs.writeFile(filePath, JSON.stringify(data, null, 2))
}

// User management
export async function getUsers(): Promise<User[]> {
  return readJsonFile(USERS_FILE, [])
}

export async function createUser(userData: { name: string; email: string; password: string }): Promise<User> {
  const users = await getUsers()
  const newUser: User = {
    id: generateId(),
    ...userData,
    createdAt: new Date().toISOString(),
  }
  users.push(newUser)
  await writeJsonFile(USERS_FILE, users)
  return newUser
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const users = await getUsers()
  return users.find((user) => user.email === email) || null
}

// Contest management
export async function getContests(): Promise<Contest[]> {
  return readJsonFile(CONTESTS_FILE, [])
}

export async function getContest(id: string): Promise<Contest | null> {
  const contests = await getContests()
  return contests.find((contest) => contest.id === id) || null
}

export async function createContest(contestData: Omit<Contest, "id" | "createdAt">): Promise<Contest> {
  const contests = await getContests()

  // Calculate total marks
  const totalMarks = contestData.mcqProblems.reduce((sum, problem) => sum + problem.marks, 0)

  const newContest: Contest = {
    ...contestData,
    id: generateId(),
    totalMarks,
    createdAt: new Date().toISOString(),
  }

  contests.push(newContest)
  await writeJsonFile(CONTESTS_FILE, contests)
  return newContest
}

// Submission management
export async function getSubmissions(): Promise<Submission[]> {
  return readJsonFile(SUBMISSIONS_FILE, [])
}

export async function saveSubmission(submissionData: Omit<Submission, "id">): Promise<Submission> {
  const submissions = await getSubmissions()
  const newSubmission: Submission = {
    ...submissionData,
    id: generateId(),
  }
  submissions.push(newSubmission)
  await writeJsonFile(SUBMISSIONS_FILE, submissions)
  return newSubmission
}

export async function getUserSubmissions(userId: string): Promise<Submission[]> {
  const submissions = await getSubmissions()
  return submissions.filter((sub) => sub.userId === userId)
}

export async function getContestSubmissions(contestId: string): Promise<Submission[]> {
  const submissions = await getSubmissions()
  return submissions.filter((sub) => sub.contestId === contestId)
}

// Calculate submission score
export function calculateScore(
  answers: Record<string, number>,
  problems: MCQProblem[],
): {
  score: number
  totalMarks: number
  percentage: number
  reviewData: {
    correct: number
    incorrect: number
    unattempted: number
    marksObtained: number
    negativeMarks: number
  }
} {
  let marksObtained = 0
  let negativeMarks = 0
  let correct = 0
  let incorrect = 0
  let unattempted = 0

  const totalMarks = problems.reduce((sum, problem) => sum + problem.marks, 0)

  problems.forEach((problem) => {
    const userAnswer = answers[problem.id]

    if (userAnswer === undefined || userAnswer === -1) {
      unattempted++
    } else if (userAnswer === problem.correctAnswer) {
      correct++
      marksObtained += problem.marks
    } else {
      incorrect++
      if (problem.negativeMarks) {
        negativeMarks += problem.negativeMarks
      }
    }
  })

  const finalScore = marksObtained - negativeMarks
  const percentage = totalMarks > 0 ? (finalScore / totalMarks) * 100 : 0

  return {
    score: Math.max(0, finalScore), // Ensure score doesn't go below 0
    totalMarks,
    percentage: Math.max(0, percentage),
    reviewData: {
      correct,
      incorrect,
      unattempted,
      marksObtained,
      negativeMarks,
    },
  }
}
