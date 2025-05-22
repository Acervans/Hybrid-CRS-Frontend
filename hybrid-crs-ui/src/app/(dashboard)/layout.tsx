'use client'

import { useSearchParams } from 'next/navigation'
import { useContext } from 'react'

import { CredentialResponse } from 'google-one-tap'
import { useEffectOnce } from 'react-use'
import 'regenerator-runtime/runtime'

import { AppHeader } from '@/components/layout/app-header'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SidebarInset } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/toaster'
import { AssistantProvider } from '@/contexts/assistantProvider'
import { AuthContext } from '@/contexts/authContext'
import { handleLoginWithGoogle } from '@/lib/actions'

export default function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const { auth, handleLogin } = useContext(AuthContext)
  const next = useSearchParams().get('next')

  useEffectOnce(() => {
    window.handleLoginWithGoogle = async (response: CredentialResponse) =>
      handleLoginWithGoogle(response).then(() => handleLogin(next || '/'))
  })

  return (
    <AssistantProvider>
      <AppSidebar authenticated={!!auth?.data?.user} />
      <SidebarInset>
        <AppHeader authenticated={!!auth?.data?.user} />
        <div className='h-full'>{children}</div>
      </SidebarInset>
      <Toaster />
    </AssistantProvider>
  )
}
