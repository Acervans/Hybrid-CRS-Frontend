'use client'

import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { createContext } from 'react'

import { useLocalStorage } from 'react-use'

interface ModelContextType {
  model: string | undefined
  setModel: Dispatch<SetStateAction<string | undefined>>
}

export const ModelContext = createContext<ModelContextType>({
  model: '',
  setModel: () => {}
})

// ModelProvider component to provide LLM model for completions/chats
export const ModelProvider = ({ children }: { children: ReactNode }) => {
  const [model, setModel] = useLocalStorage('model', 'qwen2.5:3b')

  return (
    <ModelContext.Provider
      value={{
        model,
        setModel
      }}
    >
      {children}
    </ModelContext.Provider>
  )
}
