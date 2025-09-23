'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  DollarSign, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  FileText, 
  Tag, 
  Star,
  Plus,
  X,
  Save,
  AlertCircle,
  Upload
} from 'lucide-react';
import { 
  JobApplication,
  ApplicationStatus, 
  ApplicationPriority,
  applicationManager 
} from '@/lib/applications';
import { cn } from '@/lib/utils';

interface ApplicationFormProps {
  application?: JobApplication;
  onSave: (applicationId: string) => void;
  onCancel: () => void;
}

interface FormData {
  companyName: string;
  position: string;
  jobDescription: string;
  status: ApplicationStatus;
  priority: ApplicationPriority;
  appliedDate: string;
  location: string;
  workType: 'remote' | 'hybrid' | 'on_site';
  employmentType: 'full_time' | 'part_time' | 'contract' | 'internship';
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  applicationUrl: string;
  applicationMethod: 'company_website' | 'linkedin' | 'job_board' | 'referral' | 'recruiter' | 'other';
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  recruiterName: string;
  recruiterEmail: string;
  referral: string;
  coverLetterUsed: string;
  cvUsed: string;
  expectedResponseDate: string;
  tags: string[];
  rating: number;
  feedback: string;
}

const initialFormData: FormData = {
  companyName: '',
  position: '',
  jobDescription: '',
  status: ApplicationStatus.APPLIED,
  priority: ApplicationPriority.MEDIUM,
  appliedDate: new Date().toISOString().split('T')[0],
  location: '',
  workType: 'on_site',
  employmentType: 'full_time',
  salaryMin: '',
  salaryMax: '',
  salaryCurrency: 'AED',
  applicationUrl: '',
  applicationMethod: 'company_website',
  contactPerson: '',
  contactEmail: '',
  contactPhone: '',
  recruiterName: '',
  recruiterEmail: '',
  referral: '',
  coverLetterUsed: '',
  cvUsed: '',
  expectedResponseDate: '',
  tags: [],
  rating: 3,
  feedback: ''
};

