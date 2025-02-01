import { StreamingAdapterObserver, ChatAdapterExtras } from '@nlux/react'
import { createOllama } from 'ollama-ai-provider'
import { streamText } from 'ai'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const commonHeaders: Record<string, string> = {
  'Content-Type': 'application/json',
  skip_zrok_insterstitial: '1'
}
const ollama = createOllama({
  baseURL: `${apiUrl}/ollama`,
  // baseURL: `http://localhost:11434/api`,
  headers: commonHeaders
})

// Stream text from the API -> Ollama
// We use HTTP POST to send the prompt to the server, and receive a stream of server-sent events
// We use the observer object passed by NLUX to send chunks of text to <AiChat />
export async function streamChat(prompt: string, observer: StreamingAdapterObserver, extras: ChatAdapterExtras) {
  try {
    const response = streamText({
      model: ollama('qwen2.5:3b'),
      temperature: 0.2,
      messages: [
        ...(extras.conversationHistory || []).map(chatItem => ({
          role: chatItem.role,
          content:
            (chatItem.message as string | Array<string>) instanceof Array
              ? (chatItem.message as unknown as Array<string>).join('')
              : chatItem.message
        })),
        {
          role: 'user',
          content: prompt
        }
      ],
      async onFinish() {
        // implement your own logic here, e.g. for storing messages
        // or recording token usage
      }
    }).toTextStreamResponse()

    if (response.status !== 200) {
      observer.error(new Error(`Something went wrong (${response.status}${' ' + response.statusText})`))
      return
    }

    if (!response.body) {
      return
    }

    // Read a stream of server-sent events
    // and feed them to the observer as they are being generated
    const reader = response.body.getReader()
    const textDecoder = new TextDecoder()

    while (true) {
      const { value, done } = await reader.read()
      if (done) {
        break
      }

      const content = textDecoder.decode(value)
      if (content) {
        observer.next(content)
      }
    }
    observer.complete()
  } catch (e) {
    const error = e as Error

    console.error(`[${error.name}] ${error.message}`)
    observer.error(error)
  }
}
