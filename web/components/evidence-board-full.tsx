'use client'

import { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  Node,
  Connection,
  MarkerType,
  BackgroundVariant,
  NodeChange,
  ReactFlowInstance,
  ReactFlowProvider,
  useNodesState,
  useEdgesState
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Plus, Trash2, Save, X, Users, FileText, MapPin, Zap, Search, Loader2, Maximize2, Minimize2 } from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

// Node type icons and colors
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

// Evidence Node Component - compact design
function EvidenceNode({ data, selected }: { data: any; selected: boolean }) {
  const Icon = nodeTypeIcons[data?.nodeType as keyof typeof nodeTypeIcons] || FileText
  const colors = nodeTypeColors[data?.nodeType as keyof typeof nodeTypeColors] || nodeTypeColors.document
  
  return (
    <div 
      className={`relative group transition-all duration-200 ${
        selected ? 'scale-105 shadow-xl shadow-red-500/30' : 'hover:scale-[1.02]'
      }`}
      style={{ 
        background: 'linear-gradient(135deg, #2a2a35 0%, #1f1f28 100%)',
        border: selected ? '2px solid #ef4444' : '2px solid #3a3a45',
        borderRadius: '12px',
        padding: '12px',
        minWidth: '160px',
        zIndex: selected ? 100 : 10
      }}
    >
      <Handle 
        type='target' 
        position={Position.Top} 
        className='!w-3 !h-3 !bg-red-500 !border-2 !border-[#1a1a22] !-top-1.5 !opacity-0 group-hover:!opacity-100 transition-opacity' 
        isConnectable={true}
      />
      
      <div className='flex items-center gap-3'>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br ${colors.bg} shadow-lg flex-shrink-0`}>
          <Icon className='w-4 h-4 text-white' />
        </div>
        <div className='flex-1 min-w-0'>
          <p className='text-white font-medium text-sm leading-tight truncate'>
            {data?.label || 'Untitled'}
          </p>
          <span className={`${colors.text} text-[10px] uppercase tracking-wider font-medium`}>
            {data?.nodeType || 'unknown'}
          </span>
        </div>
      </div>

      <div className='absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg'>
        <div className='w-1 h-1 bg-white rounded-full' />
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

interface EvidenceBoardFullProps {
  boardId?: string
}

export function EvidenceBoardFull({ boardId = 'main-case' }: EvidenceBoardFullProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [loading, setLoading] = useState(true)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newNodeLabel, setNewNodeLabel] = useState('')
  const [newNodeType, setNewNodeType] = useState('person')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  // Memoize node types
  const nodeTypes = useMemo(() => ({
    evidenceNode: EvidenceNode
  }), [])
  
  // Memoize default edge options
  const defaultEdgeOptions = useMemo(() => ({
    animated: true,
    style: { stroke: '#6366f1', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
  }), [])

  // Load graph data
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
      
      setNodes(formattedNodes)
      setEdges(response.data.edges || [])
    } catch (error) {
      console.error('Error loading graph:', error)
      setNodes([])
      setEdges([])
    }
    setLoading(false)
  }

  const saveNodePosition = async (nodeId: string, position: { x: number; y: number }) => {
    try {
      await axios.put(`${API_URL}/graph/node/${nodeId}`, { x: position.x, y: position.y })
    } catch (error) {
      console.error('Error saving position:', error)
    }
  }

  const onConnect = useCallback(async (params: Connection) => {
    if (!params.source || !params.target) return
    const source = params.source as string
    const target = params.target as string
    try {
      const response = await axios.post(`${API_URL}/graph/edge`, {
        boardId,
        source,
        target,
        label: '',
        animated: true
      })
      
      setEdges(prev => [...prev, {
        id: response.data.id as string,
        source,
        target,
        animated: true,
        label: '',
        style: { stroke: '#6366f1', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
      }])
      setLastSaved(new Date())
    } catch (error) {
      console.error('Error creating edge:', error)
    }
  }, [boardId, setEdges])

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  // Handle position changes
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes)
    
    changes.forEach(change => {
      if (change.type === 'position' && change.position && !change.dragging) {
        saveNodePosition(change.id, change.position)
      }
    })
  }, [onNodesChange])

  const addNode = async () => {
    if (!newNodeLabel.trim()) return
    
    const viewport = reactFlowInstance?.getViewport() || { x: 0, y: 0, zoom: 1 }
    const centerX = (window.innerWidth / 2 - viewport.x) / viewport.zoom
    const centerY = (window.innerHeight / 2 - viewport.y) / viewport.zoom
    
    try {
      const response = await axios.post(`${API_URL}/graph/node`, {
        boardId,
        nodeType: newNodeType,
        title: newNodeLabel,
        x: centerX + Math.floor(Math.random() * 100) - 50,
        y: centerY + Math.floor(Math.random() * 100) - 50
      })
      
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
      
      setTimeout(() => {
        reactFlowInstance?.fitView({ padding: 0.3, duration: 500 })
      }, 100)
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
  }, [setNodes, setEdges])

  const deleteEdge = useCallback(async (edgeId: string) => {
    try {
      await axios.delete(`${API_URL}/graph/edge/${edgeId}`)
      setEdges(prev => prev.filter(e => e.id !== edgeId))
      setLastSaved(new Date())
    } catch (error) {
      console.error('Error deleting edge:', error)
    }
  }, [setEdges])

  const updateNodeLabel = useCallback(async (nodeId: string, label: string) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, data: { ...n.data, label } } : n))
    try {
      await axios.put(`${API_URL}/graph/node/${nodeId}`, { title: label })
      setLastSaved(new Date())
    } catch (error) {
      console.error('Error updating node:', error)
    }
  }, [setNodes])

  const updateNodeType = useCallback(async (nodeId: string, nodeType: string) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, data: { ...n.data, nodeType } } : n))
    try {
      await axios.put(`${API_URL}/graph/node/${nodeId}`, { nodeType })
      setLastSaved(new Date())
    } catch (error) {
      console.error('Error updating node type:', error)
    }
  }, [setNodes])

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
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return nodes
    const search = searchQuery.toLowerCase()
    return nodes.filter(n => {
      const label = n.data?.label?.toLowerCase() || ''
      const nodeType = n.data?.nodeType?.toLowerCase() || ''
      return label.includes(search) || nodeType.includes(search)
    })
  }, [nodes, searchQuery])

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
      <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a22] to-[#12121a] rounded-xl'>
        <div className='text-center'>
          <Loader2 className='w-10 h-10 text-red-500 animate-spin mx-auto mb-3' />
          <p className='text-[#7E8299] text-sm'>Loading evidence network...</p>
        </div>
      </div>
    )
  }

  return (
    <ReactFlowProvider>
      <div 
        ref={reactFlowWrapper}
        className={`relative bg-gradient-to-br from-[#1a1a22] to-[#12121a] rounded-xl transition-all duration-300 ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
        }`}
        style={{ height: isFullscreen ? '100vh' : '100%', overflow: 'hidden' }}
      >
        {/* Header Controls */}
        <div className='absolute top-3 left-3 right-3 z-10 flex items-center justify-between'>
          {/* Search */}
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6e]' />
            <input 
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search nodes...'
              className='pl-9 pr-4 py-1.5 bg-[#0f0f14]/90 backdrop-blur-sm border border-[#2a2a35] rounded-lg text-white text-sm w-56 focus:outline-none focus:border-red-500/50 transition-colors'
            />
            {searchQuery && (
              <span className='absolute right-3 top-1/2 -translate-y-1/2 text-[#5a5a6e] text-xs'>
                {filteredNodes.length} result{filteredNodes.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          {/* Actions */}
          <div className='flex items-center gap-2'>
            <button 
              onClick={() => setShowAddModal(true)}
              className='flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-lg text-white text-sm font-medium shadow-lg shadow-red-500/20 transition-all'
            >
              <Plus className='w-3.5 h-3.5' />
              Add
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className='flex items-center gap-1.5 px-3 py-1.5 bg-[#2a2a35] hover:bg-[#3a3a45] border border-[#3a3a45] rounded-lg text-white text-sm font-medium transition-all'
            >
              <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-pulse' : ''}`} />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button 
              onClick={() => setIsFullscreen(!isFullscreen)}
              className='p-1.5 bg-[#2a2a35] hover:bg-[#3a3a45] border border-[#3a3a45] rounded-lg text-white transition-all'
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className='w-4 h-4' /> : <Maximize2 className='w-4 h-4' />}
            </button>
          </div>
        </div>

        {/* React Flow */}
        <ReactFlow
          nodes={filteredNodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onInit={setReactFlowInstance}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          className='!bg-transparent'
          minZoom={0.3}
          maxZoom={2}
          snapToGrid
          snapGrid={[15, 15]}
          selectNodesOnDrag={false}
          panOnScroll={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background color='#2a2a35' gap={20} variant={BackgroundVariant.Dots} className='!bg-transparent' />
          <MiniMap 
            nodeColor={(node) => {
              const data = node.data as any
              if (data?.nodeType === 'person') return '#3b82f6'
              if (data?.nodeType === 'location') return '#22c55e'
              if (data?.nodeType === 'document') return '#eab308'
              if (data?.nodeType === 'event') return '#a855f7'
              return '#6b7280'
            }}
            maskColor='rgba(15, 15, 20, 0.8)'
            className='!bg-[#1a1a22]/90 backdrop-blur-sm border border-[#2a2a35] rounded-lg'
            style={{ backgroundColor: 'rgba(26, 26, 34, 0.9)' }}
          />
          <Controls 
            className='!bg-[#1a1a22]/90 backdrop-blur-sm border border-[#2a2a35] rounded-lg [&>button]:!bg-transparent [&>button]:!border-0 [&>button]:!text-white [&>button]:hover:!bg-[#2a2a35]'
            showInteractive={false}
          />
        </ReactFlow>

        {/* Node Edit Panel */}
        {selectedNode && selectedNodeData && (
          <div className='absolute top-14 right-3 w-64 bg-[#1a1a22]/95 backdrop-blur-sm border border-[#2a2a35] rounded-xl p-3 shadow-xl z-20'>
            <div className='flex items-center justify-between mb-3'>
              <h3 className='text-white font-semibold text-sm'>Edit Node</h3>
              <button onClick={() => setSelectedNode(null)} className='text-[#5a5a6e] hover:text-white'>
                <X className='w-4 h-4' />
              </button>
            </div>
            
            <div className='space-y-3'>
              <div>
                <label className='text-[#7E8299] text-[10px] font-medium uppercase tracking-wider block mb-1.5'>Label</label>
                <input 
                  type='text'
                  value={selectedNodeData.data.label}
                  onChange={(e) => updateNodeLabel(selectedNode, e.target.value)}
                  className='w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-red-500/50 rounded-lg px-2.5 py-1.5 text-white text-sm outline-none transition-colors'
                />
              </div>
              
              <div>
                <label className='text-[#7E8299] text-[10px] font-medium uppercase tracking-wider block mb-1.5'>Type</label>
                <div className='grid grid-cols-4 gap-1.5'>
                  {(['person', 'location', 'document', 'event'] as const).map(type => {
                    const Icon = nodeTypeIcons[type]
                    const colors = nodeTypeColors[type]
                    const isActive = selectedNodeData.data.nodeType === type
                    return (
                      <button
                        key={type}
                        onClick={() => updateNodeType(selectedNode, type)}
                        className={`p-1.5 rounded-lg border flex flex-col items-center gap-1 transition-all ${
                          isActive 
                            ? `border-red-500 bg-red-500/10 ${colors.text}` 
                            : 'border-[#2a2a35] text-[#7E8299] hover:border-[#3a3a45]'
                        }`}
                      >
                        <Icon className='w-3.5 h-3.5' />
                        <span className='text-[9px] capitalize'>{type}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              
              <div className='space-y-1.5'>
                <label className='text-[#7E8299] text-[10px] font-medium uppercase tracking-wider'>
                  Connections ({edges.filter(e => e.source === selectedNode || e.target === selectedNode).length})
                </label>
                <div className='space-y-1 max-h-24 overflow-y-auto'>
                  {edges.filter(e => e.source === selectedNode || e.target === selectedNode).length === 0 ? (
                    <p className='text-[#5a5a6e] text-[10px] text-center py-2'>No connections</p>
                  ) : (
                    edges.filter(e => e.source === selectedNode || e.target === selectedNode).map(edge => {
                      const otherId = edge.source === selectedNode ? edge.target : edge.source
                      const otherNode = nodes.find(n => n.id === otherId)
                      return (
                        <div key={edge.id} className='flex items-center justify-between p-1.5 bg-[#0f0f14] rounded-lg border border-[#2a2a35] group'>
                          <div className='flex items-center gap-1.5 flex-1 min-w-0'>
                            <span className='w-1.5 h-1.5 rounded-full bg-red-500' />
                            <span className='text-white text-[11px] truncate'>{otherNode?.data.label || 'Unknown'}</span>
                          </div>
                          <button onClick={() => deleteEdge(edge.id)} className='text-[#5a5a6e] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100'>
                            <X className='w-3 h-3' />
                          </button>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
              
              <button 
                onClick={() => deleteNode(selectedNode)} 
                className='w-full py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-xs font-medium transition-all flex items-center justify-center gap-1.5'
              >
                <Trash2 className='w-3 h-3' />
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Stats Footer */}
        <div className='absolute bottom-3 left-3 flex items-center gap-2'>
          <div className='bg-[#1a1a22]/90 backdrop-blur-sm border border-[#2a2a35] rounded-lg px-2.5 py-1 flex items-center gap-1.5'>
            <span className='w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse' />
            <span className='text-white text-xs font-medium'>{nodes.length}</span>
            <span className='text-[#7E8299] text-[10px]'>Nodes</span>
          </div>
          <div className='bg-[#1a1a22]/90 backdrop-blur-sm border border-[#2a2a35] rounded-lg px-2.5 py-1 flex items-center gap-1.5'>
            <span className='w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse' />
            <span className='text-white text-xs font-medium'>{edges.length}</span>
            <span className='text-[#7E8299] text-[10px]'>Edges</span>
          </div>
          {lastSaved && (
            <span className='text-[#5a5a6e] text-[10px]'>Saved {lastSaved.toLocaleTimeString()}</span>
          )}
        </div>

        {/* Help Text */}
        <div className='absolute bottom-3 right-3 bg-[#1a1a22]/90 backdrop-blur-sm border border-[#2a2a35] rounded-lg px-2.5 py-1'>
          <span className='text-[#5a5a6e] text-[10px]'>Drag handles to connect</span>
        </div>

        {/* Add Node Modal */}
        {showAddModal && (
          <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
            <div className='bg-gradient-to-br from-[#1a1a22] to-[#12121a] border border-[#2a2a35] rounded-xl p-5 w-full max-w-sm shadow-2xl'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-bold text-white'>Add Evidence</h3>
                <button onClick={() => setShowAddModal(false)} className='text-[#5a5a6e] hover:text-white transition-colors'>
                  <X className='w-5 h-5' />
                </button>
              </div>
              <div className='space-y-3'>
                <div>
                  <label className='text-[#7E8299] text-xs font-medium block mb-1.5'>Label *</label>
                  <input 
                    type='text'
                    value={newNodeLabel}
                    onChange={(e) => setNewNodeLabel(e.target.value)}
                    placeholder='Enter name...'
                    className='w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-red-500/50 rounded-lg px-3 py-2 text-white text-sm outline-none transition-colors'
                    autoFocus
                  />
                </div>
                <div>
                  <label className='text-[#7E8299] text-xs font-medium block mb-1.5'>Type</label>
                  <div className='grid grid-cols-4 gap-2'>
                    {(['person', 'location', 'document', 'event'] as const).map(type => {
                      const Icon = nodeTypeIcons[type]
                      const colors = nodeTypeColors[type]
                      return (
                        <button
                          key={type}
                          onClick={() => setNewNodeType(type)}
                          className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition-all ${
                            newNodeType === type 
                              ? `border-red-500 bg-red-500/10 ${colors.text}` 
                              : 'border-[#2a2a35] text-[#7E8299] hover:border-[#3a3a45]'
                          }`}
                        >
                          <Icon className='w-4 h-4' />
                          <span className='text-[10px] capitalize'>{type}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
                <button 
                  onClick={addNode}
                  disabled={!newNodeLabel.trim()}
                  className='w-full py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white text-sm font-semibold transition-all shadow-lg shadow-red-500/20'
                >
                  Add Evidence
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ReactFlowProvider>
  )
}