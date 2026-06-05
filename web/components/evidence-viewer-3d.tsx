'use client'

import { useState, Suspense, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html, useGLTF } from '@react-three/drei'
import { X, RotateCcw, Info, Car, Bike } from 'lucide-react'
import * as THREE from 'three'

// Hotspot configuration - positions from user's data (relative to model center)
const HOTSPOT_CONFIGS = {
  pistol: [
    { id: 'sn', position: [-0.05, 0.15, 0.08] as [number, number, number], label: 'Serial Number', labelKey: 'serialNumber' },
    { id: 'owner', position: [0.15, -0.05, 0.08] as [number, number, number], label: 'Owner', labelKey: 'owner' },
    { id: 'model', position: [0.05, 0.18, 0.08] as [number, number, number], label: 'Model', labelKey: 'model' },
  ],
  rifle: [
    { id: 'sn', position: [-0.15, 0.15, 0.06] as [number, number, number], label: 'Serial Number', labelKey: 'serialNumber' },
    { id: 'owner', position: [0.18, 0.02, 0.06] as [number, number, number], label: 'Owner', labelKey: 'owner' },
    { id: 'model', position: [0.08, 0.22, 0.06] as [number, number, number], label: 'Model', labelKey: 'model' },
  ],
  car: [
    { id: 'plate', position: [0.05, 0.3, 0.6] as [number, number, number], label: 'Plate', labelKey: 'plateNumber' },
    { id: 'model', position: [-0.2, 0.8, 0.2] as [number, number, number], label: 'Model', labelKey: 'model' },
    { id: 'color', position: [-0.8, 0.35, 0.05] as [number, number, number], label: 'Color', labelKey: 'color' },
    { id: 'owner', position: [0.25, 1.0, 0.08] as [number, number, number], label: 'Owner', labelKey: 'owner' },
  ],
  motorcycle: [
    { id: 'plate', position: [-0.4, -0.1, 0.35] as [number, number, number], label: 'Plate Number', labelKey: 'plateNumber' },
    { id: 'owner', position: [-0.45, -0.05, 0.1] as [number, number, number], label: 'Owner', labelKey: 'owner' },
    { id: 'color', position: [-0.45, -0.02, -0.01] as [number, number, number], label: 'Color', labelKey: 'color' },
    { id: 'model', position: [-0.48, 0.0, -0.15] as [number, number, number], label: 'Model', labelKey: 'model' },
  ]
}

// Hotspot 2D Circle Component - red #EF232E
function HotspotCircle({ 
  position, 
  label, 
  value,
  isActive, 
  onClick
}: { 
  position: [number, number, number]
  label: string
  value: string
  isActive: boolean
  onClick: () => void
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
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5 + pulseOffset) * 0.015
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Outer pulsing ring */}
      <mesh ref={ringRef} rotation={[0, 0, 0]}>
        <ringGeometry args={[0.12, 0.18, 32]} />
        <meshBasicMaterial 
          color='#EF232E' 
          transparent 
          opacity={hovered || isActive ? 0.9 : 0.5} 
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Inner circle - 2D disc */}
      <mesh 
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setHovered(false)
          document.body.style.cursor = 'auto'
        }}
      >
        <circleGeometry args={[0.08, 32]} />
        <meshBasicMaterial 
          color='#EF232E' 
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

      {/* Label tooltip on hover */}
      {hovered && !isActive && (
        <Html position={[0, 0.25, 0]} center>
          <div className='bg-[#EF232E] text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-2xl whitespace-nowrap'>
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
}: { 
  modelPath: string
  hotspots: Array<{ id: string, position: [number, number, number], label: string, labelKey: string }>
  evidenceData: any
  activeHotspot: string | null
  setActiveHotspot: (id: string | null) => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  const [modelError, setModelError] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(false)
  
  const { scene } = useGLTF(modelPath)
  
  useEffect(() => {
    if (scene && !modelLoaded) {
      try {
        const box = new THREE.Box3().setFromObject(scene)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        
        scene.position.sub(center)
        
        const maxDim = Math.max(size.x, size.y, size.z)
        const scaleFactor = maxDim > 0 ? 1.5 / maxDim : 1
        scene.scale.setScalar(scaleFactor)
        
        scene.position.y = -size.y * scaleFactor / 2 + 0.3
        
        setModelLoaded(true)
      } catch (e) {
        setModelError(true)
      }
    }
  }, [scene, modelLoaded])

  useFrame((state) => {
    if (groupRef.current && !modelError) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.4
    }
  })

  if (modelError) {
    return (
      <group ref={groupRef}>
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[1.2, 0.3, 0.5]} />
          <meshStandardMaterial color='#3a3a4e' metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0.1, 0.4, 0]}>
          <boxGeometry args={[0.7, 0.25, 0.45]} />
          <meshStandardMaterial color='#4a4a5e' metalness={0.5} roughness={0.4} />
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
}

