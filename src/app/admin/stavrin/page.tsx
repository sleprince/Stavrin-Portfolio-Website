// src/app/admin/stavrin/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AdminStavrinPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // form states
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [slug, setSlug] = useState('')
  const [items, setItems] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const router = useRouter()

  // ----- AUTH LISTENER -----
 useEffect(() => {
  const init = async () => {
    const { data } = await supabase.auth.getSession()
    setUser(data.session?.user ?? null)

    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setUser(session?.user ?? null)
    })
    return () => listener?.subscription?.unsubscribe()
  }
  init().finally(() => setLoading(false))
}, [])



  // ----- FETCH ITEMS -----
  useEffect(() => {
    if (!user) return
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('site_slug', 'stavrin')
        .order('order_idx', { ascending: true })
      if (error) console.error(error)
      else setItems(data)
    }
    fetchItems()
  }, [user])

  // ----- SEND MAGIC LINK -----
async function sendMagicLink() {
  if (!email) return alert('Enter your email');

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // Redirect to the admin page directly after verification
      emailRedirectTo: process.env.NEXT_PUBLIC_SITE_URL + '/admin/stavrin'
    }
  });

  if (error) return alert(error.message);

  alert('Check your email for the magic link — it will take you straight to the admin panel.');
}


  // ----- CREATE / EDIT ITEM -----
  const handleUploadAndInsert = async (editId?: string) => {
    if (!user) return alert('Please sign in first.')
    if (!title) return alert('Add a title')

    let mediaArr: any[] = []

    // image upload
    if (file) {
      const path = `${Date.now()}-${file.name}`
      const { error: uploadErr } = await supabase.storage.from('media').upload(path, file)
      if (uploadErr) return alert('Image upload error: ' + uploadErr.message)
      const { data: publicData } = supabase.storage.from('media').getPublicUrl(path)
      mediaArr.push({ type: 'image', url: publicData.publicUrl })
    }

    // audio upload
    if (audioFile) {
      const path = `${Date.now()}-${audioFile.name}`
      const { error: uploadErr } = await supabase.storage.from('media').upload(path, audioFile)
      if (uploadErr) return alert('Audio upload error: ' + uploadErr.message)
      const { data: publicData } = supabase.storage.from('media').getPublicUrl(path)
      mediaArr.push({ type: 'audio', url: publicData.publicUrl })
    }

    // generate slug
    let newSlug = slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
    // ensure unique slug by appending timestamp if editing is not happening
    if (!editId) newSlug = `${newSlug}-${Date.now()}`

    const payload = {
      site_slug: 'stavrin',
      title,
      slug: newSlug,
      excerpt,
      media: mediaArr,
      visible: true
    }

    let res
    if (editId) {
      const { error } = await supabase.from('items').update(payload).eq('id', editId)
      if (error) return alert('Update error: ' + error.message)
      res = items.map(item => item.id === editId ? { ...item, ...payload } : item)
    } else {
      const { data, error } = await supabase.from('items').insert([payload]).select()
      if (error) return alert('Insert error: ' + error.message)
      res = [...items, ...data]
    }

    setItems(res)
    setTitle(''); setExcerpt(''); setFile(null); setAudioFile(null); setSlug('')
    setMessage(editId ? '✅ Item updated!' : '✅ Item created!')
  }

  // ----- DELETE ITEM -----
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return
    const { error } = await supabase.from('items').delete().eq('id', id)
    if (error) return alert('Delete error: ' + error.message)
    setItems(prev => prev.filter(item => item.id !== id))
  }

  // ----- SIGN OUT -----
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  // ----- LOADING -----
  if (loading) return <p>Loading...</p>

  // ----- LOGIN FORM -----
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

  // ----- ADMIN PANEL -----
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Stavrin Admin Panel</h2>

      <div className="mb-4">
        <label className="block mb-1">Title</label>
        <input className="w-full p-2 border rounded mb-2" value={title} onChange={e=>setTitle(e.target.value)} />

        <label className="block mb-1">Slug (optional, auto-generated if blank)</label>
        <input className="w-full p-2 border rounded mb-2" value={slug} onChange={e=>setSlug(e.target.value)} />

        <label className="block mb-1">Excerpt</label>
        <textarea className="w-full p-2 border rounded mb-2" value={excerpt} onChange={e=>setExcerpt(e.target.value)} />

        <label className="block mb-1">Image</label>
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] ?? null)} className="mb-2" />

        <label className="block mb-1">Audio</label>
        <input type="file" accept="audio/*" onChange={e => setAudioFile(e.target.files?.[0] ?? null)} className="mb-2" />

        <div className="flex gap-2 mt-2">
          <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={()=>handleUploadAndInsert()}>
            Create Item
          </button>
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={handleSignOut}>Sign out</button>
        </div>
      </div>

      {message && <p className="mt-4">{message}</p>}

      <h3 className="text-lg font-semibold mt-6 mb-2">Existing Items</h3>
      <ul>
        {items.map(item => (
          <li key={item.id} className="mb-2 border p-2 rounded flex justify-between items-center">
            <div>
              <strong>{item.title}</strong> — {item.excerpt}
            </div>
            <div className="flex gap-2">
              <button className="px-2 py-1 bg-green-600 text-white rounded" onClick={()=> {
                setTitle(item.title)
                setExcerpt(item.excerpt)
                setSlug(item.slug)
                setFile(null)
                setAudioFile(null)
              }}>Edit</button>
              <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={()=>handleDelete(item.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
