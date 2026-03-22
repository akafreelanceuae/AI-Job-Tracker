import { NotificationType, NotificationPriority } from '@/lib/notifications'

export type BatchFrequency = 'hourly' | 'daily' | 'weekly'

export interface EnqueueItem {
  type: NotificationType
  priority: NotificationPriority
  payload: any
  createdAt: string // ISO
  scheduledFor?: string // ISO
}

export interface FlushResultSummary {
  type: NotificationType
  count: number
}

export interface RouteDecision {
  delivered?: 'in_app'
  enqueued?: boolean
  freq?: BatchFrequency | 'immediate'
}