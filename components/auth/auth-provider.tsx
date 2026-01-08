"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

interface AuthContextType {
  isAuthenticated: boolean
  setAuthenticated: (value: boolean) => void
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  setAuthenticated: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Check localStorage for auth status
    const authStatus = localStorage.getItem("app-authenticated")
    const isAuth = authStatus === "true"
    setAuthenticated(isAuth)
    setIsChecking(false)

    // If not authenticated and not on login page, redirect
    if (!isAuth && pathname !== "/login") {
      router.replace("/login")
    }
    // If authenticated and on login page, redirect to home
    if (isAuth && pathname === "/login") {
      router.replace("/")
    }
  }, [pathname, router])

  // Show nothing while checking auth
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  // If not authenticated and not on login, show loading (redirect will happen)
  if (!isAuthenticated && pathname !== "/login") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: isAuthenticated ?? false, setAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}
