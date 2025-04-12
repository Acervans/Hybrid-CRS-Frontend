'use client'

import { ComponentPropsWithRef, forwardRef, useState } from 'react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type TooltipIconButtonProps = ComponentPropsWithRef<typeof Button> & {
  tooltip: string
  side?: 'top' | 'bottom' | 'left' | 'right'
}

export const TooltipIconButton = forwardRef<HTMLButtonElement, TooltipIconButtonProps>(
  ({ children, tooltip, side = 'bottom', className, ...rest }, ref) => {
    const [open, setOpen] = useState(false)

    return (
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger
          asChild
          onMouseDown={e => e.preventDefault()}
          onTouchStart={e => {
            e.currentTarget.dataset.tooltipTimeout = String(setTimeout(() => setOpen(true), 300))
          }}
          onTouchEnd={e => {
            clearTimeout(e.currentTarget.dataset.tooltipTimeout)
            setOpen(false)
          }}
        >
          <Button variant='ghost' size='icon' {...rest} className={cn('size-6 p-1', className)} ref={ref}>
            {children}
            <span className='sr-only'>{tooltip}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side={side}>{tooltip}</TooltipContent>
      </Tooltip>
    )
  }
)

TooltipIconButton.displayName = 'TooltipIconButton'
