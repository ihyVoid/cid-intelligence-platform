'use client'

import { useState, useEffect } from 'react'
import { Search, Bell, ChevronDown, User, Settings, LogOut } from 'lucide-react'

export function Topbar() {
  const [user, setUser] = useState<any>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    const userStr = localStorage.getItem('cid_user')
    if (userStr) {
      setUser(JSON.parse(userStr))
    }

    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }))
    }
    
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className='h-16 bg-gradient-to-r from-[#1a1a22] to-[#25252f] border-b border-[#2a2a35] px-6 flex items-center justify-between'>
      {/* Search */}
      <div className='relative flex-1 max-w-md'>
        <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5a5a6e]' />
        <input
          type='text'
          placeholder='Search cases, evidence, suspects...'
          className='w-full bg-[#0f0f14] border border-[#2a2a35] rounded-xl pl-12 pr-4 py-2.5 text-sm text-white placeholder:text-[#5a5a6e] outline-none focus:border-[#4a4a55] transition-colors'
        />
        <span className='absolute right-4 top-1/2 -translate-y-1/2 text-[#3a3a45] text-xs'>
          ⌘K
        </span>
      </div>

      {/* Right side */}
      <div className='flex items-center gap-4 ml-6'>
        {/* Time */}
        <div className='hidden md:flex flex-col items-end'>
          <span className='text-white text-sm font-medium'>{currentTime}</span>
          <span className='text-[#5a5a6e] text-xs'>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Notifications */}
        <button className='relative p-2.5 bg-[#0f0f14] border border-[#2a2a35] rounded-xl hover:bg-[#1a1a22] transition-colors'>
          <Bell className='w-5 h-5 text-[#7E8299]' />
          <span className='absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full' />
        </button>

        {/* User */}
        <div className='relative'>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className='flex items-center gap-3 p-2 bg-[#0f0f14] border border-[#2a2a35] rounded-xl hover:bg-[#1a1a22] transition-colors'
          >
            <div className='w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center'>
              <User className='w-4 h-4 text-white' />
            </div>
            <div className='hidden md:block text-left'>
              <p className='text-white text-sm font-medium'>
                {user?.user?.username || 'Admin'}
              </p>
              <p className='text-[#5a5a6e] text-xs'>
                {user?.user?.role === 'admin' ? 'Administrator' : 'Agent'}
              </p>
            </div>
            <ChevronDown className='w-4 h-4 text-[#5a5a6e]' />
          </button>

          {showDropdown && (
            <div className='absolute right-0 top-full mt-2 w-56 bg-gradient-to-br from-[#1a1a22] to-[#12121a] border border-[#2a2a35] rounded-xl shadow-xl shadow-black/50 overflow-hidden z-50'>
              <div className='p-3 border-b border-[#2a2a35]'>
                <p className='text-white font-medium'>{user?.user?.username || 'Admin'}</p>
                <p className='text-[#5a5a6e] text-xs'>{user?.user?.email || 'admin@cid.gov'}</p>
              </div>
              <div className='p-2'>
                <button className='w-full flex items-center gap-3 px-3 py-2.5 text-[#B7B7B7] hover:bg-[#2a2a35] hover:text-white rounded-lg transition-colors'>
                  <User className='w-4 h-4' />
                  <span className='text-sm'>Profile</span>
                </button>
                <button className='w-full flex items-center gap-3 px-3 py-2.5 text-[#B7B7B7] hover:bg-[#2a2a35] hover:text-white rounded-lg transition-colors'>
                  <Settings className='w-4 h-4' />
                  <span className='text-sm'>Settings</span>
                </button>
                <button 
                  onClick={() => {
                    localStorage.removeItem('cid_user')
                    window.location.href = '/login'
                  }}
                  className='w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors'
                >
                  <LogOut className='w-4 h-4' />
                  <span className='text-sm'>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
