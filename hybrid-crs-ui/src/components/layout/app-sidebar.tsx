'use client'

import * as React from 'react'

import { BookOpen, Bot, Frame, Map, PieChart, Settings2, SquareTerminal } from 'lucide-react'

import { NavAuth } from '@/components/layout/nav-auth'
import { NavChats } from '@/components/layout/nav-chats'
import { NavHeader } from '@/components/layout/nav-header'
import { NavMain } from '@/components/layout/nav-main'
import { NavProjects } from '@/components/layout/nav-projects'
import { NavResources } from '@/components/layout/nav-resources'
import { NavUser } from '@/components/layout/nav-user'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/icons/icon-96x96.png'
  },
  navMain: [
    {
      title: 'Playground',
      url: '#',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: 'History',
          url: '#'
        },
        {
          title: 'Starred',
          url: '#'
        },
        {
          title: 'Settings',
          url: '#'
        }
      ]
    },
    {
      title: 'Models',
      url: '#',
      icon: Bot,
      items: [
        {
          title: 'Genesis',
          url: '#'
        },
        {
          title: 'Explorer',
          url: '#'
        },
        {
          title: 'Quantum',
          url: '#'
        }
      ]
    },
    {
      title: 'Documentation',
      url: '#',
      icon: BookOpen,
      items: [
        {
          title: 'Introduction',
          url: '#'
        },
        {
          title: 'Get Started',
          url: '#'
        },
        {
          title: 'Tutorials',
          url: '#'
        },
        {
          title: 'Changelog',
          url: '#'
        }
      ]
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '#'
        },
        {
          title: 'Team',
          url: '#'
        },
        {
          title: 'Billing',
          url: '#'
        },
        {
          title: 'Limits',
          url: '#'
        }
      ]
    }
  ],
  projects: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: Frame
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: PieChart
    },
    {
      name: 'Travel',
      url: '#',
      icon: Map
    }
  ]
}

export function AppSidebar({
  authenticated,
  ...props
}: React.ComponentProps<typeof Sidebar> & { authenticated: boolean }) {
  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <NavHeader />
      </SidebarHeader>
      <SidebarContent>
        {authenticated ? (
          <>
            <NavChats />
            <NavResources />
            <NavMain items={data.navMain} />
            <NavProjects projects={data.projects} />
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
