import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Swords, BookOpen, MessagesSquare, Sparkles, Eye, Dices, Check } from 'lucide-react'
import type { Character, StatKey, World, ArchetypeId } from '../types'
import { ARCHETYPES, STAT_LABELS, STAT_BLURB, TRAITS, baseStats, statMod } from '../data/archetypes'
import { useApp, toast } from '../state/store'
import { go } from '../lib/router'
import { CoverArt } from '../components/CoverArt'
import { Spinner } from '../components/ui'
import { fmt } from '../lib/funcs'
import { openingStory } from '../lib/engine'

const ARCH_ICON: Record<ArchetypeId, JSX.Element> = {
  blade: <Swords size={20} />,
  scholar: <BookOpen size={20} />,
  envoy: <MessagesSquare size={20} />,
  mystic: <Sparkles size={20} />,
  shadow: <Eye size={20} />,
}

const HUES = [
  { name: 'Ember', palette: { sky: '#2b1626', deep: '#160b18', accent: '#f2a65a', glow: '#ff5d5d' } },
  { name: 'Verdant', palette: { sky: '#152b1e', deep: '#0a140d', accent: '#a8dd7a', glow: '#f4e29b' } },
  { name: 'Tide', palette: { sky: '#0d2a3f', deep: '#051720', accent: '#67d8c6', glow: '#b9f5e4' } },
  { name: 'Violet', palette: { sky: '#221438', deep: '#110a1e', accent: '#b388ff', glow: '#ffd6a5' } },
  { name: 'Gold', palette: { sky: '#2b1220', deep: '#150a0c', accent: '#e3b448', glow: '#d1495b' } },
  { name: 'Frost', palette: { sky: '#0e1b26', deep: '#071019', accent: '#8ecae6', glow: '#e8f1f2' } },
]

const PRONOUNS = ['she/her', 'he/him', 'they/them', 'she/they', 'he/they', 'Custom…']

