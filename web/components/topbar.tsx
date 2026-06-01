export function Topbar() {

    return (
  
      <div className='w-full h-70px bg-[#323949] border-b border-[#40445A] flex items-center justify-between px-6'>
  
        <div>
  
          <h2 className='text-xl font-semibold text-[#B7B7B7]'>
            CID Intelligence Dashboard
          </h2>
  
        </div>
  
        <div className='flex items-center gap-3'>
  
          <div className='w-10 h-10 rounded-full bg-[#40445A]' />
  
          <div>
  
            <p className='text-sm text-[#B7B7B7]'>
              Agent Admin
            </p>
  
            <p className='text-xs text-[#7E8299]'>
              TOP SECRET ACCESS
            </p>
  
          </div>
  
        </div>
  
      </div>
  
    )
  }