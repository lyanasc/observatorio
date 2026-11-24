"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { SessionUser } from "@/types"
import { getCurrentUser, logout as logoutAction } from "@/server/actions/auth"

interface AuthContextType {
  user: SessionUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (user: SessionUser) => void
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const refresh = useCallback(async () => {
    try {
      const result = await getCurrentUser()
      if (result.success && result.data) {
        setUser(result.data)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = useCallback((userData: SessionUser) => {
    setUser(userData)
  }, [])

  const logout = useCallback(async () => {
    await logoutAction()
    setUser(null)
    router.push("/login")
  }, [router])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
