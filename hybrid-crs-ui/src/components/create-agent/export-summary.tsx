'use client'

import { useLocale, useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ExportSummaryProps {
  file: FileData
}

export function ExportSummary({ file }: ExportSummaryProps) {
  const t = useTranslations('CreateAgent.StepTwo.ExportSummary')
  const locale = useLocale()

  // Group columns by role
  const columnsByRole = file.columns.reduce(
    (acc, col) => {
      if (col.role !== 'none') {
        if (!acc[col.role]) {
          acc[col.role] = []
        }
        acc[col.role].push(col.name)
      }
      return acc
    },
    {} as Record<string, string[]>
  )

  return (
    <Card className='mt-4'>
      <CardHeader>
        <CardTitle className='text-lg'>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div>
            <p className='text-sm font-medium mb-1'>{t('fileDetails')}</p>
            <div className='flex flex-wrap gap-2'>
              <Badge variant='outline'>{file.originalName}</Badge>
              <Badge variant='outline'>
                {t('numRows', { numRows: file.sniffResult.totalRows.toLocaleString(locale) })}
              </Badge>
              <Badge variant='outline'>{t('numCols', { numCols: file.columns.length.toLocaleString(locale) })}</Badge>
            </div>
          </div>

          <div>
            <p className='text-sm font-medium mb-1'>{t('columnRoles')}</p>
            <div className='flex flex-wrap gap-2 my-2'>
              {Object.entries(columnsByRole).map(([role, columns]) => {
                if (role === 'extra') return null
                return (
                  <div key={role} className='flex items-center border rounded-md p-2 gap-2'>
                    <p className='text-xs font-semibold capitalize'>{role.replace('_', ' ')}</p>
                    {columns.map(column => (
                      <Badge key={column} variant='secondary' className='text-xs'>
                        {column}
                      </Badge>
                    ))}
                  </div>
                )
              })}
            </div>
            {columnsByRole['extra']?.length > 0 && (
              <div className='flex gap-2'>
                <div className='border rounded-md p-2'>
                  <p className='text-xs font-semibold'>Extra</p>
                  <div className='flex flex-wrap gap-1 mt-1'>
                    {columnsByRole['extra'].map((column, index) => (
                      <Badge key={index} variant='secondary' className='text-xs'>
                        {column}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
