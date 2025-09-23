"use client"

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Target,
  Building,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Download,
  Filter,
  RefreshCw,
  Zap,
  Award,
  Users,
  DollarSign
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import DashboardLayout from '@/components/layout/dashboard-layout'

// Mock analytics data
const analyticsData = {
  overview: {
    totalApplications: 47,
    responseRate: 68,
    averageResponseTime: 5.2,
    successRate: 23,
    trends: {
      applications: 12,
      responses: 8,
      interviews: -2,
      offers: 15
    }
  },
  applicationsByMonth: [
    { month: 'Jan', applications: 8, responses: 5, interviews: 2, offers: 1 },
    { month: 'Feb', applications: 12, responses: 8, interviews: 4, offers: 1 },
    { month: 'Mar', applications: 15, responses: 10, interviews: 6, offers: 2 },
    { month: 'Apr', applications: 12, responses: 9, interviews: 5, offers: 1 },
    { month: 'May', applications: 18, responses: 14, interviews: 8, offers: 3 },
    { month: 'Jun', applications: 22, responses: 16, interviews: 9, offers: 2 },
  ],
  statusDistribution: [
    { status: 'Applied', count: 18, percentage: 38, color: 'bg-blue-500' },
    { status: 'Screening', count: 12, percentage: 26, color: 'bg-yellow-500' },
    { status: 'Interview', count: 8, percentage: 17, color: 'bg-purple-500' },
    { status: 'Offer', count: 5, percentage: 11, color: 'bg-green-500' },
    { status: 'Rejected', count: 4, percentage: 8, color: 'bg-red-500' },
  ],
  topCompanies: [
    { name: 'Emirates NBD', applications: 5, responses: 4, successRate: 80 },
    { name: 'Careem', applications: 4, responses: 3, successRate: 75 },
    { name: 'Noon', applications: 3, responses: 2, successRate: 67 },
    { name: 'Talabat', applications: 3, responses: 1, successRate: 33 },
    { name: 'ADCB', applications: 2, responses: 2, successRate: 100 },
  ],
  salaryRanges: [
    { range: '10K-15K AED', count: 12, percentage: 25 },
    { range: '15K-20K AED', count: 18, percentage: 38 },
    { range: '20K-25K AED', count: 10, percentage: 21 },
    { range: '25K-30K AED', count: 5, percentage: 11 },
    { range: '30K+ AED', count: 2, percentage: 4 },
  ],
  skills: [
    { skill: 'React', demand: 85, jobs: 32 },
    { skill: 'TypeScript', demand: 78, jobs: 28 },
    { skill: 'Node.js', demand: 72, jobs: 24 },
    { skill: 'Python', demand: 65, jobs: 19 },
    { skill: 'AWS', demand: 60, jobs: 18 },
    { skill: 'Docker', demand: 45, jobs: 14 },
  ]
}

interface StatCardProps {
  title: string
  value: string | number
  trend?: number
  subtitle: string
  icon: any
  color: string
  delay?: number
}

const StatCard = ({ title, value, trend, subtitle, icon: Icon, color, delay = 0 }: StatCardProps) => {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <Card className={`p-6 glass-card hover:shadow-lg transition-all duration-500 transform hover:scale-105 ${
      mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-${color}/10 flex items-center justify-center`}>
          <Icon className={`h-6 w-6 text-${color}`} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center space-x-1 ${
            trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend > 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : trend < 0 ? (
              <TrendingDown className="h-4 w-4" />
            ) : null}
            <span className="text-sm font-medium">
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          </div>
        )}
      </div>
      
      <div>
        <div className="text-3xl font-bold mb-1">{value}</div>
        <div className="text-sm font-medium text-muted-foreground mb-2">{title}</div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </div>
    </Card>
  )
}

interface ProgressBarProps {
  label: string
  value: number
  max: number
  color: string
  showValue?: boolean
}

const ProgressBar = ({ label, value, max, color, showValue = true }: ProgressBarProps) => {
  const [animatedValue, setAnimatedValue] = useState(0)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value)
    }, 300)
    return () => clearTimeout(timer)
  }, [value])
  
  const percentage = (animatedValue / max) * 100
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        {showValue && (
          <span className="text-sm text-muted-foreground">{animatedValue}</span>
        )}
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

