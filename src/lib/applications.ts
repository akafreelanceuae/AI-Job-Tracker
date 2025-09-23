export enum ApplicationStatus {
  DRAFT = 'draft',
  APPLIED = 'applied',
  UNDER_REVIEW = 'under_review',
  PHONE_SCREENING = 'phone_screening',
  TECHNICAL_INTERVIEW = 'technical_interview',
  ON_SITE_INTERVIEW = 'on_site_interview',
  FINAL_INTERVIEW = 'final_interview',
  OFFER_RECEIVED = 'offer_received',
  OFFER_ACCEPTED = 'offer_accepted',
  OFFER_DECLINED = 'offer_declined',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
  GHOST = 'ghost'
}

export enum ApplicationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum InterviewType {
  PHONE_SCREENING = 'phone_screening',
  VIDEO_CALL = 'video_call',
  TECHNICAL = 'technical',
  BEHAVIORAL = 'behavioral',
  PANEL = 'panel',
  ON_SITE = 'on_site',
  FINAL = 'final',
  HR_ROUND = 'hr_round'
}

export enum DocumentType {
  CV = 'cv',
  COVER_LETTER = 'cover_letter',
  PORTFOLIO = 'portfolio',
  CERTIFICATE = 'certificate',
  TRANSCRIPT = 'transcript',
  REFERENCE = 'reference',
  CONTRACT = 'contract',
  OFFER_LETTER = 'offer_letter',
  OTHER = 'other'
}

export enum TimelineEventType {
  APPLICATION_SUBMITTED = 'application_submitted',
  STATUS_CHANGED = 'status_changed',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  INTERVIEW_COMPLETED = 'interview_completed',
  FOLLOW_UP_SENT = 'follow_up_sent',
  FEEDBACK_RECEIVED = 'feedback_received',
  DOCUMENT_UPLOADED = 'document_uploaded',
  NOTE_ADDED = 'note_added',
  OFFER_RECEIVED = 'offer_received',
  OFFER_NEGOTIATED = 'offer_negotiated',
  DECISION_MADE = 'decision_made'
}

export interface JobApplication {
  id: string;
  jobId?: string; // Reference to job listing if exists
  companyName: string;
  position: string;
  jobDescription?: string;
  status: ApplicationStatus;
  priority: ApplicationPriority;
  appliedDate: Date;
  lastUpdated: Date;
  
  // Contact Information
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  recruiterName?: string;
  recruiterEmail?: string;
  
  // Job Details
  location: string;
  workType: 'remote' | 'hybrid' | 'on_site';
  employmentType: 'full_time' | 'part_time' | 'contract' | 'internship';
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  
  // Application Details
  applicationUrl?: string;
  referral?: string;
  coverLetterUsed?: string;
  cvUsed?: string;
  applicationMethod: 'company_website' | 'linkedin' | 'job_board' | 'referral' | 'recruiter' | 'other';
  
  // Timeline and Progress
  expectedResponseDate?: Date;
  followUpDates: Date[];
  interviews: Interview[];
  documents: ApplicationDocument[];
  timeline: TimelineEvent[];
  notes: Note[];
  
  // Offer Details
  offer?: {
    salary: number;
    currency: string;
    benefits: string[];
    startDate?: Date;
    responseDeadline?: Date;
    negotiationNotes?: string;
  };
  
