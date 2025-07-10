'use client'

import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { useCallback, useContext, useMemo, useRef } from 'react'

import {
  AssistantRuntimeProvider,
  AttachmentAdapter,
  type ChatModelAdapter,
  CompleteAttachment,
  CompositeAttachmentAdapter,
  PendingAttachment,
  type unstable_RemoteThreadListAdapter as RemoteThreadListAdapter,
  RuntimeAdapterProvider,
  SimpleImageAttachmentAdapter,
  SimpleTextAttachmentAdapter,
  type ThreadHistoryAdapter,
  ThreadMessage,
  ThreadUserContentPart,
  useLocalThreadRuntime,
  unstable_useRemoteThreadListRuntime as useRemoteThreadListRuntime,
  useThreadListItem,
  useThreadListItemRuntime
} from '@assistant-ui/react'
import { useTranslations } from 'next-intl'

import { WebSpeechSynthesisAdapter } from '@/components/chat/web-speech-adapter'
import { LocaleContext } from '@/contexts/localeContext'
import { ModelContext } from '@/contexts/modelContext'
import { SupabaseContext } from '@/contexts/supabaseContext'
import { WorkflowContext } from '@/contexts/workflowContext'
import { useToast } from '@/hooks/use-toast'
import {
  appendChatHistory,
  createChatHistory,
  deleteChatHistory,
  generateTitle,
  getChatHistory,
  pdfToText,
  sendUserResponse,
  streamChat
} from '@/lib/api'
import {
  addChatHistory,
  deleteChatHistoryById,
  getChatHistoriesByAgentId,
  getChatHistoriesByUserId,
  updateChatHistory
} from '@/lib/supabase/client'

export class PdfTextAttachmentAdapter implements AttachmentAdapter {
  public accept = 'application/pdf'
  private getAccessToken

  constructor(getAccessToken: () => Promise<string | undefined>) {
    this.getAccessToken = getAccessToken
  }

  public async add(state: { file: File }): Promise<PendingAttachment> {
    return {
      id: state.file.name,
      type: 'file',
      name: state.file.name,
      contentType: state.file.type,
      file: state.file,
      status: { type: 'requires-action', reason: 'composer-send' }
    }
  }

  public async send(attachment: PendingAttachment): Promise<CompleteAttachment> {
    return {
      ...attachment,
      status: { type: 'complete' },
      content: [
        {
          type: 'text',
          text: `<attachment name=${attachment.name} type=pdf>\n${await pdfToText(
            attachment.file,
            await this.getAccessToken()
          ).catch(error => {
            console.error(`Failed to convert PDF to Text: ${error}`)
          })}\n</attachment>`
        }
      ]
    }
  }

  public async remove() {
    // noop
  }
}

