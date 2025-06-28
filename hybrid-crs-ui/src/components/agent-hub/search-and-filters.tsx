'use client'

import { useEffect, useMemo, useState } from 'react'

import { ArrowDown, ArrowUp, Filter, Minus, Search, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface SearchAndFiltersProps {
  initSearch?: string
  filters: Filters
  onSearchChange: (search: string) => void
  onFiltersChange: (filters: Filters) => void
  onClearFilters: () => void
}

export function SearchAndFilters({
  initSearch,
  filters,
  onSearchChange,
  onFiltersChange,
  onClearFilters
}: SearchAndFiltersProps) {
  const t = useTranslations('AgentHub.SearchAndFilters')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [search, setSearch] = useState(() => initSearch ?? '')

  const handleSearchChange = (value: string) => {
    setSearch(value)
    onSearchChange(value)
  }

  const handleFilterChange = (key: keyof Filters, value: boolean | string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const cycleSortOrder = (sortBy: string) => {
    const orders: Array<'asc' | 'desc'> = ['asc', 'desc']

    if (filters.sortBy === sortBy) {
      // If clicking on selected sort field, cycle through orders
      const currentIndex = orders.indexOf(filters.sortOrder)
      const nextIndex = (currentIndex + 1) % orders.length
      onFiltersChange({ ...filters, sortBy: sortBy as Filters['sortBy'], sortOrder: orders[nextIndex] })
    } else {
      // If clicking on different sort field, start with ascending
      onFiltersChange({ ...filters, sortBy: sortBy as Filters['sortBy'], sortOrder: 'asc' })
    }
  }

  const getSortOrderIcon = (sortBy: string) => {
    if (filters.sortBy !== sortBy) return <Minus className='h-4 w-4' />

    switch (filters.sortOrder) {
      case 'asc':
        return <ArrowUp className='h-4 w-4' />
      case 'desc':
        return <ArrowDown className='h-4 w-4' />
      default:
        return <Minus className='h-4 w-4' />
    }
  }

  const getSortOrderLabel = (sortBy: string) => {
    if (filters.sortBy !== sortBy) return t('default')

    switch (filters.sortOrder) {
      case 'asc':
        return t('ascending')
      case 'desc':
        return t('descending')
      default:
        return t('default')
    }
  }

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (!filters.showPublic || !filters.showPrivate) count++
    if (!filters.showProcessed || !filters.showProcessing) count++
    if (filters.showMyAgents) count++
    if (filters.sortBy !== 'created_at' || filters.sortOrder !== 'desc') count++
    return count
  }, [filters])

  useEffect(() => {
    if (initSearch === undefined) setSearch('')
  }, [initSearch])

  return (
    <TooltipProvider>
      <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center'>
        <div className='relative flex-1 w-full max-w-md'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
          <Input
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            className='pl-10 text-sm'
          />
        </div>

        <div className='flex flex-row gap-4'>
          <div className='relative'>
            <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' className='flex items-center gap-2'>
                  <Filter className='h-4 w-4' />
                  {t('filters')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-64'>
                <DropdownMenuLabel>{t('ownership')}</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={filters.showMyAgents}
                  onCheckedChange={checked => handleFilterChange('showMyAgents', checked)}
                >
                  {t('myAgents')}
                </DropdownMenuCheckboxItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel>{t('visibility')}</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={filters.showPublic}
                  onCheckedChange={checked => handleFilterChange('showPublic', checked)}
                >
                  {t('publicAgents')}
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.showPrivate}
                  onCheckedChange={checked => handleFilterChange('showPrivate', checked)}
                >
                  {t('privateAgents')}
                </DropdownMenuCheckboxItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel>{t('status')}</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={filters.showProcessed}
                  onCheckedChange={checked => handleFilterChange('showProcessed', checked)}
                >
                  {t('processedAgents')}
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.showProcessing}
                  onCheckedChange={checked => handleFilterChange('showProcessing', checked)}
                >
                  {t('processingAgents')}
                </DropdownMenuCheckboxItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel>{t('sortBy')}</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleFilterChange('sortBy', 'created_at')}>
                  <div className='flex items-center justify-between w-full'>
                    <span>{t('creationDate')}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-6 w-6 p-0'
                          onClick={e => {
                            e.stopPropagation()
                            cycleSortOrder('created_at')
                          }}
                        >
                          {getSortOrderIcon('created_at')}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{getSortOrderLabel('created_at')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange('sortBy', 'agent_name')}>
                  <div className='flex items-center justify-between w-full'>
                    <span>{t('agentName')}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-6 w-6 p-0'
                          onClick={e => {
                            e.stopPropagation()
                            cycleSortOrder('agent_name')
                          }}
                        >
                          {getSortOrderIcon('agent_name')}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{getSortOrderLabel('agent_name')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange('sortBy', 'dataset_name')}>
                  <div className='flex items-center justify-between w-full'>
                    <span>{t('datasetName')}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-6 w-6 p-0'
                          onClick={e => {
                            e.stopPropagation()
                            cycleSortOrder('dataset_name')
                          }}
                        >
                          {getSortOrderIcon('dataset_name')}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{getSortOrderLabel('dataset_name')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {activeFilterCount > 0 && (
              <Badge
                variant='default'
                className='absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs border border-white'
              >
                {activeFilterCount}
              </Badge>
            )}
          </div>
          {(activeFilterCount > 0 || search) && (
            <Button variant='ghost' size='sm' onClick={onClearFilters} className='flex items-center gap-2'>
              <X className='h-4 w-4' />
              {t('clear')}
            </Button>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
