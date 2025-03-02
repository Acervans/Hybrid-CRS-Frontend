'use client'

import * as React from 'react'
import {
  AudioWaveform,
  BookOpen,
  BookText,
  Bot,
  ChevronRight,
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
  SidebarMenuSub,
  SidebarGroup,
  SidebarGroupLabel
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { ThreadList } from '@/components/assistant-ui/thread-list'
import Image from 'next/image'
import { apiUrl } from '@/constants'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

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
  const t = useTranslations('Titles')
  const inOpenChat = pathname === '/chats/open-chat'
  const [open, setOpen] = React.useState<boolean>(inOpenChat)

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('chats')}</SidebarGroupLabel>
          <SidebarMenu>
            <Collapsible asChild open={inOpenChat && open} className='group/collapsible'>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={t('open-chat')}
                  onClick={() => {
                    if (!inOpenChat) {
                      router.push('/chats/open-chat')
                      setOpen(true)
                    } else {
                      setOpen(!open)
                    }
                  }}
                >
                  <Bot />
                  <span>{t('open-chat')}</span>
                  <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                </SidebarMenuButton>
                {inOpenChat && (
                  <CollapsibleContent>
                    <SidebarMenuSub className='mr-0 mt-1'>
                      <ThreadList />
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t('resources')}</SidebarGroupLabel>
          <SidebarMenu>
            <Link href={`${apiUrl}/docs`} target='_blank'>
              <SidebarMenuButton tooltip={t('api-docs')}>
                <BookText />
                <span>{t('api-docs')}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenu>
        </SidebarGroup>

        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