export function ApplicationForm({ application, onSave, onCancel }: ApplicationFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'contacts' | 'additional'>('basic');

  // Initialize form with existing application data
  useEffect(() => {
    if (application) {
      setFormData({
        companyName: application.companyName,
        position: application.position,
        jobDescription: application.jobDescription || '',
        status: application.status,
        priority: application.priority,
        appliedDate: application.appliedDate.toISOString().split('T')[0],
        location: application.location,
        workType: application.workType,
        employmentType: application.employmentType,
        salaryMin: application.salaryRange?.min?.toString() || '',
        salaryMax: application.salaryRange?.max?.toString() || '',
        salaryCurrency: application.salaryRange?.currency || 'AED',
        applicationUrl: application.applicationUrl || '',
        applicationMethod: application.applicationMethod,
        contactPerson: application.contactPerson || '',
        contactEmail: application.contactEmail || '',
        contactPhone: application.contactPhone || '',
        recruiterName: application.recruiterName || '',
        recruiterEmail: application.recruiterEmail || '',
        referral: application.referral || '',
        coverLetterUsed: application.coverLetterUsed || '',
        cvUsed: application.cvUsed || '',
        expectedResponseDate: application.expectedResponseDate?.toISOString().split('T')[0] || '',
        tags: application.tags,
        rating: application.rating,
        feedback: application.feedback || ''
      });
    }
  }, [application]);

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear errors for updated fields
    const updatedFields = Object.keys(updates);
    setErrors(prev => {
      const newErrors = { ...prev };
      updatedFields.forEach(field => delete newErrors[field]);
      return newErrors;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.appliedDate) {
      newErrors.appliedDate = 'Applied date is required';
    }

    if (formData.contactEmail && !isValidEmail(formData.contactEmail)) {
      newErrors.contactEmail = 'Invalid email format';
    }

    if (formData.recruiterEmail && !isValidEmail(formData.recruiterEmail)) {
      newErrors.recruiterEmail = 'Invalid email format';
    }

    if (formData.salaryMin && formData.salaryMax) {
      if (parseInt(formData.salaryMin) > parseInt(formData.salaryMax)) {
        newErrors.salaryMax = 'Maximum salary must be greater than minimum';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      updateFormData({ tags: [...formData.tags, currentTag.trim()] });
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateFormData({ tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const applicationData: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt' | 'lastUpdated' | 'timeline' | 'interviews' | 'documents' | 'notes'> = {
        companyName: formData.companyName.trim(),
        position: formData.position.trim(),
        jobDescription: formData.jobDescription.trim() || undefined,
        status: formData.status,
        priority: formData.priority,
        appliedDate: new Date(formData.appliedDate),
        location: formData.location.trim(),
        workType: formData.workType,
        employmentType: formData.employmentType,
        salaryRange: (formData.salaryMin || formData.salaryMax) ? {
          min: parseInt(formData.salaryMin) || 0,
          max: parseInt(formData.salaryMax) || 0,
          currency: formData.salaryCurrency
        } : undefined,
        applicationUrl: formData.applicationUrl.trim() || undefined,
        applicationMethod: formData.applicationMethod,
        contactPerson: formData.contactPerson.trim() || undefined,
        contactEmail: formData.contactEmail.trim() || undefined,
        contactPhone: formData.contactPhone.trim() || undefined,
        recruiterName: formData.recruiterName.trim() || undefined,
        recruiterEmail: formData.recruiterEmail.trim() || undefined,
        referral: formData.referral.trim() || undefined,
        coverLetterUsed: formData.coverLetterUsed.trim() || undefined,
        cvUsed: formData.cvUsed.trim() || undefined,
        expectedResponseDate: formData.expectedResponseDate ? new Date(formData.expectedResponseDate) : undefined,
        followUpDates: [],
        tags: formData.tags,
        rating: formData.rating,
        feedback: formData.feedback.trim() || undefined
      };

      let applicationId: string;

      if (application) {
        // Update existing application
        applicationManager.updateApplication(application.id, applicationData);
        applicationId = application.id;
      } else {
        // Create new application
        applicationId = applicationManager.createApplication(applicationData);
      }

      onSave(applicationId);
    } catch (error) {
      console.error('Error saving application:', error);
      setErrors({ submit: 'Failed to save application. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Building2 },
    { id: 'details', label: 'Job Details', icon: FileText },
    { id: 'contacts', label: 'Contacts', icon: User },
    { id: 'additional', label: 'Additional', icon: Tag }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => updateFormData({ companyName: e.target.value })}
                        className={cn(
                          "w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                          errors.companyName ? "border-red-300" : "border-gray-300"
                        )}
                        placeholder="Enter company name"
                      />
                      {errors.companyName && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.companyName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Position */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position *
                    </label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => updateFormData({ position: e.target.value })}
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                        errors.position ? "border-red-300" : "border-gray-300"
                      )}
                      placeholder="Enter position title"
                    />
                    {errors.position && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.position}
                      </p>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => updateFormData({ location: e.target.value })}
                        className={cn(
                          "w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                          errors.location ? "border-red-300" : "border-gray-300"
                        )}
                        placeholder="Dubai, Abu Dhabi, etc."
                      />
                      {errors.location && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Applied Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Applied Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        value={formData.appliedDate}
                        onChange={(e) => updateFormData({ appliedDate: e.target.value })}
                        className={cn(
                          "w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                          errors.appliedDate ? "border-red-300" : "border-gray-300"
                        )}
                      />
                      {errors.appliedDate && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.appliedDate}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => updateFormData({ status: e.target.value as ApplicationStatus })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={ApplicationStatus.DRAFT}>Draft</option>
                      <option value={ApplicationStatus.APPLIED}>Applied</option>
                      <option value={ApplicationStatus.UNDER_REVIEW}>Under Review</option>
                      <option value={ApplicationStatus.PHONE_SCREENING}>Phone Screening</option>
                      <option value={ApplicationStatus.TECHNICAL_INTERVIEW}>Technical Interview</option>
                      <option value={ApplicationStatus.ON_SITE_INTERVIEW}>On-site Interview</option>
                      <option value={ApplicationStatus.FINAL_INTERVIEW}>Final Interview</option>
                      <option value={ApplicationStatus.OFFER_RECEIVED}>Offer Received</option>
                      <option value={ApplicationStatus.OFFER_ACCEPTED}>Offer Accepted</option>
                      <option value={ApplicationStatus.OFFER_DECLINED}>Offer Declined</option>
                      <option value={ApplicationStatus.REJECTED}>Rejected</option>
                      <option value={ApplicationStatus.WITHDRAWN}>Withdrawn</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => updateFormData({ priority: e.target.value as ApplicationPriority })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={ApplicationPriority.LOW}>Low</option>
                      <option value={ApplicationPriority.MEDIUM}>Medium</option>
                      <option value={ApplicationPriority.HIGH}>High</option>
                      <option value={ApplicationPriority.URGENT}>Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Job Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description
                  </label>
                  <textarea
                    value={formData.jobDescription}
                    onChange={(e) => updateFormData({ jobDescription: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Paste the job description here..."
                  />
                </div>
              </div>
            )}

            {/* Job Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Work Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work Type
                    </label>
                    <select
                      value={formData.workType}
                      onChange={(e) => updateFormData({ workType: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="on_site">On-site</option>
                    </select>
                  </div>

                  {/* Employment Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employment Type
                    </label>
                    <select
                      value={formData.employmentType}
                      onChange={(e) => updateFormData({ employmentType: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="full_time">Full-time</option>
                      <option value="part_time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>

                  {/* Application Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application Method
                    </label>
                    <select
                      value={formData.applicationMethod}
                      onChange={(e) => updateFormData({ applicationMethod: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="company_website">Company Website</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="job_board">Job Board</option>
                      <option value="referral">Referral</option>
                      <option value="recruiter">Recruiter</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Expected Response Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Response Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        value={formData.expectedResponseDate}
                        onChange={(e) => updateFormData({ expectedResponseDate: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Salary Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Range
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <input
                        type="number"
                        value={formData.salaryMin}
                        onChange={(e) => updateFormData({ salaryMin: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Min salary"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={formData.salaryMax}
                        onChange={(e) => updateFormData({ salaryMax: e.target.value })}
                        className={cn(
                          "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                          errors.salaryMax ? "border-red-300" : "border-gray-300"
                        )}
                        placeholder="Max salary"
                      />
                      {errors.salaryMax && (
                        <p className="mt-1 text-sm text-red-600">{errors.salaryMax}</p>
                      )}
                    </div>
                    <div>
                      <select
                        value={formData.salaryCurrency}
                        onChange={(e) => updateFormData({ salaryCurrency: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="AED">AED</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Application URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application URL
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="url"
                      value={formData.applicationUrl}
                      onChange={(e) => updateFormData({ applicationUrl: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Contacts Tab */}
            {activeTab === 'contacts' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contact Person */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Person
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.contactPerson}
                        onChange={(e) => updateFormData({ contactPerson: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Hiring manager name"
                      />
                    </div>
                  </div>

                  {/* Contact Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => updateFormData({ contactEmail: e.target.value })}
                        className={cn(
                          "w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                          errors.contactEmail ? "border-red-300" : "border-gray-300"
                        )}
                        placeholder="contact@company.com"
                      />
                      {errors.contactEmail && (
                        <p className="mt-1 text-sm text-red-600">{errors.contactEmail}</p>
                      )}
                    </div>
                  </div>

                  {/* Contact Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) => updateFormData({ contactPhone: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+971 50 123 4567"
                      />
                    </div>
                  </div>

                  {/* Recruiter Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recruiter Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.recruiterName}
                        onChange={(e) => updateFormData({ recruiterName: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="External recruiter name"
                      />
                    </div>
                  </div>

                  {/* Recruiter Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recruiter Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        value={formData.recruiterEmail}
                        onChange={(e) => updateFormData({ recruiterEmail: e.target.value })}
                        className={cn(
                          "w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                          errors.recruiterEmail ? "border-red-300" : "border-gray-300"
                        )}
                        placeholder="recruiter@agency.com"
                      />
                      {errors.recruiterEmail && (
                        <p className="mt-1 text-sm text-red-600">{errors.recruiterEmail}</p>
                      )}
                    </div>
                  </div>

                  {/* Referral */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Referral
                    </label>
                    <input
                      type="text"
                      value={formData.referral}
                      onChange={(e) => updateFormData({ referral: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Person who referred you"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Additional Tab */}
            {activeTab === 'additional' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* CV Used */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CV Used
                    </label>
                    <input
                      type="text"
                      value={formData.cvUsed}
                      onChange={(e) => updateFormData({ cvUsed: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="CV version or file name"
                    />
                  </div>

                  {/* Cover Letter Used */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Letter Used
                    </label>
                    <input
                      type="text"
                      value={formData.coverLetterUsed}
                      onChange={(e) => updateFormData({ coverLetterUsed: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Cover letter template or custom"
                    />
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interest Rating
                    </label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => updateFormData({ rating: star })}
                          className={cn(
                            "p-1 rounded transition-colors",
                            star <= formData.rating
                              ? "text-yellow-400"
                              : "text-gray-300 hover:text-yellow-300"
                          )}
                        >
                          <Star className="w-6 h-6 fill-current" />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        {formData.rating}/5 stars
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add a tag"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Feedback */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes / Feedback
                  </label>
                  <textarea
                    value={formData.feedback}
                    onChange={(e) => updateFormData({ feedback: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Additional notes about this application..."
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center space-x-4">
            {errors.submit && (
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.submit}
              </p>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : application ? 'Update Application' : 'Create Application'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}