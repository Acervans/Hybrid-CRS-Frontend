'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'

import { ChevronsLeft, ChevronsRight, CirclePlus, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffectOnce } from 'react-use'
import { useDebouncedCallback } from 'use-debounce'

import { AgentCard } from '@/components/agent-hub/agent-card'
import { SearchAndFilters } from '@/components/agent-hub/search-and-filters'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import { useSidebar } from '@/components/ui/sidebar'
import { SupabaseContext } from '@/contexts/supabaseContext'
import { useIsMobile } from '@/hooks/use-mobile'
import { useToast } from '@/hooks/use-toast'
import { deleteAgent, retrainAgent } from '@/lib/api'
import {
  deleteRecommenderAgentById,
  getRecommenderAgentCount,
  getRecommenderAgents,
  setRecommenderAgentProcessed,
  updateRecommenderAgent
} from '@/lib/supabase/client'

const ITEMS_PER_PAGE = 12

const DEFAULT_FILTERS: Filters = {
  showPublic: true,
  showPrivate: true,
  showProcessed: true,
  showProcessing: true,
  showMyAgents: false,
  sortBy: 'created_at',
  sortOrder: 'desc'
}

export function AgentHub() {
  const t = useTranslations('AgentHub')
  const router = useRouter()
  const isMobile = useIsMobile()
  const searchParams = useSearchParams()
  const { open } = useSidebar()
  const { toast } = useToast()
  const { supabase, auth, getAccessToken } = useContext(SupabaseContext)

  const getBooleanParam = (key: string, fallback = 'true') => (searchParams.get(key) ?? fallback) === 'true'

  const [currentPage, setCurrentPage] = useState<number>(() => Number(searchParams.get('page')) || 1)
  const [agents, setAgents] = useState<RecommenderAgent[] | null>(null)
  const [total, setTotal] = useState<number>(0)
  const [absTotal, setAbsTotal] = useState<number>(0)
  const [filters, setFilters] = useState<Filters>(() => ({
    showPublic: getBooleanParam('showPublic'),
    showPrivate: getBooleanParam('showPrivate'),
    showProcessed: getBooleanParam('showProcessed'),
    showProcessing: getBooleanParam('showProcessing'),
    showMyAgents: getBooleanParam('showMyAgents', 'false'),
    sortBy: (searchParams.get('sortBy') ?? 'created_at') as Filters['sortBy'],
    sortOrder: (searchParams.get('sortOrder') ?? 'desc') as Filters['sortOrder']
  }))
  const [debouncedSearch, setDebouncedSearch] = useState<string | undefined>(() => searchParams.get('search') ?? '')

  const getPagedParams = useCallback(
    (page: number) => {
      const pagedParams = new URLSearchParams(searchParams)

      pagedParams.set('page', String(page))
      return pagedParams
    },
    [searchParams]
  )

  const updateURL = useDebouncedCallback((params: URLSearchParams) => {
    params.sort()
    router.replace(`?${params.toString()}`)
  }, 500)

  const updateAgents = useCallback(() => {
    if (auth?.data.user?.id) {
      getRecommenderAgents(supabase, debouncedSearch, filters, currentPage, ITEMS_PER_PAGE, auth.data.user.id)
        .then(response => {
          setAgents(response.agents)
          setTotal(response.total)
          if (!response.agents.length && response.total) {
            const prevPage = Math.max(currentPage - 1, 1)

            setCurrentPage(prevPage)
            updateURL(getPagedParams(prevPage))
          }
        })
        .catch(() => {
          setCurrentPage(1)
          updateURL(getPagedParams(1))
        })
    }
  }, [debouncedSearch, filters, currentPage, getPagedParams, updateURL, supabase, auth?.data.user?.id])

  // Pagination
  const start = total ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0
  const end = Math.min(currentPage * ITEMS_PER_PAGE, total)

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)
  const prevPage = Math.max(1, currentPage - 1)
  const nextPage = Math.min(totalPages, currentPage + 1)

  const resetToFirstPage = (params: URLSearchParams) => {
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
    params.delete('page')
    updateURL(params)
  }

  // Debounce to avoid excessive filtering
  const handleSearchChange = useDebouncedCallback((newSearch: string) => {
    const params = new URLSearchParams(searchParams)

    setDebouncedSearch(newSearch)
    if (newSearch) params.set('search', newSearch)
    else params.delete('search')
    resetToFirstPage(params)
  }, 300)

  const handleFiltersChange = (newFilters: Filters) => {
    const params = new URLSearchParams(searchParams)

    setFilters(newFilters)
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== DEFAULT_FILTERS[key as keyof Filters]) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    resetToFirstPage(params)
  }

  const handleClearFilters = () => {
    setDebouncedSearch(undefined)
    setFilters(DEFAULT_FILTERS)
    resetToFirstPage(new URLSearchParams())
  }

  const handleEditAgent = (updatedAgent: RecommenderAgent) => {
    updateRecommenderAgent(supabase, updatedAgent).then(() => {
      toast({
        title: t('updatedTitle'),
        description: t('updatedDescription', { agentName: updatedAgent.agentName })
      })
    })
  }

  const handleRetrainAgent = async (agentId: number) => {
    const agent = agents?.find(a => a.agentId === agentId)

    if (agent && auth?.data.user?.id) {
      setRecommenderAgentProcessed(supabase, agentId, false)
      retrainAgent(agentId, agent.datasetName, auth.data.user.id, await getAccessToken())
      toast({
        title: t('retrainingTitle'),
        description: t('retrainingDescription', { agentName: agent?.agentName || 'Agent' })
      })
    }
  }

  const handleDeleteAgent = async (agentId: number) => {
    const agent = agents?.find(a => a.agentId === agentId)

    if (agent && auth?.data.user?.id) {
      // Delete from backend, then Supabase
      deleteAgent(agentId, agent.datasetName, auth.data.user.id, await getAccessToken()).then(() => {
        deleteRecommenderAgentById(supabase, agentId).then(() => {
          toast({
            title: t('deletedTitle'),
            description: t('deletedDescription', { agentName: agent.agentName || 'Agent' })
          })
          if (Number(agents?.length) <= 1) {
            router.replace(`?${getPagedParams(Math.max(currentPage - 1, 1))}`)
          }
        })
      })
    }
  }

  const updateAbsoluteAgentCount = () => {
    getRecommenderAgentCount(supabase).then(setAbsTotal)
  }

  const isOwner = (agent: RecommenderAgent) => agent.userId === auth?.data.user?.id

  const updateAgentsRef = useRef(updateAgents)
  const agentsRef = useRef<RecommenderAgent[]>(null)

  const updateRealtimeAgents = useDebouncedCallback(() => {
    updateAgentsRef.current()
    updateAbsoluteAgentCount()
  }, 300)

  useEffect(() => {
    updateAgents()
    updateAgentsRef.current = updateAgents
  }, [updateAgents])

  useEffect(() => {
    agentsRef.current = agents
  }, [agents])

  useEffectOnce(() => {
    const channel = supabase
      .channel('table-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'RecommenderAgent'
        },
        async payload => {
          if (
            payload.eventType === 'UPDATE' &&
            payload.new.processed &&
            payload.new.user_id === (await supabase.auth.getSession()).data.session?.user.id
          ) {
            const old = agentsRef.current?.find(agent => agent.agentId === payload.new.agent_id)

            if (old && !old.processed) {
              toast({
                title: t('readyTitle'),
                description: t('readyDescription', { agentName: payload.new.agent_name })
              })
            }
          }
          updateRealtimeAgents()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'RecommenderAgentVisibility',
          filter: 'public=eq.false'
        },
        () => updateRealtimeAgents()
      )
      .subscribe()

    updateAbsoluteAgentCount()

    return () => {
      channel.unsubscribe()
    }
  })

  return (
    <div className='container mx-auto p-4 pb-16 sm:pb-4'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
        <div>
          <h1 className='text-3xl font-bold'>{t('title')}</h1>
          <p className='text-muted-foreground mt-1'>{t('subtitle')}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className='mb-4'>
        <SearchAndFilters
          initSearch={debouncedSearch}
          filters={filters}
          onSearchChange={handleSearchChange}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />
      </div>
      <div className='mb-4'>
        <p className='text-sm text-muted-foreground'>
          {t('showingAgents', {
            range: `${start}–${end}`,
            total: total
          })}
        </p>
      </div>

      <div
        className={`grid grid-cols-1 gap-4 ${open ? 'lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}
      >
        {agents?.map(agent => (
          <AgentCard
            key={agent.agentId}
            agent={agent}
            isOwner={isOwner(agent)}
            onEdit={handleEditAgent}
            onRetrain={handleRetrainAgent}
            onDelete={handleDeleteAgent}
          />
        ))}
      </div>

      {agents === null ? (
        <div className='absolute inset-0 flex items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin' />
        </div>
      ) : (
        agents?.length === 0 && (
          <div className='text-center py-12'>
            {total === absTotal ? (
              <p className='text-muted-foreground mb-4'>{t('noAgents')}</p>
            ) : (
              <>
                <p className='text-muted-foreground mb-4'>{t('noAgentsFilter')}</p>
                <Button onClick={handleClearFilters} variant='outline'>
                  {t('clearFilters')}
                </Button>
              </>
            )}
          </div>
        )
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex justify-center mt-3'>
          <Pagination>
            <PaginationContent>
              {/* Go to first page */}
              <PaginationItem>
                <PaginationLink
                  href={`?${getPagedParams(1)}`}
                  shallow
                  onClick={() => setCurrentPage(1)}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                >
                  <ChevronsLeft />
                </PaginationLink>
              </PaginationItem>

              {/* Previous */}
              <PaginationItem>
                <PaginationPrevious
                  href={`?${getPagedParams(prevPage)}`}
                  shallow
                  onClick={() => setCurrentPage(prevPage)}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>

              {/* Sliding window of 5 pages */}
              {Array.from({ length: isMobile ? 3 : 5 }, (_, i) => {
                const page = currentPage - (isMobile ? 1 : 2) + i
                if (page < 1 || page > totalPages) return null
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href={`?${getPagedParams(page)}`}
                      shallow
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className='cursor-pointer'
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}

              {/* Next */}
              <PaginationItem>
                <PaginationNext
                  href={`?${getPagedParams(nextPage)}`}
                  shallow
                  onClick={() => setCurrentPage(nextPage)}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>

              {/* Go to last page */}
              <PaginationItem>
                <PaginationLink
                  href={`?${getPagedParams(totalPages)}`}
                  shallow
                  onClick={() => setCurrentPage(totalPages)}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                >
                  <ChevronsRight />
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
      <Button
        asChild
        className='fixed rounded-xl text-md p-5! sm:bottom-6 sm:right-6 sm:left-auto sm:translate-x-0 bottom-3 left-1/2 -translate-x-1/2 shadow-lg hover:shadow-xl transition-shadow z-50'
      >
        <Link href='/create-agent'>
          <CirclePlus className='size-5' />
          {t('createAgent')}
        </Link>
      </Button>
    </div>
  )
}
