import { AgentChat } from '@/views/AgentChat'

export default async function ChatPage(props: PageProps<'/chat/[slug]'>) {
  return <AgentChat agentId={(await props.params).slug} />
}
