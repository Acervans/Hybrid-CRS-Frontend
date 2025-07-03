'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useContext, useEffect, useMemo } from 'react'

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
import { WorkflowProvider } from '@/contexts/workflowContext'
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

  // Full rerender on locale/model/agent change when in /chat
  const assistantKey = useMemo(() => {
    if (path.startsWith('/chat')) {
      const agentId = path === '/chat/open-chat' ? '' : `${path.split('/').at(-1)}-`

      return `${locale}-${model}-${agentId}${!!auth?.data?.user}`
    }
    return String(!!auth?.data?.user)
  }, [path, locale, model, auth?.data?.user])

  return (
    <WorkflowProvider>
      <AssistantProvider key={assistantKey}>
        <AppSidebar authenticated={!!auth?.data?.user} />
        <SidebarInset className='min-w-0'>
          <AppHeader authenticated={!!auth?.data?.user} />
          <div className='h-full'>{children}</div>
        </SidebarInset>
        <Toaster />
      </AssistantProvider>
    </WorkflowProvider>
  )
}
