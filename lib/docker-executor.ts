import { spawn } from "child_process"
import { promises as fs } from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import type { CodingProblem } from "./types"

export interface TestResult {
  passed: boolean
  expected: string
  actual: string
  input: string
  executionTime: number
  memoryUsed: number
}

export interface ExecutionResult {
  success: boolean
  output: string
  error: string
  executionTime: number
  memoryUsed: number
  testResults: TestResult[]
  compilationError?: string
}

const EXECUTION_TIMEOUT = 10000 // 10 seconds
const MEMORY_LIMIT = "128m" // 128MB
const TEMP_DIR = path.join(process.cwd(), "temp")

// Language configurations
const LANGUAGE_CONFIG = {
  cpp: {
    image: "gcc:latest",
    extension: "cpp",
    compileCmd: ["g++", "-o", "/tmp/solution", "/tmp/solution.cpp", "-std=c++17"],
    runCmd: ["/tmp/solution"],
    dockerfile: `
FROM gcc:latest
RUN useradd -m -s /bin/bash runner
USER runner
WORKDIR /tmp
`,
  },
  java: {
    image: "openjdk:17-slim",
    extension: "java",
    compileCmd: ["javac", "/tmp/Solution.java"],
    runCmd: ["java", "-cp", "/tmp", "Solution"],
    dockerfile: `
FROM openjdk:17-slim
RUN useradd -m -s /bin/bash runner
USER runner
WORKDIR /tmp
`,
  },
  python: {
    image: "python:3.11-slim",
    extension: "py",
    compileCmd: null, // Python doesn't need compilation
    runCmd: ["python", "/tmp/solution.py"],
    dockerfile: `
FROM python:3.11-slim
RUN useradd -m -s /bin/bash runner
USER runner
WORKDIR /tmp
`,
  },
}

// Ensure temp directory exists
async function ensureTempDir() {
  try {
    await fs.access(TEMP_DIR)
  } catch {
    await fs.mkdir(TEMP_DIR, { recursive: true })
  }
}

// Build Docker image for language if it doesn't exist
async function ensureDockerImage(language: string): Promise<void> {
  const config = LANGUAGE_CONFIG[language as keyof typeof LANGUAGE_CONFIG]
  if (!config) {
    throw new Error(`Unsupported language: ${language}`)
  }

  const imageName = `contest-runner-${language}`

  return new Promise((resolve, reject) => {
    // Check if image exists
    const checkProcess = spawn("docker", ["images", "-q", imageName])

    checkProcess.on("close", async (code) => {
      if (code === 0) {
        // Image exists, check if it has output
        let imageExists = false
        checkProcess.stdout.on("data", (data) => {
          if (data.toString().trim()) {
            imageExists = true
          }
        })

        setTimeout(() => {
          if (imageExists) {
            resolve()
            return
          }

          // Build image
          buildImage()
        }, 100)
      } else {
        buildImage()
      }
    })

    async function buildImage() {
      try {
        // Create temporary Dockerfile
        const dockerfilePath = path.join(TEMP_DIR, `Dockerfile.${language}`)
        await fs.writeFile(dockerfilePath, config.dockerfile.trim())

        const buildProcess = spawn("docker", ["build", "-t", imageName, "-f", dockerfilePath, "."], {
          cwd: TEMP_DIR,
        })

        let buildOutput = ""
        buildProcess.stdout.on("data", (data) => {
          buildOutput += data.toString()
        })

        buildProcess.stderr.on("data", (data) => {
          buildOutput += data.toString()
        })

        buildProcess.on("close", (code) => {
          if (code === 0) {
            resolve()
          } else {
            reject(new Error(`Failed to build Docker image: ${buildOutput}`))
          }
        })
      } catch (error) {
        reject(error)
      }
    }
  })
}

