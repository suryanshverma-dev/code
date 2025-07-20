import type { Contest } from "./types"

// Storage keys
const STORAGE_KEYS = {
  USERS: "mcq_users",
  CONTESTS: "mcq_contests",
  SUBMISSIONS: "mcq_submissions",
  CURRENT_USER: "mcq_current_user",
  EXAM_SESSION: "mcq_exam_session",
  UPLOADED_IMAGES: "mcq_uploaded_images",
} as const

// Default data
const getDefaultContests = (): Contest[] => [
  {
    id: "sample-physics-1",
    title: "JEE Main Physics Mock Test",
    description: "Comprehensive physics test covering mechanics, thermodynamics, and electromagnetism",
    mcqProblems: [
      {
        id: "q1",
        question: "What is the SI unit of force?",
        options: [
          { id: "q1-a", text: "Newton", isCorrect: true },
          { id: "q1-b", text: "Joule", isCorrect: false },
          { id: "q1-c", text: "Watt", isCorrect: false },
          { id: "q1-d", text: "Pascal", isCorrect: false },
        ],
        explanation: "Newton is the SI unit of force, named after Sir Isaac Newton. 1 Newton = 1 kg⋅m/s²",
        subject: "Physics",
        difficulty: "easy",
        marks: 4,
        negativeMarks: 1,
      },
      {
        id: "q2",
        question:
          "A ball is thrown vertically upward with an initial velocity of 20 m/s. What is the maximum height reached? (g = 10 m/s²)",
        options: [
          { id: "q2-a", text: "10 m", isCorrect: false },
          { id: "q2-b", text: "20 m", isCorrect: true },
          { id: "q2-c", text: "30 m", isCorrect: false },
          { id: "q2-d", text: "40 m", isCorrect: false },
        ],
        explanation:
          "Using v² = u² + 2as, at maximum height v = 0, u = 20 m/s, a = -g = -10 m/s². So 0 = 400 - 20s, s = 20 m",
        subject: "Physics",
        difficulty: "medium",
        marks: 4,
        negativeMarks: 1,
      },
      {
        id: "q3",
        question: "Which of the following is NOT a vector quantity?",
        options: [
          { id: "q3-a", text: "Velocity", isCorrect: false },
          { id: "q3-b", text: "Acceleration", isCorrect: false },
          { id: "q3-c", text: "Speed", isCorrect: true },
          { id: "q3-d", text: "Force", isCorrect: false },
        ],
        explanation:
          "Speed is a scalar quantity as it has only magnitude. Velocity, acceleration, and force are vector quantities as they have both magnitude and direction.",
        subject: "Physics",
        difficulty: "easy",
        marks: 4,
        negativeMarks: 1,
      },
      {
        id: "q4",
        question: "The work done by a conservative force in a closed path is:",
        options: [
          { id: "q4-a", text: "Always positive", isCorrect: false },
          { id: "q4-b", text: "Always negative", isCorrect: false },
          { id: "q4-c", text: "Zero", isCorrect: true },
          { id: "q4-d", text: "Depends on the path", isCorrect: false },
        ],
        explanation:
          "For conservative forces, work done in a closed path is always zero because the force is path-independent.",
        subject: "Physics",
        difficulty: "medium",
        marks: 4,
        negativeMarks: 1,
      },
      {
        id: "q5",
        question: "What is the dimensional formula for power?",
        options: [
          { id: "q5-a", text: "[ML²T⁻²]", isCorrect: false },
          { id: "q5-b", text: "[ML²T⁻³]", isCorrect: true },
          { id: "q5-c", text: "[MLT⁻²]", isCorrect: false },
          { id: "q5-d", text: "[ML²T⁻¹]", isCorrect: false },
        ],
        explanation:
          "Power = Work/Time = Energy/Time. Energy has dimension [ML²T⁻²], so Power = [ML²T⁻²]/[T] = [ML²T⁻³]",
        subject: "Physics",
        difficulty: "medium",
        marks: 4,
        negativeMarks: 1,
      },
    ],
    duration: 30,
    totalMarks: 20,
    instructions:
      "• Each question carries 4 marks\n• Wrong answers carry -1 mark\n• No marks for unattempted questions\n• Use the question palette to navigate\n• Submit before time expires",
    createdBy: "System",
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: "sample-math-1",
    title: "Mathematics Aptitude Test",
    description: "Test your mathematical skills with algebra, geometry, and calculus questions",
    mcqProblems: [
      {
        id: "m1",
        question: "What is the derivative of sin(x)?",
        options: [
          { id: "m1-a", text: "cos(x)", isCorrect: true },
          { id: "m1-b", text: "-cos(x)", isCorrect: false },
          { id: "m1-c", text: "sin(x)", isCorrect: false },
          { id: "m1-d", text: "-sin(x)", isCorrect: false },
        ],
        explanation: "The derivative of sin(x) with respect to x is cos(x).",
        subject: "Mathematics",
        difficulty: "easy",
        marks: 3,
        negativeMarks: 1,
      },
      {
        id: "m2",
        question: "If log₂(x) = 3, what is the value of x?",
        options: [
          { id: "m2-a", text: "6", isCorrect: false },
          { id: "m2-b", text: "8", isCorrect: true },
          { id: "m2-c", text: "9", isCorrect: false },
          { id: "m2-d", text: "12", isCorrect: false },
        ],
        explanation: "If log₂(x) = 3, then x = 2³ = 8",
        subject: "Mathematics",
        difficulty: "easy",
        marks: 3,
        negativeMarks: 1,
      },
      {
        id: "m3",
        question: "What is the area of a circle with radius 5 units?",
        options: [
          { id: "m3-a", text: "25π", isCorrect: true },
          { id: "m3-b", text: "10π", isCorrect: false },
          { id: "m3-c", text: "5π", isCorrect: false },
          { id: "m3-d", text: "50π", isCorrect: false },
        ],
        explanation: "Area of circle = πr² = π × 5² = 25π square units",
        subject: "Mathematics",
        difficulty: "easy",
        marks: 3,
        negativeMarks: 1,
      },
    ],
    duration: 20,
    totalMarks: 9,
    instructions: "• Each question carries 3 marks\n• Wrong answers carry -1 mark\n• Calculator not allowed",
    createdBy: "System",
    createdAt: new Date().toISOString(),
    isActive: true,
  },
]