export function CreatePage({ worldId }: { worldId: string }) {
  const { worldById, createSave, bumpStreak } = useApp()
  const world = worldById(worldId)
  const [step, setStep] = useState(0)
  const [arch, setArch] = useState<ArchetypeId>('blade')
  const [name, setName] = useState('')
  const [pronoun, setPronoun] = useState('they/them')
  const [customPronoun, setCustomPronoun] = useState('')
  const [traits, setTraits] = useState<string[]>([])
  const [hue, setHue] = useState(0)
  const [attrs, setAttrs] = useState<Partial<Record<StatKey, number>>>({})
  const [bio, setBio] = useState('')
  const [creating, setCreating] = useState(false)

  const archetype = useMemo(() => ARCHETYPES.find((a) => a.id === arch)!, [arch])
  const base = useMemo(() => baseStats(archetype), [archetype])
  const spent = Object.values(attrs).reduce((a, b) => a + (b ?? 0), 0)
  const pointsLeft = 3 - spent

  if (!world) return <div className="page">World not found.</div>

  const finalStats = (): Record<StatKey, number> => {
    const s = { ...base }
    for (const [k, v] of Object.entries(attrs)) {
      s[k as StatKey] += v ?? 0
    }
    return s
  }

  const begin = () => {
    if (!name.trim()) {
      toast('Give your character a name first')
      return
    }
    setCreating(true)
    setTimeout(() => {
      const character: Character = {
        name: name.trim(),
        pronouns: pronoun === 'Custom…' ? customPronoun || 'they/them' : pronoun,
        archetype: arch,
        portrait: { motif: 'dream', palette: HUES[hue].palette, seed: Math.floor(Math.random() * 900) + 11 },
        stats: finalStats(),
        traits: [...traits],
        bio: bio.trim(),
      }
      const save = createSave(world.id, character, openingStory)
      bumpStreak()
      go({ name: 'play', saveId: save.id })
    }, 700)
  }

  const toggleTrait = (t: string) => {
    setTraits((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : prev.length >= 2 ? prev : [...prev, t]))
  }

  const allocate = (k: StatKey) => {
    if (pointsLeft <= 0 || attrs[k]) return
    setAttrs((p) => ({ ...p, [k]: 1 }))
  }

  const steps = ['Archetype', 'Identity', 'Stats', 'Ready']

  return (
    <div className="page page-create">
      <header className="create-head">
        <button className="btn btn-ghost btn-sm" onClick={() => go({ name: 'world', id: world.id })}>
          <ChevronLeft size={15} /> {world.title}
        </button>
        <div className="stepper">
          {steps.map((s, i) => (
            <div key={s} className={`step ${i === step ? 'on' : i < step ? 'done' : ''}`}>
              <span className="step-dot">{i < step ? <Check size={12} /> : i + 1}</span>
              <span className="step-label">{s}</span>
            </div>
          ))}
        </div>
      </header>

      {step === 0 && (
        <section className="create-step">
          <h1>Choose your archetype</h1>
          <p className="muted">This shapes your starting stats, gear, and the flavor of your trait pool.</p>
          <div className="arch-grid">
            {ARCHETYPES.map((a) => (
              <button
                key={a.id}
                className={`arch-card glass ${arch === a.id ? 'selected' : ''}`}
                onClick={() => setArch(a.id)}
              >
                <span className="arch-icon">{ARCH_ICON[a.id]}</span>
                <strong>{a.name}</strong>
                <em>{a.tagline}</em>
                <p>{a.description}</p>
                <div className="arch-stats">
                  <span>
                    {STAT_LABELS[a.primary]} +3 · {STAT_LABELS[a.secondary]} +1
                  </span>
                  <span>{a.hpBonus} bonus HP</span>
                </div>
              </button>
            ))}
          </div>
          <div className="step-foot">
            <div />
            <button className="btn btn-primary" onClick={() => setStep(1)}>
              Continue <ChevronRight size={15} />
            </button>
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="create-step narrow">
          <h1>Who steps into the story?</h1>
          <div className="identity-grid">
            <div>
              <label className="field">
                <span>Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rael, Moth, Juniper Vale"
                  maxLength={28}
                  autoFocus
                />
              </label>
              <label className="field">
                <span>Pronouns</span>
                <div className="chip-row">
                  {PRONOUNS.map((p) => (
                    <button key={p} type="button" className={`chip ${pronoun === p ? 'on' : ''}`} onClick={() => setPronoun(p)}>
                      {p}
                    </button>
                  ))}
                </div>
                {pronoun === 'Custom…' && (
                  <input
                    value={customPronoun}
                    onChange={(e) => setCustomPronoun(e.target.value)}
                    placeholder="they/he, xe/xem…"
                    maxLength={16}
                    className="mt8"
                  />
                )}
              </label>
              <label className="field">
                <span>A sentence about them (optional)</span>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={200}
                  rows={2}
                  placeholder="Why are they here? What do they want?"
                />
              </label>
            </div>
            <div>
              <span className="field-label">Portrait hue</span>
              <div className="hue-row">
                {HUES.map((h, i) => (
                  <button key={h.name} className={`hue ${hue === i ? 'on' : ''}`} onClick={() => setHue(i)} title={h.name}>
                    <span style={{ background: `linear-gradient(135deg, ${h.palette.accent}, ${h.palette.deep})` }} />
                  </button>
                ))}
              </div>
              <div className="portrait-preview">
                <div className="portrait-frame">
                  <CoverArt art={{ motif: 'dream', palette: HUES[hue].palette, seed: 23 }} />
                  <span className="portrait-name">{name || 'Unnamed'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="field">
            <span className="field-label">Pick two traits — they flavor the narration and open unique moments.</span>
            <div className="trait-grid">
              {archetype.traitPool.map((t) => {
                const info = TRAITS[t]
                const on = traits.includes(t)
                return (
                  <button key={t} type="button" className={`trait ${on ? 'on' : ''}`} onClick={() => toggleTrait(t)} disabled={!on && traits.length >= 2}>
                    <strong>{t}</strong>
                    <em>{info.description}</em>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="step-foot">
            <button className="btn btn-ghost" onClick={() => setStep(0)}>
              <ChevronLeft size={15} /> Back
            </button>
            <button className="btn btn-primary" onClick={() => setStep(2)}>
              Continue <ChevronRight size={15} />
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="create-step narrow">
          <h1>Shape your abilities</h1>
          <p className="muted">
            {STAT_LABELS[archetype.primary]} already leads. Spend {3 - spent === 0 ? 'your' : `${pointsLeft} bonus`} point{pointsLeft === 1 ? '' : 's'} where you like — a d20 plus your modifier decides the dice.
          </p>
          <div className="stats-editor">
            {(Object.keys(base) as StatKey[]).map((k) => {
              const v = base[k] + (attrs[k] ?? 0)
              const mod = statMod(v)
              return (
                <div key={k} className="stat-line glass">
                  <div>
                    <strong>{STAT_LABELS[k]}</strong>
                    <span>{STAT_BLURB[k]}</span>
                  </div>
                  <div className="stat-val">
                    <em className={attrs[k] ? 'raised' : ''}>{v}</em>
                    <span className={`stat-mod ${mod >= 0 ? 'pos' : 'neg'}`}>
                      {mod >= 0 ? '+' : ''}
                      {mod}
                    </span>
                    <button className="add-btn" disabled={pointsLeft <= 0 || !!attrs[k]} onClick={() => allocate(k)}>
                      +1
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="step-foot">
            <button className="btn btn-ghost" onClick={() => setStep(1)}>
              <ChevronLeft size={15} /> Back
            </button>
            <button className="btn btn-primary" disabled={spent !== 3 ? true : false} onClick={() => setStep(3)}>
              {spent === 3 ? 'Continue' : `Allocate ${pointsLeft} more`} <ChevronRight size={15} />
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="create-step narrow">
          <h1>Ready.</h1>
          <div className="review glass">
            <div className="review-portrait">
              <CoverArt art={{ motif: 'dream', palette: HUES[hue].palette, seed: 23 }} />
              <strong>{name || 'Unnamed'}</strong>
              <span>{pronoun === 'Custom…' ? customPronoun || 'they/them' : pronoun}</span>
            </div>
            <div className="review-body">
              <div className="review-line">
                <span>Archetype</span>
                <strong>{archetype.name}</strong>
              </div>
              <div className="review-line">
                <span>Traits</span>
                <strong>{traits.length ? traits.join(' · ') : 'No traits chosen'}</strong>
              </div>
              <div className="review-line">
                <span>Stats</span>
                <strong>{(Object.keys(STAT_LABELS) as StatKey[]).map((k) => `${STAT_LABELS[k]} ${base[k] + (attrs[k] ?? 0)}`).join(' · ')}</strong>
              </div>
              <div className="review-line">
                <span>Starting gear</span>
                <strong>{archetype.startingItem.name}</strong>
              </div>
              <div className="review-line">
                <span>World</span>
                <strong>
                  {world.title} · {world.difficulty}
                </strong>
              </div>
              {bio && <p className="review-bio">“{bio}”</p>}
            </div>
          </div>
          <p className="muted center">
            {world.plays ? `${fmt(world.plays)} players have started here. ` : ''}The first scene is about to unfold.
          </p>
          <div className="step-foot">
            <button className="btn btn-ghost" onClick={() => setStep(2)}>
              <ChevronLeft size={15} /> Back
            </button>
            <button className="btn btn-primary btn-lg" onClick={begin}>
              <Dices size={16} /> Begin the story
            </button>
          </div>
        </section>
      )}

      {creating && <Spinner label="Entering the world…" />}
    </div>
  )
}
