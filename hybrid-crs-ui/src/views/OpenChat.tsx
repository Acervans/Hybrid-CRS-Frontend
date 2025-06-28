'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { useAssistantRuntime, useThreadList, useThreadListItem } from '@assistant-ui/react'
import { Loader2 } from 'lucide-react'
import { useEffectOnce } from 'react-use'

import { Thread } from '@/components/assistant-ui/thread'

export default function OpenChat() {
  const router = useRouter()
  const path = usePathname()
  const searchParams = useSearchParams()
  const chatId = useMemo(() => searchParams.get('chatId'), [searchParams])

  const assistantRuntime = useAssistantRuntime()
  const threads = useThreadList(m => m.threads)
  const threadListItem = useThreadListItem()
  const [loaded, setLoaded] = useState<boolean>(false)

  useEffect(() => {
    if (loaded) return

    const shouldInitThread = async () => {
      if (chatId !== null) {
        if (threads.length > 0) {
          assistantRuntime.threads.switchToThread(chatId).finally(() => setLoaded(true))
        }
      } else {
        setLoaded(true)
      }
    }

    shouldInitThread()
  }, [chatId, threads, assistantRuntime.threads, loaded])

  useEffectOnce(() => {
    if (threadListItem.remoteId && threadListItem.remoteId !== chatId) {
      router.replace(`${path}?chatId=${encodeURIComponent(threadListItem.remoteId)}`)
    }
  })

  if (!loaded) {
    return (
      <div className='absolute inset-0 flex items-center justify-center px-4'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    )
  }

  return <Thread />
}
