import { OpenAI } from 'openai'

// Mock OpenAI for development - replace with real API key in production
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'mock-api-key',
})

export interface JobRecommendation {
  id: string
  title: string
  company: string
  location: string
  salary: string
  description: string
  requirements: string[]
  benefits: string[]
  matchScore: number
  matchReasons: string[]
  salaryMatch: boolean
  locationMatch: boolean
  skillsMatch: number
  experienceMatch: boolean
  visaSponsorship: boolean
  uaeNational: boolean
  remote: boolean
  postedDate: string
  urgency: 'low' | 'medium' | 'high'
  aiInsights: {
    whyGoodMatch: string[]
    potentialConcerns: string[]
    applicationTips: string[]
    salaryNegotiation: string
  }
}

export interface UserProfile {
  skills: string[]
  experience: number
  currentSalary?: number
  desiredSalary?: number
  preferredLocations: string[]
  jobTypes: string[]
  visaStatus: 'sponsored' | 'uae_national' | 'visit_visa' | 'dependent'
  industries: string[]
  remotePreference: boolean
  careerLevel: 'entry' | 'mid' | 'senior' | 'executive'
  education: string[]
  languages: string[]
  certifications: string[]
}

export interface JobPosting {
  id: string
  title: string
  company: string
  location: string
  salary?: string
  salaryMin?: number
  salaryMax?: number
  description: string
  requirements: string[]
  benefits: string[]
  visaSponsorship: boolean
  uaeNational: boolean
  remote: boolean
  postedDate: string
  jobType: string
  industry: string
  experienceRequired: number
  skills: string[]
}

// UAE-specific job market data
const UAE_MARKET_DATA = {
  popularCompanies: ['Emirates NBD', 'ADCB', 'Careem', 'Talabat', 'Noon', 'Mashreq', 'FAB', 'Etisalat', 'Du', 'Aramex'],
  techHubs: ['Dubai Internet City', 'Abu Dhabi Global Market', 'Dubai Silicon Oasis', 'ADGM'],
  salaryBenchmarks: {
    'Software Engineer': { min: 8000, max: 25000, median: 15000 },
    'Senior Developer': { min: 15000, max: 35000, median: 22000 },
    'Product Manager': { min: 18000, max: 40000, median: 28000 },
    'DevOps Engineer': { min: 12000, max: 30000, median: 18000 },
    'Data Scientist': { min: 15000, max: 35000, median: 23000 },
  },
  visaFriendlyCompanies: ['Careem', 'Noon', 'Talabat', 'Mashreq Bank', 'Emirates NBD'],
  remoteWorkCompanies: ['Careem', 'Talabat', 'Remote Year', 'GitLab', 'Automattic']
}

// Advanced matching algorithms
export class AIJobRecommendationEngine {
  private userProfile: UserProfile
  
  constructor(userProfile: UserProfile) {
    this.userProfile = userProfile
  }

