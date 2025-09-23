import { JobPosting } from './ai-recommendations'

export interface SearchFilters {
  query: string
  salaryMin?: number
  salaryMax?: number
  locations: string[]
  skills: string[]
  companies: string[]
  jobTypes: string[]
  experienceLevel: string[]
  visaSponsorship?: boolean
  remoteWork?: boolean
  uaeNational?: boolean
  industries: string[]
  postedWithin: string // 'today', 'week', 'month', 'all'
  sortBy: 'relevance' | 'salary' | 'date' | 'company'
  sortOrder: 'asc' | 'desc'
}

export interface SearchResult {
  job: JobPosting
  relevanceScore: number
  matchedFields: string[]
  highlightedTitle: string
  highlightedDescription: string
}

export interface SearchSuggestion {
  type: 'skill' | 'company' | 'location' | 'title'
  value: string
  count?: number
  popular?: boolean
}

export interface SavedSearch {
  id: string
  name: string
  filters: SearchFilters
  alertsEnabled: boolean
  createdAt: string
  lastUsed: string
  resultCount?: number
}

// UAE-specific search data
const UAE_SEARCH_DATA = {
  popularSkills: [
    'React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'Java', 'AWS', 'Docker',
    'Kubernetes', 'Angular', 'Vue.js', 'PHP', 'Laravel', 'MySQL', 'PostgreSQL',
    'MongoDB', 'Redis', 'GraphQL', 'REST API', 'Microservices', 'DevOps', 'CI/CD',
    'Terraform', 'Jenkins', 'Git', 'Agile', 'Scrum', 'Product Management', 'UI/UX',
    'Figma', 'Adobe Creative Suite', 'Data Science', 'Machine Learning', 'SQL',
    'Tableau', 'Power BI', 'Excel', 'SAP', 'Oracle', 'Salesforce', 'Azure'
  ],
  
  popularCompanies: [
    'Emirates NBD', 'ADCB', 'FAB', 'Mashreq Bank', 'CBD', 'HSBC UAE',
    'Careem', 'Noon', 'Talabat', 'Deliveroo', 'Uber', 'Amazon', 'Microsoft UAE',
    'Google UAE', 'Meta UAE', 'Apple UAE', 'Etisalat', 'du', 'Aramex',
    'DP World', 'Emirates', 'Flydubai', 'ADNOC', 'Mubadala', 'ADIA',
    'Dubai Holdings', 'Emaar', 'Majid Al Futtaim', 'Chalhoub Group'
  ],
  
  locations: [
    'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain',
    'Dubai Marina', 'Downtown Dubai', 'DIFC', 'Dubai Internet City', 'Dubai Media City',
    'Dubai Silicon Oasis', 'Jumeirah', 'Deira', 'Bur Dubai', 'Business Bay',
    'Abu Dhabi Global Market', 'Al Ain', 'Masdar City', 'Yas Island',
    'Dubai South', 'Al Barsha', 'Sheikh Zayed Road', 'Karama', 'Satwa'
  ],
  
  industries: [
    'Technology', 'Banking & Finance', 'E-commerce', 'Real Estate', 'Healthcare',
    'Education', 'Hospitality & Tourism', 'Aviation', 'Oil & Gas', 'Construction',
    'Retail', 'Telecommunications', 'Media & Entertainment', 'Automotive',
    'Food & Beverage', 'Consulting', 'Government', 'Logistics', 'Manufacturing'
  ],

  jobTitles: [
    'Software Engineer', 'Senior Developer', 'Full Stack Developer', 'Frontend Developer',
    'Backend Developer', 'DevOps Engineer', 'Data Scientist', 'Product Manager',
    'UI/UX Designer', 'Project Manager', 'Business Analyst', 'QA Engineer',
    'Mobile Developer', 'Cloud Architect', 'Technical Lead', 'Engineering Manager',
    'Scrum Master', 'Data Analyst', 'Marketing Manager', 'Sales Manager',
    'HR Manager', 'Finance Manager', 'Operations Manager', 'Consultant'
  ]
}

