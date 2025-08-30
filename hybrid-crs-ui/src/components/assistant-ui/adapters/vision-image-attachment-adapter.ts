import { AttachmentAdapter, CompleteAttachment, PendingAttachment } from '@assistant-ui/react'

export class VisionImageAttachmentAdapter implements AttachmentAdapter {
  accept = 'image/*'

  async add({ file }: { file: File }): Promise<PendingAttachment> {
    const maxSize = 20 * 1024 * 1024 // 20MB

    if (file.size > maxSize) {
      throw new Error('Image size exceeds 20MB limit')
    }
    return {
      id: crypto.randomUUID(),
      type: 'image',
      name: file.name,
      file,
      contentType: file.type,
      status: { type: 'running', reason: 'uploading', progress: 123 }
    }
  }

  async send(attachment: PendingAttachment): Promise<CompleteAttachment> {
    const base64 = await this.fileToBase64DataURL(attachment.file)

    return {
      ...attachment,
      content: [
        {
          type: 'image',
          image: base64
        }
      ],
      status: { type: 'complete' }
    }
  }

  async remove(): Promise<void> {
    // noop
  }

  private async fileToBase64DataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = () => {
        // FileReader result is already a data URL
        resolve(reader.result as string)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }
}
