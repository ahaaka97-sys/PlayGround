import { useState } from 'react'
import {
  Hammer,
  Sparkles,
  Trash2,
  Plus,
  Globe2,
  Check,
  X,
  ChevronLeft,
  Pencil,
} from 'lucide-react'
import type {
  Genre,
  ItemTemplate,
  Motif,
  Palette,
  QuestTemplate,
  World,
  WorldLocation,
  WorldNpc,
  ContentRating,
  Difficulty,
} from '../types'
import { useApp, toast } from '../state/store'
import { go } from '../lib/router'
import { CoverArt } from '../components/CoverArt'
import { EmptyState, Pill, Modal, Tabs } from '../components/ui'
import { CREATOR_STATS } from '../data/seed'
import { uid } from '../lib/funcs'

const GENRE_PALETTE: Record<Genre, Palette> = {
  Fantasy: { sky: '#2b1626', deep: '#120a16', accent: '#f2a65a', glow: '#ff5d5d' },
  'Sci-Fi': { sky: '#0a1230', deep: '#04050f', accent: '#8ecae6', glow: '#c77dff' },
  Cyberpunk: { sky: '#0a1130', deep: '#04050e', accent: '#35e0c8', glow: '#ff3d81' },
  Mystery: { sky: '#141a26', deep: '#070a10', accent: '#8fa8c8', glow: '#e8e2d0' },
  Horror: { sky: '#0e1b26', deep: '#03080c', accent: '#7fb3c8', glow: '#e8f1f2' },
  Romance: { sky: '#2b1220', deep: '#0c0609', accent: '#e3b448', glow: '#d1495b' },
  Mythic: { sky: '#0d2a3f', deep: '#03101a', accent: '#67d8c6', glow: '#b9f5e4' },
  Historical: { sky: '#2b1220', deep: '#0d0609', accent: '#e3b448', glow: '#d1495b' },
  'Post-Apocalyptic': { sky: '#182a1a', deep: '#060b07', accent: '#c7f36b', glow: '#ffca3a' },
  'Slice of Life': { sky: '#22303a', deep: '#0c1218', accent: '#9ad0c2', glow: '#ffd6a5' },
}

const GENRE_MOTIF: Record<Genre, Motif> = {
  Fantasy: 'mountains',
  'Sci-Fi': 'space',
  Cyberpunk: 'city',
  Mystery: 'ocean',
  Horror: 'ruins',
  Romance: 'city',
  Mythic: 'ocean',
  Historical: 'city',
  'Post-Apocalyptic': 'ruins',
  'Slice of Life': 'dream',
}

function detectGenre(text: string): Genre {
  const t = text.toLowerCase()
  const map: Array<[Genre, string[]]> = [
    ['Cyberpunk', ['cyber', 'neon', 'hacker', 'corp', 'android', 'megacity', 'chrome']],
    ['Sci-Fi', ['space', 'ship', 'colony', 'ai', 'robot', 'mars', 'station', 'orbital']],
    ['Horror', ['horror', 'haunt', 'ghost', 'fog', 'dread', 'lighthouse', 'monster']],
    ['Mystery', ['mystery', 'detective', 'murder', 'enigma', 'detect', 'clue']],
    ['Mythic', ['god', 'sea', 'myth', 'titan', 'divine', 'legend']],
    ['Historical', ['venice', 'historical', 'empire', 'ruin', 'ancient', 'court']],
    ['Post-Apocalyptic', ['apocalyps', 'wasteland', 'survivor', 'ruins', 'after the']],
    ['Romance', ['romance', 'love', 'wedding', 'ball']],
    ['Fantasy', ['fantasy', 'kingdom', 'magic', 'sword', 'forest', 'dragon', 'crown', 'witch']],
  ]
  for (const [g, words] of map) if (words.some((w) => t.includes(w))) return g
  return 'Fantasy'
}