// AssistantProvider to provide Assistant Runtime Context
export const AssistantProvider = ({ children }: { children: ReactNode }) => {
  const t = useTranslations('Chat.Thread')
  const router = useRouter()
  const path = usePathname()
  const { locale } = useContext(LocaleContext)
  const { model, agent } = useContext(ModelContext)
  const { getAccessToken, supabase } = useContext(SupabaseContext)
  const { startWorkflow, setOnData, workflowId, abortWorkflow, parseWorkflowEvent } = useContext(WorkflowContext)
  const { toast } = useToast()
  const threadTitlesMapRef = useRef<Record<string, string>>({})

  const isAgentChat = path.startsWith('/chat') && path !== '/chat/open-chat'
  const agentId = isAgentChat ? Number(path.split('/').at(-1)) : undefined

  const errorToast = useCallback(() => {
    toast({
      variant: 'destructive',
      title: t('somethingWentWrong'),
      description: t('tryAgain')
    })
  }, [toast, t])

  // Thread list adapter using Supabase
  const chatHistoryAdapter = useMemo<RemoteThreadListAdapter>(
    () => ({
      async list() {
        const userId = (await supabase.auth.getSession()).data.session?.user.id

        if (!userId) return { threads: [] }

        const chats = isAgentChat
          ? await getChatHistoriesByAgentId(supabase, agentId as number)
          : await getChatHistoriesByUserId(supabase, userId, true)

        return {
          threads: chats.map(t => ({
            status: 'regular',
            remoteId: String(t.chatId),
            title: t.chatTitle
          }))
        }
      },

      async initialize() {
        const userId = (await supabase.auth.getSession()).data.session?.user.id

        if (!userId) return { remoteId: '', externalId: undefined }

        // Check if agent chat or open chat
        const chat = await addChatHistory(supabase, userId, t('newChat'), agentId)
        const accessToken = await getAccessToken()

        try {
          // Create Chat History in backend using ID from Supabase
          await createChatHistory(chat.chatId, userId, [], accessToken)
        } catch {
          // Delete from Supabase on error
          await deleteChatHistoryById(supabase, chat.chatId)
        }

        // Update URL with sessionId/chatId
        router.replace(`${path}?${isAgentChat ? 'sessionId' : 'chatId'}=${encodeURIComponent(chat.chatId)}`)

        return { remoteId: String(chat.chatId), externalId: undefined }
      },

      async rename(remoteId: string, newTitle: string) {
        await updateChatHistory(supabase, Number(remoteId), { chat_title: newTitle })
      },

      async archive(remoteId: string) {
        await updateChatHistory(supabase, Number(remoteId), { archived: true })
      },

      async unarchive(remoteId: string) {
        await updateChatHistory(supabase, Number(remoteId), { archived: false })
      },

      async delete(remoteId: string) {
        const accessToken = await getAccessToken()
        const userId = (await supabase.auth.getSession()).data.session?.user.id

        // Delete Chat History from backend, then Supabase
        if (userId) {
          await deleteChatHistory(Number(remoteId), userId, accessToken).then(() =>
            deleteChatHistoryById(supabase, Number(remoteId))
          )
        }
      },

      async generateTitle(remoteId: string, messages: readonly ThreadMessage[]) {
        if (!isAgentChat && messages.length) {
          const firstMessageContents = messages[0].content as readonly [ThreadUserContentPart]

          // Generate title from messages using LLM
          for (const content of firstMessageContents) {
            if (content.type === 'text') {
              await generateTitle(model, content.text, await getAccessToken())
                .then(async title => {
                  threadTitlesMapRef.current[remoteId] = title

                  // return stream with title
                  return new ReadableStream({
                    start(controller) {
                      controller.enqueue({
                        type: 'part-start',
                        part: { type: 'text' },
                        path: [0] // required field with length 1
                      })
                      controller.enqueue({
                        type: 'text-delta',
                        textDelta: title, // the new title
                        path: [0]
                      })
                      controller.enqueue({
                        type: 'message-finish',
                        finishReason: 'stop',
                        usage: {
                          promptTokens: 1,
                          completionTokens: 2
                        },
                        path: [0]
                      })
                      controller.close()
                    }
                  })
                })
                .catch(() => {
                  // Keep default title
                  threadTitlesMapRef.current[remoteId] = t('newChat')
                })
              break
            }
          }
        }
        return new ReadableStream() // Return empty stream
      },
      // Thread-specific adapters as provider
      unstable_Provider: ({ children }) => {
        /* eslint-disable react-hooks/rules-of-hooks */
        const threadListItem = useThreadListItem()
        const threadListItemRuntime = useThreadListItemRuntime()
        const remoteId = threadListItem.remoteId

        // Chat history persistence using Supabase + FalkorDB
        const history = useMemo<ThreadHistoryAdapter>(
          () => ({
            async load() {
              const userId = (await supabase.auth.getSession()).data.session?.user.id

              if (!remoteId || !userId) return { messages: [] }

              const accessToken = await getAccessToken()

              try {
                const messages: ThreadMessage[] = await getChatHistory(Number(remoteId), userId, accessToken)

                return {
                  messages: messages.map((m, i) => ({
                    message: {
                      ...m,
                      threadId: remoteId,
                      createdAt: new Date(m.createdAt)
                    },
                    parentId: messages[i - 1]?.id ?? null
                  }))
                }
              } catch {
                return {
                  messages: []
                }
              }
            },

            async append(message) {
              const chatId = remoteId ? remoteId : (await threadListItemRuntime.initialize()).remoteId

              if (!chatId) {
                console.warn('Cannot save message - thread not initialized')
                return
              }

              const userId = (await supabase.auth.getSession()).data.session?.user.id

              if (!userId) return

              const accessToken = await getAccessToken()

              await appendChatHistory(
                Number(chatId),
                userId,
                {
                  ...message.message,
                  attachments: message.message.attachments?.map(a => ({
                    ...a,
                    file: a.type === 'image' ? undefined : a.file
                  })),
                  metadata: message.message.role === 'user' ? undefined : message.message.metadata
                },
                accessToken
              )

              // Wait for generateTitle
              if (!isAgentChat && threadListItem.title === undefined) {
                setTimeout(() => {
                  if (threadTitlesMapRef.current[chatId]) {
                    threadListItemRuntime.rename(threadTitlesMapRef.current[chatId])
                    delete threadTitlesMapRef.current[chatId]
                  }
                }, 1500)
              }
            }
          }),
          [remoteId, threadListItemRuntime, threadListItem.title]
        )

        const adapters = useMemo(() => ({ history }), [history])
        /* eslint-enable react-hooks/rules-of-hooks */

        return <RuntimeAdapterProvider adapters={adapters}>{children}</RuntimeAdapterProvider>
      }
    }),
    [supabase, getAccessToken, router, isAgentChat, agentId, model, path, t]
  )

  const useRuntimeHook = () => {
    // Chat Model Adapter for Open Chat
    const OllamaModelAdapter: ChatModelAdapter = {
      async *run({ messages, runConfig, abortSignal, context }) {
        const response = await streamChat({
          messages,
          abortSignal,
          model,
          metadata: runConfig.custom,
          onError: async (event: { error: unknown }) => {
            const error = event.error as Error

            errorToast()
            console.error(`[${error.name}] ${error.message}`)
          },
          onFinish: async () => {
            if (context.tools) console.log(context.tools)
          },
          accessToken: await getAccessToken()
        })
        if (response.status !== 200) {
          errorToast()
          throw new Error(`Something went wrong (${response.status}${' ' + response.statusText})`)
        }
        if (!response.body) {
          return
        }

        const reader = response.body.getReader()
        const textDecoder = new TextDecoder()
        let fullText = ''

        while (true) {
          const { value, done } = await reader.read()

          if (done) {
            break
          }
          const content = textDecoder.decode(value)

          if (content) {
            fullText += content
            yield {
              content: [{ type: 'text', text: fullText }]
            }
          }
        }
      }
    }

    const AgentChatAdapter: ChatModelAdapter | undefined = isAgentChat
      ? {
          async *run({ messages, abortSignal }) {
            const queue: WorkflowEvent[] = []
            let resolveNext: (() => void) | null = null

            setOnData(data => {
              queue.push(data)
              if (resolveNext) {
                resolveNext()
                resolveNext = null
              }
            })

            if (abortSignal) {
              abortSignal.addEventListener('abort', abortWorkflow)
            }

            if (!workflowId && agent) {
              startWorkflow(
                agent.agentId,
                agent.userId,
                agent.agentName,
                agent.datasetName,
                agent.description,
                abortSignal,
                await getAccessToken()
              )
            } else if (workflowId && messages.at(-1)?.role === 'user') {
              // Send user response
              const textContent = messages.at(-1)?.content.find(c => c.type === 'text')

              if (textContent) {
                sendUserResponse(workflowId, textContent.text, await getAccessToken())
              }
            }

            try {
              let fullText = ''

              while (true) {
                if (queue.length === 0) {
                  await new Promise<void>(resolve => {
                    resolveNext = resolve
                  })
                  continue
                }

                const data = queue.shift()

                if (!data) continue

                const text = parseWorkflowEvent(data)

                if (text) {
                  fullText += text
                  yield {
                    content: [{ type: 'text', text: fullText }]
                  }
                }

                if (data.done) break
              }
            } finally {
              if (abortSignal) {
                abortSignal.removeEventListener('abort', abortWorkflow)
              }
            }
          }
        }
      : undefined

    const textAttachmentAdapter = new SimpleTextAttachmentAdapter()

    textAttachmentAdapter.accept += ',application/json,.c,.cpp,.h,.java,.js,.jsx,.md,.py,.sh,.tex,.ts,.tsx'

    return useLocalThreadRuntime(isAgentChat ? AgentChatAdapter! : OllamaModelAdapter, {
      adapters: {
        attachments: new CompositeAttachmentAdapter([
          new SimpleImageAttachmentAdapter(),
          new PdfTextAttachmentAdapter(getAccessToken),
          textAttachmentAdapter
        ]),
        speech: new WebSpeechSynthesisAdapter(locale)
      }
    })
  }

  const runtime = useRemoteThreadListRuntime({
    runtimeHook: useRuntimeHook,
    adapter: chatHistoryAdapter
  })

  return <AssistantRuntimeProvider runtime={runtime}>{children}</AssistantRuntimeProvider>
}
