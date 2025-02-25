'use client'

import { pdfToText, streamChat } from '@/lib/api'
import { useContext } from 'react'

import {
  AssistantRuntimeProvider,
  CompositeAttachmentAdapter,
  SimpleTextAttachmentAdapter,
  SimpleImageAttachmentAdapter,
  useLocalRuntime,
  type ChatModelAdapter
} from '@assistant-ui/react'

import { WebSpeechSynthesisAdapter } from '@/components/chats/web-speech-adapter'

import { Thread } from '@/components/assistant-ui/thread'
// import { ThreadList } from "@/components/assistant-ui/thread-list";
import { LocaleContext } from '@/contexts/localeContext'
import { useToast } from '@/hooks/use-toast'
import { ModelContext } from '@/contexts/modelContext'

import { CompleteAttachment, PendingAttachment, AttachmentAdapter } from '@assistant-ui/react'

class PdfTextAttachmentAdapter implements AttachmentAdapter {
  public accept = 'application/pdf'

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
          text: `<attachment name=${attachment.name} type=pdf>\n${await pdfToText(attachment.file)}\n</attachment>`
        }
      ]
    }
  }

  public async remove() {
    // noop
  }
}

export default function OpenChat() {
  const { locale } = useContext(LocaleContext)
  const { toast } = useToast()
  const { model } = useContext(ModelContext)

  const errorToast = () => {
    toast({
      variant: 'destructive',
      title: 'Something went wrong',
      description: 'Please try again later'
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
        }
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
        new PdfTextAttachmentAdapter(),
        textAttachmentAdapter
      ]),
      speech: new WebSpeechSynthesisAdapter(locale)
    }
  })

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Thread />
    </AssistantRuntimeProvider>
  )
}
