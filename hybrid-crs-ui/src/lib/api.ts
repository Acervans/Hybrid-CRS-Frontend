import { ThreadMessage } from '@assistant-ui/react'
import { StepResult, ToolSet, generateObject, streamText } from 'ai'
import { createOllama } from 'ollama-ai-provider'
import { Ollama } from 'ollama/browser'
import { z } from 'zod'

import { apiUrl } from '@/constants'
import { convertToCoreMessages } from '@/lib/utils'

const commonHeaders: Record<string, string> = {
  skip_zrok_insterstitial: '1'
}

const CTX_WIN_1K = 1024

const modelToCtxWindow: Record<string, number> = {
  'qwen2.5:3b': CTX_WIN_1K * 16,
  'qwen3:4b': CTX_WIN_1K * 4,
  'llava-phi3': CTX_WIN_1K * 4
}

const defaultModel = 'qwen2.5:3b'

function authOllamaProvider(authToken: string | undefined) {
  return createOllama({
    // baseURL: `http://192.168.1.142:8000/ollama/api`,
    baseURL: `${apiUrl}/ollama/api`,
    // baseURL: `http://localhost:11434/api`,
    headers: {
      ...commonHeaders,
      Authorization: `Bearer ${authToken}`
    }
  })
}

function authOllama(authToken: string | undefined) {
  return new Ollama({
    host: `${apiUrl}/ollama`,
    headers: {
      ...commonHeaders,
      Authorization: `Bearer ${authToken}`
    }
  })
}

export async function streamChat({
  messages,
  abortSignal,
  model,
  metadata,
  onError,
  onFinish,
  authToken
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
  authToken: string | undefined
}) {
  const llm = model || defaultModel

  return streamText({
    model: authOllamaProvider(authToken)(llm, { numCtx: modelToCtxWindow[llm] || CTX_WIN_1K * 2 }),
    temperature: 0.2,
    messages: convertToCoreMessages(messages),
    headers: metadata as Record<string, string>,
    abortSignal: abortSignal,
    onError,
    onFinish
  }).toTextStreamResponse()
}

export async function ollamaList(authToken: string | undefined) {
  return authOllama(authToken).list()
}

export async function ollamaPull(model: string, authToken: string | undefined) {
  return authOllama(authToken).pull({ model: model, stream: true })
}

export async function ollamaDelete(model: string, authToken: string | undefined) {
  return authOllama(authToken).delete({ model: model })
}

export async function pdfToText(file: File, authToken: string | undefined): Promise<string | void> {
  const formData = new FormData()

  formData.append('file', file, file.name)
  return fetch(`${apiUrl}/pdf-to-text`, {
    method: 'POST',
    headers: { ...commonHeaders, Authorization: `Bearer ${authToken}` },
    body: formData
  })
    .then(async res => res.text())
    .catch(err => {
      console.error(`Failed to convert PDF to Text: ${err}`)
    })
}

export async function generateTitle(
  model: string | undefined,
  prompt: string,
  authToken: string | undefined
): Promise<string> {
  const llm = model || defaultModel
  const { object } = await generateObject({
    model: authOllamaProvider(authToken)(llm, { numCtx: modelToCtxWindow[llm] || CTX_WIN_1K * 2 }),
    schema: z.object({
      title: z.string()
    }),
    prompt: `Generate a concise title for a conversation in the same language as the User Prompt: "${prompt}"`,
    maxRetries: 2
  })

  return object.title
}
