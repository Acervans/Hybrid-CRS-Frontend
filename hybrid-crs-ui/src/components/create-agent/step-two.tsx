'use client'

import { useMemo } from 'react'

import { AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { DataTableContainer } from '@/components/create-agent/data-table-container'
import { FileUploader } from '@/components/create-agent/file-uploader'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useDataContext } from '@/contexts/dataContext'

interface StepTwoProps {
  onNext: () => void
  onBack: () => void
}

export function StepTwo({ onNext, onBack }: StepTwoProps) {
  const t = useTranslations('CreateAgent.StepTwo')
  const { files } = useDataContext()

  // Check if required roles are missing from any file
  const checkMissingRoles = (file: FileData): string[] => {
    const missingRoles = []

    // Check based on file type with new requirements
    if (file.fileType === 'interactions') {
      // Interactions: user_id, item_id are required
      if (!file.columns.some(col => col.role === 'user_id')) {
        missingRoles.push('user_id')
      }
      if (!file.columns.some(col => col.role === 'item_id')) {
        missingRoles.push('item_id')
      }
    } else if (file.fileType === 'users') {
      // Users: only user_id is required
      if (!file.columns.some(col => col.role === 'user_id')) {
        missingRoles.push('user_id')
      }
    } else if (file.fileType === 'items') {
      // Items: item_id and name are required, category is optional
      if (!file.columns.some(col => col.role === 'item_id')) {
        missingRoles.push('item_id')
      }
      if (!file.columns.some(col => col.role === 'name')) {
        missingRoles.push('name')
      }
    }

    return missingRoles
  }

  // Validate files before proceeding - memoized for performance
  const validationResult = useMemo(() => {
    const errors: string[] = []

    // Check that interactions file exists (mandatory)
    const hasInteractions = files.some(f => f.fileType === 'interactions')
    if (!hasInteractions) {
      errors.push(t('interactionsRequired'))
    }

    // Check each file for dataset-specific requirements
    files.forEach(file => {
      const configuredColumns = file.columns.filter(col => col.role !== 'extra')
      if (configuredColumns.length === 0) {
        errors.push(t('noConfiguredCols', { fileName: file.originalName }))
      }

      // Check for duplicate column names
      const duplicates: string[] = []
      const seen = new Set()

      file.columns.forEach(colDef => {
        const columnName = colDef.name

        if (seen.has(columnName)) {
          if (!duplicates.includes(columnName)) {
            duplicates.push(columnName)
          }
        } else {
          seen.add(columnName)
        }
      })

      if (duplicates.length > 0) {
        errors.push(`${t('duplicateColumns', { fileName: file.originalName })}: ${duplicates.join(', ')}`)
      }

      // Check for missing required roles
      const missingRoles = checkMissingRoles(file)
      if (missingRoles.length > 0) {
        errors.push(`${t('missingRoles', { fileName: file.originalName })}: ${missingRoles.join(', ')}`)
      }
    })

    return { errors, isValid: errors.length === 0 }
  }, [files, t])

  const { errors, isValid } = validationResult

  return (
    <div className='space-y-6'>
      <div className='text-center space-y-2'>
        <h2 className='text-2xl font-bold'>{t('title')}</h2>
        <p className='text-muted-foreground'>{t('subtitle')}</p>
      </div>

      <FileUploader />
      <DataTableContainer />

      {!!errors.length && !!files.length && (
        <Alert variant='destructive' className='bg-card text-red-500 shadow-sm'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>{t('issuesTitle')}</AlertTitle>
          <AlertDescription>
            <p className='mb-2 text-red-500'>{t('issuesSubtitle')}:</p>
            <ul className='list-disc list-inside space-y-1'>
              {errors.map((error, index) => (
                <li className='text-red-500' key={index}>
                  {error}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className='flex flex-col sm:flex-row gap-2 justify-between'>
        <Button variant='outline' onClick={onBack} className='flex items-center gap-2'>
          <ArrowLeft className='h-4 w-4' />
          {t('goBack')}
        </Button>
        <Button
          onClick={onNext}
          disabled={!isValid}
          className='flex items-center gap-2'
          title={!isValid ? t('validationErrors') : t('continue')}
        >
          {t('continue')}
          <ArrowRight className='h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}