export function EvidenceViewer3D({
  isOpen,
  onClose,
  evidenceType,
  weaponType = 'pistol',
  vehicleType = 'car',
  setVehicleType,
  evidenceData = {}
}: EvidenceViewer3DProps) {
  const [autoRotate, setAutoRotate] = useState(true)
  const [showHelp, setShowHelp] = useState(false)
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null)
  const [hotspotInfo, setHotspotInfo] = useState<{ label: string; value: string } | null>(null)
  
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
  
  const getHotspots = () => {
    if (evidenceType === 'weapon') {
      return HOTSPOT_CONFIGS[weaponType] || HOTSPOT_CONFIGS.pistol
    }
    if (evidenceType === 'car') {
      return HOTSPOT_CONFIGS[vehicleType] || HOTSPOT_CONFIGS.car
    }
    return []
  }

  const hotspots = getHotspots()

  useEffect(() => {
    if (activeHotspot) {
      const hotspot = hotspots.find(h => h.id === activeHotspot)
      if (hotspot) {
        const value = evidenceData[hotspot.labelKey] || 'N/A'
        setHotspotInfo({ label: hotspot.label, value })
      }
    } else {
      setHotspotInfo(null)
    }
  }, [activeHotspot, hotspots, evidenceData])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const handleCanvasClick = () => {
    setActiveHotspot(null)
    setHotspotInfo(null)
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-[#0a0a0f] z-50 flex flex-col'>
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

      {/* 3D Canvas */}
      <div className='flex-1 relative' onClick={handleCanvasClick}>
        {modelPath ? (
          <Canvas 
            camera={{ position: [0, 0.5, 3], fov: 50 }} 
            onCreated={({ gl }) => {
              gl.setClearColor('#0a0a0f')
            }}
          >
            <ambientLight intensity={0.6} />
            <pointLight position={[8, 8, 8]} intensity={1.2} />
            <pointLight position={[-8, -8, -8]} intensity={0.4} />
            <pointLight position={[0, 6, 0]} intensity={0.6} />
            
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
                hotspots={hotspots}
                evidenceData={evidenceData}
                activeHotspot={activeHotspot}
                setActiveHotspot={setActiveHotspot}
              />
            </Suspense>
            
            <OrbitControls 
              autoRotate={autoRotate}
              autoRotateSpeed={1.2}
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minPolarAngle={0.3}
              maxPolarAngle={Math.PI / 2 - 0.1}
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
        {hotspotInfo && (
          <div className='absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#1a1a22]/95 backdrop-blur-md border-2 border-[#EF232E] rounded-2xl px-8 py-5 shadow-2xl shadow-[#EF232E]/30 min-w-80'>
            <div className='flex items-center gap-4'>
              <div className='w-4 h-4 bg-[#EF232E] rounded-full animate-pulse' />
              <span className='text-[#7E8299] text-base'>{hotspotInfo.label}:</span>
              <span className='text-white font-bold text-xl'>{hotspotInfo.value}</span>
            </div>
          </div>
        )}

        {/* Hotspot count indicator */}
        {hotspots.length > 0 && (
          <div className='absolute top-6 right-6 bg-[#1a1a22]/90 backdrop-blur-sm border border-[#2a2a35] rounded-xl px-4 py-2.5 shadow-xl'>
            <div className='flex items-center gap-2'>
              <span className='w-3 h-3 bg-[#EF232E] rounded-full animate-pulse' />
              <span className='text-white font-semibold'>{hotspots.length}</span>
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

export function generateWeaponHotspots(data: any, type: string) {
  return HOTSPOT_CONFIGS[type as keyof typeof HOTSPOT_CONFIGS] || HOTSPOT_CONFIGS.pistol
}

export function generateCarHotspots(data: any, vehicleType: 'car' | 'motorcycle' = 'car') {
  return HOTSPOT_CONFIGS[vehicleType] || HOTSPOT_CONFIGS.car
}