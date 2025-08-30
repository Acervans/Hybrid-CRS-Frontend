import { ThreadMessage } from '@assistant-ui/react'
import { StepResult, ToolSet, generateObject, streamText } from 'ai'
import { createOllama } from 'ollama-ai-provider-v2'
import { Ollama } from 'ollama/browser'
import { z } from 'zod'

import { apiUrl } from '@/constants'
import { convertToModelMessages } from '@/lib/utils'

const commonHeaders: Record<string, string> = {
  skip_zrok_interstitial: '1'
}

const commonJsonHeaders: Record<string, string> = {
  ...commonHeaders,
  'Content-Type': 'application/json',
  Accept: 'application/json'
}

const CTX_WIN_1K = 1024

const modelToCtxWindow: Record<string, number> = {
  'qwen2.5:3b': CTX_WIN_1K * 16,
  'qwen3:4b': CTX_WIN_1K * 4,
  'qwen2.5vl:3b': CTX_WIN_1K * 4,
  'llava-phi3:latest': CTX_WIN_1K * 4
}

const defaultModel = 'qwen2.5:3b'

function authOllamaProvider(model: string, accessToken: string | undefined) {
  return createOllama({
    baseURL: `${apiUrl}/ollama/api`,
    headers: {
      ...commonHeaders,
      Authorization: `Bearer ${accessToken}`
    }
  }).chat(model)
}

function authOllama(accessToken: string | undefined) {
  return new Ollama({
    host: `${apiUrl}/ollama`,
    headers: {
      ...commonHeaders,
      Authorization: `Bearer ${accessToken}`
    }
  })
}

// Ollama API (proxied), PDF-to-text and title generation Endpoints

export async function streamChat({
  messages,
  abortSignal,
  model,
  metadata,
  onError,
  onFinish,
  accessToken
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
  accessToken: string | undefined
}) {
  const llm = model || defaultModel

  return streamText({
    model: authOllamaProvider(llm, accessToken),
    providerOptions: {
      ollama: {
        options: {
          num_ctx: modelToCtxWindow[llm]
        }
      }
    },
    temperature: 0.2,
    messages: convertToModelMessages(messages),
    headers: metadata as Record<string, string>,
    abortSignal: abortSignal,
    onError,
    onFinish
  }).toTextStreamResponse()
}

export async function ollamaList(accessToken: string | undefined) {
  return authOllama(accessToken).list()
}

export async function ollamaPull(model: string, accessToken: string | undefined) {
  return authOllama(accessToken).pull({ model: model, stream: true })
}

export async function ollamaDelete(model: string, accessToken: string | undefined) {
  return authOllama(accessToken).delete({ model: model })
}

export async function pdfToText(file: File, accessToken: string | undefined): Promise<string | void> {
  const formData = new FormData()

  formData.append('file', file, file.name)
  return fetch(`${apiUrl}/pdf-to-text`, {
    method: 'POST',
    headers: { ...commonHeaders, Authorization: `Bearer ${accessToken}` },
    body: formData
  }).then(async res => {
    const text = await res.text()

    if (!res.ok) throw new Error(text || 'Request failed')
    return text
  })
}

export async function generateTitle(
  model: string | undefined,
  prompt: string,
  accessToken: string | undefined
): Promise<string> {
  const llm = model || defaultModel
  const { object } = await generateObject({
    model: authOllamaProvider(llm, accessToken),
    providerOptions: {
      ollama: {
        options: {
          num_ctx: modelToCtxWindow[llm]
        }
      }
    },
    schema: z.object({
      title: z.string()
    }),
    prompt: `Generate a concise title for a conversation in the same language as the User Prompt: "${prompt}"`,
    maxRetries: 2
  })

  return object.title
}

async function checkJsonResponse(res: Response) {
  const json = await res.json()

  if (!res.ok) throw new Error(JSON.stringify(json.detail) || 'Request failed')
  return json
}

// Inference Endpoints

export async function inferColumnRoles(columnNames: string[], fileType: FileType, accessToken: string | undefined) {
  if (!columnNames.length)
    return {
      detail: 'columnNames cannot be empty'
    }

  return fetch(`${apiUrl}/infer-column-roles`, {
    method: 'POST',
    headers: {
      ...commonJsonHeaders,
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      column_names: columnNames,
      file_type: fileType
    })
  }).then(checkJsonResponse)
}

export async function inferColumnDatatype(sampleValues: string[], accessToken: string | undefined) {
  return fetch(`${apiUrl}/infer-datatype`, {
    method: 'POST',
    headers: {
      ...commonJsonHeaders,
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      sample_values: sampleValues
    })
  }).then(checkJsonResponse)
}

export async function inferDelimiter(sampleValues: string[], accessToken: string | undefined) {
  return fetch(`${apiUrl}/infer-delimiter`, {
    method: 'POST',
    headers: {
      ...commonJsonHeaders,
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      sample_values: sampleValues
    })
  }).then(checkJsonResponse)
}

// Agent Endpoints

