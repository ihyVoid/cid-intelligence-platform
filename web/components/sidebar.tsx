'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FolderKanban,
  ShieldAlert,
  Network,
  Users,
  FileSearch,
  Archive,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Eye,
  Package
} from 'lucide-react'

const items = [
  { title: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { title: 'Cases', icon: FolderKanban, href: '/cases' },
  { title: 'Operations', icon: ShieldAlert, href: '/operations' },
  { title: 'Evidence Board', icon: Network, href: '/evidence' },
  { title: 'Evidence Management', icon: Package, href: '/evidence-management' },
  { title: 'Suspects', icon: Users, href: '/suspects' },
  { title: 'Intelligence', icon: FileSearch, href: '/intelligence' },
  { title: 'Archives', icon: Archive, href: '/archives' },
  { title: 'Administration', icon: Settings, href: '/admin' },
]

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('cid_user')
    if (userStr) {
      setUser(JSON.parse(userStr))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('cid_user')
    router.push('/login')
  }

  return (
    <div className={`${collapsed ? 'w-[72px]' : 'w-[280px]'} h-screen bg-gradient-to-b from-[#1a1a22] to-[#12121a] border-r border-[#2a2a35] flex flex-col transition-all duration-300 relative`}>
      
      {/* Header */}
      <div className='p-4 border-b border-[#2a2a35]'>
        {!collapsed ? (
          <div>
            <div className='flex items-center gap-3 mb-2'>
              <div className='w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30'>
                <ShieldAlert className='w-6 h-6 text-white' />
              </div>
              <div>
                <h1 className='text-lg font-bold text-white'>CID SYSTEM</h1>
                <p className='text-[#7E8299] text-[10px] uppercase tracking-widest'>Intelligence Platform</p>
              </div>
            </div>
          </div>
        ) : (
          <div className='flex justify-center'>
            <div className='w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30'>
              <ShieldAlert className='w-6 h-6 text-white' />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className='flex-1 p-3 space-y-1 overflow-y-auto'>
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          
          return (
            <button
              key={item.title}
              onClick={() => router.push(item.href)}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/20' 
                  : 'text-[#B7B7B7] hover:bg-[#2a2a35] hover:text-white'
                }
              `}
            >
              <Icon size={20} className={isActive ? 'text-white' : ''} />
              {!collapsed && (
                <span className='text-sm font-medium'>{item.title}</span>
              )}
              {isActive && !collapsed && (
                <div className='ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-lg shadow-white/50' />
              )}
            </button>
          )
        })}
      </div>

      {/* User Section */}
      <div className='p-3 border-t border-[#2a2a35]'>
        {user && !collapsed && (
          <div className='mb-3 px-3 py-2 bg-[#0f0f14] rounded-xl border border-[#2a2a35]'>
            <p className='text-white text-sm font-medium truncate'>{user.user?.username || 'Admin'}</p>
            <p className='text-[#7E8299] text-xs'>{user.user?.role === 'admin' ? 'Administrator' : 'Agent'}</p>
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className='w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[#B7B7B7] hover:bg-red-500/10 hover:text-red-400 transition-all duration-200'
        >
          <LogOut size={20} />
          {!collapsed && <span className='text-sm font-medium'>Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className='absolute -right-3 top-20 w-6 h-6 bg-[#2a2a35] border border-[#3a3a45] rounded-full flex items-center justify-center text-[#7E8299] hover:text-white hover:bg-[#3a3a45] transition-all'
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </div>
  )
}
