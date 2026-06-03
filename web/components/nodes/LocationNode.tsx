'use client'

import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import { MapPin } from 'lucide-react'

interface LocationNodeData {
  label?: string
  address?: string
}

export const LocationNode = memo(({ data, selected }: { data: LocationNodeData; selected: boolean }) => {
  return (
    <div className={`relative group ${selected ? 'ring-2 ring-cyan-500' : ''}`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-[#1a1a22]" />
      
      <div className="bg-[#1a2630] border border-cyan-500 rounded-xl p-4 min-w-[180px]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{data.label || 'Location'}</p>
            <span className="text-cyan-400 text-xs">{data.address || 'LOCATION'}</span>
          </div>
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-[#1a1a22]" />
    </div>
  )
})

LocationNode.displayName = 'LocationNode'