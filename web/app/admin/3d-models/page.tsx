'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'
import { EvidenceViewer3D, DEFAULT_HOTSPOTS, HotspotConfig } from '@/components/evidence-viewer-3d'
import { Eye, Edit3, RotateCcw, Save, Plus, Trash2, X, Check, Car, Bike, Crosshair, FileText } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

interface HotspotTemplate {
  _id?: string
  modelType: string
  hotspots: HotspotConfig[]
  updatedAt?: string
}

export default function Admin3DModelsPage() {
  const [selectedModel, setSelectedModel] = useState<string>('pistol')
  const [hotspots, setHotspots] = useState<HotspotConfig[]>([])
  const [customHotspots, setCustomHotspots] = useState<Record<string, HotspotConfig[]>>({})
  const [showViewer, setShowViewer] = useState(false)
  const [editingHotspot, setEditingHotspot] = useState<HotspotConfig | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isOwner, setIsOwner] = useState(false)

  const modelTypes = [
    { id: 'pistol', name: 'Pistol', icon: Crosshair, modelPath: '/pistol.glb' },
    { id: 'rifle', name: 'Rifle', icon: Crosshair, modelPath: '/rifle.glb' },
    { id: 'car', name: 'Car', icon: Car, modelPath: '/car.glb' },
    { id: 'motorcycle', name: 'Motorcycle', icon: Bike, modelPath: '/motorcycle.glb' },
  ]

  const [availableDataKeys] = useState([
    { key: 'serialNumber', label: 'Serial Number' },
    { key: 'owner', label: 'Owner' },
    { key: 'model', label: 'Model' },
    { key: 'brand', label: 'Brand' },
    { key: 'plateNumber', label: 'Plate Number' },
    { key: 'color', label: 'Color' },
    { key: 'make', label: 'Make' },
    { key: 'caliber', label: 'Caliber' },
    { key: 'registeredOwner', label: 'Registered Owner' },
    { key: 'licenseStatus', label: 'License Status' },
  ])

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsed = JSON.parse(userData)
      setUser(parsed)
      setIsOwner(parsed.username === 'ihyVoid' || parsed.role === 'owner')
    }
    
    loadHotspots()
  }, [])

  useEffect(() => {
    if (customHotspots[selectedModel]) {
      setHotspots(customHotspots[selectedModel])
    } else {
      setHotspots(DEFAULT_HOTSPOTS[selectedModel] || [])
    }
  }, [selectedModel, customHotspots])

  const loadHotspots = async () => {
    try {
      const res = await fetch(`${API_URL}/api/hotspots`)
      if (res.ok) {
        const data = await res.json()
        const mapped: Record<string, HotspotConfig[]> = {}
        data.forEach((item: HotspotTemplate) => {
          mapped[item.modelType] = item.hotspots
        })
        setCustomHotspots(mapped)
      }
    } catch (error) {
      console.error('Error loading hotspots:', error)
    }
  }

  const saveHotspots = async () => {
    if (!isOwner) {
      setMessage({ type: 'error', text: 'Only the owner (ihyVoid) can edit hotspots' })
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`${API_URL}/api/hotspots/${selectedModel}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotspots })
      })

      if (res.ok) {
        setCustomHotspots(prev => ({ ...prev, [selectedModel]: hotspots }))
        setMessage({ type: 'success', text: 'Hotspots saved successfully!' })
      } else {
        setMessage({ type: 'error', text: 'Failed to save hotspots' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving hotspots' })
    }
    setSaving(false)
  }

  const resetToDefault = () => {
    setHotspots(DEFAULT_HOTSPOTS[selectedModel] || [])
    setMessage({ type: 'success', text: 'Reset to default hotspots' })
  }

  const addHotspot = () => {
    const newHotspot: HotspotConfig = {
      id: `hs_${Date.now()}`,
      label: 'New Hotspot',
      labelKey: 'newField',
      position: [0, 0.5, 0.5]
    }
    setHotspots([...hotspots, newHotspot])
    setEditingHotspot(newHotspot)
  }

  const updateHotspot = (id: string, updates: Partial<HotspotConfig>) => {
    setHotspots(hotspots.map(h => h.id === id ? { ...h, ...updates } : h))
  }

  const deleteHotspot = (id: string) => {
    setHotspots(hotspots.filter(h => h.id !== id))
    if (editingHotspot?.id === id) {
      setEditingHotspot(null)
    }
  }

  const selectHotspotOnModel = (hotspot: HotspotConfig) => {
    setEditingHotspot(hotspot)
  }

  if (!isOwner) {
    return (
      <div className='flex min-h-screen bg-[#0f0f14]'>
        <Sidebar />
        <div className='flex-1 ml-64'>
          <Topbar />
          <div className='p-8'>
            <div className='bg-[#1a1a22] rounded-2xl p-8 text-center'>
              <div className='w-20 h-20 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                <X className='w-10 h-10 text-red-400' />
              </div>
              <h2 className='text-white text-2xl font-bold mb-2'>Access Denied</h2>
              <p className='text-[#7E8299]'>Only the owner (ihyVoid) can manage 3D model hotspots.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='flex min-h-screen bg-[#0f0f14]'>
      <Sidebar />
      <div className='flex-1 ml-64'>
        <Topbar />
        
        <div className='p-8'>
          {/* Header */}
          <div className='flex items-center justify-between mb-8'>
            <div>
              <h1 className='text-white text-3xl font-bold'>3D Model Hotspot Manager</h1>
              <p className='text-[#7E8299] mt-1'>Manage interactive hotspots for 3D evidence models</p>
            </div>
            <div className='flex items-center gap-3'>
              <button
                onClick={() => setShowViewer(true)}
                className='px-5 py-2.5 bg-[#EF232E] hover:bg-[#d41e28] rounded-xl text-white font-medium flex items-center gap-2 transition-all'
              >
                <Eye className='w-5 h-5' /> Preview 3D Model
              </button>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-xl ${message.type === 'success' ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
              <p className={message.type === 'success' ? 'text-green-400' : 'text-red-400'}>{message.text}</p>
            </div>
          )}

          <div className='grid grid-cols-12 gap-6'>
            {/* Model Selection */}
            <div className='col-span-12 lg:col-span-3'>
              <div className='bg-[#1a1a22] rounded-2xl p-4'>
                <h3 className='text-white font-semibold mb-4'>Select Model</h3>
                <div className='space-y-2'>
                  {modelTypes.map(model => {
                    const Icon = model.icon
                    const hasCustom = customHotspots[model.id] && customHotspots[model.id].length > 0
                    return (
                      <button
                        key={model.id}
                        onClick={() => setSelectedModel(model.id)}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                          selectedModel === model.id 
                            ? 'bg-[#EF232E]/20 border-2 border-[#EF232E]' 
                            : 'bg-[#2a2a35] hover:bg-[#3a3a45]'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${selectedModel === model.id ? 'text-[#EF232E]' : 'text-[#7E8299]'}`} />
                        <div className='text-left'>
                          <p className={`text-sm font-medium ${selectedModel === model.id ? 'text-white' : 'text-[#7E8299]'}`}>{model.name}</p>
                          {hasCustom && <span className='text-xs text-green-400'>Custom</span>}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Hotspot List */}
            <div className='col-span-12 lg:col-span-5'>
              <div className='bg-[#1a1a22] rounded-2xl p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <div>
                    <h3 className='text-white font-semibold'>Hotspots</h3>
                    <p className='text-[#7E8299] text-sm'>{modelTypes.find(m => m.id === selectedModel)?.name}</p>
                  </div>
                  <div className='flex gap-2'>
                    <button
                      onClick={addHotspot}
                      className='p-2 bg-[#2a2a35] hover:bg-[#3a3a45] rounded-lg text-white'
                      title='Add Hotspot'
                    >
                      <Plus className='w-5 h-5' />
                    </button>
                    <button
                      onClick={resetToDefault}
                      className='p-2 bg-[#2a2a35] hover:bg-[#3a3a45] rounded-lg text-white'
                      title='Reset to Default'
                    >
                      <RotateCcw className='w-5 h-5' />
                    </button>
                    <button
                      onClick={saveHotspots}
                      disabled={saving}
                      className='px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-[#2a2a35] rounded-lg text-white text-sm font-medium flex items-center gap-2'
                    >
                      <Save className='w-4 h-4' /> {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>

                <div className='space-y-2 max-h-[500px] overflow-y-auto'>
                  {hotspots.map((hotspot, index) => (
                    <div
                      key={hotspot.id}
                      onClick={() => selectHotspotOnModel(hotspot)}
                      className={`p-4 rounded-xl cursor-pointer transition-all ${
                        editingHotspot?.id === hotspot.id 
                          ? 'bg-[#EF232E]/20 border border-[#EF232E]' 
                          : 'bg-[#2a2a35] hover:bg-[#3a3a45]'
                      }`}
                    >
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-white font-medium'>{index + 1}. {hotspot.label}</p>
                          <p className='text-[#7E8299] text-sm'>Key: {hotspot.labelKey}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteHotspot(hotspot.id)
                          }}
                          className='p-2 hover:bg-red-500/20 rounded-lg text-red-400'
                        >
                          <Trash2 className='w-4 h-4' />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {hotspots.length === 0 && (
                    <div className='text-center py-8 text-[#7E8299]'>
                      <p>No hotspots yet. Click + to add one.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Hotspot Editor */}
            <div className='col-span-12 lg:col-span-4'>
              <div className='bg-[#1a1a22] rounded-2xl p-6'>
                <h3 className='text-white font-semibold mb-4'>
                  {editingHotspot ? 'Edit Hotspot' : 'Select a Hotspot'}
                </h3>

                {editingHotspot ? (
                  <div className='space-y-4'>
                    <div>
                      <label className='text-[#7E8299] text-sm block mb-2'>Label (shown on hover)</label>
                      <input
                        type='text'
                        value={editingHotspot.label}
                        onChange={(e) => {
                          setEditingHotspot({ ...editingHotspot, label: e.target.value })
                          updateHotspot(editingHotspot.id, { label: e.target.value })
                        }}
                        className='w-full bg-[#2a2a35] border border-[#3a3a45] rounded-xl px-4 py-3 text-white outline-none focus:border-[#EF232E]'
                      />
                    </div>

                    <div>
                      <label className='text-[#7E8299] text-sm block mb-2'>Data Key (from database)</label>
                      <select
                        value={editingHotspot.labelKey}
                        onChange={(e) => {
                          setEditingHotspot({ ...editingHotspot, labelKey: e.target.value })
                          updateHotspot(editingHotspot.id, { labelKey: e.target.value })
                        }}
                        className='w-full bg-[#2a2a35] border border-[#3a3a45] rounded-xl px-4 py-3 text-white outline-none focus:border-[#EF232E]'
                      >
                        <option value=''>Select a key...</option>
                        {availableDataKeys.map(dk => (
                          <option key={dk.key} value={dk.key}>{dk.label} ({dk.key})</option>
                        ))}
                        <option value='custom'>Custom...</option>
                      </select>
                      {editingHotspot.labelKey === 'custom' && (
                        <input
                          type='text'
                          placeholder='Enter custom key'
                          onChange={(e) => {
                            setEditingHotspot({ ...editingHotspot, labelKey: e.target.value })
                            updateHotspot(editingHotspot.id, { labelKey: e.target.value })
                          }}
                          className='w-full bg-[#2a2a35] border border-[#3a3a45] rounded-xl px-4 py-3 text-white outline-none focus:border-[#EF232E] mt-2'
                        />
                      )}
                    </div>

                    <div className='grid grid-cols-3 gap-3'>
                      <div>
                        <label className='text-[#7E8299] text-sm block mb-2'>X</label>
                        <input
                          type='number'
                          step='0.01'
                          value={editingHotspot.position[0]}
                          onChange={(e) => {
                            const newPos: [number, number, number] = [
                              parseFloat(e.target.value),
                              editingHotspot.position[1],
                              editingHotspot.position[2]
                            ]
                            setEditingHotspot({ ...editingHotspot, position: newPos })
                            updateHotspot(editingHotspot.id, { position: newPos })
                          }}
                          className='w-full bg-[#2a2a35] border border-[#3a3a45] rounded-xl px-3 py-2 text-white outline-none focus:border-[#EF232E]'
                        />
                      </div>
                      <div>
                        <label className='text-[#7E8299] text-sm block mb-2'>Y</label>
                        <input
                          type='number'
                          step='0.01'
                          value={editingHotspot.position[1]}
                          onChange={(e) => {
                            const newPos: [number, number, number] = [
                              editingHotspot.position[0],
                              parseFloat(e.target.value),
                              editingHotspot.position[2]
                            ]
                            setEditingHotspot({ ...editingHotspot, position: newPos })
                            updateHotspot(editingHotspot.id, { position: newPos })
                          }}
                          className='w-full bg-[#2a2a35] border border-[#3a3a45] rounded-xl px-3 py-2 text-white outline-none focus:border-[#EF232E]'
                        />
                      </div>
                      <div>
                        <label className='text-[#7E8299] text-sm block mb-2'>Z</label>
                        <input
                          type='number'
                          step='0.01'
                          value={editingHotspot.position[2]}
                          onChange={(e) => {
                            const newPos: [number, number, number] = [
                              editingHotspot.position[0],
                              editingHotspot.position[1],
                              parseFloat(e.target.value)
                            ]
                            setEditingHotspot({ ...editingHotspot, position: newPos })
                            updateHotspot(editingHotspot.id, { position: newPos })
                          }}
                          className='w-full bg-[#2a2a35] border border-[#3a3a45] rounded-xl px-3 py-2 text-white outline-none focus:border-[#EF232E]'
                        />
                      </div>
                    </div>

                    <div className='pt-4 border-t border-[#2a2a35]'>
                      <button
                        onClick={() => setShowViewer(true)}
                        className='w-full py-3 bg-[#EF232E]/20 hover:bg-[#EF232E]/30 border border-[#EF232E] rounded-xl text-[#EF232E] text-sm font-medium'
                      >
                        Preview on 3D Model
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className='text-center py-12 text-[#7E8299]'>
                    <Eye className='w-12 h-12 mx-auto mb-3 opacity-50' />
                    <p>Select a hotspot to edit its properties</p>
                  </div>
                )}
              </div>

              {/* Default Hotspots Reference */}
              <div className='bg-[#1a1a22] rounded-2xl p-6 mt-6'>
                <h3 className='text-white font-semibold mb-4'>Default Hotspots</h3>
                <div className='space-y-2 text-sm'>
                  <div className='bg-[#2a2a35] rounded-lg p-3'>
                    <p className='text-white font-medium'>Pistol/Rifle</p>
                    <p className='text-[#7E8299]'>Serial Number, Owner, Model</p>
                  </div>
                  <div className='bg-[#2a2a35] rounded-lg p-3'>
                    <p className='text-white font-medium'>Car/Motorcycle</p>
                    <p className='text-[#7E8299]'>Plate, Model, Color, Owner</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Viewer Modal */}
      {showViewer && (
        <EvidenceViewer3D
          isOpen={showViewer}
          onClose={() => setShowViewer(false)}
          evidenceType={selectedModel === 'pistol' || selectedModel === 'rifle' ? 'weapon' : 'car'}
          weaponType={selectedModel === 'rifle' ? 'rifle' : 'pistol'}
          vehicleType={selectedModel === 'motorcycle' ? 'motorcycle' : 'car'}
          evidenceData={{
            serialNumber: 'ABC-123456',
            owner: 'John Doe',
            model: 'Model X',
            brand: 'Brand Y',
            plateNumber: 'XYZ-1234',
            color: 'Red',
            make: 'Toyota'
          }}
          customHotspots={hotspots}
        />
      )}
    </div>
  )
}