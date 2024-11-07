import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900'
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900'
})

export const metadata: Metadata = {
  title: 'HybridCRS',
  description: 'Hybrid Conversational Recommender System using LLM with RAG and RecSys integration',
  generator: 'Next.js',
  manifest: '/manifest.json',
  keywords: ['hybrid-crs', 'conversational', 'recommender-system', 'llm', 'rag', 'nextjs', 'next14', 'pwa', 'next-pwa'],
  authors: [
    {
      name: 'Acervans',
      url: 'https://www.linkedin.com/in/javier-wang/'
    }
  ],
  icons: [
    { rel: 'apple-touch-icon', url: 'icons/icon-192x192.png' },
    { rel: 'icon', url: 'icons/icon-192x192.png' }
  ]
}

export const viewport: Viewport = {
  themeColor: [{ media: '(prefers-color-scheme: dark)', color: '#015744' }],
  minimumScale: 1,
  initialScale: 1,
  width: 'device-width',
  viewportFit: 'cover'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  )
}
