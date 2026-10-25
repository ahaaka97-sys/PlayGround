import { useState } from 'react'
import { Crown, Check, Sparkles, X } from 'lucide-react'
import { useApp, toast } from '../state/store'
import { Pill } from '../components/ui'

const TIERS = [
  {
    id: 'free' as const,
    name: 'Wanderer',
    price: { mo: 0, yr: 0 },
    blurb: 'Everything you need to start wandering.',
    perks: [
      'All launch worlds',
      '3 characters at a time',
      'Daily streaks & badges',
      'Community discovery',
    ],
    missing: ['Image scene sharing', 'Studio Pro tools'],
  },
  {
    id: 'plus' as const,
    name: 'Wayfarer+',
    price: { mo: 9, yr: 90 },
    blurb: 'For daily travelers who want the full engine.',
    perks: [
      'Unlimited characters & saves',
      'Visual scene replay',
      'AI action suggestions every turn',
      'Extended memory (longer story recall)',
      'Creator badge & analytics',
      'Support the platform directly',
    ],
    missing: [],
  },
  {
    id: 'studio' as const,
    name: 'Studio Pro',
    price: { mo: 19, yr: 190 },
    blurb: 'For worldsmiths building whole universes.',
    perks: [
      'Everything in Wayfarer+',
      'Advanced Studio editor & mass tools',
      'World analytics dashboard',
      'Early access to World Engine updates',
      'Priority rendering & support',
    ],
    missing: [],
  },
]

export function PricingPage() {
  const { data, upgradePlan } = useApp()
  const [yearly, setYearly] = useState(false)

  return (
    <div className="page page-pricing">
      <header className="page-head center">
        <Pill tone="accent">
          <Crown size={12} /> Membership
        </Pill>
        <h1>Adventures are free. Freedom is optional.</h1>
        <p>Everything core plays without paying. Paid tiers fund the engine and unlock heavier tools.</p>
        <div className="billing-toggle">
          <button className={!yearly ? 'on' : ''} onClick={() => setYearly(false)}>
            Monthly
          </button>
          <button className={yearly ? 'on' : ''} onClick={() => setYearly(true)}>
            Yearly <em>2 months free</em>
          </button>
        </div>
      </header>

      <div className="tiers">
        {TIERS.map((t) => {
          const current = data.user.plan === t.id
          const highlight = t.id === 'plus'
          return (
            <article key={t.id} className={`tier glass ${highlight ? 'featured' : ''}`}>
              {highlight && <span className="tier-flag">Most popular</span>}
              <h3>{t.name}</h3>
              <div className="tier-price">
                {t.price.mo === 0 ? (
                  <strong>Free</strong>
                ) : (
                  <>
                    <strong>${yearly ? t.price.yr : t.price.mo}</strong>
                    <span>/{yearly ? 'year' : 'month'}</span>
                  </>
                )}
              </div>
              <p>{t.blurb}</p>
              <ul>
                {t.perks.map((p) => (
                  <li key={p}>
                    <Check size={15} /> {p}
                  </li>
                ))}
                {t.missing.map((m) => (
                  <li key={m} className="no">
                    <X size={15} /> {m}
                  </li>
                ))}
              </ul>
              <button
                className={`btn ${current ? 'btn-ghost' : highlight ? 'btn-primary' : 'btn-ghost'}`}
                disabled={current}
                onClick={() => {
                  upgradePlan(t.id)
                  toast(`${t.name} enabled — local preview`)
                }}
              >
                {current ? 'Current plan' : t.price.mo === 0 ? 'Stay free' : 'Choose plan'}
              </button>
              <em className="muted">This is a demo — no payments are processed.</em>
            </article>
          )
        })}
      </div>

      <section className="faq glass">
        <h3>Questions</h3>
        <details open>
          <summary>What is Odyssey?</summary>
          <p>
            An AI roleplaying platform: explore persistent worlds alone or with friends. A World Engine tracks characters,
            inventory, relationships, and consequences while the narrator describes what happens next.
          </p>
        </details>
        <details>
          <summary>Do I need a paid plan to build worlds?</summary>
          <p>No — Creator Studio is free, including publishing. Paid tiers add analytics, mass-editing, and early access.</p>
        </details>
        <details>
          <summary>Where is my data stored?</summary>
          <p>This demo is fully local: profiles, saves, and published worlds live in your browser\u2019s storage and never leave it.</p>
        </details>
        <details>
          <summary>How does the engine work?</summary>
          <p>Actions are interpreted, resolved with d20 checks against your stats, and narrated. Quests, HP, XP, relationships, and loot all update as you play.</p>
        </details>
      </section>
    </div>
  )
}
