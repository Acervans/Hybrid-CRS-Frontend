import type { FC } from 'react'

import {
  ActionBarPrimitive,
  BranchPickerPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useComposerRuntime
} from '@assistant-ui/react'
import {
  ArrowDownIcon,
  AudioLinesIcon,
  Bot,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  PencilIcon,
  RefreshCwIcon,
  SendHorizontalIcon,
  StopCircleIcon
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import {
  ComposerAddAttachment,
  ComposerAttachments,
  UserMessageAttachments
} from '@/components/assistant-ui/attachment'
import { ThreadFollowupSuggestions } from '@/components/assistant-ui/follow-up-suggestions'
import { MarkdownText } from '@/components/assistant-ui/markdown-text'
import { ToolFallback } from '@/components/assistant-ui/tool-fallback'
import { TooltipIconButton } from '@/components/assistant-ui/tooltip-icon-button'
import VoiceChat from '@/components/chat/voice-chat'
import WebSearch from '@/components/chat/web-search'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const Thread: FC = () => {
  const t = useTranslations('Chat')

  return (
    <ThreadPrimitive.Root className='bg-background box-border h-[calc(100dvh-3rem)] md:h-[calc(100dvh-4rem)] group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-[calc(100dvh-3rem)]'>
      <ThreadPrimitive.Viewport className='flex h-full flex-col items-center overflow-y-auto scroll-smooth bg-inherit px-3 sm:px-6'>
        <ThreadWelcome t={t} />

        <ThreadPrimitive.Messages
          components={{
            UserMessage: UserMessage,
            EditComposer: EditComposer,
            AssistantMessage: AssistantMessage
          }}
        />

        <ThreadFollowupSuggestions />

        <ThreadPrimitive.If empty={false}>
          <div className='min-h-2 flex-grow' />
        </ThreadPrimitive.If>

        <div className='max-w-aui-thread sticky bottom-0 mt-3 flex w-full flex-col items-center justify-end rounded-t-lg bg-inherit pb-4'>
          <ThreadScrollToBottom t={t} />
          <Composer t={t} />
        </div>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  )
}

const ThreadScrollToBottom: FC<{ t: ReturnType<typeof useTranslations> }> = ({ t }) => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip={t('scrollBottom')}
        variant='outline'
        className='absolute -top-8 rounded-full disabled:invisible'
      >
        <ArrowDownIcon />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  )
}

const ThreadWelcome: FC<{ t: ReturnType<typeof useTranslations> }> = ({ t }) => {
  return (
    <ThreadPrimitive.Empty>
      <div className='max-w-aui-thread flex w-full flex-grow flex-col'>
        <div className='flex w-full flex-grow flex-col items-center justify-center'>
          <Avatar>
            <Bot className='mx-auto my-auto' />
          </Avatar>
          <p className='mt-4 font-medium text-center'>{t('welcome')}</p>
        </div>
        <ThreadWelcomeSuggestions t={t} />
      </div>
    </ThreadPrimitive.Empty>
  )
}

const ThreadWelcomeSuggestions: FC<{ t: ReturnType<typeof useTranslations> }> = ({ t }) => {
  return (
    <div className='mt-3 flex w-full items-stretch justify-center gap-4'>
      <ThreadPrimitive.Suggestion
        className='hover:bg-muted/80 flex max-w-sm grow basis-0 flex-col items-center justify-center rounded-lg border p-3 transition-colors ease-in'
        prompt={t('suggestionA')}
        method='replace'
        autoSend
      >
        <span className='line-clamp-2 text-ellipsis text-sm font-semibold'>{t('suggestionA')}</span>
      </ThreadPrimitive.Suggestion>
      <ThreadPrimitive.Suggestion
        className='hover:bg-muted/80 flex max-w-sm grow basis-0 flex-col items-center justify-center rounded-lg border p-3 transition-colors ease-in'
        prompt={t('suggestionB')}
        method='replace'
        autoSend
      >
        <span className='line-clamp-2 text-ellipsis text-sm font-semibold'>{t('suggestionB')}</span>
      </ThreadPrimitive.Suggestion>
    </div>
  )
}

