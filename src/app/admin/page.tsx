// src/app/admin/page.tsx
'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AdminPage() {
  const [email, setEmail] = useState('')
  const [user, setUser] = useState<any>(null)
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data.session?.user ?? null)
    }
    getUser()
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener?.subscription?.unsubscribe()
  }, [])

  async function sendMagicLink() {
    if (!email) return alert('Enter your email')
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) return alert(error.message)
    alert('Check your email for the magic link (then come back here).')
  }

  async function handleUploadAndInsert() {
    if (!user) return alert('Please sign in first (use magic link).')
    if (!title) return alert('Add a title')
    let mediaArr: any[] = []

    if (file) {
      const path = `${Date.now()}-${file.name}`
      const { error: uploadErr } = await supabase.storage.from('media').upload(path, file)
      if (uploadErr) return alert('Upload error: ' + uploadErr.message)
      const { data: publicData } = supabase.storage.from('media').getPublicUrl(path)
      mediaArr = [{ type: 'image', url: publicData.publicUrl }]
    }

    const { error } = await supabase.from('items').insert([{
      site_slug: 'stavrin',
      title,
      slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g,''),
      excerpt,
      media: mediaArr,
      visible: true
    }])

    if (error) return alert('Insert error: ' + error.message)
    alert('Item created — refresh the homepage to see it.')
    setTitle(''); setExcerpt(''); setFile(null)
  }

  if (!user) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <h2 className="text-xl font-semibold mb-4">Admin login</h2>
        <input className="w-full p-2 border rounded mb-2" placeholder="your email" value={email} onChange={e=>setEmail(e.target.value)} />
        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={sendMagicLink}>Send magic link</button>
        <p className="text-sm mt-3 text-gray-600">Check your email and click the link to sign in.</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Admin — Add Item</h2>

      <label className="block mb-2">Title</label>
      <input className="w-full p-2 border rounded mb-3" value={title} onChange={e=>setTitle(e.target.value)} />

      <label className="block mb-2">Excerpt</label>
      <textarea className="w-full p-2 border rounded mb-3" value={excerpt} onChange={e=>setExcerpt(e.target.value)} />

      <label className="block mb-2">Image (optional)</label>
      <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] ?? null)} className="mb-3" />

      <div className="flex gap-3">
        <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={handleUploadAndInsert}>Create Item</button>
        <button className="px-4 py-2 bg-gray-200 rounded" onClick={async()=>{ await supabase.auth.signOut(); setUser(null) }}>Sign out</button>
      </div>
    </div>
  )
}
