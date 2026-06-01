type Props = {
    data: {
      name: string
      level: string
    }
  }
  
  export function SuspectNode({
    data
  }: Props) {
  
    return (
  
      <div className='min-w-[220px] bg-[#3D3E51] border border-red-500 rounded-2xl p-4 shadow-xl'>
  
        <p className='text-xs text-red-400 mb-2'>
          HIGH PRIORITY TARGET
        </p>
  
        <h2 className='text-[#B7B7B7] font-bold'>
          {data.name}
        </h2>
  
        <p className='text-sm text-[#7E8299] mt-2'>
          Threat Level: {data.level}
        </p>
  
      </div>
  
    )
  }