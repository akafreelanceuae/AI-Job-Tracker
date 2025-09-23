'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Archive, Trash2, Settings, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationManager, type Notification, NotificationPriority, NotificationStatus } from '@/lib/notifications';
import { NotificationCard } from './NotificationCard';
import { ClientOnly } from '@/components/ui/client-only';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Subscribe to notification updates
  useEffect(() => {
    if (!mounted) return;

    const updateNotifications = (newNotifications: Notification[]) => {
      setNotifications(newNotifications);
      setUnreadCount(notificationManager.getUnreadCount());
    };

    // Initial load
    updateNotifications(notificationManager.getNotifications());

    // Subscribe to updates
    const unsubscribe = notificationManager.subscribe(updateNotifications);

    return unsubscribe;
  }, [mounted]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return notification.status === NotificationStatus.UNREAD;
      case 'urgent':
        return notification.priority === NotificationPriority.URGENT || notification.priority === NotificationPriority.HIGH;
      default:
        return notification.status !== NotificationStatus.ARCHIVED;
    }
  }).slice(0, 10); // Limit to 10 notifications in dropdown

  const handleMarkAsRead = (id: string) => {
    notificationManager.markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    notificationManager.markAllAsRead();
  };

  const handleDismiss = (id: string) => {
    notificationManager.dismissNotification(id);
  };

  const handleArchive = (id: string) => {
    notificationManager.archiveNotification(id);
  };

  return (
    <ClientOnly fallback={(
      <div className={cn("relative", className)}>
        <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100">
          <Bell className="w-6 h-6" />
        </button>
      </div>
    )}>
      <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-6 h-6" />
        
        {/* Unread Count Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse Animation for New Notifications */}
        {unreadCount > 0 && (
          <motion.div
            className="absolute -top-1 -right-1 bg-red-400 rounded-full w-[18px] h-[18px]"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 0.3, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({unreadCount} new)
                  </span>
                )}
              </h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-gray-100">
              {[
                { key: 'all', label: 'All', count: notifications.length },
                { key: 'unread', label: 'Unread', count: unreadCount },
                { key: 'urgent', label: 'Urgent', count: notifications.filter(n => n.priority === NotificationPriority.URGENT || n.priority === NotificationPriority.HIGH).length }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={cn(
                    "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                    filter === tab.key
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={cn(
                      "ml-2 px-2 py-0.5 text-xs rounded-full",
                      filter === tab.key
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    )}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredNotifications.length > 0 ? (
                <motion.div className="space-y-1 p-2">
                  {filteredNotifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <NotificationCard
                        notification={notification}
                        onMarkAsRead={() => handleMarkAsRead(notification.id)}
                        onDismiss={() => handleDismiss(notification.id)}
                        onArchive={() => handleArchive(notification.id)}
                        compact
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    {filter === 'all' && "No notifications yet"}
                    {filter === 'unread' && "No unread notifications"}
                    {filter === 'urgent' && "No urgent notifications"}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {filteredNotifications.length > 0 && (
              <div className="border-t border-gray-100 p-3">
                <div className="flex items-center justify-between">
                  <a
                    href="/notifications"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    View all notifications
                  </a>
                  <a
                    href="/notifications/settings"
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </ClientOnly>
  );
}
