import { ApplicationStatus, type JobApplication } from '@/lib/applications'

export interface AnalyticsOverview {
  totalApplications: number
  responseRate: number
  averageResponseTime: number
  successRate: number
  trends: {
    applications: number
    responses: number
    interviews: number
    offers: number
  }
}

export interface ApplicationsByMonthItem {
  month: string
  applications: number
  responses: number
  interviews: number
  offers: number
}

export interface StatusDistributionItem {
  status: string
  count: number
  percentage: number
  color: string
}

export interface TopCompanyItem {
  name: string
  applications: number
  responses: number
  successRate: number
}

export interface SalaryRangeItem {
  range: string
  count: number
  percentage: number
}

export interface SkillDemandItem {
  skill: string
  demand: number
  jobs: number
}

export interface AnalyticsData {
  overview: AnalyticsOverview
  applicationsByMonth: ApplicationsByMonthItem[]
  statusDistribution: StatusDistributionItem[]
  topCompanies: TopCompanyItem[]
  salaryRanges: SalaryRangeItem[]
  skills: SkillDemandItem[]
}

function monthKey(d: Date): string {
  const y = d.getFullYear()
  const m = d.getMonth()
  return `${y}-${String(m + 1).padStart(2, '0')}`
}

function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  const date = new Date(y, m - 1, 1)
  return date.toLocaleString(undefined, { month: 'short' })
}

function lastNMonths(n: number): string[] {
  const now = new Date()
  const keys: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    keys.push(monthKey(d))
  }
  return keys
}

function categorizeStatus(status: ApplicationStatus): 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Rejected' | 'Other' {
  switch (status) {
    case ApplicationStatus.APPLIED:
    case ApplicationStatus.DRAFT:
    case ApplicationStatus.GHOST:
      return 'Applied'
    case ApplicationStatus.UNDER_REVIEW:
    case ApplicationStatus.PHONE_SCREENING:
      return 'Screening'
    case ApplicationStatus.TECHNICAL_INTERVIEW:
    case ApplicationStatus.ON_SITE_INTERVIEW:
    case ApplicationStatus.FINAL_INTERVIEW:
      return 'Interview'
    case ApplicationStatus.OFFER_RECEIVED:
    case ApplicationStatus.OFFER_ACCEPTED:
      return 'Offer'
    case ApplicationStatus.REJECTED:
    case ApplicationStatus.OFFER_DECLINED:
    case ApplicationStatus.WITHDRAWN:
      return 'Rejected'
    default:
      return 'Other'
  }
}

const statusColors: Record<string, string> = {
  Applied: 'bg-blue-500',
  Screening: 'bg-yellow-500',
  Interview: 'bg-purple-500',
  Offer: 'bg-green-500',
  Rejected: 'bg-red-500',
  Other: 'bg-gray-500',
}

function inLastDays(date: Date, days: number): boolean {
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - days)
  start.setHours(0, 0, 0, 0)
  return date >= start && date <= now
}

function countResponses(apps: JobApplication[], windowDays?: number): number {
  return apps.reduce((acc, app) => {
    const hasResponse = app.timeline.some((e) => {
      if (e.type !== 'status_changed' && e.type !== 'STATUS_CHANGED') return false
      // treat any change away from APPLIED/DRAFT/GHOST as a response
      const ns = (e.metadata?.newStatus || '').toString()
      const lowered = ns.toLowerCase()
      const isResponse = !['applied', 'draft', 'ghost'].includes(lowered)
      if (!isResponse) return false
      if (windowDays) {
        return inLastDays(e.date, windowDays)
      }
      return true
    })
    return acc + (hasResponse ? 1 : 0)
  }, 0)
}

function countInterviews(apps: JobApplication[], windowDays?: number): number {
  return apps.reduce((acc, app) => {
    const cnt = app.interviews.filter((i) => (windowDays ? inLastDays(i.scheduledDate, windowDays) : true)).length
    return acc + cnt
  }, 0)
}

