import type { ReactNode } from 'react'
import { Play, Star, Users, Globe2 } from 'lucide-react'
import type { World } from '../types'
import { CoverArt } from './CoverArt'
import { go } from '../lib/router'
import { fmt } from '../lib/funcs'
import { creatorById } from '../data/seed'

export function WorldCard({ world, size = 'md' }: { world: World; size?: 'sm' | 'md' | 'lg' }) {
  const creator = creatorById(world.creatorId)
  return (
    <article
      className={`world-card wc-${size}`}
      onClick={() => go({ name: 'world', id: world.id })}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && go({ name: 'world', id: world.id })}
    >
      <div className="wc-art">
        <CoverArt art={world.art} />
        <div className="wc-art-overlay">
          <button
            className="btn btn-play"
            onClick={(e) => {
              e.stopPropagation()
              go({ name: 'create', worldId: world.id })
            }}
          >
            <Play size={16} /> Play
          </button>
        </div>
        {world.official && <span className="wc-badge">Original</span>}
        <span className="wc-genre">{world.genre}</span>
      </div>
      <div className="wc-meta">
        <h3 className="wc-title">{world.title}</h3>
        <p className="wc-tagline">{world.tagline}</p>
        <div className="wc-stats">
          <span className="wc-stat">
            <Star size={13} /> {world.rating > 0 ? world.rating.toFixed(1) : 'New'}
            <em>{world.ratingCount ? fmt(world.ratingCount) : ''}</em>
          </span>
          <span className="wc-stat">
            <Users size={13} /> {fmt(world.plays)}
          </span>
          <span className={`wc-diff dd-${world.difficulty.toLowerCase()}`}>{world.difficulty}</span>
        </div>
        <div className="wc-creator">
          {creator ? (
            <>
              <span className="wc-creator-dot" style={{ background: world.art.palette.accent }} />
              <span>{world.creatorName}</span>
            </>
          ) : (
            <span className="you">@{world.creatorHandle}</span>
          )}
        </div>
      </div>
    </article>
  )
}

export function WorldRow({ worlds }: { worlds: World[] }) {
  return (
    <div className="world-row">
      {worlds.map((w) => (
        <WorldCard key={w.id} world={w} />
      ))}
    </div>
  )
}

export function HeroCard({
  world,
  children,
}: {
  world: World
  children?: ReactNode
}) {
  return (
    <section className="hero glass">
      <div className="hero-art">
        <CoverArt art={world.art} />
        <div className="hero-scrim" />
      </div>
      <div className="hero-body">
        <div className="hero-eyebrow">
          <Globe2 size={14} /> Featured world · {world.genre}
        </div>
        <h1 className="hero-title">{world.title}</h1>
        <p className="hero-tagline">{world.tagline}</p>
        <p className="hero-desc">{world.description}</p>
        {children}
      </div>
    </section>
  )
}
