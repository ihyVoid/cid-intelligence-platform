type Props = {
    data: {
      title: string
    }
  }
  
  export function OperationNode({
    data
  }: Props) {
  
    return (
  
      <div className='min-w-250px bg-[#212129] border border-yellow-500 rounded-2xl p-4 shadow-xl'>
  
        <p className='text-xs text-yellow-400 mb-2'>
          ACTIVE OPERATION
        </p>
  
        <h2 className='text-[#B7B7B7] font-bold'>
          {data.title}
        </h2>
  
      </div>
  
    )
  }