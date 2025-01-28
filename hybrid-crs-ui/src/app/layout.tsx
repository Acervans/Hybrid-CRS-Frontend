import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ColorSchemeScript, MantineProvider, mantineHtmlProps, createTheme, MantineColorsTuple } from '@mantine/core'

import './globals.css'

// Import styles for Mantine packages
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/dropzone/styles.css'
import '@mantine/notifications/styles.css'
import 'mantine-datatable/styles.layer.css'

export const metadata: Metadata = {
  title: 'HybridCRS',
  description: 'Hybrid Conversational Recommender System using LLM with RAG and RecSys integration',
  generator: 'Next.js',
  manifest: '/manifest.json',
  keywords: ['hybrid-crs', 'conversational', 'recommender-system', 'llm', 'rag', 'nextjs', 'next15', 'pwa', 'next-pwa'],
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

export const viewport: Viewport = {
  themeColor: [{ media: '(prefers-color-scheme: dark)', color: '#2ca88d' }],
  minimumScale: 1,
  initialScale: 1,
  width: 'device-width',
  viewportFit: 'cover'
}

const themeColor: MantineColorsTuple = [
  '#e9fcf8',
  '#d9f5ef',
  '#b4eade',
  '#8bdecb',
  '#6ad4bc',
  '#55ceb2',
  '#47cbad',
  '#37b397',
  '#2aa086',
  '#0f8a73'
]

const theme = createTheme({
  colors: {
    themeColor
  },
  primaryColor: 'themeColor'
})

const inter = Inter({ subsets: ['latin'] })
export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme='auto' />
      </head>
      <body className={`${inter.className} antialiased`}>
        <MantineProvider theme={theme} defaultColorScheme='auto'>
          {children}
        </MantineProvider>
      </body>
    </html>
  )
}
