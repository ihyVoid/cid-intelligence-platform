'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

export default function AdminPage() {

  const [users, setUsers] = useState<any[]>([])

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('agent')

  async function fetchUsers() {

    const res = await axios.get(
      'http://localhost:4000/users'
    )

    setUsers(res.data)
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault()

    await axios.post(
      'http://localhost:4000/users',
      {
        username,
        password,
        role
      }
    )

    setUsername('')
    setPassword('')

    fetchUsers()
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <main className="
      min-h-screen
      bg-[#212129]
      text-white
      p-10
    ">

      <h1 className="text-4xl font-bold mb-8">
        ADMIN PANEL
      </h1>

      <div className="grid grid-cols-2 gap-8">

        <div className="
          bg-[#323949]
          border
          border-[#40445A]
          rounded-2xl
          p-6
        ">

          <h2 className="text-2xl font-semibold mb-6">
            Create User
          </h2>

          <form
            onSubmit={createUser}
            className="space-y-4"
          >

            <input
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              placeholder="Username"
              className="
                w-full
                bg-[#3D3E51]
                border
                border-[#40445A]
                rounded-xl
                px-4
                py-3
                outline-none
              "
            />

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Password"
              className="
                w-full
                bg-[#3D3E51]
                border
                border-[#40445A]
                rounded-xl
                px-4
                py-3
                outline-none
              "
            />

            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
              }
              className="
                w-full
                bg-[#3D3E51]
                border
                border-[#40445A]
                rounded-xl
                px-4
                py-3
                outline-none
              "
            >
              <option value="agent">
                Agent
              </option>

              <option value="admin">
                Admin
              </option>
            </select>

            <button
              type="submit"
              className="
                w-full
                bg-[#40445A]
                hover:bg-[#50556d]
                rounded-xl
                py-3
                transition
              "
            >
              CREATE USER
            </button>

          </form>

        </div>

        <div className="
          bg-[#323949]
          border
          border-[#40445A]
          rounded-2xl
          p-6
        ">

          <h2 className="text-2xl font-semibold mb-6">
            Users
          </h2>

          <div className="space-y-3">

            {users.map((user) => (

              <div
                key={user.id}
                className="
                  bg-[#3D3E51]
                  rounded-xl
                  p-4
                  border
                  border-[#40445A]
                "
              >

                <p className="font-semibold">
                  {user.username}
                </p>

                <p className="text-sm text-[#B7B7B7]">
                  {user.role}
                </p>

              </div>

            ))}

          </div>

        </div>

      </div>

    </main>
  )
}