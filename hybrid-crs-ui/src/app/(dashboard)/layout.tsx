'use client'

import { AppSidebar } from '@/components/layout/app-sidebar'
import { AppHeader } from '@/components/layout/app-header'
import { SidebarInset } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/toaster'

import 'regenerator-runtime/runtime'

export default function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <div className='h-full'>{children}</div>
      </SidebarInset>
      <Toaster />
    </>
  )
}
