"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Briefcase, Brain, Shield, MapPin, Sparkles, TrendingUp, Zap, User } from 'lucide-react'
import Header from '@/components/layout/header'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setMounted(true)
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-uae-sand/5 to-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-uae-green/5 rounded-full blur-3xl transition-transform duration-1000 ease-out"
          style={{
            transform: `translate(${mousePosition.x * 100}px, ${mousePosition.y * 100}px)`,
            left: '10%',
            top: '20%'
          }}
        />
        <div 
          className="absolute w-80 h-80 bg-uae-gold/5 rounded-full blur-3xl transition-transform duration-700 ease-out"
          style={{
            transform: `translate(${mousePosition.x * -50}px, ${mousePosition.y * -50}px)`,
            right: '10%',
            bottom: '20%'
          }}
        />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.01] animate-pulse" />
      </div>

      <Header />
      
      {/* Hero Section */}
      <div className="relative pt-24 pb-16">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            {/* Animated Badge */}
            <div className={`inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-uae-green/10 to-uae-gold/10 text-uae-green text-sm font-medium mb-8 border border-uae-green/20 backdrop-blur-sm transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
              Built for UAE Professionals
              <div className="ml-2 w-2 h-2 bg-uae-green rounded-full animate-pulse" />
            </div>
            
            {/* Hero Title with staggered animation */}
            <div className="mb-6">
              <h1 className={`text-5xl md:text-7xl font-bold leading-tight transition-all duration-1000 delay-200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                <span className="text-gradient relative">
                  AI Job Tracker
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-uae-gold/20 rounded-full blur-xl animate-pulse" />
                </span>
                <br />
                <span className="text-foreground/70 text-4xl md:text-5xl font-normal">UAE Edition</span>
              </h1>
            </div>
            
            {/* Animated Description */}
            <p className={`text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed transition-all duration-1000 delay-400 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              Transform chaotic job hunting into a 
              <span className="font-semibold text-primary relative inline-block">
                streamlined ritual
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-uae-green to-uae-gold" />
              </span>
              . Monastery meets machine learning - built for AED, visas, and Emirates-specific opportunities.
            </p>
            
            {/* CTA Buttons with enhanced styling */}
            <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-20 transition-all duration-1000 delay-600 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <Link 
                href="/dashboard" 
                className="relative inline-flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-uae-green to-uae-green/90 text-white hover:from-uae-green/90 hover:to-uae-green/80 transition-all duration-300 font-medium text-lg group shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                <Zap className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                Start Tracking Jobs
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                <div className="absolute -inset-1 bg-gradient-to-r from-uae-green to-uae-gold opacity-0 group-hover:opacity-30 blur-xl transition-all duration-300 rounded-xl" />
              </Link>
              
              <Link 
                href="/auth/signin" 
                className="inline-flex items-center px-8 py-4 rounded-xl border-2 border-border/50 hover:border-primary/50 bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all duration-300 font-medium text-lg group transform hover:scale-105"
              >
                <User className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Sign In
              </Link>
            </div>
          </div>
          
          {/* Enhanced Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* UAE-Focused Card */}
            <div className={`group relative p-8 rounded-2xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50 hover:border-uae-green/30 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 shadow-lg hover:shadow-2xl ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: '800ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-uae-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-uae-green/20 to-uae-green/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-8 h-8 text-uae-green" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-uae-gold/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center group-hover:text-uae-green transition-colors duration-300">UAE-Focused</h3>
                <p className="text-muted-foreground text-center leading-relaxed">
                  Built for <span className="font-medium text-uae-green">AED salaries</span>, Emirates-specific job markets, and visa requirements. 
                  Understands Qiwa compliance and Emirates ID needs.
                </p>
              </div>
            </div>
            
            {/* AI-Powered Card */}
            <div className={`group relative p-8 rounded-2xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50 hover:border-uae-gold/30 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 shadow-lg hover:shadow-2xl ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: '900ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-uae-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-uae-gold/20 to-uae-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-8 h-8 text-uae-gold" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-uae-green/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center group-hover:text-uae-gold transition-colors duration-300">AI-Powered</h3>
                <p className="text-muted-foreground text-center leading-relaxed">
                  <span className="font-medium text-uae-gold">Smart summaries</span> that cut through noise, highlight visa sponsorship, 
                  and flag important requirements automatically.
                </p>
              </div>
            </div>
            
            {/* Privacy-First Card */}
            <div className={`group relative p-8 rounded-2xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50 hover:border-uae-red/30 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 shadow-lg hover:shadow-2xl ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: '1000ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-uae-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-uae-red/20 to-uae-red/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-uae-red" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-uae-gold/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center group-hover:text-uae-red transition-colors duration-300">Privacy-First</h3>
                <p className="text-muted-foreground text-center leading-relaxed">
                  <span className="font-medium text-uae-red">Zero third-party scraping</span>. Your job hunt data encrypted like a Dubai vault. 
                  Complete control over your information.
                </p>
              </div>
            </div>
          </div>
          
          {/* Stats Section */}
          <div className={`mt-32 mb-20 transition-all duration-1000 delay-1200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center group">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-uae-green" />
                  95%
                </div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
              <div className="text-center group">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="w-8 h-8 mx-auto mb-2 text-uae-gold" />
                  5K+
                </div>
                <p className="text-sm text-muted-foreground">Jobs Tracked</p>
              </div>
              <div className="text-center group">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-8 h-8 mx-auto mb-2 text-uae-red" />
                  AI
                </div>
                <p className="text-sm text-muted-foreground">Powered</p>
              </div>
              <div className="text-center group">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-8 h-8 mx-auto mb-2 text-uae-green" />
                  UAE
                </div>
                <p className="text-sm text-muted-foreground">Focused</p>
              </div>
            </div>
          </div>
          
          {/* Enhanced Vision Statement */}
          <div className={`text-center mt-20 max-w-4xl mx-auto transition-all duration-1000 delay-1400 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="relative p-12 rounded-3xl bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-lg border border-border/30">
              <div className="absolute inset-0 bg-gradient-to-br from-uae-green/5 via-transparent to-uae-gold/5 rounded-3xl" />
              <blockquote className="relative text-2xl md:text-3xl italic text-muted-foreground leading-relaxed">
                <span className="text-4xl text-uae-gold opacity-50">"</span>
                You're in a sunlit Dubai co-working space. The hum of the city fades as you open the app. 
                Clean lines, <span className="font-semibold text-uae-green">AED values</span>, and an AI that 'gets' UAE hiring quirks.
                <br />
                <span className="text-foreground font-semibold bg-gradient-to-r from-uae-green to-uae-gold bg-clip-text text-transparent"> 
                  No clutter. Just flow. Apply smarter, not harder.
                </span>
                <span className="text-4xl text-uae-gold opacity-50">"</span>
              </blockquote>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-uae-gold/20 rounded-full blur-sm animate-pulse" />
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-uae-green/20 rounded-full blur-sm animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
