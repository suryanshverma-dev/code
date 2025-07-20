"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { storage } from "./storage"
import type { User } from "./types"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored user data
    const currentUser = storage.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Simple authentication - in a real app, you'd verify password
    const existingUser = storage.getUserByEmail(email)

    if (existingUser) {
      setUser(existingUser)
      storage.setCurrentUser(existingUser)
    } else {
      throw new Error("User not found")
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    // Check if user already exists
    const existingUser = storage.getUserByEmail(email)
    if (existingUser) {
      throw new Error("User already exists")
    }

    // Create new user
    const newUser = storage.createUser({ name, email })
    setUser(newUser)
    storage.setCurrentUser(newUser)
  }

  const logout = () => {
    setUser(null)
    storage.setCurrentUser(null)
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
