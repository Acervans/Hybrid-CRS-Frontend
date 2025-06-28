import { useContext, useState } from 'react'

import { useEffectOnce } from 'react-use'

import { SupabaseContext } from '@/contexts/supabaseContext'

export default function GoogleButton() {
  const [isLoaded, setIsLoaded] = useState(false)
  const { auth } = useContext(SupabaseContext)

  useEffectOnce(() => {
    if (!auth?.data.user) {
      const script = document.createElement('script')

      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true

      document.body.appendChild(script)

      setIsLoaded(true)
      return () => {
        document.body.removeChild(script)
      }
    }
  })

  return (
    <>
      {isLoaded && (
        <>
          <div
            id='g_id_onload'
            data-client_id='938887902941-gt307b8de13egpe435rsrescs1o4mi0c.apps.googleusercontent.com'
            data-context='signin'
            data-ux_mode='popup'
            data-callback='handleLoginWithGoogle'
            data-itp_support='true'
            data-use_fedcm_for_prompt='true'
          />
          <div
            className='g_id_signin'
            data-type='standard'
            data-shape='rectangular'
            data-theme='outline'
            data-text='continue_with'
            data-size='large'
            data-width='294'
            data-logo_alignment='left'
          />
        </>
      )}
    </>
  )
}
