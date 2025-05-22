import { CredentialResponse } from 'google-one-tap'

export {}

declare global {
  interface Window {
    handleLoginWithGoogle: (response: CredentialResponse) => Promise<void>
  }
}
