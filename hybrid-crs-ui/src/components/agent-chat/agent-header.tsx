import { Bot, Globe, Lock, User } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { AgentInfo } from '@/components/agent-chat/agent-info'
import { AgentSessionHistory } from '@/components/agent-chat/agent-session-history'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function AgentHeader(props: { agent: RecommenderAgent }) {
  const t = useTranslations('AgentChat')
  const agent = props.agent

  return (
    <div className='sticky h-22 sm:h-18 top-12 md:top-16 z-1 border-b bg-background/30 transition-[width,top] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:top-12'>
      <div className='container mx-auto px-4 py-2'>
        <div className='flex items-center justify-between gap-2'>
          <div className='flex flex-col gap-2'>
            <div className='flex gap-2'>
              <Bot className='h-6 w-6 hidden sm:block' />
              <h1 className='text-md sm:text-lg font-semibold break-words'>{agent.agentName}</h1>
            </div>
            <div className='hidden sm:flex items-center gap-2 text-sm text-muted-foreground'>
              <User className='h-3 w-3' />
              <span>{agent.username}</span>
              <Tooltip>
                <TooltipTrigger>
                  {agent.public ? (
                    <Globe className='h-3 w-3 text-green-600' />
                  ) : (
                    <Lock className='h-3 w-3 text-muted-foreground' />
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  <p>{agent.public ? t('public') : t('private')}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className='flex flex-col sm:flex-row gap-2'>
            <AgentInfo agent={agent} />
            <AgentSessionHistory agent={agent} />
          </div>
        </div>
      </div>
    </div>
  )
}
