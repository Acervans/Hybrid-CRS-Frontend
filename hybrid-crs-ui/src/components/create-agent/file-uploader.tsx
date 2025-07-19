'use client'

import type React from 'react'
import { useContext, useMemo, useRef, useState } from 'react'

import CSVSniffer from 'csv-sniffer'
import { AlertCircle, FileText, Upload } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { FileTypeSelector } from '@/components/create-agent/file-type-selector'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { useDataContext } from '@/contexts/dataContext'
import { SupabaseContext } from '@/contexts/supabaseContext'
import { useToast } from '@/hooks/use-toast'
import { inferColumnDatatype, inferColumnRoles, inferDelimiter } from '@/lib/api'
import { getLines, parseCSVWithFormat } from '@/lib/utils'

interface PendingFile {
  file: File
  sniffResult: SniffResult
  fileName: string
  headers: string[] | null
  labels: string[]
  totalRows: number
  sampleData: string[][]
}

const guessColumnRole = (header: string, fileType: FileType): string => {
  if (!header) return 'extra'

  const headerLower = header.toLowerCase()

  // Dataset-specific role guessing
  if (fileType === 'users') {
    if (headerLower.includes('user') || headerLower.includes('userid') || headerLower.includes('id')) {
      return 'user_id'
    }
  } else if (fileType === 'items') {
    if (headerLower.includes('item') || headerLower.includes('itemid') || headerLower.includes('product')) {
      return 'item_id'
    } else if (headerLower.includes('name') || headerLower.includes('title')) {
      return 'name'
    } else if (headerLower.includes('category') || headerLower.includes('tag') || headerLower.includes('genre')) {
      return 'category'
    }
  } else if (fileType === 'interactions') {
    if (headerLower.includes('user') || headerLower.includes('userid')) {
      return 'user_id'
    } else if (headerLower.includes('item') || headerLower.includes('itemid') || headerLower.includes('product')) {
      return 'item_id'
    } else if (headerLower.includes('rating') || headerLower.includes('score') || headerLower.includes('rank')) {
      return 'rating'
    }
  }

  return 'extra'
}

