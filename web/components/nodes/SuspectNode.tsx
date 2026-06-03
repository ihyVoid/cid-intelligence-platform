'use client'

import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import { AlertTriangle } from 'lucide-react'

interface SuspectNodeData {
  label?: string
  threatLevel?: string
}

export const SuspectNode = memo(({ data, selected }: { data: SuspectNodeData; selected: boolean }) => {
  return (
    <div className={`relative group ${selected ? 'ring-2 ring-red-500' : ''}`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-red-500 !border-2 !border-[#1a1a22]" />
      
      <div className="bg-[#2A1F1F] border border-red-500 rounded-xl p-4 min-w-[180px] shadow-[0_0_30px_rgba(255,0,0,0.15)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{data.label || 'Suspect'}</p>
            <span className="text-red-400 text-xs">{data.threatLevel || 'THREAT'}</span>
          </div>
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-red-500 !border-2 !border-[#1a1a22]" />
    </div>
  )
})

SuspectNode.displayName = 'SuspectNode'