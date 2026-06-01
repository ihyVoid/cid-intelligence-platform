'use client'

import {
  LayoutDashboard,
  FolderKanban,
  ShieldAlert,
  Network,
  Users,
  FileSearch,
  Archive,
  Settings
} from 'lucide-react'

const items = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'Cases',
    icon: FolderKanban
  },
  {
    title: 'Operations',
    icon: ShieldAlert
  },
  {
    title: 'Evidence Board',
    icon: Network
  },
  {
    title: 'Suspects',
    icon: Users
  },
  {
    title: 'Intelligence',
    icon: FileSearch
  },
  {
    title: 'Archives',
    icon: Archive
  },
  {
    title: 'Administration',
    icon: Settings
  }
]

export function Sidebar() {

  return (

    <div className='w-280px h-screen bg-[#323949] border-r border-[#40445A] p-4 flex flex-col'>

      <div className='mb-10'>

        <h1 className='text-2xl font-bold text-[#B7B7B7]'>
          CID SYSTEM
        </h1>

        <p className='text-sm text-[#7E8299]'>
          Intelligence Platform
        </p>

      </div>

      <div className='flex flex-col gap-2'>

        {items.map((item) => {

          const Icon = item.icon

          return (

            <button
              key={item.title}
              className='flex items-center gap-3 px-4 py-3 rounded-xl bg-transparent hover:bg-[#40445A] transition-all text-[#B7B7B7]'
            >

              <Icon size={20} />

              <span>
                {item.title}
              </span>

            </button>

          )
        })}

      </div>

    </div>

  )
}