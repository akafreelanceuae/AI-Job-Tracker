import { prisma } from '@/lib/prisma'
import { kv as vercelKV } from '@vercel/kv'
import type { BatchFrequency, EnqueueItem, FlushResultSummary } from './types'

function kvAvailable(): boolean {
  try {
    // Heuristic: Vercel KV env present
    return !!(process.env.KV_REST_API_URL || process.env.KV_URL)
  } catch {
    return false
  }
}

const KV_PREFIX = 'jt:notifications'

export const storage = {
  async enqueue(userId: string, freq: BatchFrequency, item: EnqueueItem): Promise<void> {
    if (kvAvailable()) {
      const key = `${KV_PREFIX}:q:${userId}:${freq}`
      await vercelKV.lpush(key, JSON.stringify(item))
      // Optionally cap list size
      await vercelKV.ltrim(key, 0, 999)
      return
    }

    // Prisma fallback: one queue per (userId,freq)
    const queue = await prisma.notificationBatchQueue.upsert({
      where: { userId_freq: { userId, freq } as any },
      update: { updatedAt: new Date() },
      create: { userId, freq },
    } as any)
    await prisma.notificationBatchItem.create({
      data: {
        queueId: queue.id,
        type: String(item.type),
        priority: String(item.priority),
        payload: item as any,
        scheduledFor: item.scheduledFor ? new Date(item.scheduledFor) : null,
      },
    })
  },

  async drain(userId: string, freq: BatchFrequency): Promise<EnqueueItem[]> {
    if (kvAvailable()) {
      const key = `${KV_PREFIX}:q:${userId}:${freq}`
      const len = await vercelKV.llen(key)
      if (!len || len <= 0) return []
      const items = await vercelKV.lrange<string>(key, 0, -1)
      await vercelKV.del(key)
      return (items || []).map((s) => JSON.parse(s))
    }

    const queue = await prisma.notificationBatchQueue.findFirst({ where: { userId, freq } })
    if (!queue) return []
    const items = await prisma.notificationBatchItem.findMany({ where: { queueId: queue.id }, orderBy: { createdAt: 'asc' } })
    await prisma.notificationBatchItem.deleteMany({ where: { queueId: queue.id } })
    return items.map((i) => i.payload as any as EnqueueItem)
  },

  async hasItems(userId: string, freq: BatchFrequency): Promise<boolean> {
    if (kvAvailable()) {
      const key = `${KV_PREFIX}:q:${userId}:${freq}`
      const len = await vercelKV.llen(key)
      return (len || 0) > 0
    }
    const queue = await prisma.notificationBatchQueue.findFirst({ where: { userId, freq } })
    if (!queue) return false
    const count = await prisma.notificationBatchItem.count({ where: { queueId: queue.id } })
    return count > 0
  },
}