  // Main recommendation function
  async generateRecommendations(availableJobs: JobPosting[]): Promise<JobRecommendation[]> {
    const scoredJobs = await Promise.all(
      availableJobs.map(job => this.scoreJobMatch(job))
    )

    // Sort by match score and return top recommendations
    return scoredJobs
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20) // Top 20 recommendations
  }

  // Core job matching algorithm
  private async scoreJobMatch(job: JobPosting): Promise<JobRecommendation> {
    const skillsMatch = this.calculateSkillsMatch(job.skills)
    const salaryMatch = this.calculateSalaryMatch(job)
    const locationMatch = this.calculateLocationMatch(job.location)
    const experienceMatch = this.calculateExperienceMatch(job.experienceRequired)
    const visaMatch = this.calculateVisaMatch(job)
    const companyMatch = this.calculateCompanyMatch(job.company)
    
    // Weighted scoring algorithm
    const matchScore = Math.round(
      skillsMatch * 0.35 +           // Skills are most important (35%)
      salaryMatch * 0.20 +           // Salary match (20%)
      locationMatch * 0.15 +         // Location preference (15%)
      (experienceMatch ? 15 : 5) +   // Experience match (15% if match, 5% if not)
      visaMatch * 0.10 +             // Visa sponsorship (10%)
      companyMatch * 0.05            // Company reputation (5%)
    )

    // Generate AI insights
    const aiInsights = await this.generateAIInsights(job, {
      skillsMatch,
      salaryMatch: salaryMatch > 0.7,
      locationMatch: locationMatch > 0.8,
      experienceMatch
    })

    const matchReasons = this.generateMatchReasons(job, {
      skillsMatch,
      salaryMatch,
      locationMatch,
      experienceMatch,
      visaMatch
    })

    return {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary || `AED ${job.salaryMin} - ${job.salaryMax}`,
      description: job.description,
      requirements: job.requirements,
      benefits: job.benefits,
      matchScore,
      matchReasons,
      salaryMatch: salaryMatch > 0.7,
      locationMatch: locationMatch > 0.8,
      skillsMatch: Math.round(skillsMatch * 100),
      experienceMatch,
      visaSponsorship: job.visaSponsorship,
      uaeNational: job.uaeNational,
      remote: job.remote,
      postedDate: job.postedDate,
      urgency: this.calculateUrgency(job, matchScore),
      aiInsights
    }
  }

  // Skills matching using AI-enhanced algorithm
  private calculateSkillsMatch(jobSkills: string[]): number {
    if (!jobSkills || jobSkills.length === 0) return 0.5

    const userSkillsLower = this.userProfile.skills.map(s => s.toLowerCase())
    const jobSkillsLower = jobSkills.map(s => s.toLowerCase())
    
    let exactMatches = 0
    let partialMatches = 0
    
    jobSkillsLower.forEach(jobSkill => {
      if (userSkillsLower.includes(jobSkill)) {
        exactMatches++
      } else {
        // Check for partial matches (e.g., "React" matches "ReactJS")
        const hasPartialMatch = userSkillsLower.some(userSkill => 
          userSkill.includes(jobSkill) || jobSkill.includes(userSkill)
        )
        if (hasPartialMatch) partialMatches++
      }
    })
    
    // Calculate match percentage with weighting
    const exactMatchScore = (exactMatches / jobSkillsLower.length) * 1.0
    const partialMatchScore = (partialMatches / jobSkillsLower.length) * 0.6
    
    return Math.min(exactMatchScore + partialMatchScore, 1.0)
  }

  // Advanced salary matching with UAE market context
  private calculateSalaryMatch(job: JobPosting): number {
    if (!this.userProfile.desiredSalary) return 0.7 // Neutral if no preference
    
    let jobSalaryMin = job.salaryMin
    let jobSalaryMax = job.salaryMax
    
    // Try to parse salary from string if numeric values not available
    if (!jobSalaryMin && job.salary) {
      const salaryMatch = job.salary.match(/(\d+),?(\d+)?/g)
      if (salaryMatch && salaryMatch.length >= 2) {
        jobSalaryMin = parseInt(salaryMatch[0].replace(',', ''))
        jobSalaryMax = parseInt(salaryMatch[1].replace(',', ''))
      }
    }
    
    if (!jobSalaryMin) return 0.5 // Neutral if salary not specified
    
    const desiredSalary = this.userProfile.desiredSalary
    const jobSalaryMid = jobSalaryMax ? (jobSalaryMin + jobSalaryMax) / 2 : jobSalaryMin
    
    if (jobSalaryMid >= desiredSalary * 0.9) return 1.0 // Perfect match
    if (jobSalaryMid >= desiredSalary * 0.8) return 0.8 // Good match
    if (jobSalaryMid >= desiredSalary * 0.7) return 0.6 // Acceptable
    return 0.3 // Below expectations
  }

  // Location matching with UAE-specific logic
  private calculateLocationMatch(jobLocation: string): number {
    const preferredLocations = this.userProfile.preferredLocations.map(l => l.toLowerCase())
    const jobLocationLower = jobLocation.toLowerCase()
    
    // Exact location match
    if (preferredLocations.some(loc => jobLocationLower.includes(loc))) return 1.0
    
    // UAE emirate matching logic
    const emirateMatches = {
      'dubai': ['dubai', 'deira', 'bur dubai', 'jumeirah', 'marina', 'downtown'],
      'abu dhabi': ['abu dhabi', 'al ain', 'western region'],
      'sharjah': ['sharjah'],
      'ajman': ['ajman'],
    }
    
    for (const [emirate, areas] of Object.entries(emirateMatches)) {
      if (preferredLocations.includes(emirate)) {
        if (areas.some(area => jobLocationLower.includes(area))) return 0.9
      }
    }
    
    // Remote work preference
    if (this.userProfile.remotePreference && jobLocationLower.includes('remote')) return 1.0
    
    return 0.4 // Different location
  }

  // Experience matching algorithm
  private calculateExperienceMatch(requiredExperience: number): boolean {
    if (!requiredExperience) return true
    
    const userExperience = this.userProfile.experience
    const experienceGap = requiredExperience - userExperience
    
    // Perfect match or overqualified
    if (experienceGap <= 0) return true
    
    // Slight stretch is acceptable (1-2 years)
    if (experienceGap <= 2) return true
    
    // Too much experience gap
    return false
  }

  // Visa status matching
  private calculateVisaMatch(job: JobPosting): number {
    if (this.userProfile.visaStatus === 'uae_national') return 1.0
    
    if (this.userProfile.visaStatus === 'sponsored') return 0.9
    
    // Needs visa sponsorship
    if (job.visaSponsorship) return 1.0
    if (UAE_MARKET_DATA.visaFriendlyCompanies.includes(job.company)) return 0.8
    
    return 0.3 // Visa concerns
  }

  // Company reputation and market presence
  private calculateCompanyMatch(company: string): number {
    if (UAE_MARKET_DATA.popularCompanies.includes(company)) return 1.0
    if (UAE_MARKET_DATA.visaFriendlyCompanies.includes(company)) return 0.8
    if (UAE_MARKET_DATA.remoteWorkCompanies.includes(company)) return 0.7
    return 0.5
  }

  // Generate human-readable match reasons
  private generateMatchReasons(job: JobPosting, scores: any): string[] {
    const reasons: string[] = []
    
    if (scores.skillsMatch > 0.8) {
      reasons.push('🎯 Strong skills match - you have most required skills')
    } else if (scores.skillsMatch > 0.6) {
      reasons.push('⚡ Good skills alignment with growth potential')
    }
    
    if (scores.salaryMatch > 0.8) {
      reasons.push('💰 Salary meets your expectations')
    } else if (scores.salaryMatch > 0.6) {
      reasons.push('💵 Competitive salary for UAE market')
    }
    
    if (scores.locationMatch > 0.8) {
      reasons.push('📍 Perfect location match')
    }
    
    if (scores.experienceMatch) {
      reasons.push('🏆 Your experience level fits perfectly')
    } else {
      reasons.push('🚀 Great opportunity to level up your career')
    }
    
    if (job.visaSponsorship && this.userProfile.visaStatus !== 'uae_national') {
      reasons.push('🛂 Visa sponsorship available')
    }
    
    if (UAE_MARKET_DATA.popularCompanies.includes(job.company)) {
      reasons.push('⭐ Top-tier company in UAE market')
    }
    
    if (job.remote && this.userProfile.remotePreference) {
      reasons.push('🏠 Remote work available')
    }
    
    return reasons
  }

  // Calculate job application urgency
  private calculateUrgency(job: JobPosting, matchScore: number): 'low' | 'medium' | 'high' {
    const daysPosted = this.getDaysAgo(job.postedDate)
    
    if (matchScore > 85 && daysPosted < 7) return 'high'
    if (matchScore > 75 && daysPosted < 14) return 'medium'
    if (daysPosted > 30) return 'low'
    
    return 'medium'
  }

  // Generate AI-powered insights using GPT
  private async generateAIInsights(job: JobPosting, matchData: any): Promise<JobRecommendation['aiInsights']> {
    // Mock AI insights for now - in production, use real OpenAI API
    const insights = {
      whyGoodMatch: [
        `Your ${this.userProfile.skills.slice(0, 3).join(', ')} skills align perfectly with their tech stack`,
        `${job.company} is known for career growth opportunities in the UAE market`,
        `The role offers excellent exposure to cutting-edge technologies`
      ],
      potentialConcerns: [
        matchData.salaryMatch ? null : 'Salary might be below your expectations - consider negotiation',
        matchData.experienceMatch ? null : 'Role might require learning new technologies quickly',
        job.visaSponsorship ? null : 'Visa sponsorship not explicitly mentioned'
      ].filter(Boolean) as string[],
      applicationTips: [
        `Highlight your experience with ${job.skills?.slice(0, 2).join(' and ')} in your application`,
        `Research ${job.company}'s recent projects and mention relevant insights`,
        `Emphasize your adaptability and UAE market knowledge`
      ],
      salaryNegotiation: matchData.salaryMatch 
        ? `The offered salary range aligns with UAE market standards for your experience level`
        : `Consider negotiating based on UAE market rates - similar roles typically pay 10-15% higher`
    }
    
    return insights
  }

  // Utility function to calculate days ago
  private getDaysAgo(dateString: string): number {
    const posted = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - posted.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }
}

