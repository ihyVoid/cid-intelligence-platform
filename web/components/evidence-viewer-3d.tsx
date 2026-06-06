'use client'

import { useState, Suspense, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import { X, RotateCcw, Info, Car, Bike, StopCircle } from 'lucide-react'
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

// Simple placeholder model
function PlaceholderModel({ type }: { type: string }) {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  if (type === 'pistol' || type === 'rifle') {
    return (
      <group ref={groupRef}>
        {/* Body */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.8, 0.15, 0.12]} />
          <meshStandardMaterial color='#444444' metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Barrel */}
        <mesh position={[0.5, 0, 0]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.4, 16]} />
          <meshStandardMaterial color='#333333' metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Handle */}
        <mesh position={[-0.2, -0.12, 0]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[0.12, 0.2, 0.1]} />
          <meshStandardMaterial color='#5c4033' roughness={0.8} />
        </mesh>
      </group>
    )
  }

  return (
    <group ref={groupRef} scale={0.5}>
      {/* Car body */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[1.8, 0.4, 0.8]} />
        <meshStandardMaterial color='#2a2a3e' metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0.1, 0.4, 0]}>
        <boxGeometry args={[1, 0.3, 0.7]} />
        <meshStandardMaterial color='#3a3a4e' metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Wheels */}
      <mesh position={[-0.5, 0, 0.45]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
        <meshStandardMaterial color='#111111' roughness={0.9} />
      </mesh>
      <mesh position={[-0.5, 0, -0.45]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
        <meshStandardMaterial color='#111111' roughness={0.9} />
      </mesh>
      <mesh position={[0.5, 0, 0.45]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
        <meshStandardMaterial color='#111111' roughness={0.9} />
      </mesh>
      <mesh position={[0.5, 0, -0.45]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
        <meshStandardMaterial color='#111111' roughness={0.9} />
      </mesh>
    </group>
  )
}

// Hotspot Circle Component
function HotspotMarker({ 
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
  const [hovered, setHovered] = useState(false)
  
  useFrame((state) => {
    if (groupRef.current) {
      // Pulse animation
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.15
      groupRef.current.scale.setScalar(scale)
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Outer ring */}
      <mesh
        onClick={(e) => { e.stopPropagation(); onClick() }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto' }}
      >
        <circleGeometry args={[0.1, 32]} />
        <meshBasicMaterial 
          color='#EF232E' 
          transparent 
          opacity={hovered || isActive ? 1 : 0.8} 
        />
      </mesh>
      
      {/* Inner dot */}
      <mesh>
        <circleGeometry args={[0.04, 16]} />
        <meshBasicMaterial color='#ffffff' />
      </mesh>

      {/* Label on hover */}
      {hovered && !isActive && (
        <Html position={[0, 0.2, 0]} center>
          <div className='bg-[#EF232E] text-white px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap'>
            {label}
          </div>
        </Html>
      )}
    </group>
  )
}

// Model wrapper with hotspots
function ModelWithHotspots({ 
  type,
  hotspots, 
  evidenceData,
  activeHotspot,
  setActiveHotspot,
  isRotating
}: { 
  type: string
  hotspots: HotspotConfig[]
  evidenceData: any
  activeHotspot: string | null
  setActiveHotspot: (id: string | null) => void
  isRotating: boolean
}) {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current && isRotating) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.4
    }
  })

  return (
    <group ref={groupRef}>
      <PlaceholderModel type={type} />
      
      {hotspots.map((hotspot) => {
        const value = evidenceData[hotspot.labelKey] || 'N/A'
        return (
          <HotspotMarker
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
  customHotspots
}: EvidenceViewer3DProps) {
  const [isRotating, setIsRotating] = useState(true)
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null)
  const [hotspotInfo, setHotspotInfo] = useState<{ label: string; value: string } | null>(null)

  const getModelType = () => {
    if (evidenceType === 'weapon') return weaponType
    if (evidenceType === 'car') return vehicleType
    return 'car'
  }

  const modelType = getModelType()
  
  const hotspots = customHotspots && customHotspots.length > 0 
    ? customHotspots 
    : DEFAULT_HOTSPOTS[modelType] || DEFAULT_HOTSPOTS.car

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
    <div className='fixed inset-0 bg-gradient-to-br from-[#0f0f14] to-[#1a1a2e] z-50 flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between px-6 py-4 bg-[#1a1a22]/80 backdrop-blur-md border-b border-[#2a2a35]'>
        <div className='flex items-center gap-4'>
          <div className='w-12 h-12 bg-gradient-to-br from-[#EF232E] to-[#c41b24] rounded-xl flex items-center justify-center shadow-lg'>
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
                    ? 'bg-[#EF232E] text-white' 
                    : 'text-[#7E8299] hover:text-white hover:bg-[#2a2a35]'
                }`}
              >
                <Car className='w-4 h-4' /> Car
              </button>
              <button
                onClick={() => setVehicleType('motorcycle')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  vehicleType === 'motorcycle' 
                    ? 'bg-[#EF232E] text-white' 
                    : 'text-[#7E8299] hover:text-white hover:bg-[#2a2a35]'
                }`}
              >
                <Bike className='w-4 h-4' /> Motorcycle
              </button>
            </div>
          )}
          
          {/* Rotate button */}
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`p-3 rounded-xl transition-all ${
              isRotating 
                ? 'bg-[#EF232E] text-white' 
                : 'bg-[#2a2a35] text-[#7E8299] hover:text-white'
            }`}
            title={isRotating ? 'Stop Rotation' : 'Start Rotation'}
          >
            {isRotating ? (
              <StopCircle className='w-5 h-5' />
            ) : (
              <RotateCcw className='w-5 h-5' />
            )}
          </button>
          
          {/* Close button */}
          <button 
            onClick={onClose}
            className='p-3 bg-[#2a2a35] hover:bg-red-500 rounded-xl text-[#7E8299] hover:text-white transition-all'
          >
            <X className='w-5 h-5' />
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className='flex-1 relative' onClick={handleCanvasClick}>
        <Canvas 
          camera={{ position: [0, 0.5, 4], fov: 50 }}
          onCreated={({ gl }) => {
            gl.setClearColor('#0f0f14')
          }}
        >
          {/* Lighting */}
          <ambientLight intensity={1} />
          <directionalLight position={[5, 5, 5]} intensity={1.5} />
          <directionalLight position={[-5, 3, -5]} intensity={0.8} />
          <pointLight position={[0, 5, 0]} intensity={1} color='#ffffff' />

          <Suspense fallback={
            <Html center>
              <div className='bg-[#1a1a22] rounded-xl px-6 py-4 shadow-xl'>
                <div className='flex items-center gap-3'>
                  <div className='w-5 h-5 border-2 border-[#EF232E] border-t-transparent rounded-full animate-spin' />
                  <span className='text-white'>Loading...</span>
                </div>
              </div>
            </Html>
          }>
            <ModelWithHotspots
              type={modelType}
              hotspots={hotspots}
              evidenceData={evidenceData}
              activeHotspot={activeHotspot}
              setActiveHotspot={setActiveHotspot}
              isRotating={isRotating}
            />
          </Suspense>
          
          <OrbitControls 
            autoRotate={false}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minPolarAngle={0.3}
            maxPolarAngle={Math.PI - 0.3}
          />
        </Canvas>

        {/* Hotspot Info Panel */}
        {hotspotInfo && (
          <div className='absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#1a1a22]/95 backdrop-blur-md border-2 border-[#EF232E] rounded-2xl px-8 py-5 shadow-2xl shadow-[#EF232E]/20 min-w-80'>
            <div className='flex items-center gap-4'>
              <div className='w-4 h-4 bg-[#EF232E] rounded-full' />
              <span className='text-[#7E8299] text-base'>{hotspotInfo.label}:</span>
              <span className='text-white font-bold text-xl'>{hotspotInfo.value}</span>
            </div>
          </div>
        )}

        {/* Hotspot count */}
        {hotspots.length > 0 && (
          <div className='absolute top-6 right-6 bg-[#1a1a22]/90 backdrop-blur-sm border border-[#2a2a35] rounded-xl px-4 py-2.5'>
            <div className='flex items-center gap-2'>
              <span className='w-3 h-3 bg-[#EF232E] rounded-full' />
              <span className='text-white font-semibold'>{hotspots.length}</span>
              <span className='text-[#7E8299] text-sm'>hotspots</span>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className='absolute bottom-6 left-6 bg-[#1a1a22]/90 backdrop-blur-sm border border-[#2a2a35] rounded-xl p-4'>
          <h4 className='text-white font-semibold mb-2 text-sm'>Controls</h4>
          <div className='text-[#7E8299] text-xs space-y-1'>
            <p>• Left click + drag: Rotate</p>
            <p>• Right click + drag: Pan</p>
            <p>• Scroll: Zoom</p>
            <p>• ESC: Close</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export type { EvidenceViewer3DProps }