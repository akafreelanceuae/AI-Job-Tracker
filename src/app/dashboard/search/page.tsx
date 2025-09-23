"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  Search,
  Filter,
  X,
  ChevronDown,
  MapPin,
  Building,
  DollarSign,
  Clock,
  Zap,
  Star,
  TrendingUp,
  Users,
  Calendar,
  Briefcase,
  Target,
  BookOpen,
  Heart,
  ExternalLink,
  Settings,
  Save,
  RefreshCw,
  Sparkles,
  BarChart3,
  Tag,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import DashboardLayout from '@/components/layout/dashboard-layout'
import AnimatedCounter from '@/components/ui/animated-counter'
import LoadingSpinner from '@/components/ui/loading-spinner'
import {
  AdvancedJobSearchEngine,
  SearchFilters,
  SearchResult,
  SearchSuggestion,
  createDefaultFilters,
  getFilterStats
} from '@/lib/advanced-search'
import { generateMockJobs } from '@/lib/ai-recommendations'

// Extended mock jobs for better search demo
const generateExtendedMockJobs = () => {
  const baseJobs = generateMockJobs()
  
  const additionalJobs = [
    {
      id: 'job-3',
      title: 'DevOps Engineer',
      company: 'Noon',
      location: 'Dubai, UAE',
      salary: 'AED 16,000 - 24,000',
      salaryMin: 16000,
      salaryMax: 24000,
      description: 'Join our DevOps team to scale our e-commerce platform across the Middle East',
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
      description: 'Build amazing user experiences for our food delivery platform',
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
    },
    {
      id: 'job-5',
      title: 'Product Manager',
      company: 'Mashreq Bank',
      location: 'Dubai, UAE',
      salary: 'AED 20,000 - 30,000',
      salaryMin: 20000,
      salaryMax: 30000,
      description: 'Lead digital banking product development in one of UAE\'s leading banks',
      requirements: ['Product Management', 'Agile', '5+ years experience'],
      benefits: ['Bank Benefits', 'Annual Bonus', 'Health Insurance'],
      visaSponsorship: true,
      uaeNational: true,
      remote: false,
      postedDate: '2024-01-05',
      jobType: 'Full-time',
      industry: 'Banking',
      experienceRequired: 5,
      skills: ['Product Management', 'Agile', 'Scrum', 'Analytics', 'SQL']
    },
    {
      id: 'job-6',
      title: 'Data Scientist',
      company: 'ADCB',
      location: 'Abu Dhabi, UAE',
      salary: 'AED 18,000 - 26,000',
      salaryMin: 18000,
      salaryMax: 26000,
      description: 'Drive data-driven decisions in retail banking and wealth management',
      requirements: ['Python', 'Machine Learning', 'SQL', '4+ years experience'],
      benefits: ['Health Insurance', 'Training Budget', 'Bank Benefits'],
      visaSponsorship: true,
      uaeNational: false,
      remote: true,
      postedDate: '2024-01-03',
      jobType: 'Full-time',
      industry: 'Banking',
      experienceRequired: 4,
      skills: ['Python', 'Machine Learning', 'SQL', 'Tableau', 'AWS']
    },
    {
      id: 'job-7',
      title: 'Mobile Developer',
      company: 'Etisalat',
      location: 'Dubai, UAE',
      salary: 'AED 14,000 - 20,000',
      salaryMin: 14000,
      salaryMax: 20000,
      description: 'Develop cutting-edge mobile applications for telecom services',
      requirements: ['React Native', 'iOS', 'Android', '3+ years experience'],
      benefits: ['Health Insurance', 'Mobile Benefits', 'Training'],
      visaSponsorship: false,
      uaeNational: true,
      remote: false,
      postedDate: '2024-01-01',
      jobType: 'Full-time',
      industry: 'Telecommunications',
      experienceRequired: 3,
      skills: ['React Native', 'iOS', 'Android', 'JavaScript', 'Swift']
    },
    {
      id: 'job-8',
      title: 'UI/UX Designer',
      company: 'Careem',
      location: 'Dubai, UAE',
      salary: 'AED 15,000 - 22,000',
      salaryMin: 15000,
      salaryMax: 22000,
      description: 'Design intuitive experiences for millions of users across the region',
      requirements: ['Figma', 'UI/UX Design', 'User Research', '4+ years experience'],
      benefits: ['Stock Options', 'Health Insurance', 'Design Budget'],
      visaSponsorship: true,
      uaeNational: false,
      remote: true,
      postedDate: '2023-12-28',
      jobType: 'Full-time',
      industry: 'Technology',
      experienceRequired: 4,
      skills: ['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping', 'Design Systems']
    }
  ]
  
  return [...baseJobs, ...additionalJobs]
}

