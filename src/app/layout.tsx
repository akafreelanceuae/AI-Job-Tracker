import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Job Tracker | UAE Edition',
  description: 'Minimalist AI-powered dashboard for UAE job hunting. Transform chaotic job hunting into a streamlined ritual.',
  keywords: ['AI', 'Job Tracker', 'UAE', 'Dubai', 'Jobs', 'AED', 'Visa'],
  authors: [{ name: 'Your Name' }],
  creator: 'AI Job Tracker',
  publisher: 'AI Job Tracker',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <div className="min-h-screen bg-background transition-colors duration-300">
            {children}
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
