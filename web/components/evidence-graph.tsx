'use client'

import {
  useEffect,
  useState,
  useCallback
} from 'react'

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  applyNodeChanges
} from 'reactflow'

import 'reactflow/dist/style.css'

import { api } from '@/lib/api'

/* =========================
   NODE COMPONENTS
========================= */

function DefaultNode({ data }: any) {

  return (

    <div className='min-w-220px bg-[#323949] border border-[#40445A] rounded-2xl p-4 shadow-xl'>

      <Handle type='target' position={Position.Top} />

      <h2 className='text-[#B7B7B7] font-semibold'>
        {data.label}
      </h2>

      <Handle type='source' position={Position.Bottom} />

    </div>
  )
}

const nodeTypes = {
  defaultNode: DefaultNode
}

/* =========================
   COMPONENT
========================= */

export function EvidenceGraph() {

  const [nodes, setNodes] = useState<any[]>([])

  const [edges, setEdges] = useState<any[]>([])

  /* =========================
     LOAD GRAPH
  ========================= */

  async function loadGraph() {

    const response = await api.get('/graph/main-case')

    const dbNodes = response.data.nodes.map((node: any) => ({

      id: node.id,

      type: 'defaultNode',

      position: {
        x: node.x,
        y: node.y
      },

      data: {
        label: node.title
      }

    }))

    const dbEdges = response.data.edges.map((edge: any) => ({

      id: edge.id,

      source: edge.source,

      target: edge.target,

      animated: true,

      label: edge.label

    }))

    setNodes(dbNodes)

    setEdges(dbEdges)
  }

  useEffect(() => {
    loadGraph()
  }, [])

  /* =========================
     SAVE POSITION
  ========================= */

  const onNodesChange = useCallback(

    async (changes: any) => {

      setNodes((nds) => applyNodeChanges(changes, nds))

      for (const change of changes) {

        if (
          change.type === 'position' &&
          change.position
        ) {

          await api.put(`/graph/node/${change.id}`, {

            x: change.position.x,
            y: change.position.y

          })
        }
      }
    },

    []

  )

  return (

    <div className='w-full h-700px'>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        fitView
      >

        <Background />

        <MiniMap />

        <Controls />

      </ReactFlow>

    </div>
  )
}