interface AutocompleteProps {
  value: string
  onChange: (value: string) => void
  suggestions: SearchSuggestion[]
  placeholder: string
  icon?: any
}

const Autocomplete = ({ value, onChange, suggestions, placeholder, icon: Icon }: AutocompleteProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      onChange(suggestions[selectedIndex].value)
      setShowSuggestions(false)
      setSelectedIndex(-1)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setSelectedIndex(-1)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'skill': return <Tag className="h-3 w-3" />
      case 'company': return <Building className="h-3 w-3" />
      case 'location': return <MapPin className="h-3 w-3" />
      case 'title': return <Briefcase className="h-3 w-3" />
      default: return <Search className="h-3 w-3" />
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border border-border/50 rounded-lg bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors`}
        />
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-background border border-border/50 rounded-lg shadow-xl backdrop-blur-xl max-h-64 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.type}-${suggestion.value}`}
              className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                index === selectedIndex ? 'bg-primary/10' : 'hover:bg-muted/50'
              }`}
              onClick={() => {
                onChange(suggestion.value)
                setShowSuggestions(false)
                setSelectedIndex(-1)
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="text-muted-foreground">
                  {getTypeIcon(suggestion.type)}
                </div>
                <div>
                  <p className="font-medium text-sm">{suggestion.value}</p>
                  <p className="text-xs text-muted-foreground capitalize">{suggestion.type}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {suggestion.popular && (
                  <Badge className="text-xs bg-primary/10 text-primary border-none">Popular</Badge>
                )}
                {suggestion.count !== undefined && (
                  <span className="text-xs text-muted-foreground">{suggestion.count}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface FilterChipProps {
  label: string
  onRemove: () => void
  color?: string
}

const FilterChip = ({ label, onRemove, color = 'bg-primary/10 text-primary' }: FilterChipProps) => (
  <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${color} border-none`}>
    <span>{label}</span>
    <button
      onClick={onRemove}
      className="hover:bg-current/20 rounded-full p-0.5 transition-colors"
    >
      <X className="h-3 w-3" />
    </button>
  </div>
)

interface JobResultCardProps {
  result: SearchResult
  onSave: (id: string) => void
  onApply: (id: string) => void
  isSaved: boolean
}

