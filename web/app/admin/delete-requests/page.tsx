'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'
import { Trash2, CheckCircle, XCircle, Clock, AlertTriangle, FileText, X } from 'lucide-react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

interface DeleteRequest {
  id: string
  entityType: string
  entityId: string
  reason: string
  requestedBy: string
  status: string
  reviewedBy: string | null
  reviewedAt: string | null
  createdAt: string
}

export default function DeleteRequestsPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [requests, setRequests] = useState<DeleteRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<DeleteRequest | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('cid_user')
    if (!userStr) { router.push('/login'); return }
    setReady(true)
    loadRequests()
  }, [router])

  const loadRequests = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/delete-requests/all`)
      setRequests(response.data.data)
    } catch (error) {
      console.error('Error loading delete requests:', error)
    }
    setLoading(false)
  }

  const handleApprove = async () => {
    if (!selectedRequest) return
    try {
      await axios.post(`${API_URL}/delete-requests/${selectedRequest.id}/approve`, {
        reviewedBy: 'admin'
      })
      setShowApproveModal(false)
      setSelectedRequest(null)
      loadRequests()
      alert('Delete request approved. The entity has been deleted.')
    } catch (error) {
      console.error('Error approving request:', error)
      alert('Error approving request')
    }
  }

  const handleReject = async () => {
    if (!selectedRequest) return
    try {
      await axios.post(`${API_URL}/delete-requests/${selectedRequest.id}/reject`, {
        reviewedBy: 'admin'
      })
      setShowRejectModal(false)
      setSelectedRequest(null)
      loadRequests()
    } catch (error) {
      console.error('Error rejecting request:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium flex items-center gap-1">
          <Clock className="w-3 h-3" /> Pending
        </span>
      case 'APPROVED':
        return <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> Approved
        </span>
      case 'REJECTED':
        return <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium flex items-center gap-1">
          <XCircle className="w-3 h-3" /> Rejected
        </span>
      default:
        return <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">{status}</span>
    }
  }

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'case':
        return <FileText className="w-4 h-4" />
      case 'evidence':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Trash2 className="w-4 h-4" />
    }
  }

  if (!ready) return <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center"><div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <main className="flex bg-[#0f0f14] min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 p-6 overflow-auto">
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3">
                <Link href="/admin" className="text-[#5a5a6e] hover:text-white text-sm">← Back to Admin</Link>
              </div>
              <h1 className="text-2xl font-bold text-white mt-2">Delete Requests</h1>
              <p className="text-[#7E8299] text-sm mt-1">Review and approve entity deletion requests</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#7E8299]">
                {requests.filter(r => r.status === 'PENDING').length} pending requests
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-gradient-to-br from-[#1a1a22] to-[#12121a] border border-[#2a2a35] rounded-xl p-12 text-center">
              <CheckCircle className="w-16 h-16 text-[#3a3a45] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Delete Requests</h3>
              <p className="text-[#7E8299]">All delete requests have been processed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map(request => (
                <div key={request.id} className="bg-gradient-to-br from-[#1a1a22] to-[#12121a] border border-[#2a2a35] rounded-xl p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${request.status === 'PENDING' ? 'bg-yellow-500/20' : request.status === 'APPROVED' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        <span className={request.status === 'PENDING' ? 'text-yellow-400' : request.status === 'APPROVED' ? 'text-green-400' : 'text-red-400'}>
                          {getEntityIcon(request.entityType)}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium capitalize">{request.entityType} Deletion</p>
                        <p className="text-[#7E8299] text-xs">ID: {request.entityId.substring(0, 20)}...</p>
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                  
                  <div className="mb-4 p-4 bg-[#0f0f14] rounded-xl border border-[#2a2a35]">
                    <p className="text-[#7E8299] text-xs mb-2">Reason for deletion:</p>
                    <p className="text-white text-sm">{request.reason}</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-[#2a2a35]">
                    <div className="flex items-center gap-4 text-xs text-[#5a5a6e]">
                      <span>Requested by: {request.requestedBy}</span>
                      <span>•</span>
                      <span>{new Date(request.createdAt).toLocaleString()}</span>
                      {request.reviewedBy && (
                        <>
                          <span>•</span>
                          <span>Reviewed by: {request.reviewedBy}</span>
                        </>
                      )}
                    </div>
                    
                    {request.status === 'PENDING' && (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => { setSelectedRequest(request); setShowRejectModal(true) }}
                          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />Reject
                        </button>
                        <button 
                          onClick={() => { setSelectedRequest(request); setShowApproveModal(true) }}
                          className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl text-white text-sm font-medium flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />Approve
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#1a1a22] to-[#12121a] border border-[#2a2a35] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Approve Delete Request</h3>
              <button onClick={() => setShowApproveModal(false)} className="text-[#5a5a6e] hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                This action cannot be undone. The {selectedRequest.entityType} will be permanently deleted.
              </p>
            </div>
            <p className="text-[#7E8299] mb-6">
              You are about to delete a {selectedRequest.entityType}. All associated data will be removed from the database.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowApproveModal(false)}
                className="flex-1 py-2.5 bg-[#2a2a35] hover:bg-[#3a3a45] rounded-xl text-white text-sm font-medium">
                Cancel
              </button>
              <button onClick={handleApprove}
                className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl text-white text-sm font-medium">
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#1a1a22] to-[#12121a] border border-[#2a2a35] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Reject Delete Request</h3>
              <button onClick={() => setShowRejectModal(false)} className="text-[#5a5a6e] hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-[#7E8299] mb-6">
              Are you sure you want to reject this delete request? The requestor will need to submit a new request if deletion is still required.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowRejectModal(false)}
                className="flex-1 py-2.5 bg-[#2a2a35] hover:bg-[#3a3a45] rounded-xl text-white text-sm font-medium">
                Cancel
              </button>
              <button onClick={handleReject}
                className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-xl text-white text-sm font-medium">
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}