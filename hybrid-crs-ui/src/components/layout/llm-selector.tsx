'use client'

import Link from 'next/link'
import { useContext, useRef, useState } from 'react'

import { BotOff, Check, Loader2, RefreshCw, Trash } from 'lucide-react'
import { Bot } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { ModelResponse, ProgressResponse } from 'ollama/browser'
import { useEffectOnce } from 'react-use'

import { TooltipIconButton } from '@/components/assistant-ui/tooltip-icon-button'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ModelContext } from '@/contexts/modelContext'
import { SupabaseContext } from '@/contexts/supabaseContext'
import { useToast } from '@/hooks/use-toast'
import { ollamaDelete, ollamaList, ollamaPull } from '@/lib/api'
import { formatBytes } from '@/lib/utils'

export function LlmSelectorDisabled() {
  const t = useTranslations('LLM')

  return (
    <Tooltip>
      <TooltipTrigger>
        <BotOff className='text-gray-400 cursor-not-allowed' />
      </TooltipTrigger>
      <TooltipContent>
        <p>{t('tooltip')}</p>
      </TooltipContent>
    </Tooltip>
  )
}

export function LlmSelector() {
  const t = useTranslations('LLM')
  const [localModels, setLocalModels] = useState<Array<ModelResponse>>()
  const [open, setOpen] = useState<boolean>(false)
  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [search, setSearch] = useState<string>()
  const [pulling, setPulling] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const progressGen = useRef<AsyncIterable<ProgressResponse> & { abort(): void }>(null)
  const { model, setModel } = useContext(ModelContext)
  const { getAccessToken } = useContext(SupabaseContext)
  const { toast } = useToast()

  const refreshModels = async () => {
    return ollamaList(await getAccessToken()).then(listResponse => {
      setLocalModels(listResponse.models)
      return listResponse.models
    })
  }

  const resetPull = () => {
    setPulling(false)
    setProgress(0)
  }

  const pullModel = async () => {
    if (!search) {
      return
    }
    setPulling(true)
    ollamaPull(search, await getAccessToken())
      .then(async response => {
        if (!response) {
          return
        }
        progressGen.current = response
        for await (const progressRes of response) {
          setProgress(prevValue => (prevValue !== 100 ? (progressRes.completed / progressRes.total) * 100 : 100))
        }
        toast({
          title: t('pullSuccess', { model: search })
        })
        refreshModels().then(() => {
          setModel(search)
          resetPull()
        })
      })
      .catch(err => {
        const error = new Error(err)

        resetPull()
        if (!error.message.includes('AbortError')) {
          console.error(error)
          toast({
            variant: 'destructive',
            title: error.message.includes('not exist') ? t('notFound') : t('pullError')
          })
        }
      })
  }

  const deleteModel = async (modelToDelete: string) => {
    return ollamaDelete(modelToDelete, await getAccessToken())
      .then(() => {
        toast({
          title: t('deleteSuccess', { model: modelToDelete })
        })
        refreshModels().then(models => {
          if (modelToDelete === model && models.length) setModel(models[0].name)
        })
      })
      .catch(err => {
        console.error(err)
        toast({
          variant: 'destructive',
          title: t('deleteFail', { model: modelToDelete })
        })
      })
  }

  useEffectOnce(() => {
    refreshModels()
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
        <TooltipTrigger
          asChild
          onMouseDown={e => e.preventDefault()}
          onTouchStart={e => {
            e.currentTarget.dataset.tooltipTimeout = String(setTimeout(() => setTooltipOpen(true), 300))
          }}
          onTouchEnd={e => {
            clearTimeout(e.currentTarget.dataset.tooltipTimeout)
            setTooltipOpen(false)
          }}
          onFocus={e => {
            if (!e.relatedTarget) e.preventDefault()
          }}
        >
          <PopoverTrigger>
            <Bot />
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('tooltip')}</p>
        </TooltipContent>
        <PopoverContent className='p-0 w-auto max-w-[20rem]'>
          <Command
            filter={(value, search) => {
              return Number(value.toLocaleLowerCase().includes(search.toLowerCase()))
            }}
          >
            <CommandInput
              placeholder={t('searchPlaceholder')}
              disabled={pulling}
              className='h-9'
              value={search}
              onValueChange={value => setSearch(value)}
              append={
                <TooltipIconButton
                  tooltip={t('refreshModels')}
                  onClick={() => {
                    if (!refreshing) {
                      setRefreshing(true)
                      refreshModels()
                      setTimeout(() => setRefreshing(false), 1000)
                    }
                  }}
                >
                  <RefreshCw className={refreshing ? 'animate-spin' : ''} />
                </TooltipIconButton>
              }
            />
            <CommandList>
              <CommandEmpty className='flex flex-col gap-2 p-4 min-w-full w-fit'>
                <span>
                  {t.rich('modelNotFound', {
                    ollama: chunks => (
                      <Link
                        className='text-primary underline-offset-4 hover:underline'
                        target='_blank'
                        href='https://ollama.com/library'
                      >
                        {chunks}
                      </Link>
                    )
                  })}
                  .
                </span>
                <Button
                  variant='default'
                  type='submit'
                  onClick={pullModel}
                  disabled={pulling || !search?.length}
                  className='whitespace-normal break-all h-auto'
                >
                  {pulling ? (
                    <>
                      <Loader2 className='animate-spin' />
                      {t('pulling')}
                    </>
                  ) : (
                    <>{t('pullPrompt')}</>
                  )}{' '}
                  {search}
                </Button>
                <Button
                  variant='destructive'
                  className={!pulling ? 'hidden' : ''}
                  onClick={() => {
                    if (progressGen.current) {
                      progressGen.current.abort()
                      resetPull()
                    }
                  }}
                >
                  {t('cancel')}
                </Button>
                {pulling && <Progress value={progress} className='h-3' />}
              </CommandEmpty>
              <CommandGroup>
                {localModels?.map(m => (
                  <CommandItem
                    key={m.name}
                    value={m.name}
                    onSelect={currentValue => {
                      if (currentValue !== model) setModel(currentValue)
                      setOpen(false)
                      setTimeout(() => setSearch(''), 150)
                    }}
                  >
                    <span className='max-w-[11rem] break-words'>{m.name}</span>
                    <span className='text-primary ml-auto'>{formatBytes(m.size, 1)}</span>
                    <Check className={model === m.name ? 'opacity-100' : 'opacity-0'} />
                    <div onClick={e => e.stopPropagation()}>
                      <ConfirmationDialog
                        title={t('deleteModel', { model: m.name })}
                        description={t('deleteDialogConfirm', { model: m.name })}
                        confirmLabel={t('delete')}
                        cancelLabel={t('cancel')}
                        variant='destructive'
                        onConfirm={() => deleteModel(m.name)}
                        trigger={
                          <Button
                            title={t('deleteModel', { model: m.name })}
                            variant='ghost'
                            className='h-6 w-auto !p-0'
                          >
                            <Trash />
                          </Button>
                        }
                      />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Tooltip>
    </Popover>
  )
}
