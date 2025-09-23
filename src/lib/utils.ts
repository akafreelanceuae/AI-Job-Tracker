import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// UAE-specific utility functions
export function formatAEDSalary(amount: number | null | undefined): string {
  if (!amount) return "Not specified"
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatSalaryRange(min: number | null | undefined, max: number | null | undefined): string {
  if (!min && !max) return "Salary not specified"
  if (min && max) return `${formatAEDSalary(min)} - ${formatAEDSalary(max)}`
  if (min) return `From ${formatAEDSalary(min)}`
  if (max) return `Up to ${formatAEDSalary(max)}`
  return "Salary not specified"
}

export function getEmirateDisplayName(emirate: string): string {
  const emirateNames: Record<string, string> = {
    'ABU_DHABI': 'Abu Dhabi',
    'DUBAI': 'Dubai',
    'SHARJAH': 'Sharjah',
    'AJMAN': 'Ajman',
    'UMM_AL_QUWAIN': 'Umm Al Quwain',
    'RAS_AL_KHAIMAH': 'Ras Al Khaimah',
    'FUJAIRAH': 'Fujairah',
  }
  return emirateNames[emirate] || emirate
}

export function getVisaStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'REQUIRED': 'text-uae-red',
    'NOT_REQUIRED': 'text-uae-green',
    'SPONSORED': 'text-accent',
    'UNKNOWN': 'text-muted-foreground',
  }
  return colors[status] || 'text-muted-foreground'
}

export function getJobStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'SAVED': 'text-muted-foreground',
    'APPLIED': 'text-blue-600',
    'INTERVIEW_SCHEDULED': 'text-amber-600',
    'INTERVIEWED': 'text-orange-600',
    'OFFER_RECEIVED': 'text-uae-green',
    'REJECTED': 'text-uae-red',
    'WITHDRAWN': 'text-gray-500',
  }
  return colors[status] || 'text-muted-foreground'
}