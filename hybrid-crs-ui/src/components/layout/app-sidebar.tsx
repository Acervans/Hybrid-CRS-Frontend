'use client'

import { usePathname } from 'next/navigation'
import * as React from 'react'
import { useEffect } from 'react'

import { NavActions } from '@/components/layout/nav-actions'
import { NavAuth } from '@/components/layout/nav-auth'
import { NavChat } from '@/components/layout/nav-chat'
import { NavHeader } from '@/components/layout/nav-header'
import { NavPlatform } from '@/components/layout/nav-platform'
import { NavResources } from '@/components/layout/nav-resources'
import { NavUser } from '@/components/layout/nav-user'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, useSidebar } from '@/components/ui/sidebar'

export function AppSidebar({
  authenticated,
  ...props
}: React.ComponentProps<typeof Sidebar> & { authenticated: boolean }) {
  const { openMobile, setOpenMobile } = useSidebar()
  const pathname = usePathname()

  useEffect(() => {
    if (openMobile) setOpenMobile(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <NavHeader />
      </SidebarHeader>
      <SidebarContent>
        {authenticated ? (
          <>
            <NavPlatform />
            <NavChat />
            <NavActions />
            <NavResources />
          </>
        ) : (
          <NavAuth />
        )}
      </SidebarContent>
      {authenticated && (
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
      )}
      <SidebarRail />
    </Sidebar>
  )
}
