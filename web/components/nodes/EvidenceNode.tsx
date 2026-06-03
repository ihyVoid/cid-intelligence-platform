'use client'

import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import { FileText } from 'lucide-react'

interface EvidenceNodeData {
  label?: string
  evidenceType?: string
}

export const EvidenceNode = memo(({ data, selected }: { data: EvidenceNodeData; selected: boolean }) => {
  return (
    <div className={`relative group ${selected ? 'ring-2 ring-green-500' : ''}`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-green-500 !border-2 !border-[#1a1a22]" />
      
      <div className="bg-[#1a2635] border border-green-500 rounded-xl p-4 min-w-[180px]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{data.label || 'Evidence'}</p>
            <span className="text-green-400 text-xs">{data.evidenceType || 'EVIDENCE'}</span>
          </div>
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-green-500 !border-2 !border-[#1a1a22]" />
    </div>
  )
})

EvidenceNode.displayName = 'EvidenceNode'