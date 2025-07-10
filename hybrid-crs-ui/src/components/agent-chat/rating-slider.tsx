'use client'

import { useState } from 'react'

import * as SliderPrimitive from '@radix-ui/react-slider'
import { Meh, ThumbsDown, ThumbsUp } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface RatingSliderProps {
  defaultValue?: number | null
  onValueChange?: (value: number | null) => void
  colors?: {
    light: string[]
    dark: string[]
  }
  labels?: (string | number)[]
  showIcons?: boolean
  title?: string
  className?: string
}

export default function RatingSlider({
  defaultValue = null,
  onValueChange,
  colors,
  labels = [1, 2, 3, 4, 5],
  showIcons = true,
  title = 'Rate this Recommendation',
  className = ''
}: RatingSliderProps) {
  const t = useTranslations('AgentChat.Recommendations')
  const [rating, setRating] = useState<number | null>(defaultValue)
  const { theme } = useTheme()

  // Default color schemes
  const defaultColors = {
    light: [
      '#ef4444', // red-500
      '#f97316', // orange-500
      '#eab308', // yellow-500
      '#84cc16', // lime-500
      '#22c55e' // green-500
    ],
    dark: [
      '#dc2626', // red-600
      '#ea580c', // orange-600
      '#ca8a04', // yellow-600
      '#65a30d', // lime-600
      '#16a34a' // green-600
    ]
  }

  const colorScheme = colors || defaultColors
  const currentColors = theme === 'dark' ? colorScheme.dark : colorScheme.light

  // Get color for rating value
  const getColor = (value: number) => {
    return currentColors[value - 1] || currentColors[0]
  }

  // Get icon based on rating
  const getIcon = (value: number) => {
    if (!showIcons) return null

    if (value <= 2) {
      return <ThumbsDown className='w-4 h-4' />
    } else if (value === 3) {
      return <Meh className='w-4 h-4' />
    } else if (value >= 4) {
      return <ThumbsUp className='w-4 h-4' />
    }
    return null
  }

  const handleValueChange = (newValue: number[]) => {
    const selectedRating = newValue[0]

    setRating(selectedRating)
    onValueChange?.(selectedRating)
  }

  // Create gradient from colors
  const gradientStops = currentColors
    .map((color, index) => `${color} ${(index / (currentColors.length - 1)) * 100}%`)
    .join(', ')

  return (
    <div className={cn('w-full', className)}>
      {/* Fixed height container with consistent layout */}
      <div className='h-full min-h-24 flex flex-col justify-between'>
        <div className='text-center flex-shrink-0'>
          <p className='text-sm font-medium text-foreground'>{title}</p>
        </div>

        {/* Slider container - centered */}
        <div className='relative w-full pt-11 pb-2 flex-grow flex items-center'>
          <div className='relative w-full'>
            <SliderPrimitive.Root
              key={String(rating === null)}
              value={rating !== null ? [rating] : [-1]}
              onValueChange={handleValueChange}
              max={labels.length}
              min={1}
              step={1}
              className='relative flex w-full touch-none select-none items-center'
            >
              <SliderPrimitive.Track
                className={`relative h-3 w-full grow overflow-hidden rounded-lg cursor-pointer ${rating === null ? 'opacity-60 hover:opacity-70' : 'opacity-100'}`}
                style={{
                  background: `linear-gradient(to right, ${gradientStops})`
                }}
                title={t('clickTooltip')}
              >
                <SliderPrimitive.Range className='absolute h-full bg-transparent' />
              </SliderPrimitive.Track>
              {rating !== null && (
                <SliderPrimitive.Thumb
                  className='block h-6 w-6 rounded-full border-3 border-background shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:scale-110 cursor-pointer'
                  style={{ backgroundColor: getColor(rating) }}
                  title={t('dragTooltip')}
                >
                  {/* Sticky label */}
                  <Badge
                    className='absolute left-1/2 -translate-x-1/2 -top-8 border-2 whitespace-nowrap'
                    style={{
                      backgroundColor: getColor(rating),
                      borderColor: getColor(rating),
                      color: 'white'
                    }}
                  >
                    <div className='flex items-center gap-1'>
                      {getIcon(rating)}
                      <span className='font-bold text-xs'>{labels[(rating ?? 0) - 1]}</span>
                    </div>
                    <div
                      className='absolute border-[6px] left-1/2 -translate-x-1/2 border-transparent top-full'
                      style={{ borderTopColor: getColor(rating) }}
                    />
                  </Badge>
                </SliderPrimitive.Thumb>
              )}
            </SliderPrimitive.Root>

            {/* Rating labels */}
            <div className='flex ml-2 mr-1.5 mt-2 h-4 justify-between'>
              {labels.map((label, index) => (
                <button
                  key={index}
                  className='text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer'
                  title={t('click')}
                  onClick={() => handleValueChange([index + 1])}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className='text-center flex-shrink-0 h-4'>
          {rating !== null ? (
            <button
              className='text-xs text-muted-foreground hover:text-foreground transition-colors'
              onClick={() => {
                setRating(null)
                onValueChange?.(null)
              }}
            >
              {t('clear')}
            </button>
          ) : (
            <span className='text-xs text-muted-foreground'>{t('click')}</span>
          )}
        </div>
      </div>
    </div>
  )
}