// Advanced search engine class
export class AdvancedJobSearchEngine {
  private jobs: JobPosting[]
  private searchIndex: Map<string, Set<string>> = new Map()
  
  constructor(jobs: JobPosting[]) {
    this.jobs = jobs
    this.buildSearchIndex()
  }

  // Build inverted index for fast searching
  private buildSearchIndex() {
    this.jobs.forEach(job => {
      const searchableText = [
        job.title,
        job.company,
        job.location,
        job.description,
        ...job.skills,
        ...job.requirements,
        job.industry,
        job.jobType
      ].join(' ').toLowerCase()

      // Tokenize and index
      const words = searchableText.match(/\w+/g) || []
      words.forEach(word => {
        if (!this.searchIndex.has(word)) {
          this.searchIndex.set(word, new Set())
        }
        this.searchIndex.get(word)!.add(job.id)
      })
    })
  }

  // Main search function
  search(filters: SearchFilters): SearchResult[] {
    let results = this.jobs.map(job => ({
      job,
      relevanceScore: 0,
      matchedFields: [],
      highlightedTitle: job.title,
      highlightedDescription: job.description
    }))

    // Apply text search
    if (filters.query.trim()) {
      results = this.applyTextSearch(results, filters.query)
    }

    // Apply filters
    results = this.applyFilters(results, filters)

    // Calculate relevance scores
    results = results.map(result => ({
      ...result,
      relevanceScore: this.calculateRelevanceScore(result.job, filters)
    }))

    // Sort results
    results = this.sortResults(results, filters.sortBy, filters.sortOrder)

    // Apply highlighting
    results = results.map(result => ({
      ...result,
      highlightedTitle: this.highlightText(result.job.title, filters.query),
      highlightedDescription: this.highlightText(result.job.description, filters.query)
    }))

    return results
  }

  // Text search with fuzzy matching
  private applyTextSearch(results: SearchResult[], query: string): SearchResult[] {
    if (!query.trim()) return results

    const queryWords = query.toLowerCase().match(/\w+/g) || []
    const matchingJobIds = new Set<string>()

    queryWords.forEach(word => {
      // Exact matches
      if (this.searchIndex.has(word)) {
        this.searchIndex.get(word)!.forEach(jobId => matchingJobIds.add(jobId))
      }

      // Fuzzy matches (starts with)
      Array.from(this.searchIndex.keys())
        .filter(indexWord => indexWord.startsWith(word) || word.startsWith(indexWord))
        .forEach(matchWord => {
          this.searchIndex.get(matchWord)!.forEach(jobId => matchingJobIds.add(jobId))
        })
    })

    return results.filter(result => matchingJobIds.has(result.job.id))
  }

  // Apply all filters
  private applyFilters(results: SearchResult[], filters: SearchFilters): SearchResult[] {
    return results.filter(result => {
      const job = result.job

      // Salary filter
      if (filters.salaryMin && job.salaryMin && job.salaryMin < filters.salaryMin) return false
      if (filters.salaryMax && job.salaryMax && job.salaryMax > filters.salaryMax) return false

      // Location filter
      if (filters.locations.length > 0) {
        const hasLocationMatch = filters.locations.some(loc => 
          job.location.toLowerCase().includes(loc.toLowerCase())
        )
        if (!hasLocationMatch) return false
      }

      // Skills filter
      if (filters.skills.length > 0) {
        const hasSkillMatch = filters.skills.some(skill =>
          job.skills.some(jobSkill => 
            jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(jobSkill.toLowerCase())
          )
        )
        if (!hasSkillMatch) return false
      }

      // Companies filter
      if (filters.companies.length > 0) {
        const hasCompanyMatch = filters.companies.some(company =>
          job.company.toLowerCase().includes(company.toLowerCase())
        )
        if (!hasCompanyMatch) return false
      }

      // Job types filter
      if (filters.jobTypes.length > 0) {
        if (!filters.jobTypes.includes(job.jobType)) return false
      }

      // Experience level filter (simplified)
      if (filters.experienceLevel.length > 0) {
        const jobLevel = this.getExperienceLevel(job.experienceRequired)
        if (!filters.experienceLevel.includes(jobLevel)) return false
      }

      // Boolean filters
      if (filters.visaSponsorship !== undefined && job.visaSponsorship !== filters.visaSponsorship) return false
      if (filters.remoteWork !== undefined && job.remote !== filters.remoteWork) return false
      if (filters.uaeNational !== undefined && job.uaeNational !== filters.uaeNational) return false

      // Industries filter
      if (filters.industries.length > 0) {
        if (!filters.industries.includes(job.industry)) return false
      }

      // Posted date filter
      if (filters.postedWithin !== 'all') {
        const daysAgo = this.getDaysAgo(job.postedDate)
        switch (filters.postedWithin) {
          case 'today': if (daysAgo > 1) return false; break
          case 'week': if (daysAgo > 7) return false; break
          case 'month': if (daysAgo > 30) return false; break
        }
      }

      return true
    })
  }

