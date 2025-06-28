'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Bot } from 'lucide-react'
import { useTranslations } from 'next-intl'

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'

export function NavPlatform() {
  const t = useTranslations('Titles')
  const path = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t('platform')}</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <Link href='/agent-hub'>
            <SidebarMenuButton tooltip={t('agent-hub')} className={path === '/agent-hub' ? 'bg-sidebar-accent' : ''}>
              <Bot />
              <span>{t('agent-hub')}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
