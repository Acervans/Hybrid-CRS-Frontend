import { AgentChat } from '@/views/AgentChat'

export default async function ChatPage(props: PageProps<{ slug: string }>) {
  return <AgentChat agentId={(await props.params).slug} />
}
