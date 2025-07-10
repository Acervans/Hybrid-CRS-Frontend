import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useContext, useEffect, useState } from 'react'

import { useAssistantRuntime } from '@assistant-ui/react'
import { CirclePlus, History, Trash } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { TooltipIconButton } from '@/components/assistant-ui/tooltip-icon-button'
import { Button } from '@/components/ui/button'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
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
  const assistantRuntime = useAssistantRuntime()

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

  const handleClickSession = (chatId: number) => {
    if (sessionId !== String(chatId)) {
      assistantRuntime.threads.switchToThread(String(chatId))
      router.replace(`${path}?sessionId=${encodeURIComponent(chatId)}`)
    } else {
      setOpen(false)
    }
  }

  useEffect(() => {
    const loadSessions = async () => {
      const chats = await getChatHistoriesByAgentId(supabase, agent.agentId)

      setSessions(chats)
    }

    const channel = supabase
      .channel('table-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ChatHistory',
          filter: `agent_id=eq.${agent.agentId}`
        },
        () => {
          loadSessions()
        }
      )
      .subscribe()

    loadSessions()

    return () => {
      channel.unsubscribe()
    }
  }, [agent.agentId, supabase])

  useEffect(() => {
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
                  assistantRuntime.threads.switchToNewThread()
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
          {sessions.length ? (
            sessions.map((session, index) => (
              <SidebarMenuItem key={session.chatId}>
                <SidebarMenuButton
                  asChild
                  tabIndex={0}
                  className={`h-12 cursor-pointer hover:bg-muted active:bg-muted rounded-none ${sessionId === String(session.chatId) ? 'bg-muted' : ''}`}
                  onClick={() => handleClickSession(session.chatId)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleClickSession(session.chatId)
                    }
                  }}
                >
                  <div className='flex items-center'>
                    <div className='flex flex-grow flex-col gap-1'>
                      <span className=''>{t('sessionTitle', { num: sessions.length - index })}</span>
                      <span className='text-muted-foreground text-xs'>
                        {formatDate(session.createdAt)}, {formatTime(session.createdAt)}
                      </span>
                    </div>
                    <div onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
                      <ConfirmationDialog
                        title={t('deleteSession')}
                        description={t('deleteSessionDescription', { num: sessions.length - index })}
                        cancelLabel={t('cancel')}
                        variant='destructive'
                        onConfirm={() => {
                          assistantRuntime.threads
                            .getItemById(String(session.chatId))
                            .delete()
                            .then(() => {
                              setSessions(sessions.filter(s => s.chatId !== session.chatId))
                              if (sessionId === String(session.chatId)) {
                                router.replace(path)
                              }
                            })
                        }}
                        trigger={
                          <div>
                            <TooltipIconButton
                              className='hover:text-primary text-foreground ml-auto mr-3 size-4 p-0'
                              variant='ghost'
                              tooltip={t('deleteSession')}
                            >
                              <Trash />
                            </TooltipIconButton>
                          </div>
                        }
                      />
                    </div>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))
          ) : (
            <span className='text-sm text-muted-foreground self-center italic mt-8 px-4'>
              {t('noPreviousSessions')}
            </span>
          )}
        </SidebarMenu>
      </SheetContent>
    </Sheet>
  )
}
