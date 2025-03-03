import { useContext, useEffect, type FC } from 'react'
import {
  ThreadListItemPrimitive,
  ThreadListPrimitive,
  useThreadListItem,
  useThreadListItemRuntime,
  useThreadRuntime
} from '@assistant-ui/react'
import { ArchiveIcon, PlusIcon, Trash } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { TooltipIconButton } from '@/components/assistant-ui/tooltip-icon-button'
import { generateTitle } from '@/lib/api'
import { ModelContext } from '@/contexts/modelContext'

export const ThreadList: FC = () => {
  return (
    <ThreadListPrimitive.Root className='flex flex-col items-stretch gap-1.5'>
      <ThreadListNew />
      <ThreadListItems />
    </ThreadListPrimitive.Root>
  )
}

const ThreadListNew: FC = () => {
  return (
    <ThreadListPrimitive.New asChild>
      <Button
        className='data-[active]:bg-sidebar-accent hover:bg-sidebar-accent flex items-center justify-start gap-1 rounded-lg px-2.5 py-2 text-start'
        variant='ghost'
      >
        <PlusIcon />
        New Thread
      </Button>
    </ThreadListPrimitive.New>
  )
}

const ThreadListItems: FC = () => {
  return <ThreadListPrimitive.Items components={{ ThreadListItem }} />
}

const ThreadListItem: FC = () => {
  const { model } = useContext(ModelContext)
  const threadRuntime = useThreadRuntime()
  const threadListItem = useThreadListItem()
  const threadListItemRuntime = useThreadListItemRuntime()

  useEffect(() => {
    if (!threadListItem.title) {
      setTimeout(() => {
        const firstMessage = threadRuntime.getMesssageByIndex(0).getState().content[0]

        if (firstMessage.type === 'text') {
          generateTitle(model, firstMessage.text)
            .then(title => {
              threadListItemRuntime.rename(title)
            })
            .catch(() => {
              threadListItemRuntime.rename('New Chat') // TODO translate
            })
        }
      }, 1500)
    }
    // eslint-disable-next-line
  }, [threadListItem.id])

  return (
    <ThreadListItemPrimitive.Root className='data-[active]:bg-sidebar-accent hover:bg-sidebar-accent focus-visible:bg-sidebar-accent focus-visible:ring-ring flex items-center gap-2 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2'>
      <ThreadListItemPrimitive.Trigger className='flex-grow px-3 py-2 text-start'>
        <ThreadListItemTitle />
      </ThreadListItemPrimitive.Trigger>
      <ThreadListItemDelete />
    </ThreadListItemPrimitive.Root>
  )
}

const ThreadListItemTitle: FC = () => {
  return (
    <p className='text-sm'>
      <ThreadListItemPrimitive.Title fallback='New Chat' />
    </p>
  )
}

// eslint-disable-next-line
const ThreadListItemArchive: FC = () => {
  return (
    <ThreadListItemPrimitive.Archive asChild>
      <TooltipIconButton
        className='hover:text-primary text-foreground ml-auto mr-3 size-4 p-0'
        variant='ghost'
        tooltip='Archive thread'
      >
        <ArchiveIcon />
      </TooltipIconButton>
    </ThreadListItemPrimitive.Archive>
  )
}

const ThreadListItemDelete: FC = () => {
  return (
    <ThreadListItemPrimitive.Delete asChild>
      <TooltipIconButton
        className='hover:text-primary text-foreground ml-auto mr-3 size-4 p-0'
        variant='ghost'
        tooltip='Delete thread'
      >
        <Trash />
      </TooltipIconButton>
    </ThreadListItemPrimitive.Delete>
  )
}
