'use client'

import { useEffect, useState } from 'react'

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const userStr = localStorage.getItem('cid_user')
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          if (user && user.user) {
            setIsAuthenticated(true)
            setIsLoading(false)
            return
          }
        } catch (e) {
          localStorage.removeItem('cid_user')
        }
      }
      
      // Not authenticated - redirect to login
      window.location.href = '/login'
    }

    checkAuth()
  }, [])

  return { isLoading, isAuthenticated }
}