'use client'

import { useEffect, useState } from 'react'

import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface FileTypeSelectorProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (fileType: FileType) => void
  availableTypes: FileType[]
  fileName: string
}

export function FileTypeSelector({ isOpen, onClose, onConfirm, availableTypes, fileName }: FileTypeSelectorProps) {
  const t = useTranslations('CreateAgent.StepTwo.FileTypeSelector')
  const [selectedType, setSelectedType] = useState<FileType | ''>('')

  const fileTypeInfo = {
    interactions: {
      label: t('intersLabel'),
      description: t('intersDescription'),
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      required: true
    },
    users: {
      label: t('usersLabel'),
      description: t('usersDescription'),
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      required: false
    },
    items: {
      label: t('itemsLabel'),
      description: t('itemsDescription'),
      color: 'bg-green-100 text-green-800 border-green-200',
      required: false
    }
  }

  // Auto-select if only one type is available
  useEffect(() => {
    if (availableTypes.length === 1) {
      setSelectedType(availableTypes[0])
    }
  }, [availableTypes])

  const handleConfirm = () => {
    if (selectedType) {
      onConfirm(selectedType as FileType)
      setSelectedType('')
    }
  }

  const handleClose = () => {
    setSelectedType('')
    onClose()
  }

  // Order the types: interactions first, then users, then items
  const orderedTypes: FileType[] = ['interactions', 'users', 'items']
  const availableOrderedTypes = orderedTypes.filter(type => availableTypes.includes(type))

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div>
            <Label className='text-sm font-medium'>
              {t('file')}: {fileName}
            </Label>
            <p className='text-xs text-muted-foreground mt-1'>{t('subtitle')}</p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='file-type' className='text-sm font-medium'>
              {t('datasetType')}
              {availableTypes.length === 1 && (
                <span className='text-xs text-muted-foreground ml-2'>({t('autoSelected')})</span>
              )}
            </Label>
            <Select value={selectedType} onValueChange={value => setSelectedType(value as FileType)}>
              <SelectTrigger className='w-full h-fit text-left'>
                <SelectValue placeholder={t('placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {availableOrderedTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    <div className='flex items-center gap-2 whitespace-normal'>
                      <Badge className={fileTypeInfo[type].color} variant='outline'>
                        {fileTypeInfo[type].required ? t('required') : t('optional')}
                      </Badge>
                      <div>
                        <div className='font-medium'>{fileTypeInfo[type].label}</div>
                        <div className='text-xs text-muted-foreground'>{fileTypeInfo[type].description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {availableTypes.length === 0 && (
            <div className='text-center py-4 text-muted-foreground'>
              <p className='text-sm'>{t('allTypesAssigned')}</p>
              <p className='text-xs'>{t('filesConstraint')}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleClose}>
            {t('cancel')}
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedType}>
            {t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
