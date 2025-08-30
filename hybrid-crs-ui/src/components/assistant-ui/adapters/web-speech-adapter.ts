import { SpeechSynthesisAdapter } from '@assistant-ui/react'

export class WebSpeechSynthesisAdapter implements SpeechSynthesisAdapter {
  lang: string

  constructor(lang?: string) {
    this.lang = lang || 'en'
  }
  speak(text: string): SpeechSynthesisAdapter.Utterance {
    const utterance = new SpeechSynthesisUtterance(text)
    let resumeInterval: NodeJS.Timeout

    const subscribers = new Set<() => void>()
    const handleStart = () => {
      resumeInterval = setInterval(resume, 10000)
    }
    const handleEnd = (reason: 'finished' | 'error' | 'cancelled', error?: unknown) => {
      clearInterval(resumeInterval)
      if (res.status.type === 'ended') return

      res.status = { type: 'ended', reason, error }
      subscribers.forEach(handler => handler())
    }
    const resume = () => {
      window.speechSynthesis.pause()
      window.speechSynthesis.resume()
    }

    utterance.lang = this.lang
    utterance.addEventListener('start', () => handleStart())
    utterance.addEventListener('end', () => handleEnd('finished'))
    utterance.addEventListener('error', e => handleEnd('error', e.error))

    window.speechSynthesis.speak(utterance)

    const res: SpeechSynthesisAdapter.Utterance = {
      status: { type: 'running' },
      cancel: () => {
        window.speechSynthesis.cancel()
        handleEnd('cancelled')
      },
      subscribe: callback => {
        if (res.status.type === 'ended') {
          let cancelled = false
          queueMicrotask(() => {
            if (!cancelled) callback()
          })
          return () => {
            cancelled = true
          }
        } else {
          subscribers.add(callback)
          return () => {
            subscribers.delete(callback)
          }
        }
      }
    }
    return res
  }
}
