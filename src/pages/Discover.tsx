import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import type { ContentRating, Difficulty, Genre } from '../types'
import { useApp } from '../state/store'
import { GENRES, GENRE_BLURBS } from '../data/worlds'
import { WorldCard } from '../components/world-card'
import { EmptyState, Pill } from '../components/ui'

const SORTS = [
  { id: 'plays', label: 'Most played' },
  { id: 'rating', label: 'Top rated' },
  { id: 'new', label: 'Newest' },
] as const

export function DiscoverPage({ genre }: { genre?: Genre }) {
  const { data } = useApp()
  const [q, setQ] = useState('')
  const [genreSel, setGenreSel] = useState<Genre | 'all'>(genre ?? 'all')
  const [diffSel, setDiffSel] = useState<Difficulty | 'all'>('all')
  const [ratingSel, setRatingSel] = useState<ContentRating | 'all'>('all')
  const [sort, setSort] = useState<(typeof SORTS)[number]['id']>('plays')

  const worlds = useMemo(() => {
    let list = data.worlds.filter((w) => w.published)
    if (genreSel !== 'all') list = list.filter((w) => w.genre === genreSel)
    if (diffSel !== 'all') list = list.filter((w) => w.difficulty === diffSel)
    if (ratingSel !== 'all') list = list.filter((w) => w.contentRating === ratingSel)
    const needle = q.trim().toLowerCase()
    if (needle) {
      list = list.filter(
        (w) =>
          w.title.toLowerCase().includes(needle) ||
          w.tagline.toLowerCase().includes(needle) ||
          w.tags.some((t) => t.includes(needle)) ||
          w.creatorName.toLowerCase().includes(needle) ||
          w.creatorHandle.includes(needle),
      )
    }
    return [...list].sort((a, b) =>
      sort === 'plays' ? b.plays - a.plays : sort === 'rating' ? b.rating - a.rating : b.createdAt - a.createdAt,
    )
  }, [data.worlds, genreSel, diffSel, ratingSel, sort, q])

  return (
    <div className="page page-discover">
      <header className="discover-head">
        <h1>Discover worlds</h1>
        <p>{genreSel !== 'all' ? GENRE_BLURBS[genreSel] : 'Ten handcrafted launch worlds and everything the community builds next.'}</p>
        <div className="discover-bar glass">
          <label className="discover-search">
            <Search size={15} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search titles, tags, creators…" />
          </label>
          <div className="discover-chips">
            <select value={genreSel} onChange={(e) => setGenreSel(e.target.value as Genre | 'all')} aria-label="Genre">
              <option value="all">All genres</option>
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <select value={diffSel} onChange={(e) => setDiffSel(e.target.value as Difficulty | 'all')} aria-label="Difficulty">
              <option value="all">Any challenge</option>
              <option>Story</option>
              <option>Balanced</option>
              <option>Brutal</option>
            </select>
            <select value={ratingSel} onChange={(e) => setRatingSel(e.target.value as ContentRating | 'all')} aria-label="Content rating">
              <option value="all">Default</option>
              <option>Everyone</option>
              <option>Teen</option>
              <option>Mature</option>
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Sort">
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <span className="discover-count">
            <SlidersHorizontal size={13} /> {worlds.length} world{worlds.length === 1 ? '' : 's'}
          </span>
        </div>
        <div className="genre-tabs">
          <button className={`genre-tab ${genreSel === 'all' ? 'on' : ''}`} onClick={() => setGenreSel('all')}>
            All
          </button>
          {GENRES.map((g) => (
            <button key={g} className={`genre-tab ${genreSel === g ? 'on' : ''}`} onClick={() => setGenreSel(g)}>
              {g}
            </button>
          ))}
        </div>
      </header>

      {worlds.length ? (
        <div className="grid-worlds">
          {worlds.map((w) => (
            <WorldCard key={w.id} world={w} />
          ))}
        </div>
      ) : (
        <EmptyState icon={<Search size={28} />} title="Nothing matches those filters" hint="Try removing a filter — or build the world you were looking for in Studio." />
      )}
    </div>
  )
}
