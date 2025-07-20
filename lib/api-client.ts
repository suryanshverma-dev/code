import type { Contest, User, MCQSubmission } from "./types"

class ApiClient {
  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    return response.json()
  }

  // Auth
  async login(email: string, password: string): Promise<User> {
    return this.request<User>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async signup(name: string, email: string, password: string): Promise<User> {
    return this.request<User>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    })
  }

  // Contests
  async getContests(): Promise<Contest[]> {
    return this.request<Contest[]>("/api/contests")
  }

  async getContest(id: string): Promise<Contest> {
    return this.request<Contest>(`/api/contests/${id}`)
  }

  async createContest(contest: Omit<Contest, "id" | "createdAt">): Promise<Contest> {
    return this.request<Contest>("/api/contests", {
      method: "POST",
      body: JSON.stringify(contest),
    })
  }

  // Submissions
  async submitAnswers(
    contestId: string,
    userId: string,
    answers: Record<string, string>,
    timeTaken: number,
  ): Promise<MCQSubmission> {
    return this.request<MCQSubmission>("/api/submissions", {
      method: "POST",
      body: JSON.stringify({ contestId, userId, answers, timeTaken }),
    })
  }

  async getUserSubmissions(userId: string): Promise<MCQSubmission[]> {
    return this.request<MCQSubmission[]>(`/api/submissions/user/${userId}`)
  }

  async getContestSubmissions(contestId: string): Promise<MCQSubmission[]> {
    return this.request<MCQSubmission[]>(`/api/submissions/contest/${contestId}`)
  }

  // File upload
  async uploadFile(file: File): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Upload failed")
    }

    return response.json()
  }
}

export const apiClient = new ApiClient()
