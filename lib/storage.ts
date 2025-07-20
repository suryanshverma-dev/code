import type { Contest, User, MCQSubmission } from "./types"

// In-memory storage for development
const users: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    createdAt: new Date().toISOString(),
  },
]

const contests: Contest[] = [
  {
    id: "1",
    title: "Sample Physics MCQ Test",
    description: "Basic physics concepts test with 10 questions",
    mcqProblems: [
      {
        id: "1",
        question: "What is the SI unit of force?",
        options: [
          { id: "1a", text: "Newton", isCorrect: true },
          { id: "1b", text: "Joule", isCorrect: false },
          { id: "1c", text: "Watt", isCorrect: false },
          { id: "1d", text: "Pascal", isCorrect: false },
        ],
        explanation: "Newton is the SI unit of force, named after Sir Isaac Newton.",
        subject: "Physics",
        difficulty: "easy",
        marks: 4,
        negativeMarks: 1,
      },
    ],
    duration: 30,
    totalMarks: 40,
    instructions: "Read all questions carefully. Each question carries 4 marks with -1 negative marking.",
    createdBy: "Admin User",
    createdAt: new Date().toISOString(),
    isActive: true,
  },
]

const submissions: MCQSubmission[] = []

export const storage = {
  // Users
  getUsers: () => users,
  getUserById: (id: string) => users.find((user) => user.id === id),
  getUserByEmail: (email: string) => users.find((user) => user.email === email),
  createUser: (user: Omit<User, "id" | "createdAt">) => {
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    users.push(newUser)
    return newUser
  },

  // Contests
  getContests: () => contests,
  getContestById: (id: string) => contests.find((contest) => contest.id === id),
  createContest: (contest: Omit<Contest, "id" | "createdAt">) => {
    const newContest: Contest = {
      ...contest,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    contests.push(newContest)
    return newContest
  },
  updateContest: (id: string, updates: Partial<Contest>) => {
    const index = contests.findIndex((contest) => contest.id === id)
    if (index !== -1) {
      contests[index] = { ...contests[index], ...updates }
      return contests[index]
    }
    return null
  },

  // Submissions
  getSubmissions: () => submissions,
  getSubmissionById: (id: string) => submissions.find((sub) => sub.id === id),
  getSubmissionsByUserId: (userId: string) => submissions.filter((sub) => sub.userId === userId),
  getSubmissionsByContestId: (contestId: string) => submissions.filter((sub) => sub.contestId === contestId),
  getUserSubmissionForContest: (userId: string, contestId: string) =>
    submissions.find((sub) => sub.userId === userId && sub.contestId === contestId),
  createSubmission: (submission: Omit<MCQSubmission, "id">) => {
    const newSubmission: MCQSubmission = {
      ...submission,
      id: Date.now().toString(),
    }
    submissions.push(newSubmission)
    return newSubmission
  },
}
