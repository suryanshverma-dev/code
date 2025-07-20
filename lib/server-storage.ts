import { promises as fs } from "fs"
import path from "path"
import { generateId } from "./utils"
import type { User, Contest, Submission, CodeSubmission } from "./types"

const DATA_DIR = path.join(process.cwd(), "data")

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

// Generic file operations
async function readJsonFile<T>(filename: string, defaultValue: T): Promise<T> {
  await ensureDataDir()
  const filePath = path.join(DATA_DIR, filename)

  try {
    const data = await fs.readFile(filePath, "utf-8")
    return JSON.parse(data)
  } catch {
    return defaultValue
  }
}

async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  await ensureDataDir()
  const filePath = path.join(DATA_DIR, filename)
  await fs.writeFile(filePath, JSON.stringify(data, null, 2))
}

// User management
export async function getUsers(): Promise<User[]> {
  return readJsonFile("users.json", [])
}

export async function createUser(name: string, email: string, password: string): Promise<User> {
  const users = await getUsers()
  const newUser: User = {
    id: generateId(),
    name,
    email,
    password,
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  await writeJsonFile("users.json", users)
  return newUser
}

// Contest management
export async function getContests(): Promise<Contest[]> {
  return readJsonFile("contests.json", [])
}

export async function getContest(id: string): Promise<Contest | null> {
  const contests = await getContests()
  return contests.find((contest) => contest.id === id) || null
}

export async function createContest(contestData: Omit<Contest, "id" | "createdAt">): Promise<Contest> {
  const contests = await getContests()
  const newContest: Contest = {
    ...contestData,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }

  contests.push(newContest)
  await writeJsonFile("contests.json", contests)
  return newContest
}

// Submission management
export async function getSubmissions(): Promise<Submission[]> {
  return readJsonFile("submissions.json", [])
}

export async function saveSubmission(submission: Submission): Promise<Submission> {
  const submissions = await getSubmissions()
  const newSubmission = {
    ...submission,
    id: submission.id || generateId(),
    submittedAt: submission.submittedAt || new Date().toISOString(),
  }

  submissions.push(newSubmission)
  await writeJsonFile("submissions.json", submissions)
  return newSubmission
}

// Code submission management
export async function getCodeSubmissions(): Promise<CodeSubmission[]> {
  return readJsonFile("code-submissions.json", [])
}

export async function saveCodeSubmission(submissionData: {
  problemId: string
  contestId: string
  userId: string
  code: string
  language: string
  result: any
}): Promise<CodeSubmission> {
  const submissions = await getCodeSubmissions()
  const newSubmission: CodeSubmission = {
    id: generateId(),
    ...submissionData,
    submittedAt: new Date().toISOString(),
  }

  submissions.push(newSubmission)
  await writeJsonFile("code-submissions.json", submissions)
  return newSubmission
}