const BarChart = ({ data, title }: { data: any[]; title: string }) => {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const maxValue = Math.max(...data.map(d => Math.max(d.applications, d.responses, d.interviews, d.offers)))
  
  return (
    <Card className="p-6 glass-card">
      <h3 className="text-lg font-semibold mb-6 flex items-center">
        <BarChart3 className="h-5 w-5 mr-2 text-primary" />
        {title}
      </h3>
      
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={item.month} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{item.month}</span>
              <div className="flex space-x-4 text-xs">
                <span className="text-blue-600">Apps: {item.applications}</span>
                <span className="text-green-600">Resp: {item.responses}</span>
                <span className="text-purple-600">Int: {item.interviews}</span>
                <span className="text-orange-600">Off: {item.offers}</span>
              </div>
            </div>
            
            <div className="relative h-12 bg-muted/30 rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-end space-x-0.5 p-1">
                <div
                  className={`bg-blue-500 transition-all duration-1000 ease-out rounded-sm ${
                    mounted ? 'h-full' : 'h-0'
                  }`}
                  style={{ 
                    width: '25%',
                    height: mounted ? `${(item.applications / maxValue) * 100}%` : '0%',
                    transitionDelay: `${index * 100}ms`
                  }}
                />
                <div
                  className={`bg-green-500 transition-all duration-1000 ease-out rounded-sm ${
                    mounted ? 'h-full' : 'h-0'
                  }`}
                  style={{ 
                    width: '25%',
                    height: mounted ? `${(item.responses / maxValue) * 100}%` : '0%',
                    transitionDelay: `${index * 100 + 100}ms`
                  }}
                />
                <div
                  className={`bg-purple-500 transition-all duration-1000 ease-out rounded-sm ${
                    mounted ? 'h-full' : 'h-0'
                  }`}
                  style={{ 
                    width: '25%',
                    height: mounted ? `${(item.interviews / maxValue) * 100}%` : '0%',
                    transitionDelay: `${index * 100 + 200}ms`
                  }}
                />
                <div
                  className={`bg-orange-500 transition-all duration-1000 ease-out rounded-sm ${
                    mounted ? 'h-full' : 'h-0'
                  }`}
                  style={{ 
                    width: '25%',
                    height: mounted ? `${(item.offers / maxValue) * 100}%` : '0%',
                    transitionDelay: `${index * 100 + 300}ms`
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

const DonutChart = ({ data, title }: { data: any[]; title: string }) => {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Prevent hydration mismatch by not rendering animated parts until mounted
  if (!mounted) {
    return (
      <Card className="p-6 glass-card">
        <h3 className="text-lg font-semibold mb-6 flex items-center">
          <PieChart className="h-5 w-5 mr-2 text-primary" />
          {title}
        </h3>
        
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-32 h-32">
            <div className="w-32 h-32 rounded-full border-4 border-muted/20 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold">{data.reduce((sum, d) => sum + d.count, 0)}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          {data.map((item, index) => (
            <div 
              key={item.status}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/20"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-sm font-medium">{item.status}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{item.count}</div>
                <div className="text-xs text-muted-foreground">{item.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    )
  }
  
  return (
    <Card className="p-6 glass-card">
      <h3 className="text-lg font-semibold mb-6 flex items-center">
        <PieChart className="h-5 w-5 mr-2 text-primary" />
        {title}
      </h3>
      
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="stroke-muted/20"
              strokeWidth="3"
              fill="none"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            {data.map((item, index) => {
              const offset = data.slice(0, index).reduce((sum, d) => sum + d.percentage, 0)
              return (
                <path
                  key={item.status}
                  className={`${item.color.replace('bg-', 'stroke-')} transition-all duration-1000 ease-out`}
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${item.percentage}, 100`}
                  strokeDashoffset={`${-offset}`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              )
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold">{data.reduce((sum, d) => sum + d.count, 0)}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        {data.map((item, index) => (
          <div 
            key={item.status}
            className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 hover:bg-muted/20 ${
              mounted ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <span className="text-sm font-medium">{item.status}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{item.count}</div>
              <div className="text-xs text-muted-foreground">{item.percentage}%</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false)
  const [timeRange, setTimeRange] = useState('6m')
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const actions = (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
      <Button variant="outline" size="sm">
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh
      </Button>
      <Button size="sm" className="bg-gradient-to-r from-uae-green to-uae-green/90 text-white">
        <Eye className="h-4 w-4 mr-2" />
        View Report
      </Button>
    </div>
  )
  
  return (
    <DashboardLayout
      title="Analytics & Insights"
      subtitle="Track your job search performance and discover opportunities"
      actions={actions}
    >
      <div className="space-y-8">
        {/* Time Range Selector */}
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">Time Range:</span>
          <div className="flex space-x-1">
            {[
              { value: '1m', label: '1 Month' },
              { value: '3m', label: '3 Months' },
              { value: '6m', label: '6 Months' },
              { value: '1y', label: '1 Year' }
            ].map((range) => (
              <Button
                key={range.value}
                variant={timeRange === range.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range.value)}
                className={timeRange === range.value ? 'bg-primary text-primary-foreground' : ''}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Applications"
            value={analyticsData.overview.totalApplications}
            trend={analyticsData.overview.trends.applications}
            subtitle="Submitted this period"
            icon={Target}
            color="uae-green"
            delay={0}
          />
          <StatCard
            title="Response Rate"
            value={`${analyticsData.overview.responseRate}%`}
            trend={analyticsData.overview.trends.responses}
            subtitle="Above industry average"
            icon={TrendingUp}
            color="uae-gold"
            delay={100}
          />
          <StatCard
            title="Avg Response Time"
            value={`${analyticsData.overview.averageResponseTime} days`}
            trend={analyticsData.overview.trends.interviews}
            subtitle="Time to first response"
            icon={Clock}
            color="uae-red"
            delay={200}
          />
          <StatCard
            title="Success Rate"
            value={`${analyticsData.overview.successRate}%`}
            trend={analyticsData.overview.trends.offers}
            subtitle="Applications to offers"
            icon={Award}
            color="uae-green"
            delay={300}
          />
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-8">
          <BarChart 
            data={analyticsData.applicationsByMonth} 
            title="Monthly Application Trends"
          />
          <DonutChart 
            data={analyticsData.statusDistribution} 
            title="Application Status Distribution"
          />
        </div>

        {/* Detailed Analytics */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Top Companies */}
          <Card className="p-6 glass-card">
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <Building className="h-5 w-5 mr-2 text-primary" />
              Top Companies
            </h3>
            <div className="space-y-4">
              {analyticsData.topCompanies.map((company, index) => (
                <div 
                  key={company.name}
                  className={`flex items-center justify-between p-3 rounded-lg hover:bg-muted/20 transition-all duration-300 ${
                    mounted ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div>
                    <div className="font-medium text-sm">{company.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {company.applications} applications
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      company.successRate >= 75 ? 'text-green-600' : 
                      company.successRate >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {company.successRate}%
                    </div>
                    <div className="text-xs text-muted-foreground">success</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Salary Analysis */}
          <Card className="p-6 glass-card">
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-primary" />
              Salary Ranges
            </h3>
            <div className="space-y-4">
              {analyticsData.salaryRanges.map((range, index) => (
                <div key={range.range} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{range.range}</span>
                    <span className="text-sm text-muted-foreground">{range.count} jobs</span>
                  </div>
                  <ProgressBar
                    label=""
                    value={range.percentage}
                    max={100}
                    color="bg-gradient-to-r from-uae-green to-uae-gold"
                    showValue={false}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Skills Demand */}
          <Card className="p-6 glass-card">
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-primary" />
              Skills in Demand
            </h3>
            <div className="space-y-4">
              {analyticsData.skills.map((skill, index) => (
                <div key={skill.skill} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{skill.skill}</span>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">{skill.jobs} jobs</div>
                    </div>
                  </div>
                  <ProgressBar
                    label=""
                    value={skill.demand}
                    max={100}
                    color={`${skill.demand >= 80 ? 'bg-green-500' : 
                            skill.demand >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    showValue={false}
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Insights & Recommendations */}
        <Card className="p-6 glass-card bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">AI Insights & Recommendations</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>• Your response rate is <strong className="text-primary">18% above</strong> the UAE market average</p>
                <p>• Consider applying to more <strong className="text-primary">fintech companies</strong> - they show 85% response rates for your profile</p>
                <p>• <strong className="text-primary">React & TypeScript</strong> skills are in highest demand in Dubai tech scene</p>
                <p>• Best time to apply: <strong className="text-primary">Tuesday-Thursday, 9-11 AM GST</strong> based on your success patterns</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}