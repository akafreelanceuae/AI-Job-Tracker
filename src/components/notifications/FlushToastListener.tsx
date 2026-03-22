"use client";

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { config } from '@/lib/config';
import { useRouter } from 'next/navigation';
import { ToastAction } from '@/components/ui/toast';
import { notificationManager, NotificationType, NotificationPriority } from '@/lib/notifications';

export default function FlushToastListener() {
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!config.NOTIFICATIONS_TOASTS_ENABLED) return;

    // Client-batching path (baseline)
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ when: string; freq: 'hourly'|'daily'|'weekly'; summaries: { type: string; count: number }[] }>;
      const { freq, summaries } = ce.detail || { freq: 'hourly', summaries: [] } as any;
      if (!summaries || summaries.length === 0) return;

      const parts = summaries
        .map(s => `${s.count} ${labelForType(s.type)}`)
        .join(', ');

      const href = pickRoute(summaries);

      toast({
        title: flushTitle(freq),
        description: parts,
        action: (
          <ToastAction altText="View" onClick={() => router.push(href)}>
            View
          </ToastAction>
        ),
      });
    };

    window.addEventListener('jt:notification-flush', handler as EventListener);

    // Server-batching SSE path
    let es: EventSource | null = null
    if (config.SERVER_NOTIFICATIONS_BATCHING_ENABLED && config.NOTIFICATIONS_SSE_ENABLED) {
      try {
        es = new EventSource('/api/settings/stream')
        es.addEventListener('notifications_flush', ((evt: MessageEvent) => {
          try {
            const data = JSON.parse((evt as any).data || '{}') as { when: string; freq: 'hourly'|'daily'|'weekly'; summaries: { type: string; count: number }[] }
            const { freq, summaries } = data || { freq: 'hourly', summaries: [] } as any
            if (!summaries || summaries.length === 0) return
            const parts = summaries.map(s => `${s.count} ${labelForType(s.type)}`).join(', ')
            const href = pickRoute(summaries)

            // Show toast
            toast({
              title: flushTitle(freq),
              description: parts,
              action: (
                <ToastAction altText="View" onClick={() => router.push(href)}>
                  View
                </ToastAction>
              ),
            })

            // Also add a SYSTEM summary notification to the inbox
            try {
              notificationManager.createNotification({
                type: NotificationType.SYSTEM,
                priority: NotificationPriority.MEDIUM,
                title: flushTitle(freq),
                message: parts,
                actionUrl: href,
                actionLabel: 'View details',
                metadata: { summaries }
              })
            } catch {}
          } catch {}
        }) as any)
      } catch {}
    }

    return () => {
      window.removeEventListener('jt:notification-flush', handler as EventListener);
      try { es?.close() } catch {}
    }
  }, [toast, router]);

  return null;
}

function flushTitle(freq: 'hourly'|'daily'|'weekly') {
  switch (freq) {
    case 'daily': return "Daily notification summary";
    case 'weekly': return "Weekly notification summary";
    default: return "Notification summary";
  }
}

function labelForType(type: string) {
  switch (type) {
    case 'job_match': return 'job matches';
    case 'deadline': return 'deadlines';
    case 'interview': return 'interview reminders';
    case 'application_update': return 'application updates';
    case 'salary_alert': return 'salary alerts';
    case 'company_news': return 'company news';
    case 'skill_recommendation': return 'skill tips';
    case 'network_update': return 'network updates';
    default: return 'items';
  }
}

function pickRoute(summaries: { type: string; count: number }[]) {
  if (!summaries || summaries.length === 0) return '/notifications';
  if (summaries.length > 1) return '/notifications';
  const t = summaries[0].type;
  switch (t) {
    case 'job_match':
    case 'salary_alert':
    case 'skill_recommendation':
      return '/dashboard/recommendations';
    case 'application_update':
    case 'deadline':
      return '/applications';
    case 'interview':
    case 'company_news':
    case 'network_update':
    default:
      return '/notifications';
  }
}
