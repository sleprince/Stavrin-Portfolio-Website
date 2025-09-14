// src/components/TileGrid.tsx
import TileCard from './TileCard'
import { supabase } from '@/lib/supabaseClient'

export default async function TileGrid({ site = 'stavrin' }: { site?: string }) {
  // server-side fetch (App Router supports async server components)
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('site_slug', site)
    .eq('visible', true)
    .order('order_idx', { ascending: true })

  if (error) {
    console.error('Supabase error:', error)
  }

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {data?.map((item: any) => (
        <TileCard key={item.id} item={item} />
      ))}
    </div>
  )
}
