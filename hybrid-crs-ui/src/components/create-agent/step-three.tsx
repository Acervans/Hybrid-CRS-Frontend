'use client'

import type React from 'react'
import { useMemo } from 'react'

import { ArrowLeft, CheckCircle, Database, Globe, Loader2, Lock, Send, Settings } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useDataContext } from '@/contexts/dataContext'
import { useToast } from '@/hooks/use-toast'

interface StepThreeProps {
  onBack: () => void
  onComplete: () => void
}

const FILE_TYPE_COLORS = {
  interactions: 'bg-orange-100 text-orange-800 border-orange-200',
  users: 'bg-blue-100 text-blue-800 border-blue-200',
  items: 'bg-green-100 text-green-800 border-green-200'
}

export function StepThree({ onBack, onComplete }: StepThreeProps) {
  const t = useTranslations('CreateAgent.StepThree')
  const locale = useLocale()
  const { agentConfig, files, isSubmitting, submitAgent } = useDataContext()
  const { toast } = useToast()

  const handleSubmit = async () => {
    try {
      await submitAgent()
      toast({
        title: t('successTitle'),
        description: t('successDescription', { agentName: agentConfig.agentName })
      })
      onComplete()
    } catch {
      toast({
        title: t('failedTitle'),
        description: t('failedDescription'),
        variant: 'destructive'
      })
    } finally {
    }
  }

  const getFileStats = () => {
    const totalRows = files.reduce((sum, file) => sum + file.sniffResult.totalRows, 0)
    const totalConfiguredColumns = files.reduce(
      (sum, file) => sum + file.columns.filter(col => col.role !== 'extra').length,
      0
    )
    return { totalRows, totalConfiguredColumns }
  }

  const { totalRows, totalConfiguredColumns } = getFileStats()

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      <div className='text-center space-y-2'>
        <h2 className='text-2xl font-bold'>{t('title')}</h2>
        <p className='text-muted-foreground'>{t('subtitle')}</p>
      </div>

      <Alert>
        <CheckCircle className='h-4 w-4' />
        <AlertTitle>{t('readyTitle')}</AlertTitle>
        <AlertDescription>{t('readyDescription')}</AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Settings className='h-5 w-5' />
            {t('agentConfig')}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label className='text-sm font-medium text-muted-foreground'>{t('agentName')}</Label>
              <p className='text-lg font-semibold'>{agentConfig.agentName}</p>
            </div>
            <div>
              <Label className='text-sm font-medium text-muted-foreground'>{t('datasetName')}</Label>
              <p className='text-lg font-semibold'>{agentConfig.datasetName}</p>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label className='text-sm font-medium text-muted-foreground'>{t('visibility')}</Label>
              <div className='flex items-center gap-2 mt-1'>
                {agentConfig.public ? (
                  <>
                    <Globe className='h-4 w-4 text-green-600' />
                    <span className='text-green-600 font-medium'>{t('public')}</span>
                  </>
                ) : (
                  <>
                    <Lock className='h-4 w-4 text-muted-foreground' />
                    <span className='text-muted-foreground font-medium'>{t('private')}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {agentConfig.description && (
            <div>
              <Label className='text-sm font-medium text-muted-foreground'>{t('description')}</Label>
              <p className='mt-1'>{agentConfig.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Database className='h-5 w-5' />
            {t('dataConfig')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
            <div className='text-center'>
              <div className='text-2xl font-bold'>{files.length}</div>
              <div className='text-sm text-muted-foreground'>{t('files')}</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold'>{totalRows.toLocaleString(locale)}</div>
              <div className='text-sm text-muted-foreground'>{t('totalRows')}</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold'>{totalConfiguredColumns.toLocaleString(locale)}</div>
              <div className='text-sm text-muted-foreground'>{t('configCols')}</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>
                <CheckCircle className='h-8 w-8 mx-auto' />
              </div>
              <div className='text-sm text-muted-foreground'>{t('status')}</div>
            </div>
          </div>

          <div className='space-y-3'>
            <h4 className='text-sm font-medium'>{t('fileDetails')}</h4>
            {files.map(file => (
              <FileOverview key={file.id} file={file} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className='flex flex-col sm:flex-row gap-2 justify-between'>
        <Button variant='outline' onClick={onBack} disabled={isSubmitting} className='flex items-center gap-2'>
          <ArrowLeft className='h-4 w-4' />
          {t('goBack')}
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting} className='flex items-center gap-2'>
          {isSubmitting ? (
            <>
              <Loader2 className='h-4 w-4 animate-spin' />
              {t('creating')}
            </>
          ) : (
            <>
              <Send className='h-4 w-4' />
              {t('create')}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// Helper component for file overview
function FileOverview({ file }: { file: FileData }) {
  const t = useTranslations('CreateAgent.StepThree')
  const locale = useLocale()
  const roleGroups: Record<string, string[]> = file.columns.reduce(
    (acc: Record<string, string[]>, col: ColumnDefinition) => {
      if (!acc[col.role]) {
        acc[col.role] = []
      }
      acc[col.role].push(col.name)
      return acc
    },
    {}
  )

  const labels = useMemo(
    () => ({
      interactions: t('interactions'),
      users: t('users'),
      items: t('items')
    }),
    [t]
  )

  return (
    <div className='border rounded-lg p-3'>
      <div className='flex justify-between items-start mb-2'>
        <div className='flex items-center gap-2'>
          <Badge className={`${FILE_TYPE_COLORS[file.fileType]} text-xs`} variant='outline'>
            {labels[file.fileType]}
          </Badge>
          <h5 className='font-medium'>{file.originalName}</h5>
        </div>
        <Badge variant='outline'>{t('numRows', { numRows: file.sniffResult.totalRows.toLocaleString(locale) })}</Badge>
      </div>

      <div className='flex flex-wrap gap-1'>
        {Object.entries(roleGroups)
          .filter(([role]) => role !== 'extra')
          .map(([role, columns]: [string, string[]]) => (
            <Badge key={role} variant='secondary' className='text-xs break-all whitespace-normal'>
              {columns.join(', ')}
            </Badge>
          ))}
        {roleGroups['extra']?.length > 0 && (
          <Badge variant='secondary' className='text-xs break-all whitespace-normal'>
            extra: {roleGroups['extra'].length}
          </Badge>
        )}
      </div>
    </div>
  )
}