function countOffers(apps: JobApplication[], windowDays?: number): number {
  // Prefer timeline status changes to offers; fallback to current status
  let count = 0
  for (const app of apps) {
    const offerEvents = app.timeline.filter((e) => {
      if (e.type !== 'status_changed' && e.type !== 'STATUS_CHANGED') return false
      const ns = String(e.metadata?.newStatus || '').toLowerCase()
      const isOffer = ns.includes('offer')
      if (!isOffer) return false
      return windowDays ? inLastDays(e.date, windowDays) : true
    })
    if (windowDays) count += offerEvents.length
    else if (offerEvents.length > 0) count += 1
    else if (!windowDays && (app.status === ApplicationStatus.OFFER_RECEIVED || app.status === ApplicationStatus.OFFER_ACCEPTED)) count += 1
  }
  return count
}

function monthBuckets(apps: JobApplication[], months: string[]) {
  const buckets = new Map<string, { applications: number; responses: number; interviews: number; offers: number }>()
  months.forEach((m) => buckets.set(m, { applications: 0, responses: 0, interviews: 0, offers: 0 }))

  for (const app of apps) {
    // applications by appliedDate
    const mk = monthKey(app.appliedDate)
    if (buckets.has(mk)) buckets.get(mk)!.applications += 1

    // responses by timeline
    for (const e of app.timeline) {
      if (e.type === 'status_changed' || e.type === 'STATUS_CHANGED') {
        const ns = (e.metadata?.newStatus || '').toString().toLowerCase()
        if (!['applied', 'draft', 'ghost'].includes(ns)) {
          const ek = monthKey(e.date)
          if (buckets.has(ek)) buckets.get(ek)!.responses += 1
        }
      }
    }

    // interviews by scheduledDate
    for (const i of app.interviews) {
      const ik = monthKey(i.scheduledDate)
      if (buckets.has(ik)) buckets.get(ik)!.interviews += 1
    }

    // offers by timeline (prefer), else by current status
    const offerEvent = app.timeline.find((e) => {
      if (e.type !== 'status_changed' && e.type !== 'STATUS_CHANGED') return false
      const ns = String(e.metadata?.newStatus || '').toLowerCase()
      return ns.includes('offer')
    })
    if (offerEvent) {
      const ok = monthKey(offerEvent.date)
      if (buckets.has(ok)) buckets.get(ok)!.offers += 1
    } else if (app.status === ApplicationStatus.OFFER_RECEIVED || app.status === ApplicationStatus.OFFER_ACCEPTED) {
      const uk = monthKey(app.updatedAt)
      if (buckets.has(uk)) buckets.get(uk)!.offers += 1
    }
  }

  return months.map((m) => ({
    month: monthLabel(m),
    ...buckets.get(m)!,
  }))
}

function computeStatusDistribution(apps: JobApplication[]): StatusDistributionItem[] {
  const total = apps.length || 1
  const counts: Record<string, number> = {}
  for (const app of apps) {
    const cat = categorizeStatus(app.status)
    counts[cat] = (counts[cat] || 0) + 1
  }
  const order = ['Applied', 'Screening', 'Interview', 'Offer', 'Rejected']
  return order.map((k) => ({
    status: k,
    count: counts[k] || 0,
    percentage: Math.round(((counts[k] || 0) / total) * 100),
    color: statusColors[k] || statusColors.Other,
  }))
}

function computeTopCompanies(apps: JobApplication[]): TopCompanyItem[] {
  const byCompany = new Map<string, { apps: number; responses: number; offers: number }>()
  for (const app of apps) {
    const key = app.companyName || 'Unknown'
    const base = byCompany.get(key) || { apps: 0, responses: 0, offers: 0 }
    base.apps += 1
    // response if timeline has non-applied change
    const hasResp = app.timeline.some((e) => {
      if (e.type !== 'status_changed' && e.type !== 'STATUS_CHANGED') return false
      const ns = (e.metadata?.newStatus || '').toString().toLowerCase()
      return !['applied', 'draft', 'ghost'].includes(ns)
    })
    if (hasResp) base.responses += 1
    if (app.status === ApplicationStatus.OFFER_RECEIVED || app.status === ApplicationStatus.OFFER_ACCEPTED) base.offers += 1
    byCompany.set(key, base)
  }
  const list: TopCompanyItem[] = []
  byCompany.forEach((v, name) => {
    const successRate = v.apps > 0 ? Math.round((v.offers / v.apps) * 100) : 0
    list.push({ name, applications: v.apps, responses: v.responses, successRate })
  })
  return list.sort((a, b) => b.applications - a.applications).slice(0, 5)
}

