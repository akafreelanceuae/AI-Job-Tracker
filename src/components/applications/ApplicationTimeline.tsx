'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  Phone,
  Video,
  Mail,
  Clock
} from 'lucide-react';
import { 
  JobApplication,
  TimelineEvent,
  TimelineEventType 
} from '@/lib/applications';
import { cn } from '@/lib/utils';

interface ApplicationTimelineProps {
  application: JobApplication;
  className?: string;
}

const eventIcons = {
  [TimelineEventType.APPLICATION_SUBMITTED]: CheckCircle,
  [TimelineEventType.STATUS_CHANGED]: AlertCircle,
  [TimelineEventType.INTERVIEW_SCHEDULED]: Calendar,
  [TimelineEventType.INTERVIEW_COMPLETED]: CheckCircle,
  [TimelineEventType.FOLLOW_UP_SENT]: Mail,
  [TimelineEventType.FEEDBACK_RECEIVED]: MessageSquare,
  [TimelineEventType.DOCUMENT_UPLOADED]: FileText,
  [TimelineEventType.NOTE_ADDED]: MessageSquare,
  [TimelineEventType.OFFER_RECEIVED]: CheckCircle,
  [TimelineEventType.OFFER_NEGOTIATED]: MessageSquare,
  [TimelineEventType.DECISION_MADE]: AlertCircle
};

const eventColors = {
  [TimelineEventType.APPLICATION_SUBMITTED]: 'text-blue-600 bg-blue-100',
  [TimelineEventType.STATUS_CHANGED]: 'text-yellow-600 bg-yellow-100',
  [TimelineEventType.INTERVIEW_SCHEDULED]: 'text-purple-600 bg-purple-100',
  [TimelineEventType.INTERVIEW_COMPLETED]: 'text-green-600 bg-green-100',
  [TimelineEventType.FOLLOW_UP_SENT]: 'text-indigo-600 bg-indigo-100',
  [TimelineEventType.FEEDBACK_RECEIVED]: 'text-cyan-600 bg-cyan-100',
  [TimelineEventType.DOCUMENT_UPLOADED]: 'text-gray-600 bg-gray-100',
  [TimelineEventType.NOTE_ADDED]: 'text-orange-600 bg-orange-100',
  [TimelineEventType.OFFER_RECEIVED]: 'text-green-600 bg-green-100',
  [TimelineEventType.OFFER_NEGOTIATED]: 'text-blue-600 bg-blue-100',
  [TimelineEventType.DECISION_MADE]: 'text-red-600 bg-red-100'
};

export function ApplicationTimeline({ application, className }: ApplicationTimelineProps) {
  const sortedTimeline = [...application.timeline].sort((a, b) => 
    b.date.getTime() - a.date.getTime()
  );

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
      
      {sortedTimeline.length > 0 ? (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200" />
          
          <div className="space-y-6">
            {sortedTimeline.map((event, index) => {
              const Icon = eventIcons[event.type] || MessageSquare;
              const colorClasses = eventColors[event.type] || 'text-gray-600 bg-gray-100';
              
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex items-start space-x-4"
                >
                  {/* Event Icon */}
                  <div className={cn(
                    "relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 border-white shadow-sm",
                    colorClasses
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  {/* Event Content */}
                  <div className="flex-1 min-w-0 pb-4">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">
                          {event.title}
                        </h4>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{event.date.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {event.description}
                      </p>
                      
                      {/* Event Metadata */}
                      {event.metadata && Object.keys(event.metadata).length > 0 && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <div className="text-xs text-gray-500 space-y-1">
                            {event.metadata.oldStatus && event.metadata.newStatus && (
                              <div>
                                Status: <span className="font-medium">{event.metadata.oldStatus}</span> → <span className="font-medium">{event.metadata.newStatus}</span>
                              </div>
                            )}
                            {event.metadata.interviewType && (
                              <div>
                                Type: <span className="font-medium">{event.metadata.interviewType}</span>
                              </div>
                            )}
                            {event.metadata.documentName && (
                              <div>
                                Document: <span className="font-medium">{event.metadata.documentName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No timeline events yet</p>
          <p className="text-sm">Events will appear as you update this application</p>
        </div>
      )}
    </div>
  );
}