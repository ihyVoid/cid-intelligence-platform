'use client'

import { useState, Suspense, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html, useGLTF } from '@react-three/drei'
import { X, RotateCcw, Info, Car, Bike, Plus, Trash2, Edit3, Eye, Save } from 'lucide-react'
import * as THREE from 'three'

// Hotspot type definition
export interface HotspotConfig {
  id: string
  label: string
  labelKey: string
  position: [number, number, number]
}

// Default hotspots for each model type
export const DEFAULT_HOTSPOTS: Record<string, HotspotConfig[]> = {
  pistol: [
    { id: 'sn', label: 'Serial Number', labelKey: 'serialNumber', position: [-0.05, 0.15, 0.08] },
    { id: 'owner', label: 'Owner', labelKey: 'owner', position: [0.15, -0.05, 0.08] },
    { id: 'model', label: 'Model', labelKey: 'model', position: [0.05, 0.18, 0.08] },
  ],
  rifle: [
    { id: 'sn', label: 'Serial Number', labelKey: 'serialNumber', position: [-0.15, 0.15, 0.06] },
    { id: 'owner', label: 'Owner', labelKey: 'owner', position: [0.18, 0.02, 0.06] },
    { id: 'model', label: 'Model', labelKey: 'model', position: [0.08, 0.22, 0.06] },
  ],
  car: [
    { id: 'plate', label: 'Plate', labelKey: 'plateNumber', position: [0.05, 0.3, 0.6] },
    { id: 'model', label: 'Model', labelKey: 'model', position: [-0.2, 0.8, 0.2] },
    { id: 'color', label: 'Color', labelKey: 'color', position: [-0.8, 0.35, 0.05] },
    { id: 'owner', label: 'Owner', labelKey: 'owner', position: [0.25, 1.0, 0.08] },
  ],
  motorcycle: [
    { id: 'plate', label: 'Plate Number', labelKey: 'plateNumber', position: [-0.4, -0.1, 0.35] },
    { id: 'owner', label: 'Owner', labelKey: 'owner', position: [-0.45, -0.05, 0.1] },
    { id: 'color', label: 'Color', labelKey: 'color', position: [-0.45, -0.02, -0.01] },
    { id: 'model', label: 'Model', labelKey: 'model', position: [-0.48, 0.0, -0.15] },
  ],
}

// Hotspot 2D Circle Component - red #EF232E
function HotspotCircle({ 
  position, 
  label, 
  value,
  isActive, 
  onClick,
  isEditMode = false,
  isSelected = false,
  onSelect = () => {}
}: { 
  position: [number, number, number]
  label: string
  value: string
  isActive: boolean
  onClick: () => void
  isEditMode?: boolean
  isSelected?: boolean
  onSelect?: () => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const [pulseOffset] = useState(Math.random() * Math.PI * 2)
  
  useFrame((state) => {
    if (ringRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2 + pulseOffset) * 0.15 + 1
      ringRef.current.scale.setScalar(pulse)
    }
    if (groupRef.current && !isEditMode) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5 + pulseOffset) * 0.015
    }
  })

  const handleClick = (e: any) => {
    e.stopPropagation()
    if (isEditMode) {
      onSelect()
    } else {
      onClick()
    }
  }

  return (
    <group ref={groupRef} position={position}>
      {/* Selection ring in edit mode */}
      {isEditMode && isSelected && (
        <mesh>
          <ringGeometry args={[0.2, 0.25, 32]} />
          <meshBasicMaterial color='#00ff00' transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}
      
      {/* Outer pulsing ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[0.12, 0.18, 32]} />
        <meshBasicMaterial 
          color={isEditMode ? '#00ff00' : '#EF232E'} 
          transparent 
          opacity={hovered || isActive ? 0.9 : 0.5} 
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Inner circle */}
      <mesh 
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setHovered(false)
          document.body.style.cursor = isEditMode ? 'pointer' : 'auto'
        }}
      >
        <circleGeometry args={[0.08, 32]} />
        <meshBasicMaterial 
          color={isEditMode ? '#00ff00' : '#EF232E'} 
          transparent 
          opacity={hovered || isActive ? 1 : 0.9}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Center dot */}
      <mesh>
        <circleGeometry args={[0.03, 16]} />
        <meshBasicMaterial color='#ffffff' transparent opacity={0.95} side={THREE.DoubleSide} />
      </mesh>

      {/* Label tooltip */}
      {hovered && !isActive && !isEditMode && (
        <Html position={[0, 0.25, 0]} center>
          <div className='bg-[#EF232E] text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-2xl whitespace-nowrap'>
            {label}
          </div>
        </Html>
      )}
      
      {/* Edit mode label */}
      {isEditMode && (
        <Html position={[0, 0.3, 0]} center>
          <div className='bg-black/80 text-white px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border border-green-500'>
            {label}
          </div>
        </Html>
      )}
    </group>
  )
}

