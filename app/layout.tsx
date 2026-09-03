import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cost-calculator.vercel.app'
const title = 'Cost Calculator — Software Project Budgeting & Invoicing'
const description =
  'Estimate software project costs with multi-currency support, live exchange rates, and daily, monthly, and yearly budget projections. Plan client budgets and export invoices to PDF or Word.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: 'Cost Calculator',
  title: {
    default: title,
    template: '%s · Cost Calculator',
  },
  description,
  keywords: [
    'cost calculator',
    'project cost estimator',
    'software development cost',
    'budget planner',
    'client budget',
    'freelance rate calculator',
    'hourly rate calculator',
    'invoice generator',
    'multi-currency',
    'exchange rate',
    'daily monthly yearly budget',
  ],
  authors: [{ name: 'Khalid' }],
  creator: 'Khalid',
  category: 'productivity',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'Cost Calculator',
    title,
    description,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Cost Calculator — software project budgeting',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-light-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0e17' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  )
}
