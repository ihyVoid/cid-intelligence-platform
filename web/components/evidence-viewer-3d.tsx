'use client'

import { useState, Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stage, Html, useTexture, Environment } from '@react-three/drei'
import { X, Maximize2, RotateCcw, Info, ChevronRight } from 'lucide-react'
import * as THREE from 'three'

// Hotspot component for interactive points on 3D model
function Hotspot({ position, label, details, onClick }: {
  position: [number, number, number]
  label: string
  details: Record<string, string>
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)

  return (
    <group position={position}>
      {/* Hotspot sphere */}
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          setClicked(!clicked)
          onClick()
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial 
          color={clicked ? '#ef4444' : hovered ? '#fbbf24' : '#6366f1'} 
          emissive={clicked ? '#ef4444' : hovered ? '#fbbf24' : '#6366f1'}
          emissiveIntensity={hovered || clicked ? 0.5 : 0.2}
        />
      </mesh>
      
      {/* Pulsing ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.06, 0.08, 32]} />
        <meshBasicMaterial color={clicked ? '#ef4444' : '#6366f1'} transparent opacity={0.5} />
      </mesh>

      {/* Label on hover */}
      {hovered && (
        <Html position={[0, 0.15, 0]} center>
          <div className='bg-[#1a1a22] border border-[#2a2a35] rounded-lg px-3 py-1.5 shadow-xl'>
            <p className='text-white text-xs font-medium'>{label}</p>
          </div>
        </Html>
      )}

      {/* Details panel when clicked */}
      {clicked && (
        <Html position={[0.15, 0, 0]} center>
          <div className='bg-[#1a1a22] border border-[#2a2a35] rounded-xl p-4 shadow-xl w-64'>
            <h4 className='text-white font-semibold text-sm mb-2 flex items-center gap-2'>
              <Info className='w-4 h-4 text-red-400' />
              {label}
            </h4>
            <div className='space-y-2'>
              {Object.entries(details).map(([key, value]) => (
                <div key={key} className='flex justify-between gap-2'>
                  <span className='text-[#7E8299] text-xs capitalize'>{key}:</span>
                  <span className='text-white text-xs font-medium'>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

// Pistol 3D Model
function PistolModel({ hotspots }: { hotspots: Array<{ position: [number, number, number], label: string, details: Record<string, string> }> }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  return (
    <group ref={meshRef}>
      {/* Main body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.8, 0.15, 0.12]} />
        <meshStandardMaterial color='#2a2a2a' metalness={0.8} roughness={0.3} />
      </mesh>
      
      {/* Barrel */}
      <mesh position={[0.5, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.4, 16]} />
        <meshStandardMaterial color='#1a1a1a' metalness={0.9} roughness={0.2} />
      </mesh>
      
      {/* Handle/Grip */}
      <mesh position={[-0.2, -0.15, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.12, 0.25, 0.1]} />
        <meshStandardMaterial color='#3d2b1f' roughness={0.8} />
      </mesh>
      
      {/* Trigger guard */}
      <mesh position={[-0.05, -0.08, 0]} rotation={[0, 0, Math.PI / 6]}>
        <torusGeometry args={[0.04, 0.01, 8, 16, Math.PI]} />
        <meshStandardMaterial color='#2a2a2a' metalness={0.7} />
      </mesh>
      
      {/* Slide */}
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[0.6, 0.05, 0.11]} />
        <meshStandardMaterial color='#333333' metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Add hotspots */}
      {hotspots.map((hotspot, i) => (
        <Hotspot key={i} {...hotspot} onClick={() => {}} />
      ))}
    </group>
  )
}

// Rifle 3D Model
function RifleModel({ hotspots }: { hotspots: Array<{ position: [number, number, number], label: string, details: Record<string, string> }> }) {
  return (
    <group>
      {/* Stock */}
      <mesh position={[-0.5, 0, 0]}>
        <boxGeometry args={[0.3, 0.08, 0.06]} />
        <meshStandardMaterial color='#2a2a2a' metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Body/Receiver */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.8, 0.1, 0.08]} />
        <meshStandardMaterial color='#333333' metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Barrel */}
      <mesh position={[0.6, 0.02, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.6, 16]} />
        <meshStandardMaterial color='#1a1a1a' metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Magazine */}
      <mesh position={[0.1, -0.12, 0]}>
        <boxGeometry args={[0.08, 0.2, 0.04]} />
        <meshStandardMaterial color='#444444' metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Scope */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.3, 16]} />
        <meshStandardMaterial color='#1a1a1a' metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Grip */}
      <mesh position={[-0.1, -0.12, 0]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.05, 0.12, 0.05]} />
        <meshStandardMaterial color='#3d2b1f' roughness={0.8} />
      </mesh>

      {/* Add hotspots */}
      {hotspots.map((hotspot, i) => (
        <Hotspot key={i} {...hotspot} onClick={() => {}} />
      ))}
    </group>
  )
}