// GLTF Model with hotspots
function GLTFModelWithHotspots({ 
  modelPath, 
  hotspots, 
  evidenceData,
  activeHotspot,
  setActiveHotspot,
  isEditMode = false,
  selectedHotspotId,
  onSelectHotspot,
  onDragHotspot
}: { 
  modelPath: string
  hotspots: HotspotConfig[]
  evidenceData: any
  activeHotspot: string | null
  setActiveHotspot: (id: string | null) => void
  isEditMode?: boolean
  selectedHotspotId?: string | null
  onSelectHotspot?: (id: string) => void
  onDragHotspot?: (id: string, position: [number, number, number]) => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  const [modelError, setModelError] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(false)
  const { camera } = useThree()
  
  const { scene } = useGLTF(modelPath)
  
  useEffect(() => {
    if (scene && !modelLoaded) {
      try {
        const box = new THREE.Box3().setFromObject(scene)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        
        scene.position.sub(center)
        
        const maxDim = Math.max(size.x, size.y, size.z)
        const scaleFactor = maxDim > 0 ? 2 / maxDim : 1
        scene.scale.setScalar(scaleFactor)
        
        scene.position.y = -size.y * scaleFactor / 2
        
        // Make materials emissive
        scene.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            const mat = child.material as THREE.MeshStandardMaterial
            mat.emissive = new THREE.Color(0x333333)
            mat.emissiveIntensity = 0.3
          }
        })
        
        setModelLoaded(true)
      } catch (e) {
        console.error('Error loading model:', e)
        setModelError(true)
      }
    }
  }, [scene, modelLoaded])

  useFrame((state) => {
    if (groupRef.current && !modelError && !isEditMode) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.4
    }
  })

  if (modelError) {
    return (
      <group ref={groupRef}>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[1, 0.4, 0.3]} />
          <meshStandardMaterial color='#4a4a5e' metalness={0.5} roughness={0.5} emissive={0x222222} emissiveIntensity={0.3} />
        </mesh>
      </group>
    )
  }

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
      
      {hotspots.map((hotspot) => {
        const value = evidenceData[hotspot.labelKey] || 'N/A'
        return (
          <HotspotCircle
            key={hotspot.id}
            position={hotspot.position}
            label={hotspot.label}
            value={value}
            isActive={activeHotspot === hotspot.id}
            onClick={() => setActiveHotspot(activeHotspot === hotspot.id ? null : hotspot.id)}
            isEditMode={isEditMode}
            isSelected={selectedHotspotId === hotspot.id}
            onSelect={() => onSelectHotspot?.(hotspot.id)}
          />
        )
      })}
    </group>
  )
}

interface EvidenceViewer3DProps {
  isOpen: boolean
  onClose: () => void
  evidenceType: 'weapon' | 'car' | 'image' | 'document'
  weaponType?: 'pistol' | 'rifle'
  vehicleType?: 'car' | 'motorcycle'
  setVehicleType?: (type: 'car' | 'motorcycle') => void
  evidenceData?: any
  userRole?: string
  username?: string
  customHotspots?: HotspotConfig[]
  onSaveHotspots?: (hotspots: HotspotConfig[]) => void
}

