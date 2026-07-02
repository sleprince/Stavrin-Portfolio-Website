'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

export default function AdminStavrinPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<any[]>([])

  // ----------------- FORM STATES -----------------
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('') // <-- NEW field for full story
  const [slug, setSlug] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const router = useRouter()

  // ----------------- AUTH -----------------
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data.session?.user ?? null)

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
      })
      return () => listener?.subscription?.unsubscribe()
    }
    init().finally(() => setLoading(false))
  }, [])

  // ----------------- FETCH ITEMS -----------------
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

  // ----------------- MAGIC LINK -----------------
  async function sendMagicLink() {
    if (!email) return alert('Enter your email')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_SITE_URL + '/admin/stavrin'
      }
    })
    if (error) return alert(error.message)
    alert('Check your email for the magic link.')
  }

  // ----------------- CREATE / UPDATE -----------------
  const handleSaveItem = async () => {
    if (!user) return alert('Please sign in first.')
    if (!title) return alert('Add a title')

    let mediaArr: any[] = []

    // upload image if provided
    if (file) {
      const path = `${Date.now()}-${file.name}`
      const { error } = await supabase.storage.from('media').upload(path, file)
      if (error) return alert('Image upload error: ' + error.message)
      const { data } = supabase.storage.from('media').getPublicUrl(path)
      mediaArr.push({ type: 'image', url: data.publicUrl })
    }

    // upload audio if provided
    if (audioFile) {
      const path = `${Date.now()}-${audioFile.name}`
      const { error } = await supabase.storage.from('media').upload(path, audioFile)
      if (error) return alert('Audio upload error: ' + error.message)
      const { data } = supabase.storage.from('media').getPublicUrl(path)
      mediaArr.push({ type: 'audio', url: data.publicUrl })
    }

    // generate slug if empty
    let newSlug = slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
    if (!editingId) newSlug = `${newSlug}-${Date.now()}`

    // construct payload for DB
    const payload: any = {
      site_slug: 'stavrin',
      title,
      slug: newSlug,
      excerpt,   // short preview text
      content,   // <-- full story text
      visible: true
    }
    if (mediaArr.length > 0) payload.media = mediaArr

    if (editingId) {
      // update existing
      const { error } = await supabase.from('items').update(payload).eq('id', editingId)
      if (error) return alert('Update error: ' + error.message)
      setItems(items.map(item => (item.id === editingId ? { ...item, ...payload } : item)))
      setMessage('✅ Item updated!')
    } else {
      // create new
      const { data, error } = await supabase.from('items').insert([payload]).select()
      if (error) return alert('Insert error: ' + error.message)
      setItems([...items, ...data])
      setMessage('✅ Item created!')
    }

    resetForm()
  }

  // ----------------- DELETE -----------------
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return
    const { error } = await supabase.from('items').delete().eq('id', id)
    if (error) return alert('Delete error: ' + error.message)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  // ----------------- REORDER -----------------
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return
    const reordered = Array.from(items)
    const [moved] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, moved)
    setItems(reordered)

    // persist new order in DB
    await Promise.all(
      reordered.map((item, idx) =>
        supabase.from('items').update({ order_idx: idx }).eq('id', item.id)
      )
    )
  }

  // ----------------- HELPERS -----------------
  const resetForm = () => {
    setTitle('')
    setExcerpt('')
    setContent('') // reset full story too
    setSlug('')
    setFile(null)
    setAudioFile(null)
    setEditingId(null)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  // ----------------- RENDER -----------------
  if (loading) return <p>Loading...</p>

  if (!user) {
    // login screen
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
      </div>
    )
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Stavrin Admin Panel</h2>

      {/* Form */}
      <div className="mb-4">
        <label className="block mb-1">Title</label>
        <input
          className="w-full p-2 border rounded mb-2"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <label className="block mb-1">Slug (optional)</label>
        <input
          className="w-full p-2 border rounded mb-2"
          value={slug}
          onChange={e => setSlug(e.target.value)}
        />

        <label className="block mb-1">Excerpt</label>
        <textarea
          className="w-full p-2 border rounded mb-2"
          value={excerpt}
          onChange={e => setExcerpt(e.target.value)}
        />

        {/* NEW: Full story field */}
        <label className="block mb-1">Full Content</label>
        <textarea
          className="w-full p-2 border rounded mb-2"
          rows={5}
          value={content}
          onChange={e => setContent(e.target.value)}
        />

        <label className="block mb-1">Image (replace if uploading new)</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => setFile(e.target.files?.[0] ?? null)}
          className="mb-2"
        />

        <label className="block mb-1">Audio (replace if uploading new)</label>
        <input
          type="file"
          accept="audio/*"
          onChange={e => setAudioFile(e.target.files?.[0] ?? null)}
          className="mb-2"
        />

        <div className="flex gap-2 mt-2">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded"
            onClick={handleSaveItem}
          >
            {editingId ? 'Update Item' : 'Create Item'}
          </button>
          {editingId && (
            <button
              className="px-4 py-2 bg-gray-400 text-white rounded"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
          <button
            className="px-4 py-2 bg-gray-200 rounded"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
      </div>

      {message && <p className="mt-4">{message}</p>}

      {/* Item list with drag-and-drop */}
      <h3 className="text-lg font-semibold mt-6 mb-2">Existing Items</h3>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="items">
          {provided => (
            <ul {...provided.droppableProps} ref={provided.innerRef}>
              {items.map((item, idx) => (
                <Draggable key={item.id} draggableId={item.id.toString()} index={idx}>
                  {provided => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="mb-2 border p-2 rounded flex justify-between items-center"
                    >
                      <div>
                        <strong>{item.title}</strong> — {item.excerpt}
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="px-2 py-1 bg-green-600 text-white rounded"
                          onClick={() => {
                            setTitle(item.title)
                            setExcerpt(item.excerpt)
                            setContent(item.content || '') // <-- load full story if exists
                            setSlug(item.slug)
                            setEditingId(item.id)
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="px-2 py-1 bg-red-600 text-white rounded"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}
