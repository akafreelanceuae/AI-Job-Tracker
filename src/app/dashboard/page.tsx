"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Briefcase, 
  TrendingUp, 
  Calendar, 
  Target, 
  Plus,
  ArrowUpRight,
  Clock,
  Building,
  MapPin,
  CheckCircle,
  AlertCircle,
  Eye,
  ExternalLink,
  Filter,
  MoreHorizontal
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import AnimatedCounter from '@/components/ui/animated-counter'
import LoadingSpinner, { LoadingDots } from '@/components/ui/loading-spinner'
import DashboardLayout from '@/components/layout/dashboard-layout'

// Mock data - in real app this would come from API
const stats = [
  {
    title: 'Total Applications',
    value: '24',
    change: '+12%',
    trend: 'up',
    icon: Briefcase,
    description: 'This month',
    color: 'uae-green'
  },
  {
    title: 'Response Rate',
    value: '67%',
    change: '+5%',
    trend: 'up',
    icon: TrendingUp,
    description: 'Above average',
    color: 'uae-gold'
  },
  {
    title: 'Interviews',
    value: '8',
    change: '+2',
    trend: 'up',
    icon: Calendar,
    description: 'This week',
    color: 'uae-red'
  },
  {
    title: 'Pipeline Value',
    value: 'AED 450K',
    change: '+18%',
    trend: 'up',
    icon: Target,
    description: 'Potential salary',
    color: 'uae-green'
  },
]

const recentJobs = [
  {
    id: 1,
    title: 'Senior React Developer',
    company: 'Emirates NBD',
    location: 'Dubai, UAE',
    salary: 'AED 15,000 - 20,000',
    status: 'Applied',
    appliedDate: '2 days ago',
    logo: '/api/placeholder/40/40',
    urgent: false
  },
  {
    id: 2,
    title: 'Full Stack Engineer',
    company: 'Careem',
    location: 'Dubai, UAE',
    salary: 'AED 18,000 - 25,000',
    status: 'Interview',
    appliedDate: '1 week ago',
    logo: '/api/placeholder/40/40',
    urgent: true
  },
  {
    id: 3,
    title: 'DevOps Engineer',
    company: 'Talabat',
    location: 'Dubai, UAE',
    salary: 'AED 12,000 - 18,000',
    status: 'Offer',
    appliedDate: '2 weeks ago',
    logo: '/api/placeholder/40/40',
    urgent: false
  },
  {
    id: 4,
    title: 'Product Manager',
    company: 'Noon',
    location: 'Riyadh, Saudi Arabia',
    salary: 'AED 20,000 - 30,000',
    status: 'Applied',
    appliedDate: '3 days ago',
    logo: '/api/placeholder/40/40',
    urgent: false
  },
]

const upcomingInterviews = [
  {
    id: 1,
    company: 'Emirates NBD',
    position: 'Senior React Developer',
    date: 'Today',
    time: '2:00 PM',
    type: 'Technical Interview',
    interviewer: 'Sarah Ahmed'
  },
  {
    id: 2,
    company: 'Careem',
    position: 'Full Stack Engineer',
    date: 'Tomorrow',
    time: '10:00 AM',
    type: 'HR Interview',
    interviewer: 'Ahmed Al-Rashid'
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Applied': return 'bg-blue-500/10 text-blue-600 border-blue-200'
    case 'Interview': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200'
    case 'Offer': return 'bg-green-500/10 text-green-600 border-green-200'
    case 'Rejected': return 'bg-red-500/10 text-red-600 border-red-200'
    default: return 'bg-gray-500/10 text-gray-600 border-gray-200'
  }
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const actions = (
    <>
      <Button size="sm" className="bg-gradient-to-r from-uae-green to-uae-green/90 hover:from-uae-green/90 hover:to-uae-green/80 text-white">
        <Plus className="h-4 w-4 mr-2" />
        Add Job
      </Button>
    </>
  )

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Welcome back! Here's what's happening with your job search."
      actions={actions}
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card
                key={stat.title}
                className={`p-6 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300 transform hover:scale-105 ${
                  mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-2">
                      <AnimatedCounter 
                        end={parseInt(stat.value.toString().replace(/[^0-9]/g, '')) || 0} 
                        suffix={stat.value.toString().includes('%') ? '%' : ''}
                        prefix={stat.value.toString().includes('AED') ? 'AED ' : ''}
                      />
                    </p>
                    <div className="flex items-center mt-2 group">
                      <span className={`text-sm font-medium transition-colors ${
                        stat.trend === 'up' ? 'text-green-600 group-hover:text-green-700' : 'text-red-600 group-hover:text-red-700'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-muted-foreground ml-2 group-hover:text-foreground transition-colors">{stat.description}</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 bg-${stat.color}/10 rounded-lg flex items-center justify-center group-hover:bg-${stat.color}/20 transition-all duration-300 group-hover:scale-110`}>
                    <Icon className={`h-6 w-6 text-${stat.color} transition-transform group-hover:scale-110`} />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Jobs */}
          <div className="lg:col-span-2">
            <Card className="p-6 glass-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Recent Applications</h2>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/30 hover:shadow-md hover:border-primary/30 transition-all duration-300 group transform hover:scale-[1.02]"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center">
                        <Building className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium group-hover:text-primary transition-colors">
                            {job.title}
                          </h3>
                          {job.urgent && (
                            <Badge variant="destructive" className="text-xs">
                              Urgent
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{job.company}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-muted-foreground flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {job.location}
                          </span>
                          <span className="text-xs font-medium text-uae-green">
                            {job.salary}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge
                          className={`text-xs ${getStatusColor(job.status)}`}
                        >
                          {job.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{job.appliedDate}</p>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary/10 hover:text-primary transform hover:scale-110"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar - Upcoming Interviews & Quick Actions */}
          <div className="space-y-6">
            {/* Upcoming Interviews */}
            <Card className="p-6 glass-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Upcoming Interviews</h2>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {upcomingInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="p-4 rounded-lg bg-gradient-to-r from-uae-green/5 to-uae-gold/5 border border-uae-green/20 hover:from-uae-green/10 hover:to-uae-gold/10 transition-all duration-300 transform hover:scale-105 hover:shadow-md group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm">{interview.company}</h3>
                      <Badge variant="outline" className="text-xs">
                        {interview.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {interview.position}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs">
                        <Clock className="h-3 w-3" />
                        <span>{interview.date} at {interview.time}</span>
                      </div>
                      <Button size="sm" variant="outline" className="h-6 text-xs hover:bg-primary hover:text-primary-foreground transition-all duration-300 transform hover:scale-110 pulse-primary">
                        <span className="group-hover:animate-pulse">Join</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button className="w-full mt-4" variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                View Calendar
              </Button>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 glass-card">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="h-4 w-4 mr-3" />
                  Add New Job Application
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="h-4 w-4 mr-3" />
                  View Analytics
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <Target className="h-4 w-4 mr-3" />
                  Update Pipeline
                </Button>
              </div>
            </Card>

            {/* Today's Focus */}
            <Card className="p-6 glass-card bg-gradient-to-br from-uae-green/5 to-uae-gold/5 border-uae-green/20">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-uae-green" />
                Today's Focus
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-uae-green rounded-full" />
                  <span className="text-sm">Prepare for Emirates NBD interview</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-uae-gold rounded-full" />
                  <span className="text-sm">Follow up on 3 applications</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-uae-red rounded-full" />
                  <span className="text-sm">Update CV with latest project</span>
                </div>
              </div>
              
              <Button className="w-full mt-4 bg-gradient-to-r from-uae-green to-uae-green/90 text-white" size="sm">
                Mark All Complete
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}