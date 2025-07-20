import type { User, Contest, Submission, MCQProblem } from "./types"

class ApiClient {
  private baseUrl = "/api"

  // Auth methods
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Login failed")
    }

    return response.json()
  }

  async signup(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await fetch(`${this.baseUrl}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Signup failed")
    }

    return response.json()
  }

  // Contest methods
  async getContests(): Promise<Contest[]> {
    const response = await fetch(`${this.baseUrl}/contests`)
    if (!response.ok) throw new Error("Failed to fetch contests")
    return response.json()
  }

  async getContest(id: string): Promise<Contest> {
    const response = await fetch(`${this.baseUrl}/contests/${id}`)
    if (!response.ok) throw new Error("Failed to fetch contest")
    return response.json()
  }

  async createContest(contestData: {
    title: string
    description: string
    duration: number
    mcqProblems: MCQProblem[]
    instructions?: string[]
    allowReview?: boolean
    showResults?: boolean
    passingMarks?: number
  }): Promise<Contest> {
    const token = localStorage.getItem("token")
    const response = await fetch(`${this.baseUrl}/contests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(contestData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to create contest")
    }

    return response.json()
  }

  // Submission methods
  async saveSubmission(submissionData: {
    contestId: string
    answers: Record<string, number>
    timeTaken: number
  }): Promise<Submission> {
    const token = localStorage.getItem("token")
    const response = await fetch(`${this.baseUrl}/submissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(submissionData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to save submission")
    }

    return response.json()
  }

  async getUserSubmissions(userId: string): Promise<Submission[]> {
    const token = localStorage.getItem("token")
    const response = await fetch(`${this.baseUrl}/submissions/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) throw new Error("Failed to fetch user submissions")
    return response.json()
  }

  async getContestSubmissions(contestId: string): Promise<Submission[]> {
    const token = localStorage.getItem("token")
    const response = await fetch(`${this.baseUrl}/submissions/contest/${contestId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) throw new Error("Failed to fetch contest submissions")
    return response.json()
  }

  // Image upload method
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append("image", file)

    const token = localStorage.getItem("token")
    const response = await fetch(`${this.baseUrl}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to upload image")
    }

    const result = await response.json()
    return result.url
  }
}

export const apiClient = new ApiClient()
