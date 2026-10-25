import { useEffect, useMemo, useRef, useState } from 'react'
import {
  X,
  Map as MapIcon,
  Sparkles,
  Send,
  Home,
  Dice5,
  Backpack,
  Scroll,
  UserRound,
  Compass,
  Heart,
  Coins,
  Flame,
  ChevronLeft,
  Star,
  BookHeart,
  Swords,
} from 'lucide-react'
import type { QuestState, SaveState, StatKey, World, InventoryItem, StoryBlock } from '../types'
import { useApp, toast } from '../state/store'
import { go } from '../lib/router'
import { Avatar, CoverArt } from '../components/CoverArt'
import { Modal, StatBar, Tabs, RARITY_COLOR } from '../components/ui'
import { ARCHETYPES, STAT_LABELS, statMod } from '../data/archetypes'
import { suggestActions, takeTurn } from '../lib/engine'
import { fmt, titleCase } from '../lib/funcs'

type SideTab = 'character' | 'inventory' | 'quests' | 'journal'

export function PlayPage({ saveId }: { saveId: string }) {
  const { worldById, saveById, updateSave, data } = useApp()
  const save = saveById(saveId)
  const world = save ? worldById(save.worldId) : undefined
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [tab, setTab] = useState<SideTab>('character')
  const [drawer, setDrawer] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)
  const [dm, setDm] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (save) setSuggestions(suggestActions(save, world!))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [save?.turn])

  useEffect(() => {
    const el = logRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [save?.story.length])

  if (!save || !world) {
    return (
      <div className="page center">
        <p>That save could not be found.</p>
        <button className="btn btn-primary" onClick={() => go({ name: 'library' })}>
          Back to library
        </button>
      </div>
    )
  }

  const loc = world.locations.find((l) => l.id === save.locationId) ?? world.locations[0]
  const npcName = (id: string) => world.npcs.find((n) => n.id === id)?.name ?? 'Unknown'

  const act = (text: string) => {
    const t = text.trim()
    if (!t) return
    let result = { leveled: null as string | null, questMsg: null as string | null, lootMsg: null as string | null }
    updateSave(save.id, (s) => {
      result = takeTurn(s, world, t)
    })
    if (result.leveled) toast(result.leveled)
    else if (result.questMsg) toast(result.questMsg)
    else if (result.lootMsg) toast(`Loot · ${result.lootMsg}`)
    setInput('')
    setSuggestions(suggestActions(save, world))
  }

  const useItem = (item: InventoryItem) => {
    updateSave(save.id, (s) => {
      const it = s.inventory.find((i) => i.key === item.key)
      if (!it) return
      if (['weapon', 'armor', 'relic', 'trinket'].includes(it.kind) && it.bonus) {
        s.equipped = s.equipped.includes(it.key) ? s.equipped.filter((k) => k !== it.key) : [...s.equipped, it.key]
      }
      if (it.kind === 'consumable') {
        if (it.bonus?.heal) s.hp = Math.min(s.maxHp, s.hp + it.bonus.heal)
        it.qty -= 1
        if (it.qty <= 0) s.inventory = s.inventory.filter((i) => i.key !== it.key)
      }
    })
    toast(item.kind === 'consumable' ? `Used ${item.name}` : `${item.name} equipped`)
  }

  const travelTo = (destId: string) => {
    const dest = world.locations.find((l) => l.id === destId)
    if (!dest) return
    act(`Travel toward ${dest.name}`)
    setMapOpen(false)
  }

  const xpNeed = save.level * 120
  const arch = ARCHETYPES.find((a) => a.id === save.character.archetype)!

  return (
    <div className="play" style={{ ['--scene-accent' as never]: world.art.palette.accent, ['--scene-glow' as never]: world.art.palette.glow }}>
      <div className="play-art" aria-hidden="true">
        <CoverArt art={world.art} showVignette={false} />
      </div>

      <header className="play-top">
        <button className="btn btn-ghost btn-sm" onClick={() => go({ name: 'world', id: world.id })}>
          <ChevronLeft size={15} /> <span className="hide-sm">{world.title}</span>
          <span className="only-sm">Exit</span>
        </button>
        <div className="play-save-name">
          {save.customTitle ?? `${save.character.name} — ${world.title}`}
          <span className="play-turn">
            Turn {save.turn} · {loc.name}
          </span>
        </div>
        <div className="play-top-actions">
          <span className="play-hp">
            <Heart size={13} /> {save.hp}/{save.maxHp}
          </span>
          <button className="icon-btn" onClick={() => setMapOpen(true)} title="World map">
            <MapIcon size={17} />
          </button>
          <button className="icon-btn drawer-toggle" onClick={() => setDrawer(!drawer)} title="Panels">
            <UserRound size={17} />
          </button>
        </div>
      </header>

      <div className="play-body">
        <div className="play-story">
          <div className="story-log" ref={logRef}>
            {save.story.map((b) => (
              <StoryItem key={b.id} b={b} statLabel={STAT_LABELS} />
            ))}
            {save.story.length === 0 && (
              <div className="story-item narration">The scene is set. What do you do?</div>
            )}
          </div>

          <div className="composer">
            <div className="suggest-row">
              <button className="icon-btn spark" title="New suggestions" onClick={() => setSuggestions(suggestActions(save, world))}>
                <Sparkles size={15} />
              </button>
              {suggestions.map((s) => (
                <button key={s} className="suggest-chip" onClick={() => act(s)}>
                  {s}
                </button>
              ))}
            </div>
            <div className={`composer-bar glass ${dm ? 'dm' : ''}`}>
              <button
                className={`dm-toggle icon-btn ${dm ? 'on' : ''}`}
                title="DM Mode — direct the narrator instead of acting"
                onClick={() => setDm(!dm)}
              >
                <Scroll size={16} />
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    if (dm) dmDirect(input)
                    else act(input)
                  }
                }}
                placeholder={dm ? 'Direct the narrator: “Introduce a storm. The bridge groans…”' : `What does ${save.character.name} do?`}
                rows={1}
                maxLength={840}
              />
              <button
                className="btn btn-primary btn-send"
                onClick={() => (dm ? dmDirect(input) : act(input))}
                disabled={!input.trim()}
                title="Send action"
              >
                <Send size={16} />
              </button>
            </div>
            <div className="composer-foot">
              <span>{dm ? 'DM mode: narrator guidance' : 'Enter to act · Shift+Enter for a new line'}</span>
              <span>{input.length}/840</span>
            </div>
          </div>
        </div>

        <aside className={`play-side ${drawer ? 'open' : ''}`}>
          <div className="side-head">
            <div className="side-user">
              <div className="side-portrait">
                <CoverArt art={save.character.portrait} />
              </div>
              <div>
                <strong>{save.character.name}</strong>
                <span>
                  {arch.name} · {save.character.pronouns}
                </span>
              </div>
            </div>
            <button className="icon-btn" onClick={() => setDrawer(false)}>
              <X size={16} />
            </button>
          </div>

          <div className="side-vitals">
            <div className="vital">
              <span>
                <Heart size={12} /> HP
              </span>
              <StatBar value={save.hp} max={save.maxHp} tone="linear-gradient(90deg,#ff5d5d,#ff9a8b)" />
              <em>
                {save.hp}/{save.maxHp}
              </em>
            </div>
            <div className="vital">
              <span>
                <Star size={12} /> XP
              </span>
              <StatBar value={save.xp} max={xpNeed} tone="linear-gradient(90deg,#f6c66b,#ffddb0)" />
              <em>
                {save.xp}/{xpNeed}
              </em>
            </div>
            <div className="vital-minis">
              <span>
                <Flame size={12} /> Lv {save.level}
              </span>
              <span>
                <Coins size={12} /> {save.gold}
              </span>
              <span>
                <Compass size={12} /> {save.discovered.length}/{world.locations.length} found
              </span>
            </div>
          </div>

          <Tabs
            value={tab}
            onChange={(t) => setTab(t)}
            tabs={[
              { id: 'character', label: 'Sheet' },
              { id: 'inventory', label: 'Items', badge: save.inventory.length },
              { id: 'quests', label: 'Quests', badge: save.quests.filter((q) => q.status === 'active').length },
              { id: 'journal', label: 'Journal', badge: save.journal.length },
            ]}
            className="side-tabs"
          />

          <div className="side-body">
            {tab === 'character' && <CharacterTab save={save} world={world} npcName={npcName} />}
            {tab === 'inventory' && (
              <InventoryTab save={save} onUse={useItem} items={save.inventory} equipped={save.equipped} />
            )}
            {tab === 'quests' && <QuestsTab save={save} npcName={npcName} />}
            {tab === 'journal' && <JournalTab save={save} npcName={npcName} />}
          </div>
        </aside>
      </div>

      {mapOpen && (
        <Modal title={`${world.title} — world map`} onClose={() => setMapOpen(false)} wide>
          <div className="bigmap">
            <svg viewBox="0 0 100 90">
              <rect width="100" height="90" fill={world.art.palette.deep} />
              <rect width="100" height="90" fill={world.art.palette.accent} opacity="0.06" />
              {[10, 25, 40, 55, 70, 85].map((y) => (
                <line key={y} x1="0" y1={y} x2="100" y2={y} stroke={world.art.palette.accent} strokeOpacity="0.08" strokeWidth="0.4" />
              ))}
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
                    strokeOpacity="0.45"
                    strokeWidth="0.5"
                    strokeDasharray="1.8 1.8"
                  />
                )
              })}
              {world.locations.map((l) => {
                const here = l.id === save.locationId
                const known = save.discovered.includes(l.id)
                return (
                  <g key={l.id} className="map-node" onClick={() => !here && travelTo(l.id)}>
                    <circle cx={l.x} cy={l.y} r={here ? 3.8 : 2.6} fill={here ? world.art.palette.glow : known ? world.art.palette.accent : '#555a6e'} />
                    {here && <circle cx={l.x} cy={l.y} r="7" fill="none" stroke={world.art.palette.glow} strokeOpacity="0.5" strokeWidth="0.6" />}
                    <text x={l.x} y={l.y - 5} textAnchor="middle" fontSize="3.6" fill={known ? world.art.palette.glow : '#6a7088'}>
                      {known ? (l.name.length > 20 ? l.name.slice(0, 19) + '…' : l.name) : 'Undiscovered'}
                    </text>
                  </g>
                )
              })}
            </svg>
            <p className="muted center mt8">Click a discovered location to attempt travel. Undiscovered places must be found by wandering.</p>
          </div>
        </Modal>
      )}
    </div>
  )

  const dmDirect = (text: string) => {
    if (!save || !world) return
    const t = text.trim()
    if (!t) return
    updateSave(save.id, (s) => {
      s.turn += 1
      s.story.push({
        id: `b-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        kind: 'player',
        text: `DM: ${t}`,
        at: Date.now(),
      })
      s.story.push({
        id: `b-${Date.now() + 1}-${Math.random().toString(36).slice(2, 7)}`,
        kind: 'system',
        text: 'The narrator has noted your guidance. It will color the next scenes.',
        at: Date.now(),
      })
      s.lastLine = t.slice(0, 140)
    })
    setInput('')
  }
}

function StoryItem({ b, statLabel }: { b: StoryBlock; statLabel: Record<string, string> }) {
  if (b.kind === 'check' && b.roll) {
    const r = b.roll
    return (
      <div className={`story-item check ${r.success ? 'ok' : 'fail'}`}>
        <span className="check-dice">
          <Dice5 size={13} /> d20
        </span>
        <div>
          <strong>{b.text}</strong>
          <em>
            {statLabel[r.stat]} modifier {r.mod >= 0 ? '+' : ''}
            {r.mod} · difficulty {r.dc}
            {r.crit ? ` · critical ${r.crit}!` : ''}
          </em>
        </div>
      </div>
    )
  }
  if (b.kind === 'player') return <div className="story-item player">▸ {b.text}</div>
  if (b.kind === 'dialogue')
    return (
      <div className="story-item dialogue">
        <span className="speaker">{b.speaker ?? 'Someone'}</span>
        <p>{b.text}</p>
      </div>
    )
  if (b.kind === 'system') return <div className="story-item system">{b.text}</div>
  if (b.kind === 'loot') return <div className="story-item loot">{b.text}</div>
  if (b.kind === 'quest') return <div className="story-item questlog">{b.text}</div>
  return <div className="story-item narration">{b.text}</div>
}

function CharacterTab({
  save,
  world,
  npcName,
}: {
  save: SaveState
  world: World
  npcName: (id: string) => string
}) {
  const arch = ARCHETYPES.find((a) => a.id === save.character.archetype)!
  return (
    <div className="panel">
      <p className="panel-note">{arch.description}</p>
      {save.character.bio && <p className="panel-bio">“{save.character.bio}”</p>}
      <div className="trait-chips">
        {save.character.traits.length ? save.character.traits.map((t) => <span key={t} className="pill">{t}</span>) : <span className="muted">No traits</span>}
      </div>
      <h4 className="panel-h">Stats</h4>
      <div className="stat-grid">
        {(Object.keys(STAT_LABELS) as StatKey[]).map((k) => {
          const bonus = save.inventory
            .filter((i) => save.equipped.includes(i.key) && i.bonus)
            .reduce((a, i) => {
              const b = i.bonus!
              let v = 0
              if (b.stat === k) v += b.value ?? 0
              if (b.extra && k in b.extra) v += b.extra[k] ?? 0
              return a + v
            }, 0)
          const v = save.character.stats[k]
          return (
            <div key={k} className="stat-cell">
              <span>{STAT_LABELS[k]}</span>
              <strong>
                {v}
                {bonus ? <em>+{bonus}</em> : null}
              </strong>
              <em className="stat-mod">{statMod(v + bonus) >= 0 ? '+' : ''}{statMod(v + bonus)}</em>
            </div>
          )
        })}
      </div>
      <h4 className="panel-h">Relationships</h4>
      {save.turn === 0 ? <p className="muted">Meet people first.</p> : (
        <div className="rel-list">
          {Object.entries(save.relationships).length === 0 && <p className="muted">No bonds yet.</p>}
          {Object.entries(save.relationships).map(([id, v]) => (
            <div key={id} className="rel">
              <span>{npcName(id)}</span>
              <div className="rel-track">
                <div className="rel-fill" style={{ width: `${Math.abs(v) / 2}%`, background: v >= 0 ? 'linear-gradient(90deg,#5fd68b,#a8dd7a)' : 'linear-gradient(90deg,#ff5d5d,#ff9a8b)' }} />
              </div>
              <em>{fmt(v)}</em>
            </div>
          ))}
        </div>
      )}
      <h4 className="panel-h">Known cast here</h4>
      <div className="rel-list">
        {world.npcs.filter((n) => n.locationId === save.locationId).map((n) => (
          <div key={n.id} className="rel ghost">
            <span>{n.name}</span>
            <em>{n.role}</em>
          </div>
        ))}
      </div>
    </div>
  )
}

function InventoryTab({
  save,
  items,
  equipped,
  onUse,
}: {
  save: SaveState
  items: InventoryItem[]
  equipped: string[]
  onUse: (i: InventoryItem) => void
}) {
  return (
    <div className="panel">
      <div className="inv-list">
        {items.map((i) => {
          const eq = equipped.includes(i.key)
          return (
            <div key={i.key} className="inv-item" style={{ borderColor: `${RARITY_COLOR[i.rarity]}44` }}>
              <div className="inv-dot" style={{ background: RARITY_COLOR[i.rarity] }} />
              <div className="inv-main">
                <strong>
                  {i.name}
                  {i.qty > 1 ? <em> ×{i.qty}</em> : null}
                  {eq && <span className="pill pill-good equipped">Equipped</span>}
                </strong>
                <p>{i.description}</p>
                {i.bonus && (
                  <span className="inv-bonus">
                    {i.bonus.stat ? `${STAT_LABELS[i.bonus.stat]} +${i.bonus.value}` : ''}
                    {i.bonus.extra
                      ? Object.entries(i.bonus.extra)
                          .map(([k, v]) => `${STAT_LABELS[k as StatKey]} +${v}`)
                          .join(' · ')
                      : ''}
                    {i.bonus.heal ? ` restores ${i.bonus.heal} HP` : ''}
                  </span>
                )}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => onUse(i)}>
                {i.kind === 'consumable' ? 'Use' : eq ? 'Unequip' : 'Equip'}
              </button>
            </div>
          )
        })}
        {items.length === 0 && <p className="muted">Your pack is empty. Fortune favors the bold.</p>}
      </div>
    </div>
  )
}

function QuestsTab({ save, npcName }: { save: SaveState; npcName: (id: string) => string }) {
  return (
    <div className="panel">
      <div className="quest-rows">
        {save.quests.map((q) => (
          <QuestRow key={q.id} q={q} />
        ))}
        {save.quests.length === 0 && <p className="muted">No quests yet.</p>}
      </div>
      <h4 className="panel-h">Notable encounters</h4>
      {save.journal.filter((j) => j.kind === 'relationship').length === 0 ? (
        <p className="muted">None logged yet.</p>
      ) : (
        save.journal
          .filter((j) => j.kind === 'relationship')
          .slice(0, 5)
          .map((j) => (
            <div key={j.id} className="jrn">
              <strong>{j.title}</strong>
              <p>{j.text}</p>
            </div>
          ))
      )}
    </div>
  )
}

function QuestRow({ q }: { q: QuestState }) {
  const done = q.status === 'complete'
  return (
    <div className={`quest-row glass ${done ? 'done' : ''}`}>
      <div className="quest-row-top">
        <strong>{q.title}</strong>
        {done ? (
          <span className="pill pill-good">Complete</span>
        ) : (
          <div className="quest-pips">
            {[0, 1, 2].map((i) => (
              <span key={i} className={`pip ${i < q.progress ? 'on' : ''}`} />
            ))}
          </div>
        )}
      </div>
      <p>{q.objective}</p>
      <span className="quest-reward">
        {q.rewardXp} XP{q.rewardGold ? ` · ${q.rewardGold} coins` : ''}
      </span>
    </div>
  )
}

function JournalTab({ save, npcName }: { save: SaveState; npcName: (id: string) => string }) {
  return (
    <div className="panel">
      {(Object.keys(save.story).length ? [] : []).map((_, i) => (
        <span key={i} />
      ))}
      {save.journal.length === 0 && <p className="muted">The journal is blank. This page will fill with what you discover.</p>}
      {save.journal.map((j) => (
        <div key={j.id} className="jrn">
          <div className="jrn-head">
            <strong>{j.title}</strong>
            <span>
              {titleCase(j.kind)} · turn {j.turn}
            </span>
          </div>
          <p>{j.text}</p>
        </div>
      ))}
    </div>
  )
}