  // Metadata
  tags: string[];
  rating: number; // 1-5 stars
  feedback?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Interview {
  id: string;
  applicationId: string;
  type: InterviewType;
  round: number;
  scheduledDate: Date;
  duration: number; // in minutes
  location?: string;
  meetingUrl?: string;
  isVirtual: boolean;
  
  // Interview Details
  interviewers: {
    name: string;
    title: string;
    email?: string;
  }[];
  
  // Preparation
  preparationNotes?: string;
  questionsToAsk: string[];
  techTopics: string[];
  researchNotes?: string;
  
  // Post-Interview
  completed: boolean;
  completedDate?: Date;
  feedback?: string;
  rating?: number; // 1-5 stars
  followUpRequired: boolean;
  followUpDate?: Date;
  interviewNotes?: string;
  
  // Status
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  remindersSent: Date[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplicationDocument {
  id: string;
  applicationId: string;
  name: string;
  type: DocumentType;
  fileName: string;
  fileSize: number;
  fileUrl?: string; // For actual file storage
  uploadDate: Date;
  
  // Document Details
  version: number;
  description?: string;
  tags: string[];
  
  // Usage Tracking
  usedInApplications: string[]; // Application IDs where this document was used
  lastUsed?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface TimelineEvent {
  id: string;
  applicationId: string;
  type: TimelineEventType;
  title: string;
  description: string;
  date: Date;
  
  // Related Data
  relatedId?: string; // Interview ID, Document ID, etc.
  metadata?: {
    oldStatus?: ApplicationStatus;
    newStatus?: ApplicationStatus;
    interviewType?: InterviewType;
    documentName?: string;
    [key: string]: any;
  };
  
  createdAt: Date;
}

export interface Note {
  id: string;
  applicationId: string;
  title: string;
  content: string;
  type: 'general' | 'interview' | 'follow_up' | 'research' | 'reminder';
  isImportant: boolean;
  tags: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

// Application Statistics Interface
export interface ApplicationStats {
  total: number;
  byStatus: Record<ApplicationStatus, number>;
  byPriority: Record<ApplicationPriority, number>;
  averageResponseTime: number; // in days
  responseRate: number; // percentage
  interviewRate: number; // percentage
  offerRate: number; // percentage
  
  // Recent Activity
  appliedThisWeek: number;
  appliedThisMonth: number;
  interviewsThisWeek: number;
  offersReceived: number;
  
  // Trends
  weeklyTrend: number[];
  statusTrend: { date: Date; [key in ApplicationStatus]?: number }[];
}

// Application Filters Interface
export interface ApplicationFilters {
  status?: ApplicationStatus[];
  priority?: ApplicationPriority[];
  companies?: string[];
  locations?: string[];
  workTypes?: ('remote' | 'hybrid' | 'on_site')[];
  employmentTypes?: ('full_time' | 'part_time' | 'contract' | 'internship')[];
  applicationMethods?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  salaryRange?: {
    min: number;
    max: number;
  };
  hasInterview?: boolean;
  hasOffer?: boolean;
  tags?: string[];
  rating?: number[];
}

// Application Manager Class
export class ApplicationManager {
  private applications: JobApplication[] = [];
  private interviews: Interview[] = [];
  private documents: ApplicationDocument[] = [];
  private subscribers: Set<(applications: JobApplication[]) => void> = new Set();
  private isClient: boolean = false;

  constructor() {
    // Only load in client-side
    if (typeof window !== 'undefined') {
      this.isClient = true;
      this.loadApplications();
    }
  }

  // Load applications from localStorage
  private loadApplications(): void {
    if (!this.isClient) return;
    
    try {
      const stored = localStorage.getItem('job-tracker-applications');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.applications = parsed.map((app: any) => ({
          ...app,
          appliedDate: new Date(app.appliedDate),
          lastUpdated: new Date(app.lastUpdated),
          expectedResponseDate: app.expectedResponseDate ? new Date(app.expectedResponseDate) : undefined,
          followUpDates: app.followUpDates.map((date: string) => new Date(date)),
          timeline: app.timeline.map((event: any) => ({
            ...event,
            date: new Date(event.date),
            createdAt: new Date(event.createdAt)
          })),
          interviews: app.interviews.map((interview: any) => ({
            ...interview,
            scheduledDate: new Date(interview.scheduledDate),
            completedDate: interview.completedDate ? new Date(interview.completedDate) : undefined,
            followUpDate: interview.followUpDate ? new Date(interview.followUpDate) : undefined,
            createdAt: new Date(interview.createdAt),
            updatedAt: new Date(interview.updatedAt)
          })),
          documents: app.documents.map((doc: any) => ({
            ...doc,
            uploadDate: new Date(doc.uploadDate),
            lastUsed: doc.lastUsed ? new Date(doc.lastUsed) : undefined,
            createdAt: new Date(doc.createdAt),
            updatedAt: new Date(doc.updatedAt)
          })),
          notes: app.notes.map((note: any) => ({
            ...note,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt)
          })),
          createdAt: new Date(app.createdAt),
          updatedAt: new Date(app.updatedAt)
        }));
      }
    } catch (error) {
      console.error('Failed to load applications:', error);
      this.applications = [];
    }
  }

  // Save applications to localStorage
  private saveApplications(): void {
    if (!this.isClient) return;
    
    try {
      localStorage.setItem('job-tracker-applications', JSON.stringify(this.applications));
      this.notifySubscribers();
    } catch (error) {
      console.error('Failed to save applications:', error);
    }
  }

  // Subscribe to application updates
  subscribe(callback: (applications: JobApplication[]) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  // Notify all subscribers
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.getApplications()));
  }

  // Create a new application
  createApplication(application: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt' | 'lastUpdated' | 'timeline' | 'interviews' | 'documents' | 'notes'>): string {
    const id = `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    const newApplication: JobApplication = {
      ...application,
      id,
      lastUpdated: now,
      timeline: [{
        id: `timeline-${Date.now()}`,
        applicationId: id,
        type: TimelineEventType.APPLICATION_SUBMITTED,
        title: 'Application Submitted',
        description: `Applied for ${application.position} at ${application.companyName}`,
        date: application.appliedDate,
        createdAt: now
      }],
      interviews: [],
      documents: [],
      notes: [],
      createdAt: now,
      updatedAt: now
    };

    this.applications.unshift(newApplication);
    this.saveApplications();
    return id;
  }

  // Get all applications
  getApplications(): JobApplication[] {
    return this.applications;
  }

  // Get application by ID
  getApplication(id: string): JobApplication | undefined {
    return this.applications.find(app => app.id === id);
  }

  // Update application
  updateApplication(id: string, updates: Partial<JobApplication>): void {
    const application = this.applications.find(app => app.id === id);
    if (application) {
      const oldStatus = application.status;
      Object.assign(application, updates, { 
        updatedAt: new Date(),
        lastUpdated: new Date() 
      });

      // Add timeline event for status changes
      if (updates.status && updates.status !== oldStatus) {
        this.addTimelineEvent(id, {
          type: TimelineEventType.STATUS_CHANGED,
          title: 'Status Updated',
          description: `Status changed from ${oldStatus} to ${updates.status}`,
          metadata: { oldStatus, newStatus: updates.status }
        });
      }

      this.saveApplications();
    }
  }

  // Delete application
  deleteApplication(id: string): void {
    this.applications = this.applications.filter(app => app.id !== id);
    this.saveApplications();
  }

  // Add timeline event
  addTimelineEvent(applicationId: string, event: Omit<TimelineEvent, 'id' | 'applicationId' | 'date' | 'createdAt'>): void {
    const application = this.getApplication(applicationId);
    if (application) {
      const timelineEvent: TimelineEvent = {
        ...event,
        id: `timeline-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        applicationId,
        date: new Date(),
        createdAt: new Date()
      };

      application.timeline.unshift(timelineEvent);
      application.updatedAt = new Date();
      application.lastUpdated = new Date();
      this.saveApplications();
    }
  }

  // Add note
  addNote(applicationId: string, note: Omit<Note, 'id' | 'applicationId' | 'createdAt' | 'updatedAt'>): string {
    const application = this.getApplication(applicationId);
    if (application) {
      const id = `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();
      
      const newNote: Note = {
        ...note,
        id,
        applicationId,
        createdAt: now,
        updatedAt: now
      };

      application.notes.unshift(newNote);
      application.updatedAt = now;
      application.lastUpdated = now;
      
      this.addTimelineEvent(applicationId, {
        type: TimelineEventType.NOTE_ADDED,
        title: 'Note Added',
        description: note.title || 'New note added'
      });

      this.saveApplications();
      return id;
    }
    throw new Error('Application not found');
  }

  // Get applications with filters
  getFilteredApplications(filters: ApplicationFilters): JobApplication[] {
    return this.applications.filter(app => {
      if (filters.status && !filters.status.includes(app.status)) return false;
      if (filters.priority && !filters.priority.includes(app.priority)) return false;
      if (filters.companies && !filters.companies.includes(app.companyName)) return false;
      if (filters.locations && !filters.locations.includes(app.location)) return false;
      if (filters.workTypes && !filters.workTypes.includes(app.workType)) return false;
      if (filters.employmentTypes && !filters.employmentTypes.includes(app.employmentType)) return false;
      if (filters.hasInterview !== undefined && (app.interviews.length > 0) !== filters.hasInterview) return false;
      if (filters.hasOffer !== undefined && (app.offer !== undefined) !== filters.hasOffer) return false;
      if (filters.rating && !filters.rating.includes(app.rating)) return false;
      
      if (filters.dateRange) {
        if (app.appliedDate < filters.dateRange.start || app.appliedDate > filters.dateRange.end) return false;
      }
      
      if (filters.salaryRange && app.salaryRange) {
        if (app.salaryRange.min > filters.salaryRange.max || app.salaryRange.max < filters.salaryRange.min) return false;
      }
      
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => app.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }

      return true;
    });
  }

  // Get application statistics
  getApplicationStats(): ApplicationStats {
    const total = this.applications.length;
    
    // Count by status
    const byStatus = {} as Record<ApplicationStatus, number>;
    Object.values(ApplicationStatus).forEach(status => {
      byStatus[status] = this.applications.filter(app => app.status === status).length;
    });

    // Count by priority
    const byPriority = {} as Record<ApplicationPriority, number>;
    Object.values(ApplicationPriority).forEach(priority => {
      byPriority[priority] = this.applications.filter(app => app.priority === priority).length;
    });

    // Calculate rates
    const responded = this.applications.filter(app => 
      ![ApplicationStatus.DRAFT, ApplicationStatus.APPLIED, ApplicationStatus.GHOST].includes(app.status)
    ).length;
    const responseRate = total > 0 ? (responded / total) * 100 : 0;

    const interviewed = this.applications.filter(app => app.interviews.length > 0).length;
    const interviewRate = total > 0 ? (interviewed / total) * 100 : 0;

    const offers = this.applications.filter(app => app.offer !== undefined).length;
    const offerRate = total > 0 ? (offers / total) * 100 : 0;

    // Recent activity
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const appliedThisWeek = this.applications.filter(app => app.appliedDate >= weekAgo).length;
    const appliedThisMonth = this.applications.filter(app => app.appliedDate >= monthAgo).length;

    const interviewsThisWeek = this.applications.reduce((count, app) => {
      return count + app.interviews.filter(interview => interview.scheduledDate >= weekAgo).length;
    }, 0);

    // Average response time (for applications that got a response)
    const respondedApps = this.applications.filter(app => 
      ![ApplicationStatus.DRAFT, ApplicationStatus.APPLIED, ApplicationStatus.GHOST].includes(app.status)
    );
    
    const averageResponseTime = respondedApps.length > 0 
      ? respondedApps.reduce((sum, app) => {
          const responseEvent = app.timeline.find(event => 
            event.type === TimelineEventType.STATUS_CHANGED && 
            event.metadata?.newStatus !== ApplicationStatus.APPLIED
          );
          if (responseEvent) {
            const daysDiff = Math.floor((responseEvent.date.getTime() - app.appliedDate.getTime()) / (1000 * 60 * 60 * 24));
            return sum + daysDiff;
          }
          return sum;
        }, 0) / respondedApps.length 
      : 0;

    return {
      total,
      byStatus,
      byPriority,
      averageResponseTime,
      responseRate,
      interviewRate,
      offerRate,
      appliedThisWeek,
      appliedThisMonth,
      interviewsThisWeek,
      offersReceived: offers,
      weeklyTrend: [], // Could be calculated based on historical data
      statusTrend: [] // Could be calculated based on timeline events
    };
  }

  // Clear all applications
  clearAll(): void {
    this.applications = [];
    this.saveApplications();
  }
}

// Global application manager instance
export const applicationManager = new ApplicationManager();