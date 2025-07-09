import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { type FC } from 'react'

import { ThreadListItemPrimitive, ThreadListPrimitive, useThreadListItem } from '@assistant-ui/react'
import { ArchiveIcon, PlusIcon, Trash } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { TooltipIconButton } from '@/components/assistant-ui/tooltip-icon-button'
import { Button } from '@/components/ui/button'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'

export const ThreadList: FC = () => {
  const t = useTranslations('Chat.Thread')

  return (
    <ThreadListPrimitive.Root className='flex flex-col items-stretch gap-1.5'>
      <ThreadListNew t={t} />
      <ThreadListItems />
    </ThreadListPrimitive.Root>
  )
}

const ThreadListNew: FC<{ t: ReturnType<typeof useTranslations> }> = ({ t }) => {
  const router = useRouter()
  const path = usePathname()
  const searchParams = useSearchParams()

  return (
    <ThreadListPrimitive.New asChild>
      <Button
        className='data-[active]:bg-sidebar-accent hover:bg-sidebar-accent flex items-center justify-start gap-1 rounded-lg px-2.5 py-2 text-start'
        variant='ghost'
        onClick={async () => {
          if (searchParams.has('chatId')) {
            router.replace(path)
          }
        }}
      >
        <PlusIcon />
        {t('newThread')}
      </Button>
    </ThreadListPrimitive.New>
  )
}

const ThreadListItems: FC = () => {
  return <ThreadListPrimitive.Items components={{ ThreadListItem }} />
}

const ThreadListItem: FC = () => {
  const t = useTranslations('Chat.Thread')
  const router = useRouter()
  const path = usePathname()
  const threadListItem = useThreadListItem()

  return (
    <ThreadListItemPrimitive.Root className='data-[active]:bg-sidebar-accent hover:bg-sidebar-accent focus-visible:bg-sidebar-accent focus-visible:ring-ring flex items-center gap-2 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2'>
      <ThreadListItemPrimitive.Trigger
        className='flex-grow px-3 py-2 text-start'
        onClick={async () => {
          router.replace(`${path}?chatId=${encodeURIComponent(threadListItem.remoteId!)}`)
        }}
      >
        <ThreadListItemTitle t={t} />
      </ThreadListItemPrimitive.Trigger>
      <ThreadListItemDelete t={t} />
    </ThreadListItemPrimitive.Root>
  )
}

const ThreadListItemTitle: FC<{ t: ReturnType<typeof useTranslations> }> = ({ t }) => {
  return (
    <p className='text-sm'>
      <ThreadListItemPrimitive.Title fallback={t('newChat')} />
    </p>
  )
}

// eslint-disable-next-line
const ThreadListItemArchive: FC<{ t: ReturnType<typeof useTranslations> }> = ({ t }) => {
  return (
    <ThreadListItemPrimitive.Archive asChild>
      <TooltipIconButton
        className='hover:text-primary text-foreground ml-auto mr-3 size-4 p-0'
        variant='ghost'
        tooltip={t('archiveThread')}
      >
        <ArchiveIcon />
      </TooltipIconButton>
    </ThreadListItemPrimitive.Archive>
  )
}

const ThreadListItemDelete: FC<{ t: ReturnType<typeof useTranslations> }> = ({ t }) => {
  const router = useRouter()
  const path = usePathname()
  const searchParams = useSearchParams()
  const threadListItem = useThreadListItem()

  return (
    <ConfirmationDialog
      title={t('deleteThread')}
      description={t('deleteThreadDescription', { threadTitle: threadListItem.title ?? t('newChat') })}
      cancelLabel={t('cancel')}
      variant='destructive'
      confirmButton={
        <ThreadListItemPrimitive.Delete asChild>
          <Button variant='destructive' type='submit'>
            {t('delete')}
          </Button>
        </ThreadListItemPrimitive.Delete>
      }
      trigger={
        <TooltipIconButton
          className='hover:text-primary text-foreground ml-auto mr-3 size-4 p-0'
          variant='ghost'
          tooltip={t('deleteThread')}
          onClick={() => {
            if (searchParams.get('chatId') === threadListItem.remoteId) {
              router.replace(path)
            }
          }}
        >
          <Trash />
        </TooltipIconButton>
      }
    />
  )
}
