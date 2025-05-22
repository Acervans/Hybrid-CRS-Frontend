'use client'

import type { ReactNode } from 'react'
import { useContext } from 'react'

import {
  AssistantRuntimeProvider,
  AttachmentAdapter,
  type ChatModelAdapter,
  CompleteAttachment,
  CompositeAttachmentAdapter,
  PendingAttachment,
  SimpleImageAttachmentAdapter,
  SimpleTextAttachmentAdapter,
  useLocalRuntime
} from '@assistant-ui/react'
import { useTranslations } from 'next-intl'

import { WebSpeechSynthesisAdapter } from '@/components/chats/web-speech-adapter'
import { AuthContext } from '@/contexts/authContext'
import { LocaleContext } from '@/contexts/localeContext'
import { ModelContext } from '@/contexts/modelContext'
import { useToast } from '@/hooks/use-toast'
import { pdfToText, streamChat } from '@/lib/api'
import { createClient } from '@/lib/supabase/client'

export class PdfTextAttachmentAdapter implements AttachmentAdapter {
  public accept = 'application/pdf'
  private supabase

  constructor(supabase: ReturnType<typeof createClient>) {
    this.supabase = supabase
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
          text: `<attachment name=${attachment.name} type=pdf>\n${await pdfToText(attachment.file, (await this.supabase.auth.getSession()).data?.session?.access_token)}\n</attachment>`
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
  const { locale } = useContext(LocaleContext)
  const { model } = useContext(ModelContext)
  const { supabase } = useContext(AuthContext)
  const { toast } = useToast()
  const t = useTranslations('Error')

  const errorToast = () => {
    toast({
      variant: 'destructive',
      title: t('somethingWentWrong'),
      description: t('tryAgain')
    })
  }

  // TODO add follow-up suggestions with custom context or ThreadStatus
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
          // do something with messageHistory (send to backend DB maybe)
        },
        authToken: (await supabase.auth.getSession()).data?.session?.access_token
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

  const textAttachmentAdapter = new SimpleTextAttachmentAdapter()
  textAttachmentAdapter.accept += ',application/json,.c,.cpp,.h,.java,.js,.jsx,.md,.py,.sh,.tex,.ts,.tsx'
  const runtime = useLocalRuntime(OllamaModelAdapter, {
    adapters: {
      attachments: new CompositeAttachmentAdapter([
        new SimpleImageAttachmentAdapter(),
        new PdfTextAttachmentAdapter(supabase),
        textAttachmentAdapter
      ]),
      speech: new WebSpeechSynthesisAdapter(locale)
    }
  })

  return <AssistantRuntimeProvider runtime={runtime}>{children}</AssistantRuntimeProvider>
}
