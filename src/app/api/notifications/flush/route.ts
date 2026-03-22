import { NextResponse } from 'next/server'
import { config } from '@/lib/config'
import { storage } from '@/lib/batching/storage'
import type { BatchFrequency, EnqueueItem } from '@/lib/batching/types'
import { NotificationType } from '@/lib/notifications'
import { broadcast } from '@/lib/sse-bus'
import { selectAdapters } from '@/lib/delivery/adapters'
import { logger } from '@/lib/logger'

export async function POST(req: Request) {
  if (!config.SERVER_NOTIFICATIONS_BATCHING_ENABLED) {
    return NextResponse.json({ error: 'Server batching disabled' }, { status: 400 })
  }

  const { searchParams } = new URL(req.url)
  const freq = (searchParams.get('freq') || 'hourly') as BatchFrequency
  const userId = 'demo-user'

  try {
    const items = await storage.drain(userId, freq)
    if (!items || items.length === 0) {
      return NextResponse.json({ ok: true, processed: 0, summaries: [] })
    }

    // Summarize by type
    const byType = new Map<NotificationType, EnqueueItem[]>()
    for (const item of items) {
      const key = item.type as NotificationType
      const list = byType.get(key) || []
      list.push(item)
      byType.set(key, list)
    }
    const summaries = Array.from(byType.entries()).map(([type, arr]) => ({ type, count: arr.length }))

    // Optional: deliver via non-in-app adapters (log-only by default)
    try {
      for (const [type, arr] of byType.entries()) {
        const adapters = selectAdapters(type)
        for (const adapter of adapters) {
          if (adapter.channel === 'in_app') {
            // In-app summary is handled by SSE + client toast
            continue
          }
          // Build a synthetic notification for summary context
          const notification = {
            id: `summary-${Date.now()}`,
            type,
            priority: 'medium',
            status: 'unread',
            title: `Summary (${freq})`,
            message: `${arr.length} ${String(type)} notifications`,
            createdAt: new Date(),
          } as any
          await adapter.deliver(notification, { userId, type })
        }
      }
    } catch (e) {
      logger.warn('Non-in-app delivery adapters encountered an error (ignoring)', { error: String(e) })
    }

    // Broadcast SSE so UI can show toast
    try {
      broadcast('notifications_flush', { when: new Date().toISOString(), freq, summaries })
    } catch {}

    return NextResponse.json({ ok: true, processed: items.length, summaries })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to flush' }, { status: 500 })
  }
}