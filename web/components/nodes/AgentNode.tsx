'use client'

import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import { User } from 'lucide-react'

interface AgentNodeData {
  label?: string
  role?: string
  status?: string
}

export const AgentNode = memo(({ data, selected }: { data: AgentNodeData; selected: boolean }) => {
  return (
    <div className={`relative group ${selected ? 'ring-2 ring-blue-500' : ''}`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-[#1a1a22]" />
      
      <div className="bg-[#1E2635] border border-blue-500 rounded-xl p-4 min-w-[180px]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{data.label || 'Agent'}</p>
            <span className="text-blue-400 text-xs">{data.role || 'Agent'}</span>
          </div>
        </div>
        {data.status && (
          <div className="mt-2 text-xs text-gray-400">{data.status}</div>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-[#1a1a22]" />
    </div>
  )
})

AgentNode.displayName = 'AgentNode'