  // Calculate relevance score
  private calculateRelevanceScore(job: JobPosting, filters: SearchFilters): number {
    let score = 0

    // Query relevance
    if (filters.query.trim()) {
      const queryWords = filters.query.toLowerCase().match(/\w+/g) || []
      const jobText = [job.title, job.company, job.description].join(' ').toLowerCase()
      
      queryWords.forEach(word => {
        if (job.title.toLowerCase().includes(word)) score += 20
        if (job.company.toLowerCase().includes(word)) score += 15
        if (job.description.toLowerCase().includes(word)) score += 10
        if (job.skills.some(skill => skill.toLowerCase().includes(word))) score += 25
      })
    }

    // Skills match bonus
    if (filters.skills.length > 0) {
      const matchingSkills = filters.skills.filter(skill =>
        job.skills.some(jobSkill => 
          jobSkill.toLowerCase().includes(skill.toLowerCase())
        )
      )
      score += (matchingSkills.length / filters.skills.length) * 30
    }

    // Recency bonus
    const daysAgo = this.getDaysAgo(job.postedDate)
    if (daysAgo <= 7) score += 10
    else if (daysAgo <= 30) score += 5

    // Company popularity bonus
    if (UAE_SEARCH_DATA.popularCompanies.includes(job.company)) {
      score += 15
    }

    return Math.min(score, 100) // Cap at 100
  }

  // Sort results
  private sortResults(results: SearchResult[], sortBy: string, order: string): SearchResult[] {
    return results.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'relevance':
          comparison = b.relevanceScore - a.relevanceScore
          break
        case 'salary':
          const salaryA = a.job.salaryMax || a.job.salaryMin || 0
          const salaryB = b.job.salaryMax || b.job.salaryMin || 0
          comparison = salaryB - salaryA
          break
        case 'date':
          comparison = new Date(b.job.postedDate).getTime() - new Date(a.job.postedDate).getTime()
          break
        case 'company':
          comparison = a.job.company.localeCompare(b.job.company)
          break
      }

