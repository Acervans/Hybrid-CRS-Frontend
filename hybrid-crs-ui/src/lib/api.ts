import { createOllama } from 'ollama-ai-provider'
import { StepResult, streamText, generateObject, ToolSet } from 'ai'
import { apiUrl } from '@/constants'
import { ThreadMessage } from '@assistant-ui/react'
import { Ollama } from 'ollama/browser'
import { convertToCoreMessages } from '@/lib/utils'
import { z } from 'zod'

const commonHeaders: Record<string, string> = {
  skip_zrok_insterstitial: '1'
}

const ollamaProvider = createOllama({
  // baseURL: `http://192.168.1.142:8000/ollama/api`,
  baseURL: `${apiUrl}/ollama/api`,
  // baseURL: `http://localhost:11434/api`,
  headers: commonHeaders
})

const ollama = new Ollama({
  host: `${apiUrl}/ollama`,
  headers: commonHeaders
})

const CTX_WIN_1K = 1024

const modelToCtxWindow: Record<string, number> = {
  'qwen2.5:3b': CTX_WIN_1K * 16,
  'llava-phi3': CTX_WIN_1K * 4
}

const defaultModel = 'qwen2.5:3b'

export async function streamChat({
  messages,
  abortSignal,
  model,
  metadata,
  onError,
  onFinish
}: {
  messages: readonly ThreadMessage[]
  abortSignal: AbortSignal
  model?: string
  metadata?: Record<string, unknown>
  onError?: (event: { error: unknown }) => Promise<void> | void
  onFinish?: (
    event: Omit<StepResult<ToolSet>, 'stepType' | 'isContinued'> & {
      readonly steps: StepResult<ToolSet>[]
    }
  ) => Promise<void> | void
}) {
  const llm = model || defaultModel

  return streamText({
    model: ollamaProvider(llm, { numCtx: modelToCtxWindow[llm] || CTX_WIN_1K * 2 }),
    temperature: 0.2,
    messages: convertToCoreMessages(messages),
    headers: metadata as Record<string, string>,
    abortSignal: abortSignal,
    onError,
    onFinish
  }).toTextStreamResponse()
}

export async function ollamaList() {
  return ollama.list()
}

export async function ollamaPull(model: string) {
  return ollama.pull({ model: model, stream: true })
}

export async function ollamaDelete(model: string) {
  return ollama.delete({ model: model })
}

export async function pdfToText(file: File): Promise<string | void> {
  const formData = new FormData()

  formData.append('file', file, file.name)
  return fetch(`${apiUrl}/pdf-to-text`, {
    method: 'POST',
    headers: commonHeaders,
    body: formData
  })
    .then(async res => res.text())
    .catch(err => {
      console.error(`Failed to convert PDF to Text: ${err}`)
    })
}

export async function generateTitle(model: string | undefined, prompt: string): Promise<string> {
  const llm = model || defaultModel
  const { object } = await generateObject({
    model: ollamaProvider(llm, { numCtx: modelToCtxWindow[llm] || CTX_WIN_1K * 2 }),
    schema: z.object({
      title: z.string()
    }),
    prompt: `Generate a concise title for a conversation. User Prompt: "${prompt}"`,
    maxRetries: 2
  })

  return object.title
}
