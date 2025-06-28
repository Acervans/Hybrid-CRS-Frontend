'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

import { LogIn, UserPlus } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton } from '@/components/ui/sidebar'

export function NavAuth() {
  const t = useTranslations('Auth')
  const path = usePathname()
  const next = useSearchParams().get('next')
  const nextParam = next ? `?next=${next}` : ''

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t('auth')}</SidebarGroupLabel>
      <SidebarMenu>
        <Link href={`/login${nextParam}`}>
          <SidebarMenuButton tooltip={t('login')} className={path === '/login' ? 'bg-sidebar-accent' : ''}>
            <LogIn />
            <span>{t('login')}</span>
          </SidebarMenuButton>
        </Link>
        <Link href={`/signup${nextParam}`}>
          <SidebarMenuButton tooltip={t('signup')} className={path === '/signup' ? 'bg-sidebar-accent' : ''}>
            <UserPlus />
            <span>{t('signup')}</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenu>
    </SidebarGroup>
  )
}
