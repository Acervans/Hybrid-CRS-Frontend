import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

// RecommenderAgent

export async function getRecommenderAgents(
  client: SupabaseClient,
  search: string | undefined,
  filters: Filters,
  page: number,
  perPage: number,
  userId: string
) {
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let query = client.from('RecommenderAgent').select('*', { count: 'exact' })

  // Filter by user ownership
  if (filters.showMyAgents) {
    query = query.eq('user_id', userId)
  }

  // Filter by public/private flags
  if (filters.showPublic && !filters.showPrivate) {
    query = query.eq('public', true)
  } else if (!filters.showPublic && filters.showPrivate) {
    query = query.eq('public', false)
  } else if (!filters.showPublic && !filters.showPrivate) {
    return {
      total: 0,
      agents: []
    }
  }

  // Filter by processed status
  if (filters.showProcessed && !filters.showProcessing) {
    query = query.eq('processed', true)
  } else if (!filters.showProcessed && filters.showProcessing) {
    query = query.eq('processed', false)
  } else if (!filters.showProcessed && !filters.showProcessing) {
    return {
      total: 0,
      agents: []
    }
  }

  // Text search
  if (search && search.trim() !== '') {
    // Escape % and _, remove commas
    const term = `%${search.replace(/[%*_]/g, '\\$&').replace(/,/g, '%').trim()}%`

    query = query.or(
      `agent_name.ilike.${term},username.ilike.${term},dataset_name.ilike.${term},description.ilike.${term}`
    )
  }

  // Sorting
  query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' })

  // Pagination
  query = query.range(from, to)

  const { data, count, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return {
    total: count ?? 0,
    agents: data.map(agent => ({
      userId: agent.user_id,
      agentId: agent.agent_id,
      username: agent.username,
      agentName: agent.agent_name,
      datasetName: agent.dataset_name,
      description: agent.description,
      public: agent.public,
      processed: agent.processed,
      createdAt: agent.created_at,
      newSessions: agent.new_sessions
    })) as RecommenderAgent[]
  }
}

export async function getRecommenderAgentCount(client: SupabaseClient) {
  const query = client.from('RecommenderAgent').select('*', { count: 'exact', head: true })

  const { count, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return Number(count)
}

export async function getRecommenderAgentById(
  client: SupabaseClient,
  agentId: number
): Promise<RecommenderAgent | null> {
  const { data, error } = await client.from('RecommenderAgent').select('*').eq('agent_id', agentId).single()

  if (error && error.code !== 'PGRST116') {
    // not found error
    throw new Error(error.message)
  }

  return data
    ? {
        userId: data.user_id,
        agentId: data.agent_id,
        username: data.username,
        agentName: data.agent_name,
        datasetName: data.dataset_name,
        description: data.description,
        public: data.public,
        processed: data.processed,
        createdAt: data.created_at,
        newSessions: data.new_sessions
      }
    : null
}

export async function addRecommenderAgent(
  client: SupabaseClient,
  agent: Omit<RecommenderAgent, 'createdAt' | 'agentId' | 'newSessions'>
): Promise<RecommenderAgent> {
  const { data, error } = await client
    .from('RecommenderAgent')
    .upsert({
      user_id: agent.userId,
      username: agent.username,
      agent_name: agent.agentName,
      dataset_name: agent.datasetName,
      public: agent.public,
      description: agent.description,
      processed: agent.processed,
      new_sessions: 0
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return {
    ...agent,
    agentId: data.agent_id,
    createdAt: data.created_at,
    newSessions: 0
  }
}

export async function deleteRecommenderAgentById(client: SupabaseClient, agentId: number): Promise<void> {
  const { error } = await client.from('RecommenderAgent').delete().eq('agent_id', agentId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function agentNameExists(client: SupabaseClient, userId: string, agentName: string): Promise<boolean> {
  const { count, error } = await client
    .from('RecommenderAgent')
    .select('agent_id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .ilike('agent_name', agentName)

  if (error) {
    throw new Error(error.message)
  }

  return count !== null && count > 0
}

export async function updateRecommenderAgent(client: SupabaseClient, agent: RecommenderAgent): Promise<void> {
  const { error } = await client
    .from('RecommenderAgent')
    .update({
      agent_name: agent.agentName,
      description: agent.description,
      public: agent.public,
      processed: agent.processed,
      new_sessions: agent.newSessions
    })
    .eq('agent_id', agent.agentId)
    .eq('user_id', agent.userId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function incrementRecommenderAgentNewSessions(client: SupabaseClient, agentId: number): Promise<void> {
  const { error } = await client.rpc('increment_new_sessions', { agent_id: agentId })

  if (error) {
    throw new Error(error.message)
  }
}

export async function setRecommenderAgentProcessed(
  client: SupabaseClient,
  agentId: number,
  processed: boolean
): Promise<void> {
  const { error } = await client
    .from('RecommenderAgent')
    .update({
      processed: processed
    })
    .eq('agent_id', agentId)

  if (error) {
    throw new Error(error.message)
  }
}

// ChatHistory

export async function getChatHistoryById(client: SupabaseClient, chatId: number): Promise<ChatHistory | null> {
  const { data, error } = await client.from('ChatHistory').select('*').eq('chat_id', chatId).single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message)
  }

  return data
    ? {
        userId: data.user_id,
        chatId: data.chat_id,
        createdAt: new Date(data.created_at).getTime(),
        chatTitle: data.chat_title,
        agentId: data.agent_id,
        archived: data.archived
      }
    : null
}

export async function getChatHistoriesByAgentId(client: SupabaseClient, agentId: number): Promise<ChatHistory[]> {
  const { data, error } = await client
    .from('ChatHistory')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data.map(chat => ({
    userId: chat.user_id,
    chatId: chat.chat_id,
    createdAt: new Date(chat.created_at).getTime(),
    chatTitle: chat.chat_title,
    agentId: chat.agent_id,
    archived: chat.archived
  }))
}

export async function getChatHistoriesByUserId(
  client: SupabaseClient,
  userId: string,
  openOnly?: boolean
): Promise<ChatHistory[]> {
  let query = client.from('ChatHistory').select('*').eq('user_id', userId)

  if (openOnly) {
    query = query.is('agent_id', null)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data.map(chat => ({
    userId: chat.user_id,
    chatId: chat.chat_id,
    createdAt: new Date(chat.created_at).getTime(),
    chatTitle: chat.chat_title,
    agentId: chat.agent_id,
    archived: chat.archived
  }))
}

export async function addChatHistory(
  client: SupabaseClient,
  userId: string,
  chatTitle: string,
  agentId?: number
): Promise<ChatHistory> {
  const { data, error } = await client
    .from('ChatHistory')
    .upsert({
      user_id: userId,
      chat_title: chatTitle,
      agent_id: agentId || null,
      archived: agentId !== undefined
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return {
    userId: data.user_id,
    chatId: data.chat_id,
    chatTitle: data.chat_title,
    createdAt: new Date(data.created_at).getTime(),
    agentId: data.agent_id,
    archived: data.archived
  }
}

export async function deleteChatHistoryById(client: SupabaseClient, chatId: number): Promise<void> {
  const { error } = await client.from('ChatHistory').delete().eq('chat_id', chatId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function updateChatHistory(client: SupabaseClient, chatId: number, updateObject: object): Promise<void> {
  const { error } = await client.from('ChatHistory').update(updateObject).eq('chat_id', chatId)

  if (error) {
    throw new Error(error.message)
  }
}
