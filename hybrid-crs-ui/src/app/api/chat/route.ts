import { createOllama } from 'ollama-ai-provider'

const ollama = createOllama({
  // optional settings, e.g.
  baseURL: 'http://localhost:11434/api'
})

import { streamText } from 'ai'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { prompt } = await req.json()

  const result = await streamText({
    model: ollama('qwen2.5:3b'),
    messages: [
      {
        role: 'system',
        content: prompt
      }
    ],
    async onFinish() {
      // implement your own logic here, e.g. for storing messages
      // or recording token usage
    }
  })

  return result.toTextStreamResponse()
}
