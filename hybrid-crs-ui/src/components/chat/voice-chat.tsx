'use client'

import { HTMLAttributes, ReactElement, useCallback, useContext, useEffect, useState } from 'react'

import { useComposerRuntime } from '@assistant-ui/react'
import { Mic } from 'lucide-react'
import { useTranslations } from 'next-intl'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { useEffectOnce } from 'react-use'

import { TooltipIconButton } from '@/components/assistant-ui/tooltip-icon-button'
import { Skeleton } from '@/components/ui/skeleton'
import { availableLanguages } from '@/constants'
import { LocaleContext } from '@/contexts/localeContext'

const localeToSpeechLang: Record<Locale, string> = {
  en: 'en-GB',
  es: 'es-ES',
  de: 'de-DE',
  fr: 'fr-FR',
  it: 'it-IT',
  pt: 'pt-PT',
  zh: 'zh-CN'
}

export default function VoiceChat(props: HTMLAttributes<HTMLElement>): ReactElement {
  const { ...rest } = props
  const t = useTranslations('Chat')

  const { locale } = useContext(LocaleContext)
  const [loaded, setLoaded] = useState<boolean>(false)
  const composerRuntime = useComposerRuntime()

  const setText = useCallback(
    (text: string) => {
      composerRuntime.setText(text)
    },
    [composerRuntime]
  )

  const { transcript, listening, isMicrophoneAvailable, browserSupportsSpeechRecognition } = useSpeechRecognition({
    clearTranscriptOnListen: true
  })

  useEffectOnce(() => {
    setLoaded(true)
  })

  useEffect(() => {
    if (transcript.length > 0) {
      setText(transcript)
    }
  }, [transcript, setText])

  return (
    <>
      {loaded ? (
        <TooltipIconButton
          {...rest}
          tooltip={
            isMicrophoneAvailable
              ? listening
                ? t('voiceStop')
                : `${t('voiceTooltip')} (${availableLanguages[locale]})`
              : t('voiceTooltipDisabled')
          }
          style={{ color: listening ? 'red' : '', display: !browserSupportsSpeechRecognition ? 'none' : '' }}
          variant='ghost'
          side='top'
          onClick={e => {
            e.preventDefault()
            if (browserSupportsSpeechRecognition && isMicrophoneAvailable) {
              if (!listening) SpeechRecognition.startListening({ language: localeToSpeechLang[locale] })
              else SpeechRecognition.abortListening()
            }
          }}
          className={`${rest.className} ${!isMicrophoneAvailable ? 'opacity-50 cursor-not-allowed hover:bg-inherit' : ''}`}
        >
          <Mic />
        </TooltipIconButton>
      ) : (
        <Skeleton className={rest.className} />
      )}
    </>
  )
}
