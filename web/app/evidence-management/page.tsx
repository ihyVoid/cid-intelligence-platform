'use client'

import { useEffect, useState, useMemo } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'
import { EvidenceViewer3D } from '@/components/evidence-viewer-3d'
import { 
  Plus, Search, Crosshair, Car, Image as ImageIcon, FileText, 
  Trash2, Eye, X, Loader2, Package, RotateCcw, ChevronRight, Check
} from 'lucide-react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

type EvidenceType = 'weapon' | 'car' | 'image' | 'document'

interface Case {
  id: string
  title: string
  caseNumber: string
}

interface Evidence {
  id: string
  caseId: string
  title: string
  description: string
  evidenceType: EvidenceType
  classification: string
  priority: string
  createdAt: string
  weapon?: WeaponData
  car?: CarData
  imageEvidence?: ImageData
  document?: DocumentData
}

interface WeaponData {
  id: string
  weaponType: 'pistol' | 'rifle'
  model: string
  serialNumber: string
  owner: string
  organ: boolean
  brand: string
  caliber: string
}

interface CarData {
  id: string
  plateNumber: string
  owner: string
  color: string
  model: string
  make: string
}

interface ImageData {
  id: string
  imageUrl: string
  imageTitle: string
  description: string
}

interface DocumentData {
  id: string
  title: string
  description: string
  customFields?: string
}

const typeIcons = { weapon: Crosshair, car: Car, image: ImageIcon, document: FileText }
const typeColors = {
  weapon: { bg: 'from-red-500 to-red-700', text: 'text-red-400', border: 'border-red-500/30' },
  car: { bg: 'from-blue-500 to-blue-700', text: 'text-blue-400', border: 'border-blue-500/30' },
  image: { bg: 'from-purple-500 to-purple-700', text: 'text-purple-400', border: 'border-purple-500/30' },
  document: { bg: 'from-yellow-500 to-yellow-700', text: 'text-yellow-400', border: 'border-yellow-500/30' }
}

