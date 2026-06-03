'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'
import { 
  Plus, Search, Filter, FolderKanban, Clock, MapPin, 
  User, AlertTriangle, ChevronRight, Loader2, Eye, Trash2,
  ArrowLeft, FileText, X, CheckCircle, Shield
} from 'lucide-react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

interface CaseType {
  id: string
  caseNumber: string
  title: string
  description: string
  type: string
  status: string
  classification: string
  priority: string
  location: string
  date: string
  time: string
  reportingAgent: string
  handler: string
  createdAt: string
  suspects: any[]
  victims: any[]
  witnesses: any[]
  evidences: any[]
}

const statusColors: Record<string, { bg: string, text: string }> = {
  open: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  in_progress: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  closed: { bg: 'bg-green-500/20', text: 'text-green-400' },
  archived: { bg: 'bg-gray-500/20', text: 'text-gray-400' }
}

const priorityColors: Record<string, { bg: string, text: string }> = {
  critical: { bg: 'bg-red-500/20', text: 'text-red-400' },
  high: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  low: { bg: 'bg-green-500/20', text: 'text-green-400' }
}

export default function CasesPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [cases, setCases] = useState<CaseType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [selectedCase, setSelectedCase] = useState<CaseType | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('cid_user')
    if (!userStr) { router.push('/login'); return }
    setReady(true)
    loadCases()
  }, [router])

  const loadCases = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/cases`)
      setCases(response.data.data)
    } catch (error) {
      console.error('Error loading cases:', error)
    }
    setLoading(false)
  }

  const handleDeleteCase = async (id: string) => {
    if (!confirm('Are you sure you want to delete this case?')) return
    try {
      await axios.delete(`${API_URL}/cases/${id}`)
      setCases(cases.filter(c => c.id !== id))
      setSelectedCase(null)
    } catch (error) {
      console.error('Error deleting case:', error)
    }
  }

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus
    const matchesPriority = filterPriority === 'all' || c.priority === filterPriority
    return matchesSearch && matchesStatus && matchesPriority
  })

  if (!ready) return <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center"><div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <main className="flex bg-[#0f0f14] min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 p-6 overflow-auto">
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Cases</h1>
              <p className="text-[#7E8299] text-sm mt-1">Manage all intelligence cases</p>
            </div>
            <button onClick={() => router.push('/cases/new')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2a2a69] to-[#e89a13] hover:opacity-90 rounded-xl text-white font-medium shadow-lg transition-all">
              <Plus className="w-4 h-4" />New Case
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6e]" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cases..." className="w-full pl-10 pr-4 py-2 bg-[#1a1a22] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#e89a13]/50" />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-[#1a1a22] border border-[#2a2a35] rounded-xl text-white text-sm">
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </select>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 bg-[#1a1a22] border border-[#2a2a35] rounded-xl text-white text-sm">
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Cases', value: cases.length, color: 'from-[#2a2a69] to-[#1a1a4a]' },
              { label: 'Open', value: cases.filter(c => c.status === 'open').length, color: 'from-blue-500 to-blue-700' },
              { label: 'In Progress', value: cases.filter(c => c.status === 'in_progress').length, color: 'from-yellow-500 to-yellow-700' },
              { label: 'Closed', value: cases.filter(c => c.status === 'closed').length, color: 'from-green-500 to-green-700' }
            ].map((stat, i) => (
              <div key={i} className={`bg-gradient-to-br ${stat.color} border border-[#2a2a35] rounded-xl p-4`}>
                <p className="text-white font-bold text-2xl">{stat.value}</p>
                <p className="text-white/70 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#e89a13] animate-spin" />
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="text-center py-20">
              <FolderKanban className="w-16 h-16 text-[#5a5a6e] mx-auto mb-4" />
              <p className="text-[#7E8299]">No cases found</p>
              <button onClick={() => router.push('/cases/new')} className="mt-4 px-4 py-2 bg-[#2a2a69] text-white rounded-xl text-sm">Create First Case</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredCases.map(c => {
                const statusStyle = statusColors[c.status] || statusColors.open
                const priorityStyle = priorityColors[c.priority] || priorityColors.medium
                return (
                  <div key={c.id} onClick={() => setSelectedCase(c)}
                    className="bg-gradient-to-br from-[#1a1a22] to-[#12121a] border border-[#2a2a35] rounded-xl p-5 hover:border-[#3a3a45] transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#2a2a69] to-[#e89a13] rounded-xl flex items-center justify-center">
                          <FolderKanban className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{c.title}</h3>
                          <p className="text-[#7E8299] text-xs">{c.caseNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); router.push(`/cases/${c.id}`) }}
                          className="p-1.5 bg-[#2a2a35] hover:bg-blue-500/20 rounded-lg text-[#5a5a6e] hover:text-blue-400">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteCase(c.id) }}
                          className="p-1.5 bg-[#2a2a35] hover:bg-red-500/20 rounded-lg text-[#5a5a6e] hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-[#7E8299] text-sm mb-4 line-clamp-2">{c.description}</p>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`${statusStyle.bg} ${statusStyle.text} text-xs px-2 py-1 rounded-lg capitalize`}>{c.status.replace('_', ' ')}</span>
                      <span className={`${priorityStyle.bg} ${priorityStyle.text} text-xs px-2 py-1 rounded-lg capitalize`}>{c.priority}</span>
                      <span className="bg-[#e89a13]/20 text-[#e89a13] text-xs px-2 py-1 rounded-lg">{c.classification}</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs text-[#7E8299]">
                      <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /><span className="truncate">{c.location || 'N/A'}</span></div>
                      <div className="flex items-center gap-1"><User className="w-3 h-3" /><span className="truncate">{c.reportingAgent}</span></div>
                      <div className="flex items-center gap-1"><Clock className="w-3 h-3" /><span>{new Date(c.createdAt).toLocaleDateString()}</span></div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Case Detail Panel */}
      {selectedCase && (
        <div className="fixed right-0 top-0 bottom-0 w-[500px] bg-[#1a1a22] border-l border-[#2a2a35] shadow-xl z-40 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#2a2a69] to-[#e89a13] rounded-xl flex items-center justify-center">
                  <FolderKanban className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Case Details</h3>
                  <p className="text-[#7E8299] text-xs">{selectedCase.caseNumber}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCase(null)} className="p-2 hover:bg-[#2a2a35] rounded-lg text-[#5a5a6e]"><X className="w-5 h-5" /></button>
            </div>

            <h2 className="text-xl font-bold text-white mb-4">{selectedCase.title}</h2>

            <div className="space-y-4">
              <div className="bg-[#0f0f14] rounded-xl p-4">
                <h4 className="text-[#7E8299] text-xs font-medium uppercase mb-3">Description</h4>
                <p className="text-white text-sm">{selectedCase.description}</p>
              </div>

              <div className="bg-[#0f0f14] rounded-xl p-4">
                <h4 className="text-[#7E8299] text-xs font-medium uppercase mb-3">Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-[#5a5a6e]">Location</p><p className="text-white">{selectedCase.location}</p></div>
                  <div><p className="text-[#5a5a6e]">Date/Time</p><p className="text-white">{selectedCase.date} {selectedCase.time}</p></div>
                  <div><p className="text-[#5a5a6e]">Reporting Agent</p><p className="text-white">{selectedCase.reportingAgent}</p></div>
                  <div><p className="text-[#5a5a6e]">Handler</p><p className="text-white">{selectedCase.handler || 'N/A'}</p></div>
                </div>
              </div>

              {selectedCase.suspects && selectedCase.suspects.length > 0 && (
                <div className="bg-[#0f0f14] rounded-xl p-4">
                  <h4 className="text-[#7E8299] text-xs font-medium uppercase mb-3">Suspects ({selectedCase.suspects.length})</h4>
                  {selectedCase.suspects.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 py-2 border-b border-[#2a2a35] last:border-0">
                      <User className="w-4 h-4 text-red-400" />
                      <span className="text-white text-sm">{s.fullName}</span>
                      <span className={`${s.threatLevel === 'high' ? 'text-red-400' : 'text-yellow-400'} text-xs ml-auto`}>{s.threatLevel}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => router.push(`/cases/${selectedCase.id}`)}
                  className="flex-1 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-blue-400 text-sm font-medium flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" />View Details
                </button>
                <button onClick={() => handleDeleteCase(selectedCase.id)}
                  className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" />Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
