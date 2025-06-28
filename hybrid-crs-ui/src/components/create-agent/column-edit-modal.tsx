'use client'

import { useContext, useEffect, useMemo, useState } from 'react'

import { Info, Lock } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { SupabaseContext } from '@/contexts/supabaseContext'
import { inferDelimiter } from '@/lib/api'

interface ColumnEditModalProps {
  isOpen: boolean
  onClose: () => void
  column: ColumnDefinition | null
  sampleValues: string[]
  onSave: (updatedColumn: ColumnDefinition) => void
  originalColumnName?: string
  fileType: FileType
  fileData: FileData // Add file data to check existing roles
}

export function ColumnEditModal({
  isOpen,
  onClose,
  column,
  sampleValues,
  onSave,
  originalColumnName,
  fileType,
  fileData
}: ColumnEditModalProps) {
  const t = useTranslations('CreateAgent.StepTwo.ColumnEditModal')
  const { getAccessToken } = useContext(SupabaseContext)
  const [editedColumn, setEditedColumn] = useState<ColumnDefinition | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [showDelimiterInput, setShowDelimiterInput] = useState(false)

  const roleOptionsByDataset = useMemo(
    () => ({
      users: [
        { value: 'user_id', label: t('userId'), required: true, predefinedName: 'user_id', unique: true },
        { value: 'extra', label: t('extra'), required: false, unique: false }
      ],
      items: [
        { value: 'item_id', label: t('itemId'), required: true, predefinedName: 'item_id', unique: true },
        { value: 'name', label: t('itemName'), required: true, predefinedName: 'name', unique: true },
        { value: 'category', label: t('itemCategory'), required: false, predefinedName: 'category', unique: true },
        { value: 'extra', label: t('extra'), required: false, unique: false }
      ],
      interactions: [
        { value: 'user_id', label: t('userId'), required: true, predefinedName: 'user_id', unique: true },
        { value: 'item_id', label: t('itemId'), required: true, predefinedName: 'item_id', unique: true },
        { value: 'rating', label: t('rating'), required: false, predefinedName: 'rating', unique: true },
        { value: 'extra', label: t('extra'), required: false, unique: false }
      ]
    }),
    [t]
  )

  const typeOptions = useMemo(
    () => [
      { value: 'token', label: t('tokenLabel'), description: t('tokenDescription') },
      { value: 'token_seq', label: t('tokenSeqLabel'), description: t('tokenSeqDescription') },
      { value: 'float', label: t('floatLabel'), description: t('floatDescription') },
      { value: 'float_seq', label: t('floatSeqLabel'), description: t('floatSeqDescription') }
    ],
    [t]
  )

  const roleOptions = roleOptionsByDataset[fileType]

  const labels = useMemo(
    () => ({
      interactions: t('interactions'),
      users: t('users'),
      items: t('items')
    }),
    [t]
  )

  // Get roles already assigned to other columns (excluding the current column)
  const getAssignedRoles = (): string[] => {
    if (!column || !fileData) return []

    return fileData.columns
      .filter(col => col.id !== column.id) // Exclude current column
      .map(col => col.role)
      .filter(role => role !== 'extra') // Extra role can be used multiple times
  }

  // Get all role options with availability status
  const getRoleOptionsWithStatus = () => {
    const assignedRoles = getAssignedRoles()

    return roleOptions.map(option => {
      const isCurrentRole = column && option.value === column.role
      const isAssigned = assignedRoles.includes(option.value)
      const isAvailable = isCurrentRole || !option.unique || !isAssigned

      return {
        ...option,
        isAvailable,
        isAssigned: isAssigned && !isCurrentRole
      }
    })
  }

  useEffect(() => {
    if (column) {
      setEditedColumn({ ...column })
      setHasChanges(false)

      // Check if we need to show delimiter input
      const needsDelimiter = column.dataType === 'token_seq' || column.dataType === 'float_seq'
      setShowDelimiterInput(needsDelimiter)
    }
  }, [column, sampleValues])

  const detectDelimiter = async (values: string[]): Promise<string> => {
    try {
      const accessToken = await getAccessToken()
      const res = await inferDelimiter(values, accessToken)

      return res.delimiter
    } catch (error) {
      console.error(`Failed to infer delimiter: ${error}`)
      return ','
    }
  }

  const handleNameChange = (value: string) => {
    const sanitizedValue = value.replace(/\s+/g, '')
    handleFieldChange('name', sanitizedValue)
  }

  const handleSave = () => {
    if (!editedColumn) return

    const finalColumn = { ...editedColumn }
    if ((editedColumn.dataType === 'token_seq' || editedColumn.dataType === 'float_seq') && editedColumn.delimiter) {
      finalColumn.delimiter = editedColumn.delimiter
    } else {
      finalColumn.delimiter = undefined
    }

    onSave(finalColumn)
    onClose()
  }

  const handleFieldChange = (field: keyof ColumnDefinition, value: string) => {
    if (!editedColumn) return

    setEditedColumn(prev => {
      if (!prev) return null
      return { ...prev, [field]: value }
    })
    setHasChanges(true)
  }

  const handleRoleChange = (value: string) => {
    if (!editedColumn) return

    handleFieldChange('role', value)

    // Set predefined name if role has one
    const roleOption = roleOptions.find(r => r.value === value)
    if (roleOption?.predefinedName) {
      handleFieldChange('name', roleOption.predefinedName)
    }
  }

  const handleTypeChange = async (value: string) => {
    handleFieldChange('dataType', value)

    // Show/hide delimiter input based on type
    const needsDelimiter = value === 'token_seq' || value === 'float_seq'

    setShowDelimiterInput(needsDelimiter)

    if (needsDelimiter) {
      // Detect delimiter when switching to sequence type
      handleFieldChange('delimiter', await detectDelimiter(sampleValues))
    }
  }

  if (!editedColumn) return null

  const selectedRoleOption = roleOptions.find(r => r.value === editedColumn.role)
  const isNameImmutable = selectedRoleOption?.predefinedName !== undefined

  const roleOptionsWithStatus = getRoleOptionsWithStatus()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto bg-card'>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          <Alert>
            <Info className='h-4 w-4' />
            <AlertDescription className='text-sm'>
              <strong>{t('labelDataset', { label: labels[fileType] })}</strong>
              {t('requiredRoles')}:{' '}
              {roleOptions
                .filter(r => r.required)
                .map(r => r.label)
                .join(', ')}
            </AlertDescription>
          </Alert>

          {originalColumnName && (
            <Alert>
              <Info className='h-4 w-4' />
              <AlertDescription className='text-sm'>
                <strong>{t('originalName')}:</strong>
                <code className='bg-muted px-1 py-0.5 rounded break-all'>{originalColumnName}</code>
              </AlertDescription>
            </Alert>
          )}

          <div>
            <Label className='text-sm font-medium'>{t('sampleValues')}</Label>
            <div className='mt-2 p-3 border rounded-md'>
              <div className='flex flex-wrap gap-2'>
                {sampleValues.slice(0, 10).map((value, index) => (
                  <Badge
                    key={index}
                    variant='outline'
                    title={value || '(empty)'}
                    className='text-xs bg-primary text-primary-foreground whitespace-normal'
                  >
                    {value || '(empty)'}
                  </Badge>
                ))}
                {sampleValues.length > 10 && (
                  <Badge variant='outline' className='text-xs'>
                    +{sampleValues.length - 10} more
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className='flex items-center gap-4 mb-4'>
            <Separator className='flex-1' />
            <span className='text-muted-foreground text-sm'>{t('details')}</span>
            <Separator className='flex-1' />
          </div>

          <div className='space-y-2'>
            <Label className='text-sm font-medium'>{t('role')}</Label>
            <Select value={editedColumn.role} onValueChange={handleRoleChange}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder={t('rolePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {roleOptionsWithStatus.map(option => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    disabled={!option.isAvailable}
                    className={!option.isAvailable ? 'opacity-50' : ''}
                  >
                    <div className='flex items-center gap-2'>
                      <span className={!option.isAvailable ? 'text-muted-foreground' : ''}>{option.label}</span>
                      {option.required && (
                        <Badge variant='secondary' className='text-xs'>
                          {t('required')}
                        </Badge>
                      )}
                      {option.isAssigned && (
                        <Badge variant='outline' className='text-xs text-muted-foreground'>
                          {t('assigned')}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className='text-xs text-muted-foreground'>{t('requiredRolesConstraint')}</p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='column-name' className='text-sm font-medium flex items-center gap-2'>
              {t('name')}
              {isNameImmutable && <Lock className='h-3 w-3 text-muted-foreground' />}
            </Label>
            <Input
              id='column-name'
              value={editedColumn.name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder={t('namePlaceholder')}
              disabled={isNameImmutable}
              className={isNameImmutable ? 'bg-muted' : ''}
            />
            {isNameImmutable ? (
              <p className='text-xs text-muted-foreground'>{t('predefinedConstraint')}</p>
            ) : (
              <p className='text-xs text-muted-foreground'>{t('nameConstraint')}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label className='text-sm font-medium'>{t('type')}</Label>
            <Select value={editedColumn.dataType} onValueChange={handleTypeChange}>
              <SelectTrigger className='w-full h-12 text-left'>
                <SelectValue placeholder={t('typePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className='font-medium'>{option.label}</div>
                      <div className='text-xs text-muted-foreground'>{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showDelimiterInput && (
            <div className='space-y-2'>
              <Label htmlFor='delimiter' className='text-sm font-medium'>
                {t('delimiter')}
              </Label>
              <div className='flex gap-2'>
                <Input
                  id='delimiter'
                  value={editedColumn.delimiter || ','}
                  onChange={e => handleFieldChange('delimiter', e.target.value)}
                  placeholder={t('delimiterPlaceholder')}
                  className='flex-1'
                  maxLength={3}
                />
                <Button
                  variant='outline'
                  size='sm'
                  disabled={detecting}
                  onClick={async () => {
                    setDetecting(true)
                    detectDelimiter(sampleValues)
                      .then(delimiter => handleFieldChange('delimiter', delimiter))
                      .finally(() => {
                        setDetecting(false)
                      })
                  }}
                >
                  {t('autoDetect')}
                </Button>
              </div>
              <p className='text-xs text-muted-foreground'>{t('delimiterConstraint')}</p>
              {editedColumn.delimiter && (
                <div className='text-xs text-muted-foreground'>
                  <strong>{t('preview')}:</strong> {t('delimiterPreview', { delimiter: editedColumn.delimiter })}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            {t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
