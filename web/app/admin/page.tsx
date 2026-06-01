'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { 
  Users, 
  Plus, 
  Trash2, 
  Shield, 
  UserCircle, 
  AlertTriangle,
  Search,
  Filter,
  MoreVertical,
  Edit3,
  Crown,
  UserX,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw
} from 'lucide-react'

interface User {
  id: string
  username: string
  role: string
  createdAt: string
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  // Form state
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('agent')
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  async function fetchUsers() {
    setLoading(true)
    try {
      const res = await axios.get('http://localhost:4000/users')
      setUsers(res.data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')
    
    if (!username.trim() || !password.trim()) {
      setFormError('Username and password are required')
      return
    }

    setCreating(true)
    try {
      await axios.post('http://localhost:4000/users', {
        username: username.trim(),
        password,
        role
      })
      setFormSuccess('User created successfully!')
      setUsername('')
      setPassword('')
      setRole('agent')
      fetchUsers()
      
      setTimeout(() => setFormSuccess(''), 3000)
    } catch (error: any) {
      setFormError(error.response?.data?.error || 'Failed to create user')
    } finally {
      setCreating(false)
    }
  }

  async function deleteUser(userId: string) {
    try {
      const res = await axios.delete(`http://localhost:4000/users/${userId}`)
      fetchUsers()
      setShowDeleteModal(false)
      setSelectedUser(null)
    } catch (err: any) {
      console.error('Failed to delete user:', err)
      alert(err.response?.data?.error || 'Failed to delete user')
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    agents: users.filter(u => u.role === 'agent').length
  }

  return (
    <main className="min-h-screen bg-[#0f0f14] text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ADMIN PANEL</h1>
            <p className="text-[#7E8299] text-sm">System Administration & User Management</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#1a1a22] border border-[#2a2a35] rounded-2xl p-5 hover:border-[#3a3a45] transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#7E8299] text-sm mb-1">Total Users</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-[#1a1a22] border border-[#2a2a35] rounded-2xl p-5 hover:border-[#3a3a45] transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#7E8299] text-sm mb-1">Administrators</p>
              <p className="text-3xl font-bold">{stats.admins}</p>
            </div>
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
              <Crown className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>
        <div className="bg-[#1a1a22] border border-[#2a2a35] rounded-2xl p-5 hover:border-[#3a3a45] transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#7E8299] text-sm mb-1">Agents</p>
              <p className="text-3xl font-bold">{stats.agents}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Create User Form */}
        <div className="bg-[#1a1a22] border border-[#2a2a35] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold">Create New User</h2>
          </div>

          <form onSubmit={createUser} className="space-y-4">
            <div>
              <label className="block text-[#B7B7B7] mb-2 text-sm font-medium">USERNAME</label>
              <input
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setFormError('')
                }}
                placeholder="Enter username"
                className="w-full bg-[#2a2a35] border border-[#3a3a45] rounded-xl px-4 py-3 outline-none transition-all focus:border-red-500/50 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]"
              />
            </div>

            <div>
              <label className="block text-[#B7B7B7] mb-2 text-sm font-medium">PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setFormError('')
                }}
                placeholder="Enter password"
                className="w-full bg-[#2a2a35] border border-[#3a3a45] rounded-xl px-4 py-3 outline-none transition-all focus:border-red-500/50 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]"
              />
            </div>

            <div>
              <label className="block text-[#B7B7B7] mb-2 text-sm font-medium">ROLE</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#2a2a35] border border-[#3a3a45] rounded-xl px-4 py-3 outline-none transition-all focus:border-red-500/50 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]"
              >
                <option value="agent">Agent</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{formError}</p>
              </div>
            )}

            {/* Success Message */}
            {formSuccess && (
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                <p className="text-green-400 text-sm">{formSuccess}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={creating}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 transition-all rounded-xl py-3 font-semibold shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
            >
              {creating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  CREATING...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  CREATE USER
                </>
              )}
            </button>
          </form>
        </div>

        {/* Users List */}
        <div className="col-span-2 bg-[#1a1a22] border border-[#2a2a35] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold">All Users</h2>
              <span className="bg-[#2a2a35] text-[#7E8299] px-3 py-1 rounded-full text-sm">
                {filteredUsers.length}
              </span>
            </div>
            <button 
              onClick={fetchUsers}
              className="p-2 hover:bg-[#2a2a35] rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 text-[#7E8299] ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Search & Filter */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5a5a6e]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="w-full bg-[#2a2a35] border border-[#3a3a45] rounded-xl pl-10 pr-4 py-3 outline-none transition-all focus:border-[#4a4a55]"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="bg-[#2a2a35] border border-[#3a3a45] rounded-xl px-4 py-3 outline-none transition-all focus:border-[#4a4a55]"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="agent">Agent</option>
            </select>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-red-500" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <UserX className="w-12 h-12 text-[#3a3a45] mx-auto mb-3" />
              <p className="text-[#5a5a6e]">No users found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[#5a5a6e] text-sm font-medium">
                <div className="col-span-5">USER</div>
                <div className="col-span-3">ROLE</div>
                <div className="col-span-3">CREATED</div>
                <div className="col-span-1"></div>
              </div>
              
              {/* User Rows */}
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="grid grid-cols-12 gap-4 px-4 py-3 bg-[#2a2a35] rounded-xl hover:bg-[#32323f] transition-colors group items-center"
                >
                  <div className="col-span-5 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      user.role === 'admin' 
                        ? 'bg-red-500/10' 
                        : 'bg-blue-500/10'
                    }`}>
                      {user.role === 'admin' ? (
                        <Crown className="w-5 h-5 text-red-400" />
                      ) : (
                        <UserCircle className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{user.username}</p>
                      <p className="text-xs text-[#5a5a6e]">ID: {user.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {user.role === 'admin' ? (
                        <><Shield className="w-3 h-3" /> Admin</>
                      ) : (
                        <><UserCircle className="w-3 h-3" /> Agent</>
                      )}
                    </span>
                  </div>
                  <div className="col-span-3 text-[#7E8299] text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => {
                        setSelectedUser(user)
                        setShowDeleteModal(true)
                      }}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-[#5a5a6e] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a22] border border-[#2a2a35] rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Delete User</h3>
                <p className="text-red-400 text-sm">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-[#B7B7B7] mb-6">
              Are you sure you want to delete user <span className="text-white font-semibold">{selectedUser.username}</span>? 
              This will permanently remove all their access.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedUser(null)
                }}
                className="flex-1 bg-[#2a2a35] hover:bg-[#3a3a45] border border-[#3a3a45] rounded-xl py-3 text-white font-medium transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={() => deleteUser(selectedUser.id)}
                className="flex-1 bg-red-600 hover:bg-red-500 rounded-xl py-3 text-white font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}