export default function EvidenceManagementPage() {
  const [ready, setReady] = useState(false)
  const [evidences, setEvidences] = useState<Evidence[]>([])
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<EvidenceType | 'all'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [modalType, setModalType] = useState<EvidenceType>('weapon')
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null)
  const [show3DViewer, setShow3DViewer] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [caseSearchQuery, setCaseSearchQuery] = useState('')
  const [showCaseDropdown, setShowCaseDropdown] = useState(false)

  const [weaponForm, setWeaponForm] = useState({
    weaponType: 'pistol' as 'pistol' | 'rifle',
    model: '', serialNumber: '', owner: '', brand: '', caliber: '', caseId: '', title: '',
    classification: 'CONFIDENTIAL', priority: 'MEDIUM'
  })

  const [carForm, setCarForm] = useState({
    plateNumber: '', owner: '', color: '', model: '', make: '', caseId: '', title: '',
    vehicleType: '', classification: 'CONFIDENTIAL', priority: 'MEDIUM'
  })

  const [imageForm, setImageForm] = useState({
    imageUrl: '', imageTitle: '', description: '', caseId: '', title: '',
    classification: 'CONFIDENTIAL', priority: 'MEDIUM'
  })

  const [documentForm, setDocumentForm] = useState({
    title: '', description: '', customFields: '', caseId: '',
    classification: 'CONFIDENTIAL', priority: 'MEDIUM'
  })

  const [editingEvidence, setEditingEvidence] = useState<Evidence | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('cid_user')
    if (!userStr) { window.location.href = '/login'; return }
    setReady(true)
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [weapons, cars, images, documents, casesRes] = await Promise.all([
        axios.get(`${API_URL}/evidence/weapons`).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/evidence/cars`).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/evidence/images`).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/evidence/documents`).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/cases`).catch(() => ({ data: { data: [] } }))
      ])
      
      const allEvidence: Evidence[] = []
      weapons.data.data.forEach((w: any) => allEvidence.push({ ...w.evidence, weapon: { ...w, id: w.id }, evidenceType: 'weapon' }))
      cars.data.data.forEach((c: any) => allEvidence.push({ ...c.evidence, car: { ...c, id: c.id }, evidenceType: 'car' }))
      images.data.data.forEach((img: any) => allEvidence.push({ ...img.evidence, imageEvidence: { ...img, id: img.id }, evidenceType: 'image' }))
      documents.data.data.forEach((doc: any) => allEvidence.push({ ...doc.evidence, document: { ...doc, id: doc.id }, evidenceType: 'document' }))
      
      setEvidences(allEvidence)
      setCases(casesRes.data.data || [])
    } catch (error) { console.error('Error loading:', error) }
    setLoading(false)
  }

  const handleAddWeapon = async () => {
    if (!weaponForm.title.trim() || !weaponForm.caseId.trim()) return
    try {
      await axios.post(`${API_URL}/evidence/weapon`, {
        caseId: weaponForm.caseId, title: weaponForm.title,
        description: `Type: ${weaponForm.weaponType}\nModel: ${weaponForm.model}\nSerial: ${weaponForm.serialNumber}\nOwner: ${weaponForm.owner}\nBrand: ${weaponForm.brand}\nCaliber: ${weaponForm.caliber}`,
        classification: weaponForm.classification, priority: weaponForm.priority,
        weaponType: weaponForm.weaponType, model: weaponForm.model, serialNumber: weaponForm.serialNumber,
        owner: weaponForm.owner, brand: weaponForm.brand, caliber: weaponForm.caliber
      })
      setSuccessMessage(`${weaponForm.weaponType.toUpperCase()} added successfully!`)
      setShowSuccessModal(true)
      setShowAddModal(false)
      resetForms()
      loadData()
    } catch (error: any) { 
      console.error('Error adding weapon:', error)
      alert('Error: ' + (error.response?.data?.error || error.message))
    }
  }

  const handleAddCar = async () => {
    if (!carForm.title.trim() || !carForm.caseId.trim()) return
    try {
      await axios.post(`${API_URL}/evidence/car`, {
        caseId: carForm.caseId, title: carForm.title,
        description: `Plate: ${carForm.plateNumber}\nOwner: ${carForm.owner}\nColor: ${carForm.color}\nModel: ${carForm.model}\nMake: ${carForm.make}`,
        classification: carForm.classification, priority: carForm.priority,
        plateNumber: carForm.plateNumber, owner: carForm.owner, color: carForm.color, 
        model: carForm.model, make: carForm.make, vehicleType: carForm.vehicleType
      })
      setSuccessMessage('Car evidence added successfully!')
      setShowSuccessModal(true)
      setShowAddModal(false)
      resetForms()
      loadData()
    } catch (error: any) { 
      console.error('Error adding car:', error)
      alert('Error: ' + (error.response?.data?.error || error.message))
    }
  }

  const handleAddImage = async () => {
    if (!imageForm.title.trim() || !imageForm.caseId.trim()) return
    try {
      await axios.post(`${API_URL}/evidence/image`, {
        caseId: imageForm.caseId, title: imageForm.title, description: imageForm.description,
        imageUrl: imageForm.imageUrl, imageTitle: imageForm.imageTitle, classification: 'CONFIDENTIAL'
      })
      setSuccessMessage('Image evidence added successfully!')
      setShowSuccessModal(true)
      setShowAddModal(false)
      resetForms()
      loadData()
    } catch (error) { console.error('Error adding image:', error) }
  }

  const handleAddDocument = async () => {
    if (!documentForm.title.trim() || !documentForm.caseId.trim()) return
    try {
      await axios.post(`${API_URL}/evidence/document`, {
        caseId: documentForm.caseId, title: documentForm.title, description: documentForm.description,
        customFields: documentForm.customFields, classification: 'CONFIDENTIAL'
      })
      setSuccessMessage('Document evidence added successfully!')
      setShowSuccessModal(true)
      setShowAddModal(false)
      resetForms()
      loadData()
    } catch (error) { console.error('Error adding document:', error) }
  }

  const resetForms = () => {
    setWeaponForm({ weaponType: 'pistol', model: '', serialNumber: '', owner: '', brand: '', caliber: '', caseId: '', title: '', classification: 'CONFIDENTIAL', priority: 'MEDIUM' })
    setCarForm({ plateNumber: '', owner: '', color: '', model: '', make: '', caseId: '', title: '', vehicleType: '', classification: 'CONFIDENTIAL', priority: 'MEDIUM' })
    setImageForm({ imageUrl: '', imageTitle: '', description: '', caseId: '', title: '', classification: 'CONFIDENTIAL', priority: 'MEDIUM' })
    setDocumentForm({ title: '', description: '', customFields: '', caseId: '', classification: 'CONFIDENTIAL', priority: 'MEDIUM' })
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

  const filteredCases = cases.filter(c => 
    c.title.toLowerCase().includes(caseSearchQuery.toLowerCase()) || c.caseNumber.toLowerCase().includes(caseSearchQuery.toLowerCase())
  )

  const get3DModel = (evidence: Evidence) => {
    if (evidence.evidenceType === 'weapon' && evidence.weapon) return evidence.weapon.weaponType === 'rifle' ? '/rifle.glb' : '/pistol.glb'
    if (evidence.evidenceType === 'car') return '/car.glb'
    return null
  }

  const stats = useMemo(() => ({
    weapons: evidences.filter(e => e.evidenceType === 'weapon').length,
    cars: evidences.filter(e => e.evidenceType === 'car').length,
    images: evidences.filter(e => e.evidenceType === 'image').length,
    documents: evidences.filter(e => e.evidenceType === 'document').length
  }), [evidences])

  if (!ready) return (
    <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <main className="flex bg-[#0f0f14] min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Evidence Management</h1>
              <p className="text-[#7E8299] text-sm mt-1">Manage all evidence with interactive 3D visualization</p>
            </div>
            <button onClick={() => { setShowAddModal(true); setModalType('weapon') }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl text-white font-medium shadow-lg shadow-red-500/20 transition-all">
              <Plus className="w-4 h-4" />Add Evidence
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { type: 'weapons', count: stats.weapons, icon: Crosshair, color: 'from-red-500 to-red-700', label: 'Weapons' },
              { type: 'cars', count: stats.cars, icon: Car, color: 'from-blue-500 to-blue-700', label: 'Vehicles' },
              { type: 'images', count: stats.images, icon: ImageIcon, color: 'from-purple-500 to-purple-700', label: 'Images' },
              { type: 'documents', count: stats.documents, icon: FileText, color: 'from-yellow-500 to-yellow-700', label: 'Documents' }
            ].map(stat => (
              <div key={stat.type} className="bg-gradient-to-br from-[#1a1a22] to-[#12121a] border border-[#2a2a35] rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stat.count}</p>
                    <p className="text-[#7E8299] text-xs">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6e]" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="Search evidence..." 
                className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a22] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-red-500/50" />
            </div>
            <div className="flex items-center gap-2">
              {(['all', 'weapon', 'car', 'image', 'document'] as const).map(type => {
                const Icon = type === 'all' ? Package : typeIcons[type as EvidenceType]
                return (
                  <button key={type} onClick={() => setFilterType(type)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterType === type ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-[#1a1a22] border border-[#2a2a35] text-[#7E8299] hover:border-[#3a3a45]'}`}>
                    <Icon className="w-4 h-4" /><span className="capitalize">{type}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            </div>
          ) : filteredEvidences.length === 0 ? (
            <div className="bg-gradient-to-br from-[#1a1a22] to-[#12121a] border border-[#2a2a35] rounded-xl p-12 text-center">
              <Package className="w-16 h-16 text-[#3a3a45] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Evidence Found</h3>
              <p className="text-[#7E8299] mb-6">Start by adding your first piece of evidence</p>
              <button onClick={() => setShowAddModal(true)} className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-400 font-medium">
                Add First Evidence
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filteredEvidences.map((evidence, index) => {
                const colors = typeColors[evidence.evidenceType]
                const Icon = typeIcons[evidence.evidenceType]
                return (
                  <motion.div key={evidence.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                    className="bg-gradient-to-br from-[#1a1a22] to-[#12121a] border border-[#2a2a35] rounded-xl p-5 hover:border-[#3a3a45] transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-xs text-[#5a5a6e] uppercase">{evidence.evidenceType}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-red-400 transition-colors">{evidence.title}</h3>
                    <p className="text-[#7E8299] text-sm mb-4 line-clamp-2">{evidence.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-[#2a2a35]">
                      <span className="text-xs text-[#5a5a6e]">{new Date(evidence.createdAt).toLocaleDateString()}</span>
                      <div className="flex gap-2">
                        {(evidence.evidenceType === 'weapon' || evidence.evidenceType === 'car') && (
                          <button onClick={() => { setSelectedEvidence(evidence); setShow3DViewer(true) }}
                            className="p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-colors" title="View 3D">
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => setSelectedEvidence(evidence)}
                          className="p-2 bg-[#2a2a35] hover:bg-[#3a3a45] rounded-lg text-[#7E8299] transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {show3DViewer && selectedEvidence && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-8">
            <div className="w-full max-w-5xl h-full bg-gradient-to-br from-[#1a1a22] to-[#12121a] border border-[#2a2a35] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-[#2a2a35]">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${typeColors[selectedEvidence.evidenceType].bg} flex items-center justify-center`}>
                    {(() => {
                    const IconComponent = typeIcons[selectedEvidence.evidenceType]
                    return IconComponent ? <IconComponent className="w-5 h-5 text-white" /> : null
                  })()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">3D Evidence Viewer</h3>
                    <p className="text-[#7E8299] text-xs">{selectedEvidence.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setShow3DViewer(false)} className="p-2 bg-[#2a2a35] hover:bg-[#3a3a45] rounded-xl text-white">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button onClick={() => setShow3DViewer(false)} className="p-2 bg-[#2a2a35] hover:bg-[#3a3a45] rounded-xl text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="h-[calc(100%-64px)]">
                <EvidenceViewer3D 
                  evidenceType={selectedEvidence.evidenceType}
                  weaponType={selectedEvidence.weapon?.weaponType === 'rifle' ? 'rifle' : 'pistol'}
                  hotspots={[
                    { position: [0, 0, 0.5], label: 'Point 1', details: { 'Info': 'Primary inspection point' } },
                    { position: [0.3, 0.2, 0.3], label: 'Point 2', details: { 'Info': 'Secondary details' } },
                    { position: [-0.2, -0.1, 0.4], label: 'Point 3', details: { 'Info': 'Additional information' } },
                  ]}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gradient-to-br from-[#1a1a22] to-[#12121a] border border-[#2a2a35] rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Add New Evidence</h3>
                <button onClick={() => { setShowAddModal(false); resetForms() }} className="text-[#5a5a6e] hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <label className="text-[#7E8299] text-sm font-medium block mb-3">Evidence Type *</label>
                <div className="grid grid-cols-4 gap-3">
                  {(['weapon', 'car', 'image', 'document'] as const).map(type => {
                    const Icon = typeIcons[type]
                    const colors = typeColors[type]
                    return (
                      <button key={type} onClick={() => setModalType(type)}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${modalType === type ? `border-red-500 bg-red-500/10 ${colors.text}` : 'border-[#2a2a35] text-[#7E8299] hover:border-[#3a3a45]'}`}>
                        <Icon className="w-6 h-6" /><span className="text-sm capitalize font-medium">{type}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mb-6 relative">
                <label className="text-[#7E8299] text-sm font-medium block mb-2">Case *</label>
                <div className="relative">
                  <input type="text" value={caseSearchQuery} onChange={(e) => setCaseSearchQuery(e.target.value)}
                    onFocus={() => setShowCaseDropdown(true)} placeholder="Search or select a case..."
                    className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-red-500/50 rounded-xl px-4 py-3 text-white outline-none" />
                  {showCaseDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a22] border border-[#2a2a35] rounded-xl max-h-48 overflow-y-auto z-10">
                      {filteredCases.length === 0 ? (
                        <div className="p-4 text-[#5a5a6e] text-sm text-center">No cases found</div>
                      ) : (
                        filteredCases.map(c => (
                          <button key={c.id} onClick={() => {
                            setCaseSearchQuery(c.title)
                            const setter = modalType === 'weapon' ? setWeaponForm : modalType === 'car' ? setCarForm : modalType === 'image' ? setImageForm : setDocumentForm
                            setter((prev: any) => ({ ...prev, caseId: c.id }))
                            setShowCaseDropdown(false)
                          }} className="w-full px-4 py-3 text-left text-white hover:bg-[#2a2a35] text-sm border-b border-[#2a2a35] last:border-0">
                            <span className="font-medium">{c.title}</span>
                            <span className="text-[#5a5a6e] ml-2 text-xs">{c.caseNumber}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {modalType === 'weapon' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[#7E8299] text-sm font-medium block mb-2">Title *</label>
                      <input type="text" value={weaponForm.title} onChange={(e) => setWeaponForm({...weaponForm, title: e.target.value})}
                        placeholder="Evidence title..." className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-red-500/50 rounded-xl px-4 py-3 text-white outline-none" />
                    </div>
                    <div>
                      <label className="text-[#7E8299] text-sm font-medium block mb-2">Weapon Type *</label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['pistol', 'rifle'] as const).map(type => (
                          <button key={type} onClick={() => setWeaponForm({...weaponForm, weaponType: type})}
                            className={`p-3 rounded-xl border text-sm font-medium transition-all ${weaponForm.weaponType === type ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-[#2a2a35] text-[#7E8299]'}`}>
                            {type.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-[#7E8299] text-sm font-medium block mb-2">Model</label>
                      <input type="text" value={weaponForm.model} onChange={(e) => setWeaponForm({...weaponForm, model: e.target.value})}
                        placeholder="Weapon model..." className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-red-500/50 rounded-xl px-4 py-3 text-white outline-none" />
                    </div>
                    <div><label className="text-[#7E8299] text-sm font-medium block mb-2">Serial Number</label>
                      <input type="text" value={weaponForm.serialNumber} onChange={(e) => setWeaponForm({...weaponForm, serialNumber: e.target.value})}
                        placeholder="Serial number..." className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-red-500/50 rounded-xl px-4 py-3 text-white outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-[#7E8299] text-sm font-medium block mb-2">Owner</label>
                      <input type="text" value={weaponForm.owner} onChange={(e) => setWeaponForm({...weaponForm, owner: e.target.value})}
                        placeholder="Owner name..." className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-red-500/50 rounded-xl px-4 py-3 text-white outline-none" />
                    </div>
                    <div><label className="text-[#7E8299] text-sm font-medium block mb-2">Brand</label>
                      <input type="text" value={weaponForm.brand} onChange={(e) => setWeaponForm({...weaponForm, brand: e.target.value})}
                        placeholder="Brand..." className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-red-500/50 rounded-xl px-4 py-3 text-white outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-[#7E8299] text-sm font-medium block mb-2">Caliber</label>
                      <input type="text" value={weaponForm.caliber} onChange={(e) => setWeaponForm({...weaponForm, caliber: e.target.value})}
                        placeholder="Caliber..." className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-red-500/50 rounded-xl px-4 py-3 text-white outline-none" />
                    </div>
                    <div>
                      <label className="text-[#7E8299] text-sm font-medium block mb-2">Classification</label>
                      <select value={weaponForm.classification} onChange={(e) => setWeaponForm({...weaponForm, classification: e.target.value})}
                        className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-red-500/50 rounded-xl px-4 py-3 text-white outline-none">
                        <option value="UNCLASSIFIED">UNCLASSIFIED</option>
                        <option value="RESTRICTED">RESTRICTED</option>
                        <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                        <option value="SECRET">SECRET</option>
                        <option value="TOP SECRET">TOP SECRET</option>
                        <option value="SCI">SCI</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[#7E8299] text-sm font-medium block mb-2">Priority</label>
                      <select value={weaponForm.priority} onChange={(e) => setWeaponForm({...weaponForm, priority: e.target.value})}
                        className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-red-500/50 rounded-xl px-4 py-3 text-white outline-none">
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                        <option value="CRITICAL">CRITICAL</option>
                        <option value="NATIONAL SECURITY">NATIONAL SECURITY</option>
                      </select>
                    </div>
                  </div>
                  <div className="bg-[#0f0f14] border border-[#2a2a35] rounded-xl p-4">
                    <div className="flex items-center gap-2 text-[#7E8299] text-sm mb-3">
                      <Eye className="w-4 h-4" /><span>3D Model: {weaponForm.weaponType.toUpperCase()}</span>
                    </div>
                    <div className="bg-[#1a1a22] rounded-lg p-6 flex items-center justify-center">
                      <div className="text-center">
                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${weaponForm.weaponType === 'rifle' ? 'from-blue-500 to-blue-700' : 'from-red-500 to-red-700'} flex items-center justify-center mx-auto mb-3`}>
                          <Crosshair className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-white font-medium">{weaponForm.weaponType.toUpperCase()}</p>
                        <p className="text-[#5a5a6e] text-xs mt-1">3D model will be available after creation</p>
                      </div>
                    </div>
                  </div>
                  <button onClick={handleAddWeapon} disabled={!weaponForm.title.trim() || !weaponForm.caseId.trim()}
                    className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-semibold shadow-lg shadow-red-500/20 transition-all">
                    Add Weapon Evidence
                  </button>
                </div>
              )}

              {modalType === 'car' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-[#7E8299] text-sm font-medium block mb-2">Title *</label>
                      <input type="text" value={carForm.title} onChange={(e) => setCarForm({...carForm, title: e.target.value})}
                        placeholder="Evidence title..." className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-red-500/50 rounded-xl px-4 py-3 text-white outline-none" />
                    </div>
                    <div><label className="text-[#7E8299] text-sm font-medium block mb-2">Plate Number *</label>
                      <input type="text" value={carForm.plateNumber} onChange={(e) => setCarForm({...carForm, plateNumber: e.target.value})}
                        placeholder="ABC-1234" className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-red-500/50 rounded-xl px-4 py-3 text-white outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-[#7E8299] text-sm font-medium block mb-2">Owner</label>
                      <input type="text" value={carForm.owner} onChange={(e) => setCarForm({...carForm, owner: e.target.value})}
                        placeholder="Owner name..." className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-red-500/50 rounded-xl px-4 py-3 text-white outline-none" />
                    </div>
                    <div><label className="text-[#7E8299] text-sm font-medium block mb-2">Color</label>
                      <input type="text" value={carForm.color} onChange={(e) => setCarForm({...carForm, color: e.target.value})}
                        placeholder="Color..." className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-red-500/50 rounded-xl px-4 py-3 text-white outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-[#7E8299] text-sm font-medium block mb-2">Make</label>
                      <input type="text" value={carForm.make} onChange={(e) => setCarForm({...carForm, make: e.target.value})}
                        placeholder="Toyota, BMW..." className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-red-500/50 rounded-xl px-4 py-3 text-white outline-none" />
                    </div>
                    <div><label className="text-[#7E8299] text-sm font-medium block mb-2">Model</label>
                      <input type="text" value={carForm.model} onChange={(e) => setCarForm({...carForm, model: e.target.value})}
                        placeholder="Model..." className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-red-500/50 rounded-xl px-4 py-3 text-white outline-none" />
                    </div>
                  </div>
                  <div className="bg-[#0f0f14] border border-[#2a2a35] rounded-xl p-4">
                    <div className="flex items-center gap-2 text-[#7E8299] text-sm mb-3">
                      <Eye className="w-4 h-4" /><span>3D Model: Vehicle</span>
                    </div>
                    <div className="bg-[#1a1a22] rounded-lg p-6 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-3">
                          <Car className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-white font-medium">VEHICLE 3D MODEL</p>
                        <p className="text-[#5a5a6e] text-xs mt-1">car.glb will be available after creation</p>
                      </div>
                    </div>
                  </div>
                  <button onClick={handleAddCar} disabled={!carForm.title.trim() || !carForm.caseId.trim()}
                    className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-semibold shadow-lg shadow-red-500/20 transition-all">
                    Add Car Evidence
                  </button>
                </div>
              )}

              {modalType === 'image' && (
                <div className="space-y-4">
                  <div><label className="text-[#7E8299] text-sm font-medium block mb-2">Title *</label>
                    <input type="text" value={imageForm.title} onChange={(e) => setImageForm({...imageForm, title: e.target.value})}
                      placeholder="Image evidence title..." className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-red-500/50 rounded-xl px-4 py-3 text-white outline-none" />
                  </div>
                  <div><label className="text-[#7E8299] text-sm font-medium block mb-2">Image URL *</label>
                    <input type="text" value={imageForm.imageUrl} onChange={(e) => setImageForm({...imageForm, imageUrl: e.target.value})}
                      placeholder="https://..." className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-red-500/50 rounded-xl px-4 py-3 text-white outline-none" />
                  </div>
                  <div><label className="text-[#7E8299] text-sm font-medium block mb-2">Image Title</label>
                    <input type="text" value={imageForm.imageTitle} onChange={(e) => setImageForm({...imageForm, imageTitle: e.target.value})}
                      placeholder="Caption..." className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-red-500/50 rounded-xl px-4 py-3 text-white outline-none" />
                  </div>
                  <div><label className="text-[#7E8299] text-sm font-medium block mb-2">Description</label>
                    <textarea value={imageForm.description} onChange={(e) => setImageForm({...imageForm, description: e.target.value})}
                      placeholder="Image description..." rows={3} className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-red-500/50 rounded-xl px-4 py-3 text-white outline-none resize-none" />
                  </div>
                  <button onClick={handleAddImage} disabled={!imageForm.title.trim() || !imageForm.caseId.trim()}
                    className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-semibold shadow-lg shadow-red-500/20 transition-all">
                    Add Image Evidence
                  </button>
                </div>
              )}

              {modalType === 'document' && (
                <div className="space-y-4">
                  <div><label className="text-[#7E8299] text-sm font-medium block mb-2">Title *</label>
                    <input type="text" value={documentForm.title} onChange={(e) => setDocumentForm({...documentForm, title: e.target.value})}
                      placeholder="Document title..." className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-red-500/50 rounded-xl px-4 py-3 text-white outline-none" />
                  </div>
                  <div><label className="text-[#7E8299] text-sm font-medium block mb-2">Description</label>
                    <textarea value={documentForm.description} onChange={(e) => setDocumentForm({...documentForm, description: e.target.value})}
                      placeholder="Document description..." rows={3} className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-red-500/50 rounded-xl px-4 py-3 text-white outline-none resize-none" />
                  </div>
                  <div><label className="text-[#7E8299] text-sm font-medium block mb-2">Custom Fields (JSON)</label>
                    <textarea value={documentForm.customFields} onChange={(e) => setDocumentForm({...documentForm, customFields: e.target.value})}
                      placeholder='{"field1": "value1"}' rows={3} className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-red-500/50 rounded-xl px-4 py-3 text-white outline-none resize-none font-mono text-sm" />
                  </div>
                  <button onClick={handleAddDocument} disabled={!documentForm.title.trim() || !documentForm.caseId.trim()}
                    className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-semibold shadow-lg shadow-red-500/20 transition-all">
                    Add Document Evidence
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccessModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-[#1a1a22] to-[#12121a] border border-green-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-green-500/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Success!</h3>
                  <p className="text-green-400 text-sm">{successMessage}</p>
                </div>
              </div>
              <button onClick={() => setShowSuccessModal(false)} 
                className="w-full py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl text-green-400 font-medium transition-all">
                Continue
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedEvidence && !show3DViewer && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            className="fixed right-0 top-0 bottom-0 w-[450px] bg-gradient-to-br from-[#1a1a22] to-[#12121a] border-l border-[#2a2a35] shadow-2xl z-40 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${typeColors[selectedEvidence.evidenceType].bg} flex items-center justify-center`}>
                    {(() => {
                    const IconComponent = typeIcons[selectedEvidence.evidenceType]
                    return IconComponent ? <IconComponent className="w-6 h-6 text-white" /> : null
                  })()}
                  </div>
                  <div>
                    <span className="text-xs text-[#5a5a6e] uppercase">{selectedEvidence.evidenceType} Evidence</span>
                    <p className="text-[#7E8299] text-xs">ID: {selectedEvidence.id.slice(0, 8)}...</p>
                  </div>
                </div>
                <button onClick={() => setSelectedEvidence(null)} className="text-[#5a5a6e] hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <h2 className="text-2xl font-bold text-white mb-6">{selectedEvidence.title}</h2>

              <div className="space-y-4">
                <div className="bg-[#0f0f14] rounded-xl p-4">
                  <h4 className="text-[#7E8299] text-xs font-medium uppercase mb-3">Description</h4>
                  <p className="text-white text-sm">{selectedEvidence.description}</p>
                </div>

                {selectedEvidence.weapon && (
                  <div className="bg-[#0f0f14] rounded-xl p-4">
                    <h4 className="text-[#7E8299] text-xs font-medium uppercase mb-3">Weapon Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div><p className="text-[#5a5a6e] text-xs">Type</p><p className="text-white text-sm capitalize">{selectedEvidence.weapon.weaponType}</p></div>
                      <div><p className="text-[#5a5a6e] text-xs">Brand</p><p className="text-white text-sm">{selectedEvidence.weapon.brand || 'Unknown'}</p></div>
                      <div><p className="text-[#5a5a6e] text-xs">Serial Number</p><p className="text-white text-sm">{selectedEvidence.weapon.serialNumber || 'Unknown'}</p></div>
                      <div><p className="text-[#5a5a6e] text-xs">Caliber</p><p className="text-white text-sm">{selectedEvidence.weapon.caliber || 'Unknown'}</p></div>
                      <div><p className="text-[#5a5a6e] text-xs">Owner</p><p className="text-white text-sm">{selectedEvidence.weapon.owner || 'Unknown'}</p></div>
                      <div><p className="text-[#5a5a6e] text-xs">Organ Evidence</p><p className="text-white text-sm">{selectedEvidence.weapon.organ ? 'Yes' : 'No'}</p></div>
                    </div>
                    <button onClick={() => setShow3DViewer(true)} 
                      className="mt-4 w-full py-2.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-blue-400 text-sm font-medium flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4" />View 3D Model
                    </button>
                  </div>
                )}

                {selectedEvidence.car && (
                  <div className="bg-[#0f0f14] rounded-xl p-4">
                    <h4 className="text-[#7E8299] text-xs font-medium uppercase mb-3">Vehicle Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div><p className="text-[#5a5a6e] text-xs">Make</p><p className="text-white text-sm">{selectedEvidence.car.make || 'Unknown'}</p></div>
                      <div><p className="text-[#5a5a6e] text-xs">Model</p><p className="text-white text-sm">{selectedEvidence.car.model || 'Unknown'}</p></div>
                      <div><p className="text-[#5a5a6e] text-xs">Plate</p><p className="text-white text-sm">{selectedEvidence.car.plateNumber || 'Unknown'}</p></div>
                      <div><p className="text-[#5a5a6e] text-xs">Color</p><p className="text-white text-sm">{selectedEvidence.car.color || 'Unknown'}</p></div>
                      <div><p className="text-[#5a5a6e] text-xs">Owner</p><p className="text-white text-sm">{selectedEvidence.car.owner || 'Unknown'}</p></div>
                    </div>
                    <button onClick={() => setShow3DViewer(true)} 
                      className="mt-4 w-full py-2.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-blue-400 text-sm font-medium flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4" />View 3D Model
                    </button>
                  </div>
                )}

                {selectedEvidence.imageEvidence && (
                  <div className="bg-[#0f0f14] rounded-xl p-4">
                    <h4 className="text-[#7E8299] text-xs font-medium uppercase mb-3">Image Details</h4>
                    {selectedEvidence.imageEvidence.imageUrl && (
                      <div className="mb-3 rounded-lg overflow-hidden">
                        <img src={selectedEvidence.imageEvidence.imageUrl} alt={selectedEvidence.imageEvidence.imageTitle || 'Evidence'} className="w-full h-48 object-cover" />
                      </div>
                    )}
                    <p className="text-[#5a5a6e] text-xs">Title</p><p className="text-white text-sm">{selectedEvidence.imageEvidence.imageTitle || 'N/A'}</p>
                  </div>
                )}

                {selectedEvidence.document && (
                  <div className="bg-[#0f0f14] rounded-xl p-4">
                    <h4 className="text-[#7E8299] text-xs font-medium uppercase mb-3">Document Details</h4>
                    {selectedEvidence.document.customFields && (
                      <div className="bg-[#1a1a22] rounded-lg p-3 font-mono text-xs text-[#7E8299]">
                        {selectedEvidence.document.customFields}
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-[#0f0f14] rounded-xl p-4">
                  <h4 className="text-[#7E8299] text-xs font-medium uppercase mb-3">Metadata</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-[#5a5a6e]">Classification</span><span className="text-red-400">{selectedEvidence.classification}</span></div>
                    <div className="flex justify-between"><span className="text-[#5a5a6e]">Case ID</span><span className="text-white">{selectedEvidence.caseId.slice(0, 8)}...</span></div>
                    <div className="flex justify-between"><span className="text-[#5a5a6e]">Created</span><span className="text-white">{new Date(selectedEvidence.createdAt).toLocaleString()}</span></div>
                  </div>
                </div>

                <button onClick={() => handleDeleteEvidence(selectedEvidence)}
                  className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" />Delete Evidence
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}