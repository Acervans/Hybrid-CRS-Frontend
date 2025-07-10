import { type FC, memo, useContext } from 'react'

import {
  ActionBarPrimitive,
  BranchPickerPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  TextContentPartProps,
  ThreadPrimitive,
  useAssistantRuntime,
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
  Loader2,
  MessageCircle,
  SendHorizontalIcon,
  Star,
  StopCircleIcon
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import RecommendationDisplay from '@/components/agent-chat/recommendation-display'
import {
  ComposerAddAttachment,
  ComposerAttachments,
  UserMessageAttachments
} from '@/components/assistant-ui/attachment'
import { ThreadFollowupSuggestions } from '@/components/assistant-ui/follow-up-suggestions'
import { MarkdownText } from '@/components/assistant-ui/markdown-text'
import { ToolFallback } from '@/components/assistant-ui/tool-fallback'
import { TooltipIconButton } from '@/components/assistant-ui/tooltip-icon-button'
import EndSession from '@/components/chat/end-session'
import VoiceChat from '@/components/chat/voice-chat'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ModelContext } from '@/contexts/modelContext'
import { WorkflowContext } from '@/contexts/workflowContext'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface AgentThreadProps {
  archived?: boolean
}

export const AgentThread: FC<AgentThreadProps> = ({ archived }) => {
  const t = useTranslations('Chat')

  return (
    <ThreadPrimitive.Root className='bg-background box-border h-[calc(100dvh-8.5rem)] sm:h-[calc(100dvh-7.5rem)] md:h-[calc(100dvh-8.5rem)] group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-[calc(100dvh-7.5rem)]'>
      <ThreadPrimitive.Viewport className='flex h-full flex-col items-center overflow-y-auto scroll-smooth bg-inherit px-3 sm:px-6'>
        {!archived && <ThreadWelcome t={t} />}

        <ThreadPrimitive.Messages
          components={{
            UserMessage: UserMessage,
            AssistantMessage: AssistantMessage,
            SystemMessage: SystemMessage
          }}
        />

        <ThreadFollowupSuggestions />

        <ThreadPrimitive.If empty={false}>
          <div className='min-h-2 flex-grow' />
        </ThreadPrimitive.If>

        <div
          className={`max-w-aui-thread sticky bottom-0 mt-3 flex w-full flex-col items-center justify-end rounded-t-lg bg-inherit ${!archived ? 'pb-4' : ''}`}
        >
          <ThreadScrollToBottom t={t} />
          {!archived && <Composer t={t} />}
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
  const { agent } = useContext(ModelContext)

  return (
    <ThreadPrimitive.Empty>
      <div className='max-w-aui-thread flex w-full flex-grow flex-col'>
        <div className='flex w-full flex-grow flex-col items-center justify-center'>
          <Avatar>
            <Bot className='mx-auto my-auto' />
          </Avatar>
          <p className='mt-4 font-medium text-center'>
            {agent ? t('Agent.welcomeAgent', { agentName: agent.agentName }) : t('welcome')}
          </p>
        </div>
      </div>
    </ThreadPrimitive.Empty>
  )
}

const Composer: FC<{ t: ReturnType<typeof useTranslations> }> = ({ t }) => {
  const composerRuntime = useComposerRuntime()
  const assistantRuntime = useAssistantRuntime()
  const { lastFeedback, setLastFeedback, sendLastFeedback, setLastRecommendations } = useContext(WorkflowContext)
  const { toast } = useToast()

  if (lastFeedback !== null) {
    return (
      <Button
        className='focus-within:border-ring/20 flex w-full max-w-md whitespace-normal h-fit min-h-12 text-md rounded-lg border px-2.5 shadow-sm transition-colors ease-in'
        onClick={async () => {
          try {
            const numItems = await sendLastFeedback()

            toast({
              title: t('Agent.sendFeedbackTitle'),
              description: t('Agent.sendFeedbackDescription', { numItems })
            })
            setLastFeedback(null)
            setLastRecommendations(undefined)
          } catch {
            toast({
              title: t('Thread.somethingWentWrong'),
              description: t('Thread.tryAgain'),
              variant: 'destructive'
            })
            return
          }
          const messages = assistantRuntime.thread.getState().messages

          assistantRuntime.thread.startRun({ parentId: messages.at(-1)?.id ?? null })
        }}
      >
        <Star className='mr-2' />
        {t('Agent.sendFeedback')}
      </Button>
    )
  }

  return (
    <>
      <ThreadPrimitive.If empty={false}>
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
      </ThreadPrimitive.If>
      <ThreadPrimitive.If empty>
        <Button
          className='focus-within:border-ring/20 flex w-full max-w-md whitespace-normal h-fit min-h-12 text-md rounded-lg border px-2.5 shadow-sm transition-colors ease-in'
          onClick={() => {
            assistantRuntime.thread.startRun({ parentId: null })
          }}
        >
          <MessageCircle className='mr-2' />
          {t('Agent.startAgent')}
        </Button>
      </ThreadPrimitive.If>
    </>
  )
}

const ComposerAction: FC<{ t: ReturnType<typeof useTranslations> }> = ({ t }) => {
  return (
    <div className='flex flex-row gap-1'>
      <VoiceChat className='my-2.5 size-8 p-2 transition-opacity ease-in' />
      <EndSession className='my-2.5 mr-2 size-8 p-2 transition-opacity ease-in' />
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
        <div className='bg-muted text-foreground max-w-[calc(var(--thread-max-width)*0.8)] break-words rounded-3xl px-5 py-2.5 col-start-2 row-start-2'>
          <MessagePrimitive.Content />
        </div>
      </div>
      <BranchPicker t={t} className='col-span-full col-start-1 row-start-3 -mr-1 justify-end' />
    </MessagePrimitive.Root>
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

const ItemRecommendation: FC<TextContentPartProps> = (props: TextContentPartProps) => {
  const { workflowId, setLastFeedback } = useContext(WorkflowContext)

  if (props?.status.type !== 'complete') {
    return <Loader2 className='h-4 w-4 animate-spin' />
  } else {
    try {
      const data = JSON.parse(props.text)
      const recommendations: Recommendation[] = data.recommendations.map((r: Record<string, unknown>) => {
        const { item_id: itemId, name, category, falkordb_rating: falkordbRating, ...rest } = r

        return {
          itemId,
          name,
          category,
          falkordbRating,
          ...rest
        }
      })
      const explanations: string[] = data.explanations

      if (recommendations.length && explanations.length) {
        return (
          <RecommendationDisplay
            recommendations={recommendations}
            explanations={explanations}
            archived={workflowId === null}
            onFeedbackChange={setLastFeedback}
          />
        )
      } else {
        return <p>{props.text}</p>
      }
    } catch {
      return <p>{props.text}</p>
    }
  }
}

const SystemMessage: FC = () => {
  const t = useTranslations('Chat')
  const ItemRecommendationText = memo(ItemRecommendation)

  return (
    <MessagePrimitive.Root className='grid grid-cols-[auto_auto_1fr] grid-rows-[auto_1fr] max-w-aui-thread relative w-full py-4 px-2 sm:px-0'>
      <Avatar className='col-start-1 row-span-full row-start-1 mr-4 bg-muted hidden sm:flex'>
        <Bot className='mx-auto my-auto' />
      </Avatar>

      <div className='text-foreground max-w-[calc(var(--thread-max-width)*0.8)] break-words leading-7 col-span-2 col-start-2 row-start-1 my-1.5'>
        <MessagePrimitive.Content components={{ Text: ItemRecommendationText }} />
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
