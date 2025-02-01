'use client'

import { useEffectOnce } from 'react-use'
import { Container, Skeleton, useMantineColorScheme } from '@mantine/core'
import { AiChat, useAsStreamAdapter, useAiChatApi } from '@nlux/react'
import { streamChat } from '@/lib/api'
import { highlighter } from '@nlux/highlighter'
import { useCallback, useEffect, useState } from 'react'
import '@nlux/themes/nova.css'

export default function HomePage() {
  const [isLoaded, setLoaded] = useState<boolean>(false)

  const { colorScheme } = useMantineColorScheme()
  const [chatTheme, setChatTheme] = useState<ColorScheme>(colorScheme)

  // We transform the streamText function into an adapter that <AiChat /> can use
  const chatAdapter = useAsStreamAdapter(streamChat)

  const chatApi = useAiChatApi()

  async function loadHighlighterTheme(theme: ColorScheme) {
    if (theme === 'dark') await import('@nlux/highlighter/dark-theme.css')
    else await import('@nlux/highlighter/light-theme.css')
  }

  const syncTheme = useCallback(() => {
    const newTheme = document.documentElement.getAttribute('data-mantine-color-scheme') as 'dark' | 'light'

    setChatTheme(newTheme)
    loadHighlighterTheme(newTheme)
  }, [])

  useEffectOnce(() => {
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        setTimeout(syncTheme, 200)
      })
    }
    syncTheme()
    setLoaded(true)
  })

  useEffect(() => {
    syncTheme()
  }, [colorScheme, syncTheme])

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
            layout: 'bubbles',
            conversationStarters: [
              // Funny prompts as if you're talking to HarryBotter
              { prompt: 'What is the spell to make my code work?' },
              { prompt: 'Can you show me a magic trick?' },
              { prompt: 'Where can I find the book of wizardry?' }
            ],
            historyPayloadSize: 'max',
            autoScroll: true
          }}
          displayOptions={{
            colorScheme: chatTheme
          }}
          messageOptions={{
            showCodeBlockCopyButton: false,
            editableUserMessages: true,
            syntaxHighlighter: highlighter,
            streamingAnimationSpeed: 10
          }}
          className='max-h-full shadow-lg rounded-lg'
        />
      ) : (
        <Skeleton height='100%' radius='md' />
      )}
    </Container>
  )
}