function computeSalaryRanges(apps: JobApplication[]): SalaryRangeItem[] {
  const buckets = [
    { range: '10K-15K AED', min: 10000, max: 15000, count: 0 },
    { range: '15K-20K AED', min: 15000, max: 20000, count: 0 },
    { range: '20K-25K AED', min: 20000, max: 25000, count: 0 },
    { range: '25K-30K AED', min: 25000, max: 30000, count: 0 },
    { range: '30K+ AED', min: 30000, max: Infinity, count: 0 },
  ]
  for (const app of apps) {
    if (!app.salaryRange) continue
    const mid = (app.salaryRange.min + app.salaryRange.max) / 2
    const bucket = buckets.find((b) => mid >= b.min && mid < b.max)
    if (bucket) bucket.count += 1
  }
  const total = buckets.reduce((s, b) => s + b.count, 0) || 1
  return buckets.map((b) => ({ range: b.range, count: b.count, percentage: Math.round((b.count / total) * 100) }))
}

function computeSkillDemand(apps: JobApplication[]): SkillDemandItem[] {
  const tagCounts = new Map<string, number>()
  for (const app of apps) {
    for (const tag of app.tags || []) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
    }
  }
  const list = Array.from(tagCounts.entries()).map(([skill, jobs]) => ({
    skill,
    jobs,
    demand: Math.min(100, Math.round((jobs / (apps.length || 1)) * 100)),
  }))
  return list.sort((a, b) => b.jobs - a.jobs).slice(0, 8)
}

function percentDelta(current: number, previous: number): number {
  if (previous <= 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

export function computeAnalytics(apps: JobApplication[]): AnalyticsData {
  const total = apps.length

  // Current period: last 30 days; previous period: prior 30 days
  const currentApps = apps.filter((a) => inLastDays(a.appliedDate, 30)).length
  const prevApps = apps.filter((a) => inLastDays(a.appliedDate, 60) && !inLastDays(a.appliedDate, 30)).length
  const responses30 = countResponses(apps, 30)
  const responsesPrev = countResponses(apps, 60) - responses30
  const interviews30 = countInterviews(apps, 30)
  const interviewsPrev = countInterviews(apps, 60) - interviews30
  const offers30 = countOffers(apps, 30)
  const offersPrev = countOffers(apps, 60) - offers30

  // Overall rates
  const respondedOverall = countResponses(apps)
  const responseRate = total > 0 ? Math.round((respondedOverall / total) * 100) : 0

  // Approx average response time (days): derive from timeline status change vs appliedDate
  const deltas = apps.map((app) => {
    const event = app.timeline.find((e) => (e.type === 'status_changed' || e.type === 'STATUS_CHANGED') && String(e.metadata?.newStatus || '').toLowerCase() !== 'applied')
    if (!event) return null
    const diffDays = Math.max(0, Math.floor((event.date.getTime() - app.appliedDate.getTime()) / (1000 * 60 * 60 * 24)))
    return diffDays
  }).filter((x) => x !== null) as number[]
  const averageResponseTime = deltas.length > 0 ? Math.round(deltas.reduce((a, b) => a + b, 0) / deltas.length) : 0

  // Success rate: offers / total
  const offersOverall = countOffers(apps)
  const successRate = total > 0 ? Math.round((offersOverall / total) * 100) : 0

  // Months breakdown (last 6)
  const months = lastNMonths(6)
  const applicationsByMonth = monthBuckets(apps, months)

  // Status distribution and top companies
  const statusDistribution = computeStatusDistribution(apps)
  const topCompanies = computeTopCompanies(apps)

  // Salary ranges and skills (tags)
  const salaryRanges = computeSalaryRanges(apps)
  const skills = computeSkillDemand(apps)

  return {
    overview: {
      totalApplications: total,
      responseRate,
      averageResponseTime,
      successRate,
      trends: {
        applications: percentDelta(currentApps, prevApps),
        responses: percentDelta(responses30, responsesPrev),
        interviews: percentDelta(interviews30, interviewsPrev),
        offers: percentDelta(offers30, offersPrev),
      },
    },
    applicationsByMonth,
    statusDistribution,
    topCompanies,
    salaryRanges,
    skills,
  }
}
