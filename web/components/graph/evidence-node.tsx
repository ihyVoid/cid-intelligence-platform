type Props = {
    data: {
      title: string
      type: string
      classification: string
    }
  }
  
  export function EvidenceNode({
    data
  }: Props) {
  
    return (
  
      <div className='min-w-220px bg-[#323949] border border-[#40445A] rounded-2xl p-4 shadow-xl'>
  
        <div className='flex items-center justify-between mb-3'>
  
          <span className='text-xs px-2 py-1 rounded bg-[#40445A] text-[#B7B7B7]'>
            {data.type}
          </span>
  
          <span className='text-xs text-red-400'>
            {data.classification}
          </span>
  
        </div>
  
        <h2 className='text-[#B7B7B7] font-semibold'>
          {data.title}
        </h2>
  
      </div>
  
    )
  }