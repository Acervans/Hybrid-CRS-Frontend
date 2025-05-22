'use client'

import Link from 'next/link'

import { BookText } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton } from '@/components/ui/sidebar'
import { apiUrl } from '@/constants'

export function NavResources() {
  const t = useTranslations('Titles')

  return (
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
  )
}
