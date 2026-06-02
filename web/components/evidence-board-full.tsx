'use client'

import { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  Node,
  Edge,
  Connection,
  MarkerType,
  BackgroundVariant,
  NodeChange,
  ReactFlowInstance,
  NodeTypes
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Plus, Trash2, Save, X, Users, FileText, MapPin, Zap, Search, Edit3, Loader2 } from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

const nodeTypeIcons = {
  person: Users,
  location: MapPin,
  document: FileText,
  event: Zap
}

const nodeTypeColors = {
  person: { bg: 'from-blue-500 to-blue-700', text: 'text-blue-400' },
  location: { bg: 'from-green-500 to-green-700', text: 'text-green-400' },
  document: { bg: 'from-yellow-500 to-yellow-700', text: 'text-yellow-400' },
  event: { bg: 'from-purple-500 to-purple-700', text: 'text-purple-400' }
}

function EvidenceNode({ data, selected }: { data: any; selected: boolean }) {
  const Icon = nodeTypeIcons[data?.nodeType as keyof typeof nodeTypeIcons] || FileText
  const colors = nodeTypeColors[data?.nodeType as keyof typeof nodeTypeColors] || nodeTypeColors.document
  
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
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${colors.bg} shadow-lg`}>
            <Icon className='w-6 h-6 text-white' />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-white font-semibold text-sm leading-tight line-clamp-2'>{data?.label || 'Untitled'}</p>
            <span className={`${colors.text} text-[10px] uppercase tracking-wider mt-1 block font-medium`}>
              {data?.nodeType || 'unknown'}
            </span>
          </div>
        </div>

        <div className='absolute -right-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
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

// Define nodeTypes OUTSIDE component to prevent React Flow warning
const nodeTypes: NodeTypes = {
  evidenceNode: EvidenceNode
}

interface EvidenceBoardFullProps {
  boardId?: string
}

export function EvidenceBoardFull({ boardId = 'main-case' }: EvidenceBoardFullProps) {
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newNodeLabel, setNewNodeLabel] = useState('')
  const [newNodeType, setNewNodeType] = useState('person')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadGraphData()
  }, [boardId])

  // Fit view when nodes are loaded
  useEffect(() => {
    if (!loading && nodes.length > 0 && reactFlowInstance) {
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2, duration: 300 })
      }, 100)
    }
  }, [loading, nodes.length, reactFlowInstance])

  const loadGraphData = async () => {
    if (!boardId) return
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/graph/${boardId}`)
      
      // Ensure proper node format for React Flow
      const formattedNodes = (response.data.nodes || []).map((node: any, idx: number) => ({
        id: node.id || `node-${idx}`,
        type: 'evidenceNode',
        position: {
          x: node.position?.x ?? (100 + idx * 150),
          y: node.position?.y ?? (100 + idx * 80)
        },
        data: {
          label: node.data?.label || node.title || `Node ${idx + 1}`,
          nodeType: node.data?.nodeType || node.nodeType || 'person',
          subtitle: node.data?.subtitle || '',
          classification: node.data?.classification || 'CONFIDENTIAL'
        }
      }))
      
      console.log('[EvidenceBoard] Loaded nodes:', formattedNodes.length)
      console.log('[EvidenceBoard] First node:', JSON.stringify(formattedNodes[0], null, 2))
      setNodes(formattedNodes)
      setEdges(response.data.edges || [])
    } catch (error) {
      console.error('Error loading graph:', error)
      setNodes([])
      setEdges([])
    }
    setLoading(false)
  }

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes(prev => {
      const newNodes = [...prev]
      changes.forEach(change => {
        if (change.type === 'position' && change.position) {
          const idx = newNodes.findIndex(n => n.id === change.id)
          if (idx !== -1) {
            newNodes[idx] = { ...newNodes[idx], position: change.position }
            if (!change.dragging) {
              saveNodePosition(change.id, change.position)
            }
          }
        }
      })
      return newNodes
    })
  }, [])

  const onEdgesChange = useCallback((changes: any[]) => {
    setEdges(prev => {
      const newEdges = [...prev]
      changes.forEach(change => {
        if (change.type === 'remove') {
          const idx = newEdges.findIndex(e => e.id === change.id)
          if (idx !== -1) newEdges.splice(idx, 1)
        }
      })
      return newEdges
    })
  }, [])

  const saveNodePosition = async (nodeId: string, position: { x: number; y: number }) => {
    try {
      await axios.put(`${API_URL}/graph/node/${nodeId}`, { x: position.x, y: position.y })
    } catch (error) {
      console.error('Error saving position:', error)
    }
  }

  const onConnect = useCallback(async (params: Connection) => {
    if (!params.source || !params.target) return
    try {
      const response = await axios.post(`${API_URL}/graph/edge`, {
        boardId,
        source: params.source,
        target: params.target,
        label: 'connected',
        animated: true
      })
      setEdges(prev => [...prev, {
        id: response.data.id,
        source: params.source,
        target: params.target,
        animated: true,
        label: 'connected',
        style: { stroke: '#6366f1', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed }
      }])
      setLastSaved(new Date())
    } catch (error) {
      console.error('Error creating edge:', error)
    }
  }, [boardId])

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const addNode = async () => {
    if (!newNodeLabel.trim()) return
    
    // Calculate position within visible viewport
    const centerX = 400 + Math.floor(Math.random() * 200) - 100
    const centerY = 300 + Math.floor(Math.random() * 200) - 100
    
    try {
      const response = await axios.post(`${API_URL}/graph/node`, {
        boardId,
        nodeType: newNodeType,
        title: newNodeLabel,
        x: centerX,
        y: centerY
      })
      
      // Format node properly for React Flow
      const newNode = {
        id: response.data.id,
        type: 'evidenceNode',
        position: { 
          x: response.data.position?.x || centerX, 
          y: response.data.position?.y || centerY
        },
        data: {
          label: response.data.title || newNodeLabel,
          nodeType: newNodeType,
          subtitle: '',
          classification: 'CONFIDENTIAL'
        }
      }
      
      setNodes(prev => [...prev, newNode])
      setNewNodeLabel('')
      setShowAddModal(false)
      setSelectedNode(response.data.id)
      setLastSaved(new Date())
    } catch (error) {
      console.error('Error creating node:', error)
    }
  }

  const deleteNode = useCallback(async (nodeId: string) => {
    try {
      await axios.delete(`${API_URL}/graph/node/${nodeId}`)
      setNodes(prev => prev.filter(n => n.id !== nodeId))
      setEdges(prev => prev.filter(e => e.source !== nodeId && e.target !== nodeId))
      setSelectedNode(null)
      setLastSaved(new Date())
    } catch (error) {
      console.error('Error deleting node:', error)
    }
  }, [])

  const deleteEdge = useCallback(async (edgeId: string) => {
    try {
      await axios.delete(`${API_URL}/graph/edge/${edgeId}`)
      setEdges(prev => prev.filter(e => e.id !== edgeId))
      setLastSaved(new Date())
    } catch (error) {
      console.error('Error deleting edge:', error)
    }
  }, [])

  const updateNodeLabel = useCallback(async (nodeId: string, label: string) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, data: { ...n.data, label } } : n))
    try {
      await axios.put(`${API_URL}/graph/node/${nodeId}`, { title: label })
      setLastSaved(new Date())
    } catch (error) {
      console.error('Error updating node:', error)
    }
  }, [])

  const updateNodeType = useCallback(async (nodeId: string, nodeType: string) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, data: { ...n.data, nodeType } } : n))
    try {
      await axios.put(`${API_URL}/graph/node/${nodeId}`, { nodeType })
      setLastSaved(new Date())
    } catch (error) {
      console.error('Error updating node type:', error)
    }
  }, [])

  const updateEdgeLabel = useCallback(async (edgeId: string, label: string) => {
    setEdges(prev => prev.map(e => e.id === edgeId ? { ...e, label } : e))
    try {
      await axios.put(`${API_URL}/graph/edge/${edgeId}`, { label })
      setLastSaved(new Date())
    } catch (error) {
      console.error('Error updating edge:', error)
    }
  }, [])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    await Promise.all(nodes.map(n => 
      axios.put(`${API_URL}/graph/node/${n.id}`, { x: n.position.x, y: n.position.y }).catch(() => {})
    ))
    setLastSaved(new Date())
    setTimeout(() => setIsSaving(false), 1000)
  }, [nodes])

  const selectedNodeData = nodes.find(n => n.id === selectedNode)

  // Filter nodes based on search query
  const filteredNodes = searchQuery.trim()
    ? nodes.filter(n => {
        const label = n.data?.label?.toLowerCase() || ''
        const nodeType = n.data?.nodeType?.toLowerCase() || ''
        const search = searchQuery.toLowerCase()
        return label.includes(search) || nodeType.includes(search)
      })
    : nodes

  // Focus on searched node
  useEffect(() => {
    if (searchQuery.trim() && filteredNodes.length === 1 && reactFlowInstance) {
      const node = filteredNodes[0]
      setSelectedNode(node.id)
      setTimeout(() => {
        reactFlowInstance.setCenter(node.position.x + 100, node.position.y + 100, { zoom: 1.5, duration: 500 })
      }, 100)
    }
  }, [searchQuery, filteredNodes.length, reactFlowInstance])

  if (loading) {
    return (
      <div className='w-full h-full flex items-center justify-center bg-[#0f0f14]'>
        <div className='text-center'>
          <Loader2 className='w-12 h-12 text-red-500 animate-spin mx-auto mb-4' />
          <p className='text-[#7E8299]'>Loading evidence network...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%' }} className='relative' ref={reactFlowWrapper}>
      <ReactFlow
        nodes={filteredNodes}
        edges={edges || []}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onInit={(instance) => {
          setReactFlowInstance(instance)
          // Fit view to show all nodes on initial load
          setTimeout(() => instance.fitView({ padding: 0.3, duration: 300 }), 100)
        }}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        className='!bg-[#0f0f14]'
        defaultEdgeOptions={{ animated: true, style: { strokeWidth: 2 } }}
        connectionLineStyle={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5,5' }}
        connectionLineType='bezier'
        connectionRadius={30}
        minZoom={0.3}
        maxZoom={2}
        snapToGrid
        snapGrid={[15, 15]}
      >
        <Background color='#2a2a35' gap={20} variant={BackgroundVariant.Dots} className='!bg-[#0f0f14]' />
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
        <Controls style={{ backgroundColor: '#1a1a22', borderRadius: '12px', border: '1px solid #2a2a35' }} />
      </ReactFlow>

      <div className='absolute top-4 left-4 right-4 flex items-center justify-between z-50'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6e]' />
          <input
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search nodes...'
            className='w-64 bg-[#1a1a22]/95 backdrop-blur-sm border border-[#2a2a35] rounded-xl pl-10 pr-8 py-2 text-white text-sm outline-none focus:border-red-500/50 transition-colors'
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-[#5a5a6e] hover:text-white'
            >
              <X className='w-4 h-4' />
            </button>
          )}
        </div>
        {searchQuery.trim() && (
          <div className='absolute top-full left-0 mt-2 bg-[#1a1a22]/95 backdrop-blur-sm border border-[#2a2a35] rounded-xl shadow-lg overflow-hidden z-50 w-72'>
            <div className='p-2 text-xs text-[#5a5a6e] border-b border-[#2a2a35]'>
              {filteredNodes.length} result{filteredNodes.length !== 1 ? 's' : ''}
            </div>
            <div className='max-h-48 overflow-y-auto'>
              {filteredNodes.map(node => (
                <button
                  key={node.id}
                  onClick={() => {
                    setSelectedNode(node.id)
                    reactFlowInstance?.setCenter(node.position.x + 100, node.position.y + 100, { zoom: 1.5 })
                  }}
                  className='w-full px-3 py-2 text-left hover:bg-[#2a2a35] transition-colors flex items-center gap-2'
                >
                  <span className={`w-2 h-2 rounded-full ${node.data?.nodeType === 'person' ? 'bg-blue-500' : node.data?.nodeType === 'location' ? 'bg-green-500' : node.data?.nodeType === 'event' ? 'bg-purple-500' : 'bg-yellow-500'}`} />
                  <span className='text-white text-sm truncate'>{node.data?.label || 'Untitled'}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className='flex items-center gap-2 bg-[#1a1a22]/95 backdrop-blur-sm border border-[#2a2a35] rounded-2xl p-2 shadow-xl shadow-black/50'>
          <button onClick={() => setShowAddModal(true)} className='flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl text-white text-sm font-medium transition-all shadow-lg shadow-red-500/30'>
            <Plus className='w-4 h-4' />Add Node
          </button>
          <div className='w-px h-6 bg-[#2a2a35]' />
          <button onClick={handleSave} className='flex items-center gap-2 px-4 py-2 bg-[#2a2a35] hover:bg-[#3a3a45] rounded-xl text-[#B7B7B7] hover:text-white text-sm font-medium transition-all'>
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

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
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${isActive ? `border-red-500 bg-red-500/10 ${colors.text}` : 'border-[#2a2a35] text-[#7E8299] hover:border-[#3a3a45]'}`}
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
                  <p className='text-[#5a5a6e] text-xs text-center py-4'>No connections yet. Drag from this node to another.</p>
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
                        <button onClick={() => deleteEdge(edge.id)} className='text-[#5a5a6e] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 ml-2'>
                          <X className='w-3 h-3' />
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
            <div className='flex gap-2 pt-2'>
              <button onClick={() => deleteNode(selectedNode)} className='flex-1 py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-xl text-red-400 text-sm font-medium transition-all flex items-center justify-center gap-2'>
                <Trash2 className='w-4 h-4' />Delete
              </button>
              <button onClick={handleSave} className='flex-1 py-2.5 px-4 bg-[#2a2a35] hover:bg-[#3a3a45] rounded-xl text-white text-sm font-medium transition-all'>
                <Save className='w-4 h-4 inline mr-2' />Save
              </button>
            </div>
          </div>
        </div>
      )}

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
                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${newNodeType === type ? `border-red-500 bg-red-500/10 ${colors.text}` : 'border-[#2a2a35] text-[#7E8299] hover:border-[#3a3a45]'}`}
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
            <span className='text-[#7E8299] text-xs'>Saved {lastSaved.toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      <div className='absolute bottom-4 right-4 bg-[#1a1a22]/95 backdrop-blur-sm border border-[#2a2a35] rounded-xl px-4 py-2 shadow-lg shadow-black/30'>
        <span className='text-[#5a5a6e] text-xs'>Drag from node edge to connect | Click node to edit</span>
      </div>
    </div>
  )
}