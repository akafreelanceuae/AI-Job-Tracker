export enum NotificationType {
  DEADLINE = 'deadline',
  INTERVIEW = 'interview',
  JOB_MATCH = 'job_match',
  APPLICATION_UPDATE = 'application_update',
  SALARY_ALERT = 'salary_alert',
  COMPANY_NEWS = 'company_news',
  SKILL_RECOMMENDATION = 'skill_recommendation',
  NETWORK_UPDATE = 'network_update',
  SYSTEM = 'system'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  DISMISSED = 'dismissed',
  ARCHIVED = 'archived'
}

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  title: string;
  message: string;
  createdAt: Date;
  scheduledFor?: Date;
  expiresAt?: Date;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: {
    jobId?: string;
    applicationId?: string;
    interviewId?: string;
    companyName?: string;
    position?: string;
    salary?: number;
    location?: string;
    [key: string]: any;
  };
}

export interface FlushSummaryRecord {
  id: string;
  when: string; // ISO
  freq: 'hourly' | 'daily' | 'weekly';
  summaries: { type: NotificationType; count: number }[];
}

export interface NotificationPreferences {
  enabled: boolean;
  types: {
    [key in NotificationType]: {
      enabled: boolean;
      email: boolean;
      push: boolean;
      inApp: boolean;
      frequency?: 'immediate' | 'hourly' | 'daily' | 'weekly';
      summaryThreshold?: number; // Aggregate into a summary when >= threshold
      allowUrgentDuringQuietHours?: boolean; // Deliver HIGH/URGENT even during quiet hours
    };
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
  };
  workdaysOnly: boolean;
  flushTimes?: {
    dailyTime?: string; // HH:mm local time to flush daily queue (default 09:00)
    weeklyDay?: number; // 0-6 (Sun-Sat), default 1 (Monday)
    weeklyTime?: string; // HH:mm local time to flush weekly queue (default 09:00)
  };
}

export class NotificationManager {
  private notifications: Notification[] = [];
  private subscribers: Set<(notifications: Notification[]) => void> = new Set();
  private isClient: boolean = false;
  private pendingQueues: { hourly: Notification[]; daily: Notification[]; weekly: Notification[] } = {
    hourly: [],
    daily: [],
    weekly: []
  };
  private lastFlushTimes: { hourly: number; daily: number; weekly: number } = {
    hourly: 0,
    daily: 0,
    weekly: 0
  };
  private flushSummaries: FlushSummaryRecord[] = [];

  constructor() {
    // Only load in client-side
    if (typeof window !== 'undefined') {
      this.isClient = true;
      this.loadNotifications();
      this.loadPendingQueues();
      this.loadLastFlushTimes();
      this.loadFlushSummaries();
    }
  }

