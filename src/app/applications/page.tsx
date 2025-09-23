'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Grid, 
  List, 
  Filter, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Tag,
  Download,
  Upload
} from 'lucide-react';
import { 
  JobApplication,
  ApplicationStatus, 
  ApplicationPriority,
  ApplicationFilters,
  applicationManager 
} from '@/lib/applications';
import { ApplicationForm } from '@/components/applications/ApplicationForm';
import { cn } from '@/lib/utils';

type ViewMode = 'kanban' | 'list';

const statusColors = {
  [ApplicationStatus.DRAFT]: 'bg-gray-100 text-gray-800 border-gray-200',
  [ApplicationStatus.APPLIED]: 'bg-blue-100 text-blue-800 border-blue-200',
  [ApplicationStatus.UNDER_REVIEW]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [ApplicationStatus.PHONE_SCREENING]: 'bg-purple-100 text-purple-800 border-purple-200',
  [ApplicationStatus.TECHNICAL_INTERVIEW]: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  [ApplicationStatus.ON_SITE_INTERVIEW]: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  [ApplicationStatus.FINAL_INTERVIEW]: 'bg-orange-100 text-orange-800 border-orange-200',
  [ApplicationStatus.OFFER_RECEIVED]: 'bg-green-100 text-green-800 border-green-200',
  [ApplicationStatus.OFFER_ACCEPTED]: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  [ApplicationStatus.OFFER_DECLINED]: 'bg-red-100 text-red-800 border-red-200',
  [ApplicationStatus.REJECTED]: 'bg-red-100 text-red-800 border-red-200',
  [ApplicationStatus.WITHDRAWN]: 'bg-gray-100 text-gray-800 border-gray-200',
  [ApplicationStatus.GHOST]: 'bg-gray-100 text-gray-800 border-gray-200'
};

const priorityColors = {
  [ApplicationPriority.LOW]: 'text-gray-500',
  [ApplicationPriority.MEDIUM]: 'text-blue-500',
  [ApplicationPriority.HIGH]: 'text-orange-500',
  [ApplicationPriority.URGENT]: 'text-red-500'
};

