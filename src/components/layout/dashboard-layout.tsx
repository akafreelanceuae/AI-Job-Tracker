"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Brain,
  Briefcase,
  BarChart3,
  Settings,
  Plus,
  Search,
  Bell,
  User,
  ChevronLeft,
  ChevronRight,
  Home,
  Target,
  Calendar,
  FileText,
  TrendingUp,
  Filter,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { NotificationBell } from '@/components/notifications/NotificationBell'

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: Home, 
    description: 'Overview & Stats',
    badge: null
  },
  { 
    name: 'AI Recommendations', 
    href: '/dashboard/recommendations', 
    icon: Brain, 
    description: 'Smart Job Matches',
    badge: '4'
  },
  { 
    name: 'Advanced Search', 
    href: '/dashboard/search', 
    icon: Search, 
    description: 'Find Jobs with Filters',
    badge: null
  },
  { 
    name: 'Notifications', 
    href: '/notifications', 
    icon: Bell, 
    description: 'Alerts & Updates',
    badge: '3'
  },
  { 
    name: 'Applications', 
    href: '/applications', 
    icon: Briefcase, 
    description: 'Track Job Applications',
    badge: '8'
  },
  { 
    name: 'Jobs', 
    href: '/dashboard/jobs', 
    icon: Briefcase, 
    description: 'Job Listings',
    badge: '12'
  },
  { 
    name: 'Pipeline', 
    href: '/dashboard/pipeline', 
    icon: Target, 
    description: 'Track Progress',
    badge: '5'
  },
  { 
    name: 'Calendar', 
    href: '/dashboard/calendar', 
    icon: Calendar, 
    description: 'Interviews & Events',
    badge: null
  },
  { 
    name: 'Documents', 
    href: '/dashboard/documents', 
    icon: FileText, 
    description: 'CVs & Cover Letters',
    badge: null
  },
  { 
    name: 'Analytics', 
    href: '/dashboard/analytics', 
    icon: TrendingUp, 
    description: 'Reports & Insights',
    badge: null
  },
]

const quickActions = [
  { name: 'Add Job', icon: Plus, action: 'add-job', color: 'uae-green' },
  { name: 'Filter', icon: Filter, action: 'filter', color: 'uae-gold' },
  { name: 'Search', icon: Search, action: 'search', color: 'uae-red' },
]

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

export default function DashboardLayout({ 
  children, 
  title = 'Dashboard',
  subtitle,
  actions
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    
    // Auto-collapse sidebar on mobile
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-uae-sand/5 to-background">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 bottom-0 z-50 transform transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${
        sidebarOpen ? 'w-72' : 'w-20'
      } ${mobileMenuOpen ? 'translate-x-0' : ''}`}>
        
        <div className="h-full bg-background/95 backdrop-blur-xl border-r border-border/50 shadow-xl">
          {/* Logo & Toggle */}
          <div className="flex items-center justify-between p-6 border-b border-border/50">
            <div className={`flex items-center space-x-3 transition-opacity duration-200 ${
              sidebarOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'
            }`}>
              <div className="w-10 h-10 bg-gradient-to-br from-uae-green to-uae-gold rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              {sidebarOpen && (
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-uae-green to-uae-gold bg-clip-text text-transparent">
                    AI Job Tracker
                  </h1>
                  <p className="text-xs text-muted-foreground -mt-1">UAE Edition</p>
                </div>
              )}
            </div>
            
            {/* Desktop Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex"
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>

            {/* Mobile Close */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Actions */}
          {sidebarOpen && (
            <div className="p-4 border-b border-border/50">
              <div className="flex space-x-2">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <Button
                      key={action.action}
                      variant="outline"
                      size="sm"
                      className={`flex-1 hover:bg-${action.color}/10 hover:border-${action.color}/30 transition-colors`}
                    >
                      <Icon className="h-4 w-4" />
                      {sidebarOpen && <span className="ml-2 text-xs">{action.name}</span>}
                    </Button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-primary bg-primary/10 shadow-lg border border-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center flex-1">
                    <Icon className={`h-5 w-5 transition-transform ${
                      isActive ? 'text-primary scale-110' : 'group-hover:scale-105'
                    }`} />
                    
                    {sidebarOpen && (
                      <>
                        <div className="ml-4">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-muted-foreground">{item.description}</div>
                        </div>
                        
                        {item.badge && (
                          <Badge
                            variant="secondary"
                            className="ml-auto bg-primary/10 text-primary text-xs"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                  
                  {isActive && (
                    <div className="absolute left-0 top-1/2 w-1 h-6 bg-primary rounded-r-full transform -translate-y-1/2" />
                  )}
                  
                  {!sidebarOpen && item.badge && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="border-t border-border/50 p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`w-full justify-start p-3 hover:bg-muted/50 ${
                    sidebarOpen ? '' : 'px-3'
                  }`}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-uae-green to-uae-gold rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  {sidebarOpen && (
                    <div className="ml-3 text-left">
                      <p className="text-sm font-medium">John Doe</p>
                      <p className="text-xs text-muted-foreground">john@example.com</p>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        sidebarOpen ? 'lg:ml-72' : 'lg:ml-20'
      }`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Breadcrumb */}
              <div>
                <h1 className="text-2xl font-bold">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-muted-foreground">{subtitle}</p>
                )}
              </div>
            </div>

            {/* Top Bar Actions */}
            <div className="flex items-center space-x-3">
              {/* Search */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden md:flex items-center space-x-2 text-muted-foreground hover:text-foreground w-64 justify-start bg-muted/30 hover:bg-muted/50"
              >
                <Search className="h-4 w-4" />
                <span className="text-sm">Search jobs, companies...</span>
                <kbd className="ml-auto text-xs bg-muted-foreground/20 px-1.5 py-0.5 rounded">⌘K</kbd>
              </Button>

              {/* Notifications */}
              <NotificationBell />

              {/* Custom Actions */}
              {actions}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}