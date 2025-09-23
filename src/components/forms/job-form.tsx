"use client"

import { useState, useEffect } from 'react'
import { 
  Building, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Link as LinkIcon, 
  FileText,
  Tag,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  X,
  Plus,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'

interface JobFormProps {
  job?: any
  onSubmit: (data: any) => void
  onCancel: () => void
  isLoading?: boolean
}

const UAE_EMIRATES = [
  'Dubai',
  'Abu Dhabi', 
  'Sharjah',
  'Ajman',
  'Fujairah',
  'Ras Al Khaimah',
  'Umm Al Quwain'
]

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'bg-green-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-red-500' }
]

const JOB_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Freelance',
  'Remote',
  'Internship'
]

const COMMON_SKILLS = [
  'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python',
  'AWS', 'Docker', 'Kubernetes', 'SQL', 'MongoDB',
  'Vue.js', 'Angular', 'Next.js', 'Express.js', 'GraphQL',
  'Product Management', 'UI/UX', 'Data Science', 'DevOps',
  'Project Management', 'Scrum', 'Agile'
]

export default function JobForm({ 
  job, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: JobFormProps) {
  const [formData, setFormData] = useState({
    title: job?.title || '',
    company: job?.company || '',
    location: job?.location || '',
    emirate: job?.emirate || 'Dubai',
    salary: job?.salary || '',
    salaryMin: job?.salaryMin || '',
    salaryMax: job?.salaryMax || '',
    type: job?.type || 'Full-time',
    priority: job?.priority || 'medium',
    status: job?.status || 'wishlist',
    jobUrl: job?.jobUrl || '',
    description: job?.description || '',
    requirements: job?.requirements || '',
    tags: job?.tags || [],
    notes: job?.notes || '',
    appliedDate: job?.appliedDate || '',
    interviewDate: job?.interviewDate || '',
    visaSponsorship: job?.visaSponsorship || false,
    uaeNational: job?.uaeNational || false,
    remote: job?.remote || false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [mounted, setMounted] = useState(false)
  const [currentTag, setCurrentTag] = useState('')
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      handleChange('tags', [...formData.tags, tag])
      setCurrentTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    handleChange('tags', formData.tags.filter((tag: string) => tag !== tagToRemove))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) newErrors.title = 'Job title is required'
    if (!formData.company.trim()) newErrors.company = 'Company name is required'
    if (!formData.location.trim()) newErrors.location = 'Location is required'
    
    if (formData.salaryMin && formData.salaryMax) {
      if (parseInt(formData.salaryMin) >= parseInt(formData.salaryMax)) {
        newErrors.salary = 'Maximum salary must be greater than minimum'
      }
    }
    
    if (formData.jobUrl && !formData.jobUrl.match(/^https?:\/\/.+/)) {
      newErrors.jobUrl = 'Please enter a valid URL'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      const submitData = {
        ...formData,
        salary: formData.salaryMin && formData.salaryMax 
          ? `AED ${formData.salaryMin} - ${formData.salaryMax}`
          : formData.salary,
        location: `${formData.location}, ${formData.emirate}, UAE`
      }
      onSubmit(submitData)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl">
        <div className="p-6 border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-uae-green to-uae-gold rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {job ? 'Edit Job Application' : 'Add New Job'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {job ? 'Update job details and track your progress' : 'Add a new job to your pipeline'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <Building className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Basic Information</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Job Title <span className="text-red-500">*</span>
                </Label>
                <input
                  id="title"
                  type="text"
                  placeholder="e.g., Senior React Developer"
                  className={`w-full px-4 py-3 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors ${
                    errors.title ? 'border-red-500' : ''
                  }`}
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs flex items-center space-x-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.title}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm font-medium">
                  Company <span className="text-red-500">*</span>
                </Label>
                <input
                  id="company"
                  type="text"
                  placeholder="e.g., Emirates NBD"
                  className={`w-full px-4 py-3 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors ${
                    errors.company ? 'border-red-500' : ''
                  }`}
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                />
                {errors.company && (
                  <p className="text-red-500 text-xs flex items-center space-x-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.company}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">
                  City/Area <span className="text-red-500">*</span>
                </Label>
                <input
                  id="location"
                  type="text"
                  placeholder="e.g., Business Bay, DIFC"
                  className={`w-full px-4 py-3 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors ${
                    errors.location ? 'border-red-500' : ''
                  }`}
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                />
                {errors.location && (
                  <p className="text-red-500 text-xs flex items-center space-x-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.location}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emirate" className="text-sm font-medium">
                  Emirate
                </Label>
                <select
                  id="emirate"
                  className="w-full px-4 py-3 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                  value={formData.emirate}
                  onChange={(e) => handleChange('emirate', e.target.value)}
                >
                  {UAE_EMIRATES.map(emirate => (
                    <option key={emirate} value={emirate}>{emirate}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobUrl" className="text-sm font-medium">
                Job Posting URL
              </Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  id="jobUrl"
                  type="url"
                  placeholder="https://careers.company.com/job/123"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors ${
                    errors.jobUrl ? 'border-red-500' : ''
                  }`}
                  value={formData.jobUrl}
                  onChange={(e) => handleChange('jobUrl', e.target.value)}
                />
              </div>
              {errors.jobUrl && (
                <p className="text-red-500 text-xs flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.jobUrl}</span>
                </p>
              )}
            </div>
          </div>

          {/* Job Details */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <DollarSign className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Job Details</h3>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="salaryMin" className="text-sm font-medium">
                  Salary Range (AED)
                </Label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="flex-1 px-3 py-3 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                    value={formData.salaryMin}
                    onChange={(e) => handleChange('salaryMin', e.target.value)}
                  />
                  <span className="flex items-center text-muted-foreground">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="flex-1 px-3 py-3 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                    value={formData.salaryMax}
                    onChange={(e) => handleChange('salaryMax', e.target.value)}
                  />
                </div>
                {errors.salary && (
                  <p className="text-red-500 text-xs flex items-center space-x-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.salary}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium">
                  Job Type
                </Label>
                <select
                  id="type"
                  className="w-full px-4 py-3 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                >
                  {JOB_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="text-sm font-medium">
                  Priority Level
                </Label>
                <select
                  id="priority"
                  className="w-full px-4 py-3 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                >
                  {PRIORITY_LEVELS.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Special Requirements */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Special Requirements</Label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-border/50 text-primary focus:ring-primary/50"
                    checked={formData.visaSponsorship}
                    onChange={(e) => handleChange('visaSponsorship', e.target.checked)}
                  />
                  <span className="text-sm">Visa Sponsorship Available</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-border/50 text-primary focus:ring-primary/50"
                    checked={formData.uaeNational}
                    onChange={(e) => handleChange('uaeNational', e.target.checked)}
                  />
                  <span className="text-sm">UAE National Preferred</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-border/50 text-primary focus:ring-primary/50"
                    checked={formData.remote}
                    onChange={(e) => handleChange('remote', e.target.checked)}
                  />
                  <span className="text-sm">Remote Work Available</span>
                </label>
              </div>
            </div>
          </div>

          {/* Skills & Tags */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <Tag className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Skills & Tags</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Add Skills/Tags</Label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="e.g., React, TypeScript, Leadership"
                    className="flex-1 px-4 py-3 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag(currentTag)
                      }
                    }}
                    onFocus={() => setShowSkillSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSkillSuggestions(false), 200)}
                  />
                  <Button
                    type="button"
                    onClick={() => addTag(currentTag)}
                    size="sm"
                    className="px-6"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                
                {/* Skill Suggestions */}
                {showSkillSuggestions && currentTag && (
                  <div className="bg-background border border-border/50 rounded-lg p-2 shadow-lg">
                    <div className="flex flex-wrap gap-1">
                      {COMMON_SKILLS
                        .filter(skill => skill.toLowerCase().includes(currentTag.toLowerCase()))
                        .slice(0, 8)
                        .map(skill => (
                          <Button
                            key={skill}
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              addTag(skill)
                              setShowSkillSuggestions(false)
                            }}
                            className="text-xs h-6 px-2"
                          >
                            {skill}
                          </Button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Current Tags */}
              {formData.tags.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Current Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag: string) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="px-3 py-1 bg-primary/10 text-primary border-none flex items-center space-x-1"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-primary hover:text-primary/70 ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description & Notes */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Additional Information</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Job Description
                </Label>
                <textarea
                  id="description"
                  rows={4}
                  placeholder="Brief description of the role, responsibilities, and company..."
                  className="w-full px-4 py-3 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors resize-none"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Personal Notes
                </Label>
                <textarea
                  id="notes"
                  rows={4}
                  placeholder="Your thoughts, research notes, interview prep notes..."
                  className="w-full px-4 py-3 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors resize-none"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-uae-green to-uae-green/90 text-white px-8"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>{job ? 'Update Job' : 'Add Job'}</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}