const JobResultCard = ({ result, onSave, onApply, isSaved }: JobResultCardProps) => {
  const { job, relevanceScore } = result

  return (
    <Card className="p-6 glass-card hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01] group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 
                className="text-lg font-bold group-hover:text-primary transition-colors cursor-pointer"
                dangerouslySetInnerHTML={{ __html: result.highlightedTitle }}
              />
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                <Building className="h-3 w-3" />
                <span>{job.company}</span>
                <span>•</span>
                <MapPin className="h-3 w-3" />
                <span>{job.location}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-green-600">
                {relevanceScore}% match
              </div>
              <Clock className="h-3 w-3 text-muted-foreground mt-1" />
            </div>
          </div>

          <div className="flex items-center space-x-4 mb-3">
            <div className="flex items-center space-x-1 text-sm">
              <DollarSign className="h-4 w-4 text-uae-green" />
              <span className="font-medium text-uae-green">{job.salary}</span>
            </div>
            <Badge variant="outline" className="text-xs">{job.jobType}</Badge>
            {job.visaSponsorship && (
              <Badge className="bg-blue-500/10 text-blue-600 border-blue-200 text-xs">
                Visa Sponsored
              </Badge>
            )}
            {job.remote && (
              <Badge className="bg-green-500/10 text-green-600 border-green-200 text-xs">
                Remote
              </Badge>
            )}
          </div>

          <p 
            className="text-sm text-muted-foreground mb-3 line-clamp-2"
            dangerouslySetInnerHTML={{ __html: result.highlightedDescription }}
          />

          <div className="flex flex-wrap gap-1 mb-4">
            {job.skills.slice(0, 4).map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="text-xs px-2 py-1 bg-muted/50 text-foreground border-none"
              >
                {skill}
              </Badge>
            ))}
            {job.skills.length > 4 && (
              <Badge variant="secondary" className="text-xs px-2 py-1">
                +{job.skills.length - 4} more
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Posted {job.postedDate}</span>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSave(job.id)}
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

          <Button
            onClick={() => onApply(job.id)}
            size="sm"
            className="bg-gradient-to-r from-uae-green to-uae-green/90 text-white hover:from-uae-green/90 hover:to-uae-green/80 transform hover:scale-105 transition-all duration-300"
          >
            <Zap className="h-4 w-4 mr-1" />
            Apply
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default function SearchPage() {
  const [filters, setFilters] = useState<SearchFilters>(createDefaultFilters())
  const [results, setResults] = useState<SearchResult[]>([])
  const [searchEngine, setSearchEngine] = useState<AdvancedJobSearchEngine | null>(null)
  const [loading, setLoading] = useState(true)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    initializeSearch()
  }, [])

  const initializeSearch = async () => {
    setLoading(true)
    
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mockJobs = generateExtendedMockJobs()
    const engine = new AdvancedJobSearchEngine(mockJobs)
    setSearchEngine(engine)
    
    // Initial search with empty filters
    const initialResults = engine.search(filters)
    setResults(initialResults)
    setLoading(false)
  }

  const performSearch = useCallback(() => {
    if (!searchEngine) return
    
    const searchResults = searchEngine.search(filters)
    setResults(searchResults)
  }, [searchEngine, filters])

  useEffect(() => {
    performSearch()
  }, [performSearch])

  const handleQueryChange = (query: string) => {
    setFilters(prev => ({ ...prev, query }))
    
    if (searchEngine && query.trim()) {
      const newSuggestions = searchEngine.getSuggestions(query)
      setSuggestions(newSuggestions)
    } else {
      setSuggestions([])
    }
  }

  const addFilter = (type: keyof SearchFilters, value: any) => {
    setFilters(prev => {
      const currentValue = prev[type]
      if (Array.isArray(currentValue)) {
        return {
          ...prev,
          [type]: [...currentValue, value]
        }
      }
      return prev
    })
  }

  const removeFilter = (type: keyof SearchFilters, value?: any) => {
    setFilters(prev => {
      if (value !== undefined && Array.isArray(prev[type])) {
        return {
          ...prev,
          [type]: (prev[type] as any[]).filter(v => v !== value)
        }
      } else {
        return {
          ...prev,
          [type]: Array.isArray(prev[type]) ? [] : undefined
        }
      }
    })
  }

  const clearAllFilters = () => {
    setFilters(createDefaultFilters())
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
    console.log('Applying to job:', id)
  }

  const stats = getFilterStats(results)

  const actions = (
    <div className="flex items-center space-x-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setShowFilters(!showFilters)}
      >
        <Filter className="h-4 w-4 mr-2" />
        Filters
        {Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : v) && (
          <Badge className="ml-2 bg-primary text-primary-foreground text-xs">
            {Object.values(filters).reduce((count, v) => 
              count + (Array.isArray(v) ? v.length : v ? 1 : 0), 0
            )}
          </Badge>
        )}
      </Button>
      <Button variant="outline" size="sm">
        <Save className="h-4 w-4 mr-2" />
        Save Search
      </Button>
      <Button 
        size="sm" 
        onClick={initializeSearch}
        className="bg-gradient-to-r from-uae-green to-uae-green/90 text-white"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh
      </Button>
    </div>
  )

  if (loading) {
    return (
      <DashboardLayout
        title="Job Search"
        subtitle="Loading job database..."
        actions={actions}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <div>
              <h3 className="text-lg font-semibold">Preparing search engine...</h3>
              <p className="text-muted-foreground">Indexing UAE job market</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Advanced Job Search"
      subtitle={`${results.length} jobs found${filters.query ? ` for "${filters.query}"` : ''}`}
      actions={actions}
    >
      <div className="space-y-6">
        {/* Search Bar */}
        <Card className="p-6 glass-card">
          <div className="space-y-4">
            <Autocomplete
              value={filters.query}
              onChange={handleQueryChange}
              suggestions={suggestions}
              placeholder="Search jobs, companies, skills... (e.g., React Developer, Emirates NBD, Dubai)"
              icon={Search}
            />

            {/* Active Filters */}
            {(filters.locations.length > 0 || filters.skills.length > 0 || filters.companies.length > 0 || 
              filters.salaryMin || filters.salaryMax || filters.visaSponsorship !== undefined) && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                
                {filters.locations.map(location => (
                  <FilterChip
                    key={location}
                    label={`📍 ${location}`}
                    onRemove={() => removeFilter('locations', location)}
                  />
                ))}
                
                {filters.skills.map(skill => (
                  <FilterChip
                    key={skill}
                    label={`🛠️ ${skill}`}
                    onRemove={() => removeFilter('skills', skill)}
                    color="bg-blue-500/10 text-blue-600"
                  />
                ))}
                
                {filters.companies.map(company => (
                  <FilterChip
                    key={company}
                    label={`🏢 ${company}`}
                    onRemove={() => removeFilter('companies', company)}
                    color="bg-green-500/10 text-green-600"
                  />
                ))}

                {filters.visaSponsorship !== undefined && (
                  <FilterChip
                    label="🛂 Visa Sponsored"
                    onRemove={() => removeFilter('visaSponsorship')}
                    color="bg-purple-500/10 text-purple-600"
                  />
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Search Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center glass-card">
            <div className="text-2xl font-bold text-primary mb-1">
              {mounted ? (
                <AnimatedCounter end={stats.totalJobs} />
              ) : (
                <span>{stats.totalJobs}</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Jobs Found</p>
          </Card>
          
          <Card className="p-4 text-center glass-card">
            <div className="text-2xl font-bold text-uae-green mb-1">
              {mounted ? (
                <AnimatedCounter 
                  end={Math.round(stats.averageSalary)} 
                  prefix="AED "
                  suffix="K"
                />
              ) : (
                <span>AED {Math.round(stats.averageSalary)}K</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Avg Salary</p>
          </Card>
          
          <Card className="p-4 text-center glass-card">
            <div className="text-2xl font-bold text-uae-gold mb-1">
              {stats.topSkills[0]?.skill || 'N/A'}
            </div>
            <p className="text-sm text-muted-foreground">Top Skill</p>
          </Card>
          
          <Card className="p-4 text-center glass-card">
            <div className="text-2xl font-bold text-uae-red mb-1">
              {stats.locationBreakdown[0]?.location || 'N/A'}
            </div>
            <p className="text-sm text-muted-foreground">Top Location</p>
          </Card>
        </div>

        {/* Results */}
        <div className="grid gap-6">
          {results.map((result, index) => (
            <div
              key={result.job.id}
              className={`transition-all duration-300 ${
                mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <JobResultCard
                result={result}
                onSave={handleSave}
                onApply={handleApply}
                isSaved={savedJobs.has(result.job.id)}
              />
            </div>
          ))}
        </div>

        {results.length === 0 && !loading && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or filters to find more opportunities
            </p>
            <Button onClick={clearAllFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}