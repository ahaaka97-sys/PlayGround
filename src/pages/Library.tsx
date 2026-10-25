import { useState } from 'react'
import { Trash2, Copy, Pencil, Play, Library as LibIcon } from 'lucide-react'
import type { SaveState } from '../types'
import { useApp, toast } from '../state/store'
import { go } from '../lib/router'
import { CoverArt } from '../components/CoverArt'
import { EmptyState, Modal, Tabs } from '../components/ui'
import { fmt, ago } from '../lib/funcs'
import type { World } from '../types'

export function LibraryPage() {
  const { data, deleteSave, duplicateSave, renameSave } = useApp()
  const [tab, setTab] = useState<'active' | 'rename'>('active')
  const [renaming, setRenaming] = useState<SaveState | null>(null)
  const [draft, setDraft] = useState('')
  const saves = data.saves
  const active = saves.filter((s) => s.status === 'active')

  const worldOf = (s: SaveState): World | undefined => data.worlds.find((w) => w.id === s.worldId)

  return (
    <div className="page page-library">
      <header className="page-head">
        <h1>Your saves</h1>
        <p>Characters, worlds, and the stories you left unfinished.</p>
      </header>

      {saves.length === 0 ? (
        <EmptyState
          icon={<LibIcon size={30} />}
          title="No characters yet"
          hint="Pick a world and create a character — it takes about a minute."
          cta={
            <button className="btn btn-primary" onClick={() => go({ name: 'discover' })}>
              Find a world
            </button>
          }
        />
      ) : (
        <>
          <Tabs
            value={tab}
            onChange={(t) => setTab(t)}
            tabs={[
              { id: 'active', label: 'Active saves', badge: active.length },
              { id: 'rename', label: 'All saves', badge: saves.length },
            ]}
          />
          <div className="saves-grid">
            {(tab === 'active' ? active : saves).map((s) => {
              const w = worldOf(s)
              if (!w) return null
              const loc = w.locations.find((l) => l.id === s.locationId) ?? w.locations[0]
              return (
                <article key={s.id} className="library-card glass">
                  <div className="lc-art" onClick={() => go({ name: 'play', saveId: s.id })}>
                    <CoverArt art={w.art} />
                    <span className="wc-genre">{w.genre}</span>
                    <div className="lc-resume">
                      <Play size={14} /> Resume
                    </div>
                  </div>
                  <div className="lc-body">
                    <h3>{s.customTitle ?? `${s.character.name} — ${w.title}`}</h3>
                    <p>
                      {loc.name} · Turn {s.turn} · Level {s.level}
                    </p>
                    <div className="lc-vitals">
                      <div className="hp-track thin">
                        <div className="hp-fill" style={{ width: `${Math.round((s.hp / s.maxHp) * 100)}%` }} />
                      </div>
                      <span>
                        {s.hp}/{s.maxHp} HP · {ago(s.updatedAt)}
                      </span>
                    </div>
                    <div className="lc-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => { setRenaming(s); setDraft(s.customTitle ?? `${s.character.name} — ${w.title}`) }}>
                        <Pencil size={14} /> Rename
                      </button>
                      <button className="icon-btn" title="Duplicate" onClick={() => { duplicateSave(s.id); toast('Save duplicated') }}>
                        <Copy size={15} />
                      </button>
                      <button className="icon-btn danger" title="Delete" onClick={() => { deleteSave(s.id); toast('Save deleted') }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </>
      )}

      {tab === 'rename' && saves.length > 0 && (
        <p className="muted center mt16">{fmt(saves.length)} save{active.length === 1 ? '' : 's'} total. Renaming keeps the story intact.</p>
      )}

      {renaming && (
        <Modal title="Rename save" onClose={() => setRenaming(null)}>
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault()
              renameSave(renaming.id, draft)
              setRenaming(null)
              toast('Save renamed')
            }}
          >
            <label className="field">
              <span>Save title</span>
              <input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={64} autoFocus />
            </label>
            <button className="btn btn-primary" type="submit">
              Save name
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
