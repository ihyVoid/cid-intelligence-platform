'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'
import { EvidenceBoardFull } from '@/components/evidence-board-full'
import { Plus, Settings, Grid3X3, X, Lock, Loader2, Trash2, ExternalLink } from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

interface Board {
  id: string
  name: string
  description: string
  nodeCount: number
  edgeCount: number
  createdAt: string
}

const MAX_BOARDS_PER_USER = 5

export default function EvidencePage() {
  const [ready, setReady] = useState(false)
  const [boards, setBoards] = useState<Board[]>([])
  const [loadingBoards, setLoadingBoards] = useState(true)
  const [selectedBoard, setSelectedBoard] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')
  const [newBoardDesc, setNewBoardDesc] = useState('')
  const [createError, setCreateError] = useState('')
  const [creating, setCreating] = useState(false)
  const [deletingBoard, setDeletingBoard] = useState<string | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('cid_user')
    if (!userStr) {
      window.location.href = '/login'
      return
    }
    setReady(true)
    loadBoards()
  }, [])

  const loadBoards = async () => {
    setLoadingBoards(true)
    try {
      const response = await axios.get(`${API_URL}/boards`)
      setBoards(response.data)

      // If no boards, create a default one
      if (response.data.length === 0) {
        const newBoard = await axios.post(`${API_URL}/boards`, {
          name: 'Main Investigation',
          description: 'Primary case evidence network'
        })
        setSelectedBoard(newBoard.data.id)
        loadBoards()
      } else {
        // Set selectedBoard to first board's ID if still using default
        setSelectedBoard(response.data[0].id)
      }
    } catch (error) {
      console.error('Error loading boards:', error)
      // Create default board on error
      try {
        const newBoard = await axios.post(`${API_URL}/boards`, {
          name: 'Main Investigation',
          description: 'Primary case evidence network'
        })
        setSelectedBoard(newBoard.data.id)
        loadBoards()
      } catch (e) {
        console.error('Error creating default board:', e)
      }
    }
    setLoadingBoards(false)
  }

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) {
      setCreateError('Board name is required')
      return
    }
    
    if (boards.length >= MAX_BOARDS_PER_USER) {
      setCreateError(`Maximum ${MAX_BOARDS_PER_USER} boards allowed per user`)
      return
    }

    setCreating(true)
    try {
      const response = await axios.post(`${API_URL}/boards`, {
        name: newBoardName.trim(),
        description: newBoardDesc.trim()
      })
      
      if (response.data.error) {
        setCreateError(response.data.error)
      } else {
        setBoards([...boards, response.data])
        setSelectedBoard(response.data.id)
        setNewBoardName('')
        setNewBoardDesc('')
        setShowCreateModal(false)
        setCreateError('')
      }
    } catch (error) {
      setCreateError('Failed to create board')
    }
    setCreating(false)
  }

  const handleDeleteBoard = async (boardId: string) => {
    if (boardId === 'main-case') return
    
    setDeletingBoard(boardId)
    try {
      await axios.delete(`${API_URL}/boards/${boardId}`)
      setBoards(boards.filter(b => b.id !== boardId))
      if (selectedBoard === boardId) {
        const remaining = boards.filter(b => b.id !== boardId)
        setSelectedBoard(remaining.length > 0 ? remaining[0].id : '')
      }
    } catch (error) {
      console.error('Error deleting board:', error)
    }
    setDeletingBoard(null)
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className='flex bg-[#0f0f14] min-h-screen'>
      <Sidebar />
      <div className='flex-1 flex flex-col overflow-hidden'>
        <Topbar />
        <div className='flex-1 p-6 overflow-auto'>
          
          {/* Header */}
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h1 className='text-2xl font-bold text-white'>Evidence Networks</h1>
              <p className='text-[#7E8299] text-sm mt-1'>
                Interactive visualization • {boards.length}/{MAX_BOARDS_PER_USER} boards
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <button 
                onClick={loadBoards}
                className='flex items-center gap-2 px-4 py-2 bg-[#1a1a22] border border-[#2a2a35] rounded-xl text-[#B7B7B7] hover:text-white hover:border-[#3a3a45] transition-all text-sm'
              >
                <Loader2 className={`w-4 h-4 ${loadingBoards ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button 
                onClick={() => setShowCreateModal(true)}
                disabled={boards.length >= MAX_BOARDS_PER_USER}
                className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-700 rounded-xl text-white font-medium shadow-lg shadow-red-500/20 disabled:shadow-none transition-all text-sm'
              >
                <Plus className='w-4 h-4' />
                New Board
                {boards.length >= MAX_BOARDS_PER_USER && <Lock className='w-3 h-3 ml-1' />}
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loadingBoards ? (
            <div className='flex items-center justify-center py-20'>
              <Loader2 className='w-8 h-8 text-red-500 animate-spin' />
              <span className='ml-3 text-[#7E8299]'>Loading boards...</span>
            </div>
          ) : (
            <>
              {/* Boards Grid */}
              <div className='grid grid-cols-4 gap-4 mb-6'>
                {boards.map((board) => (
                  <div
                    key={board.id}
                    className={`bg-gradient-to-br from-[#1a1a22] to-[#25252f] border rounded-2xl p-5 text-left transition-all duration-300 hover:scale-[1.02] ${
                      selectedBoard === board.id 
                        ? 'border-red-500 shadow-lg shadow-red-500/20' 
                        : 'border-[#2a2a35] hover:border-[#3a3a45]'
                    } ${deletingBoard === board.id ? 'opacity-50' : ''}`}
                  >
                    <div className='flex items-center justify-between mb-4'>
                      <button
                        onClick={() => setSelectedBoard(board.id)}
                        className='w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20'
                      >
                        <Grid3X3 className='w-5 h-5 text-white' />
                      </button>
                      {board.id !== 'main-case' && (
                        <div className='flex items-center gap-1'>
                          <button 
                            onClick={() => handleDeleteBoard(board.id)}
                            disabled={deletingBoard === board.id}
                            className='p-1.5 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50'
                          >
                            <Trash2 className='w-4 h-4 text-[#5a5a6e] hover:text-red-400' />
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedBoard(board.id)}
                      className='w-full text-left'
                    >
                      <h3 className='text-white font-semibold mb-1'>{board.name}</h3>
                      <p className='text-[#7E8299] text-xs mb-3 line-clamp-1'>{board.description || 'No description'}</p>
                      <div className='flex items-center gap-3 text-xs text-[#5a5a6e]'>
                        <span>{board.nodeCount} nodes</span>
                        <span>•</span>
                        <span>{board.edgeCount} connections</span>
                      </div>
                    </button>
                  </div>
                ))}
              </div>

              {/* Evidence Board - Limited Size Container */}
              {selectedBoard && (
                <div className='h-[500px] bg-gradient-to-br from-[#1a1a22] to-[#12121a] border border-[#2a2a35] rounded-2xl overflow-hidden'>
                  <div className='w-full h-full'>
                    <EvidenceBoardFull key={selectedBoard} boardId={selectedBoard} />
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* Create Board Modal */}
      {showCreateModal && (
        <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <div className='bg-gradient-to-br from-[#1a1a22] to-[#12121a] border border-[#2a2a35] rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-black/50'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-xl font-bold text-white'>Create New Board</h3>
              <button 
                onClick={() => { setShowCreateModal(false); setCreateError(''); }}
                className='text-[#5a5a6e] hover:text-white transition-colors'
              >
                <X className='w-6 h-6' />
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='text-[#7E8299] text-sm font-medium block mb-2'>Board Name *</label>
                <input 
                  type='text'
                  value={newBoardName}
                  onChange={(e) => { setNewBoardName(e.target.value); setCreateError(''); }}
                  placeholder='e.g., Operation Storm'
                  className='w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-red-500/50 rounded-xl px-4 py-3 text-white outline-none transition-colors'
                  autoFocus
                />
              </div>

              <div>
                <label className='text-[#7E8299] text-sm font-medium block mb-2'>Description</label>
                <textarea 
                  value={newBoardDesc}
                  onChange={(e) => setNewBoardDesc(e.target.value)}
                  placeholder='Describe the purpose of this board...'
                  rows={3}
                  className='w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-red-500/50 rounded-xl px-4 py-3 text-white outline-none transition-colors resize-none'
                />
              </div>

              {createError && (
                <div className='flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3'>
                  <Lock className='w-4 h-4 text-red-400 flex-shrink-0' />
                  <p className='text-red-400 text-sm'>{createError}</p>
                </div>
              )}

              <div className='flex gap-3 pt-2'>
                <button
                  onClick={() => { setShowCreateModal(false); setCreateError(''); }}
                  className='flex-1 py-3 bg-[#2a2a35] hover:bg-[#3a3a45] rounded-xl text-white font-medium transition-colors'
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBoard}
                  disabled={creating}
                  className='flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 rounded-xl text-white font-semibold transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2'
                >
                  {creating ? (
                    <>
                      <Loader2 className='w-4 h-4 animate-spin' />
                      Creating...
                    </>
                  ) : (
                    'Create Board'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
