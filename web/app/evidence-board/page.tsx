'use client'

import ReactFlow, {
  Background,
  Controls
} from 'reactflow'

import 'reactflow/dist/style.css'

const nodes = [
  {
    id: '1',
    position: { x: 100, y: 100 },
    data: { label: 'Mamad Rebel' }
  },
  {
    id: '2',
    position: { x: 400, y: 100 },
    data: { label: 'Assault Rifle' }
  }
]

const edges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    label: 'SOLD'
  }
]

export default function EvidenceBoardPage() {

  return (
    <div className="w-screen h-screen bg-[#0B0F14]">

      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>

    </div>
  )
}