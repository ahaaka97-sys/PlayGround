import { useState } from 'react'
import { Play, Users, Star, ScrollText, Trash2, Copy } from 'lucide-react'
import { useApp, toast } from '../state/store'
import { go } from '../lib/router'
import { CoverArt } from '../components/CoverArt'
import { Pill, EmptyState } from '../components/ui'
import { fmt, ago } from '../lib/funcs'
import type { SaveState, World } from '../types'

function MapPreview({ world }: { world: World }) {
  const [sel, setSel] = useState<string | null>(null)
  return (
    <div className="map-preview">
      <svg viewBox="0 0 100 90" className="map-svg" aria-hidden="true">
        <defs>
          <radialGradient id="mapglow" cx="50%" cy="45%" r="70%">
            <stop offset="0%" stopColor={world.art.palette.accent} stopOpacity="0.16" />
            <stop offset="100%" stopColor={world.art.palette.deep} stopOpacity="0.9" />
          </radialGradient>
        </defs>
        <rect width="100" height="90" fill={world.art.palette.deep} />
        <rect width="100" height="90" fill="url(#mapglow)" />
        {[14, 30, 46, 62].map((y) => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke={world.art.palette.accent} strokeOpacity="0.07" strokeWidth="0.3" />
        ))}
        {[16, 33, 50, 67, 84].map((x) => (
          <line key={x} x1={x} y1="0" x2={x} y2="90" stroke={world.art.palette.accent} strokeOpacity="0.07" strokeWidth="0.3" />
        ))}
        {world.locations.slice(0, -1).map((l, i) => {
          const n = world.locations[i + 1]
          if (!n) return null
          return (
            <line
              key={'edge-' + l.id}
              x1={l.x}
              y1={l.y}
              x2={n.x}
              y2={n.y}
              stroke={world.art.palette.accent}
              strokeOpacity="0.4"
              strokeWidth="0.5"
              strokeDasharray="1.6 1.6"
            />
          )
        })}
        {world.locations.map((l, i) => (
          <g key={l.id} className="map-node" onClick={() => setSel(l.id)}>
            <circle cx={l.x} cy={l.y} r={sel === l.id ? 3.4 : 2.4} fill={i === 0 ? world.art.palette.glow : world.art.palette.accent} />
            <circle cx={l.x} cy={l.y} r="5.5" fill="transparent" />
            <text x={l.x} y={l.y - 4} textAnchor="middle" fontSize="3.4" fill={world.art.palette.glow}>
              {l.name.length > 18 ? l.name.slice(0, 17) + '…' : l.name}
            </text>
          </g>
        ))}
      </svg>
      {sel && (
        <div className="map-note glass">
          {(() => {
            const l = world.locations.find((x) => x.id === sel)
            if (!l) return null
            return (
              <>
                <strong>{l.name}</strong>
                <p>{l.description}</p>
              </>
            )
          })()}
        </div>
      )}
    </div>
  )
}

