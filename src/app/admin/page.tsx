// src/app/admin/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AdminPage() {
  const [email, setEmail] = useState('')
  const [user, setUser] = useState<any>(null)

  // form state
  const [siteSlug, setSiteSlug] = useState('stavrin')
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [body, setBody] = useState('')
  const [startDate, setStartDate] = useState('')
  const [tags, setTags] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return alert('Please sign in first (use magic link).')

    let mediaArr: any[] = []

    // if file chosen → upload to Supabase storage
    if (file) {
      const path = `${Date.now()}-${file.name}`
      const { error: uploadErr } = await supabase.storage.from('media').upload(path, file)
      if (uploadErr) return setMessage('❌ Upload error: ' + uploadErr.message)
      const { data: publicData } = supabase.storage.from('media').getPublicUrl(path)
      mediaArr = [{ type: 'image', url: publicData.publicUrl }]
    } else if (mediaUrl) {
      // fallback: manual media URL
      mediaArr = [{ type: 'link', url: mediaUrl }]
    }

    const { error } = await supabase.from('items').insert([{
      site_slug: siteSlug,
      title,
      slug,
      excerpt,
      body,
      start_date: startDate || null,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      media: mediaArr,
      visible: true,
      premium: false
    }])

    if (error) {
      console.error(error)
      setMessage('❌ Error adding item: ' + error.message)
    } else {
      setMessage('✅ Item added successfully!')
      setTitle('')
      setSlug('')
      setExcerpt('')
      setBody('')
      setStartDate('')
      setTags('')
      setMediaUrl('')
      setFile(null)
    }
  }

  if (!user) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <h2 className="text-xl font-semibold mb-4">Admin login</h2>
        <input
          className="w-full p-2 border rounded mb-2"
          placeholder="your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={sendMagicLink}
        >
          Send magic link
        </button>
        <p className="text-sm mt-3 text-gray-600">
          Check your email and click the link to sign in.
        </p>
      </div>
    )
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 bg-gray-100 p-4 rounded-xl"
      >
        <select
          value={siteSlug}
          onChange={(e) => setSiteSlug(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="stavrin">Stavrin</option>
          <option value="nobody">Life of a Nobody</option>
          <option value="portfolio">Portfolio</option>
        </select>

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded"
          required
        />

        <input
          type="text"
          placeholder="Slug (e.g. tip-the-balance)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="border p-2 rounded"
          required
        />

        <input
          type="text"
          placeholder="Excerpt (short blurb)"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="border p-2 rounded"
        />

        <textarea
          placeholder="Body (full text)"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="border p-2 rounded"
          rows={4}
        />

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Tags (comma-separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Media URL (optional)"
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
          className="border p-2 rounded"
        />

        <div>
          <label className="block mb-2">Or upload an image</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Add Item
        </button>
      </form>

      {message && <p className="mt-4">{message}</p>}

      <button
        className="mt-6 px-4 py-2 bg-gray-200 rounded"
        onClick={async () => {
          await supabase.auth.signOut()
          setUser(null)
        }}
      >
        Sign out
      </button>
    </main>
  )
}
