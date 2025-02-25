'use client'

import { HTMLAttributes, ReactElement, useState } from 'react'
import { useTranslations } from 'next-intl'
import { SearchCheck, SearchX } from 'lucide-react'

import { useEffectOnce } from 'react-use'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipIconButton } from '@/components/assistant-ui/tooltip-icon-button'
import { useComposerRuntime } from '@assistant-ui/react'

export default function WebSearch(props: HTMLAttributes<HTMLElement>): ReactElement {
  const { ...rest } = props
  const t = useTranslations('Chats')

  const [loaded, setLoaded] = useState<boolean>(false)
  const [active, setActive] = useState<boolean>(false)
  const composerRuntime = useComposerRuntime()

  useEffectOnce(() => {
    setLoaded(true)
  })

  return (
    <>
      {loaded ? (
        <TooltipIconButton
          {...rest}
          tooltip={t('webSearch')}
          variant='ghost'
          side='top'
          onClick={async () => {
            composerRuntime.setRunConfig({ custom: { webSearch: !active } })
            setActive(active => !active)
          }}
          className={`${rest.className} my-2.5 size-8 p-2 transition-opacity ease-in ${active ? 'text-green-500' : 'text-gray-500'}`}
        >
          {active ? <SearchCheck /> : <SearchX />}
        </TooltipIconButton>
      ) : (
        <Skeleton className={rest.className} />
      )}
    </>
  )
}
