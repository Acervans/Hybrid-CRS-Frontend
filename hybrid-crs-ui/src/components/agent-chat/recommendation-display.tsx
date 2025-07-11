'use client'

import Image from 'next/image'
import { type FC, useState } from 'react'

import { ChevronDown, ChevronUp, Star, Tag } from 'lucide-react'
import { useTranslations } from 'next-intl'

import RatingSlider from '@/components/agent-chat/rating-slider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface RecommendationDisplayProps extends RecommendationList {
  archived: boolean
  submitted: boolean
  onFeedbackChange?: (newFeedback: Record<string, number | null>) => void
}

const RecommendationDisplay: FC<RecommendationDisplayProps> = ({
  recommendations,
  explanations,
  archived,
  submitted,
  onFeedbackChange
}) => {
  const t = useTranslations('AgentChat.Recommendations')

  const [feedback, setFeedback] = useState<Record<string, number | null>>(
    Object.fromEntries(recommendations.map(x => [x.itemId, null]))
  )

  const [explanationStates, setExplanationStates] = useState<{ [itemId: string]: boolean }>(
    Object.fromEntries(recommendations.map(x => [x.itemId, true]))
  )

  const handleFeedbackChange = (itemId: string, rating: number | null) => {
    const newFeedback = { ...feedback, [itemId]: rating }

    setFeedback(newFeedback)
    onFeedbackChange?.(newFeedback)
  }

  const toggleExplanation = (itemId: string) => {
    setExplanationStates(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  return (
    <div className='space-y-6'>
      {recommendations.length > 0 ? (
        <div className='space-y-4'>
          {recommendations.map((recommendation, index) => (
            <Card key={recommendation.itemId} className='overflow-hidden'>
              <CardHeader>
                <div className='flex flex-col lg:flex-row flex-wrap lg:items-start lg:justify-between gap-4'>
                  {/* Item info */}
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1 min-w-0'>
                        <div className='flex flex-wrap items-center gap-3 mb-2'>
                          <h3 className='text-lg font-semibold text-foreground'>{recommendation.name}</h3>
                          {recommendation.category && (
                            <Badge
                              variant='secondary'
                              className='flex whitespace-break-spaces items-center gap-1.5 flex-shrink-0'
                            >
                              <Tag className='w-3 h-3' />
                              {recommendation.category}
                            </Badge>
                          )}
                        </div>

                        <div className='flex items-center gap-4 text-sm text-muted-foreground flex-wrap'>
                          {recommendation.brand && <span className='font-medium'>{recommendation.brand}</span>}
                          {recommendation.falkordbRating && (
                            <span className='flex items-center gap-1'>
                              <Star className='w-3 h-3 fill-current text-yellow-500' />
                              {recommendation.falkordbRating}/5
                            </span>
                          )}
                        </div>

                        {recommendation.description && (
                          <p className='text-sm text-muted-foreground mt-2 line-clamp-2'>
                            {recommendation.description}
                          </p>
                        )}
                      </div>

                      {recommendation.imageUrl && (
                        <div className='ml-4 flex-shrink-0'>
                          <Image
                            src={recommendation.imageUrl as string}
                            alt={recommendation.name}
                            className='w-16 h-16 rounded-lg object-cover'
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              {/* Explanations */}
              <CardContent className='pt-0 space-y-3'>
                <Collapsible open={explanationStates[recommendation.itemId]}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => toggleExplanation(recommendation.itemId)}
                      className='flex items-center gap-2 p-0 h-auto font-medium text-foreground hover:bg-transparent'
                    >
                      {explanationStates[recommendation.itemId] ? (
                        <ChevronUp className='w-4 h-4' />
                      ) : (
                        <ChevronDown className='w-4 h-4' />
                      )}
                      {t('explanation')}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className='bg-muted/50 rounded-lg p-3 mt-2'>
                      <p className='text-sm text-foreground/80 leading-relaxed'>{explanations[index]}</p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Rating slider */}
                {!archived && !submitted && (
                  <div className='bg-muted/50 rounded-lg p-4'>
                    <RatingSlider
                      defaultValue={null}
                      onValueChange={rating => handleFeedbackChange(recommendation.itemId, rating)}
                      className='max-w-md mx-auto'
                    />
                  </div>
                )}

                {/* Previous feedback (local session) */}
                {(archived || submitted) && feedback[recommendation.itemId] && (
                  <div className='bg-muted/50 rounded-lg p-4'>
                    <div className='flex items-center justify-center gap-2 text-sm text-foreground'>
                      <span>{t('prevRating')}:</span>
                      <div className='flex items-center gap-1'>
                        <Star className='w-4 h-4 fill-current text-yellow-500' />
                        <span className='font-medium'>{feedback[recommendation.itemId]}/5</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className='text-center py-12'>
          <p className='text-muted-foreground'>{t('empty')}</p>
        </div>
      )}
    </div>
  )
}

export default RecommendationDisplay
