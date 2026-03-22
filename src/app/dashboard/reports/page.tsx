"use client"

import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Download, FileText, Filter, Printer, RefreshCw } from 'lucide-react'
import { applicationManager, type JobApplication, ApplicationStatus, ApplicationPriority } from '@/lib/applications'
import { exportApplications, DEFAULT_EXPORT_FIELDS, applicationsToRows, rowsToCSV, computeStats } from '@/lib/exports'

const statusOptions = Object.values(ApplicationStatus)
const priorityOptions = Object.values(ApplicationPriority)

export default function ReportsPage() {
  const [mounted, setMounted] = useState(false)
  const [apps, setApps] = useState<JobApplication[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<ApplicationStatus[]>([])
  const [selectedPriorities, setSelectedPriorities] = useState<ApplicationPriority[]>([])
  const [dateStart, setDateStart] = useState<string>('')
  const [dateEnd, setDateEnd] = useState<string>('')

  useEffect(() => {
    setMounted(true)
    const sub = applicationManager.subscribe(setApps)
    setApps(applicationManager.getApplications())
    return sub
  }, [])

  const filtered = useMemo(() => {
    return apps.filter(app => {
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(app.status)) return false
      if (selectedPriorities.length > 0 && !selectedPriorities.includes(app.priority)) return false
      if (dateStart) {
        const s = new Date(dateStart)
        if (app.appliedDate < s) return false
      }
      if (dateEnd) {
        const e = new Date(dateEnd)
        if (app.appliedDate > e) return false
      }
      return true
    })
  }, [apps, selectedStatuses, selectedPriorities, dateStart, dateEnd])

  const stats = useMemo(() => computeStats(filtered), [filtered])

  const handleExportCSV = () => {
    exportApplications(filtered, { filename: 'applications-report', format: 'csv' })
  }

  const handleExportXLSX = () => {
    exportApplications(filtered, { filename: 'applications-report', format: 'xlsx' })
  }

  const handleExportJSON = () => {
    const rows = applicationsToRows(filtered, DEFAULT_EXPORT_FIELDS)
    const content = JSON.stringify(rows, null, 2)
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `applications-report.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    exportApplications(filtered, { filename: 'applications-report', format: 'pdf' })
  }

  const handlePrintPDF = () => {
    window.open('/dashboard/reports/print', '_blank')
  }

  const toggleStatus = (s: ApplicationStatus) => {
    setSelectedStatuses(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }
  const togglePriority = (p: ApplicationPriority) => {
    setSelectedPriorities(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  return (
    <DashboardLayout title="Reports" subtitle="Export your applications and stats">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <Card className="p-4 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Filters</h2>
            <Button variant="ghost" size="sm" onClick={() => { setSelectedStatuses([]); setSelectedPriorities([]); setDateStart(''); setDateEnd('') }}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-xs">Status</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {statusOptions.map(s => (
                  <button
                    key={s}
                    onClick={() => toggleStatus(s)}
                    className={`px-2 py-1 rounded-full text-xs border ${selectedStatuses.includes(s) ? 'bg-blue-50 text-blue-700 border-blue-200' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs">Priority</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {priorityOptions.map(p => (
                  <button
                    key={p}
                    onClick={() => togglePriority(p)}
                    className={`px-2 py-1 rounded-full text-xs border ${selectedPriorities.includes(p) ? 'bg-green-50 text-green-700 border-green-200' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">From</Label>
                <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} className="w-full mt-1 px-2 py-1 border rounded" />
              </div>
              <div>
                <Label className="text-xs">To</Label>
                <input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} className="w-full mt-1 px-2 py-1 border rounded" />
              </div>
            </div>
          </div>
        </Card>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">Overview</h2>
                <p className="text-xs text-muted-foreground">{filtered.length} applications selected</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleExportCSV}>
                  <Download className="w-4 h-4 mr-1" /> CSV
                </Button>
                <Button size="sm" variant="secondary" onClick={handleExportXLSX}>
                  <Download className="w-4 h-4 mr-1" /> Excel
                </Button>
                <Button size="sm" variant="secondary" onClick={handleExportJSON}>
                  <Download className="w-4 h-4 mr-1" /> JSON
                </Button>
                <Button size="sm" variant="outline" onClick={handleExportPDF}>
                  <FileText className="w-4 h-4 mr-1" /> PDF
                </Button>
                <Button size="sm" variant="outline" onClick={handlePrintPDF}>
                  <Printer className="w-4 h-4 mr-1" /> Print
                </Button>
              </div>
            </div>

            {/* Simple stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="p-3 rounded border">
                <div className="text-xs text-muted-foreground">Total</div>
                <div className="text-xl font-bold">{stats.total}</div>
              </div>
              <div className="p-3 rounded border">
                <div className="text-xs text-muted-foreground">Applied</div>
                <div className="text-xl font-bold">{stats.byStatus[ApplicationStatus.APPLIED] || 0}</div>
              </div>
              <div className="p-3 rounded border">
                <div className="text-xs text-muted-foreground">Interviews</div>
                <div className="text-xl font-bold">{stats.byStatus[ApplicationStatus.TECHNICAL_INTERVIEW] + stats.byStatus[ApplicationStatus.ON_SITE_INTERVIEW] + stats.byStatus[ApplicationStatus.FINAL_INTERVIEW] || 0}</div>
              </div>
              <div className="p-3 rounded border">
                <div className="text-xs text-muted-foreground">Offers</div>
                <div className="text-xl font-bold">{stats.byStatus[ApplicationStatus.OFFER_RECEIVED] || 0}</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-4">Status Breakdown</h3>
            <div className="space-y-3">
              {Object.values(ApplicationStatus).map(s => {
                const count = stats.byStatus[s] || 0
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
                return (
                  <div key={s} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{s}</span>
                      <span className="text-gray-600">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500/70" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    {DEFAULT_EXPORT_FIELDS.map(f => (
                      <th key={f.key} className="text-left px-3 py-2 font-medium">{f.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(app => (
                    <tr key={app.id} className="border-b hover:bg-muted/30">
                      {DEFAULT_EXPORT_FIELDS.map(f => {
                        const raw: any = (app as any)[f.key]
                        const value = raw instanceof Date ? raw.toLocaleDateString() : Array.isArray(raw) ? raw.join(', ') : typeof raw === 'object' && raw !== null ? JSON.stringify(raw) : String(raw ?? '')
                        return <td key={f.key} className="px-3 py-2">{value}</td>
                      })}
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td className="px-3 py-6 text-center text-muted-foreground" colSpan={DEFAULT_EXPORT_FIELDS.length}>No applications match the selected filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
