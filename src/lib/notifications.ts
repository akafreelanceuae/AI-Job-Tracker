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

export interface NotificationPreferences {
  enabled: boolean;
  types: {
    [key in NotificationType]: {
      enabled: boolean;
      email: boolean;
      push: boolean;
      inApp: boolean;
      frequency?: 'immediate' | 'hourly' | 'daily' | 'weekly';
    };
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
  };
  workdaysOnly: boolean;
}

export class NotificationManager {
  private notifications: Notification[] = [];
  private subscribers: Set<(notifications: Notification[]) => void> = new Set();
  private isClient: boolean = false;

  constructor() {
    // Only load in client-side
    if (typeof window !== 'undefined') {
      this.isClient = true;
      this.loadNotifications();
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

  // Create a new notification
  createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'status'>): string {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: new Date(),
      status: NotificationStatus.UNREAD,
    };

    this.notifications.unshift(newNotification);
    this.saveNotifications();
    return id;
  }

  // Get all notifications
  getNotifications(): Notification[] {
    return this.notifications.filter(n => !this.isExpired(n));
  }

  // Get unread notifications count
  getUnreadCount(): number {
    return this.notifications.filter(n => 
      n.status === NotificationStatus.UNREAD && !this.isExpired(n)
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
    [NotificationType.DEADLINE]: { enabled: true, email: true, push: true, inApp: true, frequency: 'immediate' },
    [NotificationType.INTERVIEW]: { enabled: true, email: true, push: true, inApp: true, frequency: 'immediate' },
    [NotificationType.JOB_MATCH]: { enabled: true, email: false, push: true, inApp: true, frequency: 'hourly' },
    [NotificationType.APPLICATION_UPDATE]: { enabled: true, email: true, push: true, inApp: true, frequency: 'immediate' },
    [NotificationType.SALARY_ALERT]: { enabled: true, email: false, push: true, inApp: true, frequency: 'daily' },
    [NotificationType.COMPANY_NEWS]: { enabled: true, email: false, push: false, inApp: true, frequency: 'daily' },
    [NotificationType.SKILL_RECOMMENDATION]: { enabled: true, email: false, push: false, inApp: true, frequency: 'weekly' },
    [NotificationType.NETWORK_UPDATE]: { enabled: true, email: false, push: false, inApp: true, frequency: 'daily' },
    [NotificationType.SYSTEM]: { enabled: true, email: false, push: true, inApp: true, frequency: 'immediate' }
  },
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '08:00'
  },
  workdaysOnly: false
};

// Global notification manager instance
export const notificationManager = new NotificationManager();