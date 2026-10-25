import { useMemo } from 'react'
import { Play, Sparkles, Flame, BookOpen, Compass, ChevronRight, Wand2, Users2, Star } from 'lucide-react'
import { useApp } from '../state/store'
import { go } from '../lib/router'
import { HeroCard, WorldCard, WorldRow } from '../components/world-card'
import { Section, EmptyState, Pill } from '../components/ui'
import { CoverArt, Avatar } from '../components/CoverArt'
import { CREATOR_STATS, creatorById } from '../data/seed'
import { GENRES, GENRE_BLURBS } from '../data/worlds'
import { fmt, ago } from '../lib/funcs'

function ContinueRow() {
  const { data } = useApp()
  const saves = data.saves.filter((s) => s.status === 'active').slice(0, 6)
  if (!saves.length) return null
  return (
    <Section
      title="Continue your journey"
      action={
        <a className="link-btn" href="#/library">
          All saves <ChevronRight size={14} />
        </a>
      }
    >
      <div className="saves-row">
        {saves.map((s) => {
          const w = data.worlds.find((x) => x.id === s.worldId)
          if (!w) return null
          const loc = w.locations.find((l) => l.id === s.locationId) ?? w.locations[0]
          return (
            <article key={s.id} className="save-card" onClick={() => go({ name: 'play', saveId: s.id })} role="link" tabIndex={0}>
              <div className="save-art">
                <CoverArt art={w.art} />
                <div className="save-level">Lv {s.level}</div>
              </div>
              <div className="save-body">
                <h3>{s.customTitle ?? `${s.character.name} — ${w.title}`}</h3>
                <p>{loc.name} · Turn {s.turn}</p>
                <div className="save-hp">
                  <div className="hp-track">
                    <div className="hp-fill" style={{ width: `${Math.round((s.hp / s.maxHp) * 100)}%` }} />
                  </div>
                  <span>{s.hp}/{s.maxHp}</span>
                </div>
                <span className="save-resume">
                  <Play size={13} /> Resume
                </span>
              </div>
            </article>
          )
        })}
      </div>
    </Section>
  )
}

function Pulse() {
  const { data } = useApp()
  const events = useMemo(() => {
    const names = ['Rael', 'Moth', 'Corin', 'Sable', 'Ilse', 'Perrin', 'Ada', 'Juno', 'Kestrel', 'Juniper', 'Ash', 'Meridian']
    const verbs = ['started', 'finished a scene in', 'left a ★★★★★ rating on', 'remixed', 'reached turn 40 in', 'shared a scene from']
    const choices = data.worlds.slice(0, 8)
    return Array.from({ length: 6 }, (_, i) => {
      const w = choices[(i * 3) % choices.length]
      return {
        id: i,
        who: names[(i * 5 + 2) % names.length],
        verb: verbs[(i * 2 + 1) % verbs.length],
        world: w.title,
        worldId: w.id,
        mins: (i + 1) * 7 + (i % 3) * 4,
      }
    })
  }, [data.worlds])
  return (
    <Section title="Community pulse">
      <div className="pulse">
        {events.map((e) => (
          <div key={e.id} className="pulse-item">
            <Avatar art={data.worlds[0].art} name={e.who} size={26} />
            <p>
              <strong>{e.who}</strong> {e.verb}{' '}
              <a href={`#/world/${e.worldId}`}>{e.world}</a>
            </p>
            <span className="pulse-time">{e.mins}m</span>
          </div>
        ))}
      </div>
    </Section>
  )
}

