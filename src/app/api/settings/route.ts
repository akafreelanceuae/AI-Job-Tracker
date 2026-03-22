import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { defaultNotificationPreferences, NotificationType, type NotificationPreferences } from '@/lib/notifications'
import { config } from '@/lib/config'
import { broadcast } from '@/lib/sse-bus'

function getUserIdFromRequest(): string {
  // TODO: integrate with auth when available
  return 'demo-user'
}

function mergePreferences(dbMaster: any | null, dbTypes: any[]): NotificationPreferences {
  const prefs: NotificationPreferences = JSON.parse(JSON.stringify(defaultNotificationPreferences))

  if (dbMaster) {
    prefs.enabled = !!dbMaster.enabled
    prefs.workdaysOnly = !!dbMaster.workdaysOnly
    prefs.quietHours = {
      enabled: !!dbMaster.quietHoursEnabled,
      start: dbMaster.quietHoursStart || prefs.quietHours.start,
      end: dbMaster.quietHoursEnd || prefs.quietHours.end,
    }
    prefs.flushTimes = {
      dailyTime: dbMaster.dailyTime || prefs.flushTimes?.dailyTime,
      weeklyDay: typeof dbMaster.weeklyDay === 'number' ? dbMaster.weeklyDay : prefs.flushTimes?.weeklyDay,
      weeklyTime: dbMaster.weeklyTime || prefs.flushTimes?.weeklyTime,
    }
  }

  const byType = new Map<string, any>()
  dbTypes.forEach((t) => byType.set(String(t.type), t))

  Object.values(NotificationType).forEach((t) => {
    const cur = byType.get(String(t))
    if (cur) {
      prefs.types[t] = {
        enabled: !!cur.enabled,
        email: !!cur.email,
        push: !!cur.push,
        inApp: !!cur.inApp,
        frequency: (cur.frequency as any) || prefs.types[t].frequency,
        summaryThreshold: typeof cur.summaryThreshold === 'number' ? cur.summaryThreshold : prefs.types[t].summaryThreshold,
        allowUrgentDuringQuietHours: !!cur.allowUrgentDuringQuietHours,
      }
    }
  })

  return prefs
}

export async function GET() {
  // When server path is disabled, serve defaults to avoid errors
  if (!config.NOTIFICATIONS_SSE_ENABLED) {
    return NextResponse.json(defaultNotificationPreferences)
  }

  try {
    const userId = getUserIdFromRequest()
    const [master, types] = await Promise.all([
      prisma.notificationSettings.findUnique({ where: { userId } }),
      prisma.notificationTypeSettings.findMany({ where: { userId } }),
    ])
    const prefs = mergePreferences(master, types)
    return NextResponse.json(prefs)
  } catch (e) {
    // If prisma fails (e.g., no DATABASE_URL), return defaults to keep UI working
    return NextResponse.json(defaultNotificationPreferences)
  }
}

export async function PUT(req: Request) {
  // When server path is disabled, reject to force client to use localStorage
  if (!config.NOTIFICATIONS_SSE_ENABLED) {
    return NextResponse.json({ error: 'Server settings disabled' }, { status: 400 })
  }

  try {
    const userId = getUserIdFromRequest()
    const body = (await req.json()) as NotificationPreferences

    // Upsert master
    await prisma.notificationSettings.upsert({
      where: { userId },
      update: {
        enabled: body.enabled,
        quietHoursEnabled: !!body.quietHours?.enabled,
        quietHoursStart: body.quietHours?.start || null,
        quietHoursEnd: body.quietHours?.end || null,
        workdaysOnly: !!body.workdaysOnly,
        dailyTime: body.flushTimes?.dailyTime || null,
        weeklyDay: typeof body.flushTimes?.weeklyDay === 'number' ? body.flushTimes?.weeklyDay! : null,
        weeklyTime: body.flushTimes?.weeklyTime || null,
      },
      create: {
        userId,
        enabled: body.enabled,
        quietHoursEnabled: !!body.quietHours?.enabled,
        quietHoursStart: body.quietHours?.start || null,
        quietHoursEnd: body.quietHours?.end || null,
        workdaysOnly: !!body.workdaysOnly,
        dailyTime: body.flushTimes?.dailyTime || null,
        weeklyDay: typeof body.flushTimes?.weeklyDay === 'number' ? body.flushTimes?.weeklyDay! : null,
        weeklyTime: body.flushTimes?.weeklyTime || null,
      },
    })

    // Upsert per-type
    const entries = Object.entries(body.types || {}) as [NotificationType, any][]
    for (const [type, t] of entries) {
      await prisma.notificationTypeSettings.upsert({
        where: { userId_type: { userId, type } },
        update: {
          enabled: !!t.enabled,
          email: !!t.email,
          push: !!t.push,
          inApp: !!t.inApp,
          frequency: String(t.frequency || 'immediate'),
          summaryThreshold: typeof t.summaryThreshold === 'number' ? t.summaryThreshold : 5,
          allowUrgentDuringQuietHours: !!t.allowUrgentDuringQuietHours,
        },
        create: {
          userId,
          type: String(type),
          enabled: !!t.enabled,
          email: !!t.email,
          push: !!t.push,
          inApp: !!t.inApp,
          frequency: String(t.frequency || 'immediate'),
          summaryThreshold: typeof t.summaryThreshold === 'number' ? t.summaryThreshold : 5,
          allowUrgentDuringQuietHours: !!t.allowUrgentDuringQuietHours,
        },
      })
    }

    // Broadcast SSE to listeners
    try {
      broadcast('settings', { userId, updatedAt: new Date().toISOString() })
    } catch {}

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}