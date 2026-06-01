'use client'

import { useState } from 'react'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  // Run auth check on mount (client-side only)
  if (typeof window !== 'undefined' && !ready) {
    const userStr = localStorage.getItem('cid_user')
    const isLoginPage = window.location.pathname === '/login'
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user && user.user) {
          // User is logged in
          if (isLoginPage) {
            // On login page, redirect to home
            window.location.href = '/'
            return null
          }
          setReady(true)
        } else {
          // Invalid user data
          localStorage.removeItem('cid_user')
          if (!isLoginPage) {
            window.location.href = '/login'
            return null
          }
          setReady(true)
        }
      } catch (e) {
        localStorage.removeItem('cid_user')
        if (!isLoginPage) {
          window.location.href = '/login'
          return null
        }
        setReady(true)
      }
    } else {
      // No user
      if (!isLoginPage) {
        window.location.href = '/login'
        return null
      }
      setReady(true)
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#212129] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[#7E8299]">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}