'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Search, 
  Filter, 
  Check, 
  CheckCircle2, 
  Archive, 
  Trash2, 
  Settings, 
  MoreHorizontal,
  Calendar,
  Star,
  X
} from 'lucide-react';
import { 
  notificationManager, 
  type Notification, 
  NotificationType, 
  NotificationPriority, 
  NotificationStatus 
} from '@/lib/notifications';
import { NotificationMockData } from '@/lib/notification-triggers';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read' | 'archived'>('all');
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<NotificationPriority | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'type'>('date');
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load notifications
  useEffect(() => {
    if (!mounted) return;

    const updateNotifications = (newNotifications: Notification[]) => {
      setNotifications(newNotifications);
      setIsLoading(false);
    };

    // Initial load
    updateNotifications(notificationManager.getNotifications());

    // Subscribe to updates
    const unsubscribe = notificationManager.subscribe(updateNotifications);

    return unsubscribe;
  }, [mounted]);

  // Filter and search notifications
  useEffect(() => {
    let filtered = [...notifications];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(n => {
        switch (statusFilter) {
          case 'unread':
            return n.status === NotificationStatus.UNREAD;
          case 'read':
            return n.status === NotificationStatus.READ;
          case 'archived':
            return n.status === NotificationStatus.ARCHIVED;
          default:
            return true;
        }
      });
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(n => n.type === typeFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(n => n.priority === priorityFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query) ||
        n.metadata?.companyName?.toLowerCase().includes(query) ||
        n.metadata?.position?.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = {
            [NotificationPriority.URGENT]: 4,
            [NotificationPriority.HIGH]: 3,
            [NotificationPriority.MEDIUM]: 2,
            [NotificationPriority.LOW]: 1
          };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'type':
          return a.type.localeCompare(b.type);
        case 'date':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

    setFilteredNotifications(filtered);
  }, [notifications, searchQuery, statusFilter, typeFilter, priorityFilter, sortBy]);

  // Generate sample data if empty
  const generateSampleData = () => {
    NotificationMockData.generateSampleNotifications();
    NotificationMockData.generateScheduledNotifications();
  };

  // Bulk actions
  const handleSelectAll = () => {
    if (selectedIds.size === filteredNotifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredNotifications.map(n => n.id)));
    }
  };

  const handleSelectNotification = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkMarkAsRead = () => {
    selectedIds.forEach(id => notificationManager.markAsRead(id));
    setSelectedIds(new Set());
  };

  const handleBulkArchive = () => {
    selectedIds.forEach(id => notificationManager.archiveNotification(id));
    setSelectedIds(new Set());
  };

  const handleBulkDelete = () => {
    selectedIds.forEach(id => notificationManager.deleteNotification(id));
    setSelectedIds(new Set());
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
      notificationManager.clearAll();
      setSelectedIds(new Set());
    }
  };

  const unreadCount = notifications.filter(n => n.status === NotificationStatus.UNREAD).length;
  const totalCount = notifications.length;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
              <p className="text-gray-600">
                {totalCount > 0 
                  ? `${totalCount} total notifications • ${unreadCount} unread`
                  : "Stay updated with your job search progress"
                }
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {totalCount === 0 && (
                <button
                  onClick={generateSampleData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Generate Sample Data
                </button>
              )}
              
              {totalCount > 0 && (
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Clear All
                </button>
              )}
              
              <a
                href="/notifications/settings"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {totalCount > 0 && (
          <>
            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center space-x-4">
                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                    <option value="archived">Archived</option>
                  </select>

                  {/* Type Filter */}
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value={NotificationType.DEADLINE}>Deadlines</option>
                    <option value={NotificationType.INTERVIEW}>Interviews</option>
                    <option value={NotificationType.JOB_MATCH}>Job Matches</option>
                    <option value={NotificationType.APPLICATION_UPDATE}>Application Updates</option>
                    <option value={NotificationType.SALARY_ALERT}>Salary Alerts</option>
                    <option value={NotificationType.SKILL_RECOMMENDATION}>Skill Recommendations</option>
                    <option value={NotificationType.SYSTEM}>System</option>
                  </select>

                  {/* Priority Filter */}
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Priorities</option>
                    <option value={NotificationPriority.URGENT}>Urgent</option>
                    <option value={NotificationPriority.HIGH}>High</option>
                    <option value={NotificationPriority.MEDIUM}>Medium</option>
                    <option value={NotificationPriority.LOW}>Low</option>
                  </select>

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="priority">Sort by Priority</option>
                    <option value="type">Sort by Type</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            <AnimatePresence>
              {selectedIds.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-blue-900">
                        {selectedIds.size} notification{selectedIds.size !== 1 ? 's' : ''} selected
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleBulkMarkAsRead}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center space-x-1"
                      >
                        <Check className="w-4 h-4" />
                        <span>Mark as Read</span>
                      </button>
                      
                      <button
                        onClick={handleBulkArchive}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-1"
                      >
                        <Archive className="w-4 h-4" />
                        <span>Archive</span>
                      </button>
                      
                      <button
                        onClick={handleBulkDelete}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center space-x-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                      
                      <button
                        onClick={() => setSelectedIds(new Set())}
                        className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Select All */}
            {filteredNotifications.length > 0 && (
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <div className={cn(
                    "w-4 h-4 border-2 rounded flex items-center justify-center",
                    selectedIds.size === filteredNotifications.length
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-300"
                  )}>
                    {selectedIds.size === filteredNotifications.length && (
                      <Check className="w-3 h-3" />
                    )}
                  </div>
                  <span>
                    {selectedIds.size === filteredNotifications.length ? 'Deselect All' : 'Select All'}
                  </span>
                </button>

                <div className="text-sm text-gray-500">
                  Showing {filteredNotifications.length} of {totalCount} notifications
                </div>
              </div>
            )}

            {/* Notifications List */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading notifications...</p>
                </div>
              ) : filteredNotifications.length > 0 ? (
                <AnimatePresence>
                  {filteredNotifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative"
                    >
                      {/* Selection Checkbox */}
                      <button
                        onClick={() => handleSelectNotification(notification.id)}
                        className="absolute -left-8 top-4 p-1 z-10"
                      >
                        <div className={cn(
                          "w-4 h-4 border-2 rounded flex items-center justify-center transition-colors",
                          selectedIds.has(notification.id)
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "border-gray-300 hover:border-gray-400"
                        )}>
                          {selectedIds.has(notification.id) && (
                            <Check className="w-3 h-3" />
                          )}
                        </div>
                      </button>

                      <NotificationCard
                        notification={notification}
                        onMarkAsRead={() => notificationManager.markAsRead(notification.id)}
                        onDismiss={() => notificationManager.dismissNotification(notification.id)}
                        onArchive={() => notificationManager.archiveNotification(notification.id)}
                        showActions={true}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                  <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                  <p className="text-gray-500 mb-6">
                    {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all'
                      ? "Try adjusting your filters to see more notifications."
                      : "You're all caught up! We'll notify you when there's something new."
                    }
                  </p>
                  
                  {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('all');
                        setTypeFilter('all');
                        setPriorityFilter('all');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Empty State */}
        {totalCount === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <Bell className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No notifications yet</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              This is where you'll see important updates about your job applications, interviews, 
              and new job matches tailored for you.
            </p>
            <button
              onClick={generateSampleData}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Generate Sample Notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
}