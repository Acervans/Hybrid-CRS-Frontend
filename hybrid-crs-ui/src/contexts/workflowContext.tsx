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
  lastRecommendationList: RecommendationList | undefined
  setLastRecommendationList: Dispatch<SetStateAction<RecommendationList | undefined>>
  lastFeedback: Record<string, number | undefined> | null
  setLastFeedback: Dispatch<SetStateAction<Record<string, number | undefined> | null>>
  sendLastFeedback: () => Promise<void>
  parseWorkflowEvent: (response: WorkflowEvent) => string
}>({
  startWorkflow: async () => {},
  setOnData: () => {},
  workflowId: null,
  setWorkflowId: () => null,
  abortWorkflow: () => {},
  lastRecommendationList: { recommendations: [], explanations: [] },
  setLastRecommendationList: () => {},
  lastFeedback: {},
  setLastFeedback: () => {},
  sendLastFeedback: async () => {},
  parseWorkflowEvent: () => ''
})

// WorkflowProvider component to provide workflow stream and subscription
export const WorkflowProvider = ({ children }: { children: React.ReactNode }) => {
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null)
  const onDataRef = useRef<((data: WorkflowEvent) => void) | null>(null)
  const [workflowId, setWorkflowId] = useState<string | null>(null)
  const [lastRecommendationList, setLastRecommendationList] = useState<RecommendationList>()
  // Feedback for current recommendations
  const [lastFeedback, setLastFeedback] = useState<Record<string, number | undefined> | null>(null)
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
          console.log('RECEIVED:', text)

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

        setLastRecommendationList({
          recommendations,
          explanations
        })

        return ''
      }
      case 'InputRequiredEvent': {
        const data = response.message as Record<string, unknown>

        if (data.from_event === 'RecommendationGeneratedEvent') {
          console.log('InputRequiredEvent AFTER RecommendationGeneratedEvent')
        }
        return ''
      }
      default:
        return JSON.stringify(response)
    }
  }, [])

  const sendLastFeedback = async () => {
    if (workflowId !== null) {
      const accessToken = await getAccessToken()

      await sendUserResponse(workflowId, JSON.stringify(lastFeedback ?? {}), accessToken)
    }
  }

  return (
    <WorkflowContext.Provider
      value={{
        startWorkflow,
        setOnData,
        workflowId,
        setWorkflowId,
        abortWorkflow,
        lastRecommendationList,
        setLastRecommendationList,
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