const Composer: FC<{ t: ReturnType<typeof useTranslations> }> = ({ t }) => {
  const composerRuntime = useComposerRuntime()

  return (
    <ComposerPrimitive.Root className='focus-within:border-ring/20 flex w-full flex-wrap items-end rounded-lg border bg-inherit px-2.5 shadow-sm transition-colors ease-in'>
      <ComposerAttachments />
      <ComposerAddAttachment t={t} />

      <ComposerPrimitive.Input
        rows={1}
        autoFocus
        placeholder={t('placeholder')}
        className='placeholder:text-muted-foreground max-h-40 w-0 grow resize-none border-none bg-transparent pl-2 sm:px-2 py-4 text-sm outline-none focus:ring-0 disabled:cursor-not-allowed'
        onPaste={e => {
          const files = e.clipboardData.files

          if (files.length) {
            e.preventDefault()
            Array.from(files).forEach(file => {
              composerRuntime.addAttachment(file)
            })
          }
        }}
      />
      <ComposerAction t={t} />
    </ComposerPrimitive.Root>
  )
}

const ComposerAction: FC<{ t: ReturnType<typeof useTranslations> }> = ({ t }) => {
  return (
    <div className='flex flex-row gap-1'>
      <VoiceChat className='my-2.5 size-8 p-2 transition-opacity ease-in' />
      <WebSearch className='my-2.5 mr-2 size-8 p-2 transition-opacity ease-in' />
      <ThreadPrimitive.If running={false}>
        <ComposerPrimitive.Send asChild>
          <TooltipIconButton
            tooltip={t('send')}
            variant='default'
            className='my-2.5 size-8 p-2 transition-opacity ease-in'
          >
            <SendHorizontalIcon />
          </TooltipIconButton>
        </ComposerPrimitive.Send>
      </ThreadPrimitive.If>
      <ThreadPrimitive.If running>
        <ComposerPrimitive.Cancel asChild>
          <TooltipIconButton
            tooltip={t('cancel')}
            variant='default'
            className='my-2.5 size-8 p-2 transition-opacity ease-in'
          >
            <CircleStopIcon />
          </TooltipIconButton>
        </ComposerPrimitive.Cancel>
      </ThreadPrimitive.If>
    </div>
  )
}

const UserMessage: FC = () => {
  const t = useTranslations('Chat')

  return (
    <MessagePrimitive.Root className='grid auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] gap-y-2 [&>*]:col-start-2 max-w-aui-thread w-full py-4'>
      <UserMessageAttachments />
      <div className='grid w-auto ml-auto'>
        <UserActionBar t={t} />
        <div className='bg-muted text-foreground max-w-[calc(var(--thread-max-width)*0.8)] break-words rounded-3xl px-5 py-2.5 col-start-2 row-start-2'>
          <MessagePrimitive.Content />
        </div>
      </div>
      <BranchPicker t={t} className='col-span-full col-start-1 row-start-3 -mr-1 justify-end' />
    </MessagePrimitive.Root>
  )
}

const UserActionBar: FC<{ t: ReturnType<typeof useTranslations> }> = ({ t }) => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide='not-last'
      className='flex flex-col items-end col-start-1 row-start-2 mr-3 mt-2.5'
    >
      <ActionBarPrimitive.Edit asChild>
        <TooltipIconButton tooltip={t('edit')}>
          <PencilIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Edit>
    </ActionBarPrimitive.Root>
  )
}

