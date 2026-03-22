import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { config } from '@/lib/config'
import { NotificationType } from '@/lib/notifications'
import { getPolicy } from '@/lib/notification-policy'
import { storage } from '@/lib/batching/storage'
import type { BatchFrequency, EnqueueItem, RouteDecision } from '@/lib/batching/types'
import { selectAdapters } from '@/lib/delivery/adapters'
import { logger } from '@/lib/logger'

export async function POST(req: Request) {
  if (!config.SERVER_NOTIFICATIONS_BATCHING_ENABLED) {
    return NextResponse.json({ error: 'Server batching disabled' }, { status: 400 })
  }
  try {
    const body = await req.json()
    const userId: string = body.userId || 'demo-user'
    const n = body.notification as {
      type: NotificationType
      priority: string
      title: string
      message?: string
      createdAt?: string
      scheduledFor?: string
      metadata?: any
    }

    // Determine frequency from user overrides; fallback to policy default
    let freq: BatchFrequency | 'immediate' = 'immediate'
    try {
      const typeStr = String(n.type)
      const typeSettings = await prisma.notificationTypeSettings.findUnique({ where: { userId_type: { userId, type: typeStr } } })
      const pref = typeSettings?.frequency || getPolicy(n.type).defaultFrequency
      if (pref === 'hourly' || pref === 'daily' || pref === 'weekly') freq = pref
    } catch {
      const pref = getPolicy(n.type).defaultFrequency
      if (pref === 'hourly' || pref === 'daily' || pref === 'weekly') freq = pref
    }

    const decision: RouteDecision = {}

    if (freq === 'immediate') {
      decision.delivered = 'in_app'
      decision.freq = 'immediate'

      // Log adapter selection (do not deliver to avoid duplicating client-managed in-app)
      try {
        const adapters = selectAdapters(n.type)
        logger.info('Immediate routing (in_app)', { userId, type: n.type, channels: adapters.map(a => a.channel) })
      } catch {}

      return NextResponse.json(decision)
    }

    // Enqueue to storage
    const item: EnqueueItem = {
      type: n.type,
      priority: n.priority as any,
      payload: n,
      createdAt: n.createdAt || new Date().toISOString(),
      scheduledFor: n.scheduledFor,
    }
    await storage.enqueue(userId, freq, item)
    decision.enqueued = true
    decision.freq = freq
    return NextResponse.json(decision)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to route' }, { status: 500 })
  }
}