function SavesPanel({ world }: { world: World }) {
  const saves = useApp().savesFor(world.id)
  const { deleteSave, duplicateSave } = useApp()
  if (!saves.length)
    return <EmptyState icon={<ScrollText size={24} />} title="No characters yet in this world" hint="Create one — it takes about a minute." />
  return (
    <div className="saves-list">
      {saves.map((s) => {
        const loc = world.locations.find((l) => l.id === s.locationId) ?? world.locations[0]
        return (
          <div key={s.id} className="save-row glass">
            <div className="save-row-main" onClick={() => go({ name: 'play', saveId: s.id })}>
              <strong>{s.customTitle ?? `${s.character.name}`}</strong>
              <span>
                {loc.name} · Turn {s.turn} · Lv {s.level} · {ago(s.updatedAt)}
              </span>
              <div className="hp-track thin">
                <div className="hp-fill" style={{ width: `${Math.round((s.hp / s.maxHp) * 100)}%` }} />
              </div>
            </div>
            <div className="save-row-actions">
              <button className="btn btn-sm btn-primary" onClick={() => go({ name: 'play', saveId: s.id })}>
                <Play size={13} /> Resume
              </button>
              <button className="icon-btn" title="Duplicate" onClick={() => { duplicateSave(s.id); toast('Save duplicated') }}>
                <Copy size={15} />
              </button>
              <button className="icon-btn danger" title="Delete save" onClick={() => { deleteSave(s.id); toast('Save deleted') }}>
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function WorldPage({ id }: { id: string }) {
  const { worldById, data } = useApp()
  const world = worldById(id)
  const [tab, setTab] = useState<'about' | 'map' | 'quest' | 'saves'>('about')
  if (!world) return <div className="page">World not found.</div>
  const creator = creatorOf(world)

  return (
    <div className="page page-world">
      <div className="world-hero">
        <div className="world-hero-art">
          <CoverArt art={world.art} />
        </div>
        <div className="world-hero-scrim" />
        <div className="world-hero-body">
          <div className="world-hero-tags">
            <Pill tone="accent">{world.genre}</Pill>
            <Pill>{world.difficulty} challenge</Pill>
            <Pill tone={world.contentRating === 'Mature' ? 'danger' : 'default'}>{world.contentRating}</Pill>
            {world.official && <Pill tone="good">Original</Pill>}
          </div>
          <h1>{world.title}</h1>
          <p className="world-tagline">{world.tagline}</p>
          <div className="world-meta">
            <span>
              <Star size={14} /> {world.rating > 0 ? `${world.rating.toFixed(1)} (${fmt(world.ratingCount)})` : 'New'}
            </span>
            <span>
              <Users size={14} /> {fmt(world.plays)} plays
            </span>
            <span>by {creator}</span>
          </div>
          <div className="world-cta">
            <button className="btn btn-primary btn-lg" onClick={() => go({ name: 'create', worldId: world.id })}>
              <Play size={17} /> Start adventure
            </button>
          </div>
        </div>
      </div>

      <div className="tabs sticky-tabs">
        {(
          [
            { id: 'about', label: 'About' },
            { id: 'map', label: 'Map', badge: world.locations.length },
            { id: 'quest', label: 'Quests & loot', badge: world.quests.length },
            { id: 'saves', label: 'Your saves', badge: savesCount(data, world.id) },
          ] as { id: typeof tab; label: string; badge?: number }[]
        ).map((t) => (
          <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
            {t.badge ? <span className="tab-badge">{t.badge}</span> : null}
          </button>
        ))}
      </div>

      <div className="world-body">
        {tab === 'about' && (
          <>
            <div className="world-cols">
              <div className="world-main">
                <h2 className="h-section">{world.premise}</h2>
                <p className="world-desc">{world.description}</p>
                <div className="world-tags">
                  {world.tags.map((t) => (
                    <a key={t} className="pill" href={`#/discover?${encodeURIComponent(t)}`}>
                      #{t}
                    </a>
                  ))}
                </div>
                <h3 className="h-section">The cast</h3>
                <div className="cast-grid">
                  {world.npcs.map((n) => (
                    <div key={n.id} className="cast-card glass">
                      <div className="cast-avatar" style={{ background: `linear-gradient(140deg, ${world.art.palette.accent}33, ${world.art.palette.deep})` }}>
                        {n.name
                          .split(' ')
                          .map((w) => w[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                      <div>
                        <strong>{n.name}</strong>
                        <span className="cast-role">{n.role}</span>
                        <p>{n.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <aside className="world-aside">
                <div className="aside-card glass">
                  <h4>Opening scene</h4>
                  <p className="opening-quote">“{world.opening.slice(0, 200)}{world.opening.length > 200 ? '…' : ''}”</p>
                </div>
                <div className="aside-card glass">
                  <h4>Challenge</h4>
                  <p>
                    Checks roll d20 against difficulty <strong>{world.difficulty}</strong>. {world.difficulty === 'Brutal' ? 'Expect attrition.' : world.difficulty === 'Story' ? 'Gentle dice, forgiving world.' : 'A fair fight.'}
                  </p>
                </div>
              </aside>
            </div>
          </>
        )}

        {tab === 'map' && <MapPreview world={world} />}

        {tab === 'quest' && (
          <div className="quest-cols">
            <div>
              <h3 className="h-section">Quests</h3>
              <div className="quest-list">
                {world.quests.map((q) => (
                  <div key={q.id} className="quest-card glass">
                    <strong>{q.title}</strong>
                    <p>{q.hook}</p>
                    <div className="quest-meta">
                      <Pill>{q.objective}</Pill>
                      <span className="quest-reward">
                        {q.rewardXp} XP{q.rewardGold ? ` · ${q.rewardGold} coins` : ''}
                        {q.itemId ? ` · ${world.items.find((i) => i.id === q.itemId)?.name ?? ''}` : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="h-section">Loot table</h3>
              <div className="item-list">
                {world.items.map((i) => (
                  <div key={i.id} className="item-row glass">
                    <strong>{i.name}</strong>
                    <span className="pill">{i.kind}</span>
                    <p>{i.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'saves' && <SavesPanel world={world} />}
      </div>
    </div>
  )
}

function creatorOf(world: World): string {
  const official = world.creatorId === 'odyssey-originals'
  return official ? 'Odyssey Originals' : world.creatorName
}

function savesCount(data: { saves: SaveState[] }, worldId: string): number {
  return data.saves.filter((s) => s.worldId === worldId).length
}
