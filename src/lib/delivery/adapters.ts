import { config } from '@/lib/config'
import { getPolicy, type Channel } from '@/lib/notification-policy'
import { logger } from '@/lib/logger'
import type { Notification, NotificationType } from '@/lib/notifications'

export interface DeliveryContext {
  userId: string
  type: NotificationType
}

export interface NotificationDeliveryAdapter {
  channel: Channel
  deliver(notification: Notification, ctx: DeliveryContext): Promise<void>
}

class InAppAdapter implements NotificationDeliveryAdapter {
  channel: Channel = 'in_app'
  async deliver(notification: Notification, ctx: DeliveryContext): Promise<void> {
    // In-app delivery is already handled by client NotificationManager.
    // We only log here to trace routing decisions.
    logger.info('In-app delivery (client-managed)', {
      channel: this.channel,
      type: notification.type,
      userId: ctx.userId,
      title: notification.title,
    })
  }
}

class EmailAdapter implements NotificationDeliveryAdapter {
  channel: Channel = 'email'
  async deliver(notification: Notification, ctx: DeliveryContext): Promise<void> {
    if (!config.DELIVERY_EMAIL_ENABLED) {
      return logger.debug('Email delivery skipped (flag disabled)', { type: notification.type, userId: ctx.userId })
    }
    logger.info('Email delivery (stub)', { type: notification.type, userId: ctx.userId, title: notification.title })
  }
}

class PushAdapter implements NotificationDeliveryAdapter {
  channel: Channel = 'push'
  async deliver(notification: Notification, ctx: DeliveryContext): Promise<void> {
    if (!config.DELIVERY_PUSH_ENABLED) {
      return logger.debug('Push delivery skipped (flag disabled)', { type: notification.type, userId: ctx.userId })
    }
    logger.info('Push delivery (stub)', { type: notification.type, userId: ctx.userId, title: notification.title })
  }
}

class WebhookAdapter implements NotificationDeliveryAdapter {
  channel: Channel = 'webhook'
  async deliver(notification: Notification, ctx: DeliveryContext): Promise<void> {
    if (!config.DELIVERY_WEBHOOK_ENABLED) {
      return logger.debug('Webhook delivery skipped (flag disabled)', { type: notification.type, userId: ctx.userId })
    }
    logger.info('Webhook delivery (stub)', { type: notification.type, userId: ctx.userId, title: notification.title })
  }
}

export function selectAdapters(type: NotificationType): NotificationDeliveryAdapter[] {
  const policy = getPolicy(type)
  const adapters: NotificationDeliveryAdapter[] = []
  if (policy.allowedChannels.in_app) adapters.push(new InAppAdapter())
  if (policy.allowedChannels.email) adapters.push(new EmailAdapter())
  if (policy.allowedChannels.push) adapters.push(new PushAdapter())
  if (policy.allowedChannels.webhook) adapters.push(new WebhookAdapter())
  return adapters
}