function sentenceize(text: string): string[] {
  return text
    .split(/[.!?;\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8)
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

interface Draft {
  title: string
  tagline: string
  description: string
  premise: string
  opening: string
  genre: Genre
  difficulty: Difficulty
  contentRating: ContentRating
  tags: string[]
  locations: WorldLocation[]
  npcs: WorldNpc[]
  quests: QuestTemplate[]
  items: ItemTemplate[]
}

function generateDraft(prompt: string): Draft {
  const genre = detectGenre(prompt)
  const motif = GENRE_MOTIF[genre]
  const palette = { ...GENRE_PALETTE[genre] }
  const sentences = sentenceize(prompt)
  const words = prompt.split(/[^a-zA-Z']+/).filter(Boolean)
  const proper = words.filter((w) => /^[A-Z][a-z]+$/.test(w) && !['The', 'A', 'An'].includes(w))
  const titleWord = proper[0] ?? words[0] ?? 'Untold'
  const title = titleWord.length > 3 && /^[A-Z]/.test(titleWord) ? titleWord : capitalize(titleWord)
  const placeWord = proper[1] ?? title

  const locNames = [
    `The ${title} Gate`,
    `${title} Market`,
    `${placeWord} Heights`,
    `${title} Deep`,
    `The Old ${titleWord} Road`,
  ]
  const locations: WorldLocation[] = locNames.map((name, i) => ({
    id: `loc-${i}`,
    name,
    kind: (['town', 'town', 'wild', 'dungeon', 'landmark'] as const)[i],
    x: [20, 40, 56, 74, 88][i],
    y: [58, 46, 62, 38, 50][i],
    description:
      sentences[i] ??
      `A place shaped by ${genre === 'Cyberpunk' ? 'neon and debt' : genre === 'Sci-Fi' ? 'cold metal and older questions' : 'history and rumor'} — locals avoid the far corners after dark.`,
  }))

  const castNames = ['Sable Wren', 'Doctor Ash', 'The Warden of Light']
  const roles = ['a fixer with a price list', 'an archivist who never sleeps', 'the local authority']
  const npcs: WorldNpc[] = castNames.slice(0, 3).map((name, i) => ({
    id: `npc-${i}`,
    name,
    role: roles[i].replace(/^\w/, (c) => c.toUpperCase()),
    disposition: (['neutral', 'wary', 'hostile'] as const)[i],
    description: sentences[0] ?? `They hold more leverage than their title suggests, and they know your name already.`,
    locationId: locations[i].id,
  }))

  const quests: QuestTemplate[] = [
    {
      id: 'q-0',
      title: `The ${title} Ledger`,
      hook: `Something was taken from ${locations[0].name}, and the whole district pretends it never existed.`,
      objective: `Learn what was taken, and by whom.`,
      rewardXp: 300,
      rewardGold: 80,
    },
    {
      id: 'q-1',
      title: `Beneath ${locations[3]?.name ?? title}`,
      hook: `The answers are somewhere with worse air and older locks.`,
      objective: `Reach the deepest level and bring back proof.`,
      rewardXp: 460,
      rewardGold: 140,
      itemId: 'it-0',
    },
  ]

  const items: ItemTemplate[] = [
    { id: 'it-0', name: `${titleWord} Fragment`, kind: 'relic', rarity: 'legendary', description: `A piece of whatever was stolen. It is warmer than it should be.`, bonus: { stat: 'spirit', value: 2 } },
    { id: 'it-1', name: 'Quiet Blade', kind: 'weapon', rarity: 'uncommon', description: 'Not flashy. Effective.', bonus: { stat: 'might', value: 1 } },
    { id: 'it-2', name: 'Field Tonic', kind: 'consumable', rarity: 'common', description: 'Tastes of pine and poor decisions. Restores 8 HP.', bonus: { heal: 8 } },
    { id: 'it-3', name: 'Traveler\u2019s Charm', kind: 'trinket', rarity: 'uncommon', description: 'Keeps small doors from closing on you.', bonus: { stat: 'agility', value: 1 } },
  ]

  const opening =
    `${sentences[0] ?? `You arrive at the edge of ${title}, where the road forgets its own name.`} ` +
    `Somewhere past the first door, something awaits with patience that borders on rudeness.`

  return {
    title,
    tagline: sentences[0] ? capitalize(sentences[0]) : `A ${genre.toLowerCase()} tale with teeth.`,
    description: prompt.length > 60 ? capitalize(prompt) : `${capitalize(prompt)}. What happens next is entirely up to you.`,
    premise: `You are the one everyone underestimates.`,
    opening,
    genre,
    difficulty: 'Balanced',
    contentRating: 'Teen',
    tags: [genre.toLowerCase(), 'community', 'prompt-built'],
    locations,
    npcs,
    quests,
    items,
  }
}

function draftToWorld(draft: Draft, creatorName: string, creatorHandle: string): World {
  return {
    id: uid('world'),
    title: draft.title || 'Untitled World',
    tagline: draft.tagline,
    description: draft.description,
    genre: draft.genre,
    tags: draft.tags,
    rating: 0,
    ratingCount: 0,
    plays: 0,
    creatorId: 'you',
    creatorName,
    creatorHandle,
    art: { motif: GENRE_MOTIF[draft.genre], palette: { ...GENRE_PALETTE[draft.genre] }, seed: Math.floor(Math.random() * 999) },
    difficulty: draft.difficulty,
    contentRating: draft.contentRating,
    npcs: draft.npcs,
    locations: draft.locations,
    quests: draft.quests,
    items: draft.items,
    opening: draft.opening,
    premise: draft.premise,
    published: false,
    createdAt: Date.now(),
  }
}

// ── Studio list ─────────────────────────────────────────────

export function StudioPage() {
  const { data, addWorld, deleteWorld, updateWorld } = useApp()
  const [prompt, setPrompt] = useState('')
  const [gen, setGen] = useState(false)
  const mine = data.worlds.filter((w) => w.creatorId === 'you')

  const createFromPrompt = () => {
    if (prompt.trim().length < 12) {
      toast('Describe your world in a sentence or two first')
      return
    }
    setGen(true)
    setTimeout(() => {
      const draft = generateDraft(prompt)
      const world = draftToWorld(draft, data.user.signedIn ? data.user.name : 'Anonymous Creator', data.user.handle)
      addWorld(world)
      setGen(false)
      toast('World drafted — review and publish')
      go({ name: 'studioEdit', id: world.id })
    }, 900)
  }

  const createBlank = () => {
    const draft = generateDraft('A world with one open road and excellent secrets.')
    const world = draftToWorld({ ...draft, title: 'Untitled World', tagline: 'Not yet named.' }, data.user.signedIn ? data.user.name : 'Anonymous Creator', data.user.handle)
    addWorld(world)
    toast('Blank world created')
    go({ name: 'studioEdit', id: world.id })
  }

  return (
    <div className="page page-studio">
      <header className="page-head">
        <h1>Creator Studio</h1>
        <p>Describe a world in plain language. Odyssey drafts the map, cast, quests, and loot — you polish and publish.</p>
      </header>

      <section className="studio-forge glass">
        <div className="forge-head">
          <Sparkles size={20} />
          <div>
            <h2>Draft a new world</h2>
            <span>One sentence is enough. A paragraph is better.</span>
          </div>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          maxLength={400}
          placeholder="e.g. A cyberpunk city where memories are currency and a courier just stole the protagonist's missing three years…"
        />
        <div className="forge-actions">
          <button className="btn btn-primary" onClick={createFromPrompt}>
            <Sparkles size={15} /> Generate world
          </button>
          <button className="btn btn-ghost" onClick={createBlank}>
            <Plus size={15} /> Start blank
          </button>
          {gen && <span className="forge-spinner">Composing your world…</span>}
        </div>
        <div className="forge-examples">
          <span>Try:</span>
          {['A drowned cathedral city where the tide keeps secrets', 'A mars colony that stopped answering six days ago', 'Venice masquerade with three liars and one letter'].map((e) => (
            <button key={e} className="example-chip" onClick={() => setPrompt(e)}>
              {e}
            </button>
          ))}
        </div>
      </section>

      <section className="studio-list">
        <h2 className="h-section">My worlds {mine.length > 0 && <Pill tone="accent">{mine.length}</Pill>}</h2>
        {mine.length === 0 ? (
          <EmptyState
            icon={<Hammer size={26} />}
            title="You haven't built anything yet"
            hint="Every world starts as a sentence. Draft one above, or remix a launch world."
          />
        ) : (
          <div className="studio-cards">
            {mine.map((w) => (
              <article key={w.id} className="studio-card glass">
                <div className="sc-art" onClick={() => go({ name: 'studioEdit', id: w.id })}>
                  <CoverArt art={w.art} />
                  <Pill tone={w.published ? 'good' : 'default'} className="sc-status">
                    {w.published ? 'Published' : 'Draft'}
                  </Pill>
                </div>
                <div className="sc-body">
                  <h3>{w.title}</h3>
                  <p>{w.tagline}</p>
                  <div className="sc-meta">
                    <Pill>{w.genre}</Pill>
                    <span>{w.locations.length} locations · {w.npcs.length} NPCs · {w.quests.length} quests</span>
                  </div>
                  <div className="sc-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => go({ name: 'studioEdit', id: w.id })}>
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      className={`btn btn-sm ${w.published ? 'btn-ghost' : 'btn-primary'}`}
                      onClick={() => {
                        updateWorld(w.id, (x) => Object.assign(x, { published: !x.published }))
                        toast(w.published ? 'Unpublished' : 'Published to Discover')
                      }}
                    >
                      {w.published ? 'Unpublish' : 'Publish'}
                    </button>
                    {w.published && (
                      <button className="btn btn-ghost btn-sm" onClick={() => go({ name: 'world', id: w.id })}>
                        <Globe2 size={13} /> View
                      </button>
                    )}
                    <button className="icon-btn danger" title="Delete" onClick={() => { deleteWorld(w.id); toast('World deleted') }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="studio-help glass">
        <h3>How Studio works</h3>
        <ol>
          <li><strong>Describe</strong> — Write a line about mood, plot, or place. The generator extracts genre, cast, and geography.</li>
          <li><strong>Refine</strong> — Edit every field: rename locations, set NPC dispositions, tune quest rewards, regroup loot.</li>
          <li><strong>Publish</strong> — flips it to discovery. Every Odyssey account plays your world with its own dice.</li>
        </ol>
      </section>
    </div>
  )
}

// ── Studio editor ───────────────────────────────────────────

type EditorTab = 'identity' | 'world' | 'cast' | 'quests' | 'opening'

function Remover({ onClick, label = 'Remove' }: { onClick: () => void; label?: string }) {
  return (
    <button className="icon-btn danger" title={label} onClick={onClick}>
      <X size={14} />
    </button>
  )
}

export function StudioEditPage({ id }: { id: string }) {
  const { worldById, updateWorld } = useApp()
  const world = worldById(id)
  const [tab, setTab] = useState<EditorTab>('identity')
  if (!world) return <div className="page center">That world does not exist.</div>

  const patch = (fn: (w: World) => void) => updateWorld(id, fn)

  return (
    <div className="page page-studio-edit">
      <header className="create-head">
        <button className="btn btn-ghost btn-sm" onClick={() => go({ name: 'studio' })}>
          <ChevronLeft size={15} /> Studio
        </button>
        <div className="studio-edit-title">
          <h1>{world.title}</h1>
          <Pill tone={world.published ? 'good' : 'default'}>{world.published ? 'Published' : 'Draft'}</Pill>
        </div>
        <div className="studio-edit-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => go({ name: 'world', id: world.id })}>
            Preview
          </button>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => {
              updateWorld(id, (w) => Object.assign(w, { published: true }))
              toast('Published')
            }}
          >
            <Check size={14} /> Publish
          </button>
        </div>
      </header>

      <Tabs
        value={tab}
        onChange={(t) => setTab(t)}
        className="studio-tabs"
        tabs={[
          { id: 'identity', label: 'Identity' },
          { id: 'world', label: 'Map & locations', badge: world.locations.length },
          { id: 'cast', label: 'Cast', badge: world.npcs.length },
          { id: 'quests', label: 'Quests & loot', badge: world.quests.length },
          { id: 'opening', label: 'Opening & rating' },
        ]}
      />

      {tab === 'identity' && (
        <section className="studio-tab">
          <div className="edit-grid">
            <div>
              <label className="field">
                <span>Title</span>
                <input value={world.title} onChange={(e) => patch((w) => (w.title = e.target.value))} maxLength={48} />
              </label>
              <label className="field">
                <span>Tagline</span>
                <input value={world.tagline} onChange={(e) => patch((w) => (w.tagline = e.target.value))} maxLength={90} />
              </label>
              <label className="field">
                <span>Description</span>
                <textarea rows={4} value={world.description} onChange={(e) => patch((w) => (w.description = e.target.value))} maxLength={600} />
              </label>
              <label className="field">
                <span>Tags (comma separated)</span>
                <input
                  value={world.tags.join(', ')}
                  onChange={(e) => patch((w) => (w.tags = e.target.value.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 6)))}
                />
              </label>
            </div>
            <label className="field">
              <span>Genre</span>
              <select value={world.genre} onChange={(e) => patch((w) => {
                w.genre = e.target.value as Genre
                w.art = { motif: GENRE_MOTIF[w.genre], palette: { ...GENRE_PALETTE[w.genre] }, seed: w.art.seed }
              })}>
                {(['Fantasy', 'Sci-Fi', 'Cyberpunk', 'Mystery', 'Horror', 'Romance', 'Mythic', 'Historical', 'Post-Apocalyptic', 'Slice of Life'] as Genre[]).map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </label>
            <div className="edit-cover">
              <CoverArt art={world.art} />
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => patch((w) => (w.art = { ...w.art, seed: Math.floor(Math.random() * 999) }))}
              >
                Reroll artwork
              </button>
            </div>
          </div>
        </section>
      )}

      {tab === 'world' && (
        <section className="studio-tab list-editor">
          <div className="edit-map-host">
            <svg viewBox="0 0 100 90" className="edit-map-svg">
              <rect width="100" height="90" fill={world.art.palette.deep} />
              <rect width="100" height="90" fill={world.art.palette.accent} opacity="0.05" />
              {world.locations.slice(0, -1).map((l, i) => {
                const next = world.locations[i + 1]
                if (!next) return null
                return (
                  <line
                    key={'edge-' + l.id}
                    x1={l.x}
                    y1={l.y}
                    x2={next.x}
                    y2={next.y}
                    stroke={world.art.palette.accent}
                    strokeOpacity="0.4"
                    strokeWidth="0.5"
                    strokeDasharray="1.6 1.6"
                  />
                )
              })}
              {world.locations.map((l, i) => (
                <g key={l.id}>
                  <circle cx={l.x} cy={l.y} r={i === 0 ? 3 : 2.4} fill={i === 0 ? world.art.palette.glow : world.art.palette.accent} />
                  <text x={l.x} y={l.y - 4.5} textAnchor="middle" fontSize="3.2" fill={world.art.palette.glow}>
                    {l.name.length > 16 ? l.name.slice(0, 15) + '…' : l.name}
                  </text>
                </g>
              ))}
            </svg>
          </div>
          <div className="le-head">
            <h3>Locations</h3>
            <button
              className="btn btn-sm"
              onClick={() =>
                patch((w) =>
                  w.locations.push({
                    id: uid('loc'),
                    name: 'New Location',
                    kind: 'wild',
                    x: Math.floor(16 + Math.random() * 68),
                    y: Math.floor(28 + Math.random() * 44),
                    description: '',
                  }),
                )
              }
            >
              <Plus size={14} /> Add location
            </button>
          </div>
          {world.locations.map((l, i) => (
            <div key={l.id} className="le-card glass">
              <Remover onClick={() => patch((w) => w.locations.splice(i, 1))} />
              <div className="le-grid">
                <label className="field">
                  <span>Name</span>
                  <input value={l.name} onChange={(e) => patch((w) => (w.locations[i].name = e.target.value))} />
                </label>
                <label className="field">
                  <span>Kind</span>
                  <select value={l.kind} onChange={(e) => patch((w) => (w.locations[i].kind = e.target.value as WorldLocation['kind']))}>
                    {['hub', 'town', 'wild', 'dungeon', 'landmark'].map((k) => (
                      <option key={k}>{k}</option>
                    ))}
                  </select>
                </label>
                <label className="field wide">
                  <span>Description</span>
                  <textarea rows={2} value={l.description} onChange={(e) => patch((w) => (w.locations[i].description = e.target.value))} />
                </label>
              </div>
            </div>
          ))}
        </section>
      )}

      {tab === 'cast' && (
        <section className="studio-tab list-editor">
          <div className="le-head">
            <h3>Non-player characters</h3>
            <button
              className="btn btn-sm"
              onClick={() => patch((w) => w.npcs.push({ id: uid('npc'), name: 'New Face', role: 'Role', disposition: 'neutral', description: 'Describe them here.', locationId: w.locations[0]?.id }))}
            >
              <Plus size={14} /> Add NPC
            </button>
          </div>
          {world.npcs.map((n, i) => (
            <div key={n.id} className="le-card glass">
              <Remover onClick={() => patch((w) => w.npcs.splice(i, 1))} />
              <div className="le-grid">
                <label className="field">
                  <span>Name</span>
                  <input value={n.name} onChange={(e) => patch((w) => (w.npcs[i].name = e.target.value))} />
                </label>
                <label className="field">
                  <span>Role</span>
                  <input value={n.role} onChange={(e) => patch((w) => (w.npcs[i].role = e.target.value))} />
                </label>
                <label className="field">
                  <span>Found at</span>
                  <select value={n.locationId} onChange={(e) => patch((w) => (w.npcs[i].locationId = e.target.value))}>
                    {world.locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Disposition</span>
                  <select
                    value={n.disposition}
                    onChange={(e) => patch((w) => (w.npcs[i].disposition = e.target.value as WorldNpc['disposition']))}
                  >
                    <option value="friendly">Friendly</option>
                    <option value="neutral">Neutral</option>
                    <option value="wary">Wary</option>
                    <option value="hostile">Hostile</option>
                  </select>
                </label>
                <label className="field wide">
                  <span>Description</span>
                  <textarea rows={2} value={n.description} onChange={(e) => patch((w) => (w.npcs[i].description = e.target.value))} />
                </label>
              </div>
            </div>
          ))}
        </section>
      )}

      {tab === 'quests' && (
        <section className="studio-tab list-editor">
          <div className="le-head">
            <h3>Quests</h3>
            <button className="btn btn-sm" onClick={() => patch((w) => w.quests.push({ id: uid('q'), title: 'New quest', hook: 'Why it matters.', objective: 'What the player does.', rewardXp: 250, rewardGold: 60 }))}>
              <Plus size={14} /> Add quest
            </button>
          </div>
          {world.quests.map((q, i) => (
            <div key={q.id} className="le-card glass">
              <Remover onClick={() => patch((w) => w.quests.splice(i, 1))} />
              <div className="le-grid">
                <label className="field">
                  <span>Title</span>
                  <input value={q.title} onChange={(e) => patch((w) => (w.quests[i].title = e.target.value))} />
                </label>
                <label className="field">
                  <span>Hook</span>
                  <input value={q.hook} onChange={(e) => patch((w) => (w.quests[i].hook = e.target.value))} />
                </label>
                <label className="field">
                  <span>Objective</span>
                  <input value={q.objective} onChange={(e) => patch((w) => (w.quests[i].objective = e.target.value))} />
                </label>
                <label className="field">
                  <span>XP reward</span>
                  <input type="number" value={q.rewardXp} onChange={(e) => patch((w) => (w.quests[i].rewardXp = Number(e.target.value) || 0))} />
                </label>
                <label className="field">
                  <span>Coin reward</span>
                  <input type="number" value={q.rewardGold} onChange={(e) => patch((w) => (w.quests[i].rewardGold = Number(e.target.value) || 0))} />
                </label>
              </div>
            </div>
          ))}
          <h3 className="mt16">Loot table</h3>
          <button
            className="btn btn-sm"
            onClick={() =>
              patch((w) =>
                w.items.push({ id: uid('it'), name: 'New Item', kind: 'trinket', rarity: 'common', description: '', bonus: {} }),
              )
            }
          >
            <Plus size={14} /> Add item
          </button>
          {world.items.map((it, i) => (
            <div key={it.id} className="le-card glass">
              <Remover onClick={() => patch((w) => w.items.splice(i, 1))} />
              <div className="le-grid">
                <label className="field">
                  <span>Name</span>
                  <input value={it.name} onChange={(e) => patch((w) => (w.items[i].name = e.target.value))} />
                </label>
                <label className="field">
                  <span>Kind</span>
                  <select value={it.kind} onChange={(e) => patch((w) => (w.items[i].kind = e.target.value as ItemTemplate['kind']))}>
                    {['weapon', 'armor', 'relic', 'consumable', 'trinket'].map((k) => (
                      <option key={k}>{k}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Rarity</span>
                  <select value={it.rarity} onChange={(e) => patch((w) => (w.items[i].rarity = e.target.value as ItemTemplate['rarity']))}>
                    {['common', 'uncommon', 'rare', 'legendary'].map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </label>
                <label className="field wide">
                  <span>Description</span>
                  <textarea rows={2} value={it.description} onChange={(e) => patch((w) => (w.items[i].description = e.target.value))} />
                </label>
              </div>
            </div>
          ))}
        </section>
      )}

      {tab === 'opening' && (
        <section className="studio-tab narrow">
          <label className="field">
            <span>Premise (shown on the world page)</span>
            <input value={world.premise} onChange={(e) => patch((w) => (w.premise = e.target.value))} maxLength={90} />
          </label>
          <label className="field">
            <span>Opening narration (first thing players read)</span>
            <textarea rows={5} value={world.opening} onChange={(e) => patch((w) => (w.opening = e.target.value))} maxLength={700} />
          </label>
          <div className="rating-row">
            <label className="field">
              <span>Challenge</span>
              <select value={world.difficulty} onChange={(e) => patch((w) => (w.difficulty = e.target.value as Difficulty))}>
                <option>Story</option>
                <option>Balanced</option>
                <option>Brutal</option>
              </select>
            </label>
            <label className="field">
              <span>Content rating</span>
              <select value={world.contentRating} onChange={(e) => patch((w) => (w.contentRating = e.target.value as ContentRating))}>
                <option>Everyone</option>
                <option>Teen</option>
                <option>Mature</option>
              </select>
            </label>
          </div>
          <div className="publish-note glass">
            {world.contentRating === 'Mature' ? (
              <>
                <strong>Mature rating</strong>
                <p>Mature worlds are flagged and excluded from the Default discovery feed for players who do not opt in.</p>
              </>
            ) : (
              <>
                <strong>Ready to publish</strong>
                <p>Every save this world receives plays with your locations, cast, quests, and loot table.</p>
              </>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
