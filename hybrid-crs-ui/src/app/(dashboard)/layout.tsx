'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useContext, useEffect } from 'react'

import { CredentialResponse } from 'google-one-tap'
import { useLocale } from 'next-intl'
import 'regenerator-runtime/runtime'

import { AppHeader } from '@/components/layout/app-header'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SidebarInset } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/toaster'
import { AssistantProvider } from '@/contexts/assistantProvider'
import { ModelContext } from '@/contexts/modelContext'
import { SupabaseContext } from '@/contexts/supabaseContext'
import { handleLoginWithGoogle } from '@/lib/actions'

export default function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = useLocale()
  const path = usePathname()
  const next = useSearchParams().get('next')
  const { auth, handleLogin } = useContext(SupabaseContext)
  const { model } = useContext(ModelContext)

  useEffect(() => {
    window.handleLoginWithGoogle = async (response: CredentialResponse) =>
      handleLoginWithGoogle(response).then(() => handleLogin(next || '/'))
  }, [next, handleLogin])

  // Full rerender on locale/model change when in /chat
  const chatKey = path.startsWith('/chat') ? `${locale}-${model}-` : ''
  const assistantKey = `${chatKey}${!!auth?.data?.user}`

  return (
    <AssistantProvider key={assistantKey}>
      <AppSidebar authenticated={!!auth?.data?.user} />
      <SidebarInset className='min-w-0'>
        <AppHeader authenticated={!!auth?.data?.user} />
        <div className='h-full'>{children}</div>
      </SidebarInset>
      <Toaster />
    </AssistantProvider>
  )
}
