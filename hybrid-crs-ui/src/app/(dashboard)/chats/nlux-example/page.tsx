'use client'

import { useEffectOnce } from 'react-use'
import { Container, useMantineColorScheme } from '@mantine/core'
import { AiChat, useAsStreamAdapter, useAiChatApi } from '@nlux/react'
import { streamText } from './stream'
import { highlighter } from '@nlux/highlighter'
import { useState } from 'react'
import '@nlux/themes/nova.css'

export default function HomePage() {
  const [isLoaded, setLoaded] = useState<boolean>(false)

  const { colorScheme } = useMantineColorScheme()

  // We transform the streamText function into an adapter that <AiChat /> can use
  const chatAdapter = useAsStreamAdapter(streamText)

  const chatApi = useAiChatApi()

  async function loadHighlighterTheme() {
    if (colorScheme === 'dark') await import('@nlux/highlighter/dark-theme.css')
    else await import('@nlux/highlighter/light-theme.css')
  }

  useEffectOnce(() => {
    loadHighlighterTheme()
    setLoaded(true)
  })

  return (
    <Container size={'100%'} p={0} h={'100%'} mah={'100%'} className='aiChat-container'>
      {isLoaded ? (
        <AiChat
          adapter={chatAdapter}
          api={chatApi}
          personaOptions={{
            assistant: {
              name: 'HarryBotter',
              avatar: 'https://docs.nlkit.com/nlux/images/personas/harry-botter.png',
              tagline: 'Making Magic With Mirthful AI'
            },
            user: {
              name: 'Alex',
              avatar: 'https://docs.nlkit.com/nlux/images/personas/alex.png'
            }
          }}
          conversationOptions={{
            conversationStarters: [
              // Funny prompts as if you're talking to HarryBotter
              { prompt: 'What is the spell to make my code work?' },
              { prompt: 'Can you show me a magic trick?' },
              { prompt: 'Where can I find the book of wizardry?' }
            ],
            historyPayloadSize: 'max'
          }}
          displayOptions={{
            // width: 800,
            // height: 640,
            colorScheme: colorScheme
          }}
          messageOptions={{
            showCodeBlockCopyButton: false,
            editableUserMessages: true,
            syntaxHighlighter: highlighter
          }}
          className='max-h-full h-full'
        />
      ) : (
        // Maybe loading skeleton
        'Loading chat...'
      )}
    </Container>
  )
}
