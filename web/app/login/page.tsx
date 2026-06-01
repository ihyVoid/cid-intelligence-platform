'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { AlertTriangle, X, ShieldAlert } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check if already logged in
    const user = localStorage.getItem('cid_user')
    if (user) {
      router.push('/')
    }
  }, [router])

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
  
    try {
      const res = await axios.post(
        'http://localhost:4000/login',
        { username, password }
      )
    
      localStorage.setItem(
        'cid_user',
        JSON.stringify(res.data)
      )
    
      router.push('/')
    
    } catch (err: any) {
      const message = err.response?.data?.error || 'Invalid credentials. Access denied.'
      setErrorMessage(message)
      setShowErrorModal(true)
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#212129]">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#212129] relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(183, 183, 183, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(183, 183, 183, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Glowing orb effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
      
      <div className="relative w-full max-w-md bg-[#1a1a22] border border-[#40445A] rounded-2xl p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
        
        {/* Logo Area */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
            <ShieldAlert className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              CID OFFICE
            </h1>
            <p className="text-[#7E8299] text-xs uppercase tracking-widest">
              Federal Intelligence System
            </p>
          </div>
        </div>

        {/* Decorative line */}
        <div className="h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent mb-8" />

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[#B7B7B7] mb-2 text-sm font-medium">
              AGENT IDENTIFIER
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="
                w-full
                bg-[#2a2a35]
                border
                border-[#40445A]
                rounded-xl
                px-4
                py-3.5
                text-white
                placeholder:text-[#5a5a6e]
                outline-none
                transition-all duration-200
                focus:border-red-500/70
                focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]
              "
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="block text-[#B7B7B7] mb-2 text-sm font-medium">
              ACCESS CODE
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full
                bg-[#2a2a35]
                border
                border-[#40445A]
                rounded-xl
                px-4
                py-3.5
                text-white
                placeholder:text-[#5a5a6e]
                outline-none
                transition-all duration-200
                focus:border-red-500/70
                focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]
              "
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="
              w-full
              bg-gradient-to-r from-red-600 to-red-700
              hover:from-red-500 hover:to-red-600
              disabled:opacity-50
              transition-all duration-300
              rounded-xl
              py-3.5
              text-white
              font-semibold
              tracking-wide
              shadow-lg shadow-red-500/20
              hover:shadow-red-500/40
              hover:scale-[1.02]
              active:scale-[0.98]
            "
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                AUTHENTICATING...
              </span>
            ) : 'ACCESS SYSTEM'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-[#2a2a35]">
          <p className="text-[#5a5a6e] text-xs text-center">
            Unauthorized access is prohibited and monitored
          </p>
        </div>
      </div>

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a22] border border-red-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-red-500/10 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">ACCESS DENIED</h3>
                <p className="text-red-400 text-sm">Authentication Failed</p>
              </div>
            </div>
            
            <div className="bg-[#2a2a35] rounded-xl p-4 mb-6">
              <p className="text-[#B7B7B7] text-sm">
                {errorMessage}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowErrorModal(false)}
                className="flex-1 bg-[#2a2a35] hover:bg-[#3a3a45] border border-[#40445A] rounded-xl py-3 text-white font-medium transition-colors"
              >
                TRY AGAIN
              </button>
              <button
                onClick={() => setShowErrorModal(false)}
                className="w-12 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl py-3 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-red-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}