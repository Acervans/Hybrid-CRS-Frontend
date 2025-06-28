'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { ChevronRight, MessagesSquare } from 'lucide-react'
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

export function NavChat() {
  const t = useTranslations('Titles')
  const path = usePathname()
  const inOpenChat = path === '/chat/open-chat'
  const [open, setOpen] = useState<boolean>(inOpenChat)

  const openChatButton = (
    <SidebarMenuButton
      tooltip={t('open-chat')}
      onClick={() => {
        if (!inOpenChat) {
          setOpen(true)
        } else {
          setOpen(!open)
        }
      }}
    >
      <MessagesSquare />
      <span>{t('open-chat')}</span>
      <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
    </SidebarMenuButton>
  )

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t('chat')}</SidebarGroupLabel>
      <SidebarMenu>
        <Collapsible asChild open={inOpenChat && open} className='group/collapsible'>
          <SidebarMenuItem>
            {!inOpenChat ? <Link href='/chat/open-chat'>{openChatButton}</Link> : openChatButton}
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