// Export utility functions
export function createUserProfileFromData(userData: any): UserProfile {
  return {
    skills: userData.skills || [],
    experience: userData.experience || 0,
    currentSalary: userData.currentSalary,
    desiredSalary: userData.desiredSalary,
    preferredLocations: userData.preferredLocations || ['Dubai'],
    jobTypes: userData.jobTypes || ['Full-time'],
    visaStatus: userData.visaStatus || 'sponsored',
    industries: userData.industries || [],
    remotePreference: userData.remotePreference || false,
    careerLevel: userData.careerLevel || 'mid',
    education: userData.education || [],
    languages: userData.languages || ['English'],
    certifications: userData.certifications || []
  }
}

export function generateMockJobs(): JobPosting[] {
  return [
    {
      id: 'job-1',
      title: 'Senior React Developer',
      company: 'Emirates NBD',
      location: 'Dubai, UAE',
      salary: 'AED 18,000 - 25,000',
      salaryMin: 18000,
      salaryMax: 25000,
      description: 'Looking for experienced React developer to join our digital transformation team',
      requirements: ['React', 'TypeScript', 'Node.js', '5+ years experience'],
      benefits: ['Health Insurance', 'Annual Bonus', 'Training Budget'],
      visaSponsorship: true,
      uaeNational: false,
      remote: false,
      postedDate: '2024-01-15',
      jobType: 'Full-time',
      industry: 'Banking',
      experienceRequired: 5,
      skills: ['React', 'TypeScript', 'Node.js', 'REST APIs', 'Git']
    },
    {
      id: 'job-2',
      title: 'Full Stack Developer',
      company: 'Careem',
      location: 'Dubai, UAE',
      salary: 'AED 15,000 - 22,000',
      salaryMin: 15000,
      salaryMax: 22000,
      description: 'Join our engineering team building the super app for the Middle East',
      requirements: ['React', 'Python', 'AWS', '3+ years experience'],
      benefits: ['Stock Options', 'Flexible Hours', 'Remote Work'],
      visaSponsorship: true,
      uaeNational: false,
      remote: true,
      postedDate: '2024-01-10',
      jobType: 'Full-time',
      industry: 'Technology',
      experienceRequired: 3,
      skills: ['React', 'Python', 'AWS', 'Docker', 'Kubernetes']
    }
  ]
}