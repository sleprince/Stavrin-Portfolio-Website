// src/components/TileCard.tsx
import React from 'react'

export default function TileCard({ item }: { item: any }) {
  const thumb = item?.media?.[0]?.url || '/placeholder.png'
  return (
    <article className="bg-white rounded-lg shadow p-3">
      <div className="h-44 w-full overflow-hidden rounded">
        <img src={thumb} alt={item.title} className="w-full h-full object-cover" />
      </div>
      <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
      <p className="text-sm text-gray-600 mt-1">{item.excerpt}</p>
    </article>
  )
}
