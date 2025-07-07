'use client'

import { Dispatch, SetStateAction, createContext, useRef, useState } from 'react'

import { startWorkflow as startWorkflowApi } from '@/lib/api'

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
}>({
  startWorkflow: async () => {},
  setOnData: () => {},
  workflowId: null,
  setWorkflowId: () => null,
  abortWorkflow: () => {}
})

// WorkflowProvider component to provide workflow stream and subscription
export const WorkflowProvider = ({ children }: { children: React.ReactNode }) => {
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null)
  const onDataRef = useRef<((data: WorkflowEvent) => void) | null>(null)
  const [workflowId, setWorkflowId] = useState<string | null>(null)

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

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value)
        const data: WorkflowEvent = JSON.parse(text)

        if (data.event === 'WorkflowInit') {
          setWorkflowId(data.message as string)
        } else {
          onDataRef.current?.(data)
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

  return (
    <WorkflowContext.Provider value={{ startWorkflow, setOnData, workflowId, setWorkflowId, abortWorkflow }}>
      {children}
    </WorkflowContext.Provider>
  )
}
