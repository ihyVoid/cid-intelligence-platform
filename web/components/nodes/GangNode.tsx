'use client'

import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import { Users } from 'lucide-react'

interface GangNodeData {
  label?: string
  memberCount?: number
}

export const GangNode = memo(({ data, selected }: { data: GangNodeData; selected: boolean }) => {
  return (
    <div className={`relative group ${selected ? 'ring-2 ring-purple-500' : ''}`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-purple-500 !border-2 !border-[#1a1a22]" />
      
      <div className="bg-[#251a30] border border-purple-500 rounded-xl p-4 min-w-[180px]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{data.label || 'Gang'}</p>
            <span className="text-purple-400 text-xs">{data.memberCount ? `${data.memberCount} members` : 'GANG'}</span>
          </div>
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-purple-500 !border-2 !border-[#1a1a22]" />
    </div>
  )
})

GangNode.displayName = 'GangNode'