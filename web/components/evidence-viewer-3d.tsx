'use client'

import { useState, Suspense, useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html, useGLTF } from '@react-three/drei'
import { X, RotateCcw, Info, Car, Bike } from 'lucide-react'
import * as THREE from 'three'

// Hotspot configuration for each model type with exact positions from user data
const HOTSPOT_CONFIGS = {
  pistol: [
    { id: 'hotspot-1', position: [-0.128, 0.505, -0.134] as [number, number, number], label: 'Serial Number', labelKey: 'serialNumber' },
    { id: 'hotspot-2', position: [0.711, -0.183, -0.154] as [number, number, number], label: 'Owner', labelKey: 'owner' },
    { id: 'hotspot-3', position: [0.471, 0.631, -0.134] as [number, number, number], label: 'Model', labelKey: 'model' },
  ],
  rifle: [
    { id: 'hotspot-3', position: [-0.3, 0.05, 0.05] as [number, number, number], label: 'Serial Number', labelKey: 'serialNumber' },
    { id: 'hotspot-5', position: [0.36, -0.01, -0.01] as [number, number, number], label: 'Owner', labelKey: 'owner' },
    { id: 'hotspot-7', position: [0.17, 0.20, -0.02] as [number, number, number], label: 'Model', labelKey: 'model' },
  ],
  car: [
    { id: 'hotspot-1', position: [0.15, 0.5, 0.8] as [number, number, number], label: 'Plate', labelKey: 'plateNumber' },
    { id: 'hotspot-2', position: [-0.48, 1.5, 0.26] as [number, number, number], label: 'Model', labelKey: 'model' },
    { id: 'hotspot-3', position: [-1.56, 0.67, 0.06] as [number, number, number], label: 'Color', labelKey: 'color' },
    { id: 'hotspot-6', position: [0.57, 1.9, 0.10] as [number, number, number], label: 'Owner', labelKey: 'owner' },
  ],
  motorcycle: [
    { id: 'hotspot-1', position: [-1.15, -0.24, 0.85] as [number, number, number], label: 'Plate Number', labelKey: 'plateNumber' },
    { id: 'hotspot-2', position: [-1.24, -0.13, 0.26] as [number, number, number], label: 'Owner', labelKey: 'owner' },
    { id: 'hotspot-3', position: [-1.24, -0.07, -0.01] as [number, number, number], label: 'Color', labelKey: 'color' },
    { id: 'hotspot-4', position: [-1.29, -0.03, -0.33] as [number, number, number], label: 'Model', labelKey: 'model' },
  ]
}

// Hotspot 2D Circle Component with red color #EF232E
function HotspotCircle({ 
  position, 
  label, 
  value,
  isActive, 
  onClick,
  scale = 1
}: { 
  position: [number, number, number]
  label: string
  value: string
  isActive: boolean
  onClick: () => void
  scale?: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  
  useFrame((state) => {
    if (ringRef.current) {
      // Pulsing animation
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.1 + 1
      ringRef.current.scale.setScalar(pulse * scale)
    }
    if (groupRef.current) {
      // Subtle floating animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.02
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Outer pulsing ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[0.08 * scale, 0.12 * scale, 32]} />
        <meshBasicMaterial 
          color='#EF232E' 
          transparent 
          opacity={hovered || isActive ? 0.8 : 0.4} 
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Inner circle - 2D disc */}
      <mesh 
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        onPointerOver={() => {
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'auto'
        }}
      >
        <circleGeometry args={[0.06 * scale, 32]} />
        <meshBasicMaterial 
          color='#EF232E' 
          transparent 
          opacity={hovered || isActive ? 1 : 0.85}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Center dot */}
      <mesh>
        <circleGeometry args={[0.02 * scale, 16]} />
        <meshBasicMaterial color='#ffffff' transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Label tooltip on hover */}
      {hovered && !isActive && (
        <Html position={[0, 0.15 * scale, 0]} center>
          <div className='bg-[#EF232E] text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg whitespace-nowrap'>
            {label}
          </div>
        </Html>
      )}
    </group>
  )
}

// Infinite ground plane
function InfiniteGround() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial 
        color='#1a1a22' 
        transparent 
        opacity={0.8}
        roughness={0.9}
        metalness={0.1}
      />
    </mesh>
  )
}

