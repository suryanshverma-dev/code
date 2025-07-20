import { storage } from "./storage"
import type { Contest, MCQSubmission } from "./types"

export const serverStorage = {
  // Users
  async getUsers() {
    return storage.getUsers()
  },

  async getUserById(id: string) {
    return storage.getUserById(id)
  },

  async getUserByEmail(email: string) {
    return storage.getUserByEmail(email)
  },

  async createUser(userData: { name: string; email: string; password: string }) {
    // In a real app, you'd hash the password
    const user = storage.createUser({
      name: userData.name,
      email: userData.email,
    })
    return user
  },

  // Contests
  async getContests() {
    return storage.getContests()
  },

  async getContestById(id: string) {
    return storage.getContestById(id)
  },

  async createContest(contestData: Omit<Contest, "id" | "createdAt">) {
    return storage.createContest(contestData)
  },

  async updateContest(id: string, updates: Partial<Contest>) {
    return storage.updateContest(id, updates)
  },

  // Submissions
  async getSubmissions() {
    return storage.getSubmissions()
  },

  async getSubmissionById(id: string) {
    return storage.getSubmissionById(id)
  },

  async getSubmissionsByUserId(userId: string) {
    return storage.getSubmissionsByUserId(userId)
  },

  async getSubmissionsByContestId(contestId: string) {
    return storage.getSubmissionsByContestId(contestId)
  },

  async getUserSubmissionForContest(userId: string, contestId: string) {
    return storage.getUserSubmissionForContest(userId, contestId)
  },

  async createSubmission(submissionData: Omit<MCQSubmission, "id">) {
    return storage.createSubmission(submissionData)
  },

  // Calculate score
  async calculateScore(contestId: string, answers: Record<string, string>) {
    const contest = await this.getContestById(contestId)
    if (!contest) throw new Error("Contest not found")

    let score = 0
    let correctAnswers = 0
    let wrongAnswers = 0
    const totalQuestions = contest.mcqProblems.length
    const unattempted = totalQuestions - Object.keys(answers).length

    contest.mcqProblems.forEach((problem) => {
      const selectedOptionId = answers[problem.id]
      if (selectedOptionId) {
        const selectedOption = problem.options.find((opt) => opt.id === selectedOptionId)
        if (selectedOption?.isCorrect) {
          score += problem.marks
          correctAnswers++
        } else {
          score -= problem.negativeMarks
          wrongAnswers++
        }
      }
    })

    return {
      score: Math.max(0, score), // Ensure score doesn't go below 0
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      unattempted,
    }
  },
}
