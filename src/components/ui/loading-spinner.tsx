"use client"

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  variant?: 'primary' | 'secondary' | 'muted'
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6', 
  lg: 'w-8 h-8'
}

const variantClasses = {
  primary: 'text-primary',
  secondary: 'text-secondary-foreground',
  muted: 'text-muted-foreground'
}

export default function LoadingSpinner({ 
  size = 'md', 
  className,
  variant = 'primary'
}: LoadingSpinnerProps) {
  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      <div className={cn(
        'absolute inset-0 rounded-full border-2 border-transparent border-t-current animate-spin',
        variantClasses[variant]
      )} />
      <div className={cn(
        'absolute inset-0 rounded-full border border-current/20',
        variantClasses[variant]
      )} />
    </div>
  )
}

export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn('flex space-x-1', className)}>
      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  )
}

export function LoadingPulse({ className }: { className?: string }) {
  return (
    <div className={cn('flex space-x-2', className)}>
      <div className="w-3 h-3 bg-current rounded-full animate-pulse" />
      <div className="w-3 h-3 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
      <div className="w-3 h-3 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
    </div>
  )
}