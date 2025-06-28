'use client'

import { HTMLAttributes, ReactElement, useState } from 'react'

import { useComposerRuntime } from '@assistant-ui/react'
import { Search, SearchCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffectOnce } from 'react-use'

import { TooltipIconButton } from '@/components/assistant-ui/tooltip-icon-button'
import { Skeleton } from '@/components/ui/skeleton'

export default function WebSearch(props: HTMLAttributes<HTMLElement>): ReactElement {
  const { ...rest } = props
  const t = useTranslations('Chat')

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
          variant={active ? 'outline' : 'ghost'}
          side='top'
          onClick={async e => {
            e.preventDefault()
            composerRuntime.setRunConfig({ custom: { webSearch: !active } })
            setActive(active => !active)
          }}
          className={`${rest.className} ${active && 'text-green-500'}`}
        >
          {active ? <SearchCheck /> : <Search />}
        </TooltipIconButton>
      ) : (
        <Skeleton className={rest.className} />
      )}
    </>
  )
}
