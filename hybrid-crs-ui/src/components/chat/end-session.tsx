'use client'

import { HTMLAttributes, ReactElement, useContext, useState } from 'react'

import { useComposerRuntime } from '@assistant-ui/react'
import { CircleX } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffectOnce } from 'react-use'

import { TooltipIconButton } from '@/components/assistant-ui/tooltip-icon-button'
import { Skeleton } from '@/components/ui/skeleton'
import { WorkflowContext } from '@/contexts/workflowContext'

export default function EndSession(props: HTMLAttributes<HTMLElement>): ReactElement {
  const { ...rest } = props
  const t = useTranslations('Chat')
  const { abortWorkflow, workflowId } = useContext(WorkflowContext)
  const [loaded, setLoaded] = useState<boolean>(false)
  const composerRuntime = useComposerRuntime()

  useEffectOnce(() => {
    setLoaded(true)
  })

  return (
    <>
      {loaded ? (
        <TooltipIconButton
          {...rest}
          tooltip={t('endSession')}
          variant='ghost'
          side='top'
          disabled={workflowId === null}
          onClick={async e => {
            e.preventDefault()
            composerRuntime.cancel()
            abortWorkflow()
          }}
        >
          <CircleX />
        </TooltipIconButton>
      ) : (
        <Skeleton className={rest.className} />
      )}
    </>
  )
}
