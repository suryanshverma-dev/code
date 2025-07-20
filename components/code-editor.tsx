"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Play, Save, Clock, CheckCircle, XCircle, AlertTriangle, Code, History, Eye, MemoryStick } from "lucide-react"
import type { CodingProblem, CodeSubmission } from "@/lib/types"
import { apiClient } from "@/lib/api-client"
import { CodeMirrorEditor } from "./code-mirror-editor"

interface CodeEditorProps {
  problem: CodingProblem
  index: number
  onSubmit: (code: string, language: string) => void
  submissions: CodeSubmission[]
  disabled?: boolean
}

const SUPPORTED_LANGUAGES = [
  { value: "cpp", label: "C++17", extension: "cpp" },
  { value: "java", label: "Java 17", extension: "java" },
  { value: "python", label: "Python 3.11", extension: "py" },
]

const DEFAULT_CODE = {
  cpp: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    // Your code here
    
    return 0;
}`,
  java: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        // Your code here
        
        scanner.close();
    }
}`,
  python: `# Your code here

def main():
    pass

if __name__ == "__main__":
    main()`,
}

export function CodeEditor({ problem, index, onSubmit, submissions, disabled = false }: CodeEditorProps) {
  const [language, setLanguage] = useState("python")
  const [code, setCode] = useState(DEFAULT_CODE.python)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResult, setExecutionResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("editor")
  const [executionProgress, setExecutionProgress] = useState(0)

  useEffect(() => {
    setCode(DEFAULT_CODE[language as keyof typeof DEFAULT_CODE])
  }, [language])

  const handleLanguageChange = (newLanguage: string) => {
    if (disabled) return
    setLanguage(newLanguage)
    setExecutionResult(null)
  }

  const handleRunCode = async () => {
    if (disabled) return
    setIsExecuting(true)
    setExecutionResult(null)
    setExecutionProgress(0)

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setExecutionProgress((prev) => Math.min(prev + 10, 90))
    }, 200)

    try {
      const result = await apiClient.executeCode(code, language, problem)
      setExecutionResult(result)
      setExecutionProgress(100)
    } catch (error) {
      setExecutionResult({
        success: false,
        output: "",
        error: "Execution failed: " + (error as Error).message,
        executionTime: 0,
        memoryUsed: 0,
        testResults: [],
      })
      setExecutionProgress(100)
    } finally {
      clearInterval(progressInterval)
      setIsExecuting(false)
      setTimeout(() => setExecutionProgress(0), 1000)
    }
  }

  const handleSubmit = () => {
    if (disabled) return
    onSubmit(code, language)
    if (executionResult?.success) {
      setActiveTab("submissions")
    }
  }

  const loadSubmission = (submission: CodeSubmission) => {
    if (disabled) return
    setLanguage(submission.language)
    setCode(submission.code)
    setExecutionResult(submission.result)
    setActiveTab("editor")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "error":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const formatMemory = (mb: number) => {
    if (mb < 1) return `${(mb * 1024).toFixed(1)} KB`
    return `${mb.toFixed(1)} MB`
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  return (
    <Card className={`w-full ${disabled ? "opacity-60" : ""}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            Problem {index + 1}: {problem.title}
          </span>
          <div className="flex items-center space-x-2">
            <Select value={language} onValueChange={handleLanguageChange} disabled={disabled}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="problem">Problem</TabsTrigger>
            <TabsTrigger value="editor">
              <Code className="w-4 h-4 mr-2" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="submissions">
              <History className="w-4 h-4 mr-2" />
              History ({submissions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="problem" className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{problem.description}</p>
            </div>

            {problem.sampleInput && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Sample Input</h4>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto font-mono">{problem.sampleInput}</pre>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Sample Output</h4>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto font-mono">
                    {problem.sampleOutput}
                  </pre>
                </div>
              </div>
            )}

            {problem.testCases && problem.testCases.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Test Cases</h4>
                <div className="space-y-2">
                  {problem.testCases.slice(0, 2).map((testCase, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded">
                      <div>
                        <div className="text-xs font-medium text-gray-600 mb-1">Input:</div>
                        <pre className="text-sm font-mono">{testCase.input}</pre>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-600 mb-1">Expected Output:</div>
                        <pre className="text-sm font-mono">{testCase.expectedOutput}</pre>
                      </div>
                    </div>
                  ))}
                  {problem.testCases.length > 2 && (
                    <p className="text-sm text-gray-500">+ {problem.testCases.length - 2} more hidden test cases</p>
                  )}
                </div>
              </div>
            )}

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Execution Environment:</strong> Your code runs in a secure Docker container with limited
                resources (128MB memory, 10s timeout). Network access is disabled for security.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="editor" className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <CodeMirrorEditor
                value={code}
                onChange={setCode}
                language={language}
                height="400px"
                disabled={disabled}
              />
            </div>

            {isExecuting && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Executing code in secure container...</span>
                  <span>{executionProgress}%</span>
                </div>
                <Progress value={executionProgress} className="w-full" />
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button onClick={handleRunCode} disabled={isExecuting || disabled} variant="outline">
                  <Play className="w-4 h-4 mr-2" />
                  {isExecuting ? "Running..." : "Run Code"}
                </Button>
                <Button
                  onClick={() => setCode(DEFAULT_CODE[language as keyof typeof DEFAULT_CODE])}
                  variant="ghost"
                  disabled={disabled}
                >
                  Reset
                </Button>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!executionResult?.success || disabled}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Submit Solution
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {!executionResult ? (
              <div className="text-center py-8 text-gray-500">
                <Play className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Run your code to see results</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Execution Results</h4>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(executionResult.success ? "passed" : "failed")}
                    <Badge variant={executionResult.success ? "default" : "destructive"}>
                      {executionResult.success ? "All Tests Passed" : "Tests Failed"}
                    </Badge>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">
                      <strong>Time:</strong> {formatTime(executionResult.executionTime)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MemoryStick className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">
                      <strong>Memory:</strong> {formatMemory(executionResult.memoryUsed || 0)}
                    </span>
                  </div>
                </div>

                {executionResult.compilationError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Compilation Error:</strong>
                      <pre className="whitespace-pre-wrap text-sm mt-2">{executionResult.compilationError}</pre>
                    </AlertDescription>
                  </Alert>
                )}

                {executionResult.error && !executionResult.compilationError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <pre className="whitespace-pre-wrap text-sm">{executionResult.error}</pre>
                    </AlertDescription>
                  </Alert>
                )}

                {executionResult.output && (
                  <div>
                    <h5 className="font-medium mb-2">Output:</h5>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto font-mono">
                      {executionResult.output}
                    </pre>
                  </div>
                )}

                <div>
                  <h5 className="font-medium mb-2">Test Case Results:</h5>
                  <div className="space-y-2">
                    {executionResult.testResults.map((result: any, idx: number) => (
                      <div key={idx} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Test Case {idx + 1}</span>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{formatTime(result.executionTime || 0)}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <MemoryStick className="w-3 h-3" />
                              <span>{formatMemory(result.memoryUsed || 0)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(result.passed ? "passed" : "failed")}
                              <Badge variant={result.passed ? "default" : "destructive"}>
                                {result.passed ? "Passed" : "Failed"}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {!result.passed && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="font-medium text-gray-600 mb-1">Expected:</div>
                              <pre className="bg-gray-50 p-2 rounded font-mono">{result.expected}</pre>
                            </div>
                            <div>
                              <div className="font-medium text-gray-600 mb-1">Got:</div>
                              <pre className="bg-gray-50 p-2 rounded font-mono">{result.actual}</pre>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="submissions" className="space-y-4">
            {submissions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No submissions yet</p>
              </div>
            ) : (
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {submissions.map((submission, idx) => (
                    <Card key={submission.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="text-sm font-medium">#{submissions.length - idx}</div>
                            <Badge variant="outline">{submission.language.toUpperCase()}</Badge>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(submission.result.success ? "passed" : "failed")}
                              <span className="text-sm">
                                {submission.result.testResults.filter((t: any) => t.passed).length}/
                                {submission.result.testResults.length} tests passed
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{formatTime(submission.result.executionTime)}</span>
                              <MemoryStick className="w-3 h-3" />
                              <span>{formatMemory(submission.result.memoryUsed || 0)}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {new Date(submission.submittedAt).toLocaleString()}
                            </span>
                            <Button
                              onClick={() => loadSubmission(submission)}
                              variant="ghost"
                              size="sm"
                              disabled={disabled}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
