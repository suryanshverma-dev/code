const express = require("express")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { v4: uuidv4 } = require("uuid")

const app = express()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Middleware
app.use(cors())
app.use(express.json())

// In-memory storage (replace with database in production)
const users = []
const contests = []
const submissions = []
const codeSubmissions = []

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.sendStatus(401)
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

// Auth routes
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if user exists
    const existingUser = users.find((u) => u.email === email)
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    }

    users.push(user)

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET)

    res.json({
      user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
      token,
    })
  } catch (error) {
    res.status(500).json({ error: "Server error" })
  }
})

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = users.find((u) => u.email === email)
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" })
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(400).json({ error: "Invalid credentials" })
    }

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET)

    res.json({
      user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
      token,
    })
  } catch (error) {
    res.status(500).json({ error: "Server error" })
  }
})

// Contest routes
app.get("/api/contests", (req, res) => {
  res.json(contests)
})

app.get("/api/contests/:id", (req, res) => {
  const contest = contests.find((c) => c.id === req.params.id)
  if (!contest) {
    return res.status(404).json({ error: "Contest not found" })
  }
  res.json(contest)
})

app.post("/api/contests", authenticateToken, (req, res) => {
  try {
    const user = users.find((u) => u.id === req.user.id)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    const contest = {
      id: uuidv4(),
      ...req.body,
      createdBy: user.name,
      createdAt: new Date().toISOString(),
      startTime: req.body.startTime || new Date().toISOString(),
      endTime: req.body.endTime || new Date(Date.now() + (req.body.duration || 120) * 60 * 1000).toISOString(),
    }

    contests.push(contest)
    res.json(contest)
  } catch (error) {
    res.status(500).json({ error: "Server error" })
  }
})

// Submission routes
app.post("/api/submissions", authenticateToken, (req, res) => {
  try {
    const submission = {
      ...req.body,
      id: req.body.id || uuidv4(),
      userId: req.user.id,
    }

    submissions.push(submission)
    res.json(submission)
  } catch (error) {
    res.status(500).json({ error: "Server error" })
  }
})

app.get("/api/submissions/user/:userId", authenticateToken, (req, res) => {
  const userSubmissions = submissions.filter((s) => s.userId === req.params.userId)
  res.json(userSubmissions)
})

// Code submission routes
app.post("/api/code-submissions", authenticateToken, async (req, res) => {
  try {
    const { problemId, contestId, code, language } = req.body

    // Find the contest and problem
    const contest = contests.find((c) => c.id === contestId)
    if (!contest) {
      return res.status(404).json({ error: "Contest not found" })
    }

    const problem = contest.codingProblems.find((p) => p.id === problemId)
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" })
    }

    // Execute code (mock implementation)
    const result = await executeCode(code, language, problem)

    const submission = {
      id: uuidv4(),
      problemId,
      contestId,
      userId: req.user.id,
      code,
      language,
      result,
      submittedAt: new Date().toISOString(),
    }

    codeSubmissions.push(submission)
    res.json(submission)
  } catch (error) {
    res.status(500).json({ error: "Server error" })
  }
})

app.get("/api/code-submissions/:contestId/:userId", authenticateToken, (req, res) => {
  const userSubmissions = codeSubmissions.filter(
    (s) => s.contestId === req.params.contestId && s.userId === req.params.userId,
  )
  res.json(userSubmissions)
})

// Code execution endpoint
app.post("/api/execute", authenticateToken, async (req, res) => {
  try {
    const { code, language, problem } = req.body
    const result = await executeCode(code, language, problem)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: "Execution failed" })
  }
})

// Mock code execution function
async function executeCode(code, language, problem) {
  // Simulate execution delay
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

  const testCases = problem.testCases || generateDefaultTestCases(problem)
  const testResults = []
  let allPassed = true
  let output = ""
  let error = ""

  try {
    // Simulate compilation errors
    if (code.trim().length < 10) {
      throw new Error("Code is too short to be a valid solution")
    }

    if (language === "cpp" && !code.includes("#include")) {
      throw new Error("Missing required includes")
    }

    if (language === "java" && !code.includes("public class")) {
      throw new Error("Missing public class declaration")
    }

    // Simulate test case execution
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i]
      const result = await simulateTestExecution(code, language, testCase.input, testCase.expectedOutput)

      testResults.push({
        passed: result.passed,
        expected: testCase.expectedOutput,
        actual: result.output,
        input: testCase.input,
      })

      if (!result.passed) {
        allPassed = false
      }

      if (i === 0) {
        output = result.output
      }
    }
  } catch (err) {
    error = err.message
    allPassed = false
  }

  return {
    success: allPassed && !error,
    output,
    error,
    executionTime: Math.floor(Math.random() * 500) + 50,
    testResults,
  }
}

async function simulateTestExecution(code, language, input, expectedOutput) {
  // Mock implementation with pattern matching
  const codeLines = code.toLowerCase().split("\n")

  if (code.includes("hello world") || code.includes('"hello world"') || code.includes("'hello world'")) {
    return {
      passed: expectedOutput.toLowerCase().includes("hello world"),
      output: "Hello World",
    }
  }

  if (codeLines.some((line) => line.includes("sum") || line.includes("+"))) {
    const numbers = input
      .split(/\s+/)
      .map((n) => Number.parseInt(n))
      .filter((n) => !isNaN(n))
    const sum = numbers.reduce((a, b) => a + b, 0)
    return {
      passed: expectedOutput.trim() === sum.toString(),
      output: sum.toString(),
    }
  }

  // Default random success/failure
  const randomSuccess = Math.random() > 0.3
  return {
    passed: randomSuccess,
    output: randomSuccess ? expectedOutput : "Wrong Answer",
  }
}

function generateDefaultTestCases(problem) {
  const testCases = []

  if (problem.sampleInput && problem.sampleOutput) {
    testCases.push({
      input: problem.sampleInput,
      expectedOutput: problem.sampleOutput,
    })
  }

  if (problem.title.toLowerCase().includes("sum")) {
    testCases.push(
      { input: "1 2", expectedOutput: "3" },
      { input: "5 7", expectedOutput: "12" },
      { input: "0 0", expectedOutput: "0" },
    )
  } else if (problem.title.toLowerCase().includes("hello")) {
    testCases.push({ input: "", expectedOutput: "Hello World" })
  } else {
    testCases.push(
      { input: "test input 1", expectedOutput: "expected output 1" },
      { input: "test input 2", expectedOutput: "expected output 2" },
    )
  }

  return testCases
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
