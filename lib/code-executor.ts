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
const TEMP_DIR = path.join(process.cwd(), "temp")

// Language configurations for direct execution
const LANGUAGE_CONFIG = {
  cpp: {
    extension: "cpp",
    compileCmd: (filePath: string, outputPath: string) => ["g++", "-o", outputPath, filePath, "-std=c++17"],
    runCmd: (executablePath: string) => [executablePath],
    needsCompilation: true,
  },
  java: {
    extension: "java",
    compileCmd: (filePath: string) => ["javac", filePath],
    runCmd: (classPath: string, className: string) => ["java", "-cp", classPath, className],
    needsCompilation: true,
  },
  python: {
    extension: "py",
    compileCmd: null,
    runCmd: (filePath: string) => ["python3", filePath],
    needsCompilation: false,
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

// Execute code directly on the server
async function executeDirectly(
  language: string,
  code: string,
  input: string,
  timeLimit: number = EXECUTION_TIMEOUT,
): Promise<{ output: string; error: string; executionTime: number; memoryUsed: number }> {
  const config = LANGUAGE_CONFIG[language as keyof typeof LANGUAGE_CONFIG]
  if (!config) {
    throw new Error(`Unsupported language: ${language}`)
  }

  const containerId = uuidv4()
  const fileName = language === "java" ? "Solution" : "solution"

  await ensureTempDir()

  // Create temporary file
  const tempFile = path.join(TEMP_DIR, `${containerId}.${config.extension}`)
  await fs.writeFile(tempFile, code)

  const startTime = Date.now()

  return new Promise((resolve, reject) => {
    let output = ""
    let error = ""
    let isResolved = false

    async function cleanup() {
      try {
        await fs.unlink(tempFile)
        // Clean up compiled files
        if (language === "cpp") {
          const executablePath = path.join(TEMP_DIR, `${containerId}`)
          try {
            await fs.unlink(executablePath)
          } catch (e) {
            // Ignore if file doesn't exist
          }
        } else if (language === "java") {
          const classFile = path.join(TEMP_DIR, `${fileName}.class`)
          try {
            await fs.unlink(classFile)
          } catch (e) {
            // Ignore if file doesn't exist
          }
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    // Compilation step if needed
    if (config.needsCompilation && config.compileCmd) {
      let compileCmd: string[]

      if (language === "cpp") {
        const executablePath = path.join(TEMP_DIR, `${containerId}`)
        compileCmd = config.compileCmd(tempFile, executablePath)
      } else if (language === "java") {
        // Copy file to correct name for Java
        const javaFile = path.join(TEMP_DIR, `${fileName}.java`)
        fs.writeFile(javaFile, code)
          .then(() => {
            compileCmd = config.compileCmd!(javaFile)
            runCompilation()
          })
          .catch(reject)
        return
      } else {
        compileCmd = config.compileCmd(tempFile)
      }

      function runCompilation() {
        const compileProcess = spawn(compileCmd[0], compileCmd.slice(1), {
          cwd: TEMP_DIR,
        })

        let compileOutput = ""
        let compileError = ""

        compileProcess.stdout.on("data", (data) => {
          compileOutput += data.toString()
        })

        compileProcess.stderr.on("data", (data) => {
          compileError += data.toString()
        })

        compileProcess.on("close", (code) => {
          if (code !== 0) {
            cleanup()
            resolve({
              output: "",
              error: `Compilation failed: ${compileError}`,
              executionTime: Date.now() - startTime,
              memoryUsed: 0,
            })
            return
          }

          // Run the compiled code
          runCode()
        })

        compileProcess.on("error", (err) => {
          cleanup()
          reject(new Error(`Compilation error: ${err.message}`))
        })
      }

      runCompilation()
    } else {
      // No compilation needed, run directly
      runCode()
    }

    function runCode() {
      let runCmd: string[]

      if (language === "cpp") {
        const executablePath = path.join(TEMP_DIR, `${containerId}`)
        runCmd = config.runCmd(executablePath)
      } else if (language === "java") {
        runCmd = config.runCmd(TEMP_DIR, fileName)
      } else {
        runCmd = config.runCmd(tempFile)
      }

      const runProcess = spawn(runCmd[0], runCmd.slice(1), {
        cwd: TEMP_DIR,
      })

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

        // Estimate memory usage (simplified)
        const memoryUsed = Math.random() * 50 + 10 // Mock memory usage

        await cleanup()

        resolve({
          output: output.trim(),
          error: error.trim(),
          executionTime: Date.now() - startTime,
          memoryUsed,
        })
      })

      runProcess.on("error", async (err) => {
        if (isResolved) return
        isResolved = true
        await cleanup()
        reject(err)
      })
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
    // Check if required tools are available
    await checkToolsAvailability(language)

    // Test compilation first with empty input
    const compileTest = await executeDirectly(language, code, "", 5000)
    if (compileTest.error && compileTest.error.includes("Compilation failed")) {
      compilationError = compileTest.error
      throw new Error(compileTest.error)
    }

    // Run test cases
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i]
      const startTime = Date.now()

      try {
        const result = await executeDirectly(language, code, testCase.input, EXECUTION_TIMEOUT)
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

// Check if required tools are available
async function checkToolsAvailability(language: string): Promise<void> {
  return new Promise((resolve, reject) => {
    let command: string

    switch (language) {
      case "cpp":
        command = "g++"
        break
      case "java":
        command = "javac"
        break
      case "python":
        command = "python3"
        break
      default:
        reject(new Error(`Unsupported language: ${language}`))
        return
    }

    const checkProcess = spawn(command, ["--version"])

    checkProcess.on("close", (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`${command} is not available. Please install ${language} compiler/interpreter.`))
      }
    })

    checkProcess.on("error", () => {
      reject(new Error(`${command} is not available. Please install ${language} compiler/interpreter.`))
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

// Cleanup function to remove old temporary files
export async function cleanupTempFiles(): Promise<void> {
  try {
    const files = await fs.readdir(TEMP_DIR)
    const now = Date.now()

    for (const file of files) {
      const filePath = path.join(TEMP_DIR, file)
      const stats = await fs.stat(filePath)

      // Remove files older than 1 hour
      if (now - stats.mtime.getTime() > 60 * 60 * 1000) {
        await fs.unlink(filePath)
      }
    }
  } catch (error) {
    console.error("Temp file cleanup error:", error)
  }
}
