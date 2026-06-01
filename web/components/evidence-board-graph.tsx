'use client'

import { useCallback, useEffect, useState } from 'react'
import ReactFlow, {
  Background,
  MiniMap,
  Handle,
  Position,
  addEdge,
  Node,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  MarkerType,
  BackgroundVariant,
  NodeChange,
  EdgeChange
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Users, FileText, MapPin, Zap } from 'lucide-react'

/* =========================
   NODE TYPES
========================= */

const nodeTypeIcons = {
  person: Users,
  location: MapPin,
  document: FileText,
  event: Zap
}

function EvidenceNode({ data }: { data: any }) {
  const Icon = nodeTypeIcons[data.nodeType as keyof typeof nodeTypeIcons] || FileText
  
  return (
    <div className='relative group'>
      <div className='
        bg-gradient-to-br from-[#1a1a22] to-[#25252f] 
        border-2 border-[#3a3a45] rounded-2xl p-4 min-w-[180px] 
        shadow-xl shadow-black/30 
        transition-all duration-300 
        group-hover:scale-105 group-hover:border-red-500/50 group-hover:shadow-red-500/10
      '>
        <Handle type='target' position={Position.Top} className='!w-3 !h-3 !bg-red-500 !border-2 !border-[#1a1a22] !-top-1.5' />
        
        <div className='flex items-start gap-3'>
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center
            ${data.nodeType === 'person' ? 'bg-blue-500/20 text-blue-400' :
              data.nodeType === 'location' ? 'bg-green-500/20 text-green-400' :
              data.nodeType === 'document' ? 'bg-yellow-500/20 text-yellow-400' :
              data.nodeType === 'event' ? 'bg-purple-500/20 text-purple-400' :
              'bg-gray-500/20 text-gray-400'
            }
          `}>
            <Icon className='w-5 h-5' />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-white font-semibold text-sm leading-tight truncate'>{data.label}</p>
            <span className={`
              text-[10px] uppercase tracking-wider mt-1 block
              ${data.nodeType === 'person' ? 'text-blue-400' :
                data.nodeType === 'location' ? 'text-green-400' :
                data.nodeType === 'document' ? 'text-yellow-400' :
                data.nodeType === 'event' ? 'text-purple-400' :
                'text-gray-400'
              }
            `}>{data.nodeType}</span>
          </div>
        </div>
      </div>
      
      <Handle type='source' position={Position.Bottom} className='!w-3 !h-3 !bg-red-500 !border-2 !border-[#1a1a22] !-bottom-1.5' />
    </div>
  )
}

const nodeTypes = {
  evidenceNode: EvidenceNode
}

/* =========================
   SAMPLE DATA
========================= */

const sampleNodes: Node[] = [
  { id: '1', type: 'evidenceNode', position: { x: 250, y: 50 }, data: { label: 'Michael Chen', nodeType: 'person' } },
  { id: '2', type: 'evidenceNode', position: { x: 50, y: 200 }, data: { label: 'Downtown Warehouse', nodeType: 'location' } },
  { id: '3', type: 'evidenceNode', position: { x: 450, y: 200 }, data: { label: 'Shipping Manifest', nodeType: 'document' } },
  { id: '4', type: 'evidenceNode', position: { x: 150, y: 380 }, data: { label: 'Arms Deal', nodeType: 'event' } },
  { id: '5', type: 'evidenceNode', position: { x: 400, y: 380 }, data: { label: 'Offshore Account', nodeType: 'document' } },
  { id: '6', type: 'evidenceNode', position: { x: 250, y: 500 }, data: { label: 'Dark Web Forum', nodeType: 'location' } },
]

const sampleEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, label: 'visited', style: { stroke: '#6366f1', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' } },
  { id: 'e1-3', source: '1', target: '3', animated: true, label: 'signed', style: { stroke: '#22c55e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' } },
  { id: 'e2-4', source: '2', target: '4', animated: true, label: 'hosted', style: { stroke: '#f59e0b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
  { id: 'e4-6', source: '4', target: '6', animated: true, label: 'connected', style: { stroke: '#ef4444', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' } },
  { id: 'e5-6', source: '5', target: '6', animated: true, label: 'transfer', style: { stroke: '#06b6d4', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' } },
  { id: 'e1-4', source: '1', target: '4', animated: true, label: 'organized', style: { stroke: '#ec4899', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ec4899' } },
]

/* =========================
   COMPONENT (Dashboard View)
========================= */

export function EvidenceBoard() {
  const [nodes, setNodes, onNodesChange] = useNodesState(sampleNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(sampleEdges)

  // Live animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setEdges(eds => eds.map(edge => ({
        ...edge,
        style: { 
          ...edge.style, 
          strokeWidth: Math.random() > 0.7 ? 3 : 2 
        }
      })))
    }, 2000)
    return () => clearInterval(interval)
  }, [setEdges])

  return (
    <div className='w-full h-full'>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={(changes) => onNodesChange(changes as NodeChange[])}
        onEdgesChange={(changes) => onEdgesChange(changes as EdgeChange[])}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className='!bg-[#0f0f14]'
        defaultEdgeOptions={{
          animated: true,
          style: { strokeWidth: 2 }
        }}
        panOnDrag={true}
        zoomOnScroll={true}
      >
        <Background 
          color='#2a2a35' 
          gap={20} 
          variant={BackgroundVariant.Dots}
          className='!bg-[#0f0f14]'
        />
        <MiniMap 
          nodeColor={(node) => {
            const data = node.data as any
            if (data?.nodeType === 'person') return '#3b82f6'
            if (data?.nodeType === 'location') return '#22c55e'
            if (data?.nodeType === 'document') return '#f59e0b'
            if (data?.nodeType === 'event') return '#a855f7'
            return '#6b7280'
          }}
          maskColor='rgba(0,0,0,0.8)'
          style={{ backgroundColor: '#1a1a22', borderRadius: '12px', border: '1px solid #2a2a35' }}
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  )
}
