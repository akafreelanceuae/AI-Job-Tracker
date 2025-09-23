'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Bell, 
  Mail, 
  Smartphone, 
  Clock, 
  Volume2, 
  VolumeX, 
  Moon, 
  Sun,
  Save,
  RotateCcw,
  Calendar,
  AlertTriangle,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { 
  NotificationType, 
  NotificationPriority, 
  type NotificationPreferences, 
  defaultNotificationPreferences 
} from '@/lib/notifications';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultNotificationPreferences);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadPreferences();
  }, []);

  const loadPreferences = () => {
    try {
      const stored = localStorage.getItem('job-tracker-notification-preferences');
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  };

  const savePreferences = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('job-tracker-notification-preferences', JSON.stringify(preferences));
      setHasChanges(false);
      // Show success toast here
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
      // Show error toast here
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    setPreferences(defaultNotificationPreferences);
    setHasChanges(true);
  };

  const updatePreferences = (updates: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const updateTypePreference = (type: NotificationType, updates: Partial<NotificationPreferences['types'][NotificationType]>) => {
    setPreferences(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: {
          ...prev.types[type],
          ...updates
        }
      }
    }));
    setHasChanges(true);
  };

  const getNotificationTypeLabel = (type: NotificationType): string => {
    const labels = {
      [NotificationType.DEADLINE]: 'Application Deadlines',
      [NotificationType.INTERVIEW]: 'Interview Reminders',
      [NotificationType.JOB_MATCH]: 'Job Match Alerts',
      [NotificationType.APPLICATION_UPDATE]: 'Application Updates',
      [NotificationType.SALARY_ALERT]: 'Salary Alerts',
      [NotificationType.COMPANY_NEWS]: 'Company News',
      [NotificationType.SKILL_RECOMMENDATION]: 'Skill Recommendations',
      [NotificationType.NETWORK_UPDATE]: 'Network Updates',
      [NotificationType.SYSTEM]: 'System Notifications'
    };
    return labels[type];
  };

  const getNotificationTypeDescription = (type: NotificationType): string => {
    const descriptions = {
      [NotificationType.DEADLINE]: 'Get notified about upcoming application deadlines',
      [NotificationType.INTERVIEW]: 'Reminders for scheduled interviews and preparation tips',
      [NotificationType.JOB_MATCH]: 'New job opportunities that match your profile',
      [NotificationType.APPLICATION_UPDATE]: 'Status changes on your job applications',
      [NotificationType.SALARY_ALERT]: 'Jobs with salaries above your target range',
      [NotificationType.COMPANY_NEWS]: 'News and updates from companies you\'re interested in',
      [NotificationType.SKILL_RECOMMENDATION]: 'Suggestions for improving your skills',
      [NotificationType.NETWORK_UPDATE]: 'Updates from your professional network',
      [NotificationType.SYSTEM]: 'Important system updates and announcements'
    };
    return descriptions[type];
  };

  const getTypeIcon = (type: NotificationType) => {
    const icons = {
      [NotificationType.DEADLINE]: AlertTriangle,
      [NotificationType.INTERVIEW]: Calendar,
      [NotificationType.JOB_MATCH]: CheckCircle,
      [NotificationType.APPLICATION_UPDATE]: Bell,
      [NotificationType.SALARY_ALERT]: CheckCircle,
      [NotificationType.COMPANY_NEWS]: Bell,
      [NotificationType.SKILL_RECOMMENDATION]: CheckCircle,
      [NotificationType.NETWORK_UPDATE]: Bell,
      [NotificationType.SYSTEM]: Settings
    };
    return icons[type];
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              href="/notifications"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
              <p className="text-gray-600 mt-1">Customize how and when you receive notifications</p>
            </div>
          </div>

          {/* Save Actions */}
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-900 font-medium">You have unsaved changes</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={resetToDefaults}
                    className="px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm flex items-center space-x-1"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                  
                  <button
                    onClick={savePreferences}
                    disabled={isSaving}
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-1 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          {/* Master Toggle */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  {preferences.enabled ? (
                    <Bell className="w-5 h-5 text-blue-600" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">All Notifications</h3>
                  <p className="text-gray-600 text-sm">Enable or disable all notifications</p>
                </div>
              </div>
              
              <button
                onClick={() => updatePreferences({ enabled: !preferences.enabled })}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  preferences.enabled ? "bg-blue-600" : "bg-gray-200"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    preferences.enabled ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>
          </div>

          {preferences.enabled && (
            <>
              {/* Quiet Hours */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Moon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Quiet Hours</h3>
                      <p className="text-gray-600 text-sm">Pause notifications during specific times</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => updatePreferences({ 
                      quietHours: { 
                        ...preferences.quietHours, 
                        enabled: !preferences.quietHours.enabled 
                      }
                    })}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      preferences.quietHours.enabled ? "bg-blue-600" : "bg-gray-200"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        preferences.quietHours.enabled ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>

                {preferences.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                      <input
                        type="time"
                        value={preferences.quietHours.start}
                        onChange={(e) => updatePreferences({
                          quietHours: {
                            ...preferences.quietHours,
                            start: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                      <input
                        type="time"
                        value={preferences.quietHours.end}
                        onChange={(e) => updatePreferences({
                          quietHours: {
                            ...preferences.quietHours,
                            end: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Workdays Only */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Workdays Only</h3>
                      <p className="text-gray-600 text-sm">Only receive notifications on weekdays</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => updatePreferences({ workdaysOnly: !preferences.workdaysOnly })}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      preferences.workdaysOnly ? "bg-blue-600" : "bg-gray-200"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        preferences.workdaysOnly ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
              </div>

              {/* Notification Types */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Types</h3>
                
                <div className="space-y-6">
                  {Object.entries(preferences.types).map(([typeKey, settings]) => {
                    const type = typeKey as NotificationType;
                    const Icon = getTypeIcon(type);
                    
                    return (
                      <div key={type} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Icon className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{getNotificationTypeLabel(type)}</h4>
                              <p className="text-sm text-gray-600 mt-1">{getNotificationTypeDescription(type)}</p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => updateTypePreference(type, { enabled: !settings.enabled })}
                            className={cn(
                              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                              settings.enabled ? "bg-blue-600" : "bg-gray-200"
                            )}
                          >
                            <span
                              className={cn(
                                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                settings.enabled ? "translate-x-6" : "translate-x-1"
                              )}
                            />
                          </button>
                        </div>

                        {settings.enabled && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                            {/* In-App */}
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`${type}-inApp`}
                                checked={settings.inApp}
                                onChange={(e) => updateTypePreference(type, { inApp: e.target.checked })}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <label htmlFor={`${type}-inApp`} className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                                <Bell className="w-3 h-3" />
                                <span>In-App</span>
                              </label>
                            </div>

                            {/* Email */}
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`${type}-email`}
                                checked={settings.email}
                                onChange={(e) => updateTypePreference(type, { email: e.target.checked })}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <label htmlFor={`${type}-email`} className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                                <Mail className="w-3 h-3" />
                                <span>Email</span>
                              </label>
                            </div>

                            {/* Push */}
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`${type}-push`}
                                checked={settings.push}
                                onChange={(e) => updateTypePreference(type, { push: e.target.checked })}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <label htmlFor={`${type}-push`} className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                                <Smartphone className="w-3 h-3" />
                                <span>Push</span>
                              </label>
                            </div>

                            {/* Frequency */}
                            <div>
                              <select
                                value={settings.frequency}
                                onChange={(e) => updateTypePreference(type, { frequency: e.target.value as any })}
                                className="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="immediate">Immediate</option>
                                <option value="hourly">Hourly</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>These settings are saved locally in your browser. Clearing browser data will reset all preferences.</p>
        </div>
      </div>
    </div>
  );
}