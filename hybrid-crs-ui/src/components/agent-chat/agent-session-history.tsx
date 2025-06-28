import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useContext, useEffect, useState } from 'react'

import { CirclePlus, History } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { SupabaseContext } from '@/contexts/supabaseContext'
import { getChatHistoriesByAgentId } from '@/lib/supabase/client'

export function AgentSessionHistory(props: { agent: RecommenderAgent }) {
  const agent = props.agent
  const t = useTranslations('AgentChat')
  const locale = useLocale()
  const router = useRouter()
  const path = usePathname()
  const sessionId = useSearchParams().get('sessionId')
  const { supabase } = useContext(SupabaseContext)
  const [open, setOpen] = useState<boolean>(false)
  const [sessions, setSessions] = useState<ChatHistory[]>([])

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: 'numeric'
    })
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: 'numeric'
    })
  }

  useEffect(() => {
    const SESSIONS = [
      {
        userId: '1',
        chatId: 1,
        createdAt: Date.now(),
        chatTitle: undefined,
        agentId: 1,
        archived: false
      },
      {
        userId: '1',
        chatId: 2,
        createdAt: Date.now(),
        chatTitle: undefined,
        agentId: 1,
        archived: false
      },
      {
        userId: '1',
        chatId: 3,
        createdAt: Date.now(),
        chatTitle: undefined,
        agentId: 1,
        archived: false
      },
      {
        userId: '1',
        chatId: 4,
        createdAt: Date.now(),
        chatTitle: undefined,
        agentId: 1,
        archived: false
      },
      {
        userId: '1',
        chatId: 5,
        createdAt: Date.now() - 100000,
        chatTitle: undefined,
        agentId: 1,
        archived: false
      }
    ]

    const loadSessions = async () => {
      const chats = await getChatHistoriesByAgentId(supabase, agent.agentId)

      console.log(chats)
      // setSessions(chats.toSorted((a, b) => b.createdAt - a.createdAt))
      setSessions(SESSIONS.toSorted((a, b) => b.createdAt - a.createdAt))
    }

    loadSessions()
  }, [agent.agentId, supabase])

  useEffect(() => {
    console.log(agent)
    setOpen(false)
  }, [sessionId, agent])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant='default' size='sm' className='flex items-center gap-2 h-7 sm:h-8'>
          <History className='h-4 w-4' />
          {t('agentSessions')}
        </Button>
      </SheetTrigger>
      <SheetContent className='sm:max-w-xs'>
        <SheetHeader>
          <SheetTitle>{t('agentSessionsTitle')}</SheetTitle>
          <SheetDescription>{t('agentSessionsDescription')}</SheetDescription>
        </SheetHeader>
        <SidebarMenu className='gap-2'>
          <SidebarMenuItem>
            <SidebarMenuButton
              className={`h-8 hover:bg-muted active:bg-muted rounded-none ${!sessionId ? 'bg-muted' : ''}`}
              onClick={() => {
                if (sessionId !== null) {
                  router.replace(path)
                } else {
                  setOpen(false)
                }
              }}
            >
              <CirclePlus />
              <span>{t('newSession')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {sessions.map((session, index) => (
            <SidebarMenuItem key={session.chatId}>
              <SidebarMenuButton
                className={`h-12 hover:bg-muted active:bg-muted rounded-none ${sessionId === String(session.chatId) ? 'bg-muted' : ''}`}
                onClick={() => {
                  if (sessionId !== String(session.chatId)) {
                    router.replace(`${path}?sessionId=${encodeURIComponent(session.chatId)}`)
                  } else {
                    setOpen(false)
                  }
                }}
              >
                <div className='flex flex-col gap-1'>
                  <span className=''>{t('sessionTitle', { num: sessions.length - index })}</span>
                  <span className='text-muted-foreground text-xs'>
                    {formatDate(session.createdAt)}, {formatTime(session.createdAt)}
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SheetContent>
    </Sheet>
  )
}
