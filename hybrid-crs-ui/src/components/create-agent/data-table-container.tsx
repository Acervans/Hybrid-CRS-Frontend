'use client'

import { useMemo, useState } from 'react'

import { InfoIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { DataTable } from '@/components/create-agent/data-table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDataContext } from '@/contexts/dataContext'
import { useToast } from '@/hooks/use-toast'

const FILE_TYPE_COLORS = {
  users: 'bg-blue-100 text-blue-800 border-blue-200',
  items: 'bg-green-100 text-green-800 border-green-200',
  interactions: 'bg-orange-100 text-orange-800 border-orange-200'
}

export function DataTableContainer() {
  const t = useTranslations('CreateAgent.StepTwo.DataTable')
  const { files, removeFile } = useDataContext()
  const [activeTab, setActiveTab] = useState<string | null>(files[0]?.id || null)
  const { toast } = useToast()

  const labels = useMemo(
    () => ({
      interactions: t('interactions'),
      users: t('users'),
      items: t('items')
    }),
    [t]
  )

  const handleDeleteFile = (fileId: string) => {
    const fileToDelete = files.find(f => f.id === fileId)

    removeFile(fileId)

    toast({
      title: 'File deleted',
      description: t('fileDeletedDescription', { fileName: fileToDelete?.originalName || t('file') })
    })

    // Update active tab if needed
    if (activeTab === fileId) {
      const remainingFiles = files.filter(f => f.id !== fileId)
      setActiveTab(remainingFiles[0]?.id || null)
    }
  }

  if (files.length === 0) {
    return (
      <Alert>
        <InfoIcon className='h-4 w-4' />
        <AlertTitle>{t('noFilesTitle')}</AlertTitle>
        <AlertDescription>{t('noFilesDescription')}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Tabs value={activeTab || files[0]?.id} onValueChange={setActiveTab} className='w-full'>
      <TabsList className='flex flex-col sm:flex-row w-full sm:w-fit h-full mb-4'>
        {files.map(file => (
          <TabsTrigger
            key={file.id}
            value={file.id}
            className='flex justify-between sm:justify-normal items-center gap-2 w-full'
          >
            <Badge className={`${FILE_TYPE_COLORS[file.fileType]} text-xs`} variant='outline'>
              {labels[file.fileType]}
            </Badge>
            <span>{file.originalName}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      {files.map(file => (
        <TabsContent key={file.id} value={file.id}>
          <DataTable file={file} onDeleteFile={handleDeleteFile} />
        </TabsContent>
      ))}
    </Tabs>
  )
}
