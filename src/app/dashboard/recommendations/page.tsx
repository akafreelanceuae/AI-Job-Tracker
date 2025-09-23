"use client"

import { useState, useEffect } from 'react'
import { 
  Brain,
  Sparkles,
  Target,
  TrendingUp,
  MapPin,
  Building,
  DollarSign,
  Clock,
  Zap,
  Heart,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Filter,
  Settings,
  RefreshCw,
  Star,
  Calendar,
  Users,
  Award,
  Lightbulb
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import DashboardLayout from '@/components/layout/dashboard-layout'
import AnimatedCounter from '@/components/ui/animated-counter'
import LoadingSpinner from '@/components/ui/loading-spinner'
import {
  AIJobRecommendationEngine,
  JobRecommendation,
  UserProfile,
  createUserProfileFromData,
  generateMockJobs
} from '@/lib/ai-recommendations'

// Mock user profile for demo
const mockUserProfile: UserProfile = {
  skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Python'],
  experience: 4,
  currentSalary: 12000,
  desiredSalary: 20000,
  preferredLocations: ['Dubai', 'Abu Dhabi'],
  jobTypes: ['Full-time'],
  visaStatus: 'sponsored',
  industries: ['Technology', 'Banking', 'E-commerce'],
  remotePreference: true,
  careerLevel: 'mid',
  education: ['Computer Science'],
  languages: ['English', 'Arabic'],
  certifications: ['AWS Certified']
}

interface RecommendationCardProps {
  recommendation: JobRecommendation
  onSave: (id: string) => void
  onApply: (id: string) => void
  isSaved: boolean
}

const RecommendationCard = ({ recommendation, onSave, onApply, isSaved }: RecommendationCardProps) => {
  const [showInsights, setShowInsights] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-yellow-600'
    if (score >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <Card className={`p-6 glass-card hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] group ${
      mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
    }`}>
      {/* Header with match score */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-uae-green to-uae-gold rounded-lg flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${getUrgencyColor(recommendation.urgency)}`} />
          </div>
          <div>
            <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
              {recommendation.title}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center">
              <Building className="h-3 w-3 mr-1" />
              {recommendation.company}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-2xl font-bold ${getMatchScoreColor(recommendation.matchScore)}`}>
            {mounted ? (
              <AnimatedCounter end={recommendation.matchScore} suffix="%" />
            ) : (
              <span>{recommendation.matchScore}%</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">AI Match</p>
        </div>
      </div>

      {/* Job details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>{recommendation.location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <DollarSign className="h-4 w-4 text-uae-green" />
            <span className="font-medium text-uae-green">{recommendation.salary}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{recommendation.postedDate}</span>
          </div>
        </div>

        {/* Skills match */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Skills Match:</span>
          <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-uae-green to-uae-gold transition-all duration-1000 ease-out"
              style={{ width: `${recommendation.skillsMatch}%` }}
            />
          </div>
          <span className="text-sm font-bold text-primary">{recommendation.skillsMatch}%</span>
        </div>

        {/* Match reasons */}
        <div className="space-y-2">
          {recommendation.matchReasons.slice(0, 3).map((reason, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div className="w-1.5 h-1.5 bg-uae-green rounded-full" />
              <span>{reason}</span>
            </div>
          ))}
        </div>

        {/* Quick indicators */}
        <div className="flex flex-wrap gap-2">
          {recommendation.visaSponsorship && (
            <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">
              <Users className="h-3 w-3 mr-1" />
              Visa Sponsored
            </Badge>
          )}
          {recommendation.remote && (
            <Badge className="bg-green-500/10 text-green-600 border-green-200">
              🏠 Remote
            </Badge>
          )}
          {recommendation.urgency === 'high' && (
            <Badge className="bg-red-500/10 text-red-600 border-red-200 pulse-primary">
              ⚡ Urgent
            </Badge>
          )}
        </div>
      </div>

      {/* AI Insights toggle */}
      <div className="border-t border-border/50 pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowInsights(!showInsights)}
          className="w-full justify-between hover:bg-primary/5 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <span>AI Insights & Tips</span>
          </div>
          <div className={`transform transition-transform ${showInsights ? 'rotate-180' : ''}`}>
            <TrendingUp className="h-4 w-4" />
          </div>
        </Button>

        {showInsights && (
          <div className="mt-4 space-y-4 animate-in slide-in-from-top duration-300">
            {/* Why good match */}
            <div>
              <h4 className="text-sm font-semibold text-green-600 flex items-center mb-2">
                <CheckCircle className="h-4 w-4 mr-1" />
                Why This Is a Great Match
              </h4>
              <ul className="space-y-1">
                {recommendation.aiInsights.whyGoodMatch.map((insight, index) => (
                  <li key={index} className="text-xs text-muted-foreground flex items-start space-x-2">
                    <div className="w-1 h-1 bg-green-500 rounded-full mt-1.5" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Potential concerns */}
            {recommendation.aiInsights.potentialConcerns.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-yellow-600 flex items-center mb-2">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Consider These Points
                </h4>
                <ul className="space-y-1">
                  {recommendation.aiInsights.potentialConcerns.map((concern, index) => (
                    <li key={index} className="text-xs text-muted-foreground flex items-start space-x-2">
                      <div className="w-1 h-1 bg-yellow-500 rounded-full mt-1.5" />
                      <span>{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Application tips */}
            <div>
              <h4 className="text-sm font-semibold text-blue-600 flex items-center mb-2">
                <Target className="h-4 w-4 mr-1" />
                Application Tips
              </h4>
              <ul className="space-y-1">
                {recommendation.aiInsights.applicationTips.map((tip, index) => (
                  <li key={index} className="text-xs text-muted-foreground flex items-start space-x-2">
                    <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Salary negotiation */}
            <div className="p-3 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/20">
              <h4 className="text-sm font-semibold text-primary flex items-center mb-1">
                <DollarSign className="h-4 w-4 mr-1" />
                Salary Insights
              </h4>
              <p className="text-xs text-muted-foreground">
                {recommendation.aiInsights.salaryNegotiation}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex space-x-3 mt-6">
        <Button
          onClick={() => onApply(recommendation.id)}
          className="flex-1 bg-gradient-to-r from-uae-green to-uae-green/90 text-white hover:from-uae-green/90 hover:to-uae-green/80 transform hover:scale-105 transition-all duration-300"
        >
          <Zap className="h-4 w-4 mr-2" />
          Apply Now
        </Button>
        
        <Button
          variant="outline"
          onClick={() => onSave(recommendation.id)}
          className={`${isSaved ? 'text-red-500 border-red-200 bg-red-50' : ''} hover:scale-110 transition-transform`}
        >
          <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="hover:scale-110 transition-transform"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadRecommendations()
  }, [])

  const loadRecommendations = async () => {
    setLoading(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const engine = new AIJobRecommendationEngine(mockUserProfile)
    const mockJobs = generateMockJobs()
    
    // Add more mock jobs for demo
    const additionalJobs = [
      {
        id: 'job-3',
        title: 'DevOps Engineer',
        company: 'Noon',
        location: 'Dubai, UAE',
        salary: 'AED 16,000 - 24,000',
        salaryMin: 16000,
        salaryMax: 24000,
        description: 'Join our DevOps team to scale our e-commerce platform',
        requirements: ['AWS', 'Docker', 'Kubernetes', '4+ years experience'],
        benefits: ['Health Insurance', 'Stock Options', 'Learning Budget'],
        visaSponsorship: true,
        uaeNational: false,
        remote: true,
        postedDate: '2024-01-12',
        jobType: 'Full-time',
        industry: 'E-commerce',
        experienceRequired: 4,
        skills: ['AWS', 'Docker', 'Kubernetes', 'Python', 'Terraform']
      },
      {
        id: 'job-4',
        title: 'Frontend Developer',
        company: 'Talabat',
        location: 'Dubai, UAE',
        salary: 'AED 12,000 - 18,000',
        salaryMin: 12000,
        salaryMax: 18000,
        description: 'Build amazing user experiences for food delivery platform',
        requirements: ['React', 'TypeScript', '3+ years experience'],
        benefits: ['Flexible Hours', 'Health Insurance', 'Free Meals'],
        visaSponsorship: true,
        uaeNational: false,
        remote: false,
        postedDate: '2024-01-08',
        jobType: 'Full-time',
        industry: 'Food Tech',
        experienceRequired: 3,
        skills: ['React', 'TypeScript', 'JavaScript', 'CSS', 'Redux']
      }
    ]
    
    const allJobs = [...mockJobs, ...additionalJobs]
    const recs = await engine.generateRecommendations(allJobs)
    
    setRecommendations(recs)
    setLoading(false)
  }

  const handleSave = (id: string) => {
    const newSaved = new Set(savedJobs)
    if (newSaved.has(id)) {
      newSaved.delete(id)
    } else {
      newSaved.add(id)
    }
    setSavedJobs(newSaved)
  }

  const handleApply = (id: string) => {
    // In real app, this would navigate to application form
    console.log('Applying to job:', id)
  }

  const actions = (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="sm">
        <Filter className="h-4 w-4 mr-2" />
        Filters
      </Button>
      <Button variant="outline" size="sm">
        <Settings className="h-4 w-4 mr-2" />
        Preferences
      </Button>
      <Button 
        size="sm" 
        onClick={loadRecommendations}
        disabled={loading}
        className="bg-gradient-to-r from-uae-green to-uae-green/90 text-white"
      >
        {loading ? (
          <LoadingSpinner size="sm" className="mr-2" />
        ) : (
          <RefreshCw className="h-4 w-4 mr-2" />
        )}
        Refresh
      </Button>
    </div>
  )

  if (loading) {
    return (
      <DashboardLayout
        title="AI Job Recommendations"
        subtitle="Finding the perfect matches for your profile..."
        actions={actions}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="relative">
              <LoadingSpinner size="lg" />
              <div className="absolute inset-0 animate-pulse">
                <Sparkles className="h-8 w-8 text-primary mx-auto" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold">AI is analyzing opportunities...</h3>
              <p className="text-muted-foreground">Matching your skills with UAE job market</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="AI Job Recommendations"
      subtitle={`${recommendations.length} personalized matches found for your profile`}
      actions={actions}
    >
      <div className="space-y-6">
        {/* AI Summary */}
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                AI Analysis Summary
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-green-600">Strong Matches: 2</p>
                  <p className="text-muted-foreground">90%+ compatibility</p>
                </div>
                <div>
                  <p className="font-medium text-yellow-600">Good Matches: 2</p>
                  <p className="text-muted-foreground">75-90% compatibility</p>
                </div>
                <div>
                  <p className="font-medium text-blue-600">Growth Opportunities: 1</p>
                  <p className="text-muted-foreground">Skill development potential</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Recommendations Grid */}
        <div className="grid gap-6">
          {recommendations.map((rec, index) => (
            <div
              key={rec.id}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <RecommendationCard
                recommendation={rec}
                onSave={handleSave}
                onApply={handleApply}
                isSaved={savedJobs.has(rec.id)}
              />
            </div>
          ))}
        </div>

        {recommendations.length === 0 && !loading && (
          <div className="text-center py-12">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No recommendations found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your preferences or check back later for new opportunities
            </p>
            <Button onClick={loadRecommendations}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Recommendations
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}