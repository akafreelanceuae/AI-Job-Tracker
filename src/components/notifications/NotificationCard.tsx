'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertCircle, 
  Calendar, 
  Briefcase, 
  TrendingUp, 
  DollarSign, 
  Building2, 
  User,
  Bell,
  Info,
  X,
  Check,
  Archive,
  ExternalLink,
  Clock
} from 'lucide-react';
import { 
  type Notification, 
  NotificationType, 
  NotificationPriority, 
  NotificationStatus 
} from '@/lib/notifications';
import { cn } from '@/lib/utils';

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead?: () => void;
  onDismiss?: () => void;
  onArchive?: () => void;
  onClick?: () => void;
  compact?: boolean;
  showActions?: boolean;
}

const notificationIcons = {
  [NotificationType.DEADLINE]: AlertCircle,
  [NotificationType.INTERVIEW]: Calendar,
  [NotificationType.JOB_MATCH]: Briefcase,
  [NotificationType.APPLICATION_UPDATE]: TrendingUp,
  [NotificationType.SALARY_ALERT]: DollarSign,
  [NotificationType.COMPANY_NEWS]: Building2,
  [NotificationType.SKILL_RECOMMENDATION]: User,
  [NotificationType.NETWORK_UPDATE]: User,
  [NotificationType.SYSTEM]: Info,
};

const priorityColors = {
  [NotificationPriority.LOW]: 'text-gray-500 bg-gray-100',
  [NotificationPriority.MEDIUM]: 'text-blue-600 bg-blue-100',
  [NotificationPriority.HIGH]: 'text-orange-600 bg-orange-100',
  [NotificationPriority.URGENT]: 'text-red-600 bg-red-100',
};

const typeColors = {
  [NotificationType.DEADLINE]: 'text-red-600 bg-red-50 border-red-200',
  [NotificationType.INTERVIEW]: 'text-purple-600 bg-purple-50 border-purple-200',
  [NotificationType.JOB_MATCH]: 'text-green-600 bg-green-50 border-green-200',
  [NotificationType.APPLICATION_UPDATE]: 'text-blue-600 bg-blue-50 border-blue-200',
  [NotificationType.SALARY_ALERT]: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  [NotificationType.COMPANY_NEWS]: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  [NotificationType.SKILL_RECOMMENDATION]: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  [NotificationType.NETWORK_UPDATE]: 'text-pink-600 bg-pink-50 border-pink-200',
  [NotificationType.SYSTEM]: 'text-gray-600 bg-gray-50 border-gray-200',
};

export function NotificationCard({ 
  notification, 
  onMarkAsRead, 
  onDismiss, 
  onArchive, 
  onClick,
  compact = false,
  showActions = true
}: NotificationCardProps) {
  const Icon = notificationIcons[notification.type];
  const isUnread = notification.status === NotificationStatus.UNREAD;
  const isScheduled = notification.scheduledFor && notification.scheduledFor > new Date();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    } else if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    
    // Mark as read when clicked
    if (isUnread && onMarkAsRead) {
      onMarkAsRead();
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ scale: compact ? 1.02 : 1.01 }}
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        compact 
          ? "p-3 rounded-lg border" 
          : "p-4 rounded-xl border shadow-sm",
        isUnread 
          ? "bg-white border-l-4 border-l-blue-500" 
          : "bg-gray-50",
        typeColors[notification.type],
        onClick || notification.actionUrl ? "cursor-pointer hover:shadow-md" : "",
        "group"
      )}
      onClick={handleClick}
    >
      {/* Unread Indicator */}
      {isUnread && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" />
      )}

      {/* Scheduled Indicator */}
      {isScheduled && (
        <div className="absolute top-2 right-6 text-orange-500">
          <Clock className="w-3 h-3" />
        </div>
      )}

      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0 p-2 rounded-full",
          priorityColors[notification.priority]
        )}>
          <Icon className={cn("w-4 h-4", compact ? "w-3 h-3" : "w-4 h-4")} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className={cn(
                "font-medium text-gray-900 line-clamp-2",
                compact ? "text-sm" : "text-base"
              )}>
                {notification.title}
              </h4>
              <p className={cn(
                "text-gray-600 line-clamp-2 mt-1",
                compact ? "text-xs" : "text-sm"
              )}>
                {notification.message}
              </p>
            </div>

            {/* Actions */}
            {showActions && (
              <div className={cn(
                "flex items-center space-x-1 ml-2",
                compact ? "opacity-0 group-hover:opacity-100" : ""
              )}>
                {isUnread && onMarkAsRead && (
                  <button
                    onClick={(e) => handleActionClick(e, onMarkAsRead)}
                    className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                )}
                
                {onArchive && (
                  <button
                    onClick={(e) => handleActionClick(e, onArchive)}
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Archive"
                  >
                    <Archive className="w-3 h-3" />
                  </button>
                )}

                {onDismiss && (
                  <button
                    onClick={(e) => handleActionClick(e, onDismiss)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Dismiss"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className={cn(
            "flex items-center justify-between mt-2",
            compact ? "text-xs" : "text-sm"
          )}>
            <div className="flex items-center space-x-3 text-gray-500">
              {/* Time */}
              <span>
                {isScheduled 
                  ? `Scheduled for ${notification.scheduledFor?.toLocaleDateString()}`
                  : formatTime(notification.createdAt)
                }
              </span>

              {/* Priority Badge */}
              {(notification.priority === NotificationPriority.HIGH || 
                notification.priority === NotificationPriority.URGENT) && (
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  notification.priority === NotificationPriority.URGENT
                    ? "bg-red-100 text-red-700"
                    : "bg-orange-100 text-orange-700"
                )}>
                  {notification.priority}
                </span>
              )}

              {/* Metadata Info */}
              {notification.metadata?.companyName && (
                <span className="text-gray-400">
                  • {notification.metadata.companyName}
                </span>
              )}
              
              {notification.metadata?.salary && (
                <span className="text-green-600 font-medium">
                  • AED {notification.metadata.salary.toLocaleString()}
                </span>
              )}
            </div>

            {/* Action Button */}
            {notification.actionUrl && notification.actionLabel && (
              <div className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors">
                <span className={cn(
                  "font-medium",
                  compact ? "text-xs" : "text-sm"
                )}>
                  {notification.actionLabel}
                </span>
                <ExternalLink className="w-3 h-3" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hover Overlay */}
      {(onClick || notification.actionUrl) && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-50/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </motion.div>
  );
}