'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function MagicLinkHandler() {
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('access_token')) {
      const urlParams = new URLSearchParams(hash.replace('#', '?'))
      const access_token = urlParams.get('access_token')
      const refresh_token = urlParams.get('refresh_token')

      if (access_token && refresh_token) {
        supabase.auth
          .setSession({ access_token, refresh_token })
          .then(() => router.replace('/admin/stavrin'))
          .catch(err => {
            console.error('Failed to set session:', err)
            alert('Magic link login failed. Try again.')
          })
      }
    }
  }, [])

  return <p className="p-6 max-w-lg mx-auto">Processing magic link…</p>
}
