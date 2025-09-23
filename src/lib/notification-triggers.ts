import { 
  notificationManager, 
  NotificationFactory, 
  NotificationType,
  NotificationPriority,
  type Notification 
} from './notifications';

export interface TriggerCondition {
  id: string;
  name: string;
  type: 'time' | 'event' | 'threshold' | 'schedule';
  enabled: boolean;
  condition: any; // Specific condition data
  notificationTemplate: Omit<Notification, 'id' | 'createdAt' | 'status'>;
}

export class NotificationTriggerSystem {
  private triggers: TriggerCondition[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private isClient: boolean = false;

  constructor() {
    // Only load in client-side
    if (typeof window !== 'undefined') {
      this.isClient = true;
      this.loadTriggers();
      this.startScheduler();
    }
  }

  // Load triggers from localStorage
  private loadTriggers(): void {
    if (!this.isClient) return;
    
    try {
      const stored = localStorage.getItem('job-tracker-triggers');
      if (stored) {
        this.triggers = JSON.parse(stored);
      } else {
        // Set up default triggers
        this.setupDefaultTriggers();
      }
    } catch (error) {
      console.error('Failed to load triggers:', error);
      this.setupDefaultTriggers();
    }
  }

  // Save triggers to localStorage
  private saveTriggers(): void {
    if (!this.isClient) return;
    
    try {
      localStorage.setItem('job-tracker-triggers', JSON.stringify(this.triggers));
    } catch (error) {
      console.error('Failed to save triggers:', error);
    }
  }

  // Start the notification scheduler (checks every minute)
  private startScheduler(): void {
    if (this.intervalId) clearInterval(this.intervalId);
    
    this.intervalId = setInterval(() => {
      this.checkTriggers();
    }, 60000); // Check every minute

    // Also check immediately
    this.checkTriggers();
  }

  // Stop the scheduler
  stopScheduler(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Check all triggers and fire notifications if conditions are met
  private checkTriggers(): void {
    const now = new Date();
    
    this.triggers
      .filter(trigger => trigger.enabled)
      .forEach(trigger => {
        try {
          if (this.shouldTrigger(trigger, now)) {
            this.fireTrigger(trigger);
          }
        } catch (error) {
          console.error(`Error checking trigger ${trigger.id}:`, error);
        }
      });
  }

  // Check if a trigger condition is met
  private shouldTrigger(trigger: TriggerCondition, now: Date): boolean {
    switch (trigger.type) {
      case 'time':
        return this.checkTimeTrigger(trigger, now);
      case 'schedule':
        return this.checkScheduleTrigger(trigger, now);
      case 'event':
        return this.checkEventTrigger(trigger);
      case 'threshold':
        return this.checkThresholdTrigger(trigger);
      default:
        return false;
    }
  }

  // Check time-based triggers (specific times, deadlines, etc.)
  private checkTimeTrigger(trigger: TriggerCondition, now: Date): boolean {
    const { targetTime, lastTriggered } = trigger.condition;
    const target = new Date(targetTime);
    
    // Check if we've passed the target time and haven't triggered recently
    if (now >= target && (!lastTriggered || now.getTime() - lastTriggered > 3600000)) {
      trigger.condition.lastTriggered = now.getTime();
      this.saveTriggers();
      return true;
    }
    
    return false;
  }

  // Check schedule-based triggers (daily, weekly, etc.)
  private checkScheduleTrigger(trigger: TriggerCondition, now: Date): boolean {
    const { schedule, lastTriggered } = trigger.condition;
    
    if (!lastTriggered) {
      trigger.condition.lastTriggered = now.getTime();
      this.saveTriggers();
      return true;
    }

    const lastTrigger = new Date(lastTriggered);
    const timeDiff = now.getTime() - lastTrigger.getTime();

    switch (schedule) {
      case 'hourly':
        if (timeDiff >= 3600000) { // 1 hour
          trigger.condition.lastTriggered = now.getTime();
          this.saveTriggers();
          return true;
        }
        break;
      case 'daily':
        if (timeDiff >= 86400000 && now.getHours() >= 9) { // 1 day and after 9 AM
          trigger.condition.lastTriggered = now.getTime();
          this.saveTriggers();
          return true;
        }
        break;
      case 'weekly':
        if (timeDiff >= 604800000 && now.getDay() === 1) { // 1 week and Monday
          trigger.condition.lastTriggered = now.getTime();
          this.saveTriggers();
          return true;
        }
        break;
    }

    return false;
  }

  // Check event-based triggers
  private checkEventTrigger(trigger: TriggerCondition): boolean {
    // This would be called by external events
    // For now, return false as events are triggered externally
    return false;
  }

  // Check threshold-based triggers
  private checkThresholdTrigger(trigger: TriggerCondition): boolean {
    const { metric, operator, value, lastTriggered } = trigger.condition;
    
    // Avoid triggering too frequently
    if (lastTriggered && Date.now() - lastTriggered < 3600000) {
      return false;
    }

    let currentValue = 0;
    
    // Get current metric value
    switch (metric) {
      case 'unread_count':
        currentValue = notificationManager.getUnreadCount();
        break;
      case 'job_matches':
        currentValue = notificationManager.getNotificationsByType(NotificationType.JOB_MATCH).length;
        break;
      // Add more metrics as needed
      default:
        return false;
    }

    // Check threshold
    let shouldTrigger = false;
    switch (operator) {
      case '>':
        shouldTrigger = currentValue > value;
        break;
      case '>=':
        shouldTrigger = currentValue >= value;
        break;
      case '<':
        shouldTrigger = currentValue < value;
        break;
      case '<=':
        shouldTrigger = currentValue <= value;
        break;
      case '==':
        shouldTrigger = currentValue === value;
        break;
    }

    if (shouldTrigger) {
      trigger.condition.lastTriggered = Date.now();
      this.saveTriggers();
    }

    return shouldTrigger;
  }

  // Fire a trigger and create notification
  private fireTrigger(trigger: TriggerCondition): void {
    notificationManager.createNotification(trigger.notificationTemplate);
  }

  // Add a new trigger
  addTrigger(trigger: Omit<TriggerCondition, 'id'>): string {
    const id = `trigger-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newTrigger: TriggerCondition = { ...trigger, id };
    this.triggers.push(newTrigger);
    this.saveTriggers();
    return id;
  }

  // Remove a trigger
  removeTrigger(id: string): void {
    this.triggers = this.triggers.filter(t => t.id !== id);
    this.saveTriggers();
  }

  // Enable/disable a trigger
  toggleTrigger(id: string, enabled: boolean): void {
    const trigger = this.triggers.find(t => t.id === id);
    if (trigger) {
      trigger.enabled = enabled;
      this.saveTriggers();
    }
  }

  // Get all triggers
  getTriggers(): TriggerCondition[] {
    return this.triggers;
  }

  // Setup default triggers
  private setupDefaultTriggers(): void {
    // Daily job match check
    this.triggers.push({
      id: 'daily-job-check',
      name: 'Daily Job Match Check',
      type: 'schedule',
      enabled: true,
      condition: {
        schedule: 'daily',
        lastTriggered: null
      },
      notificationTemplate: {
        type: NotificationType.SYSTEM,
        priority: NotificationPriority.LOW,
        title: 'Daily Job Check Complete',
        message: 'We\'ve found new job opportunities that match your profile!',
        actionUrl: '/recommendations',
        actionLabel: 'View Matches'
      }
    });

    // Weekly skill recommendation
    this.triggers.push({
      id: 'weekly-skill-check',
      name: 'Weekly Skill Analysis',
      type: 'schedule',
      enabled: true,
      condition: {
        schedule: 'weekly',
        lastTriggered: null
      },
      notificationTemplate: {
        type: NotificationType.SKILL_RECOMMENDATION,
        priority: NotificationPriority.MEDIUM,
        title: 'Weekly Skill Analysis',
        message: 'Based on job market trends, here are skills you should consider learning.',
        actionUrl: '/skills',
        actionLabel: 'View Recommendations'
      }
    });

    this.saveTriggers();
  }

  // Trigger external events
  triggerEvent(eventType: string, data: any): void {
    const eventTriggers = this.triggers.filter(
      t => t.type === 'event' && t.condition.eventType === eventType && t.enabled
    );

    eventTriggers.forEach(trigger => {
      // Customize notification based on event data
      const notification = { ...trigger.notificationTemplate };
      if (data) {
        notification.metadata = { ...notification.metadata, ...data };
      }
      
      notificationManager.createNotification(notification);
    });
  }
}

// Mock data generators for testing
export const NotificationMockData = {
  // Generate sample notifications for testing
  generateSampleNotifications: (): void => {
    // Recent job matches
    notificationManager.createNotification(
      NotificationFactory.createJobMatchAlert(
        'Senior React Developer',
        'Emirates NBD',
        92,
        'job-001',
        25000,
        'Dubai'
      )
    );

    notificationManager.createNotification(
      NotificationFactory.createJobMatchAlert(
        'Full Stack Developer',
        'Noon.com',
        87,
        'job-002',
        22000,
        'Dubai'
      )
    );

    // Interview reminders
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    notificationManager.createNotification(
      NotificationFactory.createInterviewReminder(
        'Careem',
        'Senior Software Engineer',
        tomorrow,
        'interview-001'
      )
    );

    // Application updates
    notificationManager.createNotification(
      NotificationFactory.createApplicationUpdate(
        'Dubai Islamic Bank',
        'Technology Lead',
        'Interview Scheduled',
        'app-001'
      )
    );

    // Deadline alerts
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 3);

    notificationManager.createNotification(
      NotificationFactory.createDeadlineAlert(
        'Application Deadline: ADNOC',
        deadline,
        'app-002',
        'Data Scientist'
      )
    );

    // Salary alerts
    notificationManager.createNotification(
      NotificationFactory.createSalaryAlert(
        'DevOps Engineer',
        'Microsoft UAE',
        35000,
        25000,
        'job-003'
      )
    );

    // Skill recommendations
    notificationManager.createNotification(
      NotificationFactory.createSkillRecommendation(
        'TypeScript',
        'TypeScript is in high demand for React developers in UAE. 85% of job listings in your field require this skill.',
        85
      )
    );

    // System notifications
    notificationManager.createNotification({
      type: NotificationType.SYSTEM,
      priority: NotificationPriority.MEDIUM,
      title: 'Profile Optimization',
      message: 'Your profile is 78% complete. Add more skills to get better job matches!',
      actionUrl: '/profile',
      actionLabel: 'Update Profile'
    });

    // Company news
    notificationManager.createNotification({
      type: NotificationType.COMPANY_NEWS,
      priority: NotificationPriority.LOW,
      title: 'Emirates NBD Hiring',
      message: 'Emirates NBD announced plans to hire 200+ tech professionals this quarter.',
      actionUrl: '/companies/emirates-nbd',
      actionLabel: 'View Jobs',
      metadata: { companyName: 'Emirates NBD' }
    });
  },

  // Generate scheduled notifications for testing
  generateScheduledNotifications: (): void => {
    const now = new Date();
    
    // Tomorrow morning reminder
    const tomorrowMorning = new Date(now);
    tomorrowMorning.setDate(tomorrowMorning.getDate() + 1);
    tomorrowMorning.setHours(9, 0, 0, 0);

    notificationManager.createNotification({
      type: NotificationType.SYSTEM,
      priority: NotificationPriority.LOW,
      title: 'Good Morning!',
      message: 'Check out today\'s recommended jobs and application updates.',
      scheduledFor: tomorrowMorning,
      actionUrl: '/dashboard',
      actionLabel: 'View Dashboard'
    });

    // This afternoon reminder
    const thisAfternoon = new Date(now);
    thisAfternoon.setHours(15, 0, 0, 0);

    if (thisAfternoon > now) {
      notificationManager.createNotification({
        type: NotificationType.DEADLINE,
        priority: NotificationPriority.MEDIUM,
        title: 'Follow Up Reminder',
        message: 'Don\'t forget to follow up on your application to Etisalat.',
        scheduledFor: thisAfternoon,
        actionUrl: '/applications',
        actionLabel: 'View Applications'
      });
    }
  }
};

// Global notification trigger system instance
export const notificationTriggerSystem = new NotificationTriggerSystem();