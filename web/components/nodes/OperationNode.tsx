'use client'

import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import { Target } from 'lucide-react'

interface OperationNodeData {
  label?: string
  status?: string
}

export const OperationNode = memo(({ data, selected }: { data: OperationNodeData; selected: boolean }) => {
  return (
    <div className={`relative group ${selected ? 'ring-2 ring-yellow-500' : ''}`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-yellow-500 !border-2 !border-[#1a1a22]" />
      
      <div className="bg-[#212129] border border-yellow-500 rounded-xl p-4 min-w-[180px] shadow-[0_0_30px_rgba(255,215,0,0.15)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{data.label || 'Operation'}</p>
            <span className="text-yellow-400 text-xs">OPERATION</span>
          </div>
        </div>
        {data.status && (
          <div className="mt-2 text-xs text-gray-400">{data.status}</div>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-yellow-500 !border-2 !border-[#1a1a22]" />
    </div>
  )
})

OperationNode.displayName = 'OperationNode'