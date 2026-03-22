"use client"

import { config } from '@/lib/config'
import type { NotificationPreferences } from '@/lib/notifications'
import { notificationManager } from '@/lib/notifications'

export async function getSettings(): Promise<NotificationPreferences> {
  if (!config.NOTIFICATIONS_SSE_ENABLED) {
    return notificationManager.getPreferencesSnapshot()
  }
  try {
    const res = await fetch('/api/settings', { cache: 'no-store' })
    if (!res.ok) throw new Error('failed')
    return (await res.json()) as NotificationPreferences
  } catch {
    // Fallback to client snapshot
    return notificationManager.getPreferencesSnapshot()
  }
}

export async function updateSettings(prefs: NotificationPreferences): Promise<void> {
  if (!config.NOTIFICATIONS_SSE_ENABLED) {
    notificationManager.setPreferences(prefs)
    return
  }
  try {
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prefs),
    })
  } catch {
    // Fallback to client path on failure
    notificationManager.setPreferences(prefs)
  }
}

export function subscribeToSettings(onUpdate: () => void): () => void {
  if (!config.NOTIFICATIONS_SSE_ENABLED) {
    const handler = () => onUpdate()
    if (typeof window !== 'undefined') {
      window.addEventListener('jt:notification-preferences-updated', handler as EventListener)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('jt:notification-preferences-updated', handler as EventListener)
      }
    }
  }

  // SSE subscription
  const es = new EventSource('/api/settings/stream')
  const onMsg = (e: MessageEvent) => {
    if (e.type === 'message' || (e as any).event === 'settings') {
      onUpdate()
    }
  }
  es.addEventListener('settings', onMsg as any)
  es.onmessage = onMsg
  es.onerror = () => {
    // Let browser retry per retry directive
  }
  return () => {
    try { es.close() } catch {}
  }
}