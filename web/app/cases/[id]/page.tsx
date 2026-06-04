'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'
import { 
  ArrowLeft, FileText, Users, User, Eye, Trash2, Clock, MapPin,
  CheckCircle, AlertTriangle, Shield, Calendar, Edit, Plus,
  X, ChevronRight, Loader2
} from 'lucide-react'
import axios from 'axios'
import { useRouter, useParams } from 'next/navigation'
import { jsPDF } from 'jspdf'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function CaseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [ready, setReady] = useState(false)
  const [caseData, setCaseData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const userStr = localStorage.getItem('cid_user')
    if (!userStr) { router.push('/login'); return }
    setReady(true)
    loadCase()
  }, [router, params])

  const loadCase = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/cases/${params.id}`)
      setCaseData(response.data.data)
    } catch (error) {
      console.error('Error loading case:', error)
    }
    setLoading(false)
  }

  const generatePDF = () => {
    if (!caseData) return
    const doc = new jsPDF()
    const primaryColor: [number, number, number] = [42, 42, 105]
    const accentColor: [number, number, number] = [232, 154, 19]

    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, 210, 40, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('CID INTELLIGENCE', 20, 18)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('CONFIDENTIAL CASE REPORT', 20, 28)
    doc.setFontSize(10)
    doc.text(`Case: ${caseData.caseNumber}`, 150, 18)
    doc.text(`Date: ${caseData.date}`, 150, 25)
    doc.text(`Time: ${caseData.time}`, 150, 32)

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(caseData.title, 20, 55)

    doc.setDrawColor(...accentColor)
    doc.setLineWidth(2)
    doc.line(20, 60, 190, 60)

    doc.setFillColor(232, 154, 19)
    doc.roundedRect(150, 50, 40, 8, 2, 2, 'F')
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(8)
    doc.text(caseData.classification, 152, 55.5)

    let yPos = 75
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Case Information', 20, yPos)
    yPos += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const details = [
      ['Location:', caseData.location],
      ['Reporting Agent:', caseData.reportingAgent],
      ['Handler:', caseData.handler || 'N/A'],
      ['Operation Type:', caseData.type.toUpperCase()],
      ['Status:', caseData.status.toUpperCase()],
      ['Priority:', caseData.priority.toUpperCase()]
    ]
    details.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold')
      doc.text(label, 20, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(value, 60, yPos)
      yPos += 6
    })
    
    yPos += 10
    
    if (caseData.suspects && caseData.suspects.length > 0) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Suspects', 20, yPos)
      yPos += 8
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      caseData.suspects.forEach((s: any) => {
        doc.text(`- ${s.fullName} (Threat: ${s.threatLevel}, Status: ${s.status})`, 20, yPos)
        yPos += 6
      })
      yPos += 10
    }

    if (caseData.evidences && caseData.evidences.length > 0) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Evidence', 20, yPos)
      yPos += 8
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      caseData.evidences.forEach((e: any) => {
        doc.text(`- ${e.title}: ${e.description}`, 20, yPos)
        yPos += 6
      })
      yPos += 10
    }

    if (caseData.timelineEvents && caseData.timelineEvents.length > 0) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Timeline', 20, yPos)
      yPos += 8
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      caseData.timelineEvents.forEach((t: any) => {
        doc.text(`[${t.eventTime}] ${t.title}: ${t.description}`, 20, yPos)
        yPos += 6
      })
      yPos += 10
    }

    if (caseData.actionsTaken) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Actions Taken', 20, yPos)
      yPos += 8
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(caseData.actionsTaken, 20, yPos)
      yPos += 20
    }

    if (caseData.recommendedNextStep) {
      doc.setFillColor(...primaryColor)
      doc.rect(20, yPos, 170, 20, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('Recommended Next Steps:', 25, yPos + 8)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text(caseData.recommendedNextStep, 25, yPos + 15)
    }

    doc.setTextColor(100, 100, 100)
    doc.setFontSize(8)
    doc.text('Generated by CID Intelligence Platform', 20, 280)
    doc.text(`Report Date: ${new Date().toLocaleString()}`, 20, 285)

    doc.save(`CID_${caseData.caseNumber}_Report.pdf`)
  }

  if (!ready || loading) return <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center"><div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin" /></div>

  if (!caseData) return <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center"><p className="text-white">Case not found</p></div>

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'suspects', label: 'Suspects', icon: User, count: caseData.suspects?.length },
    { id: 'evidence', label: 'Evidence', icon: FileText, count: caseData.evidences?.length },
    { id: 'timeline', label: 'Timeline', icon: Clock, count: caseData.timelineEvents?.length }
  ]

  return (
    <main className="flex bg-[#0f0f14] min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 p-6 overflow-auto">
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/cases')} className="p-2 bg-[#1a1a22] border border-[#2a2a35] rounded-xl text-[#7E8299] hover:text-white transition-all">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">{caseData.title}</h1>
                <p className="text-[#7E8299] text-sm mt-1">{caseData.caseNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={generatePDF}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2a2a69] to-[#e89a13] hover:opacity-90 rounded-xl text-white font-medium shadow-lg transition-all">
                <FileText className="w-4 h-4" />Export PDF
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6 border-b border-[#2a2a35]">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                  activeTab === tab.id 
                    ? 'text-[#e89a13] border-[#e89a13]' 
                    : 'text-[#7E8299] border-transparent hover:text-white'
                }`}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-1 px-2 py-0.5 bg-[#2a2a35] rounded-full text-xs">{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-6">
                <div className="bg-gradient-to-br from-[#1a1a22] to-[#12121a] border border-[#2a2a35] rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-white mb-4">Case Details</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-[#7E8299] text-sm">Location</p><p className="text-white font-medium">{caseData.location}</p></div>
                    <div><p className="text-[#7E8299] text-sm">Date & Time</p><p className="text-white font-medium">{caseData.date} {caseData.time}</p></div>
                    <div><p className="text-[#7E8299] text-sm">Reporting Agent</p><p className="text-white font-medium">{caseData.reportingAgent}</p></div>
                    <div><p className="text-[#7E8299] text-sm">Handler</p><p className="text-white font-medium">{caseData.handler || 'N/A'}</p></div>
                    <div><p className="text-[#7E8299] text-sm">Status</p><span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm capitalize">{caseData.status}</span></div>
                    <div><p className="text-[#7E8299] text-sm">Priority</p><span className={`px-2 py-1 rounded-lg text-sm capitalize ${caseData.priority === 'critical' ? 'bg-red-500/20 text-red-400' : caseData.priority === 'high' ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{caseData.priority}</span></div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#1a1a22] to-[#12121a] border border-[#2a2a35] rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-white mb-4">Description</h2>
                  <p className="text-[#B7B7B7] leading-relaxed">{caseData.description}</p>
                </div>

                {caseData.actionsTaken && (
                  <div className="bg-gradient-to-br from-[#1a1a22] to-[#12121a] border border-[#2a2a35] rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-white mb-4">Actions Taken</h2>
                    <p className="text-[#B7B7B7] leading-relaxed whitespace-pre-wrap">{caseData.actionsTaken}</p>
                  </div>
                )}

                {caseData.recommendedNextStep && (
                  <div className="bg-gradient-to-br from-[#2a2a69]/50 to-[#1a1a4a]/50 border border-[#2a2a69] rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-[#e89a13]" />
                      Recommended Next Steps
                    </h2>
                    <p className="text-[#B7B7B7] leading-relaxed">{caseData.recommendedNextStep}</p>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-[#1a1a22] to-[#12121a] border border-[#2a2a35] rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-white mb-4">Quick Stats</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[#7E8299]">Suspects</span>
                      <span className="text-white font-bold">{caseData.suspects?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#7E8299]">Victims</span>
                      <span className="text-white font-bold">{caseData.victims?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#7E8299]">Witnesses</span>
                      <span className="text-white font-bold">{caseData.witnesses?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#7E8299]">Evidence</span>
                      <span className="text-white font-bold">{caseData.evidences?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#7E8299]">Timeline Events</span>
                      <span className="text-white font-bold">{caseData.timelineEvents?.length || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#1a1a22] to-[#12121a] border border-[#2a2a35] rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-white mb-4">Classification</h2>
                  <div className="flex items-center justify-center py-4">
                    <span className="px-6 py-3 bg-[#e89a13]/20 text-[#e89a13] rounded-xl font-bold text-lg">{caseData.classification}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'suspects' && (
            <div className="space-y-4">
              {caseData.suspects && caseData.suspects.length > 0 ? caseData.suspects.map((s: any, i: number) => (
                <div key={i} className="bg-gradient-to-br from-[#1a1a22] to-[#12121a] border border-[#2a2a35] rounded-xl p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{s.fullName}</h3>
                      {s.alias && <p className="text-[#7E8299] text-sm">Alias: {s.alias}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-lg text-sm capitalize ${s.threatLevel === 'high' ? 'bg-red-500/20 text-red-400' : s.threatLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>{s.threatLevel}</span>
                      <span className={`px-3 py-1 rounded-lg text-sm capitalize ${s.status === 'active' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>{s.status}</span>
                    </div>
                  </div>
                  {s.description && <p className="mt-3 text-[#7E8299] text-sm">{s.description}</p>}
                </div>
              )) : (
                <div className="text-center py-20">
                  <User className="w-16 h-16 text-[#5a5a6e] mx-auto mb-4" />
                  <p className="text-[#7E8299]">No suspects recorded</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'evidence' && (
            <div className="space-y-4">
              {caseData.evidences && caseData.evidences.length > 0 ? caseData.evidences.map((e: any, i: number) => (
                <div key={i} className="bg-gradient-to-br from-[#1a1a22] to-[#12121a] border border-[#2a2a35] rounded-xl p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#2a2a69] rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-[#e89a13]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{e.title}</h3>
                      <p className="text-[#7E8299] text-sm">{e.description}</p>
                    </div>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm">{e.evidenceType}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-20">
                  <FileText className="w-16 h-16 text-[#5a5a6e] mx-auto mb-4" />
                  <p className="text-[#7E8299]">No evidence recorded</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="relative pl-8">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#2a2a35]" />
              {caseData.timelineEvents && caseData.timelineEvents.length > 0 ? caseData.timelineEvents.map((t: any, i: number) => (
                <div key={i} className="relative mb-6">
                  <div className="absolute -left-4 w-8 h-8 bg-[#2a2a69] rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gradient-to-br from-[#1a1a22] to-[#12121a] border border-[#2a2a35] rounded-xl p-4 ml-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-semibold">{t.title}</h3>
                      <span className="text-[#e89a13] text-sm font-mono">{t.eventTime}</span>
                    </div>
                    <p className="text-[#7E8299] text-sm">{t.description}</p>
                    {t.source && <p className="text-[#5a5a6e] text-xs mt-2">Source: {t.source}</p>}
                  </div>
                </div>
              )) : (
                <div className="text-center py-20">
                  <Clock className="w-16 h-16 text-[#5a5a6e] mx-auto mb-4" />
                  <p className="text-[#7E8299]">No timeline events</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}