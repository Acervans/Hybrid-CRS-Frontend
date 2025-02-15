'use client'

import { useTranslations } from 'next-intl'
import { Check, Loader2, Trash } from 'lucide-react'

import { formatBytes } from '@/lib/utils'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

import { Bot } from 'lucide-react'
import { MouseEventHandler, useContext, useRef, useState } from 'react'
import { ollamaDelete, ollamaList, ollamaPull } from '@/lib/api'
import { ModelResponse, ProgressResponse } from 'ollama/browser'
import { useEffectOnce } from 'react-use'
import { ModelContext } from '@/contexts/modelContext'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

function ConfirmDeleteDialog(props: { model: string; onConfirm?: MouseEventHandler<HTMLButtonElement> }) {
  const t = useTranslations('LLM')

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='ghost' className='h-auto w-auto p-0' onClick={e => e.stopPropagation()}>
          <Trash />
        </Button>
      </DialogTrigger>
      <DialogContent onClick={e => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>{t('deleteDialogTitle', { model: props.model })}</DialogTitle>
          <DialogDescription>{t('deleteDialogConfirm', { model: props.model })}</DialogDescription>
        </DialogHeader>
        <DialogFooter className='flex flex-row gap-2 justify-center'>
          <Button
            variant='destructive'
            type='submit'
            onClick={e => {
              e.stopPropagation()
              if (props.onConfirm) props.onConfirm(e)
            }}
          >
            {t('delete')}
          </Button>
          <DialogClose asChild>
            <Button variant='secondary' onClick={e => e.stopPropagation()}>
              {t('cancel')}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function LlmSelector() {
  const t = useTranslations('LLM')
  const [localModels, setLocalModels] = useState<Array<ModelResponse>>()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState<string>()
  const [pulling, setPulling] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const progressGen = useRef<AsyncIterable<ProgressResponse> & { abort(): void }>(null)
  const { model, setModel } = useContext(ModelContext)
  const { toast } = useToast()

  const refreshModels = async () => {
    return ollamaList().then(listResponse => {
      setLocalModels(listResponse.models)
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
    ollamaPull(search)
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

  const deleteModel = async (model: string) => {
    return ollamaDelete(model)
      .then(() => {
        toast({
          title: t('deleteSuccess', { model: model })
        })
        refreshModels()
      })
      .catch(err => {
        console.error(err)
        toast({
          variant: 'destructive',
          title: t('deleteFail', { model: model })
        })
      })
  }

  useEffectOnce(() => {
    refreshModels()
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <PopoverTrigger asChild>
              <Bot />
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('tooltip')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent className='p-0'>
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
                  }}
                >
                  {m.name}
                  <span className='text-primary ml-auto'>{formatBytes(m.size, 1)}</span>
                  <Check className={model === m.name ? 'opacity-100' : 'opacity-0'} />
                  <ConfirmDeleteDialog model={m.name} onConfirm={() => deleteModel(m.name)} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