// GLTF Model with hotspots
function GLTFModelWithHotspots({ 
  modelPath, 
  hotspots, 
  modelType,
  evidenceData,
  activeHotspot,
  setActiveHotspot,
  scale = 1
}: { 
  modelPath: string
  hotspots: Array<{ id: string, position: [number, number, number], label: string, labelKey: string }>
  modelType: string
  evidenceData: any
  activeHotspot: string | null
  setActiveHotspot: (id: string | null) => void
  scale?: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  const [modelError, setModelError] = useState(false)
  
  const { scene } = useGLTF(modelPath)
  
  useFrame((state) => {
    if (groupRef.current && !modelError) {
      // Smooth auto rotation
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  // Handle model loading error
  useEffect(() => {
    try {
      // Center and scale the model
      const box = new THREE.Box3().setFromObject(scene)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      
      // Reset position to center
      scene.position.sub(center)
      
      // Scale to fit
      const maxDim = Math.max(size.x, size.y, size.z)
      const scaleFactor = maxDim > 0 ? 2 / maxDim : 1
      scene.scale.setScalar(scaleFactor * scale)
      
      // Move up so it sits on ground
      scene.position.y = -size.y * scaleFactor / 2 + 0.2
    } catch (e) {
      setModelError(true)
    }
  }, [scene, scale])

  if (modelError) {
    return (
      <group ref={groupRef} scale={0.5}>
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[1.8, 0.4, 0.8]} />
          <meshStandardMaterial color='#2a2a3e' metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0.1, 0.4, 0]}>
          <boxGeometry args={[1, 0.3, 0.7]} />
          <meshStandardMaterial color='#3a3a4e' metalness={0.5} roughness={0.4} />
        </mesh>
      </group>
    )
  }

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
      
      {/* Hotspots */}
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
            scale={scale * 0.8}
          />
        )
      })}
    </group>
  )
}

// Fallback placeholder model
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
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.8, 0.15, 0.12]} />
          <meshStandardMaterial color='#2a2a2a' metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.4, 16]} />
          <meshStandardMaterial color='#1a1a1a' metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[-0.2, -0.15, 0]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[0.12, 0.25, 0.1]} />
          <meshStandardMaterial color='#3d2b1f' roughness={0.8} />
        </mesh>
      </group>
    )
  }
  
  return (
    <group ref={groupRef} scale={0.5}>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[1.8, 0.4, 0.8]} />
        <meshStandardMaterial color='#1a1a2e' metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.1, 0.4, 0]}>
        <boxGeometry args={[1, 0.3, 0.7]} />
        <meshStandardMaterial color='#2a2a3e' metalness={0.5} roughness={0.4} />
      </mesh>
      {([[-0.5, 0, 0.45], [-0.5, 0, -0.45], [0.5, 0, 0.45], [0.5, 0, -0.45]] as [number, number, number][]).map((pos, i) => (
        <mesh key={i} position={pos} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
          <meshStandardMaterial color='#111111' roughness={0.9} />
        </mesh>
      ))}
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