      return order === 'desc' ? comparison : -comparison
    })
  }

  // Highlight matching text
  private highlightText(text: string, query: string): string {
    if (!query.trim()) return text

    const queryWords = query.match(/\w+/g) || []
    let highlighted = text

    queryWords.forEach(word => {
      const regex = new RegExp(`\\b(${word})\\b`, 'gi')
      highlighted = highlighted.replace(regex, '<mark class="bg-primary/20 text-primary">$1</mark>')
    })

    return highlighted
  }

  // Get suggestions for autocomplete
  getSuggestions(input: string, type?: string): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = []
    const inputLower = input.toLowerCase()

    if (!type || type === 'skill') {
      UAE_SEARCH_DATA.popularSkills
        .filter(skill => skill.toLowerCase().includes(inputLower))
        .slice(0, 5)
        .forEach(skill => {
          suggestions.push({
            type: 'skill',
            value: skill,
            popular: true,
            count: this.getSkillCount(skill)
          })
        })
    }

    if (!type || type === 'company') {
      UAE_SEARCH_DATA.popularCompanies
        .filter(company => company.toLowerCase().includes(inputLower))
        .slice(0, 5)
        .forEach(company => {
          suggestions.push({
            type: 'company',
            value: company,
            popular: true,
            count: this.getCompanyCount(company)
          })
        })
    }

    if (!type || type === 'location') {
      UAE_SEARCH_DATA.locations
        .filter(location => location.toLowerCase().includes(inputLower))
        .slice(0, 5)
        .forEach(location => {
          suggestions.push({
            type: 'location',
            value: location,
            count: this.getLocationCount(location)
          })
        })
    }

    if (!type || type === 'title') {
      UAE_SEARCH_DATA.jobTitles
        .filter(title => title.toLowerCase().includes(inputLower))
        .slice(0, 5)
        .forEach(title => {
          suggestions.push({
            type: 'title',
            value: title,
            count: this.getTitleCount(title)
          })
        })
    }

    return suggestions.sort((a, b) => (b.count || 0) - (a.count || 0))
  }

  // Helper methods
  private getExperienceLevel(years: number): string {
    if (years <= 1) return 'Entry'
    if (years <= 3) return 'Junior'
    if (years <= 6) return 'Mid'
    if (years <= 10) return 'Senior'
    return 'Executive'
  }

  private getDaysAgo(dateString: string): number {
    const posted = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - posted.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  private getSkillCount(skill: string): number {
    return this.jobs.filter(job => 
      job.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
    ).length
  }

  private getCompanyCount(company: string): number {
    return this.jobs.filter(job => 
      job.company.toLowerCase().includes(company.toLowerCase())
    ).length
  }

  private getLocationCount(location: string): number {
    return this.jobs.filter(job => 
      job.location.toLowerCase().includes(location.toLowerCase())
    ).length
  }

  private getTitleCount(title: string): number {
    return this.jobs.filter(job => 
      job.title.toLowerCase().includes(title.toLowerCase())
    ).length
  }
}

// Export utility functions
export function createDefaultFilters(): SearchFilters {
  return {
    query: '',
    locations: [],
    skills: [],
    companies: [],
    jobTypes: [],
    experienceLevel: [],
    industries: [],
    postedWithin: 'all',
    sortBy: 'relevance',
    sortOrder: 'desc'
  }
}

export function getFilterStats(results: SearchResult[]): {
  totalJobs: number
  averageSalary: number
  topSkills: { skill: string; count: number }[]
  topCompanies: { company: string; count: number }[]
  locationBreakdown: { location: string; count: number }[]
} {
  const totalJobs = results.length
  
  // Calculate average salary
  const salaries = results
    .map(r => r.job.salaryMax || r.job.salaryMin || 0)
    .filter(s => s > 0)
  const averageSalary = salaries.length > 0 
    ? salaries.reduce((sum, s) => sum + s, 0) / salaries.length 
    : 0

  // Count skills
  const skillCounts = new Map<string, number>()
  results.forEach(r => {
    r.job.skills.forEach(skill => {
      skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1)
    })
  })
  const topSkills = Array.from(skillCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill, count]) => ({ skill, count }))

  // Count companies
  const companyCounts = new Map<string, number>()
  results.forEach(r => {
    companyCounts.set(r.job.company, (companyCounts.get(r.job.company) || 0) + 1)
  })
  const topCompanies = Array.from(companyCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([company, count]) => ({ company, count }))

  // Location breakdown
  const locationCounts = new Map<string, number>()
  results.forEach(r => {
    const city = r.job.location.split(',')[0] // Extract city
    locationCounts.set(city, (locationCounts.get(city) || 0) + 1)
  })
  const locationBreakdown = Array.from(locationCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([location, count]) => ({ location, count }))

  return {
    totalJobs,
    averageSalary,
    topSkills,
    topCompanies,
    locationBreakdown
  }
}