function CreatorSpotlight() {
  const { data, toggleFollow } = useApp()
  return (
    <Section
      title="Top creators"
      action={
        <a className="link-btn" href="#/studio">
          Create yours <ChevronRight size={14} />
        </a>
      }
    >
      <div className="creators-row">
        {CREATOR_STATS.map((c) => {
          const following = data.following.includes(c.handle)
          const w = data.worlds.find((x) => x.creatorId === c.id)
          return (
            <article key={c.id} className="creator-card glass">
              <div className="creator-banner">
                {w && <CoverArt art={w.art} />}
              </div>
              <div className="creator-body">
                <Avatar art={w?.art ?? data.user.avatar} name={c.name} size={44} className="creator-avatar" />
                <h3>{c.name}</h3>
                <span className="creator-handle">@{c.handle}</span>
                <p className="creator-blurb">{c.blurb}</p>
                <div className="creator-stats">
                  <span>{fmt(c.followers)} followers</span>
                  <span>{c.worldsLabel}</span>
                </div>
                <button
                  className={`btn btn-sm ${following ? 'btn-ghost' : 'btn-primary'} follow-btn`}
                  onClick={() => toggleFollow(c.handle)}
                >
                  {following ? 'Following' : 'Follow'}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </Section>
  )
}

export function HomePage() {
  const { data } = useApp()
  const featured = data.worlds.find((w) => w.id === 'cartographers-dream') ?? data.worlds[0]
  const trending = [...data.worlds].sort((a, b) => b.plays - a.plays).slice(0, 6)
  const newHere = [...data.worlds].sort((a, b) => b.createdAt - a.createdAt).filter((w) => !w.official).slice(0, 6)
  const topRated = [...data.worlds].filter((w) => w.rating >= 4.7).slice(0, 6)

  return (
    <div className="page page-home">
      <HeroCard world={featured}>
        <div className="hero-cta">
          <button className="btn btn-primary btn-lg" onClick={() => go({ name: 'create', worldId: featured.id })}>
            <Play size={18} /> Play now
          </button>
          <a className="btn btn-ghost btn-lg" href={`#/world/${featured.id}`}>
            View world <ChevronRight size={16} />
          </a>
        </div>
        <div className="hero-meta">
          <span>
            <Star size={13} /> {featured.rating.toFixed(1)} ({fmt(featured.ratingCount)})
          </span>
          <span>
            <Users2 size={13} /> {fmt(featured.plays)} plays
          </span>
          <span>
            <Flame size={13} /> Streaks reset at midnight
          </span>
        </div>
      </HeroCard>

      <div className="home-strip glass">
        <div className="strip-item">
          <Wand2 size={18} />
          <div>
            <strong>Worlds that remember</strong>
            <span>Your choices persist between sessions.</span>
          </div>
        </div>
        <div className="strip-item">
          <Sparkles size={18} />
          <div>
            <strong>Action suggestions</strong>
            <span>Stuck? The narrator offers three ideas.</span>
          </div>
        </div>
        <div className="strip-item">
          <BookOpen size={18} />
          <div>
            <strong>Build your own world</strong>
            <span>Studio turns a sentence into a playable place.</span>
          </div>
        </div>
      </div>

      <ContinueRow />

      <Section
        title="Trending this week"
        action={
          <a className="link-btn" href="#/discover">
            Browse all <ChevronRight size={14} />
          </a>
        }
      >
        <WorldRow worlds={trending} />
      </Section>

      <Section title="Find your genre">
        <div className="genre-grid">
          {GENRES.map((g) => (
            <a key={g} className="genre-card glass" href={`#/discover/${encodeURIComponent(g)}`}>
              <strong>{g}</strong>
              <span>{GENRE_BLURBS[g]}</span>
            </a>
          ))}
        </div>
      </Section>

      <Section title="Top rated">
        <WorldRow worlds={topRated} />
      </Section>

      <CreatorSpotlight />

      <Section title="Fresh from the community">
        {newHere.length ? <WorldRow worlds={newHere} /> : <EmptyState icon={<Compass size={28} />} title="No community worlds yet" hint="Publish a world from the Studio and it will appear here." />}
      </Section>

      <Pulse />

      <section className="cta-band glass">
        <div>
          <h2>Have a world in your head?</h2>
          <p>Describe it to Studio in plain language. Locations, cast, quests, loot — built in a minute, playable always.</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => go({ name: 'studio' })}>
          <Sparkles size={16} /> Open Studio
        </button>
      </section>
    </div>
  )
}
