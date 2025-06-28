'use client'

import type React from 'react'
import { createContext, useCallback, useContext, useState } from 'react'

import { createAgent } from '@/lib/api'
import { addRecommenderAgent, deleteRecommenderAgentById } from '@/lib/supabase/client'

import { SupabaseContext } from './supabaseContext'

interface DataContextType {
  files: FileData[]
  agentConfig: AgentConfiguration
  isSubmitting: boolean
  addFile: (file: FileData) => void
  updateFile: (file: FileData) => void
  removeFile: (fileId: string) => void
  updateAgentConfig: (config: AgentConfiguration) => void
  setSubmitting: (isSubmitting: boolean) => void
  submitAgent: () => Promise<void>
  getAvailableFileTypes: () => FileType[]
  getFileByType: (type: FileType) => FileData | undefined
}

const DataContext = createContext<DataContextType | undefined>(undefined)

interface DataProviderProps {
  children: React.ReactNode
}

export function DataProvider({ children }: DataProviderProps) {
  const [files, setFiles] = useState<FileData[]>([])
  const [agentConfig, setAgentConfig] = useState<AgentConfiguration>({
    agentName: '',
    datasetName: '',
    description: '',
    public: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { supabase, auth, getAccessToken } = useContext(SupabaseContext)

  const addFile = useCallback((file: FileData) => {
    setFiles(prev => {
      // Check if we already have 3 files
      if (prev.length >= 3) {
        throw new Error('Maximum of 3 files allowed')
      }

      // Check if file type already exists
      if (prev.some(f => f.fileType === file.fileType)) {
        throw new Error(`A ${file.fileType} file already exists`)
      }

      return [...prev, file]
    })
  }, [])

  const updateFile = useCallback((file: FileData) => {
    setFiles(prev => prev.map(f => (f.id === file.id ? file : f)))
  }, [])

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }, [])

  const updateAgentConfig = useCallback((config: AgentConfiguration) => {
    setAgentConfig(config)
  }, [])

  const setSubmitting = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting)
  }, [])

  const getAvailableFileTypes = useCallback((): FileType[] => {
    const usedTypes = files.map(f => f.fileType)
    const allTypes: FileType[] = ['interactions', 'users', 'items']
    return allTypes.filter(type => !usedTypes.includes(type))
  }, [files])

  const getFileByType = useCallback(
    (type: FileType): FileData | undefined => {
      return files.find(f => f.fileType === type)
    },
    [files]
  )

  const submitAgent = useCallback(async () => {
    if (!auth?.data.user?.id) return

    if (!files.some(f => f.fileType === 'interactions')) {
      throw new Error('Interactions file is required')
    }

    if (!agentConfig.agentName.trim()) {
      throw new Error('Agent name is required')
    }

    if (!agentConfig.datasetName.trim()) {
      throw new Error('Dataset name is required')
    }

    setIsSubmitting(true)
    try {
      const newAgent = await addRecommenderAgent(supabase, {
        ...agentConfig,
        userId: auth.data.user.id,
        username: auth.data.user.user_metadata.full_name,
        processed: false
      })

      try {
        const accessToken = await getAccessToken()
        const result = await createAgent(newAgent.agentId, agentConfig, files, accessToken)

        console.log(`Agent created with ID ${result.agentId}: ${JSON.stringify(result.agentRow)}`)
        console.log(`Test scores: ${JSON.stringify(result.testScores)}`)
      } catch (error) {
        await deleteRecommenderAgentById(supabase, newAgent.agentId)
        throw error
      }
    } catch (error) {
      console.error('Agent submission failed:', error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }, [files, agentConfig, supabase, auth?.data.user, getAccessToken])

  const value: DataContextType = {
    files,
    agentConfig,
    isSubmitting,
    addFile,
    updateFile,
    removeFile,
    updateAgentConfig,
    setSubmitting,
    submitAgent,
    getAvailableFileTypes,
    getFileByType
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useDataContext() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider')
  }
  return context
}
