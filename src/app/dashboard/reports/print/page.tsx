"use client"

import { useEffect, useMemo, useState } from 'react'
import { applicationManager, type JobApplication, ApplicationStatus, ApplicationPriority } from '@/lib/applications'
import { DEFAULT_EXPORT_FIELDS } from '@/lib/exports'

export default function PrintReportPage() {
  const [apps, setApps] = useState<JobApplication[]>([])

  useEffect(() => {
    setApps(applicationManager.getApplications())
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') window.print()
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Applications Report</h1>
      <p className="text-sm text-gray-600 mb-6">Generated on {new Date().toLocaleString()}</p>

      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            {DEFAULT_EXPORT_FIELDS.map(f => (
              <th key={f.key} className="text-left px-3 py-2 border-b">{f.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {apps.map(app => (
            <tr key={app.id} className="border-b">
              {DEFAULT_EXPORT_FIELDS.map(f => {
                const raw: any = (app as any)[f.key]
                const value = raw instanceof Date ? raw.toLocaleDateString() : Array.isArray(raw) ? raw.join(', ') : typeof raw === 'object' && raw !== null ? JSON.stringify(raw) : String(raw ?? '')
                return <td key={f.key} className="px-3 py-2">{value}</td>
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <style jsx global>{`
        @media print {
          body { background: #fff !important; }
          a[href]:after { content: "" !important; }
        }
      `}</style>
    </div>
  )
}
