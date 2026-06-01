type Props = {
    title: string
    value: string
  }
  
  export function DashboardCard({
    title,
    value
  }: Props) {
  
    return (
  
      <div className='bg-[#323949] border border-[#40445A] rounded-2xl p-6'>
  
        <p className='text-sm text-[#7E8299] mb-2'>
          {title}
        </p>
  
        <h2 className='text-3xl font-bold text-[#B7B7B7]'>
          {value}
        </h2>
  
      </div>
  
    )
  }