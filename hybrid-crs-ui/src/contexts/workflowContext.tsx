'use client'

import { Dispatch, SetStateAction, createContext, useCallback, useContext, useRef, useState } from 'react'

import { SupabaseContext } from '@/contexts/supabaseContext'
import { sendUserResponse, startWorkflow as startWorkflowApi } from '@/lib/api'

export const WorkflowContext = createContext<{
  startWorkflow: (
    agentId: number,
    userId: string,
    agentName: string,
    datasetName: string,
    description: string,
    abortSignal: AbortSignal,
    accessToken: string | undefined
  ) => Promise<void>
  setOnData: (cb: (data: WorkflowEvent) => void) => void
  workflowId: string | null
  setWorkflowId: Dispatch<SetStateAction<string | null>>
  abortWorkflow: () => void
  lastRecommendations: RecommendationList | undefined
  setLastRecommendations: Dispatch<SetStateAction<RecommendationList | undefined>>
  lastFeedback: Record<string, number | null> | null
  setLastFeedback: Dispatch<SetStateAction<Record<string, number | null> | null>>
  sendLastFeedback: () => Promise<number>
  parseWorkflowEvent: (response: WorkflowEvent) => string
}>({
  startWorkflow: async () => {},
  setOnData: () => {},
  workflowId: null,
  setWorkflowId: () => null,
  abortWorkflow: () => {},
  lastRecommendations: { recommendations: [], explanations: [] },
  setLastRecommendations: () => {},
  lastFeedback: {},
  setLastFeedback: () => {},
  sendLastFeedback: async () => 0,
  parseWorkflowEvent: () => ''
})

// WorkflowProvider component to provide workflow stream and subscription
export const WorkflowProvider = ({ children }: { children: React.ReactNode }) => {
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null)
  const onDataRef = useRef<((data: WorkflowEvent) => void) | null>(null)
  const [workflowId, setWorkflowId] = useState<string | null>(null)
  const [lastRecommendations, setLastRecommendations] = useState<RecommendationList>()
  // Feedback for current recommendations
  const [lastFeedback, setLastFeedback] = useState<Record<string, number | null> | null>(null)
  const { getAccessToken } = useContext(SupabaseContext)

  const setOnData = (cb: (data: WorkflowEvent) => void) => {
    onDataRef.current = cb
  }

  const startWorkflow = async (
    agentId: number,
    userId: string,
    agentName: string,
    datasetName: string,
    description: string,
    abortSignal: AbortSignal,
    accessToken: string | undefined
  ) => {
    if (readerRef.current) return // already started

    try {
      const response = await startWorkflowApi(
        agentId,
        userId,
        agentName,
        datasetName,
        description,
        abortSignal,
        accessToken
      )

      if (!response.body) return

      const reader = response.body.getReader()
      readerRef.current = reader
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value)

        if (text) {
          const eventStrings = text.split('\n\n')

          eventStrings.forEach(event => {
            if (!event) return

            const data: WorkflowEvent = JSON.parse(event)

            if (data.event === 'WorkflowInit') {
              setWorkflowId(data.message as string)
            } else {
              onDataRef.current?.(data)
            }
          })
        }
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        throw error
      }
    } finally {
      readerRef.current = null
      setWorkflowId(null)
      setLastFeedback(null)
      setLastRecommendations(undefined)
    }
  }

  const abortWorkflow = () => {
    if (readerRef.current) {
      try {
        readerRef.current.cancel()
      } catch {}
    }
    onDataRef.current?.({ event: 'AbortWorkflow', message: 'Aborted', done: true })
  }

  const parseWorkflowEvent = useCallback((response: WorkflowEvent): string => {
    switch (response.event) {
      case 'StreamEvent':
        return (response.message as Record<string, unknown>).delta as string
      case 'RecommendationGeneratedEvent': {
        const data = response.message as RecommendationList
        const recommendations = data.recommendations ?? []
        const explanations = data.explanations ?? []

        setLastRecommendations({
          recommendations,
          explanations
        })

        return ''
      }
      case 'InputRequiredEvent':
      case 'WorkflowEnd':
      case 'AbortWorkflow':
        return ''
      case 'Error': {
        console.error(response.message)
        return ''
      }
      default:
        return JSON.stringify(response)
    }
  }, [])

  const sendLastFeedback = async () => {
    if (workflowId === null || lastFeedback === null) {
      return 0
    }

    const accessToken = await getAccessToken()
    const validFeedbackEntries = Object.entries(lastFeedback).filter(fb => fb[1] !== null)
    const filteredFeedback = Object.fromEntries(validFeedbackEntries)

    await sendUserResponse(workflowId, JSON.stringify(filteredFeedback), accessToken)
    return validFeedbackEntries.length
  }

  return (
    <WorkflowContext.Provider
      value={{
        startWorkflow,
        setOnData,
        workflowId,
        setWorkflowId,
        abortWorkflow,
        lastRecommendations,
        setLastRecommendations,
        lastFeedback,
        setLastFeedback,
        sendLastFeedback,
        parseWorkflowEvent
      }}
    >
      {children}
    </WorkflowContext.Provider>
  )
}
