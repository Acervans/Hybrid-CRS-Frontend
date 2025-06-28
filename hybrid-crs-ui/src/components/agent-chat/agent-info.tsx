import { Calendar, Database, Globe, Info, Lock, User } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function AgentInfo(props: { agent: RecommenderAgent }) {
  const agent = props.agent
  const t = useTranslations('AgentChat')
  const locale = useLocale()

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='default' size='sm' className='flex items-center gap-2 h-7 sm:h-8 justify-baseline'>
          <Info className='h-4 w-4' />
          {t('agentInfo')}
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>{agent.agentName}</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <User className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm'>{agent.username}</span>
            </div>
            <div className='flex items-center gap-2'>
              <Database className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm'>{agent.datasetName}</span>
            </div>
            <div className='flex items-center gap-2'>
              <Calendar className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm'>{formatDate(agent.createdAt)}</span>
            </div>
            <div className='flex items-center gap-2'>
              {agent.public ? (
                <Globe className='h-4 w-4 text-green-600' />
              ) : (
                <Lock className='h-4 w-4 text-muted-foreground' />
              )}
              <span className='text-sm'>{agent.public ? t('public') : t('private')}</span>
            </div>
          </div>

          {agent.description && (
            <div>
              <h4 className='font-medium text-sm mb-2'>{t('description')}</h4>
              <p className='text-sm text-muted-foreground leading-relaxed'>{agent.description}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
