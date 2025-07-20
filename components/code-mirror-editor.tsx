"use client"

import { useEffect, useState } from "react"
import CodeMirror from "@uiw/react-codemirror"
import { cpp } from "@codemirror/lang-cpp"
import { java } from "@codemirror/lang-java"
import { python } from "@codemirror/lang-python"
import { oneDark } from "@codemirror/theme-one-dark"
import { autocompletion, completionKeymap } from "@codemirror/autocomplete"
import { keymap } from "@codemirror/view"
import { indentWithTab } from "@codemirror/commands"

interface CodeMirrorEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  height?: string
  theme?: "light" | "dark"
  disabled?: boolean
}

const getLanguageExtension = (language: string) => {
  switch (language) {
    case "cpp":
      return cpp()
    case "java":
      return java()
    case "python":
      return python()
    default:
      return python()
  }
}

// Enhanced autocompletion for different languages
const getLanguageCompletions = (language: string) => {
  const completions: Record<string, any[]> = {
    cpp: [
      { label: "vector", type: "class", info: "std::vector container" },
      { label: "string", type: "class", info: "std::string class" },
      { label: "cout", type: "variable", info: "std::cout output stream" },
      { label: "cin", type: "variable", info: "std::cin input stream" },
      { label: "endl", type: "variable", info: "std::endl line ending" },
      { label: "sort", type: "function", info: "std::sort algorithm" },
      { label: "find", type: "function", info: "std::find algorithm" },
      { label: "push_back", type: "method", info: "Add element to end of vector" },
      { label: "size", type: "method", info: "Get container size" },
      { label: "begin", type: "method", info: "Get begin iterator" },
      { label: "end", type: "method", info: "Get end iterator" },
    ],
    java: [
      { label: "System.out.println", type: "method", info: "Print line to console" },
      { label: "Scanner", type: "class", info: "Input scanner class" },
      { label: "ArrayList", type: "class", info: "Dynamic array list" },
      { label: "HashMap", type: "class", info: "Hash map collection" },
      { label: "String", type: "class", info: "String class" },
      { label: "Integer", type: "class", info: "Integer wrapper class" },
      { label: "Collections.sort", type: "method", info: "Sort collection" },
      { label: "Arrays.sort", type: "method", info: "Sort array" },
      { label: "length", type: "property", info: "Array/string length" },
      { label: "size", type: "method", info: "Collection size" },
    ],
    python: [
      { label: "print", type: "function", info: "Print to console" },
      { label: "input", type: "function", info: "Read user input" },
      { label: "len", type: "function", info: "Get length of object" },
      { label: "range", type: "function", info: "Generate range of numbers" },
      { label: "enumerate", type: "function", info: "Enumerate with indices" },
      { label: "zip", type: "function", info: "Zip multiple iterables" },
      { label: "sorted", type: "function", info: "Return sorted list" },
      { label: "max", type: "function", info: "Find maximum value" },
      { label: "min", type: "function", info: "Find minimum value" },
      { label: "sum", type: "function", info: "Sum of iterable" },
      { label: "append", type: "method", info: "Add item to list" },
      { label: "split", type: "method", info: "Split string" },
      { label: "join", type: "method", info: "Join strings" },
      { label: "strip", type: "method", info: "Remove whitespace" },
    ],
  }

  return completions[language] || []
}

export function CodeMirrorEditor({
  value,
  onChange,
  language,
  height = "300px",
  theme = "light",
  disabled = false,
}: CodeMirrorEditorProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const languageCompletions = getLanguageCompletions(language)

  const customCompletions = autocompletion({
    override: [
      (context) => {
        const word = context.matchBefore(/\w*/)
        if (!word || (word.from === word.to && !context.explicit)) return null

        return {
          from: word.from,
          options: languageCompletions.map((completion) => ({
            label: completion.label,
            type: completion.type,
            info: completion.info,
            apply: completion.label,
          })),
        }
      },
    ],
  })

  const extensions = [
    getLanguageExtension(language),
    customCompletions,
    keymap.of([...completionKeymap, indentWithTab]),
  ]

  return (
    <CodeMirror
      value={value}
      height={height}
      extensions={extensions}
      theme={theme === "dark" ? oneDark : undefined}
      basicSetup={{
        lineNumbers: true,
        foldGutter: true,
        highlightActiveLine: true,
        highlightSelectionMatches: true,
        searchKeymap: true,
        autocompletion: true,
        closeBrackets: true,
        indentOnInput: true,
        bracketMatching: true,
      }}
      onChange={(doc) => !disabled && onChange(doc)}
      editable={!disabled}
      style={{
        fontSize: 14,
        borderRadius: 6,
        overflow: "hidden",
        border: "1px solid rgb(229 231 235)",
        fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
        opacity: disabled ? 0.6 : 1,
      }}
    />
  )
}
