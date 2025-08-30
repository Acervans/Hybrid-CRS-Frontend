import { AttachmentAdapter, CompleteAttachment, PendingAttachment } from '@assistant-ui/react'

import { pdfToText } from '@/lib/api'

export class PDFTextAttachmentAdapter implements AttachmentAdapter {
  public accept = 'application/pdf'
  private getAccessToken

  constructor(getAccessToken: () => Promise<string | undefined>) {
    this.getAccessToken = getAccessToken
  }

  public async add(state: { file: File }): Promise<PendingAttachment> {
    return {
      id: state.file.name,
      type: 'file',
      name: state.file.name,
      contentType: state.file.type,
      file: state.file,
      status: { type: 'requires-action', reason: 'composer-send' }
    }
  }

  public async send(attachment: PendingAttachment): Promise<CompleteAttachment> {
    return {
      ...attachment,
      status: { type: 'complete' },
      content: [
        {
          type: 'text',
          text: `<attachment name=${attachment.name} type=pdf>\n${await pdfToText(
            attachment.file,
            await this.getAccessToken()
          ).catch(error => {
            console.error(`Failed to convert PDF to Text: ${error}`)
          })}\n</attachment>`
        }
      ]
    }
  }

  public async remove() {
    // noop
  }
}
