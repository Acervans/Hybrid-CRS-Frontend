/* eslint-disable */

type Theme = 'dark' | 'light' | 'system'

type Locale = 'en' | 'es' | 'de' | 'fr' | 'it' | 'pt' | 'zh'

type SearchParams = {
  [key: string]: string | string[] | undefined
}

type PageProps<T extends { [key: string]: string } = {}> = {
  params: Promise<T>
  searchParams: Promise<SearchParams>
}

type RecommenderAgent = {
  user_id: string
  agent_id: string
  username: string
  agent_name: string
  created_at: number
  dataset_name: string
  public: boolean
  description: string
  processed: boolean
}

type ChatHistory = {
  user_id: string
  chat_id: number
  created_at: number
  chat_title: string
}
