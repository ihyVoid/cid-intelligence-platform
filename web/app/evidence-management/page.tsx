'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'
import { EvidenceViewer3D, generateWeaponHotspots, generateCarHotspots } from '@/components/evidence-viewer-3d'
import { 
  Plus, Search, Filter, Crosshair, Car, Image as ImageIcon, FileText, 
  Trash2, Eye, X, Loader2, Grid3X3, List, Package
} from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

type EvidenceType = 'weapon' | 'car' | 'image' | 'document'

interface Evidence {
  id: string
  caseId: string
  title: string
  description: string
  evidenceType: EvidenceType
  classification: string
  createdAt: string
  weapon?: any
  car?: any
  imageEvidence?: any
  document?: any
}

const typeIcons = { weapon: Crosshair, car: Car, image: ImageIcon, document: FileText }
const typeColors = {
  weapon: { bg: 'from-red-500 to-red-700', text: 'text-red-400' },
  car: { bg: 'from-blue-500 to-blue-700', text: 'text-blue-400' },
  image: { bg: 'from-purple-500 to-purple-700', text: 'text-purple-400' },
  document: { bg: 'from-yellow-500 to-yellow-700', text: 'text-yellow-400' }
}

export default function EvidenceManagementPage() {
  const [ready, setReady] = useState(false)
  const [evidences, setEvidences] = useState<Evidence[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<EvidenceType | 'all'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [show3DViewer, setShow3DViewer] = useState(false)
  const [newEvidence, setNewEvidence] = useState({
    type: 'weapon' as EvidenceType, title: '', description: '', caseId: '', classification: 'CONFIDENTIAL'
  })

  useEffect(() => {
    const userStr = localStorage.getItem('cid_user')
    if (!userStr) { window.location.href = '/login'; return }
    setReady(true)
    loadEvidences()
  }, [])

  const loadEvidences = async () => {
    setLoading(true)
    try {
      const [weapons, cars, images, documents] = await Promise.all([
        axios.get(`${API_URL}/evidence/weapons`).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/evidence/cars`).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/evidence/images`).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/evidence/documents`).catch(() => ({ data: { data: [] } }))
      ])
      const allEvidence: Evidence[] = []
      weapons.data.data.forEach((w: any) => allEvidence.push({ ...w.evidence, weapon: w, evidenceType: 'weapon' }))
      cars.data.data.forEach((c: any) => allEvidence.push({ ...c.evidence, car: c, evidenceType: 'car' }))
      images.data.data.forEach((img: any) => allEvidence.push({ ...img.evidence, imageEvidence: img, evidenceType: 'image' }))
      documents.data.data.forEach((doc: any) => allEvidence.push({ ...doc.evidence, document: doc, evidenceType: 'document' }))
      setEvidences(allEvidence)
    } catch (error) { console.error('Error loading:', error) }
    setLoading(false)
  }

  const handleAddEvidence = async () => {
    try {
      const response = await axios.post(`${API_URL}/evidence/${newEvidence.type}s`, newEvidence)
      if (response.data.data) setEvidences([...evidences, response.data.data])
      setShowAddModal(false)
      setNewEvidence({ type: 'weapon', title: '', description: '', caseId: '', classification: 'CONFIDENTIAL' })
      loadEvidences()
    } catch (error) { console.error('Error adding:', error) }
  }

  const handleDeleteEvidence = async (evidence: Evidence) => {
    if (!confirm('Delete this evidence?')) return
    try {
      let endpoint = `${API_URL}/evidence/${evidence.evidenceType}s/`
      if (evidence.weapon) endpoint += evidence.weapon.id
      else if (evidence.car) endpoint += evidence.car.id
      else if (evidence.imageEvidence) endpoint += evidence.imageEvidence.id
      else if (evidence.document) endpoint += evidence.document.id
      await axios.delete(endpoint)
      setEvidences(evidences.filter(e => e.id !== evidence.id))
      setSelectedEvidence(null)
    } catch (error) { console.error('Error deleting:', error) }
  }

  const filteredEvidences = evidences.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || e.evidenceType === filterType
    return matchesSearch && matchesType
  })

  const getHotspots = (evidence: Evidence) => {
    if (evidence.evidenceType === 'weapon' && evidence.weapon) return generateWeaponHotspots(evidence.weapon, evidence.weapon.weaponType || 'pistol')
    if (evidence.evidenceType === 'car' && evidence.car) return generateCarHotspots(evidence.car)
    return []
  }

  if (!ready) return <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center"><div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <main className="flex bg-[#0f0f14] min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Evidence Management</h1>
              <p className="text-[#7E8299] text-sm mt-1">Manage all evidence with 3D visualization</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} className="p-2 bg-[#1a1a22] border border-[#2a2a35] rounded-xl text-[#B7B7B7] hover:text-white transition-all">
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
              </button>
              <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl text-white font-medium shadow-lg shadow-red-500/20 transition-all">
                <Plus className="w-4 h-4" />Add Evidence
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6e]" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search evidence..." className="w-full pl-10 pr-4 py-2 bg-[#1a1a22] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-red-500/50" />
            </div>
            <div className="flex items-center gap-2">
              {(['all', 'weapon', 'car', 'image', 'document'] as const).map(type => {
                const Icon = type === 'all' ? Filter : typeIcons[type as EvidenceType]
                return (
                  <button key={type} onClick={() => setFilterType(type)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterType === type ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-[#1a1a22] border border-[#2a2a35] text-[#7E8299] hover:border-[#3a3a45]'}`}>
                    <Icon className="w-4 h-4" /><span className="capitalize">{type}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            {(['weapon', 'car', 'image', 'document'] as const).map(type => {
              const Icon = typeIcons[type]
              const colors = typeColors[type]
              return (
                <div key={type} className="bg-gradient-to-br from-[#1a1a22] to-[#25252f] border border-[#2a2a35] rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${colors.bg}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{evidences.filter(e => e.evidenceType === type).length}</p>
                      <p className="text-[#7E8299] text-xs capitalize">{type}s</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
              <span className="ml-3 text-[#7E8299]">Loading evidence...</span>
            </div>
          ) : filteredEvidences.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-[#1a1a22] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-[#5a5a6e]" />
              </div>
              <p className="text-[#7E8299]">No evidence found</p>
              <button onClick={() => setShowAddModal(true)} className="mt-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm font-medium">Add First Evidence</button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-3 gap-4">
              {filteredEvidences.map(evidence => {
                const Icon = typeIcons[evidence.evidenceType]
                const colors = typeColors[evidence.evidenceType]
                return (
                  <div key={evidence.id} onClick={() => setSelectedEvidence(evidence)}
                    className="bg-gradient-to-br from-[#1a1a22] to-[#25252f] border border-[#2a2a35] rounded-xl p-4 hover:border-[#3a3a45] transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${colors.bg}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {(evidence.evidenceType === 'weapon' || evidence.evidenceType === 'car') && (
                          <button onClick={(e) => { e.stopPropagation(); setSelectedEvidence(evidence); setShow3DViewer(true) }}
                            className="p-1.5 bg-[#2a2a35] hover:bg-blue-500/20 rounded-lg text-[#5a5a6e] hover:text-blue-400">
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteEvidence(evidence) }}
                          className="p-1.5 bg-[#2a2a35] hover:bg-red-500/20 rounded-lg text-[#5a5a6e] hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-white font-semibold mb-1 truncate">{evidence.title}</h3>
                    <p className="text-[#7E8299] text-xs mb-3 line-clamp-2">{evidence.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`${colors.text} text-[10px] uppercase tracking-wider font-medium`}>{evidence.evidenceType}</span>
                      <span className="text-[#5a5a6e] text-[10px]">{new Date(evidence.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-[#1a1a22] border border-[#2a2a35] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#0f0f14] border-b border-[#2a2a35]">
                  <tr>
                    <th className="text-left px-4 py-3 text-[#7E8299] text-xs font-medium uppercase">Type</th>
                    <th className="text-left px-4 py-3 text-[#7E8299] text-xs font-medium uppercase">Title</th>
                    <th className="text-left px-4 py-3 text-[#7E8299] text-xs font-medium uppercase">Classification</th>
                    <th className="text-left px-4 py-3 text-[#7E8299] text-xs font-medium uppercase">Created</th>
                    <th className="text-right px-4 py-3 text-[#7E8299] text-xs font-medium uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvidences.map(evidence => {
                    const Icon = typeIcons[evidence.evidenceType]
                    const colors = typeColors[evidence.evidenceType]
                    return (
                      <tr key={evidence.id} onClick={() => setSelectedEvidence(evidence)} className="border-b border-[#2a2a35] hover:bg-[#25252f] cursor-pointer">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${colors.bg}`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <span className={`${colors.text} text-xs capitalize font-medium`}>{evidence.evidenceType}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-white text-sm">{evidence.title}</td>
                        <td className="px-4 py-3"><span className="px-2 py-1 bg-red-500/20 text-red-400 text-[10px] rounded-lg">{evidence.classification}</span></td>
                        <td className="px-4 py-3 text-[#7E8299] text-sm">{new Date(evidence.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {(evidence.evidenceType === 'weapon' || evidence.evidenceType === 'car') && (
                              <button onClick={(e) => { e.stopPropagation(); setSelectedEvidence(evidence); setShow3DViewer(true) }}
                                className="p-1.5 hover:bg-blue-500/20 rounded-lg text-[#5a5a6e] hover:text-blue-400"><Eye className="w-4 h-4" /></button>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteEvidence(evidence) }}
                              className="p-1.5 hover:bg-red-500/20 rounded-lg text-[#5a5a6e] hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {show3DViewer && selectedEvidence && (
        <EvidenceViewer3D evidenceType={selectedEvidence.evidenceType} weaponType={selectedEvidence.weapon?.weaponType}
          hotspots={getHotspots(selectedEvidence)} onClose={() => { setShow3DViewer(false); setSelectedEvidence(null) }} />
      )}

      {selectedEvidence && !show3DViewer && (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-[#1a1a22] border-l border-[#2a2a35] shadow-xl z-40 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              {(() => {
                const Icon = typeIcons[selectedEvidence.evidenceType]
                const colors = typeColors[selectedEvidence.evidenceType]
                return (
                  <>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${colors.bg}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold capitalize">{selectedEvidence.evidenceType}</h3>
                        <p className="text-[#7E8299] text-xs">Evidence Details</p>
                      </div>
                    </div>
                  </>
                )
              })()}
              <button onClick={() => setSelectedEvidence(null)} className="p-2 hover:bg-[#2a2a35] rounded-lg text-[#5a5a6e]"><X className="w-5 h-5" /></button>
            </div>

            <h2 className="text-xl font-bold text-white mb-4">{selectedEvidence.title}</h2>
            <div className="space-y-4">
              <div className="bg-[#0f0f14] rounded-xl p-4">
                <h4 className="text-[#7E8299] text-xs font-medium uppercase mb-3">Description</h4>
                <p className="text-white text-sm">{selectedEvidence.description}</p>
              </div>

              {selectedEvidence.weapon && (
                <div className="bg-[#0f0f14] rounded-xl p-4">
                  <h4 className="text-[#7E8299] text-xs font-medium uppercase mb-3">Weapon Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div><p className="text-[#5a5a6e] text-xs">Type</p><p className="text-white text-sm capitalize">{selectedEvidence.weapon.weaponType}</p></div>
                    <div><p className="text-[#5a5a6e] text-xs">Brand</p><p className="text-white text-sm">{selectedEvidence.weapon.brand || 'Unknown'}</p></div>
                    <div><p className="text-[#5a5a6e] text-xs">Serial Number</p><p className="text-white text-sm">{selectedEvidence.weapon.serialNumber || 'Unknown'}</p></div>
                    <div><p className="text-[#5a5a6e] text-xs">Caliber</p><p className="text-white text-sm">{selectedEvidence.weapon.caliber || 'Unknown'}</p></div>
                  </div>
                  <button onClick={() => setShow3DViewer(true)} className="mt-4 w-full py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-blue-400 text-sm font-medium flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />View 3D Model
                  </button>
                </div>
              )}

              {selectedEvidence.car && (
                <div className="bg-[#0f0f14] rounded-xl p-4">
                  <h4 className="text-[#7E8299] text-xs font-medium uppercase mb-3">Vehicle Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div><p className="text-[#5a5a6e] text-xs">Make</p><p className="text-white text-sm">{selectedEvidence.car.make || 'Unknown'}</p></div>
                    <div><p className="text-[#5a5a6e] text-xs">Model</p><p className="text-white text-sm">{selectedEvidence.car.model || 'Unknown'}</p></div>
                    <div><p className="text-[#5a5a6e] text-xs">Plate</p><p className="text-white text-sm">{selectedEvidence.car.plateNumber || 'Unknown'}</p></div>
                    <div><p className="text-[#5a5a6e] text-xs">Color</p><p className="text-white text-sm">{selectedEvidence.car.color || 'Unknown'}</p></div>
                  </div>
                  <button onClick={() => setShow3DViewer(true)} className="mt-4 w-full py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-blue-400 text-sm font-medium flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />View 3D Model
                  </button>
                </div>
              )}

              <div className="bg-[#0f0f14] rounded-xl p-4">
                <h4 className="text-[#7E8299] text-xs font-medium uppercase mb-3">Metadata</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-[#5a5a6e]">Classification</span><span className="text-red-400">{selectedEvidence.classification}</span></div>
                  <div className="flex justify-between"><span className="text-[#5a5a6e]">Created</span><span className="text-white">{new Date(selectedEvidence.createdAt).toLocaleString()}</span></div>
                </div>
              </div>

              <button onClick={() => handleDeleteEvidence(selectedEvidence)}
                className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium flex items-center justify-center gap-2">
                <Trash2 className="w-4 h-4" />Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#1a1a22] to-[#12121a] border border-[#2a2a35] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Add New Evidence</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#5a5a6e] hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[#7E8299] text-sm font-medium block mb-2">Evidence Type *</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['weapon', 'car', 'image', 'document'] as const).map(type => {
                    const Icon = typeIcons[type]
                    const colors = typeColors[type]
                    return (
                      <button key={type} onClick={() => setNewEvidence({ ...newEvidence, type })}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${newEvidence.type === type ? `border-red-500 bg-red-500/10 ${colors.text}` : 'border-[#2a2a35] text-[#7E8299] hover:border-[#3a3a45]'}`}>
                        <Icon className="w-5 h-5" /><span className="text-xs capitalize">{type}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="text-[#7E8299] text-sm font-medium block mb-2">Title *</label>
                <input type="text" value={newEvidence.title} onChange={(e) => setNewEvidence({ ...newEvidence, title: e.target.value })}
                  placeholder="Evidence title..." className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-red-500/50 rounded-xl px-4 py-3 text-white outline-none" autoFocus />
              </div>
              <div>
                <label className="text-[#7E8299] text-sm font-medium block mb-2">Description</label>
                <textarea value={newEvidence.description} onChange={(e) => setNewEvidence({ ...newEvidence, description: e.target.value })}
                  placeholder="Evidence description..." rows={3} className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-red-500/50 rounded-xl px-4 py-3 text-white outline-none resize-none" />
              </div>
              <div>
                <label className="text-[#7E8299] text-sm font-medium block mb-2">Case ID *</label>
                <input type="text" value={newEvidence.caseId} onChange={(e) => setNewEvidence({ ...newEvidence, caseId: e.target.value })}
                  placeholder="Case ID..." className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-red-500/50 rounded-xl px-4 py-3 text-white outline-none" />
              </div>
              <button onClick={handleAddEvidence} disabled={!newEvidence.title.trim() || !newEvidence.caseId.trim()}
                className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-semibold shadow-lg shadow-red-500/20">
                Add Evidence
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}