import { useMemo, useState } from 'react'
import { Flame, Trophy, Globe2, User2, Wand2, BookHeart, Coins, ChevronRight } from 'lucide-react'
import { useApp, toast } from '../state/store'
import { go } from '../lib/router'
import { Avatar, CoverArt } from '../components/CoverArt'
import { EmptyState, Pill, Tabs } from '../components/ui'
import { SignInForm } from '../components/topnav'
import { fmt, ago } from '../lib/funcs'

export function ProfilePage() {
  const { data, signIn, upgradePlan } = useApp()
  const [tab, setTab] = useState<'worlds' | 'saves'>('worlds')
  const user = data.user
  const myWorlds = data.worlds.filter((w) => w.creatorId === 'you')
  const turns = data.saves.reduce((a, s) => a + s.turn, 0)
  const badges = useMemo(
    () => [
      { id: 'first', label: 'First Steps', hint: 'Begin an adventure', on: data.saves.length > 0 },
      {
        id: 'quests',
        label: 'Quest Keeper',
        hint: 'Complete a quest',
        on: data.saves.some((s) => s.quests.some((q) => q.status === 'complete')),
      },
      { id: 'creator', label: 'Worldsmith', hint: 'Publish a world', on: myWorlds.some((w) => w.published) },
      { id: 'explorer', label: 'Cartographer', hint: 'Visit 5 locations', on: data.saves.some((s) => s.discovered.length >= 5) },
      { id: 'streak3', label: 'Ember Keeper', hint: 'Reach a 3-day streak', on: user.streak >= 3 },
      { id: 'lvl5', label: 'Seasoned', hint: 'Reach level 5', on: data.saves.some((s) => s.level >= 5) },
    ],
    [data, user.streak, myWorlds],
  )

  return (
    <div className="page page-profile">
      <div className="profile-hero glass">
        <div className="profile-banner">
          <CoverArt
            art={{ motif: 'dream', palette: { sky: '#221438', deep: '#090412', accent: '#b388ff', glow: '#ffd6a5' }, seed: 55 }}
          />
        </div>
        <div className="profile-head">
          <Avatar art={user.avatar} name={user.signedIn ? user.name : 'Guest'} size={72} className="profile-avatar" />
          <div>
            <h1>{user.signedIn ? user.name : 'Guest'}</h1>
            <p className="muted">
              {user.signedIn ? `@${user.handle} · ` : 'Playing locally · '}
              {user.plan === 'free' ? 'Free plan' : user.plan === 'plus' ? 'Odyssey+ member' : 'Studio Pro member'}
            </p>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              upgradePlan(user.plan === 'free' ? 'plus' : 'free')
              toast(user.plan === 'free' ? 'Odyssey+ preview enabled' : 'Back to free plan')
            }}
          >
            <Wand2 size={14} /> {user.plan === 'free' ? 'Preview Odyssey+' : 'End preview'}
          </button>
        </div>
        <div className="profile-stats">
          <div className="pstat">
            <BookHeart size={16} />
            <strong>{data.saves.length}</strong>
            <span>saves</span>
          </div>
          <div className="pstat">
            <Flame size={16} />
            <strong>{user.streak}</strong>
            <span>day streak</span>
          </div>
          <div className="pstat">
            <Globe2 size={16} />
            <strong>{myWorlds.length}</strong>
            <span>worlds built</span>
          </div>
          <div className="pstat">
            <Coins size={16} />
            <strong>{fmt(turns)}</strong>
            <span>turns taken</span>
          </div>
        </div>
      </div>

      {!user.signedIn && (
        <section className="signin-callout glass">
          <div>
            <h2>Create your traveler profile</h2>
            <p>Saved locally, no accounts or servers — pick a name and it sticks.</p>
          </div>
          <div className="signin-inline">
            <SignInForm
              onDone={(name, handle) => {
                signIn(name, handle)
                toast('Profile created')
              }}
            />
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <h2>Badges</h2>
          <span className="section-action">
            {badges.filter((b) => b.on).length}/{badges.length} earned
          </span>
        </div>
        <div className="badge-grid">
          {badges.map((b) => (
            <div key={b.id} className={`badge glass ${b.on ? 'earned' : ''}`}>
              <Trophy size={20} />
              <strong>{b.label}</strong>
              <span>{b.on ? 'Earned' : b.hint}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Your content</h2>
        </div>
        <Tabs
          value={tab}
          onChange={(t) => setTab(t)}
          tabs={[
            { id: 'worlds', label: 'Worlds', badge: myWorlds.length },
            { id: 'saves', label: 'Saves', badge: data.saves.length },
          ]}
        />
        {tab === 'worlds' ? (
          myWorlds.length ? (
            <div className="studio-cards">
              {myWorlds.map((w) => (
                <article key={w.id} className="studio-card glass" onClick={() => go({ name: 'studioEdit', id: w.id })}>
                  <div className="sc-art">
                    <CoverArt art={w.art} />
                    <Pill tone={w.published ? 'good' : 'default'} className="sc-status">
                      {w.published ? 'Published' : 'Draft'}
                    </Pill>
                  </div>
                  <div className="sc-body">
                    <h3>{w.title}</h3>
                    <p>{w.tagline}</p>
                    <button className="link-btn">
                      Edit in Studio <ChevronRight size={13} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Globe2 size={26} />}
              title="No worlds yet"
              hint="Turn an idea into a playable world in Creator Studio."
              cta={
                <button className="btn btn-primary" onClick={() => go({ name: 'studio' })}>
                  Open Studio
                </button>
              }
            />
          )
        ) : data.saves.length ? (
          <div className="saves-list">
            {data.saves.slice(0, 8).map((s) => {
              const w = data.worlds.find((x) => x.id === s.worldId)
              if (!w) return null
              return (
                <div key={s.id} className="save-row glass" onClick={() => go({ name: 'play', saveId: s.id })}>
                  <div className="save-row-main">
                    <strong>{s.customTitle ?? s.character.name}</strong>
                    <span>
                      {w.title} · Turn {s.turn} · {ago(s.updatedAt)}
                    </span>
                  </div>
                  <ChevronRight size={16} />
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState icon={<User2 size={26} />} title="No characters yet" hint="Every journey starts with one step into a world." />
        )}
      </section>
    </div>
  )
}