export function EvidenceViewer3D({
  isOpen,
  onClose,
  evidenceType,
  weaponType = 'pistol',
  vehicleType = 'car',
  setVehicleType,
  evidenceData = {},
  userRole = 'agent',
  username = '',
  customHotspots,
  onSaveHotspots
}: EvidenceViewer3DProps) {
  const [autoRotate, setAutoRotate] = useState(true)
  const [showHelp, setShowHelp] = useState(false)
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null)
  const [hotspotInfo, setHotspotInfo] = useState<{ label: string; value: string } | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null)
  const [localHotspots, setLocalHotspots] = useState<HotspotConfig[]>([])
  const [showHotspotList, setShowHotspotList] = useState(false)
  const [newHotspotLabel, setNewHotspotLabel] = useState('')
  const [newHotspotLabelKey, setNewHotspotLabelKey] = useState('')
  
  const isOwner = username === 'ihyVoid' || userRole === 'owner'
  const canEditHotspots = isOwner && isEditMode

  const getModelType = () => {
    if (evidenceType === 'weapon') return weaponType
    if (evidenceType === 'car') return vehicleType
    return 'car'
  }

  const modelType = getModelType()
  
  const getModelPath = () => {
    if (evidenceType === 'weapon') {
      return weaponType === 'rifle' ? '/rifle.glb' : '/pistol.glb'
    }
    if (evidenceType === 'car') {
      return vehicleType === 'motorcycle' ? '/motorcycle.glb' : '/car.glb'
    }
    return null
  }

  const modelPath = getModelPath()
  
  // Initialize hotspots
  useEffect(() => {
    if (customHotspots && customHotspots.length > 0) {
      setLocalHotspots(customHotspots)
    } else {
      setLocalHotspots(DEFAULT_HOTSPOTS[modelType] || DEFAULT_HOTSPOTS.car)
    }
    setSelectedHotspotId(null)
    setActiveHotspot(null)
  }, [modelType, customHotspots])

  useEffect(() => {
    if (activeHotspot) {
      const hotspot = localHotspots.find(h => h.id === activeHotspot)
      if (hotspot) {
        const value = evidenceData[hotspot.labelKey] || 'N/A'
        setHotspotInfo({ label: hotspot.label, value })
      }
    } else {
      setHotspotInfo(null)
    }
  }, [activeHotspot, localHotspots, evidenceData])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEditMode) {
          setIsEditMode(false)
          setSelectedHotspotId(null)
        } else {
          onClose()
        }
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, isEditMode, onClose])

  const handleCanvasClick = () => {
    if (!isEditMode) {
      setActiveHotspot(null)
      setHotspotInfo(null)
    }
  }

  const handleSelectHotspot = (id: string) => {
    setSelectedHotspotId(id)
  }

  const handleAddHotspot = () => {
    if (!newHotspotLabel.trim() || !newHotspotLabelKey.trim()) return
    
    const newId = `hs_${Date.now()}`
    const newHotspot: HotspotConfig = {
      id: newId,
      label: newHotspotLabel.trim(),
      labelKey: newHotspotLabelKey.trim(),
      position: [0, 0.5, 0.5]
    }
    
    const updated = [...localHotspots, newHotspot]
    setLocalHotspots(updated)
    setNewHotspotLabel('')
    setNewHotspotLabelKey('')
    setSelectedHotspotId(newId)
    
    if (onSaveHotspots) {
      onSaveHotspots(updated)
    }
  }

  const handleDeleteHotspot = (id: string) => {
    const updated = localHotspots.filter(h => h.id !== id)
    setLocalHotspots(updated)
    setSelectedHotspotId(null)
    
    if (onSaveHotspots) {
      onSaveHotspots(updated)
    }
  }

  const handleResetHotspots = () => {
    const defaults = DEFAULT_HOTSPOTS[modelType] || DEFAULT_HOTSPOTS.car
    setLocalHotspots(defaults)
    setSelectedHotspotId(null)
    
    if (onSaveHotspots) {
      onSaveHotspots(defaults)
    }
  }

  const handleSaveChanges = () => {
    if (onSaveHotspots) {
      onSaveHotspots(localHotspots)
    }
    setIsEditMode(false)
    setSelectedHotspotId(null)
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-[#1a1a2e] z-50 flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#1a1a22] to-[#12121a] border-b border-[#2a2a35]'>
        <div className='flex items-center gap-4'>
          <div className='w-12 h-12 bg-gradient-to-br from-[#EF232E] to-[#c41b24] rounded-xl flex items-center justify-center shadow-lg shadow-[#EF232E]/30'>
            <Info className='w-6 h-6 text-white' />
          </div>
          <div>
            <h2 className='text-white font-bold text-xl'>3D Evidence Viewer</h2>
            <p className='text-[#7E8299] text-sm'>
              {evidenceType === 'weapon' 
                ? `${weaponType.toUpperCase()} - ${evidenceData.model || evidenceData.brand || 'Evidence'}` 
                : evidenceType === 'car' 
                  ? `${vehicleType.toUpperCase()} - ${evidenceData.model || evidenceData.make || 'Vehicle'}` 
                  : 'Evidence Model'}
            </p>
          </div>
        </div>
        
        <div className='flex items-center gap-3'>
          {/* Vehicle type selector */}
          {evidenceType === 'car' && setVehicleType && (
            <div className='flex items-center gap-1 bg-[#0f0f14] rounded-xl p-1'>
              <button
                onClick={() => setVehicleType('car')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  vehicleType === 'car' 
                    ? 'bg-[#EF232E] text-white shadow-lg shadow-[#EF232E]/20' 
                    : 'text-[#7E8299] hover:text-white hover:bg-[#2a2a35]'
                }`}
              >
                <Car className='w-4 h-4' /> Car
              </button>
              <button
                onClick={() => setVehicleType('motorcycle')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  vehicleType === 'motorcycle' 
                    ? 'bg-[#EF232E] text-white shadow-lg shadow-[#EF232E]/20' 
                    : 'text-[#7E8299] hover:text-white hover:bg-[#2a2a35]'
                }`}
              >
                <Bike className='w-4 h-4' /> Motorcycle
              </button>
            </div>
          )}
          
          {/* Edit mode toggle for owner */}
          {isOwner && (
            <button
              onClick={() => {
                setIsEditMode(!isEditMode)
                setSelectedHotspotId(null)
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isEditMode 
                  ? 'bg-green-600 text-white' 
                  : 'bg-[#2a2a35] text-[#7E8299] hover:text-white'
              }`}
            >
              <Edit3 className='w-4 h-4' /> {isEditMode ? 'Exit Edit' : 'Edit Hotspots'}
            </button>
          )}
          
          <button 
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-3 rounded-xl transition-all ${autoRotate ? 'bg-[#EF232E] text-white shadow-lg shadow-[#EF232E]/20' : 'bg-[#2a2a35] text-[#7E8299] hover:text-white'}`}
            title={autoRotate ? 'Stop rotation' : 'Auto rotate'}
          >
            <RotateCcw className={`w-5 h-5 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '2s' }} />
          </button>
          
          <button 
            onClick={onClose}
            className='p-3 bg-[#2a2a35] hover:bg-[#EF232E] rounded-xl text-[#7E8299] hover:text-white transition-all'
            title='Close (ESC)'
          >
            <X className='w-5 h-5' />
          </button>
        </div>
      </div>

      {/* Hotspot List Panel (Edit Mode) */}
      {isEditMode && (
        <div className='bg-[#1a1a22] border-b border-[#2a2a35] p-4'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-white font-bold text-lg'>Hotspot Manager</h3>
            <div className='flex gap-2'>
              <button
                onClick={() => setShowHotspotList(!showHotspotList)}
                className='px-4 py-2 bg-[#2a2a35] hover:bg-[#3a3a45] rounded-lg text-white text-sm'
              >
                {showHotspotList ? 'Hide List' : 'Show List'}
              </button>
              <button
                onClick={handleResetHotspots}
                className='px-4 py-2 bg-[#2a2a35] hover:bg-[#3a3a45] rounded-lg text-white text-sm'
              >
                Reset to Default
              </button>
              <button
                onClick={handleSaveChanges}
                className='px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white text-sm flex items-center gap-2'
              >
                <Save className='w-4 h-4' /> Save Changes
              </button>
            </div>
          </div>
          
          {showHotspotList && (
            <div className='grid grid-cols-3 gap-4'>
              {/* Hotspot List */}
              <div className='bg-[#0f0f14] rounded-xl p-4'>
                <h4 className='text-[#7E8299] text-sm font-medium mb-3'>Current Hotspots ({localHotspots.length})</h4>
                <div className='space-y-2 max-h-60 overflow-y-auto'>
                  {localHotspots.map(hs => (
                    <div 
                      key={hs.id}
                      onClick={() => setSelectedHotspotId(hs.id)}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                        selectedHotspotId === hs.id 
                          ? 'bg-green-500/20 border border-green-500' 
                          : 'bg-[#2a2a35] hover:bg-[#3a3a45]'
                      }`}
                    >
                      <div>
                        <p className='text-white text-sm font-medium'>{hs.label}</p>
                        <p className='text-[#7E8299] text-xs'>Key: {hs.labelKey}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteHotspot(hs.id)
                        }}
                        className='p-2 hover:bg-red-500/20 rounded-lg text-red-400'
                      >
                        <Trash2 className='w-4 h-4' />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Add New Hotspot */}
              <div className='bg-[#0f0f14] rounded-xl p-4'>
                <h4 className='text-[#7E8299] text-sm font-medium mb-3'>Add New Hotspot</h4>
                <div className='space-y-3'>
                  <div>
                    <label className='text-[#7E8299] text-xs mb-1 block'>Label (shown on hover)</label>
                    <input
                      type='text'
                      value={newHotspotLabel}
                      onChange={(e) => setNewHotspotLabel(e.target.value)}
                      placeholder='e.g., Serial Number'
                      className='w-full bg-[#2a2a35] border border-[#3a3a45] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-green-500'
                    />
                  </div>
                  <div>
                    <label className='text-[#7E8299] text-xs mb-1 block'>Data Key (from database)</label>
                    <input
                      type='text'
                      value={newHotspotLabelKey}
                      onChange={(e) => setNewHotspotLabelKey(e.target.value)}
                      placeholder='e.g., serialNumber'
                      className='w-full bg-[#2a2a35] border border-[#3a3a45] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-green-500'
                    />
                  </div>
                  <button
                    onClick={handleAddHotspot}
                    disabled={!newHotspotLabel.trim() || !newHotspotLabelKey.trim()}
                    className='w-full py-2 bg-green-600 hover:bg-green-500 disabled:bg-[#2a2a35] disabled:text-[#7E8299] rounded-lg text-white text-sm flex items-center justify-center gap-2'
                  >
                    <Plus className='w-4 h-4' /> Add Hotspot
                  </button>
                </div>
              </div>
              
              {/* Instructions */}
              <div className='bg-[#0f0f14] rounded-xl p-4'>
                <h4 className='text-[#7E8299] text-sm font-medium mb-3'>Instructions</h4>
                <div className='text-[#7E8299] text-sm space-y-2'>
                  <p>1. Click on a hotspot in the list or on the 3D model to select it</p>
                  <p>2. Use the 3D model controls to position the selected hotspot</p>
                  <p>3. Edit the hotspot label and data key above</p>
                  <p>4. Click "Save Changes" when done</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3D Canvas */}
      <div className='flex-1 relative' onClick={handleCanvasClick}>
        {modelPath ? (
          <Canvas 
            camera={{ position: [0, 0.5, 4], fov: 50 }} 
            onCreated={({ gl }) => {
              gl.setClearColor('#1a1a2e')
              gl.toneMapping = THREE.ACESFilmicToneMapping
              gl.toneMappingExposure = 1.5
            }}
          >
            <ambientLight intensity={1.5} color='#ffffff' />
            <directionalLight position={[5, 5, 5]} intensity={2} color='#ffffff' castShadow />
            <directionalLight position={[-5, 3, -5]} intensity={1} color='#ccccff' />
            <pointLight position={[0, 5, -5]} intensity={2} color='#EF232E' distance={20} />
            <pointLight position={[0, 2, 5]} intensity={1.5} color='#ffffff' distance={15} />
            <pointLight position={[0, -3, 0]} intensity={0.5} color='#333366' distance={10} />

            <Suspense fallback={
              <Html center>
                <div className='bg-[#1a1a22] border border-[#2a2a35] rounded-2xl px-8 py-6 shadow-2xl'>
                  <div className='flex items-center gap-4'>
                    <div className='w-6 h-6 border-2 border-[#EF232E] border-t-transparent rounded-full animate-spin' />
                    <span className='text-white font-medium'>Loading 3D model...</span>
                  </div>
                </div>
              </Html>
            }>
              <GLTFModelWithHotspots
                modelPath={modelPath}
                hotspots={localHotspots}
                evidenceData={evidenceData}
                activeHotspot={activeHotspot}
                setActiveHotspot={setActiveHotspot}
                isEditMode={isEditMode}
                selectedHotspotId={selectedHotspotId}
                onSelectHotspot={handleSelectHotspot}
              />
            </Suspense>
            
            <OrbitControls 
              autoRotate={autoRotate && !isEditMode}
              autoRotateSpeed={1.2}
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minPolarAngle={0.3}
              maxPolarAngle={Math.PI - 0.3}
              target={[0, 0, 0]}
            />
          </Canvas>
        ) : (
          <div className='flex items-center justify-center h-full'>
            <div className='text-center'>
              <div className='w-24 h-24 bg-[#2a2a35] rounded-2xl flex items-center justify-center mx-auto mb-4'>
                <Info className='w-12 h-12 text-[#5a5a6e]' />
              </div>
              <p className='text-white text-lg font-medium'>No 3D Model Available</p>
              <p className='text-[#5a5a6e] text-sm mt-2'>3D visualization not available for this type</p>
            </div>
          </div>
        )}

        {/* Hotspot Info Panel */}
        {hotspotInfo && !isEditMode && (
          <div className='absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#1a1a22]/95 backdrop-blur-md border-2 border-[#EF232E] rounded-2xl px-8 py-5 shadow-2xl shadow-[#EF232E]/30 min-w-80'>
            <div className='flex items-center gap-4'>
              <div className='w-4 h-4 bg-[#EF232E] rounded-full animate-pulse' />
              <span className='text-[#7E8299] text-base'>{hotspotInfo.label}:</span>
              <span className='text-white font-bold text-xl'>{hotspotInfo.value}</span>
            </div>
          </div>
        )}

        {/* Hotspot count indicator */}
        {!isEditMode && localHotspots.length > 0 && (
          <div className='absolute top-6 right-6 bg-[#1a1a22]/90 backdrop-blur-sm border border-[#2a2a35] rounded-xl px-4 py-2.5 shadow-xl'>
            <div className='flex items-center gap-2'>
              <span className='w-3 h-3 bg-[#EF232E] rounded-full animate-pulse' />
              <span className='text-white font-semibold'>{localHotspots.length}</span>
              <span className='text-[#7E8299] text-sm'>hotspots</span>
            </div>
          </div>
        )}

        {/* Help button */}
        <button 
          onClick={(e) => {
            e.stopPropagation()
            setShowHelp(!showHelp)
          }}
          className='absolute top-6 left-6 px-4 py-2.5 bg-[#1a1a22]/90 backdrop-blur-sm border border-[#2a2a35] rounded-xl text-[#7E8299] hover:text-white hover:border-[#3a3a45] transition-all text-sm font-medium'
        >
          {showHelp ? 'Hide Help' : 'Controls'}
        </button>

        {/* Help Panel */}
        {showHelp && (
          <div className='absolute bottom-8 right-6 bg-[#1a1a22]/95 backdrop-blur-sm border border-[#2a2a35] rounded-xl p-5 shadow-xl'>
            <h3 className='text-white font-semibold mb-4'>Controls</h3>
            <div className='space-y-3 text-sm'>
              <div className='flex items-center gap-3 text-[#7E8299]'>
                <span className='w-8 h-8 bg-[#2a2a35] rounded-lg flex items-center justify-center text-xs font-medium'>LMB</span>
                <span>Rotate model</span>
              </div>
              <div className='flex items-center gap-3 text-[#7E8299]'>
                <span className='w-8 h-8 bg-[#2a2a35] rounded-lg flex items-center justify-center text-xs font-medium'>RMB</span>
                <span>Pan view</span>
              </div>
              <div className='flex items-center gap-3 text-[#7E8299]'>
                <span className='w-8 h-8 bg-[#2a2a35] rounded-lg flex items-center justify-center text-xs font-medium'>Scroll</span>
                <span>Zoom in/out</span>
              </div>
              <div className='flex items-center gap-3 text-[#7E8299]'>
                <span className='w-8 h-8 bg-[#2a2a35] rounded-lg flex items-center justify-center text-xs font-medium'>ESC</span>
                <span>Close viewer</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Export for use in admin panel
export type { EvidenceViewer3DProps }