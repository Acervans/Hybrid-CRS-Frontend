'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Calendar, Database, Edit, Globe, Loader2, Lock, MessageCircle, Sparkle, Trash2, User } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { EditAgentModal } from '@/components/agent-hub/edit-agent-modal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface AgentCardProps {
  agent: RecommenderAgent
  isOwner: boolean
  onEdit?: (agent: RecommenderAgent) => void
  onRetrain?: (agentId: number) => void
  onDelete?: (agentId: number) => void
}

export function AgentCard({ agent, isOwner, onEdit, onRetrain, onDelete }: AgentCardProps) {
  const t = useTranslations('AgentHub.AgentCard')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const locale = useLocale()

  const handleEdit = () => {
    setIsEditModalOpen(true)
  }

  const handleEditSave = (updatedAgent: Partial<RecommenderAgent>) => {
    if (onEdit) {
      onEdit({ ...agent, ...updatedAgent })
    }
    setIsEditModalOpen(false)
  }

  const handleRetrain = () => {
    if (onRetrain) {
      onRetrain(agent.agentId)
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(agent.agentId)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <TooltipProvider>
      <Card className='h-85 flex flex-col relative min-w-0 py-4 gap-3'>
        <CardHeader className='flex-shrink-0 px-4'>
          <div className='flex items-start justify-between'>
            <div className='flex-1 min-w-0'>
              <CardTitle className='text-lg truncate' title={agent.agentName}>
                <div
                  tabIndex={0}
                  className='truncate hover:whitespace-normal hover:overflow-visible focus-within:whitespace-normal focus-within:overflow-visible'
                >
                  {agent.agentName}
                </div>
              </CardTitle>
              <div className='flex items-center gap-2 mt-1'>
                <User className='h-4 w-4 text-muted-foreground' />
                <p className='text-sm text-muted-foreground truncate' title={agent.username}>
                  {agent.username}
                </p>
              </div>
            </div>
            <Tooltip>
              <TooltipTrigger className='ml-1.5'>
                {agent.public ? (
                  <Globe className='h-4 w-4 text-green-600' />
                ) : (
                  <Lock className='h-4 w-4 text-muted-foreground' />
                )}
              </TooltipTrigger>
              <TooltipContent>
                <p>{agent.public ? t('public') : t('private')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>

        <CardContent className='flex-1 flex flex-col min-h-0 px-4'>
          <div className='flex-shrink-0 space-y-3 mb-3'>
            <div className='flex items-center gap-2'>
              <Database className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium truncate' title={agent.datasetName}>
                {agent.datasetName}
              </span>
            </div>

            <div className='flex items-center gap-2'>
              <Calendar className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm text-muted-foreground'>{formatDate(agent.createdAt)}</span>
            </div>
          </div>

          <div className='flex-1 min-h-0 mb-2.5'>
            <ScrollArea className='h-full [mask-image:linear-gradient(to_bottom,black_94%,transparent_100%)]'>
              <p className='text-sm text-muted-foreground leading-relaxed pr-2'>
                {agent.description ? agent.description : <em>{t('noDescription')}</em>}
              </p>
            </ScrollArea>
          </div>

          <div className='flex-shrink-0 pt-3 border-t space-y-2'>
            {isOwner && (
              <div className='flex gap-2'>
                <div className='grid grid-cols-2 gap-2 w-full'>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='outline'
                        size='sm'
                        onFocus={e => {
                          if (!e.relatedTarget) e.preventDefault()
                        }}
                        onClick={handleEdit}
                        className='w-full'
                      >
                        <Edit className='h-4 w-4 mr-1' />
                        {t('edit')}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t('editTitle')}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <ConfirmationDialog
                      title={t('retrainTitle')}
                      description={`${
                        !!agent.newSessions
                          ? t('retrainDescriptionSessions', {
                              agentName: agent.agentName,
                              numSessions: agent.newSessions
                            })
                          : t('retrainDescription', {
                              agentName: agent.agentName
                            })
                      } ${t('retrainTakeAWhile')}`}
                      confirmLabel={t('retrain')}
                      cancelLabel={t('cancel')}
                      variant='default'
                      onConfirm={handleRetrain}
                      disabled={!agent.processed}
                      trigger={
                        <TooltipTrigger asChild>
                          <Button
                            variant='outline'
                            size='sm'
                            className='w-full relative'
                            disabled={!agent.processed}
                            onFocus={e => {
                              if (!e.relatedTarget) e.preventDefault()
                            }}
                          >
                            <Sparkle className='h-4 w-4' />
                            {t('retrain')}
                            {!!agent.newSessions && (
                              <Badge
                                variant='secondary'
                                className='absolute -top-3 -right-1.5 h-5 p-1 text-xs text-secondary-foreground'
                              >
                                {agent.newSessions > 99 ? '99+' : agent.newSessions}
                              </Badge>
                            )}
                          </Button>
                        </TooltipTrigger>
                      }
                    />
                    <TooltipContent>
                      {`${t('retrainTitle')}${agent.newSessions ? ` (${t('newSessions', { newSessions: agent.newSessions })})` : ''}`}
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Tooltip>
                  <ConfirmationDialog
                    title={t('deleteTitle')}
                    description={t('deleteDescription', { agentName: agent.agentName })}
                    confirmLabel={t('delete')}
                    cancelLabel={t('cancel')}
                    variant='destructive'
                    onConfirm={handleDelete}
                    disabled={!agent.processed}
                    trigger={
                      <TooltipTrigger asChild>
                        <Button
                          variant='outline'
                          size='sm'
                          className='text-red-600 hover:text-red-700'
                          disabled={!agent.processed}
                          onFocus={e => {
                            if (!e.relatedTarget) e.preventDefault()
                          }}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </TooltipTrigger>
                    }
                  />
                  <TooltipContent>{t('deleteTitle')}</TooltipContent>
                </Tooltip>
              </div>
            )}
            {agent.processed ? (
              <Button asChild className='w-full' title={t('start')}>
                <Link href={`/chat/${agent.agentId}`} prefetch={false}>
                  <MessageCircle className='h-4 w-4 mr-2' />
                  {t('start')}
                </Link>
              </Button>
            ) : (
              <Button disabled className='w-full' title={t('processingTitle')}>
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                {t('processing')}
              </Button>
            )}
          </div>
        </CardContent>

        {/* Edit Modal */}
        <EditAgentModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          agent={agent}
          onSave={handleEditSave}
        />
      </Card>
    </TooltipProvider>
  )
}
