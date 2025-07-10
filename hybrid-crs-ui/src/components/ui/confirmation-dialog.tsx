'use client'

import type React from 'react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
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

interface ConfirmationDialogProps {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'destructive'
  onConfirm?: () => void
  trigger: React.ReactNode
  confirmButton?: React.ReactNode
  disabled?: boolean
}

export function ConfirmationDialog({
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  trigger,
  confirmButton,
  disabled
}: ConfirmationDialogProps) {
  const [open, setOpen] = useState(false)

  const handleConfirm = () => {
    onConfirm?.()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild disabled={disabled}>
        {trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>{cancelLabel}</Button>
          </DialogClose>
          {confirmButton ? (
            <div onClick={handleConfirm}>{confirmButton}</div>
          ) : (
            <Button variant={variant} type='submit' onClick={handleConfirm}>
              {confirmLabel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
