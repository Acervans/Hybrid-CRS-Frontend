import { useCallback, useEffect, useState } from 'react'

import { Check, Copy, Eye, EyeOff, KeyRound } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { TooltipIconButton } from '@/components/assistant-ui/tooltip-icon-button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface AccessKeyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  getAccessKey: () => Promise<string>
}

const defaultKey = '*'.repeat(16)

export function AccessKeyModal({ open, onOpenChange, getAccessKey }: AccessKeyModalProps) {
  const t = useTranslations('Auth')
  const [isCopied, setIsCopied] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)
  const [displayValue, setDisplayValue] = useState(defaultKey)

  useEffect(() => {
    setIsRevealed(false)
    setIsCopied(false)
    if (!open) {
      setDisplayValue(defaultKey)
    }
  }, [open])

  const toggleReveal = useCallback(async () => {
    if (isRevealed) {
      setIsRevealed(false)
      setDisplayValue(defaultKey)
    } else {
      try {
        const accessToken = await getAccessKey()

        setDisplayValue(accessToken)
        setIsRevealed(true)
      } catch (err) {
        console.error('Failed to load token:', err)
      } finally {
      }
    }
  }, [isRevealed, getAccessKey])

  const copyToClipboard = useCallback(async () => {
    try {
      const accessToken = await getAccessKey()

      await navigator.clipboard.writeText(accessToken)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy token:', err)
      setIsCopied(false)
    }
  }, [getAccessKey])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('accessKeyTitle')}</DialogTitle>
          <DialogDescription className='flex items-center gap-3 mt-2'>
            <KeyRound className='hidden sm:block' />
            {t('accessKeyDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className='relative'>
          <Input
            value={displayValue}
            readOnly
            className='font-mono h-10 pr-20'
            type={isRevealed ? 'text' : 'password'}
          />
          <div className='absolute inset-y-0 right-0 flex items-center gap-1 mr-2'>
            <TooltipIconButton
              type='button'
              variant='ghost'
              size='sm'
              className='p-4!'
              onClick={toggleReveal}
              tooltip={isRevealed ? t('hideKey') : t('revealKey')}
            >
              {isRevealed ? <EyeOff /> : <Eye />}
            </TooltipIconButton>

            <TooltipIconButton
              type='button'
              variant='ghost'
              size='sm'
              className='p-4!'
              onClick={copyToClipboard}
              disabled={isCopied}
              tooltip={t('copy')}
            >
              {isCopied ? <Check /> : <Copy />}
            </TooltipIconButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
