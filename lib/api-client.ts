const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    // Add auth token if available
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken")
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        }
      }
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.request<{ user: any; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", response.token)
    }
    return response
  }

  async signup(name: string, email: string, password: string) {
    const response = await this.request<{ user: any; token: string }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    })

    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", response.token)
    }
    return response
  }

  async logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken")
    }
  }

  // Contest methods
  async getContests() {
    return this.request<any[]>("/contests")
  }

  async getContest(id: string) {
    return this.request<any>(`/contests/${id}`)
  }

  async createContest(contestData: any) {
    return this.request<any>("/contests", {
      method: "POST",
      body: JSON.stringify(contestData),
    })
  }

  // Submission methods
  async saveSubmission(submission: any) {
    return this.request<any>("/submissions", {
      method: "POST",
      body: JSON.stringify(submission),
    })
  }

  async getSubmissions(userId: string) {
    return this.request<any[]>(`/submissions/user/${userId}`)
  }

  // Code submission methods
  async saveCodeSubmission(submissionData: any) {
    return this.request<any>("/code-submissions", {
      method: "POST",
      body: JSON.stringify(submissionData),
    })
  }

  async getCodeSubmissions(contestId: string, userId: string) {
    return this.request<any[]>(`/code-submissions/${contestId}/${userId}`)
  }

  // Code execution
  async executeCode(code: string, language: string, problem: any) {
    return this.request<any>("/execute", {
      method: "POST",
      body: JSON.stringify({ code, language, problem }),
    })
  }
}

export const apiClient = new ApiClient()