// Car 3D Model
function CarModel({ hotspots }: { hotspots: Array<{ position: [number, number, number], label: string, details: Record<string, string> }> }) {
  return (
    <group scale={[0.5, 0.5, 0.5]}>
      {/* Car body */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[1.8, 0.4, 0.8]} />
        <meshStandardMaterial color='#1a1a2e' metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Cabin */}
      <mesh position={[0.1, 0.4, 0]}>
        <boxGeometry args={[1, 0.3, 0.7]} />
        <meshStandardMaterial color='#2a2a3e' metalness={0.5} roughness={0.4} />
      </mesh>
      
      {/* Hood */}
      <mesh position={[0.7, 0.2, 0]}>
        <boxGeometry args={[0.5, 0.15, 0.7]} />
        <meshStandardMaterial color='#1a1a2e' metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Trunk */}
      <mesh position={[-0.7, 0.2, 0]}>
        <boxGeometry args={[0.4, 0.15, 0.7]} />
        <meshStandardMaterial color='#1a1a2e' metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Wheels */}
      {[[-0.5, 0, 0.45], [-0.5, 0, -0.45], [0.5, 0, 0.45], [0.5, 0, -0.45]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
          <meshStandardMaterial color='#111111' roughness={0.9} />
        </mesh>
      ))}

      {/* Headlights */}
      <mesh position={[0.9, 0.15, 0.3]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color='#ffffaa' emissive='#ffff00' emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.9, 0.15, -0.3]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color='#ffffaa' emissive='#ffff00' emissiveIntensity={0.3} />
      </mesh>

      {/* Add hotspots */}
      {hotspots.map((hotspot, i) => (
        <Hotspot key={i} {...hotspot} onClick={() => {}} />
      ))}
    </group>
  )
}

// Placeholder model for other types
function GenericModel({ color = '#6366f1' }: { color?: string }) {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
    </mesh>
  )
}

// Main 3D Viewer Component
interface EvidenceViewer3DProps {
  evidenceType: 'weapon' | 'car' | 'image' | 'document'
  weaponType?: 'pistol' | 'rifle'
  hotspots?: Array<{ position: [number, number, number], label: string, details: Record<string, string> }>
  onClose?: () => void
}

