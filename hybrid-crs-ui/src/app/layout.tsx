import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { cookies } from 'next/headers'

import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages, getTranslations } from 'next-intl/server'
import { ThemeProvider } from 'next-themes'

import { SidebarProvider } from '@/components/ui/sidebar'
import { LocaleProvider } from '@/contexts/localeContext'
import { ModelProvider } from '@/contexts/modelContext'
import { SupabaseProvider } from '@/contexts/supabaseContext'

import './globals.css'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const dynParams = await params
  const t = await getTranslations({ locale: dynParams.locale, namespace: 'Metadata' })

  return {
    title: {
      template: '%s | HybridCRS',
      default: 'HybridCRS'
    },
    description: t('description'),
    generator: 'Next.js',
    manifest: '/manifest.json',
    keywords: [
      'hybrid-crs',
      'conversational',
      'recommender-system',
      'llm',
      'rag',
      'nextjs',
      'next15',
      'pwa',
      'next-pwa'
    ],
    authors: [
      {
        name: 'Acervans',
        url: 'https://www.linkedin.com/in/javier-wang/'
      }
    ],
    icons: [
      { rel: 'apple-touch-icon', url: '/icons/icon-192x192.png' },
      { rel: 'icon', url: '/icons/icon-192x192.png' }
    ]
  }
}

export const viewport: Viewport = {
  themeColor: [{ media: '(prefers-color-scheme: dark)', color: '#0f8a73' }],
  minimumScale: 1,
  initialScale: 1,
  width: 'device-width',
  viewportFit: 'cover'
}

const inter = Inter({ subsets: ['latin'], fallback: ['arial', 'system-ui'] })

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()
  const cookieStore = await cookies()
  const defaultOpen = (cookieStore.get('sidebar_state')?.value ?? 'true') === 'true'

  return (
    <html lang={locale} suppressHydrationWarning>
      <head />
      <body className={`${inter.className} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider defaultTheme='system'>
            <LocaleProvider>
              <SupabaseProvider>
                <ModelProvider>
                  <SidebarProvider defaultOpen={defaultOpen}>{children}</SidebarProvider>
                </ModelProvider>
              </SupabaseProvider>
            </LocaleProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
