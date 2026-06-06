'use client'

import { useState, Suspense, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html, Grid, useGLTF } from '@react-three/drei'
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
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.15
      groupRef.current.scale.setScalar(scale)
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <mesh
        onClick={(e) => { e.stopPropagation(); onClick() }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto' }}
      >
        <circleGeometry args={[0.08, 32]} />
        <meshBasicMaterial color='#EF232E' transparent opacity={hovered || isActive ? 1 : 0.85} />
      </mesh>
      <mesh>
        <circleGeometry args={[0.03, 16]} />
        <meshBasicMaterial color='#ffffff' />
      </mesh>
      {hovered && !isActive && (
        <Html position={[0, 0.18, 0]} center>
          <div className='bg-[#EF232E] text-white px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap'>
            {label}
          </div>
        </Html>
      )}
    </group>
  )
}

// GLTF Model with hotspots
function GLTFModel({ 
  modelPath, 
  hotspots, 
  evidenceData,
  activeHotspot,
  setActiveHotspot,
  isRotating
}: { 
  modelPath: string
  hotspots: HotspotConfig[]
  evidenceData: any
  activeHotspot: string | null
  setActiveHotspot: (id: string | null) => void
  isRotating: boolean
}) {
  const groupRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF(modelPath)
  
  useEffect(() => {
    if (scene) {
      const box = new THREE.Box3().setFromObject(scene)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      
      scene.position.sub(center)
      
      const maxDim = Math.max(size.x, size.y, size.z)
      const scaleFactor = maxDim > 0 ? 1.5 / maxDim : 1
      scene.scale.setScalar(scaleFactor)
      
      scene.position.y = -size.y * scaleFactor / 2 + 0.2
      
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              if (mat.emissive) {
                mat.emissive.setHex(0x333333)
                mat.emissiveIntensity = 0.4
              }
            })
          } else {
            if (child.material.emissive) {
              child.material.emissive.setHex(0x333333)
              child.material.emissiveIntensity = 0.4
            }
          }
        }
      })
    }
  }, [scene])

  useFrame((state) => {
    if (groupRef.current && isRotating) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.4
    }
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
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
  customHotspots?: HotspotConfig[]
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
      if (e.key === 'Escape') onClose()
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
    <div className='fixed inset-0 bg-[#0a0a12] z-50 flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between px-6 py-4 bg-[#1a1a22]/90 backdrop-blur-md border-b border-[#2a2a35]'>
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
          {evidenceType === 'car' && setVehicleType && (
            <div className='flex items-center gap-1 bg-[#0f0f14] rounded-xl p-1'>
              <button
                onClick={() => setVehicleType('car')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  vehicleType === 'car' ? 'bg-[#EF232E] text-white' : 'text-[#7E8299] hover:text-white hover:bg-[#2a2a35]'
                }`}
              >
                <Car className='w-4 h-4' /> Car
              </button>
              <button
                onClick={() => setVehicleType('motorcycle')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  vehicleType === 'motorcycle' ? 'bg-[#EF232E] text-white' : 'text-[#7E8299] hover:text-white hover:bg-[#2a2a35]'
                }`}
              >
                <Bike className='w-4 h-4' /> Motorcycle
              </button>
            </div>
          )}
          
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`p-3 rounded-xl transition-all ${isRotating ? 'bg-[#EF232E] text-white' : 'bg-[#2a2a35] text-[#7E8299] hover:text-white'}`}
            title={isRotating ? 'Stop Rotation' : 'Start Rotation'}
          >
            {isRotating ? <StopCircle className='w-5 h-5' /> : <RotateCcw className='w-5 h-5' />}
          </button>
          
          <button onClick={onClose} className='p-3 bg-[#2a2a35] hover:bg-red-500 rounded-xl text-[#7E8299] hover:text-white transition-all'>
            <X className='w-5 h-5' />
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className='flex-1 relative' onClick={handleCanvasClick}>
        <Canvas camera={{ position: [0, 1, 4], fov: 45 }} gl={{ antialias: true, alpha: false }}>
          {/* Background */}
          <color attach='background' args={['#0a0a12']} />
          
          {/* Grid Floor */}
          <Grid 
            args={[20, 20]} 
            position={[0, -0.5, 0]} 
            cellSize={0.5}
            cellThickness={0.5}
            cellColor='#333344'
            sectionSize={2}
            sectionThickness={1}
            sectionColor='#444466'
            fadeDistance={25}
            fadeStrength={1}
            infiniteGrid={true}
          />
          
          {/* Lighting - Bright scene */}
          <ambientLight intensity={1.2} />
          <directionalLight position={[5, 8, 5]} intensity={2} castShadow />
          <directionalLight position={[-5, 3, -5]} intensity={1} color='#aabbff' />
          <pointLight position={[0, 5, 0]} intensity={1.5} color='#ffffff' />
          <pointLight position={[3, 2, 3]} intensity={0.8} color='#ffeecc' />
          <pointLight position={[-3, 2, -3]} intensity={0.5} color='#ccddff' />

          {modelPath && (
            <Suspense fallback={
              <Html center>
                <div className='bg-[#1a1a22] rounded-xl px-6 py-4 shadow-xl'>
                  <div className='flex items-center gap-3'>
                    <div className='w-5 h-5 border-2 border-[#EF232E] border-t-transparent rounded-full animate-spin' />
                    <span className='text-white'>Loading model...</span>
                  </div>
                </div>
              </Html>
            }>
              <GLTFModel 
                modelPath={modelPath}
                hotspots={hotspots}
                evidenceData={evidenceData}
                activeHotspot={activeHotspot}
                setActiveHotspot={setActiveHotspot}
                isRotating={isRotating}
              />
            </Suspense>
          )}
          
          <OrbitControls 
            autoRotate={false}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minPolarAngle={0.2}
            maxPolarAngle={Math.PI / 2 + 0.2}
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
              <span className='w-3 h-3 bg-[#EF232E] rounded-full animate-pulse' />
              <span className='text-white font-semibold'>{hotspots.length}</span>
              <span className='text-[#7E8299] text-sm'>hotspots</span>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className='absolute bottom-6 left-6 bg-[#1a1a22]/90 backdrop-blur-sm border border-[#2a2a35] rounded-xl p-4'>
          <h4 className='text-white font-semibold mb-2 text-sm'>Controls</h4>
          <div className='text-[#7E8299] text-xs space-y-1'>
            <p>• Left drag: Rotate</p>
            <p>• Right drag: Pan</p>
            <p>• Scroll: Zoom</p>
            <p>• ESC: Close</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export type { EvidenceViewer3DProps }