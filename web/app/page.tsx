'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'
import { DashboardCard } from '@/components/dashboard-card'
import { EvidenceBoard } from '@/components/evidence-board-graph'
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  AlertTriangle, 
  Activity,
  Users,
  FileText,
  Clock
} from 'lucide-react'

export default function HomePage() {
  const [ready, setReady] = useState(false)
  const [stats, setStats] = useState({
    activeCases: 24,
    evidenceItems: 183,
    activeOperations: 7,
    priorityTargets: 12
  })

  useEffect(() => {
    const userStr = localStorage.getItem('cid_user')
    if (!userStr) {
      window.location.href = '/login'
      return
    }
    try {
      const user = JSON.parse(userStr)
      if (!user || !user.user) {
        window.location.href = '/login'
        return
      }
    } catch (e) {
      window.location.href = '/login'
      return
    }
    setReady(true)
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
          
          {/* Stats Grid */}
          <div className='mb-8'>
            <h2 className='text-2xl font-bold text-white mb-4'>Overview</h2>
            <div className='grid grid-cols-4 gap-4'>
              <div className='bg-gradient-to-br from-[#1a1a22] to-[#25252f] border border-[#2a2a35] rounded-2xl p-6 hover:border-red-500/30 transition-all duration-300 group'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow'>
                    <FileText className='w-6 h-6 text-white' />
                  </div>
                  <div className='flex items-center gap-1 text-green-400 text-sm bg-green-500/10 px-2 py-1 rounded-full'>
                    <TrendingUp className='w-3 h-3' />
                    +12%
                  </div>
                </div>
                <p className='text-4xl font-bold text-white mb-1'>{stats.activeCases}</p>
                <p className='text-[#7E8299] text-sm'>Active Cases</p>
              </div>

              <div className='bg-gradient-to-br from-[#1a1a22] to-[#25252f] border border-[#2a2a35] rounded-2xl p-6 hover:border-red-500/30 transition-all duration-300 group'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow'>
                    <Eye className='w-6 h-6 text-white' />
                  </div>
                  <div className='flex items-center gap-1 text-green-400 text-sm bg-green-500/10 px-2 py-1 rounded-full'>
                    <TrendingUp className='w-3 h-3' />
                    +8%
                  </div>
                </div>
                <p className='text-4xl font-bold text-white mb-1'>{stats.evidenceItems}</p>
                <p className='text-[#7E8299] text-sm'>Evidence Items</p>
              </div>

              <div className='bg-gradient-to-br from-[#1a1a22] to-[#25252f] border border-[#2a2a35] rounded-2xl p-6 hover:border-red-500/30 transition-all duration-300 group'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:shadow-red-500/40 transition-shadow'>
                    <Activity className='w-6 h-6 text-white' />
                  </div>
                  <div className='flex items-center gap-1 text-yellow-400 text-sm bg-yellow-500/10 px-2 py-1 rounded-full'>
                    <Clock className='w-3 h-3' />
                    Live
                  </div>
                </div>
                <p className='text-4xl font-bold text-white mb-1'>{stats.activeOperations}</p>
                <p className='text-[#7E8299] text-sm'>Active Operations</p>
              </div>

              <div className='bg-gradient-to-br from-[#1a1a22] to-[#25252f] border border-[#2a2a35] rounded-2xl p-6 hover:border-red-500/30 transition-all duration-300 group'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow'>
                    <AlertTriangle className='w-6 h-6 text-white' />
                  </div>
                  <div className='flex items-center gap-1 text-red-400 text-sm bg-red-500/10 px-2 py-1 rounded-full'>
                    <TrendingUp className='w-3 h-3' />
                    High
                  </div>
                </div>
                <p className='text-4xl font-bold text-white mb-1'>{stats.priorityTargets}</p>
                <p className='text-[#7E8299] text-sm'>Priority Targets</p>
              </div>
            </div>
          </div>

          {/* Evidence Board Section */}
          <div className='mb-8'>
            <div className='flex items-center justify-between mb-4'>
              <div>
                <h2 className='text-2xl font-bold text-white'>Evidence Network</h2>
                <p className='text-[#7E8299] text-sm mt-1'>Interactive visualization of connected evidence</p>
              </div>
              <div className='flex items-center gap-3'>
                <span className='flex items-center gap-2 text-sm text-[#7E8299]'>
                  <span className='w-2 h-2 bg-green-400 rounded-full animate-pulse' />
                  Live Updates
                </span>
              </div>
            </div>
            <div className='bg-gradient-to-br from-[#1a1a22] to-[#12121a] border border-[#2a2a35] rounded-2xl overflow-hidden'>
              <div className='h-[500px]'>
                <EvidenceBoard />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className='grid grid-cols-3 gap-6'>
            <div className='col-span-2 bg-gradient-to-br from-[#1a1a22] to-[#25252f] border border-[#2a2a35] rounded-2xl p-6'>
              <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
                <Users className='w-5 h-5 text-blue-400' />
                Recent Activity
              </h3>
              <div className='space-y-3'>
                {[
                  { time: '2 min ago', action: 'New evidence added', user: 'Agent Chen', type: 'evidence' },
                  { time: '5 min ago', action: 'Target profile updated', user: 'Agent Miller', type: 'profile' },
                  { time: '12 min ago', action: 'Case status changed', user: 'Admin Smith', type: 'case' },
                  { time: '18 min ago', action: 'Connection established', user: 'Agent Davis', type: 'network' },
                  { time: '25 min ago', action: 'Intelligence report filed', user: 'Agent Wilson', type: 'report' },
                ].map((item, i) => (
                  <div key={i} className='flex items-center justify-between p-3 bg-[#0f0f14] rounded-xl border border-[#2a2a35] hover:border-[#3a3a45] transition-colors'>
                    <div className='flex items-center gap-3'>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        item.type === 'evidence' ? 'bg-blue-500/20 text-blue-400' :
                        item.type === 'profile' ? 'bg-purple-500/20 text-purple-400' :
                        item.type === 'case' ? 'bg-green-500/20 text-green-400' :
                        item.type === 'network' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {item.type === 'evidence' && <Eye className='w-5 h-5' />}
                        {item.type === 'profile' && <Users className='w-5 h-5' />}
                        {item.type === 'case' && <FileText className='w-5 h-5' />}
                        {item.type === 'network' && <Activity className='w-5 h-5' />}
                        {item.type === 'report' && <FileText className='w-5 h-5' />}
                      </div>
                      <div>
                        <p className='text-white text-sm font-medium'>{item.action}</p>
                        <p className='text-[#7E8299] text-xs'>{item.user}</p>
                      </div>
                    </div>
                    <span className='text-[#5a5a6e] text-xs'>{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className='bg-gradient-to-br from-[#1a1a22] to-[#25252f] border border-[#2a2a35] rounded-2xl p-6'>
              <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
                <AlertTriangle className='w-5 h-5 text-orange-400' />
                Alerts
              </h3>
              <div className='space-y-3'>
                {[
                  { level: 'high', text: '3 targets require immediate attention' },
                  { level: 'medium', text: 'New connection detected in Case #1247' },
                  { level: 'low', text: 'System backup completed' },
                ].map((alert, i) => (
                  <div key={i} className={`p-3 rounded-xl border ${
                    alert.level === 'high' ? 'bg-red-500/10 border-red-500/30' :
                    alert.level === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                    'bg-green-500/10 border-green-500/30'
                  }`}>
                    <p className={`text-sm ${
                      alert.level === 'high' ? 'text-red-400' :
                      alert.level === 'medium' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>{alert.text}</p>
                  </div>
                ))}
              </div>
              <button className='w-full mt-4 py-3 bg-[#0f0f14] border border-[#2a2a35] rounded-xl text-[#7E8299] hover:text-white hover:border-[#3a3a45] transition-all text-sm'>
                View All Alerts
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
