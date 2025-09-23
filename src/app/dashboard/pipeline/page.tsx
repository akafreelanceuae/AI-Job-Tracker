"use client"

import { useState, useEffect, useCallback } from 'react'
import { 
  Building, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Filter,
  Search,
  MoreHorizontal,
  ExternalLink,
  Star,
  AlertCircle,
  CheckCircle,
  Timer,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import DashboardLayout from '@/components/layout/dashboard-layout'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Pipeline stages
const stages = [
  {
    id: 'wishlist',
    title: 'Wishlist',
    description: 'Jobs to apply to',
    color: 'border-gray-200 bg-gray-50/50',
    icon: Star,
    count: 3
  },
  {
    id: 'applied',
    title: 'Applied',
    description: 'Applications sent',
    color: 'border-blue-200 bg-blue-50/50',
    icon: Clock,
    count: 8
  },
  {
    id: 'screening',
    title: 'Screening',
    description: 'Initial screening',
    color: 'border-yellow-200 bg-yellow-50/50',
    icon: Users,
    count: 4
  },
  {
    id: 'interview',
    title: 'Interview',
    description: 'Interview scheduled',
    color: 'border-purple-200 bg-purple-50/50',
    icon: Calendar,
    count: 3
  },
  {
    id: 'offer',
    title: 'Offer',
    description: 'Offer received',
    color: 'border-green-200 bg-green-50/50',
    icon: CheckCircle,
    count: 2
  },
  {
    id: 'rejected',
    title: 'Rejected',
    description: 'Not selected',
    color: 'border-red-200 bg-red-50/50',
    icon: AlertCircle,
    count: 5
  }
]

// Mock job data
const initialJobs = {
  wishlist: [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      company: 'Emirates NBD',
      location: 'Dubai, UAE',
      salary: 'AED 15,000 - 20,000',
      type: 'Full-time',
      postedDate: '2 days ago',
      priority: 'high',
      tags: ['React', 'TypeScript', 'UAE National']
    },
    {
      id: '2',
      title: 'Product Manager',
      company: 'Careem',
      location: 'Dubai, UAE',
      salary: 'AED 18,000 - 25,000',
      type: 'Full-time',
      postedDate: '1 week ago',
      priority: 'medium',
      tags: ['Product', 'Strategy', 'Visa Sponsored']
    },
    {
      id: '3',
      title: 'DevOps Engineer',
      company: 'Talabat',
      location: 'Dubai, UAE',
      salary: 'AED 12,000 - 18,000',
      type: 'Full-time',
      postedDate: '3 days ago',
      priority: 'low',
      tags: ['AWS', 'Docker', 'Remote OK']
    }
  ],
  applied: [
    {
      id: '4',
      title: 'Full Stack Developer',
      company: 'Noon',
      location: 'Riyadh, Saudi Arabia',
      salary: 'AED 16,000 - 22,000',
      type: 'Full-time',
      appliedDate: '1 week ago',
      priority: 'high',
      tags: ['Node.js', 'React', 'Visa Sponsored']
    },
    {
      id: '5',
      title: 'Mobile Developer',
      company: 'Dubizzle',
      location: 'Dubai, UAE',
      salary: 'AED 14,000 - 19,000',
      type: 'Full-time',
      appliedDate: '3 days ago',
      priority: 'medium',
      tags: ['React Native', 'iOS', 'Android']
    }
  ],
  screening: [
    {
      id: '6',
      title: 'Senior React Developer',
      company: 'Mashreq Bank',
      location: 'Dubai, UAE',
      salary: 'AED 17,000 - 24,000',
      type: 'Full-time',
      interviewDate: 'Tomorrow 2 PM',
      priority: 'high',
      tags: ['React', 'Banking', 'UAE National']
    }
  ],
  interview: [
    {
      id: '7',
      title: 'Frontend Lead',
      company: 'ADCB',
      location: 'Abu Dhabi, UAE',
      salary: 'AED 20,000 - 28,000',
      type: 'Full-time',
      interviewDate: 'Today 3 PM',
      priority: 'high',
      tags: ['Leadership', 'React', 'Banking']
    }
  ],
  offer: [
    {
      id: '8',
      title: 'Software Engineer',
      company: 'Etisalat',
      location: 'Dubai, UAE',
      salary: 'AED 15,000 - 21,000',
      type: 'Full-time',
      offerDate: '2 days ago',
      priority: 'high',
      tags: ['Full Stack', 'Telecom', 'Benefits']
    }
  ],
  rejected: [
    {
      id: '9',
      title: 'Developer',
      company: 'Company X',
      location: 'Dubai, UAE',
      salary: 'AED 12,000 - 16,000',
      type: 'Full-time',
      rejectedDate: '1 week ago',
      priority: 'low',
      tags: ['Junior', 'Startup']
    }
  ]
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-500'
    case 'medium': return 'bg-yellow-500'
    case 'low': return 'bg-green-500'
    default: return 'bg-gray-500'
  }
}

