'use client'

import { useMemo, useState } from 'react'

import { AlertCircle, DownloadIcon, Edit, Eye, Trash2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { ColumnEditModal } from '@/components/create-agent/column-edit-modal'
import { ExportSummary } from '@/components/create-agent/export-summary'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useDataContext } from '@/contexts/dataContext'
import { convertToCSV, downloadCSV } from '@/lib/utils'
import { parseCSVWithFormat } from '@/lib/utils'

interface DataTableProps {
  file: FileData
  onDeleteFile?: (fileId: string) => void
}

const FILE_TYPE_COLORS = {
  users: 'bg-blue-100 text-blue-800 border-blue-200',
  items: 'bg-green-100 text-green-800 border-green-200',
  interactions: 'bg-orange-100 text-orange-800 border-orange-200'
}

export function DataTable({ file, onDeleteFile }: DataTableProps) {
  const t = useTranslations('CreateAgent.StepTwo.DataTable')
  const locale = useLocale()
  const { updateFile } = useDataContext()
  const [selectedColumn, setSelectedColumn] = useState<ColumnDefinition | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const labels = useMemo(
    () => ({
      interactions: t('interactions'),
      users: t('users'),
      items: t('items')
    }),
    [t]
  )

  // Use the file directly from props, no local state needed
  const currentFile = file

  // Check if required roles are missing
  const checkMissingRoles = (file: FileData): string[] => {
    const missingRoles = []

    // Check based on file type with new requirements
    if (file.fileType === 'users') {
      // Users: only user_id is required
      if (!file.columns.some(col => col.role === 'user_id')) {
        missingRoles.push(t('userId'))
      }
    } else if (file.fileType === 'items') {
      // Items: item_id and name are required, category is optional
      if (!file.columns.some(col => col.role === 'item_id')) {
        missingRoles.push(t('itemId'))
      }
      if (!file.columns.some(col => col.role === 'name')) {
        missingRoles.push(t('name'))
      }
    } else if (file.fileType === 'interactions') {
      // Interactions: user_id, item_id are required
      if (!file.columns.some(col => col.role === 'user_id')) {
        missingRoles.push(t('userId'))
      }
      if (!file.columns.some(col => col.role === 'item_id')) {
        missingRoles.push(t('itemId'))
      }
    }

    return missingRoles
  }

  const handleColumnEdit = (column: ColumnDefinition) => {
    setSelectedColumn(column)
    setIsModalOpen(true)
  }

  const handleColumnSave = (updatedColumn: ColumnDefinition) => {
    // Immediately update the file in the global context
    const updatedColumns = currentFile.columns.map(col => (col.id === updatedColumn.id ? updatedColumn : col))
    const updatedFile = { ...currentFile, columns: updatedColumns }
    updateFile(updatedFile)
  }

  const getSampleValuesForColumn = (columnIndex: number): string[] => {
    // Get first 5 data rows (excluding header if present)
    const startRow = currentFile.headers !== null ? 1 : 0
    const endRow = Math.min(startRow + 5, currentFile.sampleData.length)

    const sampleValues: string[] = []
    for (let i = startRow; i < endRow; i++) {
      const value = currentFile.sampleData[i]?.[columnIndex] || ''
      sampleValues.push(value)
    }

    return sampleValues
  }

  const handleExport = async (exportType: 'all' | 'configured' | 'sample') => {
    const ext = currentFile.originalName.split('.')[1]
    let csvContent
    let filename

    const data =
      exportType === 'sample'
        ? [currentFile.headers || [], ...currentFile.sampleData]
        : parseCSVWithFormat(
            await currentFile.file.text(),
            currentFile.sniffResult.delimiter,
            currentFile.sniffResult.quoteChar,
            currentFile.sniffResult.newlineStr
          )

    if (exportType === 'all') {
      csvContent = convertToCSV(currentFile.columns, data, { includeAllColumns: true })
      filename = `${currentFile.name}_all.${ext}`
    } else if (exportType === 'configured') {
      csvContent = convertToCSV(currentFile.columns, data, { includeAllColumns: false })
      filename = `${currentFile.name}_configured.${ext}`
    } else {
      csvContent = convertToCSV(currentFile.columns, data, { includeAllColumns: false })
      filename = `${currentFile.name}_sample.${ext}`
    }

    downloadCSV(csvContent, filename)
  }

  const handleDeleteFile = () => {
    if (onDeleteFile) {
      onDeleteFile(file.id)
    }
  }

  const missingRoles = checkMissingRoles(currentFile)

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'user_id':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'item_id':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rating':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'name':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'category':
        return 'bg-pink-100 text-pink-800 border-pink-200'
      case 'extra':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'token':
        return 'bg-rose-100 text-rose-800 border-rose-200'
      case 'token_seq':
        return 'bg-rose-100 text-rose-800 border-rose-200'
      case 'float':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200'
      case 'float_seq':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const DataTableFooter = () => {
    const totalDataRows = currentFile.headers
      ? currentFile.sniffResult.totalRows - 1
      : currentFile.sniffResult.totalRows

    return (
      <div className='text-center py-4 rounded-b-lg border'>
        <div className='flex items-center justify-center gap-2 text-sm text-muted-foreground'>
          <Eye className='h-4 w-4' />
          {t('tableFooter', {
            numRows: Math.min(5, totalDataRows),
            totalRows: totalDataRows.toLocaleString(locale)
          })}
        </div>
      </div>
    )
  }

  // Prepare display data - if has headers, show header row + sample data
  const displayData = currentFile.headers ? [currentFile.headers, ...currentFile.sampleData] : currentFile.sampleData

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center sm:justify-between mb-4'>
        <div>
          <div className='flex flex-wrap items-center gap-3'>
            <h2 className='text-xl font-semibold'>{file.originalName}</h2>
            <Badge className={`${FILE_TYPE_COLORS[file.fileType]}`} variant='outline'>
              {t('labelDataset', { label: labels[file.fileType] })}
            </Badge>
          </div>
          <p className='text-sm text-muted-foreground mt-1'>
            {t('tableLayout', {
              numRows: currentFile.sniffResult.totalRows.toLocaleString(locale),
              numCols: currentFile.columns.length.toLocaleString(locale)
            })}
            {currentFile.headers && ` (${t('firstRowHeader')})`}
          </p>
        </div>
        <div className='flex justify-between sm:justify-end w-full sm:w-auto mt-4 sm:mt-0 gap-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className='flex items-center gap-2'>
                <DownloadIcon className='h-4 w-4' />
                {t('export')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => handleExport('all')}>{t('exportAll')}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('configured')}>{t('exportConfigured')}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('sample')}>{t('exportSample')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {onDeleteFile && (
            <ConfirmationDialog
              title={t('deleteTitle')}
              description={t('deleteDescription', { fileName: file.originalName })}
              confirmLabel={t('delete')}
              cancelLabel={t('cancel')}
              variant='destructive'
              onConfirm={handleDeleteFile}
              trigger={
                <Button variant='destructive' className='flex items-center gap-2'>
                  <Trash2 className='h-4 w-4' />
                  {t('delete')}
                </Button>
              }
            />
          )}
        </div>
      </div>

      {missingRoles.length > 0 && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>{t('missingRolesTitle')}</AlertTitle>
          <AlertDescription>
            {t('missingRolesDescription')}: {missingRoles.join(', ')}
          </AlertDescription>
        </Alert>
      )}

      <div>
        <Table containerClassName='border rounded-t-lg'>
          <TableHeader>
            <TableRow className='bg-card'>
              {currentFile.columns.map(column => (
                <TableHead key={column.id} className='max-w-65 min-w-45 p-4 border-r last:border-r-0'>
                  <div className='space-y-3 align-baseline'>
                    <div className='flex items-center justify-between'>
                      <div className='flex-1 min-w-0'>
                        <h4 className='font-bold text-sm truncate' title={column.name}>
                          {column.name}
                        </h4>
                      </div>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleColumnEdit(column)}
                        className='h-8 w-8 p-0 ml-2 hover:bg-card'
                        title={t('editColumn')}
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                    </div>

                    <div>
                      <Badge
                        className={`${getRoleBadgeColor(column.role)} text-xs font-medium border`}
                        variant='outline'
                      >
                        {column.role.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className='flex flex-row gap-2'>
                      <Badge className={`${getTypeBadgeColor(column.dataType)} text-xs border`} variant='outline'>
                        {t(column.dataType)}
                      </Badge>
                      {(column.dataType === 'token_seq' || column.dataType === 'float_seq') && column.delimiter && (
                        <Badge title={`${t('delimiter')}: "${column.delimiter}"`} className='text-xs border'>
                          {t('delimiter').toLowerCase()}: &quot;{column.delimiter}&quot;
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData.map((row, rowIndex) => {
              const isHeaderRow = currentFile.headers && rowIndex === 0
              return (
                <TableRow key={rowIndex} className={`${isHeaderRow ? 'bg-card border-b-3' : ''}`}>
                  {currentFile.columns.map((_column, cellIndex) => {
                    const cellValue = row[cellIndex] || ''
                    return (
                      <TableCell
                        key={`${rowIndex}-${cellIndex}`}
                        className={`max-w-65 min-w-45 p-4 border-r last:border-r-0 ${
                          isHeaderRow ? 'font-bold text-primary' : ''
                        }`}
                      >
                        <div className='truncate' title={cellValue}>
                          {cellValue || <span className='text-gray-400 italic'>(empty)</span>}
                        </div>
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        <DataTableFooter />
      </div>

      <ExportSummary file={currentFile} />

      <ColumnEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        column={selectedColumn}
        sampleValues={selectedColumn ? getSampleValuesForColumn(Number.parseInt(selectedColumn.id)) : []}
        onSave={handleColumnSave}
        originalColumnName={selectedColumn?.originalName}
        fileType={file.fileType}
        fileData={currentFile}
      />
    </div>
  )
}