const EditComposer: FC = () => {
  const t = useTranslations('Chat')

  return (
    <ComposerPrimitive.Root className='bg-muted max-w-aui-thread my-4 flex w-full flex-col gap-2 rounded-xl'>
      <ComposerPrimitive.Input className='text-foreground flex h-8 w-full resize-none bg-transparent p-4 pb-0 outline-none' />

      <div className='mx-3 mb-3 flex items-center justify-center gap-2 self-end'>
        <ComposerPrimitive.Cancel asChild>
          <Button variant='ghost'>{t('cancel')}</Button>
        </ComposerPrimitive.Cancel>
        <ComposerPrimitive.Send asChild>
          <Button>{t('send')}</Button>
        </ComposerPrimitive.Send>
      </div>
    </ComposerPrimitive.Root>
  )
}

const AssistantMessage: FC = () => {
  const t = useTranslations('Chat')

  return (
    <MessagePrimitive.Root className='grid grid-cols-[auto_auto_1fr] grid-rows-[auto_1fr] max-w-aui-thread relative w-full py-4 px-2 sm:px-0'>
      <Avatar className='col-start-1 row-span-full row-start-1 mr-4 bg-muted hidden sm:flex'>
        <Bot className='mx-auto my-auto' />
      </Avatar>

      <div className='text-foreground max-w-[calc(var(--thread-max-width)*0.8)] break-words leading-7 col-span-2 col-start-2 row-start-1 my-1.5'>
        <MessagePrimitive.Content components={{ Text: MarkdownText, tools: { Fallback: ToolFallback } }} />
        <MessageError />
      </div>

      <AssistantActionBar t={t} />

      <BranchPicker t={t} className='col-start-2 row-start-2 -ml-2 mr-2' />
    </MessagePrimitive.Root>
  )
}

const MessageError: FC = () => {
  return (
    <MessagePrimitive.Error>
      <ErrorPrimitive.Root className='border-destructive bg-destructive/10 dark:bg-destructive/5 text-red-500 mt-2 rounded-md border p-3 text-sm'>
        <ErrorPrimitive.Message className='line-clamp-2' />
      </ErrorPrimitive.Root>
    </MessagePrimitive.Error>
  )
}

const AssistantActionBar: FC<{ t: ReturnType<typeof useTranslations> }> = ({ t }) => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide='not-last'
      autohideFloat='single-branch'
      className='text-muted-foreground data-[floating]:bg-aui-background col-start-3 row-start-2 -ml-1 flex gap-1 data-[floating]:absolute data-[floating]:rounded-md data-[floating]:border data-[floating]:p-1 data-[floating]:shadow-sm'
    >
      <MessagePrimitive.If speaking={false}>
        <ActionBarPrimitive.Speak asChild>
          <TooltipIconButton tooltip={t('readAloud')}>
            <AudioLinesIcon />
          </TooltipIconButton>
        </ActionBarPrimitive.Speak>
      </MessagePrimitive.If>
      <MessagePrimitive.If speaking>
        <ActionBarPrimitive.StopSpeaking asChild>
          <TooltipIconButton tooltip={t('stop')}>
            <StopCircleIcon />
          </TooltipIconButton>
        </ActionBarPrimitive.StopSpeaking>
      </MessagePrimitive.If>
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton tooltip={t('copy')}>
          <MessagePrimitive.If copied>
            <CheckIcon />
          </MessagePrimitive.If>
          <MessagePrimitive.If copied={false}>
            <CopyIcon />
          </MessagePrimitive.If>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton tooltip={t('refresh')}>
          <RefreshCwIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Reload>
    </ActionBarPrimitive.Root>
  )
}

const BranchPicker: FC<BranchPickerPrimitive.Root.Props & { t: ReturnType<typeof useTranslations> }> = ({
  className,
  t,
  ...rest
}) => {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className={cn('text-muted-foreground inline-flex items-center text-xs', className)}
      {...rest}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip={t('previous')}>
          <ChevronLeftIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <span className='font-medium'>
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip={t('next')}>
          <ChevronRightIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  )
}

const CircleStopIcon = () => {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='currentColor' width='16' height='16'>
      <rect width='10' height='10' x='3' y='3' rx='2' />
    </svg>
  )
}
