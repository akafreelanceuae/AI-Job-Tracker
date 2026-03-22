import { type JobApplication, ApplicationStatus, ApplicationPriority } from '@/lib/applications'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export type ExportFormat = 'csv' | 'json' | 'xlsx' | 'pdf'

export interface ExportField {
  key: string
  label: string
}

export interface ExportConfig {
  filename: string
  fields: ExportField[]
  includeNotes?: boolean
  includeTimeline?: boolean
  dateRange?: { start: Date; end: Date }
  format?: ExportFormat
}

export const DEFAULT_EXPORT_FIELDS: ExportField[] = [
  { key: 'id', label: 'ID' },
  { key: 'companyName', label: 'Company' },
  { key: 'position', label: 'Position' },
  { key: 'status', label: 'Status' },
  { key: 'priority', label: 'Priority' },
  { key: 'location', label: 'Location' },
  { key: 'workType', label: 'Work Type' },
  { key: 'employmentType', label: 'Employment Type' },
  { key: 'appliedDate', label: 'Applied Date' },
  { key: 'lastUpdated', label: 'Last Updated' },
]

export function applicationsToRows(apps: JobApplication[], fields: ExportField[] = DEFAULT_EXPORT_FIELDS): any[] {
  return apps.map(app => {
    const row: Record<string, any> = {}
    fields.forEach(f => {
      let value: any = (app as any)[f.key]
      if (value instanceof Date) value = value.toISOString()
      if (typeof value === 'object' && value !== null) value = JSON.stringify(value)
      row[f.label] = value ?? ''
    })
    return row
  })
}

export function rowsToCSV(rows: any[]): string {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const escape = (val: any) => {
    if (val === null || val === undefined) return ''
    const str = String(val)
    // Escape quotes by doubling, wrap in quotes if contains comma/newline
    const needsQuotes = /[",\n]/.test(str)
    const escaped = str.replace(/"/g, '""')
    return needsQuotes ? `"${escaped}"` : escaped
  }
  const lines = [headers.join(',')]
  rows.forEach(row => {
    lines.push(headers.map(h => escape(row[h])).join(','))
  })
  return lines.join('\n')
}

function downloadBlob(content: string, filename: string, mime: string) {
  if (typeof window === 'undefined') return
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function downloadBlobBinary(blob: Blob, filename: string) {
  if (typeof window === 'undefined') return
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function rowsToXLSXBlob(rows: any[]): Blob {
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Applications')
  const array = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  return new Blob([array], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

function rowsToPDFBlob(rows: any[], title: string): Blob {
  const doc = new jsPDF({ orientation: 'landscape' })
  const headers = rows.length > 0 ? Object.keys(rows[0]) : []
  const body = rows.map(r => headers.map(h => String(r[h] ?? '')))

  doc.setFontSize(14)
  doc.text(title, 14, 14)

  // @ts-ignore - autotable extends jsPDF via side-effects
  autoTable(doc, {
    startY: 20,
    head: [headers],
    body,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [248, 249, 250], textColor: [0, 0, 0] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    didDrawPage: (data: any) => {
      const pageSize = doc.internal.pageSize
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight()
      doc.setFontSize(10)
      doc.text(
        `Generated on ${new Date().toLocaleString()}`,
        14,
        pageHeight - 10
      )
    },
  })

  // jsPDF v2+ can output Blob directly
  // @ts-ignore
  const blob: Blob = doc.output('blob')
  return blob
}

export function exportApplications(apps: JobApplication[], cfg?: Partial<ExportConfig & { format: ExportFormat }>) {
  const config: ExportConfig = {
    filename: cfg?.filename || `applications-${new Date().toISOString().slice(0,10)}`,
    fields: cfg?.fields || DEFAULT_EXPORT_FIELDS,
    includeNotes: cfg?.includeNotes || false,
    includeTimeline: cfg?.includeTimeline || false,
    dateRange: cfg?.dateRange,
    format: cfg?.format || 'csv',
  }

  const rows = applicationsToRows(apps, config.fields)

  switch (config.format) {
    case 'csv': {
      const csv = rowsToCSV(rows)
      downloadBlob(csv, `${config.filename}.csv`, 'text/csv;charset=utf-8;')
      break
    }
    case 'json': {
      const content = JSON.stringify(rows, null, 2)
      downloadBlob(content, `${config.filename}.json`, 'application/json')
      break
    }
    case 'xlsx': {
      const blob = rowsToXLSXBlob(rows)
      downloadBlobBinary(blob, `${config.filename}.xlsx`)
      break
    }
    case 'pdf': {
      const blob = rowsToPDFBlob(rows, 'Applications Report')
      downloadBlobBinary(blob, `${config.filename}.pdf`)
      break
    }
  }
}

export interface ReportStats {
  total: number
  byStatus: Record<ApplicationStatus, number>
  byPriority: Record<ApplicationPriority, number>
}

export function computeStats(apps: JobApplication[]): ReportStats {
  const total = apps.length
  const byStatus = {} as Record<ApplicationStatus, number>
  Object.values(ApplicationStatus).forEach(s => {
    byStatus[s] = apps.filter(a => a.status === s).length
  })
  const byPriority = {} as Record<ApplicationPriority, number>
  Object.values(ApplicationPriority).forEach(p => {
    byPriority[p] = apps.filter(a => a.priority === p).length
  })
  return { total, byStatus, byPriority }
}
