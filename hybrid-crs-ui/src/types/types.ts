/* eslint-disable */

// Types

type Theme = 'dark' | 'light' | 'system'

type Locale = 'en' | 'es' | 'de' | 'fr' | 'it' | 'pt' | 'zh'

type FileType = 'users' | 'items' | 'interactions'

type SearchParams = {
  [key: string]: string | string[] | undefined
}

type WorkflowEvent = {
  event: string
  message: Record<string, unknown> | RecommendationList | string
  done: boolean
}

// Interfaces

interface RecommenderAgent {
  userId: string
  agentId: number
  username: string
  agentName: string
  createdAt: number
  datasetName: string
  public: boolean
  description: string
  processed: boolean
  newSessions: number
}

interface Filters {
  showPublic: boolean
  showPrivate: boolean
  showProcessed: boolean
  showProcessing: boolean
  showMyAgents: boolean
  sortBy: 'created_at' | 'agent_name' | 'dataset_name'
  sortOrder: 'asc' | 'desc'
}

interface ChatHistory {
  userId: string
  chatId: number
  createdAt: number
  chatTitle: string | undefined
  agentId: number | undefined
  archived: boolean
}

interface ColumnDefinition {
  id: string
  name: string
  role: string
  dataType: string
  delimiter?: string
  originalName?: string
}

interface SniffResult {
  delimiter: string
  hasHeader: boolean
  newlineStr: string
  quoteChar: string
  labels: string[]
  totalRows: number
}

interface FileData {
  id: string
  name: string
  originalName: string
  file: File
  fileType: FileType
  headers: string[] | null
  columns: ColumnDefinition[]
  sniffResult: SniffResult
  sampleData: string[][]
}

interface AgentConfiguration {
  agentName: string
  datasetName: string
  description: string
  public: boolean
}

interface Recommendation {
  itemId: string
  name: string
  category?: string
  falkordbRating?: number
  [key: string]: string | number | undefined
}

interface RecommendationList {
  recommendations: Recommendation[]
  explanations: string[]
}
