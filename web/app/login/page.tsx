'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
export default function LoginPage() {

  const router = useRouter()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  async function handleLogin(e: React.FormEvent) {

    e.preventDefault()
  
    try {
  
      const res = await axios.post(
        'http://localhost:4000/login',
        {
          username,
          password
        }
      )
  
      localStorage.setItem(
        'cid_user',
        JSON.stringify(res.data)
      )
  
      router.push('/dashboard')
  
    } catch {
  
      alert('Invalid credentials')
  
    }
  
  }
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#212129]">

      <div className="w-full max-w-md bg-[#323949] border border-[#40445A] rounded-2xl p-8 shadow-2xl">

        <div className="mb-8">

          <h1 className="text-4xl font-bold text-white mb-2">
            CID OFFICE
          </h1>

          <p className="text-[#B7B7B7]">
            Federal Intelligence System
          </p>

        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          <div>

            <label className="block text-[#B7B7B7] mb-2 text-sm">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="
                w-full
                bg-[#3D3E51]
                border
                border-[#40445A]
                rounded-xl
                px-4
                py-3
                text-white
                outline-none
                focus:border-[#B7B7B7]
              "
              placeholder="Enter username"
            />

          </div>

          <div>

            <label className="block text-[#B7B7B7] mb-2 text-sm">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full
                bg-[#3D3E51]
                border
                border-[#40445A]
                rounded-xl
                px-4
                py-3
                text-white
                outline-none
                focus:border-[#B7B7B7]
              "
              placeholder="Enter password"
            />

          </div>

          <button
            type="submit"
            className="
              w-full
              bg-[#40445A]
              hover:bg-[#50556d]
              transition
              rounded-xl
              py-3
              text-white
              font-semibold
            "
          >
            ACCESS SYSTEM
          </button>

        </form>

      </div>

    </main>
  )
}