export function FileUploader() {
  const t = useTranslations('CreateAgent.StepTwo.FileUploader')
  const locale = useLocale()
  const { toast } = useToast()
  const { getAccessToken } = useContext(SupabaseContext)
  const { addFile, getAvailableFileTypes, files } = useDataContext()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [useFirstRowAsHeader, setUseFirstRowAsHeader] = useState(true)
  const [columnNamesContainTypes, setColumnNamesContainTypes] = useState(false)
  const [fileIndex, setFileIndex] = useState(0)
  const [filesToUpload, setFilesToUpload] = useState<FileList | null>(null)
  const [pendingFile, setPendingFile] = useState<PendingFile | null>(null)
  const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const accepted = '.csv,.item,.inter,.user,.txt,.dat'
  const acceptedList = accepted.split(',')

  const labels = useMemo(
    () => ({
      interactions: t('interactions'),
      users: t('users'),
      items: t('items')
    }),
    [t]
  )

  const availableTypes = getAvailableFileTypes()

  const resetInput = () => {
    setFilesToUpload(null)
    setFileIndex(0)
    setIsUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const processFile = async (file: File) => {
    setUploadProgress(0)

    try {
      const ext = file.name.split('.').pop()?.toLowerCase()

      if (!ext || !acceptedList.some(a => a.endsWith(ext))) {
        toast({
          title: t('invalidFileTitle'),
          description: t('invalidFileDescription', { fileName: file.name }),
          variant: 'destructive'
        })
        return
      }

      const text = await file.text()
      const sniffResult = await sniffCSV(text)

      if (!sniffResult || !sniffResult.totalRows) {
        toast({
          title: t('emptyFileTitle'),
          description: t('emptyFileDescription', { fileName: file.name }),
          variant: 'destructive'
        })
        return
      }

      // Extract filename without extension for internal name
      const fileName = file.name.replace(/\.[^/.]+$/, '')

      // Determine if the file has headers
      const hasHeaders = useFirstRowAsHeader || sniffResult.hasHeader
      const labels = sniffResult.labels || []
      const totalRows = sniffResult.totalRows

      // Headers and sample data
      const sampleData = parseCSVWithFormat(
        text,
        sniffResult.delimiter,
        sniffResult.quoteChar,
        sniffResult.newlineStr,
        hasHeaders ? 6 : 5
      )
      const headers = hasHeaders ? (sampleData[0] ?? null) : null

      if (!sampleData || sampleData.length < (headers ? 2 : 1)) {
        throw new Error('File has no data rows')
      }

      // Store pending file data and open type selector
      setPendingFile({
        file,
        sniffResult,
        fileName,
        headers,
        labels,
        totalRows,
        sampleData: hasHeaders ? sampleData.slice(1) : sampleData
      })
      setUploadProgress(15)
      setIsTypeSelectorOpen(true)
    } catch (error) {
      console.error('Error processing file:', error)
      toast({
        title: t('uploadFailedTitle'),
        description: t('processFailedDescription', { fileName: file.name }),
        variant: 'destructive'
      })
      resetInput()
    }
  }

  const processNextFile = async () => {
    if (filesToUpload && fileIndex < filesToUpload.length - 1) {
      const i = fileIndex + 1

      setFileIndex(i)
      setIsUploading(true)
      await processFile(filesToUpload![i])
    } else {
      resetInput()
    }
  }

  const processFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    // Check if we can add more files
    if (availableTypes.length === 0) {
      toast({
        title: t('maxFilesTitle'),
        description: t('maxFilesDescription'),
        variant: 'destructive'
      })
      return
    }

    setFilesToUpload(files)
    setFileIndex(0)
    setIsUploading(true)
    await processFile(files[fileIndex])
  }

  const handleFileTypeConfirm = async (fileType: FileType) => {
    setIsTypeSelectorOpen(false)

    if (!pendingFile) return

    setUploadProgress(30)

    try {
      const accessToken = await getAccessToken()

      const numColumns = pendingFile.sampleData[0]?.length || 0
      const columnNames = pendingFile.headers ? pendingFile.headers : pendingFile.labels
      const inferredRoles = await inferColumnRoles(columnNames, fileType, accessToken)

      setUploadProgress(50)

      const delta = 50 / numColumns
      const columns = await Promise.all(
        Array.from({ length: numColumns }, async (_, index) => {
          const originalName = columnNames[index]
          const sampleValues = pendingFile.sampleData.map(row => row[index])
          let columnName = `Column ${index + 1}`
          let dataType = 'token'
          let typeWasParsed = false
          let delimiter = undefined

          if (originalName) {
            columnName = originalName

            // Parse column name and type if option is enabled
            if (columnNamesContainTypes) {
              const match = columnName.match(/^(.+):(\w+)$/)
              if (match) {
                columnName = match[1]
                const typeFromHeader = match[2].toLowerCase()

                if (['token', 'token_seq', 'float', 'float_seq'].includes(typeFromHeader)) {
                  dataType = typeFromHeader
                  typeWasParsed = true
                } else {
                  dataType = 'token'
                  typeWasParsed = true
                }
                pendingFile.labels[index] = columnName
              }
            }
          }

          if (!columnNamesContainTypes && !typeWasParsed) {
            const res = await inferColumnDatatype(sampleValues, accessToken)

            dataType = res.datatype || 'token'
            delimiter = res.delimiter
          }

          if (dataType.endsWith('seq') && !delimiter) {
            const res = await inferDelimiter(sampleValues, accessToken)

            delimiter = res.delimiter || ','
          }

          // Guess role by inference, fallback to rule-based
          const role = inferredRoles.detail
            ? guessColumnRole(columnName, fileType)
            : (inferredRoles[originalName] ?? 'extra')

          setUploadProgress(value => Math.max(value, 50 + delta * (index + 1)))

          // Set predefined name if role requires it
          const finalColumnName = getPredefinedNameForRole(role) || columnName

          return {
            id: index.toString(),
            name: finalColumnName,
            role,
            dataType,
            delimiter,
            originalName: pendingFile.headers && originalName ? originalName : undefined
          }
        })
      )
      setUploadProgress(100)

      // Add file to store with selected type
      addFile({
        id: Date.now().toString(),
        name: pendingFile.fileName,
        originalName: pendingFile.file.name,
        file: pendingFile.file,
        fileType,
        headers: pendingFile.headers,
        columns,
        sniffResult: pendingFile.sniffResult,
        sampleData: pendingFile.sampleData
      })

      toast({
        title: t('fileUploadedTitle'),
        description: t('fileUploadedDescription', {
          fileName: pendingFile.file.name,
          fileType: t(fileType),
          numRows: pendingFile.totalRows.toLocaleString(locale),
          numCols: columns.length.toLocaleString(locale)
        })
      })
    } catch (error) {
      console.error('Error uploading file:', error)
      toast({
        title: t('uploadFailedTitle'),
        description: t('uploadFailedDescription'),
        variant: 'destructive'
      })
    } finally {
      setPendingFile(null)
      setTimeout(() => {
        setUploadProgress(0)
        setIsUploading(false)
        setTimeout(() => processNextFile(), 200)
      }, 500)
    }
  }

  const handleTypeSelectorClose = () => {
    setIsTypeSelectorOpen(false)
    setPendingFile(null)
    setUploadProgress(0)
    setIsUploading(false)
    processNextFile()
  }

  const handleUseHeadersChange = (checked: boolean) => {
    setUseFirstRowAsHeader(checked)
    // If headers are disabled, also disable column types parsing
    if (!checked) {
      setColumnNamesContainTypes(false)
    }
  }

  const getPredefinedNameForRole = (role: string): string | null => {
    const predefinedNames: Record<string, string> = {
      user_id: 'user_id',
      item_id: 'item_id',
      name: 'name',
      category: 'category',
      rating: 'rating'
    }
    return predefinedNames[role] || null
  }

  const sniffCSV = async (text: string): Promise<SniffResult> => {
    try {
      const sniffer = new (CSVSniffer())()

      // Sample the first 10 lines to detect format
      const newlineStr = text.match(/\r\n|\n|\r/)?.[0] || '\n'
      const sample = text.split(newlineStr).slice(0, 10).join(newlineStr)
      const sniffResult = sniffer.sniff(sample)
      const totalRows = getLines(text, newlineStr).length

      console.log('CSV Analysis:', {
        delimiter: sniffResult.delimiter,
        quoteChar: sniffResult.quoteChar,
        hasHeader: useFirstRowAsHeader || sniffResult.hasHeader,
        labels: sniffResult.labels,
        newlineStr,
        totalRows
      })

      return {
        ...sniffResult,
        totalRows,
        hasHeader: useFirstRowAsHeader || sniffResult.hasHeader
      }
    } catch (error) {
      console.error(error)
      return {
        delimiter: ',',
        quoteChar: '"',
        newlineStr: '\n',
        hasHeader: false,
        labels: [],
        totalRows: getLines(text, /\r\n|\n/).length
      }
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(event.target.files)
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    processFiles(e.dataTransfer.files)
  }

  const getFileTypeLabel = (type: FileType) => {
    return labels[type]
  }

  return (
    <div className='mb-8'>
      <Alert className='mb-4'>
        <AlertCircle className='h-4 w-4' />
        <AlertDescription>
          <div className='space-y-1'>
            <p>
              <strong>{t('requirements')}:</strong>
            </p>
            <ul className='text-sm space-y-1 ml-4'>
              <li>
                • <strong>{t('interactions')}:</strong> {t('userId')}, {t('itemId')} ({t('required')}), {t('rating')} (
                {t('optional')})
              </li>
              <li>
                • <strong>{t('users')}:</strong> {t('userId')} ({t('required')})
              </li>
              <li>
                • <strong>{t('items')}:</strong> {t('itemId')}, {t('name')} ({t('required')}), {t('category')} (
                {t('optional')})
              </li>
              <li>• {t('filesConstraint')}</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      {files.length > 0 && (
        <Card className='mb-4'>
          <CardContent>
            <div className='space-y-2'>
              <Label className='text-sm font-medium'>
                {t('uploadedFiles')} ({files.length}/3)
              </Label>
              <div className='flex flex-wrap gap-2'>
                {files.map(file => (
                  <div key={file.id} className='flex items-center gap-2 bg-muted px-3 py-1 rounded'>
                    <span className='text-sm font-medium'>{getFileTypeLabel(file.fileType)}</span>
                    <span className='text-xs text-muted-foreground'>{file.originalName}</span>
                  </div>
                ))}
              </div>
              {availableTypes.length > 0 && (
                <p className='text-xs text-muted-foreground'>
                  {t('availableTypes')}: {availableTypes.map(getFileTypeLabel).join(', ')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className='mt-4'>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <Checkbox id='use-headers' checked={useFirstRowAsHeader} onCheckedChange={handleUseHeadersChange} />
              <Label htmlFor='use-headers' className='text-sm font-medium'>
                {t('firstRowAsHeader')}
              </Label>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='column-types'
                checked={columnNamesContainTypes}
                onCheckedChange={checked => setColumnNamesContainTypes(checked as boolean)}
                disabled={!useFirstRowAsHeader}
              />
              <div>
                <Label
                  htmlFor='column-types'
                  className={`text-sm font-medium ${!useFirstRowAsHeader ? 'text-muted-foreground' : ''}`}
                >
                  {t('columnsDataTypes')}
                </Label>
                <p className='text-xs mt-1 text-muted-foreground'>
                  {t('columnsDataTypesDescription', { format: '"name:type" (e.g., "user_id:token", "ratings:float")' })}
                  {!useFirstRowAsHeader && ` (${t('requiresHeaders')})`}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div
        className={`border-2 mt-4 ${
          isDragging ? 'border-primary bg-muted' : 'border-dashed border-gray-400'
        } ${availableTypes.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} rounded-lg p-8 text-center transition-colors`}
        onClick={availableTypes.length > 0 ? handleButtonClick : undefined}
        onDragOver={availableTypes.length > 0 ? handleDragOver : undefined}
        onDragLeave={availableTypes.length > 0 ? handleDragLeave : undefined}
        onDrop={availableTypes.length > 0 ? handleDrop : undefined}
        aria-label='Upload area'
      >
        <Upload className='mx-auto h-12 w-12 text-primary pointer-events-none' />
        <h3 className='mt-2 text-sm font-semibold pointer-events-none'>
          {availableTypes.length === 0 ? t('maxFilesTitle') : t('uploadTitle')}
        </h3>
        <p className='mt-1 text-xs text-muted-foreground pointer-events-none'>
          {availableTypes.length === 0 ? t('maxFiles') : isDragging ? t('dropFiles') : t('uploadSubtitle')}
        </p>
        <div className='mt-4 flex justify-center pointer-events-none'>
          <Button disabled={isUploading || availableTypes.length === 0}>
            {isUploading ? t('uploading') : t('selectFiles')}
          </Button>
        </div>
        <input
          ref={fileInputRef}
          id='file-upload'
          name='file-upload'
          type='file'
          className='hidden'
          accept={accepted}
          multiple
          onChange={handleFileUpload}
          disabled={isUploading || availableTypes.length === 0}
        />
        {isUploading && (
          <div className='mt-4'>
            <Progress value={uploadProgress} className='h-2.5 w-full' />
            <p className='mt-2 text-xs text-muted-foreground'>
              {uploadProgress < 30
                ? t('processingFile')
                : uploadProgress < 50
                  ? t('inferringRoles')
                  : t('inferringDatatypes')}
            </p>
          </div>
        )}
      </div>

      <div className='mt-4'>
        <h4 className='text-sm font-medium mb-2'>{t('acceptedTypes')}:</h4>
        <div className='flex flex-wrap gap-2'>
          {['.csv', '.txt', '.dat', '.user', '.item', '.inter'].map(type => (
            <div key={type} className='flex items-center gap-1 text-xs bg-muted text-foreground px-2 py-1 rounded'>
              <FileText className='h-3 w-3' />
              {type}
            </div>
          ))}
        </div>
      </div>

      {/* File Selector Modal */}
      <FileTypeSelector
        isOpen={isTypeSelectorOpen}
        onClose={handleTypeSelectorClose}
        onConfirm={handleFileTypeConfirm}
        availableTypes={availableTypes}
        fileName={pendingFile?.file.name || ''}
      />
    </div>
  )
}