// Main component
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
  const [modelError, setModelError] = useState(false)
  const [hotspotInfo, setHotspotInfo] = useState<{ label: string; value: string } | null>(null)
  
  // Determine model path based on type
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
  
  // Get hotspots based on model type
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

  // Handle canvas click to close hotspot
  const handleCanvasClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'CANVAS') {
      setActiveHotspot(null)
      setHotspotInfo(null)
    }
  }

  // Get active hotspot details
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

  // Keyboard close handler
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

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-[#0f0f14]/95 backdrop-blur-sm z-50 flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between px-6 py-4 border-b border-[#2a2a35]'>
        <div className='flex items-center gap-4'>
          <div className='w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center'>
            <Info className='w-5 h-5 text-white' />
          </div>
          <div>
            <h2 className='text-white font-bold text-lg'>3D Evidence Viewer</h2>
            <p className='text-[#7E8299] text-sm capitalize'>
              {evidenceType === 'weapon' 
                ? `${weaponType} - ${evidenceData.model || 'Unknown Model'}` 
                : evidenceType === 'car' 
                  ? `${vehicleType} - ${evidenceData.model || evidenceData.make || 'Unknown Vehicle'}` 
                  : 'Evidence Model'}
            </p>
          </div>
        </div>
        
        <div className='flex items-center gap-3'>
          {/* Vehicle type selector for car evidence */}
          {evidenceType === 'car' && setVehicleType && (
            <div className='flex items-center gap-2 bg-[#1a1a22] rounded-xl p-1'>
              <button
                onClick={() => setVehicleType('car')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  vehicleType === 'car' 
                    ? 'bg-[#EF232E]/20 text-[#EF232E] border border-[#EF232E]/30' 
                    : 'text-[#7E8299] hover:text-white'
                }`}
              >
                <Car className='w-4 h-4' /> Car
              </button>
              <button
                onClick={() => setVehicleType('motorcycle')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  vehicleType === 'motorcycle' 
                    ? 'bg-[#EF232E]/20 text-[#EF232E] border border-[#EF232E]/30' 
                    : 'text-[#7E8299] hover:text-white'
                }`}
              >
                <Bike className='w-4 h-4' /> Motorcycle
              </button>
            </div>
          )}
          
          <button 
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2.5 rounded-xl transition-all ${autoRotate ? 'bg-[#EF232E] text-white' : 'bg-[#2a2a35] text-[#7E8299] hover:text-white'}`}
            title={autoRotate ? 'Stop rotation' : 'Auto rotate'}
          >
            <RotateCcw className={`w-5 h-5 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
          </button>
          
          <button 
            onClick={onClose}
            className='p-2.5 bg-[#2a2a35] hover:bg-[#EF232E]/20 rounded-xl text-[#7E8299] hover:text-[#EF232E] transition-all'
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
            camera={{ position: [0, 1, 3], fov: 45 }} 
            onCreated={({ gl }) => {
              gl.setClearColor('#0f0f14')
            }}
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.3} />
            <pointLight position={[0, 5, 0]} intensity={0.5} />
            
            <Suspense fallback={
              <Html center>
                <div className='bg-[#1a1a22] border border-[#2a2a35] rounded-xl px-6 py-4 shadow-2xl'>
                  <div className='flex items-center gap-3'>
                    <div className='w-5 h-5 border-2 border-[#EF232E] border-t-transparent rounded-full animate-spin' />
                    <span className='text-white'>Loading 3D model...</span>
                  </div>
                </div>
              </Html>
            }>
              <GLTFModelWithHotspots
                modelPath={modelPath}
                hotspots={hotspots}
                modelType={evidenceType === 'weapon' ? weaponType : vehicleType}
                evidenceData={evidenceData}
                activeHotspot={activeHotspot}
                setActiveHotspot={setActiveHotspot}
                scale={1}
              />
              <InfiniteGround />
            </Suspense>
            
            <OrbitControls 
              autoRotate={autoRotate}
              autoRotateSpeed={1.5}
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minPolarAngle={0.2}
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
              <p className='text-[#5a5a6e] text-sm mt-2'>3D visualization is not available for this evidence type</p>
            </div>
          </div>
        )}

        {/* Hotspot Info Panel */}
        {hotspotInfo && (
          <div className='absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#1a1a22]/95 backdrop-blur-sm border border-[#EF232E] rounded-2xl px-6 py-4 shadow-2xl shadow-[#EF232E]/20 min-w-72'>
            <div className='flex items-center gap-3'>
              <div className='w-3 h-3 bg-[#EF232E] rounded-full' />
              <span className='text-[#7E8299] text-sm'>{hotspotInfo.label}:</span>
              <span className='text-white font-semibold text-lg'>{hotspotInfo.value}</span>
            </div>
          </div>
        )}

        {/* Help Panel */}
        {showHelp && (
          <div className='absolute bottom-6 right-6 bg-[#1a1a22]/95 backdrop-blur-sm border border-[#2a2a35] rounded-xl p-4 shadow-xl'>
            <h3 className='text-white font-semibold text-sm mb-3'>Controls</h3>
            <div className='space-y-2 text-sm'>
              <div className='flex items-center gap-2 text-[#7E8299]'>
                <span className='w-6 h-6 bg-[#2a2a35] rounded flex items-center justify-center text-xs'>LMB</span>
                <span>Rotate</span>
              </div>
              <div className='flex items-center gap-2 text-[#7E8299]'>
                <span className='w-6 h-6 bg-[#2a2a35] rounded flex items-center justify-center text-xs'>RMB</span>
                <span>Pan</span>
              </div>
              <div className='flex items-center gap-2 text-[#7E8299]'>
                <span className='w-6 h-6 bg-[#2a2a35] rounded flex items-center justify-center text-xs'>Scroll</span>
                <span>Zoom</span>
              </div>
              <div className='flex items-center gap-2 text-[#7E8299]'>
                <span className='w-6 h-6 bg-[#2a2a35] rounded flex items-center justify-center text-xs'>ESC</span>
                <span>Close</span>
              </div>
            </div>
          </div>
        )}

        {/* Hotspot indicator */}
        {hotspots.length > 0 && (
          <div className='absolute top-6 right-6 bg-[#1a1a22]/95 backdrop-blur-sm border border-[#2a2a35] rounded-xl px-4 py-2 shadow-xl'>
            <div className='flex items-center gap-2'>
              <span className='w-3 h-3 bg-[#EF232E] rounded-full animate-pulse' />
              <span className='text-white text-sm font-medium'>{hotspots.length}</span>
              <span className='text-[#7E8299] text-sm'>hotspots</span>
            </div>
          </div>
        )}

        {/* Help toggle button */}
        <button 
          onClick={() => setShowHelp(!showHelp)}
          className='absolute top-6 left-6 px-4 py-2 bg-[#1a1a22]/95 backdrop-blur-sm border border-[#2a2a35] rounded-xl text-[#7E8299] hover:text-white hover:border-[#3a3a45] transition-all text-sm'
        >
          {showHelp ? 'Hide Help' : 'Show Help'}
        </button>
      </div>
    </div>
  )
}

// Export helper functions for generating hotspots
export function generateWeaponHotspots(data: any, type: string) {
  return HOTSPOT_CONFIGS[type as keyof typeof HOTSPOT_CONFIGS] || HOTSPOT_CONFIGS.pistol
}

export function generateCarHotspots(data: any, vehicleType: 'car' | 'motorcycle' = 'car') {
  return HOTSPOT_CONFIGS[vehicleType] || HOTSPOT_CONFIGS.car
}