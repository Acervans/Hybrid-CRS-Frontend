'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type React from 'react'
import { useContext, useEffect, useState } from 'react'

import { CirclePlus, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { AgentHeader } from '@/components/agent-chat/agent-header'
import { AgentThread } from '@/components/agent-chat/agent-thread'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ModelContext } from '@/contexts/modelContext'
import { SupabaseContext } from '@/contexts/supabaseContext'
import { getRecommenderAgentById } from '@/lib/supabase/client'

export function AgentChat({ agentId }: { agentId: string | number }) {
  const router = useRouter()
  const t = useTranslations('AgentChat')
  const path = usePathname()
  const sessionId = useSearchParams().get('sessionId')
  const { supabase } = useContext(SupabaseContext)
  const { agent, setAgent } = useContext(ModelContext)
  const [noAccess, setNoAccess] = useState<boolean>(false)

  useEffect(() => {
    getRecommenderAgentById(supabase, Number(agentId)).then(agent => {
      if (agent) {
        setAgent(agent)

        document.title = `${agent.agentName} | HybridCRS`
      } else {
        setNoAccess(true)
      }
    })

    return () => setAgent(undefined)
  }, [agentId, setAgent, supabase])

  if (!agent && !noAccess) {
    return (
      <div className='absolute inset-0 flex items-center justify-center px-4'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    )
  }

  if (noAccess) {
    return (
      <div className='absolute inset-0 flex items-center justify-center px-4'>
        <p className='text-muted-foreground text-center'>{t('noAccess')}</p>
      </div>
    )
  }

  if (agent && !agent.processed) {
    return (
      <div className='absolute inset-0 flex items-center justify-center px-4'>
        <p className='text-muted-foreground text-center'>{t('processing')}</p>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className='flex flex-col h-full'>
        <AgentHeader agent={agent!} />
        <AgentThread archived={!!sessionId} />

        {sessionId && (
          <Button
            onClick={() => router.replace(path)}
            className='fixed rounded-xl text-md p-5! sm:bottom-6 sm:right-6 sm:left-auto sm:translate-x-0 bottom-3 left-1/2 -translate-x-1/2 shadow-lg hover:shadow-xl transition-shadow z-50'
          >
            <CirclePlus className='size-5' />
            {t('newSession')}
          </Button>
        )}
      </div>
    </TooltipProvider>
  )
}