// Execute code in Docker container
async function executeInDocker(
  language: string,
  code: string,
  input: string,
  timeLimit: number = EXECUTION_TIMEOUT,
): Promise<{ output: string; error: string; executionTime: number; memoryUsed: number }> {
  const config = LANGUAGE_CONFIG[language as keyof typeof LANGUAGE_CONFIG]
  const imageName = `contest-runner-${language}`
  const containerId = uuidv4()
  const fileName = language === "java" ? "Solution" : "solution"

  await ensureTempDir()
  await ensureDockerImage(language)

  // Create temporary file
  const tempFile = path.join(TEMP_DIR, `${containerId}.${config.extension}`)
  await fs.writeFile(tempFile, code)

  const startTime = Date.now()

  return new Promise((resolve, reject) => {
    let output = ""
    let error = ""
    let isResolved = false

    // Docker run command with security restrictions
    const dockerArgs = [
      "run",
      "--rm",
      "--name",
      `contest-${containerId}`,
      "--memory",
      MEMORY_LIMIT,
      "--memory-swap",
      MEMORY_LIMIT,
      "--cpus",
      "0.5",
      "--network",
      "none", // No network access
      "--read-only", // Read-only filesystem
      "--tmpfs",
      "/tmp:rw,noexec,nosuid,size=50m", // Temporary filesystem
      "--user",
      "runner",
      "--cap-drop",
      "ALL", // Drop all capabilities
      "--security-opt",
      "no-new-privileges", // Prevent privilege escalation
      "-v",
      `${tempFile}:/tmp/${fileName}.${config.extension}:ro`,
      imageName,
    ]

    // Add compilation step if needed
    if (config.compileCmd) {
      dockerArgs.push("sh", "-c", `${config.compileCmd.join(" ")} && echo "COMPILATION_SUCCESS"`)
    } else {
      dockerArgs.push("sh", "-c", `echo "COMPILATION_SUCCESS"`)
    }

    const compileProcess = spawn("docker", dockerArgs)

    let compileOutput = ""
    let compileError = ""

    compileProcess.stdout.on("data", (data) => {
      compileOutput += data.toString()
    })

    compileProcess.stderr.on("data", (data) => {
      compileError += data.toString()
    })

    compileProcess.on("close", (code) => {
      if (code !== 0 || !compileOutput.includes("COMPILATION_SUCCESS")) {
        cleanup()
        resolve({
          output: "",
          error: `Compilation failed: ${compileError}`,
          executionTime: Date.now() - startTime,
          memoryUsed: 0,
        })
        return
      }

      // Run the compiled/interpreted code
      const runArgs = [
        "run",
        "--rm",
        "--name",
        `contest-run-${containerId}`,
        "--memory",
        MEMORY_LIMIT,
        "--memory-swap",
        MEMORY_LIMIT,
        "--cpus",
        "0.5",
        "--network",
        "none",
        "--read-only",
        "--tmpfs",
        "/tmp:rw,noexec,nosuid,size=50m",
        "--user",
        "runner",
        "--cap-drop",
        "ALL",
        "--security-opt",
        "no-new-privileges",
        "-i", // Interactive for input
        "-v",
        `${tempFile}:/tmp/${fileName}.${config.extension}:ro`,
        imageName,
        ...config.runCmd,
      ]

      const runProcess = spawn("docker", runArgs)

      // Send input to the process
      if (input) {
        runProcess.stdin.write(input)
      }
      runProcess.stdin.end()

      runProcess.stdout.on("data", (data) => {
        output += data.toString()
      })

      runProcess.stderr.on("data", (data) => {
        error += data.toString()
      })

      // Set timeout
      const timeout = setTimeout(() => {
        if (!isResolved) {
          isResolved = true
          runProcess.kill("SIGKILL")
          // Force kill the container
          spawn("docker", ["kill", `contest-run-${containerId}`])
          cleanup()
          resolve({
            output: "",
            error: "Time Limit Exceeded",
            executionTime: timeLimit,
            memoryUsed: 0,
          })
        }
      }, timeLimit)

      runProcess.on("close", async (code) => {
        if (isResolved) return
        isResolved = true

        clearTimeout(timeout)

        // Get memory usage stats
        let memoryUsed = 0
        try {
          const statsProcess = spawn("docker", [
            "stats",
            "--no-stream",
            "--format",
            "{{.MemUsage}}",
            `contest-run-${containerId}`,
          ])
          statsProcess.stdout.on("data", (data) => {
            const memStr = data.toString().trim()
            const match = memStr.match(/(\d+\.?\d*)(MiB|KiB|B)/)
            if (match) {
              const value = Number.parseFloat(match[1])
              const unit = match[2]
              memoryUsed = unit === "MiB" ? value : unit === "KiB" ? value / 1024 : value / (1024 * 1024)
            }
          })
        } catch (e) {
          // Ignore stats errors
        }

        cleanup()

        resolve({
          output: output.trim(),
          error: error.trim(),
          executionTime: Date.now() - startTime,
          memoryUsed,
        })
      })

      runProcess.on("error", (err) => {
        if (isResolved) return
        isResolved = true
        cleanup()
        reject(err)
      })
    })

    compileProcess.on("error", (err) => {
      cleanup()
      reject(err)
    })

    async function cleanup() {
      try {
        await fs.unlink(tempFile)
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  })
}

// Main execution function
export async function executeCode(code: string, language: string, problem: CodingProblem): Promise<ExecutionResult> {
  const testCases = problem.testCases || generateDefaultTestCases(problem)
  const testResults: TestResult[] = []
  let allPassed = true
  let totalExecutionTime = 0
  let maxMemoryUsed = 0
  let compilationError = ""

  try {
    // Validate Docker availability
    await checkDockerAvailability()

    // Test compilation first with empty input
    const compileTest = await executeInDocker(language, code, "", 5000)
    if (compileTest.error && !compileTest.output) {
      compilationError = compileTest.error
      throw new Error(`Compilation failed: ${compileTest.error}`)
    }

    // Run test cases
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i]
      const startTime = Date.now()

      try {
        const result = await executeInDocker(language, code, testCase.input, EXECUTION_TIMEOUT)
        const executionTime = Date.now() - startTime

        const passed = result.output.trim() === testCase.expectedOutput.trim()
        if (!passed) allPassed = false

        testResults.push({
          passed,
          expected: testCase.expectedOutput,
          actual: result.output,
          input: testCase.input,
          executionTime,
          memoryUsed: result.memoryUsed,
        })

        totalExecutionTime += executionTime
        maxMemoryUsed = Math.max(maxMemoryUsed, result.memoryUsed)

        // If there's a runtime error, mark as failed
        if (result.error && result.error !== "Time Limit Exceeded") {
          allPassed = false
          testResults[testResults.length - 1].actual = `Runtime Error: ${result.error}`
        }
      } catch (error) {
        allPassed = false
        testResults.push({
          passed: false,
          expected: testCase.expectedOutput,
          actual: `Execution Error: ${(error as Error).message}`,
          input: testCase.input,
          executionTime: EXECUTION_TIMEOUT,
          memoryUsed: 0,
        })
      }
    }
  } catch (error) {
    return {
      success: false,
      output: "",
      error: (error as Error).message,
      executionTime: 0,
      memoryUsed: 0,
      testResults: [],
      compilationError,
    }
  }

  return {
    success: allPassed,
    output: testResults.length > 0 ? testResults[0].actual : "",
    error: allPassed ? "" : "Some test cases failed",
    executionTime: totalExecutionTime,
    memoryUsed: maxMemoryUsed,
    testResults,
  }
}

