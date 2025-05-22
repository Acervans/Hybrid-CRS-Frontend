'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

import { Bot, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { ThreadList } from '@/components/assistant-ui/thread-list'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub
} from '@/components/ui/sidebar'

export function NavChats() {
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('Titles')
  const inOpenChat = pathname === '/chats/open-chat'
  const [open, setOpen] = useState<boolean>(inOpenChat)

  return (
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
  )
}