  // Load notifications from localStorage
  private loadNotifications(): void {
    if (!this.isClient) return;
    
    try {
      const stored = localStorage.getItem('job-tracker-notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.notifications = parsed.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt),
          scheduledFor: n.scheduledFor ? new Date(n.scheduledFor) : undefined,
          expiresAt: n.expiresAt ? new Date(n.expiresAt) : undefined,
        }));
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      this.notifications = [];
    }
  }

  // Save notifications to localStorage
  private saveNotifications(): void {
    if (!this.isClient) return;
    
    try {
      localStorage.setItem('job-tracker-notifications', JSON.stringify(this.notifications));
      this.notifySubscribers();
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }

  // Subscribe to notification updates
  subscribe(callback: (notifications: Notification[]) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  // Notify all subscribers
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.getNotifications()));
  }

  // Create a new notification (respects frequency preferences)
  createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'status'>): string {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: new Date(),
      status: NotificationStatus.UNREAD,
    };

    this.routeNotification(newNotification);
    return id;
  }

  // Get all notifications (respects user preferences)
  getNotifications(): Notification[] {
    const prefs = this.getPreferences();
    return this.notifications
      .filter(n => !this.isExpired(n))
      .filter(n => this.isNotificationAllowed(n, prefs));
  }

  // Get unread notifications count (respects user preferences)
  getUnreadCount(): number {
    const prefs = this.getPreferences();
    return this.notifications.filter(n => 
      n.status === NotificationStatus.UNREAD &&
      !this.isExpired(n) &&
      this.isNotificationAllowed(n, prefs)
    ).length;
  }

  // Get notifications by type
  getNotificationsByType(type: NotificationType): Notification[] {
    return this.notifications.filter(n => n.type === type && !this.isExpired(n));
  }

  // Get notifications by priority
  getNotificationsByPriority(priority: NotificationPriority): Notification[] {
    return this.notifications.filter(n => n.priority === priority && !this.isExpired(n));
  }

  // Mark notification as read
  markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification && notification.status === NotificationStatus.UNREAD) {
      notification.status = NotificationStatus.READ;
      this.saveNotifications();
    }
  }

  // Mark all notifications as read
  markAllAsRead(): void {
    this.notifications
      .filter(n => n.status === NotificationStatus.UNREAD)
      .forEach(n => n.status = NotificationStatus.READ);
    this.saveNotifications();
  }

  // Dismiss notification
  dismissNotification(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.status = NotificationStatus.DISMISSED;
      this.saveNotifications();
    }
  }

  // Archive notification
  archiveNotification(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.status = NotificationStatus.ARCHIVED;
      this.saveNotifications();
    }
  }

  // Delete notification permanently
  deleteNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveNotifications();
  }

  // Clear all notifications
  clearAll(): void {
    this.notifications = [];
    this.saveNotifications();
  }

  // Clear old notifications (older than 30 days)
  clearOldNotifications(): void {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    this.notifications = this.notifications.filter(n => 
      n.createdAt > thirtyDaysAgo || n.status === NotificationStatus.UNREAD
    );
    this.saveNotifications();
  }

  // Check if notification is expired
  private isExpired(notification: Notification): boolean {
    if (!notification.expiresAt) return false;
    return new Date() > notification.expiresAt;
  }

  // INTERNAL: route notification according to user frequency preference
  private routeNotification(n: Notification): void {
    const prefs = this.getPreferences();

    // Policy gating: ensure in-app channel is allowed for this type
    try {
      const { getPolicy } = require('@/lib/notification-policy') as any
      const policy = getPolicy?.(n.type)
      if (policy && policy.allowedChannels && policy.allowedChannels.in_app === false) {
        return
      }
    } catch (_) {
      // if policy unavailable, continue with preferences
    }

    // If not allowed at all given current prefs, skip delivery entirely
    // (e.g., master disabled or type disabled/inApp disabled or quiet hours/workdays)
    if (!this.isNotificationAllowed(n, prefs)) {
      return;
    }

    // If server batching is enabled, call server route to decide immediate vs enqueue
    if (this.isServerBatchingEnabled()) {
      try {
        // Fire and forget
        const payload = {
          userId: 'demo-user',
          notification: {
            type: n.type,
            priority: n.priority,
            title: n.title,
            message: n.message,
            createdAt: n.createdAt?.toISOString?.() || new Date().toISOString(),
            scheduledFor: n.scheduledFor?.toISOString?.(),
            metadata: n.metadata || {},
          }
        }
        ;(async () => {
          const res = await fetch('/api/notifications/route', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          const json = await res.json().catch(() => ({}))
          if (json && json.delivered === 'in_app') {
            // Mirror immediate delivery in local UI
            this.notifications.unshift(n)
            this.saveNotifications()
            this.notifySubscribers()
          }
          // if enqueued: do nothing; UI will get SSE toast upon flush
        })()
        return
      } catch (e) {
        // Fallback to immediate local delivery on errors
        this.notifications.unshift(n);
        this.saveNotifications();
        return this.notifySubscribers();
      }
    }

    // Respect per-type frequency
    const typePrefs = prefs.types?.[n.type];
    const freq = typePrefs?.frequency || 'immediate';

    if (freq === 'immediate' || !this.isBatchingEnabled()) {
      this.notifications.unshift(n);
      this.saveNotifications();
      return this.notifySubscribers();
    }

    // Queue for later flush
    if (freq === 'hourly') {
      this.pendingQueues.hourly.unshift(n);
    } else if (freq === 'daily') {
      this.pendingQueues.daily.unshift(n);
    } else if (freq === 'weekly') {
      this.pendingQueues.weekly.unshift(n);
    }
    this.savePendingQueues();
  }

  // Flush pending queues that are due based on time windows
  flushDue(now: Date = new Date()): void {
    // If server batching is enabled, client should not flush
    if (this.isServerBatchingEnabled()) return;
    if (!this.isBatchingEnabled()) return;

    const prefs = this.getPreferences();
    const dailyMinutes = this.parseTimeToMinutes(prefs.flushTimes?.dailyTime, '09:00');
    const weeklyMinutes = this.parseTimeToMinutes(prefs.flushTimes?.weeklyTime, '09:00');
    const weeklyDay = typeof prefs.flushTimes?.weeklyDay === 'number' ? prefs.flushTimes!.weeklyDay! : 1; // default Monday

    // Hourly: flush if > 60 minutes since last flush
    if (now.getTime() - this.lastFlushTimes.hourly >= 60 * 60 * 1000) {
      this.flushQueue('hourly');
      this.lastFlushTimes.hourly = now.getTime();
    }

    // Daily: flush after configured time, and only once per day
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const lastDaily = new Date(this.lastFlushTimes.daily || 0);
    const lastDailyDay = `${lastDaily.getFullYear()}-${lastDaily.getMonth()}-${lastDaily.getDate()}`;
    const nowDay = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    if (nowMinutes >= dailyMinutes && lastDailyDay !== nowDay) {
      this.flushQueue('daily');
      this.lastFlushTimes.daily = now.getTime();
    }

    // Weekly: flush on configured day/time, only once per week
    const isWeeklyDay = now.getDay() === weeklyDay;
    const nowMinutesWeekly = nowMinutes;
    if (isWeeklyDay && nowMinutesWeekly >= weeklyMinutes) {
      const lastWeekly = new Date(this.lastFlushTimes.weekly || 0);
      const lastWeek = this.getWeekNumber(lastWeekly);
      const currentWeek = this.getWeekNumber(now);
      if (lastWeek !== currentWeek) {
        this.flushQueue('weekly');
        this.lastFlushTimes.weekly = now.getTime();
      }
    }

    this.saveLastFlushTimes();
  }

  private getWeekNumber(date: Date): string {
    if (!date || isNaN(date.getTime())) return '0-0';
    const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = tmp.getUTCDay() || 7;
    tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((tmp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${tmp.getUTCFullYear()}-${week}`;
  }

  private flushQueue(freq: 'hourly' | 'daily' | 'weekly'): void {
    const queue = this.pendingQueues[freq];
    if (!queue || queue.length === 0) return;

    const prefs = this.getPreferences();

    // Group by type for potential summarization
    const byType = new Map<NotificationType, Notification[]>();
    queue.forEach(n => {
      const arr = byType.get(n.type as NotificationType) || [];
      arr.push(n);
      byType.set(n.type as NotificationType, arr);
    });

    // Build delivery list: either summaries or individuals
    const toDeliver: Notification[] = [];
    const summariesDelivered: { type: NotificationType; count: number }[] = [];

    byType.forEach((items, type) => {
      const typePrefs = prefs.types?.[type];
      const threshold = typePrefs?.summaryThreshold ?? 5;
      if (items.length >= threshold) {
        const summary = this.buildSummaryNotification(type, items);
        if (summary) {
          toDeliver.push(summary);
          summariesDelivered.push({ type, count: items.length });
        }
      } else {
        // deliver individual items newest first
        for (let i = items.length - 1; i >= 0; i--) {
          toDeliver.push(items[i]);
        }
      }
    });

    // Deliver summaries/individuals newest first by createdAt
    toDeliver.sort((a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0));
    toDeliver.forEach(n => this.notifications.unshift(n));

    // Clear queue and persist
    this.pendingQueues[freq] = [];
    this.savePendingQueues();
    this.saveNotifications();
    this.notifySubscribers();

    // Broadcast a flush event for UI listeners (for toasts/summaries)
    try {
      if (summariesDelivered.length > 0) {
        const summary: FlushSummaryRecord = {
          id: `flush-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          when: new Date().toISOString(),
          freq,
          summaries: summariesDelivered as any,
        };
        // Keep last 30
        this.flushSummaries.unshift(summary);
        this.flushSummaries = this.flushSummaries.slice(0, 30);
        this.saveFlushSummaries();

        if (typeof window !== 'undefined') {
          const event = new CustomEvent('jt:notification-flush', {
            detail: {
              when: summary.when,
              freq: summary.freq,
              summaries: summariesDelivered,
            }
          });
          window.dispatchEvent(event);
        }
      }
    } catch (_) {
      // ignore event dispatch errors
    }
  }

  private buildSummaryNotification(type: NotificationType, items: Notification[]): Notification | null {
    const now = new Date();
    const count = items.length;
    let title = '';
    let message = '';
    let actionUrl: string | undefined = undefined;

    switch (type) {
      case NotificationType.JOB_MATCH: {
        title = `${count} new job matches`;
        const top = items.slice(0, 3).map(n => `${n.metadata?.position || 'Job'} at ${n.metadata?.companyName || 'Company'}`);
        message = top.length > 0 ? `Top: ${top.join(', ')}` : 'You have new job matches.';
        actionUrl = '/dashboard/recommendations';
        break;
      }
      case NotificationType.DEADLINE: {
        title = `${count} upcoming deadlines`;
        message = 'Stay on track with your applications.';
        actionUrl = '/applications';
        break;
      }
      case NotificationType.INTERVIEW: {
        title = `${count} interview reminders`;
        const next = items.find(n => n.scheduledFor);
        message = next?.scheduledFor ? `Next: ${next.scheduledFor.toLocaleString()}` : 'You have upcoming interviews.';
        actionUrl = '/notifications';
        break;
      }
      case NotificationType.APPLICATION_UPDATE: {
        title = `${count} application updates`;
        message = 'Your applications have new updates.';
        actionUrl = '/applications';
        break;
      }
      default: {
        title = `${count} new notifications`;
        message = 'You have new updates.';
        actionUrl = '/notifications';
        break;
      }
    }

    return {
      id: `notification-summary-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type: NotificationType.SYSTEM,
      priority: count >= 10 ? NotificationPriority.HIGH : NotificationPriority.MEDIUM,
      status: NotificationStatus.UNREAD,
      title,
      message,
      createdAt: now,
      actionUrl,
      actionLabel: 'View details',
      metadata: { summaryOf: type, count }
    } as Notification;
  }

  // Load/save pending queues
  private loadPendingQueues(): void {
    if (!this.isClient) return;
    try {
      const stored = localStorage.getItem('job-tracker-pending-notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Re-hydrate dates
        ['hourly','daily','weekly'].forEach((k) => {
          const arr = (parsed?.[k] || []) as any[];
          this.pendingQueues[k as 'hourly'|'daily'|'weekly'] = arr.map((n: any) => ({
            ...n,
            createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
            scheduledFor: n.scheduledFor ? new Date(n.scheduledFor) : undefined,
            expiresAt: n.expiresAt ? new Date(n.expiresAt) : undefined,
          }));
        });
      }
    } catch (e) {
      console.error('Failed to load pending notifications:', e);
      this.pendingQueues = { hourly: [], daily: [], weekly: [] };
    }
  }

  private savePendingQueues(): void {
    if (!this.isClient) return;
    try {
      localStorage.setItem('job-tracker-pending-notifications', JSON.stringify(this.pendingQueues));
    } catch (e) {
      console.error('Failed to save pending notifications:', e);
    }
  }

  private parseTimeToMinutes(hhmm: string | undefined, fallback: string): number {
    const [h, m] = (hhmm || fallback).split(':').map((n) => parseInt(n, 10));
    const hour = isNaN(h) ? parseInt(fallback.split(':')[0], 10) : h;
    const min = isNaN(m) ? parseInt(fallback.split(':')[1], 10) : m;
    return hour * 60 + min;
  }

  private loadLastFlushTimes(): void {
    if (!this.isClient) return;
    try {
      const stored = localStorage.getItem('job-tracker-pending-last-flush');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.lastFlushTimes = {
          hourly: Number(parsed.hourly || 0),
          daily: Number(parsed.daily || 0),
          weekly: Number(parsed.weekly || 0),
        };
      }
    } catch (e) {
      console.error('Failed to load last flush times:', e);
      this.lastFlushTimes = { hourly: 0, daily: 0, weekly: 0 };
    }
  }

  private saveLastFlushTimes(): void {
    if (!this.isClient) return;
    try {
      localStorage.setItem('job-tracker-pending-last-flush', JSON.stringify(this.lastFlushTimes));
    } catch (e) {
      console.error('Failed to save last flush times:', e);
    }
  }

  // Flush summaries history
  private loadFlushSummaries(): void {
    if (!this.isClient) return;
    try {
      const stored = localStorage.getItem('job-tracker-flush-summaries');
      if (stored) {
        this.flushSummaries = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load flush summaries:', e);
      this.flushSummaries = [];
    }
  }

  private saveFlushSummaries(): void {
    if (!this.isClient) return;
    try {
      localStorage.setItem('job-tracker-flush-summaries', JSON.stringify(this.flushSummaries));
    } catch (e) {
      console.error('Failed to save flush summaries:', e);
    }
  }

  getFlushSummaries(limit: number = 10): FlushSummaryRecord[] {
    return this.flushSummaries
      .slice()
      .sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())
      .slice(0, limit);
  }

  // Load preferences from localStorage (falls back to defaults)
  private getPreferences(): NotificationPreferences {
    if (!this.isClient) return defaultNotificationPreferences;
    try {
      const stored = localStorage.getItem('job-tracker-notification-preferences');
      if (stored) {
        const raw = JSON.parse(stored) as Partial<NotificationPreferences>;
        const merged: NotificationPreferences = {
          ...defaultNotificationPreferences,
          ...raw,
          quietHours: {
            ...defaultNotificationPreferences.quietHours,
            ...(raw.quietHours || {} as any),
          },
          flushTimes: {
            ...defaultNotificationPreferences.flushTimes,
            ...(raw.flushTimes || {} as any),
          },
          types: { ...defaultNotificationPreferences.types } as any,
        } as NotificationPreferences;
        // Deep merge per-type settings
        Object.values(NotificationType).forEach((t) => {
          const key = t as NotificationType;
          const def = (defaultNotificationPreferences.types as any)[key] || {};
          const cur = (raw.types && (raw.types as any)[key]) || {};
          (merged.types as any)[key] = { ...def, ...cur };
        });
        return merged;
      }
    } catch (_) {
      // ignore and fall back to defaults
    }
    return defaultNotificationPreferences;
  }

  private isWithinQuietHours(prefs: NotificationPreferences, now: Date): boolean {
    if (!prefs.quietHours?.enabled) return false;

    const [startH, startM] = (prefs.quietHours.start || '22:00').split(':').map(Number);
    const [endH, endM] = (prefs.quietHours.end || '08:00').split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    if (startMinutes <= endMinutes) {
      // Same-day window e.g. 21:00-23:00
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    }
    // Overnight window e.g. 22:00-08:00
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }

  private isWorkday(now: Date): boolean {
    const day = now.getDay(); // 0=Sun, 6=Sat
    return day >= 1 && day <= 5;
  }

  // Public snapshot for UI consumers
  getPreferencesSnapshot(): NotificationPreferences {
    return this.getPreferences();
  }

  private isBatchingEnabled(): boolean {
    try {
      const { config } = require('@/lib/config')
      return !!config.NOTIFICATIONS_BATCHING_ENABLED
    } catch {
      return true
    }
  }

  private isServerBatchingEnabled(): boolean {
    try {
      const { config } = require('@/lib/config')
      return !!config.SERVER_NOTIFICATIONS_BATCHING_ENABLED
    } catch {
      return false
    }
  }

  // Update preferences, persist, and notify listeners (same-tab reactivity)
  setPreferences(prefs: NotificationPreferences): void {
    if (!this.isClient) return;
    try {
      const merged = { ...defaultNotificationPreferences, ...prefs } as NotificationPreferences;
      localStorage.setItem('job-tracker-notification-preferences', JSON.stringify(merged));
      // Notify components to re-read preferences and refresh visible notifications
      this.notifySubscribers();
      try {
        window.dispatchEvent(new CustomEvent('jt:notification-preferences-updated'));
      } catch (_) {
        // ignore
      }
    } catch (e) {
      console.error('Failed to save notification preferences:', e);
    }
  }

  private isNotificationAllowed(n: Notification, prefs: NotificationPreferences): boolean {
    if (!prefs.enabled) return false;

    // Policy gating for in-app channel: if policy forbids, disallow
    try {
      const { getPolicy } = require('@/lib/notification-policy') as any
      const policy = getPolicy?.(n.type)
      if (policy && policy.allowedChannels && policy.allowedChannels.in_app === false) {
        return false
      }
    } catch (_) {
      // ignore policy load errors
    }

    const typePrefs = prefs.types?.[n.type];
    // In-app delivery must be enabled to show in the UI
    if (!typePrefs?.inApp || typePrefs?.enabled === false) return false;

    const now = new Date();

    // Respect workdays-only
    if (prefs.workdaysOnly && !this.isWorkday(now)) return false;

    // Respect quiet hours, with per-type urgent override
    if (this.isWithinQuietHours(prefs, now)) {
      const isUrgent = n.priority === NotificationPriority.HIGH || n.priority === NotificationPriority.URGENT;
      const allowUrgent = !!typePrefs?.allowUrgentDuringQuietHours;
      if (!(isUrgent && allowUrgent)) return false;
    }

    return true;
  }

  // Get scheduled notifications that should be shown now
  getScheduledNotifications(): Notification[] {
    const now = new Date();
    return this.notifications.filter(n => 
      n.scheduledFor && 
      n.scheduledFor <= now && 
      n.status === NotificationStatus.UNREAD &&
      !this.isExpired(n)
    );
  }
}

// Notification factory functions for common scenarios
export const NotificationFactory = {
  createDeadlineAlert: (
    title: string,
    deadline: Date,
    applicationId?: string,
    jobTitle?: string
  ): Omit<Notification, 'id' | 'createdAt' | 'status'> => ({
    type: NotificationType.DEADLINE,
    priority: NotificationPriority.HIGH,
    title,
    message: `Deadline approaching: ${deadline.toLocaleDateString()}`,
    scheduledFor: new Date(deadline.getTime() - 24 * 60 * 60 * 1000), // 1 day before
    actionUrl: applicationId ? `/applications/${applicationId}` : undefined,
    actionLabel: 'View Application',
    metadata: { applicationId, position: jobTitle }
  }),

  createInterviewReminder: (
    companyName: string,
    position: string,
    interviewDate: Date,
    interviewId?: string
  ): Omit<Notification, 'id' | 'createdAt' | 'status'> => ({
    type: NotificationType.INTERVIEW,
    priority: NotificationPriority.URGENT,
    title: `Interview Reminder: ${companyName}`,
    message: `${position} interview scheduled for ${interviewDate.toLocaleString()}`,
    scheduledFor: new Date(interviewDate.getTime() - 2 * 60 * 60 * 1000), // 2 hours before
    actionUrl: interviewId ? `/interviews/${interviewId}` : undefined,
    actionLabel: 'View Details',
    metadata: { interviewId, companyName, position }
  }),

  createJobMatchAlert: (
    jobTitle: string,
    companyName: string,
    matchScore: number,
    jobId: string,
    salary?: number,
    location?: string
  ): Omit<Notification, 'id' | 'createdAt' | 'status'> => ({
    type: NotificationType.JOB_MATCH,
    priority: matchScore >= 85 ? NotificationPriority.HIGH : NotificationPriority.MEDIUM,
    title: `New Job Match (${matchScore}%)`,
    message: `${jobTitle} at ${companyName}${salary ? ` - AED ${salary.toLocaleString()}` : ''}`,
    actionUrl: `/jobs/${jobId}`,
    actionLabel: 'View Job',
    metadata: { jobId, companyName, position: jobTitle, salary, location }
  }),

  createApplicationUpdate: (
    companyName: string,
    position: string,
    status: string,
    applicationId: string
  ): Omit<Notification, 'id' | 'createdAt' | 'status'> => ({
    type: NotificationType.APPLICATION_UPDATE,
    priority: status.toLowerCase().includes('interview') ? NotificationPriority.HIGH : NotificationPriority.MEDIUM,
    title: `Application Update: ${companyName}`,
    message: `Your application for ${position} is now: ${status}`,
    actionUrl: `/applications/${applicationId}`,
    actionLabel: 'View Application',
    metadata: { applicationId, companyName, position }
  }),

  createSalaryAlert: (
    jobTitle: string,
    companyName: string,
    salary: number,
    targetSalary: number,
    jobId: string
  ): Omit<Notification, 'id' | 'createdAt' | 'status'> => ({
    type: NotificationType.SALARY_ALERT,
    priority: NotificationPriority.MEDIUM,
    title: 'Salary Alert!',
    message: `${jobTitle} at ${companyName} offers AED ${salary.toLocaleString()} (above your target of AED ${targetSalary.toLocaleString()})`,
    actionUrl: `/jobs/${jobId}`,
    actionLabel: 'View Job',
    metadata: { jobId, companyName, position: jobTitle, salary }
  }),

  createSkillRecommendation: (
    skill: string,
    reason: string,
    priority: number = 50
  ): Omit<Notification, 'id' | 'createdAt' | 'status'> => ({
    type: NotificationType.SKILL_RECOMMENDATION,
    priority: priority >= 80 ? NotificationPriority.HIGH : NotificationPriority.MEDIUM,
    title: `Skill Recommendation: ${skill}`,
    message: reason,
    actionUrl: '/skills',
    actionLabel: 'Manage Skills',
    metadata: { skill, priority }
  })
};

// Default notification preferences
export const defaultNotificationPreferences: NotificationPreferences = {
  enabled: true,
  types: {
    [NotificationType.DEADLINE]: { enabled: true, email: true, push: true, inApp: true, frequency: 'immediate', summaryThreshold: 3, allowUrgentDuringQuietHours: true },
    [NotificationType.INTERVIEW]: { enabled: true, email: true, push: true, inApp: true, frequency: 'immediate', summaryThreshold: 3, allowUrgentDuringQuietHours: true },
    [NotificationType.JOB_MATCH]: { enabled: true, email: false, push: true, inApp: true, frequency: 'hourly', summaryThreshold: 5, allowUrgentDuringQuietHours: false },
    [NotificationType.APPLICATION_UPDATE]: { enabled: true, email: true, push: true, inApp: true, frequency: 'immediate', summaryThreshold: 5, allowUrgentDuringQuietHours: false },
    [NotificationType.SALARY_ALERT]: { enabled: true, email: false, push: true, inApp: true, frequency: 'daily', summaryThreshold: 3, allowUrgentDuringQuietHours: false },
    [NotificationType.COMPANY_NEWS]: { enabled: true, email: false, push: false, inApp: true, frequency: 'daily', summaryThreshold: 5, allowUrgentDuringQuietHours: false },
    [NotificationType.SKILL_RECOMMENDATION]: { enabled: true, email: false, push: false, inApp: true, frequency: 'weekly', summaryThreshold: 5, allowUrgentDuringQuietHours: false },
    [NotificationType.NETWORK_UPDATE]: { enabled: true, email: false, push: false, inApp: true, frequency: 'daily', summaryThreshold: 5, allowUrgentDuringQuietHours: false },
    [NotificationType.SYSTEM]: { enabled: true, email: false, push: true, inApp: true, frequency: 'immediate', summaryThreshold: 10, allowUrgentDuringQuietHours: false }
  },
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '08:00'
  },
  workdaysOnly: false,
  flushTimes: {
    dailyTime: '09:00',
    weeklyDay: 1,
    weeklyTime: '09:00'
  }
};

// Global notification manager instance
export const notificationManager = new NotificationManager();