// Check if Docker is available
async function checkDockerAvailability(): Promise<void> {
  return new Promise((resolve, reject) => {
    const dockerProcess = spawn("docker", ["--version"])

    dockerProcess.on("close", (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error("Docker is not available. Please install Docker to run code execution."))
      }
    })

    dockerProcess.on("error", () => {
      reject(new Error("Docker is not available. Please install Docker to run code execution."))
    })
  })
}

// Generate default test cases for problems
function generateDefaultTestCases(problem: CodingProblem) {
  const testCases = []

  if (problem.sampleInput && problem.sampleOutput) {
    testCases.push({
      input: problem.sampleInput,
      expectedOutput: problem.sampleOutput,
    })
  }

  // Add problem-specific test cases
  if (problem.title.toLowerCase().includes("sum")) {
    testCases.push(
      { input: "1 2", expectedOutput: "3" },
      { input: "5 7", expectedOutput: "12" },
      { input: "0 0", expectedOutput: "0" },
      { input: "-1 1", expectedOutput: "0" },
    )
  } else if (problem.title.toLowerCase().includes("hello")) {
    testCases.push({ input: "", expectedOutput: "Hello World" })
  } else if (problem.title.toLowerCase().includes("fibonacci")) {
    testCases.push(
      { input: "0", expectedOutput: "0" },
      { input: "1", expectedOutput: "1" },
      { input: "5", expectedOutput: "5" },
      { input: "10", expectedOutput: "55" },
    )
  } else if (problem.title.toLowerCase().includes("factorial")) {
    testCases.push(
      { input: "0", expectedOutput: "1" },
      { input: "1", expectedOutput: "1" },
      { input: "5", expectedOutput: "120" },
    )
  } else {
    // Generic test cases
    testCases.push({ input: "1", expectedOutput: "1" }, { input: "2", expectedOutput: "2" })
  }

  return testCases
}

// Cleanup function to remove old containers and images
export async function cleanupDockerResources(): Promise<void> {
  try {
    // Remove stopped containers
    spawn("docker", ["container", "prune", "-f"])

    // Remove unused images older than 24 hours
    spawn("docker", ["image", "prune", "-a", "--filter", "until=24h", "-f"])
  } catch (error) {
    console.error("Docker cleanup error:", error)
  }
}