export function EvidenceViewer3D({ 
  evidenceType, 
  weaponType = 'pistol',
  hotspots = [],
  onClose 
}: EvidenceViewer3DProps) {
  const [autoRotate, setAutoRotate] = useState(true)
  const [showHelp, setShowHelp] = useState(true)

  return (
    <div className='fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8'>
      {/* Header */}
      <div className='absolute top-6 left-6 right-6 flex items-center justify-between z-20'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center'>
            <Info className='w-5 h-5 text-white' />
          </div>
          <div>
            <h2 className='text-white font-bold text-lg'>3D Evidence Viewer</h2>
            <p className='text-[#7E8299] text-sm capitalize'>{evidenceType} Model</p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <button 
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-lg transition-all ${autoRotate ? 'bg-red-500 text-white' : 'bg-[#2a2a35] text-[#7E8299]'}`}
          >
            <RotateCcw className='w-5 h-5' />
          </button>
          <button 
            onClick={() => setShowHelp(!showHelp)}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${showHelp ? 'bg-red-500/20 text-red-400' : 'bg-[#2a2a35] text-[#7E8299]'}`}
          >
            {showHelp ? 'Hide Help' : 'Show Help'}
          </button>
          <button 
            onClick={onClose}
            className='p-2 bg-[#2a2a35] hover:bg-red-500/20 rounded-lg text-[#7E8299] hover:text-red-400 transition-all'
          >
            <X className='w-5 h-5' />
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className='w-full h-full'>
        <Canvas shadows camera={{ position: [2, 2, 2], fov: 50 }}>
          <color attach='background' args={['#0f0f14']} />
          
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <Suspense fallback={null}>
            <Stage environment='city' intensity={0.5} contactShadow={false}>
              {evidenceType === 'weapon' && weaponType === 'pistol' && (
                <PistolModel hotspots={hotspots} />
              )}
              {evidenceType === 'weapon' && weaponType === 'rifle' && (
                <RifleModel hotspots={hotspots} />
              )}
              {evidenceType === 'car' && (
                <CarModel hotspots={hotspots} />
              )}
              {(evidenceType === 'image' || evidenceType === 'document') && (
                <GenericModel />
              )}
            </Stage>
          </Suspense>
          
          <OrbitControls 
            autoRotate={autoRotate}
            autoRotateSpeed={2}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 1.5}
          />
        </Canvas>
      </div>

      {/* Help Panel */}
      {showHelp && (
        <div className='absolute bottom-6 left-6 bg-[#1a1a22]/95 backdrop-blur-sm border border-[#2a2a35] rounded-xl p-4 shadow-xl max-w-sm'>
          <h3 className='text-white font-semibold text-sm mb-3'>Controls</h3>
          <div className='space-y-2 text-sm'>
            <div className='flex items-center gap-2 text-[#7E8299]'>
              <span className='w-6 h-6 bg-[#2a2a35] rounded flex items-center justify-center text-xs'>LMB</span>
              <span>Rotate view</span>
            </div>
            <div className='flex items-center gap-2 text-[#7E8299]'>
              <span className='w-6 h-6 bg-[#2a2a35] rounded flex items-center justify-center text-xs'>RMB</span>
              <span>Pan view</span>
            </div>
            <div className='flex items-center gap-2 text-[#7E8299]'>
              <span className='w-6 h-6 bg-[#2a2a35] rounded flex items-center justify-center text-xs'>Scroll</span>
              <span>Zoom in/out</span>
            </div>
            <div className='flex items-center gap-2 text-[#7E8299] mt-3 pt-2 border-t border-[#2a2a35]'>
              <span className='w-3 h-3 bg-blue-500 rounded-full' />
              <span>Click blue dots to view details</span>
            </div>
          </div>
        </div>
      )}

      {/* Hotspot count indicator */}
      {hotspots.length > 0 && (
        <div className='absolute bottom-6 right-6 bg-[#1a1a22]/95 backdrop-blur-sm border border-[#2a2a35] rounded-xl px-4 py-2 shadow-xl'>
          <div className='flex items-center gap-2'>
            <span className='w-2 h-2 bg-blue-500 rounded-full animate-pulse' />
            <span className='text-white text-sm font-medium'>{hotspots.length}</span>
            <span className='text-[#7E8299] text-sm'>hotspots</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Generate hotspots for weapon
export function generateWeaponHotspots(data: any, type: string) {
  const hotspots: Array<{ position: [number, number, number], label: string, details: Record<string, string> }> = []
  
  if (type === 'pistol') {
    // Serial number position
    if (data.serialNumber) {
      hotspots.push({
        position: [0.3, 0, 0.07],
        label: 'Serial Number',
        details: { Serial: data.serialNumber, 'Registered To': data.registeredOwner || 'Unknown' }
      })
    }
    // Brand/Model
    if (data.brand || data.model) {
      hotspots.push({
        position: [0, 0.05, 0],
        label: 'Brand & Model',
        details: { Brand: data.brand || 'Unknown', Model: data.model || 'Unknown' }
      })
    }
    // Caliber
    if (data.caliber) {
      hotspots.push({
        position: [0.5, 0.03, 0],
        label: 'Caliber',
        details: { Caliber: data.caliber, 'License Status': data.licenseStatus || 'Unknown' }
      })
    }
  } else if (type === 'rifle') {
    // Serial number
    if (data.serialNumber) {
      hotspots.push({
        position: [-0.3, 0.05, 0.05],
        label: 'Serial Number',
        details: { Serial: data.serialNumber, 'Registered To': data.registeredOwner || 'Unknown' }
      })
    }
    // Scope
    hotspots.push({
      position: [0, 0.08, 0],
      label: 'Scope',
      details: { 'Attached': 'Yes', 'Type': 'Reflex' }
    })
    // Magazine
    if (data.magazineCapacity) {
      hotspots.push({
        position: [0.1, -0.12, 0],
        label: 'Magazine',
        details: { 'Capacity': `${data.magazineCapacity} rounds`, 'Type': data.ammunitionType || 'Unknown' }
      })
    }
  }
  
  return hotspots
}

// Generate hotspots for car
export function generateCarHotspots(data: any) {
  const hotspots: Array<{ position: [number, number, number], label: string, details: Record<string, string> }> = []
  
  // Plate number
  if (data.plateNumber) {
    hotspots.push({
      position: [0.9, 0.2, 0],
      label: 'License Plate',
      details: { 'Plate': data.plateNumber, 'State': data.plateState || 'Unknown' }
    })
  }
  
  // VIN
  if (data.vin) {
    hotspots.push({
      position: [0.5, 0.15, 0.41],
      label: 'VIN',
      details: { 'VIN': data.vin.substring(0, 17), 'Year': data.year?.toString() || 'Unknown' }
    })
  }
  
  // Owner
  if (data.owner || data.registeredOwner) {
    hotspots.push({
      position: [0.1, 0.45, 0],
      label: 'Owner Information',
      details: { 'Owner': data.owner || 'Unknown', 'Registered': data.registeredOwner || 'Unknown' }
    })
  }
  
  // Color
  if (data.color) {
    hotspots.push({
      position: [-0.5, 0.2, 0.41],
      label: 'Vehicle Color',
      details: { 'Exterior': data.color, 'Interior': data.interiorColor || 'Unknown' }
    })
  }
  
  return hotspots
}
