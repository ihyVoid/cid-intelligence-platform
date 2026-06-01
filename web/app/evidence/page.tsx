'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'
import { EvidenceBoard } from '@/components/evidence-board-graph'
import { Plus, Settings, Grid3X3 } from 'lucide-react'

interface Board {
  id: string
  name: string
  description: string
  nodeCount: number
  edgeCount: number
  createdAt: string
}

export default function EvidencePage() {
  const [ready, setReady] = useState(false)
  const [boards, setBoards] = useState<Board[]>([])
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('cid_user')
    if (!userStr) {
      window.location.href = '/login'
      return
    }
    setReady(true)
    
    // Load demo boards
    setBoards([
      { id: 'main-case', name: 'Main Investigation', description: 'Primary case evidence network', nodeCount: 6, edgeCount: 7, createdAt: '2026-06-01' },
      { id: 'case-1247', name: 'Operation Thunder', description: 'High priority target network', nodeCount: 12, edgeCount: 18, createdAt: '2026-05-28' },
    ])
  }, [])

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
              <p className='text-[#7E8299] text-sm mt-1'>Interactive visualization of connected evidence and relationships</p>
            </div>
            <div className='flex items-center gap-3'>
              <button className='flex items-center gap-2 px-4 py-2 bg-[#1a1a22] border border-[#2a2a35] rounded-xl text-[#B7B7B7] hover:text-white hover:border-[#3a3a45] transition-all text-sm'>
                <Grid3X3 className='w-4 h-4' />
                All Boards
              </button>
              <button className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl text-white font-medium shadow-lg shadow-red-500/20 transition-all text-sm'>
                <Plus className='w-4 h-4' />
                New Board
              </button>
            </div>
          </div>

          {/* Boards Grid */}
          <div className='grid grid-cols-4 gap-4 mb-6'>
            {boards.map((board) => (
              <button
                key={board.id}
                onClick={() => setSelectedBoard(board.id)}
                className={`bg-gradient-to-br from-[#1a1a22] to-[#25252f] border rounded-2xl p-5 text-left transition-all duration-300 hover:scale-[1.02] ${
                  selectedBoard === board.id ? 'border-red-500 shadow-lg shadow-red-500/20' : 'border-[#2a2a35] hover:border-[#3a3a45]'
                }`}
              >
                <div className='flex items-center justify-between mb-4'>
                  <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20'>
                    <Grid3X3 className='w-5 h-5 text-white' />
                  </div>
                  <Settings className='w-4 h-4 text-[#5a5a6e] hover:text-white transition-colors' />
                </div>
                <h3 className='text-white font-semibold mb-1'>{board.name}</h3>
                <p className='text-[#7E8299] text-xs mb-3 line-clamp-1'>{board.description}</p>
                <div className='flex items-center gap-3 text-xs text-[#5a5a6e]'>
                  <span>{board.nodeCount} nodes</span>
                  <span>•</span>
                  <span>{board.edgeCount} connections</span>
                </div>
              </button>
            ))}
          </div>

          {/* Evidence Board */}
          <div className='bg-gradient-to-br from-[#1a1a22] to-[#12121a] border border-[#2a2a35] rounded-2xl overflow-hidden' style={{ height: 'calc(100vh - 320px)' }}>
            <div className='h-full'>
              <EvidenceBoard boardId={selectedBoard || 'main-case'} />
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
