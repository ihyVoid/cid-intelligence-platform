import { Sidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'
import { DashboardCard } from '@/components/dashboard-card'
import { EvidenceGraph } from '@/components/evidence-graph'
export default function HomePage() {

  return (

    <main className='flex bg-[#212129] min-h-screen'>

      <Sidebar />

      <div className='flex-1 flex flex-col'>

        <Topbar />

        <div className='p-6'>

          <div className='grid grid-cols-4 gap-4 mb-6'>

            <DashboardCard
              title='Active Cases'
              value='24'
            />

            <DashboardCard
              title='Evidence Items'
              value='183'
            />

            <DashboardCard
              title='Active Operations'
              value='7'
            />

            <DashboardCard
              title='High Priority Targets'
              value='12'
            />

          </div>

          <div className='bg-[#323949] border border-[#40445A] rounded-2xl p-6 h-500px'>

            <h2 className='text-xl font-semibold text-[#B7B7B7] mb-4'>
              Advanced Evidence Board
            </h2>

            <div className='h-full rounded-xl border border-dashed border-[#40445A] flex items-center justify-center text-[#7E8299]'>

              <EvidenceGraph />
            </div>

          </div>

        </div>

      </div>

    </main>

  )
}