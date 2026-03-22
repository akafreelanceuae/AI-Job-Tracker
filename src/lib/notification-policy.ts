import { NotificationType } from '@/lib/notifications'

export type Channel = 'in_app' | 'email' | 'push' | 'webhook'

export interface NotificationPolicy {
  allowedChannels: Record<Channel, boolean>
  defaultFrequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
  summaryThreshold: number
  allowUrgentDuringQuietHours: boolean
}

const DEFAULT_POLICY: NotificationPolicy = {
  allowedChannels: { in_app: true, email: false, push: false, webhook: false },
  defaultFrequency: 'immediate',
  summaryThreshold: 5,
  allowUrgentDuringQuietHours: false,
}

const POLICY_MAP: Record<NotificationType, NotificationPolicy> = {
  [NotificationType.DEADLINE]: {
    allowedChannels: { in_app: true, email: false, push: false, webhook: false },
    defaultFrequency: 'immediate',
    summaryThreshold: 3,
    allowUrgentDuringQuietHours: true,
  },
  [NotificationType.INTERVIEW]: {
    allowedChannels: { in_app: true, email: false, push: false, webhook: false },
    defaultFrequency: 'immediate',
    summaryThreshold: 3,
    allowUrgentDuringQuietHours: true,
  },
  [NotificationType.JOB_MATCH]: {
    allowedChannels: { in_app: true, email: false, push: false, webhook: false },
    defaultFrequency: 'hourly',
    summaryThreshold: 5,
    allowUrgentDuringQuietHours: false,
  },
  [NotificationType.APPLICATION_UPDATE]: {
    allowedChannels: { in_app: true, email: false, push: false, webhook: false },
    defaultFrequency: 'immediate',
    summaryThreshold: 5,
    allowUrgentDuringQuietHours: false,
  },
  [NotificationType.SALARY_ALERT]: {
    allowedChannels: { in_app: true, email: false, push: false, webhook: false },
    defaultFrequency: 'daily',
    summaryThreshold: 3,
    allowUrgentDuringQuietHours: false,
  },
  [NotificationType.COMPANY_NEWS]: {
    allowedChannels: { in_app: true, email: false, push: false, webhook: false },
    defaultFrequency: 'daily',
    summaryThreshold: 5,
    allowUrgentDuringQuietHours: false,
  },
  [NotificationType.SKILL_RECOMMENDATION]: {
    allowedChannels: { in_app: true, email: false, push: false, webhook: false },
    defaultFrequency: 'weekly',
    summaryThreshold: 5,
    allowUrgentDuringQuietHours: false,
  },
  [NotificationType.NETWORK_UPDATE]: {
    allowedChannels: { in_app: true, email: false, push: false, webhook: false },
    defaultFrequency: 'daily',
    summaryThreshold: 5,
    allowUrgentDuringQuietHours: false,
  },
  [NotificationType.SYSTEM]: {
    allowedChannels: { in_app: true, email: false, push: false, webhook: false },
    defaultFrequency: 'immediate',
    summaryThreshold: 10,
    allowUrgentDuringQuietHours: false,
  },
}

export function getPolicy(type: NotificationType): NotificationPolicy {
  return POLICY_MAP[type] || DEFAULT_POLICY
}

export function isChannelAllowed(type: NotificationType, channel: Channel): boolean {
  const policy = getPolicy(type)
  return !!policy.allowedChannels[channel]
}