export async function createAgent(
  agentId: number,
  agentConfig: AgentConfiguration,
  datasetFiles: FileData[],
  accessToken: string | undefined
) {
  const formData = new FormData()

  formData.append('agent_id', JSON.stringify(agentId))
  formData.append(
    'agent_config',
    JSON.stringify({
      agent_name: agentConfig.agentName,
      dataset_name: agentConfig.datasetName,
      description: agentConfig.description,
      public: agentConfig.public
    })
  )
  datasetFiles.forEach(file => {
    formData.append(
      'dataset_files',
      JSON.stringify({
        id: file.id,
        name: file.name,
        original_name: file.originalName,
        file: null,
        file_type: file.fileType,
        headers: file.headers,
        columns: file.columns.map(col => ({
          id: col.id,
          name: col.name,
          role: col.role,
          data_type: col.dataType,
          delimiter: col.delimiter || null,
          original_name: col.originalName
        })),
        sniff_result: {
          delimiter: file.sniffResult.delimiter,
          has_header: file.sniffResult.hasHeader,
          newline_str: file.sniffResult.newlineStr,
          quote_char: file.sniffResult.quoteChar,
          labels: file.sniffResult.labels,
          total_rows: file.sniffResult.totalRows
        }
      })
    )
    formData.append('upload_files', file.file)
  })

  return fetch(`${apiUrl}/create-agent`, {
    method: 'POST',
    headers: {
      ...commonHeaders,
      Authorization: `Bearer ${accessToken}`
    },
    body: formData
  }).then(checkJsonResponse)
}

export async function deleteAgent(
  agentId: number,
  datasetName: string,
  userId: string,
  accessToken: string | undefined
) {
  return fetch(`${apiUrl}/delete-agent`, {
    method: 'DELETE',
    headers: {
      ...commonJsonHeaders,
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      agent_id: agentId,
      dataset_name: datasetName,
      user_id: userId
    })
  }).then(checkJsonResponse)
}

export async function retrainAgent(
  agentId: number,
  datasetName: string,
  userId: string,
  accessToken: string | undefined
) {
  return fetch(`${apiUrl}/retrain-agent`, {
    method: 'POST',
    headers: {
      ...commonJsonHeaders,
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      agent_id: agentId,
      dataset_name: datasetName,
      user_id: userId
    })
  }).then(checkJsonResponse)
}

// ChatHistory Endpoints

export async function createChatHistory(
  chatId: number,
  userId: string,
  content: Array<object>,
  accessToken: string | undefined
) {
  return fetch(`${apiUrl}/create-chat-history`, {
    method: 'POST',
    headers: {
      ...commonJsonHeaders,
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      chat_id: chatId,
      user_id: userId,
      content: JSON.stringify(content)
    })
  }).then(checkJsonResponse)
}

export async function appendChatHistory(
  chatId: number,
  userId: string,
  newMessage: object,
  accessToken: string | undefined
) {
  return fetch(`${apiUrl}/append-chat-history`, {
    method: 'PUT',
    headers: {
      ...commonJsonHeaders,
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      chat_id: chatId,
      user_id: userId,
      new_message: JSON.stringify(newMessage)
    })
  }).then(checkJsonResponse)
}

export async function getChatHistory(chatId: number, userId: string, accessToken: string | undefined) {
  const encChatId = encodeURIComponent(chatId)
  const encUserId = encodeURIComponent(userId)

  return fetch(`${apiUrl}/get-chat-history?chat_id=${encChatId}&user_id=${encUserId}`, {
    method: 'GET',
    headers: {
      ...commonJsonHeaders,
      Authorization: `Bearer ${accessToken}`
    }
  }).then(checkJsonResponse)
}

export async function deleteChatHistory(chatId: number, userId: string, accessToken: string | undefined) {
  return fetch(`${apiUrl}/delete-chat-history`, {
    method: 'DELETE',
    headers: {
      ...commonJsonHeaders,
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      chat_id: chatId,
      user_id: userId
    })
  }).then(checkJsonResponse)
}

// Agent Chat Workflow Endpoints

export async function startWorkflow(
  agentId: number,
  userId: string,
  agentName: string,
  datasetName: string,
  description: string,
  abortSignal: AbortSignal,
  accessToken: string | undefined
) {
  return fetch(`${apiUrl}/start-workflow`, {
    method: 'POST',
    headers: {
      ...commonJsonHeaders,
      Authorization: `Bearer ${accessToken}`
    },
    signal: abortSignal,
    body: JSON.stringify({
      agent_id: agentId,
      user_id: userId,
      agent_name: agentName,
      dataset_name: datasetName,
      description: description
    })
  })
}

export async function sendUserResponse(workflowId: string, userResponse: string, accessToken: string | undefined) {
  return fetch(`${apiUrl}/send-user-response`, {
    method: 'POST',
    headers: {
      ...commonJsonHeaders,
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      workflow_id: workflowId,
      user_response: userResponse
    })
  }).then(checkJsonResponse)
}
