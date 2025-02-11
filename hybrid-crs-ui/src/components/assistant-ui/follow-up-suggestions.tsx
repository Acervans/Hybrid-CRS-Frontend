'use client'

import { useThread, ThreadPrimitive } from '@assistant-ui/react'
import type { FC } from 'react'

export const ThreadFollowupSuggestions: FC = () => {
  const suggestions = useThread(t => t.suggestions)
  return (
    <ThreadPrimitive.If empty={false} running={false}>
      {suggestions.length > 0 && (
        <div className='flex min-h-8 items-center justify-center gap-2'>
          {suggestions?.map((suggestion, idx) => (
            <ThreadPrimitive.Suggestion
              key={idx}
              className='bg-background hover:bg-muted/80 rounded-full border px-3 py-1 text-sm transition-colors ease-in'
              prompt={suggestion.prompt}
              method='replace'
              autoSend
            >
              {suggestion.prompt}
            </ThreadPrimitive.Suggestion>
          ))}
        </div>
      )}
    </ThreadPrimitive.If>
  )
}
