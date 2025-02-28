'use client'

import * as React from 'react'
import {
  AudioWaveform,
  BookOpen,
  BookText,
  Bot,
  Command,
  Frame,
  Map,
  PieChart,
  Settings2,
  SquareTerminal
} from 'lucide-react'

import { NavMain } from '@/components/layout/nav-main'
import { NavProjects } from '@/components/layout/nav-projects'
import { NavUser } from '@/components/layout/nav-user'
import { TeamSwitcher } from '@/components/layout/team-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { ThreadList } from '@/components/assistant-ui/thread-list'
import Image from 'next/image'
import { apiUrl } from '@/constants'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/icons/icon-96x96.png'
  },
  teams: [
    {
      name: 'Acme Inc',
      logo: () => <Image src='/icons/icon-256x256.png' width={45} height={45} alt='Logo' />,
      plan: 'Enterprise'
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup'
    },
    {
      name: 'Evil Corp.',
      logo: Command,
      plan: 'Free'
    }
  ],
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const pathname = usePathname()
  const openChatUrl = '/chats/open-chat'

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />

        <SidebarMenu>
          <Collapsible asChild open={pathname === openChatUrl} className='group/collapsible p-2'>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={'Open Chat'}
                onClick={() => {
                  if (pathname !== openChatUrl) {
                    router.push(openChatUrl)
                  }
                }}
              >
                <Bot />
                <span>Open Chat</span>
              </SidebarMenuButton>
              {pathname === openChatUrl && (
                <CollapsibleContent>
                  <SidebarMenuSub className='mr-0'>
                    <ThreadList />
                  </SidebarMenuSub>
                </CollapsibleContent>
              )}
            </SidebarMenuItem>
          </Collapsible>
          <Link href={`${apiUrl}/docs`} target='_blank' className='p-2'>
            {' '}
            {/* Temporary, to be NavExtras */}
            <SidebarMenuButton tooltip={'API Documentation'}>
              <BookText />
              <span>{'API Documentation'}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
