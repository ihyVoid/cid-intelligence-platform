'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'
import { 
  ArrowLeft, Save, FileText, Users, User, CheckCircle
} from 'lucide-react'
import axios from 'axios'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function NewCasePage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: 'Undercover Operation - Weapon Trade',
    description: 'Agent Anthoni Hernandez discovered a weapon sale opportunity through Instagram. Contact was established and meeting location was set at Bahamas. CIRG team was coordinated for strike operation.',
    date: '29/2/1405',
    time: '22:50',
    location: 'In front of house top of the Bahamas',
    reportingAgent: 'Agent Pedro Alejandro',
    handler: 'Agent Alex Winchester',
    involvedAgents: 'Agent Anthoni Hernandez, Agent Rustin Bohl, Agent Dominic Materson',
    actionsTaken: '1. Agent Anthoni Hernandez found weapon sale on Instagram\n2. Contact established via direct message\n3. Arranged meeting location at Bahamas\n4. Coordinated with CIRG team for strike\n5. Suspect arrived with 10 assault rifles\n6. Received weapons and identified suspect\n7. Sent emergency signal to handler\n8. Team arrested suspect\n9. Transported to federal HQ2\n10. Investigation completed\n11. Proceeded to safe house with suspect',
    recommendedNextStep: 'If observed, conduct necessary follow-up investigations',
    summary: 'Undercover operation to intercept weapon trade. Suspect arrested with 10 assault rifles. Sentenced to 50 min jail.',
    suspect: 'Mamad Rebel',
    victim: 'No Victim',
    witness: 'No Witness'
  })

  useEffect(() => {
    const userStr = localStorage.getItem('cid_user')
    if (!userStr) { router.push('/login'); return }
    setReady(true)
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const response = await axios.post(`${API_URL}/cases`, {
        title: formData.title,
        description: formData.description,
        type: 'undercover',
        priority: 'critical',
        classification: 'CONFIDENTIAL',
        location: formData.location,
        date: formData.date,
        time: formData.time,
        reportingAgent: formData.reportingAgent,
        handler: formData.handler,
        involvedAgents: formData.involvedAgents.split(',').map(a => a.trim()),
        actionsTaken: formData.actionsTaken,
        recommendedNextStep: formData.recommendedNextStep,
        summary: formData.summary,
        createdBy: 'admin'
      })
      if (formData.suspect && formData.suspect !== 'No Victim') {
        await axios.post(`${API_URL}/cases/${response.data.data.id}/suspects`, {
          fullName: formData.suspect,
          threatLevel: 'high',
          status: 'active',
          description: 'Suspect in weapon trade operation'
        })
      }
      router.push('/cases')
    } catch (error) { console.error('Error:', error) }
    setSaving(false)
  }

  const generatePDF = () => {
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
    doc.text('Case: CID-UNDERCOVER-001', 150, 18)
    doc.text(`Date: ${formData.date}`, 150, 25)
    doc.text(`Time: ${formData.time}`, 150, 32)

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(formData.title, 20, 55)

    doc.setDrawColor(...accentColor)
    doc.setLineWidth(2)
    doc.line(20, 60, 190, 60)

    doc.setFillColor(232, 154, 19)
    doc.roundedRect(150, 50, 40, 8, 2, 2, 'F')
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(8)
    doc.text('CONFIDENTIAL', 152, 55.5)

    let yPos = 75
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Case Information', 20, yPos)
    yPos += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const details = [
      ['Location:', formData.location],
      ['Reporting Agent:', formData.reportingAgent],
      ['Handler:', formData.handler],
      ['Operation Type:', 'UNDERCOVER'],
      ['Status:', 'COMPLETED'],
      ['Priority:', 'CRITICAL']
    ]
    details.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold')
      doc.text(label, 20, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(value, 60, yPos)
      yPos += 6
    })
    
    yPos += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Suspect', 20, yPos)
    yPos += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Name: ${formData.suspect}`, 20, yPos)
    yPos += 6
    doc.text('Status: ARRESTED', 20, yPos)
    yPos += 6
    doc.text('Threat Level: HIGH', 20, yPos)
    yPos += 10

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Evidence', 20, yPos)
    yPos += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('• Assault Rifle x10 (SEIZED)', 20, yPos)
    yPos += 10

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Actions Taken', 20, yPos)
    yPos += 8
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    formData.actionsTaken.split('\n').forEach(action => {
      if (action.trim()) { doc.text(action, 20, yPos); yPos += 5 }
    })
    yPos += 10

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Involved Agents', 20, yPos)
    yPos += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    formData.involvedAgents.split(',').forEach((agent, i) => {
      doc.text(`${i + 1}. ${agent.trim()}`, 20, yPos)
      yPos += 6
    })
    yPos += 10

    doc.setFillColor(...primaryColor)
    doc.rect(20, yPos, 170, 25, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Recommended Next Steps:', 25, yPos + 8)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(formData.recommendedNextStep, 25, yPos + 16)
    yPos += 35

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Sentence: 50 min jail', 20, yPos)

    doc.setTextColor(100, 100, 100)
    doc.setFontSize(8)
    doc.text('Generated by CID Intelligence Platform', 20, 280)
    doc.text(`Report Date: ${new Date().toLocaleString()}`, 20, 285)
    doc.text('This document is confidential.', 20, 290)

    doc.save(`CID_Report_Undercover_Weapon_Trade.pdf`)
  }

  if (!ready) return <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center"><div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin" /></div>

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
                <h1 className="text-2xl font-bold text-white">New Case Report</h1>
                <p className="text-[#7E8299] text-sm mt-1">Create comprehensive case documentation</p>
              </div>
            </div>
            <button onClick={generatePDF} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2a2a69] to-[#e89a13] hover:opacity-90 rounded-xl text-white font-medium shadow-lg transition-all">
              <FileText className="w-4 h-4" />Generate PDF
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gradient-to-br from-[#1a1a22] to-[#12121a] border border-[#2a2a35] rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#2a2a69] to-[#e89a13] rounded-lg flex items-center justify-center"><FileText className="w-4 h-4 text-white" /></div>
                Case Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[#7E8299] text-sm font-medium block mb-2">Case Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-[#e89a13]/50 rounded-xl px-4 py-3 text-white outline-none transition-colors" />
                </div>
                <div><label className="text-[#7E8299] text-sm font-medium block mb-2">Date</label><input type="text" name="date" value={formData.date} onChange={handleChange} className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-[#e89a13]/50 rounded-xl px-4 py-3 text-white outline-none" /></div>
                <div><label className="text-[#7E8299] text-sm font-medium block mb-2">Time</label><input type="text" name="time" value={formData.time} onChange={handleChange} className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-[#e89a13]/50 rounded-xl px-4 py-3 text-white outline-none" /></div>
                <div className="col-span-2"><label className="text-[#7E8299] text-sm font-medium block mb-2">Location</label><input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-[#e89a13]/50 rounded-xl px-4 py-3 text-white outline-none" /></div>
              </div>
              <div className="mt-4"><label className="text-[#7E8299] text-sm font-medium block mb-2">Description</label><textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-[#e89a13]/50 rounded-xl px-4 py-3 text-white outline-none resize-none" /></div>
            </div>

            <div className="bg-gradient-to-br from-[#1a1a22] to-[#12121a] border border-[#2a2a35] rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#e89a13] to-[#c47d0f] rounded-lg flex items-center justify-center"><Users className="w-4 h-4 text-white" /></div>
                Personnel
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[#7E8299] text-sm font-medium block mb-2">Reporting Agent *</label><input type="text" name="reportingAgent" value={formData.reportingAgent} onChange={handleChange} className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-[#e89a13]/50 rounded-xl px-4 py-3 text-white outline-none" /></div>
                <div><label className="text-[#7E8299] text-sm font-medium block mb-2">Handler</label><input type="text" name="handler" value={formData.handler} onChange={handleChange} className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-[#e89a13]/50 rounded-xl px-4 py-3 text-white outline-none" /></div>
                <div className="col-span-2"><label className="text-[#7E8299] text-sm font-medium block mb-2">Involved Agents (comma separated)</label><input type="text" name="involvedAgents" value={formData.involvedAgents} onChange={handleChange} className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-[#e89a13]/50 rounded-xl px-4 py-3 text-white outline-none" /></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1a1a22] to-[#12121a] border border-[#2a2a35] rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center"><User className="w-4 h-4 text-white" /></div>
                Involved Parties
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="text-[#7E8299] text-sm font-medium block mb-2">Suspect</label><input type="text" name="suspect" value={formData.suspect} onChange={handleChange} className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-[#e89a13]/50 rounded-xl px-4 py-3 text-white outline-none" /></div>
                <div><label className="text-[#7E8299] text-sm font-medium block mb-2">Victim</label><input type="text" name="victim" value={formData.victim} onChange={handleChange} className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-[#e89a13]/50 rounded-xl px-4 py-3 text-white outline-none" /></div>
                <div><label className="text-[#7E8299] text-sm font-medium block mb-2">Witness</label><input type="text" name="witness" value={formData.witness} onChange={handleChange} className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-[#e89a13]/50 rounded-xl px-4 py-3 text-white outline-none" /></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1a1a22] to-[#12121a] border border-[#2a2a35] rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center"><CheckCircle className="w-4 h-4 text-white" /></div>
                Actions & Recommendations
              </h2>
              <div className="space-y-4">
                <div><label className="text-[#7E8299] text-sm font-medium block mb-2">Actions Taken</label><textarea name="actionsTaken" value={formData.actionsTaken} onChange={handleChange} rows={6} className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-[#e89a13]/50 rounded-xl px-4 py-3 text-white outline-none resize-none" /></div>
                <div><label className="text-[#7E8299] text-sm font-medium block mb-2">Recommended Next Steps</label><textarea name="recommendedNextStep" value={formData.recommendedNextStep} onChange={handleChange} rows={2} className="w-full bg-[#0f0f14] border border-[#2a2a35] focus:border-[#e89a13]/50 rounded-xl px-4 py-3 text-white outline-none resize-none" /></div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4">
              <button type="button" onClick={() => router.push('/cases')} className="px-6 py-3 bg-[#2a2a35] hover:bg-[#3a3a45] rounded-xl text-white font-medium transition-all">Cancel</button>
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2a2a69] to-[#e89a13] hover:opacity-90 disabled:opacity-50 rounded-xl text-white font-semibold shadow-lg transition-all">
                {saving ? 'Creating...' : <><Save className="w-4 h-4" />Create Case</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}