const statusLabels = {
  [ApplicationStatus.DRAFT]: 'Draft',
  [ApplicationStatus.APPLIED]: 'Applied',
  [ApplicationStatus.UNDER_REVIEW]: 'Under Review',
  [ApplicationStatus.PHONE_SCREENING]: 'Phone Screening',
  [ApplicationStatus.TECHNICAL_INTERVIEW]: 'Technical Interview',
  [ApplicationStatus.ON_SITE_INTERVIEW]: 'On-site Interview',
  [ApplicationStatus.FINAL_INTERVIEW]: 'Final Interview',
  [ApplicationStatus.OFFER_RECEIVED]: 'Offer Received',
  [ApplicationStatus.OFFER_ACCEPTED]: 'Offer Accepted',
  [ApplicationStatus.OFFER_DECLINED]: 'Offer Declined',
  [ApplicationStatus.REJECTED]: 'Rejected',
  [ApplicationStatus.WITHDRAWN]: 'Withdrawn',
  [ApplicationStatus.GHOST]: 'Ghosted'
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<JobApplication[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | undefined>();
  const [filters, setFilters] = useState<ApplicationFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load applications
  useEffect(() => {
    if (!mounted) return;

    const updateApplications = (newApplications: JobApplication[]) => {
      setApplications(newApplications);
    };

    // Initial load
    updateApplications(applicationManager.getApplications());

    // Subscribe to updates
    const unsubscribe = applicationManager.subscribe(updateApplications);

    return unsubscribe;
  }, [mounted]);

  // Filter and search applications
  useEffect(() => {
    let filtered = applicationManager.getFilteredApplications(filters);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.companyName.toLowerCase().includes(query) ||
        app.position.toLowerCase().includes(query) ||
        app.location.toLowerCase().includes(query) ||
        app.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredApplications(filtered);
  }, [applications, searchQuery, filters]);

  // Generate sample data if empty
  const generateSampleData = () => {
    const sampleApplications = [
      {
        companyName: 'Emirates NBD',
        position: 'Senior React Developer',
        location: 'Dubai',
        status: ApplicationStatus.TECHNICAL_INTERVIEW,
        priority: ApplicationPriority.HIGH,
        appliedDate: new Date('2024-01-15'),
        workType: 'hybrid' as const,
        employmentType: 'full_time' as const,
        applicationMethod: 'linkedin' as const,
        salaryRange: { min: 20000, max: 25000, currency: 'AED' },
        followUpDates: [],
        tags: ['fintech', 'react', 'typescript'],
        rating: 4
      },
      {
        companyName: 'Noon.com',
        position: 'Full Stack Developer',
        location: 'Dubai',
        status: ApplicationStatus.APPLIED,
        priority: ApplicationPriority.MEDIUM,
        appliedDate: new Date('2024-01-20'),
        workType: 'on_site' as const,
        employmentType: 'full_time' as const,
        applicationMethod: 'company_website' as const,
        salaryRange: { min: 18000, max: 22000, currency: 'AED' },
        followUpDates: [],
        tags: ['ecommerce', 'nodejs', 'react'],
        rating: 5
      },
      {
        companyName: 'Careem',
        position: 'Software Engineer',
        location: 'Dubai',
        status: ApplicationStatus.OFFER_RECEIVED,
        priority: ApplicationPriority.URGENT,
        appliedDate: new Date('2024-01-10'),
        workType: 'remote' as const,
        employmentType: 'full_time' as const,
        applicationMethod: 'referral' as const,
        salaryRange: { min: 22000, max: 28000, currency: 'AED' },
        followUpDates: [],
        tags: ['ride-hailing', 'mobile', 'backend'],
        rating: 5,
        offer: {
          salary: 25000,
          currency: 'AED',
          benefits: ['Health Insurance', 'Stock Options', 'Flexible Hours'],
          responseDeadline: new Date('2024-02-01')
        }
      },
      {
        companyName: 'Dubai Islamic Bank',
        position: 'Technology Lead',
        location: 'Dubai',
        status: ApplicationStatus.REJECTED,
        priority: ApplicationPriority.HIGH,
        appliedDate: new Date('2024-01-05'),
        workType: 'on_site' as const,
        employmentType: 'full_time' as const,
        applicationMethod: 'linkedin' as const,
        salaryRange: { min: 25000, max: 30000, currency: 'AED' },
        followUpDates: [],
        tags: ['banking', 'leadership', 'fintech'],
        rating: 3,
        rejectionReason: 'Looking for more banking experience'
      },
      {
        companyName: 'Microsoft UAE',
        position: 'Cloud Solutions Architect',
        location: 'Abu Dhabi',
        status: ApplicationStatus.PHONE_SCREENING,
        priority: ApplicationPriority.HIGH,
        appliedDate: new Date('2024-01-25'),
        workType: 'hybrid' as const,
        employmentType: 'full_time' as const,
        applicationMethod: 'recruiter' as const,
        salaryRange: { min: 30000, max: 40000, currency: 'AED' },
        followUpDates: [],
        tags: ['microsoft', 'azure', 'cloud', 'enterprise'],
        rating: 5
      }
    ];

    sampleApplications.forEach(app => {
      applicationManager.createApplication(app);
    });
  };

  const handleCreateApplication = () => {
    setEditingApplication(undefined);
    setShowForm(true);
  };

  const handleEditApplication = (application: JobApplication) => {
    setEditingApplication(application);
    setShowForm(true);
  };

  const handleDeleteApplication = (id: string) => {
    if (confirm('Are you sure you want to delete this application?')) {
      applicationManager.deleteApplication(id);
    }
  };

  const handleFormSave = (applicationId: string) => {
    setShowForm(false);
    setEditingApplication(undefined);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingApplication(undefined);
  };

  // Kanban board data
  const kanbanColumns = [
    { status: ApplicationStatus.APPLIED, title: 'Applied' },
    { status: ApplicationStatus.UNDER_REVIEW, title: 'Under Review' },
    { status: ApplicationStatus.PHONE_SCREENING, title: 'Phone Screen' },
    { status: ApplicationStatus.TECHNICAL_INTERVIEW, title: 'Technical' },
    { status: ApplicationStatus.ON_SITE_INTERVIEW, title: 'On-site' },
    { status: ApplicationStatus.FINAL_INTERVIEW, title: 'Final' },
    { status: ApplicationStatus.OFFER_RECEIVED, title: 'Offer' }
  ];

  const getApplicationsByStatus = (status: ApplicationStatus) => {
    return filteredApplications.filter(app => app.status === status);
  };

  const ApplicationCard = ({ application, compact = false }: { application: JobApplication; compact?: boolean }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: compact ? 1.02 : 1.01 }}
      className={cn(
        "bg-white rounded-lg border shadow-sm hover:shadow-md transition-all cursor-pointer group",
        compact ? "p-3" : "p-4"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-semibold text-gray-900 truncate",
            compact ? "text-sm" : "text-base"
          )}>
            {application.position}
          </h3>
          <div className="flex items-center space-x-1 mt-1">
            <Building2 className="w-3 h-3 text-gray-400" />
            <p className="text-sm text-gray-600 truncate">{application.companyName}</p>
          </div>
        </div>

        <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditApplication(application);
            }}
            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
          >
            <Edit className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteApplication(application.id);
            }}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <MapPin className="w-3 h-3" />
            <span>{application.location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{application.appliedDate.toLocaleDateString()}</span>
          </div>
        </div>

        {application.salaryRange && (
          <div className="flex items-center space-x-1 text-xs text-green-600">
            <DollarSign className="w-3 h-3" />
            <span>
              {application.salaryRange.currency} {application.salaryRange.min.toLocaleString()} - {application.salaryRange.max.toLocaleString()}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-3 h-3",
                  i < application.rating
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                )}
              />
            ))}
          </div>

          <div className={cn(
            "w-2 h-2 rounded-full",
            priorityColors[application.priority]
          )} />
        </div>

        {application.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {application.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
              >
                {tag}
              </span>
            ))}
            {application.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{application.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {editingApplication ? 'Edit Application' : 'New Application'}
            </h1>
            <p className="text-gray-600 mt-1">
              {editingApplication ? 'Update your job application details' : 'Add a new job application to track'}
            </p>
          </div>

          <ApplicationForm
            application={editingApplication}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Applications</h1>
              <p className="text-gray-600 mt-1">
                {applications.length > 0 
                  ? `Track and manage your ${applications.length} job applications`
                  : "Track and manage your job applications"
                }
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {applications.length === 0 && (
                <button
                  onClick={generateSampleData}
                  className="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Add Sample Data</span>
                </button>
              )}
              
              <button
                onClick={handleCreateApplication}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Application</span>
              </button>
            </div>
          </div>
        </div>

        {applications.length > 0 && (
          <>
            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search applications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* View Toggle and Actions */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('kanban')}
                      className={cn(
                        "flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                        viewMode === 'kanban'
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      )}
                    >
                      <Grid className="w-4 h-4" />
                      <span>Kanban</span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={cn(
                        "flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                        viewMode === 'list'
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      )}
                    >
                      <List className="w-4 h-4" />
                      <span>List</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filters</span>
                  </button>
                </div>
              </div>

              {/* Filters Panel */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-gray-200"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={filters.status?.[0] || ''}
                          onChange={(e) => setFilters({ 
                            ...filters, 
                            status: e.target.value ? [e.target.value as ApplicationStatus] : undefined 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">All Status</option>
                          {Object.entries(statusLabels).map(([status, label]) => (
                            <option key={status} value={status}>{label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select
                          value={filters.priority?.[0] || ''}
                          onChange={(e) => setFilters({ 
                            ...filters, 
                            priority: e.target.value ? [e.target.value as ApplicationPriority] : undefined 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">All Priority</option>
                          <option value={ApplicationPriority.LOW}>Low</option>
                          <option value={ApplicationPriority.MEDIUM}>Medium</option>
                          <option value={ApplicationPriority.HIGH}>High</option>
                          <option value={ApplicationPriority.URGENT}>Urgent</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Work Type</label>
                        <select
                          value={filters.workTypes?.[0] || ''}
                          onChange={(e) => setFilters({ 
                            ...filters, 
                            workTypes: e.target.value ? [e.target.value as any] : undefined 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">All Work Types</option>
                          <option value="remote">Remote</option>
                          <option value="hybrid">Hybrid</option>
                          <option value="on_site">On-site</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Has Interview</label>
                        <select
                          value={filters.hasInterview?.toString() || ''}
                          onChange={(e) => setFilters({ 
                            ...filters, 
                            hasInterview: e.target.value ? e.target.value === 'true' : undefined 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">All Applications</option>
                          <option value="true">With Interview</option>
                          <option value="false">Without Interview</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
              {viewMode === 'kanban' ? (
                /* Kanban Board */
                <div className="flex space-x-6 overflow-x-auto pb-6">
                  {kanbanColumns.map((column) => {
                    const columnApplications = getApplicationsByStatus(column.status);
                    return (
                      <div key={column.status} className="flex-shrink-0 w-80">
                        <div className="bg-gray-100 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium text-gray-900">{column.title}</h3>
                            <span className={cn(
                              "px-2 py-1 text-xs font-medium rounded-full",
                              statusColors[column.status]
                            )}>
                              {columnApplications.length}
                            </span>
                          </div>
                          
                          <div className="space-y-3 max-h-[600px] overflow-y-auto">
                            <AnimatePresence>
                              {columnApplications.map((application) => (
                                <ApplicationCard 
                                  key={application.id} 
                                  application={application} 
                                  compact
                                />
                              ))}
                            </AnimatePresence>
                            
                            {columnApplications.length === 0 && (
                              <div className="text-center py-8 text-gray-500">
                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <Building2 className="w-6 h-6 text-gray-400" />
                                </div>
                                <p className="text-sm">No applications</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* List View */
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Position & Company
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Location
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Salary
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Applied
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Priority
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <AnimatePresence>
                          {filteredApplications.map((application, index) => (
                            <motion.tr
                              key={application.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleEditApplication(application)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className={cn(
                                      "h-10 w-10 rounded-full flex items-center justify-center",
                                      statusColors[application.status]
                                    )}>
                                      <Building2 className="w-4 h-4" />
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {application.position}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {application.companyName}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={cn(
                                  "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                                  statusColors[application.status]
                                )}>
                                  {statusLabels[application.status]}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                                  {application.location}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {application.salaryRange ? (
                                  <div className="flex items-center text-green-600">
                                    <DollarSign className="w-4 h-4 mr-1" />
                                    {application.salaryRange.currency} {application.salaryRange.min.toLocaleString()} - {application.salaryRange.max.toLocaleString()}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">Not specified</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {application.appliedDate.toLocaleDateString()}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className={cn(
                                  "w-3 h-3 rounded-full",
                                  priorityColors[application.priority]
                                )} />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditApplication(application);
                                    }}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteApplication(application.id);
                                    }}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>

                  {filteredApplications.length === 0 && (
                    <div className="text-center py-12">
                      <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                      <p className="text-gray-500">
                        {searchQuery || Object.keys(filters).length > 0
                          ? "Try adjusting your search or filters"
                          : "Start tracking your job applications"
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Empty State */}
        {applications.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <Building2 className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No job applications yet</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Start tracking your job applications to get insights into your job search progress and manage your pipeline effectively.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={generateSampleData}
                className="px-6 py-3 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors font-medium"
              >
                Add Sample Data
              </button>
              <button
                onClick={handleCreateApplication}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Add Your First Application
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}