// Utility functions
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue
  try {\
    const item = localStorage.getItem(key)\
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error reading from localStorage key ${key}:`, error)
    return defaultValue
  }
}
\
const setToStorage = <T>(key: string, value: T): void => {
  if (typeof window === "undefined") return
  try {\
    localStorage.setItem(key, JSON.stringify(value))\
  } catch (error) {
    console.error(`Error writing to localStorage key ${key}:`, error)
  }
}

// Initialize default data
const initializeDefaultData = () => {
  const contests = getFromStorage(STORAGE_KEYS.CONTESTS, [])\
  if (contests.length === 0) {
    setToStorage(STORAGE_KEYS.CONTESTS, getDefaultContests())
  }
}

// Storage API
export const storage = {
  // Initialize
  init: () => {
    initializeDefaultData()
  },

  // Users\
  getUsers: (): User[] => getFromStorage(STORAGE_KEYS.USERS, []),
  
  getUserById: (id: string): User | null => {
    const users = storage.getUsers()\
    return users.find((user) => user.id === id) || null
  },
  
  getUserByEmail: (email: string): User | null => {
    const users = storage.getUsers()\
    return users.find((user) => user.email === email) || null
  },
  
  createUser: (userData: Omit<User, "id" | "createdAt">): User => {\
    const users = storage.getUsers()
    const newUser: User = {\
      ...userData,
      id: \`user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    }
    users.push(newUser)
    setToStorage(STORAGE_KEYS.USERS, users)
    return newUser
  },

  // Current user session
  getCurrentUser: (): User | null => getFromStorage(STORAGE_KEYS.CURRENT_USER, null),
  
  setCurrentUser: (user: User | null): void => {
    setToStorage(STORAGE_KEYS.CURRENT_USER, user)
  },

  // Contests
  getContests: (): Contest[] => getFromStorage(STORAGE_KEYS.CONTESTS, []),
  
  getContestById: (id: string): Contest | null => {
    const contests = storage.getContests()\
    return contests.find((contest) => contest.id === id) || null
  },
  
  createContest: (contestData: Omit<Contest, "id" | "createdAt">): Contest => {\
    const contests = storage.getContests()\
    const newContest: Contest = {
      ...contestData,
      id: \`contest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    }
    contests.push(newContest)
    setToStorage(STORAGE_KEYS.CONTESTS, contests)
    return newContest
  },
  
  updateContest: (id: string, updates: Partial<Contest>): Contest | null => {
    const contests = storage.getContests()\
    const index = contests.findIndex((contest) => contest.id === id)
    if (index !== -1) {
      contests[index] = { ...contests[index], ...updates }
      setToStorage(STORAGE_KEYS.CONTESTS, contests)\
      return contests[index]
    }
    return null
  },

  // Submissions
  getSubmissions: (): MCQSubmission[] => getFromStorage(STORAGE_KEYS.SUBMISSIONS, []),
  
  getSubmissionById: (id: string): MCQSubmission | null => {
    const submissions = storage.getSubmissions()\
    return submissions.find((sub) => sub.id === id) || null
  },
  
  getSubmissionsByUserId: (userId: string): MCQSubmission[] => {
    const submissions = storage.getSubmissions()\
    return submissions.filter((sub) => sub.userId === userId)
  },
  
  getSubmissionsByContestId: (contestId: string): MCQSubmission[] => {
    const submissions = storage.getSubmissions()\
    return submissions.filter((sub) => sub.contestId === contestId)
  },
  
  getUserSubmissionForContest: (userId: string, contestId: string): MCQSubmission | null => {
    const submissions = storage.getSubmissions()\
    return submissions.find((sub) => sub.userId === userId && sub.contestId === contestId) || null
  },
  
  createSubmission: (submissionData: Omit<MCQSubmission, "id">): MCQSubmission => {\
    const submissions = storage.getSubmissions()\
    const newSubmission: MCQSubmission = {
      ...submissionData,
      id: \`submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
    submissions.push(newSubmission)
    setToStorage(STORAGE_KEYS.SUBMISSIONS, submissions)
    return newSubmission
  },

  // Exam session management
  getExamSession: (contestId: string, userId: string): ExamSession | null => {
    const key = \`${STORAGE_KEYS.EXAM_SESSION}_${contestId}_${userId}\`
    return getFromStorage(key, null)
  },
  
  setExamSession: (session: ExamSession): void => {
    const key = \`${STORAGE_KEYS.EXAM_SESSION}_${session.contestId}_${session.userId}`
    setToStorage(key, session)
  },
  
  clearExamSession: (contestId: string, userId: string): void => {
    const key = \`${STORAGE_KEYS.EXAM_SESSION}_${contestId}_${userId}\`
    if (typeof window !== "undefined") {
      localStorage.removeItem(key)
    }
  },

  // Image storage (for uploaded images)
  saveUploadedImage: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const images = getFromStorage(STORAGE_KEYS.UPLOADED_IMAGES, {})
        images[imageId] = {
          data: result,
          name: file.name,
          type: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        }
        setToStorage(STORAGE_KEYS.UPLOADED_IMAGES, images)
        resolve(`data:${file.type};base64,${result.split(',')[1]}`)
      }
      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsDataURL(file)
    })
  },

  // Calculate score
  calculateScore: (contestId: string, answers: Record<string, string>) => {
    const contest = storage.getContestById(contestId)
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

  // Clear all data (for testing)
  clearAll: () => {
    if (typeof window !== "undefined") {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key)
      })
    }
  },
}

// Initialize storage when module loads
if (typeof window !== "undefined") {
  storage.init()
}
