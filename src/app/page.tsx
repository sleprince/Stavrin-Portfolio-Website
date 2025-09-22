// src/app/page.tsx
import TileGrid from '@/components/TileGrid'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Stavrin</h1>
          <p className="text-gray-700 mt-2">The stories behind the music.</p>
        </header>

        {/* server component will fetch items */}
        <TileGrid site="stavrin" />
      </div>
    </main>
  )
}
