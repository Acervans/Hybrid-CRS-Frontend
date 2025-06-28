'use client'

import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { createContext, useState } from 'react'

import { useLocalStorage } from 'react-use'

interface ModelContextType {
  model: string | undefined
  agent: RecommenderAgent | undefined
  setModel: Dispatch<SetStateAction<string | undefined>>
  setAgent: Dispatch<SetStateAction<RecommenderAgent | undefined>>
}

export const ModelContext = createContext<ModelContextType>({
  model: undefined,
  agent: undefined,
  setModel: () => {},
  setAgent: () => {}
})

// ModelProvider component to provide LLM model for completions/chats, as well as current agent
export const ModelProvider = ({ children }: { children: ReactNode }) => {
  const [model, setModel] = useLocalStorage('model', 'qwen2.5:3b')
  const [agent, setAgent] = useState<RecommenderAgent | undefined>()

  return (
    <ModelContext.Provider
      value={{
        model,
        agent,
        setModel,
        setAgent
      }}
    >
      {children}
    </ModelContext.Provider>
  )
}
