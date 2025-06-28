'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { CirclePlus } from 'lucide-react'
import { useTranslations } from 'next-intl'

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'

export function NavActions() {
  const t = useTranslations('Titles')
  const path = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t('actions')}</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <Link href='/create-agent'>
            <SidebarMenuButton
              className={path === '/create-agent' ? 'bg-sidebar-accent' : ''}
              tooltip={t('create-agent')}
            >
              <CirclePlus />
              <span>{t('create-agent')}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
