'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import ReactFlow, {
  Background,
  Controls,
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
  EdgeChange,
  ReactFlowInstance
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Plus, Trash2, Link2, Save, X, Users, FileText, MapPin, Zap, Search, Edit3 } from 'lucide-react'

/* =========================
   NODE TYPES
========================= */

const nodeTypeIcons = {
  person: Users,
  location: MapPin,
  document: FileText,
  event: Zap
}

const nodeTypeColors = {
  person: { bg: 'from-blue-500 to-blue-700', text: 'text-blue-400', border: 'border-blue-500/30' },
  location: { bg: 'from-green-500 to-green-700', text: 'text-green-400', border: 'border-green-500/30' },
  document: { bg: 'from-yellow-500 to-yellow-700', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  event: { bg: 'from-purple-500 to-purple-700', text: 'text-purple-400', border: 'border-purple-500/30' }
}

function EvidenceNode({ data, selected }: { data: any; selected: boolean }) {
  const Icon = nodeTypeIcons[data.nodeType as keyof typeof nodeTypeIcons] || FileText
  const colors = nodeTypeColors[data.nodeType as keyof typeof nodeTypeColors] || nodeTypeColors.document
  
  return (
    <div className={`relative group ${selected ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-[#0f0f14]' : ''}`}>
      <div className={`
        bg-gradient-to-br from-[#1a1a22] to-[#25252f] 
        border-2 rounded-2xl p-4 min-w-[200px] 
        shadow-xl shadow-black/30 
        transition-all duration-300 
        group-hover:scale-105 group-hover:shadow-red-500/10
        ${selected ? 'border-red-500' : 'border-[#3a3a45] group-hover:border-red-500/50'}
      `}>
        <Handle 
          type='target' 
          position={Position.Top} 
          className='!w-3 !h-3 !bg-red-500 !border-2 !border-[#1a1a22] !-top-1.5 !opacity-0 group-hover:!opacity-100 transition-opacity' 
          isConnectable={true}
        />
        
        <div className='flex items-start gap-3'>
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center
            bg-gradient-to-br ${colors.bg}
            shadow-lg
          `}>
            <Icon className='w-6 h-6 text-white' />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-white font-semibold text-sm leading-tight line-clamp-2'>{data.label}</p>
            <span className={`${colors.text} text-[10px] uppercase tracking-wider mt-1 block font-medium`}>
              {data.nodeType}
            </span>
          </div>
        </div>

        {/* Connection indicator */}
        <div className={`absolute -right-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center`}>
          <div className='w-1.5 h-1.5 bg-white rounded-full' />
        </div>
      </div>
      
      <Handle 
        type='source' 
        position={Position.Bottom} 
        className='!w-3 !h-3 !bg-red-500 !border-2 !border-[#1a1a22] !-bottom-1.5 !opacity-0 group-hover:!opacity-100 transition-opacity'
        isConnectable={true}
      />
    </div>
  )
}

const nodeTypes = {
  evidenceNode: EvidenceNode
}

/* =========================
   SAMPLE DATA
========================= */

const initialNodes: Node[] = [
  { id: '1', type: 'evidenceNode', position: { x: 300, y: 50 }, data: { label: 'Michael Chen', nodeType: 'person' } },
  { id: '2', type: 'evidenceNode', position: { x: 100, y: 200 }, data: { label: 'Downtown Warehouse', nodeType: 'location' } },
  { id: '3', type: 'evidenceNode', position: { x: 500, y: 200 }, data: { label: 'Shipping Manifest', nodeType: 'document' } },
  { id: '4', type: 'evidenceNode', position: { x: 200, y: 380 }, data: { label: 'Arms Deal - Feb 15', nodeType: 'event' } },
  { id: '5', type: 'evidenceNode', position: { x: 450, y: 380 }, data: { label: 'Offshore Account', nodeType: 'document' } },
  { id: '6', type: 'evidenceNode', position: { x: 300, y: 520 }, data: { label: 'Dark Web Forum', nodeType: 'location' } },
]

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, label: 'visited', markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }, style: { stroke: '#6366f1', strokeWidth: 2 } },
  { id: 'e1-3', source: '1', target: '3', animated: false, label: 'signed', markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' }, style: { stroke: '#22c55e', strokeWidth: 2 } },
  { id: 'e2-4', source: '2', target: '4', animated: true, label: 'hosted', markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' }, style: { stroke: '#f59e0b', strokeWidth: 2 } },
  { id: 'e3-5', source: '3', target: '5', animated: true, label: 'contains', markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' }, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
  { id: 'e4-6', source: '4', target: '6', animated: true, label: 'connected via', markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' }, style: { stroke: '#ef4444', strokeWidth: 2 } },
  { id: 'e5-6', source: '5', target: '6', animated: true, label: 'funds transfer', markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' }, style: { stroke: '#06b6d4', strokeWidth: 2 } },
  { id: 'e1-4', source: '1', target: '4', animated: true, label: 'organized', markerEnd: { type: MarkerType.ArrowClosed, color: '#ec4899' }, style: { stroke: '#ec4899', strokeWidth: 2 } },
]

/* =========================
   COMPONENT
========================= */

interface EvidenceBoardFullProps {
  boardId?: string
}

export function EvidenceBoardFull({ boardId = 'main-case' }: EvidenceBoardFullProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newNodeLabel, setNewNodeLabel] = useState('')
  const [newNodeType, setNewNodeType] = useState('person')
  const [connectionLabel, setConnectionLabel] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  // Auto-save indicator
  useEffect(() => {
    const interval = setInterval(() => {
      setLastSaved(new Date())
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  // Handle connections between nodes
  const onConnect = useCallback((params: Connection) => {
    if (!params.source || !params.target) return
    
    let label = connectionLabel || 'connected'
    if (!label.trim()) {
      label = 'linked'
    }
    
    const newEdge: Edge = {
      id: `e${params.source}-${params.target}-${Date.now()}`,
      source: params.source,
      target: params.target,
      animated: true,
      label,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#6366f1', strokeWidth: 2 }
    }
    
    setEdges((eds) => [...eds, newEdge])
    setConnectionLabel('')
    setLastSaved(new Date())
  }, [setEdges, connectionLabel])

  // Handle position changes (drag and drop)
  const onNodeDragStop = useCallback((event: React.MouseEvent, node: Node, nodes: Node[]) => {
    setLastSaved(new Date())
  }, [])

  // Add new node
  const addNode = () => {
    if (!newNodeLabel.trim()) return
    
    const position = reactFlowInstance 
      ? reactFlowInstance.screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
      : { x: 250, y: 250 }
    
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'evidenceNode',
      position,
      data: { label: newNodeLabel, nodeType: newNodeType }
    }
    
    setNodes((nds) => [...nds, newNode])
    setNewNodeLabel('')
    setShowAddModal(false)
    setSelectedNode(newNode.id)
    setLastSaved(new Date())
  }

  // Delete node
  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter(n => n.id !== nodeId))
    setEdges((eds) => eds.filter(e => e.source !== nodeId && e.target !== nodeId))
    setSelectedNode(null)
    setLastSaved(new Date())
  }, [setNodes, setEdges])

  // Delete edge
  const deleteEdge = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter(e => e.id !== edgeId))
    setLastSaved(new Date())
  }, [setEdges])

  // Update node label
  const updateNodeLabel = useCallback((nodeId: string, label: string) => {
    setNodes((nds) => nds.map(n => 
      n.id === nodeId ? { ...n, data: { ...n.data, label } } : n
    ))
    setLastSaved(new Date())
  }, [setNodes])

  // Update node type
  const updateNodeType = useCallback((nodeId: string, nodeType: string) => {
    setNodes((nds) => nds.map(n => 
      n.id === nodeId ? { ...n, data: { ...n.data, nodeType } } : n
    ))
    setLastSaved(new Date())
  }, [setNodes])

  // Update connection label
  const updateEdgeLabel = useCallback((edgeId: string, label: string) => {
    setEdges((eds) => eds.map(e => 
      e.id === edgeId ? { ...e, label } : e
    ))
    setLastSaved(new Date())
  }, [setEdges])

  // Manual save
  const handleSave = useCallback(() => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setLastSaved(new Date())
    }, 1000)
  }, [])

  // Get selected node data
  const selectedNodeData = nodes.find(n => n.id === selectedNode)

  return (
    <div className='w-full h-full relative' ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={(changes) => {
          onNodesChange(changes as NodeChange[])
          changes.forEach(change => {
            if (change.type === 'position' && change.dragging === false) {
              setLastSaved(new Date())
            }
          })
        }}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodeDragStop={onNodeDragStop}
        onInit={setReactFlowInstance}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        className='!bg-[#0f0f14]'
        defaultEdgeOptions={{
          animated: true,
          style: { strokeWidth: 2 }
        }}
        connectionLineStyle={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5,5' }}
        connectionLineType='bezier'
        connectionRadius={30}
        minZoom={0.3}
        maxZoom={2}
        snapToGrid
        snapGrid={[15, 15]}
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
          maskColor='rgba(0,0,0,0.85)'
          style={{ backgroundColor: '#1a1a22', borderRadius: '12px', border: '1px solid #2a2a35' }}
          pannable
          zoomable
        />
        <Controls 
          style={{ backgroundColor: '#1a1a22', borderRadius: '12px', border: '1px solid #2a2a35' }}
        />
      </ReactFlow>

      {/* Top Toolbar */}
      <div className='absolute top-4 left-4 right-4 flex items-center justify-between z-50'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6e]' />
          <input
            type='text'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder='Search nodes...'
            className='w-64 bg-[#1a1a22]/95 backdrop-blur-sm border border-[#2a2a35] rounded-xl pl-10 pr-4 py-2 text-white text-sm outline-none focus:border-[#3a3a45] transition-colors'
          />
        </div>

        <div className='flex items-center gap-2 bg-[#1a1a22]/95 backdrop-blur-sm border border-[#2a2a35] rounded-2xl p-2 shadow-xl shadow-black/50'>
          <button
            onClick={() => setShowAddModal(true)}
            className='flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl text-white text-sm font-medium transition-all shadow-lg shadow-red-500/30'
          >
            <Plus className='w-4 h-4' />
            Add Node
          </button>
          <div className='w-px h-6 bg-[#2a2a35]' />
          <button
            onClick={handleSave}
            className='flex items-center gap-2 px-4 py-2 bg-[#2a2a35] hover:bg-[#3a3a45] rounded-xl text-[#B7B7B7] hover:text-white text-sm font-medium transition-all'
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Selected Node Panel */}
      {selectedNode && selectedNodeData && (
        <div className='absolute right-4 top-20 w-80 bg-gradient-to-br from-[#1a1a22] to-[#12121a] border border-[#2a2a35] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50'>
          <div className='p-4 border-b border-[#2a2a35] flex items-center justify-between'>
            <div>
              <h3 className='text-white font-semibold'>Node Details</h3>
              <p className='text-[#7E8299] text-xs mt-0.5'>Edit and analyze evidence</p>
            </div>
            <button onClick={() => setSelectedNode(null)} className='text-[#5a5a6e] hover:text-white transition-colors'>
              <X className='w-5 h-5' />
            </button>
          </div>
          
          <div className='p-4 space-y-4'>
            <div className='space-y-2'>
              <label className='text-[#7E8299] text-xs font-medium uppercase tracking-wider'>Label</label>
              <div className='relative'>
                <Edit3 className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6e]' />
                <input 
                  type='text'
                  value={selectedNodeData.data.label}
                  onChange={(e) => updateNodeLabel(selectedNode, e.target.value)}
                  className='w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-red-500/50 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm outline-none transition-colors'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <label className='text-[#7E8299] text-xs font-medium uppercase tracking-wider'>Type</label>
              <div className='grid grid-cols-4 gap-2'>
                {['person', 'location', 'document', 'event'].map(type => {
                  const Icon = nodeTypeIcons[type as keyof typeof nodeTypeIcons]
                  const colors = nodeTypeColors[type as keyof typeof nodeTypeColors]
                  const isActive = selectedNodeData.data.nodeType === type
                  return (
                    <button
                      key={type}
                      onClick={() => updateNodeType(selectedNode, type)}
                      className={`
                        p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all
                        ${isActive 
                          ? `border-red-500 bg-red-500/10 ${colors.text}` 
                          : 'border-[#2a2a35] text-[#7E8299] hover:border-[#3a3a45]'
                        }
                      `}
                    >
                      <Icon className='w-5 h-5' />
                      <span className='text-[10px] capitalize'>{type}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className='space-y-2'>
              <label className='text-[#7E8299] text-xs font-medium uppercase tracking-wider'>
                Connections ({edges.filter(e => e.source === selectedNode || e.target === selectedNode).length})
              </label>
              <div className='space-y-1 max-h-40 overflow-y-auto'>
                {edges.filter(e => e.source === selectedNode || e.target === selectedNode).length === 0 ? (
                  <p className='text-[#5a5a6e] text-xs text-center py-4'>
                    No connections yet. Drag from this node to another.
                  </p>
                ) : (
                  edges.filter(e => e.source === selectedNode || e.target === selectedNode).map(edge => {
                    const otherId = edge.source === selectedNode ? edge.target : edge.source
                    const otherNode = nodes.find(n => n.id === otherId)
                    return (
                      <div key={edge.id} className='flex items-center justify-between p-2 bg-[#0f0f14] rounded-lg border border-[#2a2a35] group'>
                        <div className='flex items-center gap-2 flex-1 min-w-0'>
                          <span className='w-2 h-2 rounded-full bg-red-500' />
                          <span className='text-white text-xs truncate'>{otherNode?.data.label || 'Unknown'}</span>
                          <input
                            type='text'
                            value={edge.label || ''}
                            onChange={(e) => updateEdgeLabel(edge.id, e.target.value)}
                            className='flex-1 bg-transparent border-none outline-none text-[#7E8299] text-xs truncate'
                            placeholder='Add label...'
                          />
                        </div>
                        <button 
                          onClick={() => deleteEdge(edge.id)}
                          className='text-[#5a5a6e] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 ml-2'
                        >
                          <X className='w-3 h-3' />
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <div className='flex gap-2 pt-2'>
              <button 
                onClick={() => deleteNode(selectedNode)}
                className='flex-1 py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-xl text-red-400 text-sm font-medium transition-all flex items-center justify-center gap-2'
              >
                <Trash2 className='w-4 h-4' />
                Delete
              </button>
              <button 
                onClick={handleSave}
                className='flex-1 py-2.5 px-4 bg-[#2a2a35] hover:bg-[#3a3a45] rounded-xl text-white text-sm font-medium transition-all'
              >
                <Save className='w-4 h-4 inline mr-2' />
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Node Modal */}
      {showAddModal && (
        <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <div className='bg-gradient-to-br from-[#1a1a22] to-[#12121a] border border-[#2a2a35] rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-black/50'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-xl font-bold text-white'>Add New Evidence Node</h3>
              <button onClick={() => setShowAddModal(false)} className='text-[#5a5a6e] hover:text-white transition-colors'>
                <X className='w-6 h-6' />
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='text-[#7E8299] text-sm font-medium block mb-2'>Label *</label>
                <input 
                  type='text'
                  value={newNodeLabel}
                  onChange={(e) => setNewNodeLabel(e.target.value)}
                  placeholder='Enter evidence name...'
                  className='w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-red-500/50 rounded-xl px-4 py-3 text-white outline-none transition-colors'
                  autoFocus
                />
              </div>
              <div>
                <label className='text-[#7E8299] text-sm font-medium block mb-2'>Type *</label>
                <div className='grid grid-cols-4 gap-2'>
                  {['person', 'location', 'document', 'event'].map(type => {
                    const Icon = nodeTypeIcons[type as keyof typeof nodeTypeIcons]
                    const colors = nodeTypeColors[type as keyof typeof nodeTypeColors]
                    return (
                      <button
                        key={type}
                        onClick={() => setNewNodeType(type)}
                        className={`
                          p-3 rounded-xl border flex flex-col items-center gap-2 transition-all
                          ${newNodeType === type 
                            ? `border-red-500 bg-red-500/10 ${colors.text}` 
                            : 'border-[#2a2a35] text-[#7E8299] hover:border-[#3a3a45]'
                          }
                        `}
                      >
                        <Icon className='w-5 h-5' />
                        <span className='text-xs capitalize'>{type}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <button 
                onClick={addNode}
                disabled={!newNodeLabel.trim()}
                className='w-full py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-all shadow-lg shadow-red-500/20'
              >
                Add Node
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className='absolute bottom-4 left-4 flex items-center gap-3'>
        <div className='bg-[#1a1a22]/95 backdrop-blur-sm border border-[#2a2a35] rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg shadow-black/30'>
          <div className='w-2 h-2 bg-red-500 rounded-full animate-pulse' />
          <span className='text-white text-sm font-medium'>{nodes.length}</span>
          <span className='text-[#7E8299] text-xs'>Nodes</span>
        </div>
        <div className='bg-[#1a1a22]/95 backdrop-blur-sm border border-[#2a2a35] rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg shadow-black/30'>
          <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse' />
          <span className='text-white text-sm font-medium'>{edges.length}</span>
          <span className='text-[#7E8299] text-xs'>Connections</span>
        </div>
        {lastSaved && (
          <div className='bg-[#1a1a22]/95 backdrop-blur-sm border border-[#2a2a35] rounded-xl px-4 py-2 shadow-lg shadow-black/30'>
            <span className='text-[#7E8299] text-xs'>
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      {/* Help */}
      <div className='absolute bottom-4 right-4 bg-[#1a1a22]/95 backdrop-blur-sm border border-[#2a2a35] rounded-xl px-4 py-2 shadow-lg shadow-black/30'>
        <span className='text-[#5a5a6e] text-xs'>💡 Drag from node edge to connect • Click node to edit</span>
      </div>
    </div>
  )
}