const JobCard = ({ job, stageId }: { job: any; stageId: string }) => {
  const [isDragging, setIsDragging] = useState(false)

  return (
    <Card
      className={`p-4 cursor-move transition-all duration-200 hover:shadow-lg group ${
        isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
      } bg-background/80 backdrop-blur-sm border border-border/50 hover:border-primary/30`}
      draggable
      onDragStart={(e) => {
        setIsDragging(true)
        e.dataTransfer.setData('application/json', JSON.stringify({ job, sourceStage: stageId }))
      }}
      onDragEnd={() => setIsDragging(false)}
    >
      {/* Priority indicator */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${getPriorityColor(job.priority)}`} />
          <Badge variant="outline" className="text-xs">
            {job.type}
          </Badge>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem>
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Job Posting
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Job title and company */}
      <div className="mb-3">
        <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
          {job.title}
        </h3>
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          <Building className="h-3 w-3" />
          <span>{job.company}</span>
        </div>
      </div>

      {/* Location and salary */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center space-x-1 text-xs font-medium text-uae-green">
          <DollarSign className="h-3 w-3" />
          <span>{job.salary}</span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {job.tags?.slice(0, 2).map((tag: string) => (
          <Badge
            key={tag}
            variant="secondary"
            className="text-xs px-2 py-0 bg-primary/10 text-primary border-none"
          >
            {tag}
          </Badge>
        ))}
        {job.tags?.length > 2 && (
          <Badge variant="secondary" className="text-xs px-2 py-0">
            +{job.tags.length - 2}
          </Badge>
        )}
      </div>

      {/* Date info */}
      <div className="text-xs text-muted-foreground">
        {job.postedDate && (
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Posted {job.postedDate}</span>
          </div>
        )}
        {job.appliedDate && (
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Applied {job.appliedDate}</span>
          </div>
        )}
        {job.interviewDate && (
          <div className="flex items-center space-x-1 text-uae-red font-medium">
            <Calendar className="h-3 w-3" />
            <span>{job.interviewDate}</span>
          </div>
        )}
        {job.offerDate && (
          <div className="flex items-center space-x-1 text-uae-green font-medium">
            <CheckCircle className="h-3 w-3" />
            <span>Offer {job.offerDate}</span>
          </div>
        )}
      </div>
    </Card>
  )
}

const PipelineColumn = ({ 
  stage, 
  jobs, 
  onDrop, 
  onDragOver 
}: { 
  stage: any; 
  jobs: any[]; 
  onDrop: (e: React.DragEvent, stageId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const Icon = stage.icon

  return (
    <div className="flex-shrink-0 w-80">
      <Card
        className={`p-4 h-full bg-card/50 backdrop-blur-sm transition-all duration-200 ${
          isDragOver 
            ? 'border-primary/50 bg-primary/5 shadow-lg' 
            : 'border-border/30'
        }`}
        onDrop={(e) => {
          setIsDragOver(false)
          onDrop(e, stage.id)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
          onDragOver(e)
        }}
        onDragLeave={() => setIsDragOver(false)}
      >
        {/* Column Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stage.color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">{stage.title}</h2>
              <p className="text-xs text-muted-foreground">{stage.description}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {jobs.length}
          </Badge>
        </div>

        {/* Jobs */}
        <div className="space-y-3 min-h-[400px]">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} stageId={stage.id} />
          ))}
          
          {/* Add job button */}
          <Button
            variant="outline"
            className="w-full border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors py-8"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Job
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default function PipelinePage() {
  const [jobs, setJobs] = useState(initialJobs)
  const [searchTerm, setSearchTerm] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, targetStage: string) => {
    e.preventDefault()
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'))
      const { job, sourceStage } = data

      if (sourceStage === targetStage) return

      setJobs(prev => ({
        ...prev,
        [sourceStage]: prev[sourceStage as keyof typeof prev].filter((j: any) => j.id !== job.id),
        [targetStage]: [...(prev[targetStage as keyof typeof prev] || []), job]
      }))
    } catch (error) {
      console.error('Error handling drop:', error)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const actions = (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="sm">
        <Filter className="h-4 w-4 mr-2" />
        Filter
      </Button>
      <Button size="sm" className="bg-gradient-to-r from-uae-green to-uae-green/90 text-white">
        <Plus className="h-4 w-4 mr-2" />
        Add Job
      </Button>
    </div>
  )

  const totalJobs = Object.values(jobs).flat().length

  return (
    <DashboardLayout
      title="Job Pipeline"
      subtitle={`Track your ${totalJobs} job applications across different stages`}
      actions={actions}
    >
      {/* Search and filters */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search jobs, companies, or skills..."
              className="w-full pl-10 pr-4 py-2 border border-border/50 rounded-lg bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Pipeline Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex space-x-6 min-w-max">
          {stages.map((stage) => (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              jobs={jobs[stage.id as keyof typeof jobs] || []}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}