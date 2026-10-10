'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

export interface AuthUser {
  id: string
  uid: string // compatibility alias for patientId || id
  name: string | null
  displayName?: string | null // compatibility alias for Firebase displayName
  email: string
  role: 'PATIENT' | 'CLINICIAN' | 'ADMIN'
  patientId?: string
  doctorId?: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  refresh: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        if (data.user) {
          setUser({
            ...data.user,
            displayName: data.user.name || data.user.email?.split('@')[0],
          })
        } else {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, logout, refresh: fetchSession }}>
      {children}
    </AuthContext.Provider>
  )
}

// Backwards-compatible alias so existing layout imports continue to work without disruption
export const FirebaseAuthProvider = AuthProvider
